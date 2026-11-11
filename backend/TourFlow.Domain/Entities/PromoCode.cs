using TourFlow.Domain.Common;

namespace TourFlow.Domain.Entities;

public class PromoCode : BaseEntity
{
    public string Code { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// "Percentage" or "Flat"
    /// </summary>
    public string DiscountType { get; set; } = "Percentage";

    public decimal DiscountValue { get; set; }
    public decimal? MaxDiscountAmount { get; set; }
    public int MinimumTravelers { get; set; } = 1;
    public int MaxUses { get; set; } = 500;
    public int TimesUsed { get; set; } = 0;
    public DateTime? ExpiresAtUtc { get; set; }
    public bool IsActive { get; set; } = true;
    public string? ApplicableCategory { get; set; }
}
