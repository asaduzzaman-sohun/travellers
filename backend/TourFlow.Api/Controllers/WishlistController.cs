using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TourFlow.Domain.Entities;
using TourFlow.Infrastructure.Data;

namespace TourFlow.Api.Controllers;

public record SyncWishlistRequest(List<Guid> TourPackageIds);

public record WishlistTourDto(
    Guid Id,
    string Slug,
    string Title,
    string Destination,
    string Region,
    int DurationDays,
    int DurationNights,
    decimal BasePrice,
    decimal? DiscountPrice,
    decimal EffectivePrice,
    string CoverImageUrl,
    double AverageRating,
    DateTime SavedAtUtc
);

/// <summary>
/// Authenticated PostgreSQL wishlist persistence with idempotent localStorage merge on login.
/// </summary>
[Authorize]
[ApiController]
[Route("api/[controller]")]
public class WishlistController : ControllerBase
{
    private readonly TourFlowDbContext _context;

    public WishlistController(TourFlowDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<List<WishlistTourDto>>> GetWishlist(CancellationToken ct)
    {
        if (!TryGetCallerId(out var userId))
        {
            return Unauthorized();
        }

        var items = await QueryUserWishlistAsync(userId, ct);
        return Ok(items);
    }

    [HttpPost("toggle/{tourPackageId:guid}")]
    public async Task<IActionResult> ToggleWishlist(Guid tourPackageId, CancellationToken ct)
    {
        if (!TryGetCallerId(out var userId))
        {
            return Unauthorized();
        }

        var existing = await _context.WishlistItems
            .FirstOrDefaultAsync(w => w.UserId == userId && w.TourPackageId == tourPackageId, ct);

        if (existing != null)
        {
            _context.WishlistItems.Remove(existing);
            await _context.SaveChangesAsync(ct);
            return Ok(new { saved = false, tourPackageId });
        }

        var tourExists = await _context.TourPackages
            .AsNoTracking()
            .AnyAsync(t => t.Id == tourPackageId && t.IsActive, ct);

        if (!tourExists)
        {
            return NotFound(new { message = "Tour package not found or inactive." });
        }

        _context.WishlistItems.Add(new WishlistItem
        {
            UserId = userId,
            TourPackageId = tourPackageId
        });
        await _context.SaveChangesAsync(ct);

        return Ok(new { saved = true, tourPackageId });
    }

    [HttpPost("sync")]
    public async Task<ActionResult<List<WishlistTourDto>>> SyncWishlist(
        [FromBody] SyncWishlistRequest request,
        CancellationToken ct)
    {
        if (!TryGetCallerId(out var userId))
        {
            return Unauthorized();
        }

        var candidateIds = (request?.TourPackageIds ?? [])
            .Where(id => id != Guid.Empty)
            .Distinct()
            .Take(50)
            .ToList();

        if (candidateIds.Count > 0)
        {
            var validTourIds = await _context.TourPackages
                .AsNoTracking()
                .Where(t => candidateIds.Contains(t.Id) && t.IsActive)
                .Select(t => t.Id)
                .ToListAsync(ct);

            var existingIds = await _context.WishlistItems
                .AsNoTracking()
                .Where(w => w.UserId == userId && validTourIds.Contains(w.TourPackageId))
                .Select(w => w.TourPackageId)
                .ToHashSetAsync(ct);

            var toAdd = validTourIds
                .Where(id => !existingIds.Contains(id))
                .Select(id => new WishlistItem
                {
                    UserId = userId,
                    TourPackageId = id
                });

            _context.WishlistItems.AddRange(toAdd);
            await _context.SaveChangesAsync(ct);
        }

        var merged = await QueryUserWishlistAsync(userId, ct);
        return Ok(merged);
    }

    [HttpDelete]
    public async Task<IActionResult> ClearWishlist(CancellationToken ct)
    {
        if (!TryGetCallerId(out var userId))
        {
            return Unauthorized();
        }

        var rows = await _context.WishlistItems
            .Where(w => w.UserId == userId)
            .ToListAsync(ct);

        if (rows.Count > 0)
        {
            _context.WishlistItems.RemoveRange(rows);
            await _context.SaveChangesAsync(ct);
        }

        return NoContent();
    }

    private Task<List<WishlistTourDto>> QueryUserWishlistAsync(Guid userId, CancellationToken ct) =>
        _context.WishlistItems
            .AsNoTracking()
            .Where(w => w.UserId == userId && w.TourPackage != null && w.TourPackage.IsActive)
            .OrderByDescending(w => w.CreatedAtUtc)
            .Select(w => new WishlistTourDto(
                w.TourPackage!.Id,
                w.TourPackage.Slug,
                w.TourPackage.Title,
                w.TourPackage.Destination,
                w.TourPackage.Region,
                w.TourPackage.DurationDays,
                w.TourPackage.DurationNights,
                w.TourPackage.BasePrice,
                w.TourPackage.DiscountPrice,
                w.TourPackage.DiscountPrice ?? w.TourPackage.BasePrice,
                w.TourPackage.CoverImageUrl,
                w.TourPackage.Reviews.Average(r => (double?)r.Rating) ?? 4.9,
                w.CreatedAtUtc
            ))
            .ToListAsync(ct);

    private bool TryGetCallerId(out Guid userId)
    {
        var raw = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(raw, out userId) && userId != Guid.Empty;
    }
}
