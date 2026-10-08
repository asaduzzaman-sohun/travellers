using TourFlow.Domain.Common;

namespace TourFlow.Domain.Entities;

public class Review : BaseEntity
{
    public Guid TourPackageId { get; set; }
    public Guid? UserId { get; set; }
    public string ReviewerName { get; set; } = string.Empty;
    public string ReviewerLocation { get; set; } = string.Empty; // e.g. "Bristol, United Kingdom"
    public string ReviewerEmail { get; set; } = string.Empty;
    public int Rating { get; set; } // 1 - 5
    public string Title { get; set; } = string.Empty;
    public string Comment { get; set; } = string.Empty;
    public string TripDateFormatted { get; set; } = string.Empty; // e.g. "Traveled September 2026"
    public bool IsVerifiedBooking { get; set; } = true;
    public bool IsApproved { get; set; } = true;

    // Navigation properties
    public User? User { get; set; }
    public TourPackage? TourPackage { get; set; }
}
