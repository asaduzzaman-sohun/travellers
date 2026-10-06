using TourFlow.Domain.Common;
using TourFlow.Domain.Enums;

namespace TourFlow.Domain.Entities;

public class TourPackage : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Summary { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Destination { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public int DurationDays { get; set; }
    public int DurationNights { get; set; }
    public decimal BasePrice { get; set; }
    public decimal? DiscountPrice { get; set; }
    public int MaxGroupSize { get; set; }
    public DifficultyLevel Difficulty { get; set; } = DifficultyLevel.Easy;
    public TourCategory Category { get; set; } = TourCategory.Adventure;
    public string CoverImageUrl { get; set; } = string.Empty;
    public List<string> GalleryImages { get; set; } = [];
    public List<string> Inclusions { get; set; } = [];
    public List<string> Exclusions { get; set; } = [];
    public bool IsActive { get; set; } = true;
    public bool IsFeatured { get; set; } = false;

    // Navigation properties
    public ICollection<ItineraryDay> ItineraryDays { get; set; } = [];
    public ICollection<TourSchedule> Schedules { get; set; } = [];
    public ICollection<Review> Reviews { get; set; } = [];
}
