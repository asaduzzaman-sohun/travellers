using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using TourFlow.Api.DTOs;
using TourFlow.Api.Services;
using TourFlow.Infrastructure.Data;

namespace TourFlow.Api.Controllers;

/// <summary>
/// Authorized AI Travel Concierge conversation endpoints with strict per-user session isolation
/// and explicit opt-in human specialist escalation for Admins.
/// </summary>
[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ChatController : ControllerBase
{
    private readonly TourFlowDbContext _context;
    private readonly ITourFlowChatbotService _chatbot;

    public ChatController(TourFlowDbContext context, ITourFlowChatbotService chatbot)
    {
        _context = context;
        _chatbot = chatbot;
    }

    [HttpGet("sessions")]
    public async Task<IActionResult> GetSessions(CancellationToken ct = default)
    {
        var (userId, email, _, isAdmin) = ResolveCaller();
        if (userId == Guid.Empty && string.IsNullOrWhiteSpace(email))
        {
            return Unauthorized();
        }

        var sessions = await _chatbot.GetSessionsAsync(userId, email, isAdmin, ct);
        return Ok(sessions);
    }

    [EnableRateLimiting("write")]
    [HttpPost("sessions")]
    public async Task<IActionResult> CreateSession([FromBody] CreateChatSessionRequest? request, CancellationToken ct = default)
    {
        var (userId, email, fullName, _) = ResolveCaller();
        if (userId == Guid.Empty && string.IsNullOrWhiteSpace(email))
        {
            return Unauthorized();
        }

        var created = await _chatbot.CreateSessionAsync(userId, email, fullName, request, ct);
        return Ok(created);
    }

    [HttpGet("sessions/{sessionId:guid}/messages")]
    public async Task<IActionResult> GetSessionMessages(Guid sessionId, [FromQuery] int take = 80, CancellationToken ct = default)
    {
        var session = await _context.ChatSessions
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Id == sessionId, ct);

        if (session == null)
        {
            return NotFound(new { message = "Conversation session not found." });
        }

        if (!RealtimeRoomPolicy.CanAccessSession(session, User))
        {
            return Forbid();
        }

        var messages = await _chatbot.GetSessionMessagesAsync(sessionId, take, ct);
        return Ok(messages);
    }

    [EnableRateLimiting("write")]
    [HttpPost("sessions/{sessionId:guid}/ask")]
    public async Task<IActionResult> AskChatbot(Guid sessionId, [FromBody] AskChatbotRequest request, CancellationToken ct = default)
    {
        var session = await _context.ChatSessions.FirstOrDefaultAsync(s => s.Id == sessionId, ct);
        if (session == null)
        {
            return NotFound(new { message = "Conversation session not found." });
        }

        if (!RealtimeRoomPolicy.CanAccessSession(session, User))
        {
            return Forbid();
        }

        var cleanPrompt = (request.Message ?? string.Empty).Trim();
        if (string.IsNullOrWhiteSpace(cleanPrompt))
        {
            return BadRequest(new { message = "Message cannot be empty." });
        }

        if (cleanPrompt.Length > 2000)
        {
            return BadRequest(new { message = "Message cannot exceed 2000 characters." });
        }

        var (userId, email, fullName, _) = ResolveCaller();
        var response = await _chatbot.AskAsync(session, userId, email, fullName, cleanPrompt, ct);
        return Ok(response);
    }

    [EnableRateLimiting("write")]
    [HttpPost("sessions/{sessionId:guid}/escalate")]
    public async Task<IActionResult> EscalateSession(Guid sessionId, CancellationToken ct = default)
    {
        var session = await _context.ChatSessions.FirstOrDefaultAsync(s => s.Id == sessionId, ct);
        if (session == null)
        {
            return NotFound(new { message = "Conversation session not found." });
        }

        if (!RealtimeRoomPolicy.CanAccessSession(session, User))
        {
            return Forbid();
        }

        var (_, _, fullName, _) = ResolveCaller();
        var updated = await _chatbot.EscalateToHumanAsync(session, fullName, ct);
        return Ok(updated);
    }

    [EnableRateLimiting("write")]
    [Authorize(Policy = "RequireAdminRole")]
    [HttpPost("sessions/{sessionId:guid}/reply")]
    public async Task<IActionResult> ReplyAsHumanSpecialist(Guid sessionId, [FromBody] AskChatbotRequest request, CancellationToken ct = default)
    {
        var session = await _context.ChatSessions.FirstOrDefaultAsync(s => s.Id == sessionId, ct);
        if (session == null)
        {
            return NotFound(new { message = "Conversation session not found." });
        }

        if (!RealtimeRoomPolicy.CanAccessSession(session, User))
        {
            return Forbid();
        }

        var trimmed = (request.Message ?? string.Empty).Trim();
        if (string.IsNullOrWhiteSpace(trimmed))
        {
            return BadRequest(new { message = "Reply message cannot be empty." });
        }

        var (adminId, adminEmail, adminName, _) = ResolveCaller();
        var adminRole = User.FindFirstValue(ClaimTypes.Role) ?? "Admin";
        var updated = await _chatbot.ReplyAsHumanAsync(session, adminId, adminEmail, adminName, adminRole, trimmed, ct);
        return Ok(updated);
    }

    [EnableRateLimiting("write")]
    [HttpDelete("sessions/{sessionId:guid}")]
    public async Task<IActionResult> DeleteSession(Guid sessionId, CancellationToken ct = default)
    {
        var session = await _context.ChatSessions.FirstOrDefaultAsync(s => s.Id == sessionId, ct);
        if (session == null)
        {
            return NotFound(new { message = "Conversation session not found." });
        }

        if (!RealtimeRoomPolicy.CanAccessSession(session, User))
        {
            return Forbid();
        }

        session.IsDeleted = true;
        session.UpdatedAtUtc = DateTime.UtcNow;
        await _context.SaveChangesAsync(ct);

        return NoContent();
    }

    private (Guid UserId, string Email, string FullName, bool IsAdmin) ResolveCaller()
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        Guid.TryParse(userIdStr, out var userId);
        var email = (User.FindFirstValue(ClaimTypes.Email) ?? string.Empty).Trim().ToLowerInvariant();
        var fullName = User.FindFirstValue(ClaimTypes.Name)
            ?? User.FindFirstValue("name")
            ?? (!string.IsNullOrWhiteSpace(email) ? email.Split('@')[0] : "Traveler");
        var isAdmin = User.IsInRole("Admin") || User.IsInRole("SuperAdmin");
        return (userId, email, fullName, isAdmin);
    }
}
