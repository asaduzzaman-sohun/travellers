using TourFlow.Domain.Common;

namespace TourFlow.Domain.Entities;

public class TravelTip : BaseEntity
{
    public string Slug { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string BadgeColor { get; set; } = string.Empty;
    public string ReadingTime { get; set; } = string.Empty;
    public string Division { get; set; } = string.Empty;
    public string CoverImage { get; set; } = string.Empty;
    public string Summary { get; set; } = string.Empty;
    public List<string> KeyHighlights { get; set; } = [];
    public string Overview { get; set; } = string.Empty;
    public string? CheckpostProceduresJson { get; set; }
    public string? TransportationJson { get; set; }
    public string? FieldScheduleJson { get; set; }
    public List<string> PackingList { get; set; } = [];
    public List<string> SafetyDirectives { get; set; } = [];
    public List<string> CommunityEtiquette { get; set; } = [];
    public string? EmergencyContactsJson { get; set; }
    public string? RelatedTourSlug { get; set; }
    public string? RelatedTourTitle { get; set; }
    public string? RelatedHotelId { get; set; }
    public string? RelatedHotelName { get; set; }
    public bool IsActive { get; set; } = true;
}
