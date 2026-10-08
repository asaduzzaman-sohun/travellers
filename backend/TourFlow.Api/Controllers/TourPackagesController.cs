using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TourFlow.Application.Tours.Queries.GetTours;
using TourFlow.Domain.Entities;
using TourFlow.Domain.Enums;
using TourFlow.Infrastructure.Data;

namespace TourFlow.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TourPackagesController : ControllerBase
{
    private readonly TourFlowDbContext _context;
    private readonly IMediator _mediator;
    private readonly TourFlow.Application.Common.Interfaces.ICacheService _cacheService;

    public TourPackagesController(
        TourFlowDbContext context,
        IMediator mediator,
        TourFlow.Application.Common.Interfaces.ICacheService cacheService)
    {
        _context = context;
        _mediator = mediator;
        _cacheService = cacheService;
    }

    [HttpGet]
    public async Task<IActionResult> GetTours(
        [FromQuery] string? search,
        [FromQuery] TourCategory? category,
        [FromQuery] string? region,
        [FromQuery] DifficultyLevel? difficulty,
        [FromQuery] bool? featured)
    {
        var tours = await _mediator.Send(new GetToursQuery(search, category, region, difficulty, featured));
        return Ok(tours);
    }

    [HttpGet("{idOrSlug}")]
    public async Task<IActionResult> GetTourByIdOrSlug(string idOrSlug)
    {
        var cacheKey = await _cacheService.GetVersionedKeyAsync("tours", $"detail:{idOrSlug.Trim().ToLower()}");
        var cached = await _cacheService.GetAsync<TourDetailDto>(cacheKey);
        if (cached != null)
        {
            return Ok(cached);
        }

        var isGuid = Guid.TryParse(idOrSlug, out var id);

        var tour = await _context.TourPackages
            .Include(t => t.ItineraryDays.OrderBy(d => d.DayNumber))
            .Include(t => t.Schedules.OrderBy(s => s.StartDate))
            .Include(t => t.Reviews.Where(r => r.IsApproved).OrderByDescending(r => r.CreatedAtUtc))
            .FirstOrDefaultAsync(t => (isGuid && t.Id == id) || t.Slug == idOrSlug);

        if (tour == null)
        {
            return NotFound(new { message = "Tour package not found." });
        }

        var avgRating = tour.Reviews.Any() ? Math.Round(tour.Reviews.Average(r => r.Rating), 1) : 4.9;
        var totalReviews = tour.Reviews.Count;

        var detail = new TourDetailDto(
            tour.Id,
            tour.Title,
            tour.Slug,
            tour.Summary,
            tour.Description,
            tour.Destination,
            tour.Country,
            tour.Region,
            tour.StartCity,
            tour.EndCity,
            tour.IdealSeason,
            tour.DurationDays,
            tour.DurationNights,
            tour.BasePrice,
            tour.DiscountPrice,
            tour.DepositAmount,
            tour.MaxGroupSize,
            tour.Difficulty,
            tour.Category,
            tour.CoverImageUrl,
            tour.GalleryImages,
            tour.Highlights,
            tour.Inclusions,
            tour.Exclusions,
            tour.PackingTips,
            tour.IsActive,
            tour.IsFeatured,
            tour.ItineraryDays.ToList(),
            tour.Schedules.ToList(),
            tour.Reviews.ToList(),
            avgRating,
            totalReviews,
            tour.CreatedAtUtc,
            tour.UpdatedAtUtc
        );

        await _cacheService.SetAsync(cacheKey, detail, TimeSpan.FromMinutes(10));
        return Ok(detail);
    }



    [HttpGet("stats")]
    public async Task<IActionResult> GetDashboardStats()
    {
        var totalTours = await _context.TourPackages.CountAsync(t => !t.IsDeleted);
        var activeBookings = await _context.Bookings.CountAsync(b => b.Status == BookingStatus.Confirmed || b.Status == BookingStatus.Pending);
        var totalRevenue = await _context.Bookings
            .Where(b => b.PaymentStatus == PaymentStatus.Paid)
            .SumAsync(b => (decimal?)b.TotalAmount) ?? 0m;
        var upcomingDepartures = await _context.TourSchedules
            .CountAsync(s => s.StartDate >= DateTime.UtcNow);

        return Ok(new
        {
            TotalTours = totalTours,
            ActiveBookings = activeBookings,
            TotalRevenue = totalRevenue,
            UpcomingDepartures = upcomingDepartures
        });
    }

