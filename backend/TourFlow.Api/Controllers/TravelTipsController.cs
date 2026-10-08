using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TourFlow.Domain.Entities;
using TourFlow.Infrastructure.Data;

namespace TourFlow.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TravelTipsController : ControllerBase
{
    private readonly TourFlowDbContext _context;
    private readonly TourFlow.Application.Common.Interfaces.ICacheService _cacheService;

    public TravelTipsController(
        TourFlowDbContext context,
        TourFlow.Application.Common.Interfaces.ICacheService cacheService)
    {
        _context = context;
        _cacheService = cacheService;
    }

    [HttpGet]
    public async Task<IActionResult> GetTravelTips(
        [FromQuery] string? search,
        [FromQuery] string? category,
        [FromQuery] string? division,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 12)
    {
        if (page < 1) page = 1;
        if (pageSize < 1 || pageSize > 50) pageSize = 12;

        var subKey = $"p:{page}:ps:{pageSize}:s:{search}:c:{category}:d:{division}";
        var cacheKey = await _cacheService.GetVersionedKeyAsync("tips", subKey);
        var cached = await _cacheService.GetAsync<object>(cacheKey);
        if (cached != null)
        {
            return Ok(cached);
        }

        var query = _context.TravelTips
            .Where(t => t.IsActive && !t.IsDeleted)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchLower = search.Trim().ToLower();
            query = query.Where(t =>
                t.Title.ToLower().Contains(searchLower) ||
                t.Summary.ToLower().Contains(searchLower) ||
                t.Category.ToLower().Contains(searchLower) ||
                t.Division.ToLower().Contains(searchLower));
        }

        if (!string.IsNullOrWhiteSpace(category) && category != "All")
        {
            var catLower = category.Trim().ToLower();
            query = query.Where(t => t.Category.ToLower() == catLower);
        }

        if (!string.IsNullOrWhiteSpace(division) && division != "All")
        {
            var divLower = division.Trim().ToLower();
            query = query.Where(t => t.Division.ToLower() == divLower);
        }

        var totalCount = await query.CountAsync();
        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

        var items = await query
            .OrderByDescending(t => t.CreatedAtUtc)
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

        await _cacheService.SetAsync(cacheKey, (object)responseData, TimeSpan.FromMinutes(15));
        return Ok(responseData);
    }

    [HttpGet("{idOrSlug}")]
    public async Task<IActionResult> GetTravelTipByIdOrSlug(string idOrSlug)
    {
        var cacheKey = await _cacheService.GetVersionedKeyAsync("tips", $"detail:{idOrSlug.Trim().ToLower()}");
        var cached = await _cacheService.GetAsync<TravelTip>(cacheKey);
        if (cached != null)
        {
            return Ok(cached);
        }

        var isGuid = Guid.TryParse(idOrSlug, out var id);

        var tip = await _context.TravelTips
            .FirstOrDefaultAsync(t => (!t.IsDeleted && isGuid && t.Id == id) || (!t.IsDeleted && t.Slug.ToLower() == idOrSlug.ToLower()));

        if (tip == null)
        {
            return NotFound(new { message = "Travel tip not found." });
        }

        await _cacheService.SetAsync(cacheKey, tip, TimeSpan.FromMinutes(20));
        return Ok(tip);
    }

    [Authorize(Roles = "Admin,SuperAdmin")]
    [HttpPost]
    public async Task<IActionResult> CreateTravelTip([FromBody] TravelTip tip)
    {
        if (string.IsNullOrWhiteSpace(tip.Slug))
        {
            tip.Slug = tip.Title.ToLower()
                .Replace(" ", "-")
                .Replace("'", "")
                .Replace("\"", "")
                .Replace(",", "");
        }

        var exists = await _context.TravelTips.AnyAsync(t => t.Slug == tip.Slug && !t.IsDeleted);
        if (exists)
        {
            tip.Slug = $"{tip.Slug}-{Guid.NewGuid().ToString("N")[..4]}";
        }

        _context.TravelTips.Add(tip);
        await _context.SaveChangesAsync();
        await _cacheService.InvalidateDomainAsync("tips");

        return CreatedAtAction(nameof(GetTravelTipByIdOrSlug), new { idOrSlug = tip.Slug }, tip);
    }

    [Authorize(Roles = "Admin,SuperAdmin")]
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateTravelTip(Guid id, [FromBody] TravelTip updated)
    {
        var existing = await _context.TravelTips.FindAsync(id);
        if (existing == null || existing.IsDeleted)
        {
            return NotFound(new { message = "Travel tip not found." });
        }

        existing.Title = updated.Title;
        existing.Category = updated.Category;
        existing.BadgeColor = updated.BadgeColor;
        existing.ReadingTime = updated.ReadingTime;
        existing.Division = updated.Division;
        existing.CoverImage = updated.CoverImage;
        existing.Summary = updated.Summary;
        existing.KeyHighlights = updated.KeyHighlights;
        existing.Overview = updated.Overview;
        existing.CheckpostProceduresJson = updated.CheckpostProceduresJson;
        existing.TransportationJson = updated.TransportationJson;
        existing.FieldScheduleJson = updated.FieldScheduleJson;
        existing.PackingList = updated.PackingList;
        existing.SafetyDirectives = updated.SafetyDirectives;
        existing.CommunityEtiquette = updated.CommunityEtiquette;
        existing.EmergencyContactsJson = updated.EmergencyContactsJson;
        existing.RelatedTourSlug = updated.RelatedTourSlug;
        existing.RelatedTourTitle = updated.RelatedTourTitle;
        existing.RelatedHotelId = updated.RelatedHotelId;
        existing.RelatedHotelName = updated.RelatedHotelName;
        existing.IsActive = updated.IsActive;
        existing.UpdatedAtUtc = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        await _cacheService.InvalidateDomainAsync("tips");
        return Ok(existing);
    }

    [Authorize(Roles = "Admin,SuperAdmin")]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteTravelTip(Guid id)
    {
        var tip = await _context.TravelTips.FindAsync(id);
        if (tip == null || tip.IsDeleted)
        {
            return NotFound(new { message = "Travel tip not found." });
        }

        tip.IsDeleted = true;
        tip.IsActive = false;
        tip.UpdatedAtUtc = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        await _cacheService.InvalidateDomainAsync("tips");

        return Ok(new { message = "Travel tip removed successfully." });
    }
}
