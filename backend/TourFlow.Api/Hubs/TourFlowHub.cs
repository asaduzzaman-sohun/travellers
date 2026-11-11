using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using TourFlow.Api.DTOs;
using TourFlow.Api.Services;
using TourFlow.Infrastructure.Data;

namespace TourFlow.Api.Hubs;

/// <summary>
/// Authorized SignalR hub delivering user-scoped notifications, real-time AI Concierge
/// conversation updates, escalated support sync, and typing state across API nodes.
/// </summary>
[Authorize]
public class TourFlowHub : Hub
{
    public const string GlobalBroadcastGroup = "broadcast:All";
    public const string RoleAdminGroup = "role:Admin";

    private readonly TourFlowDbContext _context;
    private readonly IRealtimeNotifier _notifier;

    public TourFlowHub(TourFlowDbContext context, IRealtimeNotifier notifier)
    {
        _context = context;
        _notifier = notifier;
    }

    public static string RoomGroup(string roomId) => $"room:{RealtimeRoomPolicy.NormalizeRoomId(roomId)}";
    public static string UserGroup(string email) => $"user:{email.Trim().ToLowerInvariant()}";

    public override async Task OnConnectedAsync()
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, GlobalBroadcastGroup);

        var userIdStr = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
        Guid.TryParse(userIdStr, out var callerUserId);
        var normalizedEmail = Context.User?.FindFirstValue(ClaimTypes.Email)?.Trim().ToLowerInvariant();
        var isAdmin = IsAdminUser(Context.User);

        if (!string.IsNullOrWhiteSpace(normalizedEmail))
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, UserGroup(normalizedEmail));
        }

        if (isAdmin)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, RoleAdminGroup);
        }

        // Pre-subscribe the authenticated connection to their authorized concierge threads
        // and (for admins) active human-escalated threads so multi-tab sync works immediately.
        var sessionIds = await _context.ChatSessions
            .AsNoTracking()
            .Where(s =>
                (callerUserId != Guid.Empty && s.OwnerUserId == callerUserId)
                || (!string.IsNullOrWhiteSpace(normalizedEmail) && s.OwnerEmail == normalizedEmail)
                || (isAdmin && s.IsEscalatedToHuman))
            .OrderByDescending(s => s.LastMessageAtUtc)
            .Take(25)
            .Select(s => s.Id)
            .ToListAsync(Context.ConnectionAborted);

        foreach (var sessionId in sessionIds)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, RoomGroup(RealtimeRoomPolicy.SessionRoom(sessionId)));
        }

        await base.OnConnectedAsync();
    }

    public async Task JoinSession(Guid sessionId)
    {
        var session = await _context.ChatSessions
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Id == sessionId, Context.ConnectionAborted);

        if (session == null)
        {
            throw new HubException("Conversation session not found.");
        }

        if (!RealtimeRoomPolicy.CanAccessSession(session, Context.User))
        {
            throw new HubException("You do not have permission to join this private conversation.");
        }

        await Groups.AddToGroupAsync(Context.ConnectionId, RoomGroup(RealtimeRoomPolicy.SessionRoom(sessionId)));
    }

    public async Task LeaveSession(Guid sessionId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, RoomGroup(RealtimeRoomPolicy.SessionRoom(sessionId)));
    }

    public async Task SendTyping(Guid sessionId, bool isTyping)
    {
        var session = await _context.ChatSessions
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Id == sessionId, Context.ConnectionAborted);

        if (session == null || !RealtimeRoomPolicy.CanAccessSession(session, Context.User))
        {
            return;
        }

        var resolvedName = Context.User?.FindFirstValue(ClaimTypes.Name)
            ?? Context.User?.FindFirstValue("name")
            ?? "Traveler";

        var roomId = RealtimeRoomPolicy.SessionRoom(sessionId);
        await Clients.OthersInGroup(RoomGroup(roomId)).SendAsync("UserTyping", new TypingIndicatorPayload(
            SessionId: sessionId,
            RoomId: roomId,
            UserName: resolvedName,
            IsTyping: isTyping,
            IsBot: false
        ), Context.ConnectionAborted);
    }

    private static bool IsAdminUser(ClaimsPrincipal? principal) =>
        principal != null && (principal.IsInRole("Admin") || principal.IsInRole("SuperAdmin"));
}
