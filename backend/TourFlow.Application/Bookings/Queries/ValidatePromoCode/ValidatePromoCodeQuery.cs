using MediatR;
using Microsoft.EntityFrameworkCore;
using TourFlow.Application.Bookings.Common;
using TourFlow.Application.Common.Interfaces;

namespace TourFlow.Application.Bookings.Queries.ValidatePromoCode;

public record ValidatePromoCodeQuery(
    Guid TourScheduleId,
    int NumberOfTravelers,
    string Code
) : IRequest<PromoEvaluationResult>;

public class ValidatePromoCodeQueryHandler : IRequestHandler<ValidatePromoCodeQuery, PromoEvaluationResult>
{
    private readonly ITourFlowDbContext _context;

    public ValidatePromoCodeQueryHandler(ITourFlowDbContext context)
    {
        _context = context;
    }

    public async Task<PromoEvaluationResult> Handle(ValidatePromoCodeQuery request, CancellationToken cancellationToken)
    {
        var schedule = await _context.TourSchedules
            .Include(s => s.TourPackage)
            .FirstOrDefaultAsync(s => s.Id == request.TourScheduleId, cancellationToken);

        if (schedule == null || schedule.TourPackage == null)
        {
            throw new KeyNotFoundException("Tour schedule not found.");
        }

        var unitPrice = PromoCodeCalculator.ComputeUnitPrice(schedule);
        var travelers = Math.Max(1, request.NumberOfTravelers);
        var grossTotal = unitPrice * travelers;

        var normalizedCode = request.Code.Trim().ToUpperInvariant();
        if (string.IsNullOrWhiteSpace(normalizedCode))
        {
            return new PromoEvaluationResult(false, null, grossTotal, 0m, grossTotal, "Please enter a promo code.");
        }

        var promo = await _context.PromoCodes
            .FirstOrDefaultAsync(p => p.Code.ToUpper() == normalizedCode, cancellationToken);

        return PromoCodeCalculator.Evaluate(
            promo,
            grossTotal,
            travelers,
            schedule.TourPackage.Category.ToString());
    }
}
