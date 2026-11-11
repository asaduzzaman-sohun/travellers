using System.Security.Claims;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using TourFlow.Api.DTOs;
using TourFlow.Api.Hubs;
using TourFlow.Domain.Entities;
using TourFlow.Infrastructure.Data;

namespace TourFlow.Api.Services;

public static class RealtimeRoomPolicy
{
    public const string PostgresNotifyChannel = "tourflow_realtime_events";

    public static string SessionRoom(Guid sessionId) => $"session:{sessionId:D}";

    public static string NormalizeRoomId(string? roomId)
    {
        if (string.IsNullOrWhiteSpace(roomId)) return "session:none";
        var clean = roomId.Trim().ToLowerInvariant();
        return clean.Length <= 120 ? clean : clean[..120];
    }

    public static bool TryParseSessionId(string? roomId, out Guid sessionId)
    {
        sessionId = Guid.Empty;
        if (string.IsNullOrWhiteSpace(roomId)) return false;

        const string prefix = "session:";
        var normalized = roomId.Trim();
        if (!normalized.StartsWith(prefix, StringComparison.OrdinalIgnoreCase))
        {
            return false;
        }

        return Guid.TryParse(normalized[prefix.Length..], out sessionId);
    }

    public static bool CanAccessSession(ChatSession session, ClaimsPrincipal? principal)
    {
        if (principal?.Identity?.IsAuthenticated != true) return false;

        var userIdStr = principal.FindFirstValue(ClaimTypes.NameIdentifier);
        Guid.TryParse(userIdStr, out var callerUserId);
        var callerEmail = principal.FindFirstValue(ClaimTypes.Email)?.Trim().ToLowerInvariant();

        if (callerUserId != Guid.Empty && session.OwnerUserId == callerUserId)
        {
            return true;
        }

        if (!string.IsNullOrWhiteSpace(callerEmail)
            && string.Equals(session.OwnerEmail, callerEmail, StringComparison.OrdinalIgnoreCase))
        {
            return true;
        }

        var isAdmin = principal.IsInRole("Admin") || principal.IsInRole("SuperAdmin");
        return isAdmin && session.IsEscalatedToHuman;
    }
}

public record RealtimeNotificationPublishRequest(
    Guid? TargetUserId,
    string? TargetEmail,
    string? TargetRole,
    string Category,
    string Title,
    string Message,
    string? ActionUrl = null
);

public record ChatMessagePublishRequest(
    string RoomId,
    Guid? SenderUserId,
    string SenderName,
    string SenderEmail,
    string SenderRole,
    string Message,
    Guid? SessionId = null,
    ChatRichMetadata? Metadata = null,
    bool NotifyAdminOnEscalation = false
);

public interface IRealtimeNotifier
{
    Task<RealtimeNotificationDto> PublishNotificationAsync(RealtimeNotificationPublishRequest request, CancellationToken ct = default);
    Task<ChatMessageDto> PublishChatMessageAsync(ChatMessagePublishRequest request, CancellationToken ct = default);
    Task PublishTypingAsync(TypingIndicatorPayload payload, CancellationToken ct = default);
}

internal sealed class RealtimeEventEnvelope
{
    public string EventType { get; set; } = string.Empty; // "notification" | "chat" | "typing"
    public List<string> Groups { get; set; } = new();
    public RealtimeNotificationDto? Notification { get; set; }
    public ChatMessageDto? ChatMessage { get; set; }
    public TypingIndicatorPayload? Typing { get; set; }
}

public class RealtimeNotificationService : IRealtimeNotifier
{
    internal static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    private readonly TourFlowDbContext _context;
    private readonly IHubContext<TourFlowHub> _hubContext;
    private readonly ILogger<RealtimeNotificationService> _logger;

    public RealtimeNotificationService(
        TourFlowDbContext context,
        IHubContext<TourFlowHub> hubContext,
        ILogger<RealtimeNotificationService> logger)
    {
        _context = context;
        _hubContext = hubContext;
        _logger = logger;
    }

