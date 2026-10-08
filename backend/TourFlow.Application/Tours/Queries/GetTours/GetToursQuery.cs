using MediatR;
using Microsoft.EntityFrameworkCore;
using TourFlow.Application.Common.Interfaces;
using TourFlow.Domain.Enums;

namespace TourFlow.Application.Tours.Queries.GetTours;

public record TourSummaryDto(
    Guid Id,
    string Title,
    string Slug,
    string Summary,
    string Destination,
    string Country,
    string Region,
    string StartCity,
    string EndCity,
    string IdealSeason,
    int DurationDays,
    int DurationNights,
    decimal BasePrice,
    decimal? DiscountPrice,
    decimal DepositAmount,
    int MaxGroupSize,
    DifficultyLevel Difficulty,
    TourCategory Category,
    string CoverImageUrl,
    List<string> Highlights,
    bool IsFeatured,
    double AverageRating,
    int TotalReviews,
    int UpcomingDepartures
);

public record GetToursQuery(
    string? Search = null,
    TourCategory? Category = null,
    string? Region = null,
    DifficultyLevel? Difficulty = null,
    bool? Featured = null
) : IRequest<List<TourSummaryDto>>;

public class GetToursQueryHandler : IRequestHandler<GetToursQuery, List<TourSummaryDto>>
{
    private readonly ITourFlowDbContext _context;
    private readonly ICacheService _cacheService;

    public GetToursQueryHandler(ITourFlowDbContext context, ICacheService cacheService)
    {
        _context = context;
        _cacheService = cacheService;
    }

    public async Task<List<TourSummaryDto>> Handle(GetToursQuery request, CancellationToken cancellationToken)
    {
        var subKey = $"s:{request.Search}:c:{request.Category}:r:{request.Region}:d:{request.Difficulty}:f:{request.Featured}";
        var cacheKey = await _cacheService.GetVersionedKeyAsync("tours", subKey);

        var cached = await _cacheService.GetAsync<List<TourSummaryDto>>(cacheKey);
        if (cached != null)
        {
            return cached;
        }

        var query = _context.TourPackages
            .Include(t => t.Schedules)
            .Include(t => t.Reviews)
            .Where(t => t.IsActive && !t.IsDeleted)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var searchLower = request.Search.Trim().ToLower();
            query = query.Where(t => t.Title.ToLower().Contains(searchLower) ||
                                     t.Destination.ToLower().Contains(searchLower) ||
                                     t.Country.ToLower().Contains(searchLower) ||
                                     t.Region.ToLower().Contains(searchLower));
        }

        if (request.Category.HasValue)
        {
            query = query.Where(t => t.Category == request.Category.Value);
        }

        if (request.Difficulty.HasValue)
        {
            query = query.Where(t => t.Difficulty == request.Difficulty.Value);
        }

        if (!string.IsNullOrWhiteSpace(request.Region) && request.Region != "All")
        {
            query = query.Where(t => t.Region.ToLower() == request.Region.ToLower());
        }

        if (request.Featured.HasValue && request.Featured.Value)
        {
            query = query.Where(t => t.IsFeatured);
        }

        var result = await query
            .OrderByDescending(t => t.IsFeatured)
            .ThenByDescending(t => t.CreatedAtUtc)
            .Select(t => new TourSummaryDto(
                t.Id,
                t.Title,
                t.Slug,
                t.Summary,
                t.Destination,
                t.Country,
                t.Region,
                t.StartCity,
                t.EndCity,
                t.IdealSeason,
                t.DurationDays,
                t.DurationNights,
                t.BasePrice,
                t.DiscountPrice,
                t.DepositAmount,
                t.MaxGroupSize,
                t.Difficulty,
                t.Category,
                t.CoverImageUrl,
                t.Highlights,
                t.IsFeatured,
                t.Reviews.Any() ? Math.Round(t.Reviews.Average(r => r.Rating), 1) : 5.0,
                t.Reviews.Count,
                t.Schedules
                    .Where(s => s.StartDate >= DateTime.UtcNow && (s.TotalSeats - s.BookedSeats) > 0)
                    .OrderBy(s => s.StartDate)
                    .Count()
            ))
            .ToListAsync(cancellationToken);

        await _cacheService.SetAsync(cacheKey, result, TimeSpan.FromMinutes(10));
        return result;
    }
}
