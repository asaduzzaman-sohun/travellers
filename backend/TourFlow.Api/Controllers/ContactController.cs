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

[ApiController]
[Route("api/[controller]")]
public class ContactController : ControllerBase
{
    private readonly TourFlowDbContext _context;
    private readonly IRealtimeNotifier _notifier;
    private readonly ILogger<ContactController> _logger;

    public ContactController(
        TourFlowDbContext context,
        IRealtimeNotifier notifier,
        ILogger<ContactController> logger)
    {
        _context = context;
        _notifier = notifier;
        _logger = logger;
    }

    [HttpPost]
    [AllowAnonymous]
    [EnableRateLimiting("write")]
    public async Task<IActionResult> CreateInquiry([FromBody] CreateContactInquiryRequestDto request, CancellationToken ct)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var isUrgent = (request.Subject + " " + request.Message).Contains("urgent", StringComparison.OrdinalIgnoreCase)
            || (request.Subject + " " + request.Message).Contains("emergency", StringComparison.OrdinalIgnoreCase)
            || (request.Subject + " " + request.Message).Contains("police", StringComparison.OrdinalIgnoreCase);

        var ticketNumber = $"TKT-{DateTime.UtcNow:yyyyMM}-{Random.Shared.Next(1000, 9999)}";

        var inquiry = new ContactInquiry
        {
            TicketNumber = ticketNumber,
            Name = request.Name.Trim(),
            Email = normalizedEmail,
            Phone = request.Phone.Trim(),
            Division = string.IsNullOrWhiteSpace(request.Division) ? "Dhaka" : request.Division.Trim(),
            Subject = request.Subject.Trim(),
            Message = request.Message.Trim(),
            Status = "Open",
            Priority = isUrgent ? "Urgent" : "Normal",
            CreatedAtUtc = DateTime.UtcNow
        };

        _context.ContactInquiries.Add(inquiry);
        await _context.SaveChangesAsync(ct);

        // Broadcast real-time alert to online Admins via SignalR
        await _notifier.PublishNotificationAsync(new RealtimeNotificationPublishRequest(
            TargetUserId: null,
            TargetEmail: null,
            TargetRole: "Admin",
            Category: "support",
            Title: $"Desk Ticket #{inquiry.TicketNumber} · {inquiry.Name}",
            Message: $"{inquiry.Subject} ({inquiry.Division})",
            ActionUrl: "/admin?tab=support"
        ), ct);

        return CreatedAtAction(nameof(GetInquiryByIdOrTicket), new { ticketOrId = inquiry.TicketNumber }, MapToDto(inquiry));
    }

    [HttpGet("{ticketOrId}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetInquiryByIdOrTicket(string ticketOrId, CancellationToken ct)
    {
        ContactInquiry? inquiry;
        if (Guid.TryParse(ticketOrId, out var id))
        {
            inquiry = await _context.ContactInquiries.FirstOrDefaultAsync(i => i.Id == id, ct);
        }
        else
        {
            inquiry = await _context.ContactInquiries.FirstOrDefaultAsync(
                i => i.TicketNumber.ToLower() == ticketOrId.Trim().ToLower(), ct);
        }

        if (inquiry == null)
        {
            return NotFound(new { message = "Inquiry ticket not found." });
        }

        return Ok(MapToDto(inquiry));
    }

    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetInquiries(
        [FromQuery] string? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        CancellationToken ct = default)
    {
        var role = User.FindFirstValue(ClaimTypes.Role) ?? "";
        var isAdmin = string.Equals(role, "Admin", StringComparison.OrdinalIgnoreCase)
            || string.Equals(role, "SuperAdmin", StringComparison.OrdinalIgnoreCase);

        var userEmail = User.FindFirstValue(ClaimTypes.Email)?.Trim().ToLowerInvariant();

        var query = _context.ContactInquiries.AsNoTracking();

        if (!isAdmin)
        {
            // Non-admin users only see their own inquiries
            if (string.IsNullOrWhiteSpace(userEmail)) return Forbid();
            query = query.Where(i => i.Email == userEmail);
        }

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(i => i.Status.ToLower() == status.Trim().ToLower());
        }

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderByDescending(i => i.Priority == "Urgent")
            .ThenByDescending(i => i.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(i => MapToDto(i))
            .ToListAsync(ct);

        return Ok(new { total, page, pageSize, items });
    }

    [HttpPatch("{id:guid}/status")]
    [Authorize]
    public async Task<IActionResult> UpdateInquiryStatus(
        Guid id,
        [FromBody] UpdateContactInquiryStatusDto request,
        CancellationToken ct)
    {
        var role = User.FindFirstValue(ClaimTypes.Role) ?? "";
        if (!string.Equals(role, "Admin", StringComparison.OrdinalIgnoreCase)
            && !string.Equals(role, "SuperAdmin", StringComparison.OrdinalIgnoreCase))
        {
            return Forbid();
        }

        var inquiry = await _context.ContactInquiries.FirstOrDefaultAsync(i => i.Id == id, ct);
        if (inquiry == null)
        {
            return NotFound(new { message = "Inquiry not found." });
        }

        inquiry.Status = request.Status.Trim();
        if (!string.IsNullOrWhiteSpace(request.AdminNotes))
        {
            inquiry.AdminNotes = request.AdminNotes.Trim();
        }

        if (string.Equals(inquiry.Status, "Resolved", StringComparison.OrdinalIgnoreCase))
        {
            inquiry.ResolvedAtUtc = DateTime.UtcNow;
        }

        inquiry.UpdatedAtUtc = DateTime.UtcNow;
        await _context.SaveChangesAsync(ct);

        // Notify customer via SignalR if online
        await _notifier.PublishNotificationAsync(new RealtimeNotificationPublishRequest(
            TargetUserId: null,
            TargetEmail: inquiry.Email,
            TargetRole: null,
            Category: "support",
            Title: $"Ticket #{inquiry.TicketNumber} {inquiry.Status}",
            Message: $"Your support inquiry '{inquiry.Subject}' is now marked as {inquiry.Status}.",
            ActionUrl: "/contact"
        ), ct);

        return Ok(MapToDto(inquiry));
    }

    [HttpDelete("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> DeleteInquiry(Guid id, CancellationToken ct)
    {
        var role = User.FindFirstValue(ClaimTypes.Role) ?? "";
        if (!string.Equals(role, "Admin", StringComparison.OrdinalIgnoreCase)
            && !string.Equals(role, "SuperAdmin", StringComparison.OrdinalIgnoreCase))
        {
            return Forbid();
        }

        var inquiry = await _context.ContactInquiries.FirstOrDefaultAsync(i => i.Id == id, ct);
        if (inquiry == null)
        {
            return NotFound(new { message = "Inquiry not found." });
        }

        inquiry.IsDeleted = true;
        inquiry.UpdatedAtUtc = DateTime.UtcNow;
        await _context.SaveChangesAsync(ct);

        return NoContent();
    }

    private static ContactInquiryResponseDto MapToDto(ContactInquiry i) =>
        new(
            i.Id,
            i.TicketNumber,
            i.Name,
            i.Email,
            i.Phone,
            i.Division,
            i.Subject,
            i.Message,
            i.Status,
            i.Priority,
            i.AdminNotes,
            i.CreatedAtUtc,
            i.ResolvedAtUtc
        );
}
