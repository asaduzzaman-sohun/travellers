using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TourFlow.Domain.Entities;
using TourFlow.Domain.Enums;
using TourFlow.Infrastructure.Data;

namespace TourFlow.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TourPackagesController : ControllerBase
{
    private readonly TourFlowDbContext _context;

    public TourPackagesController(TourFlowDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetTours(
        [FromQuery] string? search,
        [FromQuery] TourCategory? category,
        [FromQuery] string? region,
        [FromQuery] DifficultyLevel? difficulty,
        [FromQuery] bool? featured)
    {
        var query = _context.TourPackages
            .Include(t => t.Schedules)
            .Include(t => t.Reviews)
            .Where(t => t.IsActive && !t.IsDeleted)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchLower = search.Trim().ToLower();
            query = query.Where(t => t.Title.ToLower().Contains(searchLower) ||
                                     t.Destination.ToLower().Contains(searchLower) ||
                                     t.Country.ToLower().Contains(searchLower) ||
                                     t.Region.ToLower().Contains(searchLower));
        }

        if (category.HasValue)
        {
            query = query.Where(t => t.Category == category.Value);
        }

        if (difficulty.HasValue)
        {
            query = query.Where(t => t.Difficulty == difficulty.Value);
        }

        if (!string.IsNullOrWhiteSpace(region) && region != "All")
        {
            query = query.Where(t => t.Region.ToLower() == region.ToLower());
        }

        if (featured.HasValue && featured.Value)
        {
            query = query.Where(t => t.IsFeatured);
        }

        var tours = await query
            .OrderByDescending(t => t.IsFeatured)
            .ThenByDescending(t => t.CreatedAtUtc)
            .Select(t => new
            {
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
                AverageRating = t.Reviews.Any() ? Math.Round(t.Reviews.Average(r => r.Rating), 1) : 5.0,
                TotalReviews = t.Reviews.Count,
                UpcomingDepartures = t.Schedules
                    .Where(s => s.StartDate >= DateTime.UtcNow && (s.TotalSeats - s.BookedSeats) > 0)
                    .OrderBy(s => s.StartDate)
                    .Count()
            })
            .ToListAsync();

        return Ok(tours);
    }

    [HttpGet("{idOrSlug}")]
    public async Task<IActionResult> GetTourByIdOrSlug(string idOrSlug)
    {
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

        return Ok(tour);
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

        return CreatedAtAction(nameof(GetTourByIdOrSlug), new { idOrSlug = tour.Slug }, tour);
    }
}