    public async Task<RealtimeNotificationDto> PublishNotificationAsync(
        RealtimeNotificationPublishRequest request,
        CancellationToken ct = default)
    {
        var normalizedEmail = string.IsNullOrWhiteSpace(request.TargetEmail)
            ? null
            : request.TargetEmail.Trim().ToLowerInvariant();

        var normalizedRole = string.IsNullOrWhiteSpace(normalizedEmail)
            ? (string.IsNullOrWhiteSpace(request.TargetRole) ? "All" : request.TargetRole.Trim())
            : null;

        var entity = new RealtimeNotification
        {
            TargetUserId = request.TargetUserId,
            TargetEmail = normalizedEmail,
            TargetRole = normalizedRole,
            Category = string.IsNullOrWhiteSpace(request.Category) ? "system" : request.Category.Trim().ToLowerInvariant(),
            Title = Truncate(request.Title.Trim(), 160),
            Message = Truncate(request.Message.Trim(), 600),
            ActionUrl = string.IsNullOrWhiteSpace(request.ActionUrl) ? null : Truncate(request.ActionUrl.Trim(), 300),
            IsRead = false,
            CreatedAtUtc = DateTime.UtcNow
        };

        _context.RealtimeNotifications.Add(entity);
        await _context.SaveChangesAsync(ct);

        var dto = new RealtimeNotificationDto(
            entity.Id,
            entity.Category,
            entity.Title,
            entity.Message,
            entity.ActionUrl,
            entity.IsRead,
            entity.CreatedAtUtc,
            entity.TargetRole
        );

        var groups = new List<string>();
        if (!string.IsNullOrWhiteSpace(normalizedEmail))
        {
            groups.Add(TourFlowHub.UserGroup(normalizedEmail));
        }
        else if (string.Equals(normalizedRole, "Admin", StringComparison.OrdinalIgnoreCase))
        {
            groups.Add(TourFlowHub.RoleAdminGroup);
        }
        else
        {
            groups.Add(TourFlowHub.GlobalBroadcastGroup);
        }

        await DispatchEnvelopeAsync(new RealtimeEventEnvelope
        {
            EventType = "notification",
            Groups = groups,
            Notification = dto
        }, ct);

        return dto;
    }

    public async Task<ChatMessageDto> PublishChatMessageAsync(
        ChatMessagePublishRequest request,
        CancellationToken ct = default)
    {
        var normalizedRoom = RealtimeRoomPolicy.NormalizeRoomId(request.RoomId);
        var cleanMessage = Truncate((request.Message ?? string.Empty).Trim(), 3800);
        if (string.IsNullOrWhiteSpace(cleanMessage))
        {
            throw new ArgumentException("Chat message cannot be empty.", nameof(request));
        }

        string? serializedMetadata = null;
        if (request.Metadata != null)
        {
            var json = JsonSerializer.Serialize(request.Metadata, JsonOptions);
            serializedMetadata = json.Length <= 11800 ? json : null;
        }

        var entity = new ChatMessage
        {
            SessionId = request.SessionId,
            RoomId = normalizedRoom,
            SenderUserId = request.SenderUserId,
            SenderName = Truncate(string.IsNullOrWhiteSpace(request.SenderName) ? "Traveler" : request.SenderName.Trim(), 120),
            SenderEmail = Truncate((request.SenderEmail ?? string.Empty).Trim().ToLowerInvariant(), 180),
            SenderRole = Truncate(string.IsNullOrWhiteSpace(request.SenderRole) ? "Traveler" : request.SenderRole.Trim(), 40),
            Message = cleanMessage,
            MetadataJson = serializedMetadata,
            CreatedAtUtc = DateTime.UtcNow
        };

        _context.ChatMessages.Add(entity);
        await _context.SaveChangesAsync(ct);

        var dto = new ChatMessageDto(
            entity.Id,
            entity.SessionId,
            entity.RoomId,
            entity.SenderUserId,
            entity.SenderName,
            entity.SenderEmail,
            entity.SenderRole,
            entity.Message,
            request.Metadata,
            entity.CreatedAtUtc
        );

        var groups = new List<string> { TourFlowHub.RoomGroup(normalizedRoom) };
        if (request.NotifyAdminOnEscalation)
        {
            groups.Add(TourFlowHub.RoleAdminGroup);
        }

        await DispatchEnvelopeAsync(new RealtimeEventEnvelope
        {
            EventType = "chat",
            Groups = groups,
            ChatMessage = dto
        }, ct);

        if (request.NotifyAdminOnEscalation)
        {
            var isPrivilegedSender = string.Equals(entity.SenderRole, "Admin", StringComparison.OrdinalIgnoreCase)
                || string.Equals(entity.SenderRole, "SuperAdmin", StringComparison.OrdinalIgnoreCase)
                || string.Equals(entity.SenderRole, "Bot", StringComparison.OrdinalIgnoreCase);

            if (!isPrivilegedSender && entity.SessionId.HasValue)
            {
                var actionUrl = $"/concierge?session={entity.SessionId.Value:D}";
                var recentThreshold = DateTime.UtcNow.AddMinutes(-10);
                var hasRecentUnread = await _context.RealtimeNotifications.AnyAsync(
                    n => n.TargetRole == "Admin"
                         && n.Category == "chat"
                         && n.ActionUrl == actionUrl
                         && !n.IsRead
                         && n.CreatedAtUtc >= recentThreshold,
                    ct);

                if (!hasRecentUnread)
                {
                    await PublishNotificationAsync(new RealtimeNotificationPublishRequest(
                        TargetUserId: null,
                        TargetEmail: null,
                        TargetRole: "Admin",
                        Category: "chat",
                        Title: $"Escalated Concierge Thread · {entity.SenderName}",
                        Message: Truncate(entity.Message, 180),
                        ActionUrl: actionUrl
                    ), ct);
                }
            }
        }

        return dto;
    }

