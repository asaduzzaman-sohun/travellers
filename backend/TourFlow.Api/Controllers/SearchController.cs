using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TourFlow.Application.Common.Interfaces;
using TourFlow.Infrastructure.Data;

namespace TourFlow.Api.Controllers;

public record SearchTourHitDto(
    Guid Id,
    string Slug,
    string Title,
    string Destination,
    string Region,
    int DurationDays,
    int DurationNights,
    decimal EffectivePrice,
    string CoverImageUrl
);

public record SearchHotelHitDto(
    Guid Id,
    string Slug,
    string Name,
    string Location,
    string Tier,
    decimal PriceNumeric,
    double Rating,
    string CoverImage,
    string? RelatedTourSlug
);

public record SearchTipHitDto(
    Guid Id,
    string Slug,
    string Title,
    string Division,
    string Category,
    string ReadingTime,
    string Summary
);

public record SearchStoryHitDto(
    Guid Id,
    string Slug,
    string Title,
    string Division,
    string Category,
    string AuthorName,
    string Summary
);

public record GlobalSearchResponseDto(
    string Query,
    List<SearchTourHitDto> Tours,
    List<SearchHotelHitDto> Hotels,
    List<SearchTipHitDto> Tips,
    List<SearchStoryHitDto> Stories
);

/// <summary>
/// Cross-domain cached search endpoint powering the global Command Palette (Cmd+K / Ctrl+K).
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class SearchController : ControllerBase
{
    private readonly TourFlowDbContext _context;
    private readonly ICacheService _cache;

    public SearchController(TourFlowDbContext context, ICacheService cache)
    {
        _context = context;
        _cache = cache;
    }

    [HttpGet]
    public async Task<ActionResult<GlobalSearchResponseDto>> Search(
        [FromQuery] string? q,
        [FromQuery] int limit = 5,
        CancellationToken ct = default)
    {
        var cleanQuery = (q ?? string.Empty).Trim();
        if (cleanQuery.Length > 100)
        {
            cleanQuery = cleanQuery[..100];
        }

        var clampedLimit = Math.Clamp(limit, 1, 12);
        var lowerQ = cleanQuery.ToLowerInvariant();
        var cacheKey = await _cache.GetVersionedKeyAsync("search", $"{lowerQ}:{clampedLimit}");

        var cached = await _cache.GetAsync<GlobalSearchResponseDto>(cacheKey);
        if (cached != null)
        {
            return Ok(cached);
        }

        var hasQuery = lowerQ.Length >= 2;

        // Uses EF-translatable ToLower().Contains(...) for both PostgreSQL and InMemory unit-test compatibility.
        var toursQuery = _context.TourPackages
            .AsNoTracking()
            .Where(t => t.IsActive);

        toursQuery = hasQuery
            ? toursQuery.Where(t =>
                t.Title.ToLower().Contains(lowerQ)
                || t.Destination.ToLower().Contains(lowerQ)
                || t.Region.ToLower().Contains(lowerQ)
                || t.Summary.ToLower().Contains(lowerQ))
            : toursQuery.OrderByDescending(t => t.IsFeatured).ThenByDescending(t => t.CreatedAtUtc);

        var tours = await toursQuery
            .Take(clampedLimit)
            .Select(t => new SearchTourHitDto(
                t.Id,
                t.Slug,
                t.Title,
                t.Destination,
                t.Region,
                t.DurationDays,
                t.DurationNights,
                t.DiscountPrice ?? t.BasePrice,
                t.CoverImageUrl
            ))
            .ToListAsync(ct);

        var hotelsQuery = _context.Hotels
            .AsNoTracking()
            .Where(h => h.IsActive);

        hotelsQuery = hasQuery
            ? hotelsQuery.Where(h =>
                h.Name.ToLower().Contains(lowerQ)
                || h.Location.ToLower().Contains(lowerQ)
                || h.Place.ToLower().Contains(lowerQ)
                || h.Tier.ToLower().Contains(lowerQ))
            : hotelsQuery.OrderByDescending(h => h.Rating);

        var hotels = await hotelsQuery
            .Take(clampedLimit)
            .Select(h => new SearchHotelHitDto(
                h.Id,
                h.Slug,
                h.Name,
                h.Location,
                h.Tier,
                h.PriceNumeric,
                h.Rating,
                h.CoverImage,
                h.RelatedTourSlug
            ))
            .ToListAsync(ct);

        var tipsQuery = _context.TravelTips
            .AsNoTracking()
            .Where(t => t.IsActive);

        tipsQuery = hasQuery
            ? tipsQuery.Where(t =>
                t.Title.ToLower().Contains(lowerQ)
                || t.Division.ToLower().Contains(lowerQ)
                || t.Category.ToLower().Contains(lowerQ)
                || t.Summary.ToLower().Contains(lowerQ))
            : tipsQuery.OrderBy(t => t.Title);

        var tips = await tipsQuery
            .Take(clampedLimit)
            .Select(t => new SearchTipHitDto(
                t.Id,
                t.Slug,
                t.Title,
                t.Division,
                t.Category,
                t.ReadingTime,
                t.Summary
            ))
            .ToListAsync(ct);

        var storiesQuery = _context.BlogPosts.AsNoTracking();
        storiesQuery = hasQuery
            ? storiesQuery.Where(b =>
                b.Title.ToLower().Contains(lowerQ)
                || b.Division.ToLower().Contains(lowerQ)
                || b.Category.ToLower().Contains(lowerQ)
                || b.Summary.ToLower().Contains(lowerQ))
            : storiesQuery.OrderByDescending(b => b.IsPinned).ThenByDescending(b => b.Upvotes);

        var stories = await storiesQuery
            .Take(clampedLimit)
            .Select(b => new SearchStoryHitDto(
                b.Id,
                b.Slug,
                b.Title,
                b.Division,
                b.Category,
                b.AuthorName,
                b.Summary
            ))
            .ToListAsync(ct);

        var result = new GlobalSearchResponseDto(cleanQuery, tours, hotels, tips, stories);
        await _cache.SetAsync(cacheKey, result, TimeSpan.FromMinutes(2));

        return Ok(result);
    }
}
