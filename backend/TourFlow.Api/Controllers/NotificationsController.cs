using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using TourFlow.Api.DTOs;
using TourFlow.Api.Services;
using TourFlow.Domain.Entities;
using TourFlow.Infrastructure.Data;

namespace TourFlow.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class NotificationsController : ControllerBase
{
    private readonly TourFlowDbContext _context;
    private readonly IRealtimeNotifier _notifier;

    public NotificationsController(TourFlowDbContext context, IRealtimeNotifier notifier)
    {
        _context = context;
        _notifier = notifier;
    }

    [HttpGet]
    public async Task<IActionResult> GetNotifications([FromQuery] int take = 30, CancellationToken ct = default)
    {
        var (email, isAdmin) = GetCallerContext();
        if (string.IsNullOrWhiteSpace(email))
        {
            return Unauthorized();
        }

        var clampedTake = Math.Clamp(take, 1, 100);
        var items = await QueryVisibleNotifications(email, isAdmin)
            .OrderByDescending(n => n.CreatedAtUtc)
            .Take(clampedTake)
            .ToListAsync(ct);

        var dtos = items.Select(n => new RealtimeNotificationDto(
            n.Id,
            n.Category,
            n.Title,
            n.Message,
            n.ActionUrl,
            IsReadForCaller(n, email),
            n.CreatedAtUtc,
            n.TargetRole
        )).ToList();

        var unreadCount = await CountUnreadAsync(email, isAdmin, ct);

        return Ok(new
        {
            notifications = dtos,
            unreadCount
        });
    }

    [HttpPost("{id:guid}/read")]
    public async Task<IActionResult> MarkAsRead(Guid id, CancellationToken ct = default)
    {
        var (email, isAdmin) = GetCallerContext();
        if (string.IsNullOrWhiteSpace(email))
        {
            return Unauthorized();
        }

        var notification = await _context.RealtimeNotifications.FirstOrDefaultAsync(n => n.Id == id, ct);
        if (notification == null)
        {
            return NotFound();
        }

        if (!IsVisibleToCaller(notification, email, isAdmin))
        {
            return Forbid();
        }

        MarkNotificationReadForCaller(notification, email);
        await _context.SaveChangesAsync(ct);

        var unreadCount = await CountUnreadAsync(email, isAdmin, ct);
        return Ok(new { id, isRead = true, unreadCount });
    }

    [HttpPost("read-all")]
    public async Task<IActionResult> MarkAllAsRead(CancellationToken ct = default)
    {
        var (email, isAdmin) = GetCallerContext();
        if (string.IsNullOrWhiteSpace(email))
        {
            return Unauthorized();
        }

        var items = await QueryVisibleNotifications(email, isAdmin)
            .OrderByDescending(n => n.CreatedAtUtc)
            .Take(100)
            .ToListAsync(ct);

        foreach (var item in items)
        {
            if (!IsReadForCaller(item, email))
            {
                MarkNotificationReadForCaller(item, email);
            }
        }

        await _context.SaveChangesAsync(ct);
        return Ok(new { unreadCount = 0 });
    }

    [Authorize(Roles = "Admin,SuperAdmin")]
    [EnableRateLimiting("write")]
    [HttpPost("broadcast")]
    public async Task<IActionResult> Broadcast([FromBody] AdminBroadcastRequest request, CancellationToken ct = default)
    {
        var title = (request.Title ?? string.Empty).Trim();
        var message = (request.Message ?? string.Empty).Trim();

        if (string.IsNullOrWhiteSpace(title) || string.IsNullOrWhiteSpace(message))
        {
            return BadRequest(new { message = "Title and message are required." });
        }

        var dto = await _notifier.PublishNotificationAsync(new RealtimeNotificationPublishRequest(
            TargetUserId: null,
            TargetEmail: string.IsNullOrWhiteSpace(request.TargetEmail) ? null : request.TargetEmail.Trim().ToLowerInvariant(),
            TargetRole: string.IsNullOrWhiteSpace(request.TargetEmail)
                ? (string.IsNullOrWhiteSpace(request.TargetRole) ? "All" : request.TargetRole.Trim())
                : null,
            Category: string.IsNullOrWhiteSpace(request.Category) ? "announcement" : request.Category.Trim().ToLowerInvariant(),
            Title: title,
            Message: message,
            ActionUrl: request.ActionUrl
        ), ct);

        return Ok(dto);
    }

    private (string Email, bool IsAdmin) GetCallerContext()
    {
        var email = User.FindFirstValue(ClaimTypes.Email)?.Trim().ToLowerInvariant() ?? string.Empty;
        var isAdmin = User.IsInRole("Admin") || User.IsInRole("SuperAdmin");
        return (email, isAdmin);
    }

    private IQueryable<RealtimeNotification> QueryVisibleNotifications(string email, bool isAdmin) =>
        _context.RealtimeNotifications.Where(n =>
            n.TargetEmail == email
            || n.TargetRole == "All"
            || (isAdmin && n.TargetRole == "Admin"));

    private async Task<int> CountUnreadAsync(string email, bool isAdmin, CancellationToken ct)
    {
        var recent = await QueryVisibleNotifications(email, isAdmin)
            .OrderByDescending(n => n.CreatedAtUtc)
            .Take(100)
            .Select(n => new { n.TargetEmail, n.IsRead, n.ReadByUsers })
            .ToListAsync(ct);

        var token = $"|{email}|";
        return recent.Count(n => n.TargetEmail != null ? !n.IsRead : (!n.IsRead && !n.ReadByUsers.Contains(token)));
    }

    private static bool IsVisibleToCaller(RealtimeNotification n, string email, bool isAdmin) =>
        string.Equals(n.TargetEmail, email, StringComparison.OrdinalIgnoreCase)
        || string.Equals(n.TargetRole, "All", StringComparison.OrdinalIgnoreCase)
        || (isAdmin && string.Equals(n.TargetRole, "Admin", StringComparison.OrdinalIgnoreCase));

    private static bool IsReadForCaller(RealtimeNotification n, string email)
    {
        if (n.TargetEmail != null) return n.IsRead;
        return n.IsRead || n.ReadByUsers.Contains($"|{email}|", StringComparison.OrdinalIgnoreCase);
    }

    private static void MarkNotificationReadForCaller(RealtimeNotification n, string email)
    {
        if (n.TargetEmail != null)
        {
            n.IsRead = true;
            n.UpdatedAtUtc = DateTime.UtcNow;
            return;
        }

        var token = $"|{email}|";
        if (!n.ReadByUsers.Contains(token, StringComparison.OrdinalIgnoreCase))
        {
            if (n.ReadByUsers.Length + token.Length <= 3900)
            {
                n.ReadByUsers += token;
            }
            n.UpdatedAtUtc = DateTime.UtcNow;
        }
    }
}
