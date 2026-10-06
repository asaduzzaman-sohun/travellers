using TourFlow.Domain.Common;

namespace TourFlow.Domain.Entities;

public class ItineraryDay : BaseEntity
{
    public Guid TourPackageId { get; set; }
    public int DayNumber { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? MealsIncluded { get; set; }
    public string? Accommodation { get; set; }
    public string? Location { get; set; }

    // Navigation property
    public TourPackage? TourPackage { get; set; }
}
