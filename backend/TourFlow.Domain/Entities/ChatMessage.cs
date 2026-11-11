using TourFlow.Domain.Common;

namespace TourFlow.Domain.Entities;

public class ChatMessage : BaseEntity
{
    public Guid? SessionId { get; set; }
    public string RoomId { get; set; } = string.Empty;
    public Guid? SenderUserId { get; set; }
    public string SenderName { get; set; } = string.Empty;
    public string SenderEmail { get; set; } = string.Empty;
    public string SenderRole { get; set; } = "User"; // User | Assistant | Admin | SuperAdmin | System
    public string Message { get; set; } = string.Empty;
    public string? MetadataJson { get; set; }

    public ChatSession? Session { get; set; }
}
