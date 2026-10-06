using TourFlow.Domain.Common;

namespace TourFlow.Domain.Entities;

public class Review : BaseEntity
{
    public Guid TourPackageId { get; set; }
    public string ReviewerName { get; set; } = string.Empty;
    public string ReviewerEmail { get; set; } = string.Empty;
    public int Rating { get; set; } // 1 - 5
    public string Comment { get; set; } = string.Empty;
    public bool IsApproved { get; set; } = true;

    // Navigation property
    public TourPackage? TourPackage { get; set; }
}
