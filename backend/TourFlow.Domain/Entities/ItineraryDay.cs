using TourFlow.Domain.Common;

namespace TourFlow.Domain.Entities;

public class ItineraryDay : BaseEntity
{
    public Guid TourPackageId { get; set; }
    public int DayNumber { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? MealsIncluded { get; set; } // e.g. "Breakfast, Lunch, Dinner"
    public string? Accommodation { get; set; }
    public string? Location { get; set; }
    public string? ActivityMetrics { get; set; } // e.g. "Approx 5 hours walking • +350m / -200m"

    // Navigation property
    public TourPackage? TourPackage { get; set; }
}
