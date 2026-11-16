using TourFlow.Domain.Common;

namespace TourFlow.Domain.Entities;

public class ContactInquiry : BaseEntity
{
    public string TicketNumber { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Division { get; set; } = "Dhaka";
    public string Subject { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// "Open", "InProgress", "Resolved", "Closed"
    /// </summary>
    public string Status { get; set; } = "Open";

    /// <summary>
    /// "Normal", "Urgent", "High"
    /// </summary>
    public string Priority { get; set; } = "Normal";

    public string? AdminNotes { get; set; }
    public Guid? AssignedToAdminId { get; set; }
    public DateTime? ResolvedAtUtc { get; set; }
}