    [Authorize(Roles = "Admin,SuperAdmin")]
    [HttpPost]
    public async Task<IActionResult> CreateTour([FromBody] TourPackage tour)
    {
        if (string.IsNullOrWhiteSpace(tour.Slug))
        {
            tour.Slug = tour.Title.ToLower()
                .Replace(" ", "-")
                .Replace(":", "")
                .Replace("&", "and")
                .Replace(",", "");
        }

        _context.TourPackages.Add(tour);
        await _context.SaveChangesAsync();
        await _cacheService.InvalidateDomainAsync("tours");

        return CreatedAtAction(nameof(GetTourByIdOrSlug), new { idOrSlug = tour.Slug }, tour);
    }

    [Authorize(Roles = "Admin,SuperAdmin")]
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateTour(Guid id, [FromBody] TourPackage updatedTour)
    {
        var existing = await _context.TourPackages.FindAsync(id);
        if (existing == null)
        {
            return NotFound(new { message = "Tour package not found." });
        }

        existing.Title = updatedTour.Title;
        existing.Summary = updatedTour.Summary;
        existing.Description = updatedTour.Description;
        existing.Destination = updatedTour.Destination;
        existing.Country = updatedTour.Country;
        existing.Region = updatedTour.Region;
        existing.StartCity = updatedTour.StartCity;
        existing.EndCity = updatedTour.EndCity;
        existing.IdealSeason = updatedTour.IdealSeason;
        existing.DurationDays = updatedTour.DurationDays;
        existing.DurationNights = updatedTour.DurationNights;
        existing.BasePrice = updatedTour.BasePrice;
        existing.DiscountPrice = updatedTour.DiscountPrice;
        existing.DepositAmount = updatedTour.DepositAmount;
        existing.MaxGroupSize = updatedTour.MaxGroupSize;
        existing.Difficulty = updatedTour.Difficulty;
        existing.Category = updatedTour.Category;
        existing.CoverImageUrl = updatedTour.CoverImageUrl;
        existing.GalleryImages = updatedTour.GalleryImages;
        existing.Highlights = updatedTour.Highlights;
        existing.Inclusions = updatedTour.Inclusions;
        existing.Exclusions = updatedTour.Exclusions;
        existing.PackingTips = updatedTour.PackingTips;
        existing.IsActive = updatedTour.IsActive;
        existing.IsFeatured = updatedTour.IsFeatured;
        existing.UpdatedAtUtc = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        await _cacheService.InvalidateDomainAsync("tours");
        return Ok(existing);
    }

    [Authorize(Roles = "Admin,SuperAdmin")]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteTour(Guid id)
    {
        var tour = await _context.TourPackages.FindAsync(id);
        if (tour == null)
        {
            return NotFound(new { message = "Tour package not found." });
        }

        tour.IsDeleted = true;
        tour.IsActive = false;
        tour.UpdatedAtUtc = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        await _cacheService.InvalidateDomainAsync("tours");

        return Ok(new { message = "Tour package successfully removed." });
    }
}

public record TourDetailDto(
    Guid Id,
    string Title,
    string Slug,
    string Summary,
    string Description,
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
    List<string> GalleryImages,
    List<string> Highlights,
    List<string> Inclusions,
    List<string> Exclusions,
    List<string> PackingTips,
    bool IsActive,
    bool IsFeatured,
    List<ItineraryDay> ItineraryDays,
    List<TourSchedule> Schedules,
    List<Review> Reviews,
    double AverageRating,
    int TotalReviews,
    DateTime CreatedAtUtc,
    DateTime? UpdatedAtUtc
);
