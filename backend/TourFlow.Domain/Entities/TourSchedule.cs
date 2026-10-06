using TourFlow.Domain.Common;
using TourFlow.Domain.Enums;

namespace TourFlow.Domain.Entities;

public class TourSchedule : BaseEntity
{
    public Guid TourPackageId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal PricePerPerson { get; set; }
    public int TotalSeats { get; set; }
    public int BookedSeats { get; set; }
    public ScheduleStatus Status { get; set; } = ScheduleStatus.Scheduled;

    public int AvailableSeats => Math.Max(0, TotalSeats - BookedSeats);

    // Navigation properties
    public TourPackage? TourPackage { get; set; }
    public ICollection<Booking> Bookings { get; set; } = [];
}
