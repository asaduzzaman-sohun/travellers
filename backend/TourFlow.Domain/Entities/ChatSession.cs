using TourFlow.Domain.Common;

namespace TourFlow.Domain.Entities;

/// <summary>
/// Represents an authenticated, user-scoped AI Concierge conversation thread.
/// </summary>
public class ChatSession : BaseEntity
{
    public Guid OwnerUserId { get; set; }
    public string OwnerEmail { get; set; } = string.Empty;
    public string OwnerName { get; set; } = string.Empty;
    public string Title { get; set; } = "New Travel Concierge Chat";
    public bool IsEscalatedToHuman { get; set; } = false;
    public DateTime LastMessageAtUtc { get; set; } = DateTime.UtcNow;

    public ICollection<ChatMessage> Messages { get; set; } = [];
}
