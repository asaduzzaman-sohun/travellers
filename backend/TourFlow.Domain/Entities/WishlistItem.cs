using TourFlow.Domain.Common;

namespace TourFlow.Domain.Entities;

public class WishlistItem : BaseEntity
{
    public Guid UserId { get; set; }
    public Guid TourPackageId { get; set; }

    public User? User { get; set; }
    public TourPackage? TourPackage { get; set; }
}
