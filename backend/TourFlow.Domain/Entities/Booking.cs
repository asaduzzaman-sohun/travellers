using TourFlow.Domain.Common;
using TourFlow.Domain.Enums;

namespace TourFlow.Domain.Entities;

public class Booking : BaseEntity
{
    public string BookingReference { get; set; } = string.Empty;
    public Guid TourScheduleId { get; set; }
    public Guid TourPackageId { get; set; }

    // Customer details
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;

    public int NumberOfTravelers { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal DepositPaid { get; set; }
    public decimal BalanceRemaining { get; set; }

    public BookingStatus Status { get; set; } = BookingStatus.Confirmed;
    public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Paid;

    public string? DietaryRequirements { get; set; }
    public string? SpecialRequests { get; set; }
    public string? EmergencyContactName { get; set; }
    public string? EmergencyContactPhone { get; set; }
    public string? PaymentTransactionId { get; set; }

    // Navigation properties
    public TourSchedule? TourSchedule { get; set; }
    public TourPackage? TourPackage { get; set; }
    public ICollection<Traveler> Travelers { get; set; } = [];
}
