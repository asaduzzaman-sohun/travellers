using TourFlow.Domain.Common;

namespace TourFlow.Domain.Entities;

public class RealtimeNotification : BaseEntity
{
    public Guid? TargetUserId { get; set; }
    public string? TargetEmail { get; set; }
    public string? TargetRole { get; set; } // e.g. "Admin", "All", or null for direct user notifications
    public string Category { get; set; } = "system"; // booking, review, chat, announcement, system
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? ActionUrl { get; set; }
    public bool IsRead { get; set; } = false;
    public string ReadByUsers { get; set; } = string.Empty; // Pipe-delimited emails ("|a@b.com|") for shared role/global notifications
}
