using TourFlow.Domain.Common;

namespace TourFlow.Domain.Entities;

public class Hotel : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string Place { get; set; } = string.Empty;
    public string Tier { get; set; } = "Luxury"; // "Luxury" | "Mid-Range" | "Eco/Budget"
    public double Rating { get; set; } = 4.8;
    public int ReviewsCount { get; set; }
    public decimal PriceNumeric { get; set; }
    public string PricePerNight { get; set; } = string.Empty;
    public string CoverImage { get; set; } = string.Empty;
    public List<string> GalleryImages { get; set; } = [];
    public string Description { get; set; } = string.Empty;
    public List<string> Pros { get; set; } = [];
    public List<string> Cons { get; set; } = [];
    public List<string> Amenities { get; set; } = [];
    public string RoomTypesJson { get; set; } = "[]";
    public string HowToReach { get; set; } = string.Empty;
    public string NearbyAttractionsJson { get; set; } = "[]";
    public string ReceptionPhone { get; set; } = string.Empty;
    public string ReceptionEmail { get; set; } = string.Empty;
    public string CheckInTime { get; set; } = "12:00 PM";
    public string CheckOutTime { get; set; } = "11:00 AM";
    public string? RelatedTourSlug { get; set; }
    public string? RelatedTourTitle { get; set; }
    public bool IsActive { get; set; } = true;
}