    public async Task PublishTypingAsync(TypingIndicatorPayload payload, CancellationToken ct = default)
    {
        var normalizedRoom = RealtimeRoomPolicy.NormalizeRoomId(payload.RoomId);
        await DispatchEnvelopeAsync(new RealtimeEventEnvelope
        {
            EventType = "typing",
            Groups = new List<string> { TourFlowHub.RoomGroup(normalizedRoom) },
            Typing = payload with { RoomId = normalizedRoom }
        }, ct);
    }

    private async Task DispatchEnvelopeAsync(RealtimeEventEnvelope envelope, CancellationToken ct)
    {
        if (envelope.Groups.Count == 0) return;

        var payloadJson = JsonSerializer.Serialize(envelope, JsonOptions);
        var isPostgres = _context.Database.IsRelational()
            && (_context.Database.ProviderName?.Contains("Npgsql", StringComparison.OrdinalIgnoreCase) ?? false);

        // PostgreSQL LISTEN/NOTIFY payload limit is 8000 bytes; keep safety margin at 7400 bytes.
        if (isPostgres && Encoding.UTF8.GetByteCount(payloadJson) <= 7400)
        {
            try
            {
                await _context.Database.ExecuteSqlInterpolatedAsync(
                    $"SELECT pg_notify({RealtimeRoomPolicy.PostgresNotifyChannel}, {payloadJson})", ct);
                return;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "PostgreSQL pg_notify dispatch failed; falling back to local SignalR HubContext.");
            }
        }

        await DispatchLocallyAsync(_hubContext, envelope, ct);
    }

    internal static async Task DispatchLocallyAsync(
        IHubContext<TourFlowHub> hubContext,
        RealtimeEventEnvelope envelope,
        CancellationToken ct)
    {
        if (envelope.Groups.Count == 0) return;

        if (envelope.EventType == "notification" && envelope.Notification != null)
        {
            await hubContext.Clients.Groups(envelope.Groups)
                .SendAsync("ReceiveNotification", envelope.Notification, ct);
        }
        else if (envelope.EventType == "chat" && envelope.ChatMessage != null)
        {
            await hubContext.Clients.Groups(envelope.Groups)
                .SendAsync("ReceiveChatMessage", envelope.ChatMessage, ct);
        }
        else if (envelope.EventType == "typing" && envelope.Typing != null)
        {
            await hubContext.Clients.Groups(envelope.Groups)
                .SendAsync("UserTyping", envelope.Typing, ct);
        }
    }

    private static string Truncate(string value, int maxLength) =>
        value.Length <= maxLength ? value : value[..maxLength];
}

/// <summary>
/// Cross-node SignalR backplane powered by PostgreSQL LISTEN/NOTIFY so notifications,
/// AI concierge messages, and typing states fan out immediately across API replicas.
/// </summary>
public class PostgresSignalRBackplaneService : BackgroundService
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    private readonly IConfiguration _configuration;
    private readonly IHubContext<TourFlowHub> _hubContext;
    private readonly ILogger<PostgresSignalRBackplaneService> _logger;

    public PostgresSignalRBackplaneService(
        IConfiguration configuration,
        IHubContext<TourFlowHub> hubContext,
        ILogger<PostgresSignalRBackplaneService> logger)
    {
        _configuration = configuration;
        _hubContext = hubContext;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        if (_configuration.GetValue<bool>("SkipDbInitialization"))
        {
            return;
        }

        var connectionString = _configuration.GetConnectionString("DefaultConnection");
        if (string.IsNullOrWhiteSpace(connectionString))
        {
            _logger.LogInformation("PostgresSignalRBackplaneService disabled: DefaultConnection not configured.");
            return;
        }

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await using var conn = new NpgsqlConnection(connectionString);
                await conn.OpenAsync(stoppingToken);

                conn.Notification += async (_, args) =>
                {
                    if (args.Channel != RealtimeRoomPolicy.PostgresNotifyChannel || string.IsNullOrWhiteSpace(args.Payload))
                    {
                        return;
                    }

                    try
                    {
                        var envelope = JsonSerializer.Deserialize<RealtimeEventEnvelope>(args.Payload, JsonOptions);
                        if (envelope != null)
                        {
                            await RealtimeNotificationService.DispatchLocallyAsync(_hubContext, envelope, stoppingToken);
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to dispatch PostgreSQL SignalR backplane payload.");
                    }
                };

                await using (var listenCmd = new NpgsqlCommand($"LISTEN {RealtimeRoomPolicy.PostgresNotifyChannel};", conn))
                {
                    await listenCmd.ExecuteNonQueryAsync(stoppingToken);
                }

                _logger.LogInformation(
                    "SignalR PostgreSQL LISTEN/NOTIFY backplane connected on channel '{Channel}'.",
                    RealtimeRoomPolicy.PostgresNotifyChannel);

                while (!stoppingToken.IsCancellationRequested)
                {
                    await conn.WaitAsync(stoppingToken);
                }
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "PostgreSQL SignalR backplane disconnected. Reconnecting in 5 seconds...");
                try
                {
                    await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);
                }
                catch (OperationCanceledException)
                {
                    break;
                }
            }
        }
    }
}
