using TourFlow.Domain.Common;

namespace TourFlow.Domain.Entities;

public class Traveler : BaseEntity
{
    public Guid BookingId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? PhoneNumber { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? Gender { get; set; }
    public string? PassportNumber { get; set; }
    public string? Nationality { get; set; }

    // Navigation property
    public Booking? Booking { get; set; }
}
