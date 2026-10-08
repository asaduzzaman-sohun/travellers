using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TourFlow.Domain.Entities;
using TourFlow.Infrastructure.Data;

namespace TourFlow.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HotelsController : ControllerBase
{
    private readonly TourFlowDbContext _context;
    private readonly TourFlow.Application.Common.Interfaces.ICacheService _cacheService;

    public HotelsController(
        TourFlowDbContext context,
        TourFlow.Application.Common.Interfaces.ICacheService cacheService)
    {
        _context = context;
        _cacheService = cacheService;
    }

    [HttpGet]
    public async Task<IActionResult> GetHotels(
        [FromQuery] string? search,
        [FromQuery] string? place,
        [FromQuery] string? tier,
        [FromQuery] decimal? minPrice,
        [FromQuery] decimal? maxPrice,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 12)
    {
        if (page < 1) page = 1;
        if (pageSize < 1 || pageSize > 50) pageSize = 12;

        var subKey = $"p:{page}:ps:{pageSize}:s:{search}:pl:{place}:t:{tier}:min:{minPrice}:max:{maxPrice}";
        var cacheKey = await _cacheService.GetVersionedKeyAsync("hotels", subKey);
        var cached = await _cacheService.GetAsync<object>(cacheKey);
        if (cached != null)
        {
            return Ok(cached);
        }

        var query = _context.Hotels
            .Where(h => h.IsActive && !h.IsDeleted)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchLower = search.Trim().ToLower();
            query = query.Where(h =>
                h.Name.ToLower().Contains(searchLower) ||
                h.Location.ToLower().Contains(searchLower) ||
                h.Place.ToLower().Contains(searchLower) ||
                h.Description.ToLower().Contains(searchLower));
        }

        if (!string.IsNullOrWhiteSpace(place) && place != "All")
        {
            var placeLower = place.Trim().ToLower();
            query = query.Where(h => h.Place.ToLower() == placeLower);
        }

        if (!string.IsNullOrWhiteSpace(tier) && tier != "All")
        {
            var tierLower = tier.Trim().ToLower();
            query = query.Where(h => h.Tier.ToLower() == tierLower);
        }

        if (minPrice.HasValue)
        {
            query = query.Where(h => h.PriceNumeric >= minPrice.Value);
        }

        if (maxPrice.HasValue)
        {
            query = query.Where(h => h.PriceNumeric <= maxPrice.Value);
        }

        var totalCount = await query.CountAsync();
        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

        var items = await query
            .OrderByDescending(h => h.Rating)
            .ThenBy(h => h.PriceNumeric)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var responseData = new
        {
            items,
            totalCount,
            page,
            pageSize,
            totalPages
        };

        await _cacheService.SetAsync(cacheKey, (object)responseData, TimeSpan.FromMinutes(10));
        return Ok(responseData);
    }

    [HttpGet("{idOrSlug}")]
    public async Task<IActionResult> GetHotelByIdOrSlug(string idOrSlug)
    {
        var cacheKey = await _cacheService.GetVersionedKeyAsync("hotels", $"detail:{idOrSlug.Trim().ToLower()}");
        var cached = await _cacheService.GetAsync<Hotel>(cacheKey);
        if (cached != null)
        {
            return Ok(cached);
        }

        var isGuid = Guid.TryParse(idOrSlug, out var id);

        var hotel = await _context.Hotels
            .FirstOrDefaultAsync(h => (!h.IsDeleted && isGuid && h.Id == id) || (!h.IsDeleted && h.Slug.ToLower() == idOrSlug.ToLower()));

        if (hotel == null)
        {
            return NotFound(new { message = "Hotel not found." });
        }

        await _cacheService.SetAsync(cacheKey, hotel, TimeSpan.FromMinutes(15));
        return Ok(hotel);
    }

    [Authorize(Roles = "Admin,SuperAdmin")]
    [HttpPost]
    public async Task<IActionResult> CreateHotel([FromBody] Hotel hotel)
    {
        if (string.IsNullOrWhiteSpace(hotel.Slug))
        {
            hotel.Slug = hotel.Name.ToLower()
                .Replace(" ", "-")
                .Replace("'", "")
                .Replace("\"", "")
                .Replace(",", "");
        }

        var exists = await _context.Hotels.AnyAsync(h => h.Slug == hotel.Slug && !h.IsDeleted);
        if (exists)
        {
            hotel.Slug = $"{hotel.Slug}-{Guid.NewGuid().ToString("N")[..4]}";
        }

        _context.Hotels.Add(hotel);
        await _context.SaveChangesAsync();
        await _cacheService.InvalidateDomainAsync("hotels");

        return CreatedAtAction(nameof(GetHotelByIdOrSlug), new { idOrSlug = hotel.Slug }, hotel);
    }

    [Authorize(Roles = "Admin,SuperAdmin")]
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateHotel(Guid id, [FromBody] Hotel updated)
    {
        var existing = await _context.Hotels.FindAsync(id);
        if (existing == null || existing.IsDeleted)
        {
            return NotFound(new { message = "Hotel not found." });
        }

        existing.Name = updated.Name;
        existing.Location = updated.Location;
        existing.Place = updated.Place;
        existing.Tier = updated.Tier;
        existing.Rating = updated.Rating;
        existing.ReviewsCount = updated.ReviewsCount;
        existing.PriceNumeric = updated.PriceNumeric;
        existing.PricePerNight = updated.PricePerNight;
        existing.CoverImage = updated.CoverImage;
        existing.GalleryImages = updated.GalleryImages;
        existing.Description = updated.Description;
        existing.Pros = updated.Pros;
        existing.Cons = updated.Cons;
        existing.Amenities = updated.Amenities;
        existing.RoomTypesJson = updated.RoomTypesJson;
        existing.HowToReach = updated.HowToReach;
        existing.NearbyAttractionsJson = updated.NearbyAttractionsJson;
        existing.ReceptionPhone = updated.ReceptionPhone;
        existing.ReceptionEmail = updated.ReceptionEmail;
        existing.CheckInTime = updated.CheckInTime;
        existing.CheckOutTime = updated.CheckOutTime;
        existing.RelatedTourSlug = updated.RelatedTourSlug;
        existing.RelatedTourTitle = updated.RelatedTourTitle;
        existing.IsActive = updated.IsActive;
        existing.UpdatedAtUtc = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        await _cacheService.InvalidateDomainAsync("hotels");
        return Ok(existing);
    }

    [Authorize(Roles = "Admin,SuperAdmin")]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteHotel(Guid id)
    {
        var hotel = await _context.Hotels.FindAsync(id);
        if (hotel == null || hotel.IsDeleted)
        {
            return NotFound(new { message = "Hotel not found." });
        }

        hotel.IsDeleted = true;
        hotel.IsActive = false;
        hotel.UpdatedAtUtc = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        await _cacheService.InvalidateDomainAsync("hotels");

        return Ok(new { message = "Hotel removed successfully." });
    }
}
