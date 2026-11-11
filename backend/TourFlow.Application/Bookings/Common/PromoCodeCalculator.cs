using TourFlow.Domain.Entities;

namespace TourFlow.Application.Bookings.Common;

public record PromoEvaluationResult(
    bool IsValid,
    string? NormalizedCode,
    decimal GrossTotal,
    decimal DiscountAmount,
    decimal FinalTotal,
    string Message,
    string? Description = null,
    string? DiscountType = null,
    decimal? DiscountValue = null
);

public static class PromoCodeCalculator
{
    public static decimal ComputeUnitPrice(TourSchedule schedule)
    {
        var unitPrice = schedule.TourPackage?.DiscountPrice ?? schedule.PricePerPerson;
        if (unitPrice <= 0 && schedule.TourPackage != null)
        {
            unitPrice = schedule.TourPackage.BasePrice;
        }
        return unitPrice;
    }

    public static PromoEvaluationResult Evaluate(
        PromoCode? promo,
        decimal grossTotal,
        int numberOfTravelers,
        string? tourCategory,
        DateTime? utcNow = null)
    {
        var now = utcNow ?? DateTime.UtcNow;

        if (promo == null)
        {
            return new PromoEvaluationResult(false, null, grossTotal, 0m, grossTotal, "Promo code not found.");
        }

        if (!promo.IsActive)
        {
            return new PromoEvaluationResult(false, promo.Code, grossTotal, 0m, grossTotal, "This promo code is no longer active.");
        }

        if (promo.ExpiresAtUtc.HasValue && promo.ExpiresAtUtc.Value < now)
        {
            return new PromoEvaluationResult(false, promo.Code, grossTotal, 0m, grossTotal, "This promo code has expired.");
        }

        if (promo.TimesUsed >= promo.MaxUses)
        {
            return new PromoEvaluationResult(false, promo.Code, grossTotal, 0m, grossTotal, "This promo code has reached its usage limit.");
        }

        if (numberOfTravelers < promo.MinimumTravelers)
        {
            return new PromoEvaluationResult(
                false,
                promo.Code,
                grossTotal,
                0m,
                grossTotal,
                $"Code {promo.Code} requires at least {promo.MinimumTravelers} travelers.");
        }

        if (!string.IsNullOrWhiteSpace(promo.ApplicableCategory) &&
            !string.Equals(promo.ApplicableCategory, tourCategory, StringComparison.OrdinalIgnoreCase))
        {
            return new PromoEvaluationResult(
                false,
                promo.Code,
                grossTotal,
                0m,
                grossTotal,
                $"Code {promo.Code} applies only to {promo.ApplicableCategory} tours.");
        }

        decimal rawDiscount = string.Equals(promo.DiscountType, "Flat", StringComparison.OrdinalIgnoreCase)
            ? promo.DiscountValue
            : grossTotal * (promo.DiscountValue / 100m);

        if (promo.MaxDiscountAmount.HasValue && rawDiscount > promo.MaxDiscountAmount.Value)
        {
            rawDiscount = promo.MaxDiscountAmount.Value;
        }

        var discount = Math.Clamp(Math.Round(rawDiscount, 2, MidpointRounding.AwayFromZero), 0m, grossTotal);
        var finalTotal = Math.Max(0m, grossTotal - discount);

        return new PromoEvaluationResult(
            true,
            promo.Code,
            grossTotal,
            discount,
            finalTotal,
            $"Applied {promo.Code}: saved {discount:N0} BDT!",
            promo.Description,
            promo.DiscountType,
            promo.DiscountValue);
    }
}
