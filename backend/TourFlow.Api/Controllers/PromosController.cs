using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TourFlow.Domain.Entities;
using TourFlow.Infrastructure.Data;

namespace TourFlow.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,SuperAdmin")]
public class PromosController : ControllerBase
{
    private readonly TourFlowDbContext _context;

    public PromosController(TourFlowDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllPromos(CancellationToken ct)
    {
        var promos = await _context.PromoCodes
            .AsNoTracking()
            .OrderByDescending(p => p.CreatedAtUtc)
            .Select(p => new
            {
                p.Id,
                p.Code,
                p.Description,
                p.DiscountType,
                p.DiscountValue,
                p.MaxDiscountAmount,
                p.MinimumTravelers,
                p.MaxUses,
                p.TimesUsed,
                p.ExpiresAtUtc,
                p.IsActive,
                p.ApplicableCategory,
                p.CreatedAtUtc
            })
            .ToListAsync(ct);

        return Ok(promos);
    }

    [HttpPost]
    public async Task<IActionResult> CreatePromo([FromBody] CreatePromoRequest request, CancellationToken ct)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var normalizedCode = request.Code.Trim().ToUpperInvariant();

        var exists = await _context.PromoCodes.AnyAsync(p => p.Code == normalizedCode, ct);
        if (exists)
        {
            return BadRequest(new { message = $"Promo code '{normalizedCode}' already exists." });
        }

        var promo = new PromoCode
        {
            Code = normalizedCode,
            Description = request.Description.Trim(),
            DiscountType = request.DiscountType.Trim().Equals("Flat", StringComparison.OrdinalIgnoreCase) ? "Flat" : "Percentage",
            DiscountValue = request.DiscountValue,
            MaxDiscountAmount = request.MaxDiscountAmount,
            MinimumTravelers = Math.Max(1, request.MinimumTravelers),
            MaxUses = Math.Max(1, request.MaxUses),
            ExpiresAtUtc = request.ExpiresAtUtc,
            IsActive = request.IsActive,
            ApplicableCategory = string.IsNullOrWhiteSpace(request.ApplicableCategory) ? null : request.ApplicableCategory.Trim(),
            CreatedAtUtc = DateTime.UtcNow
        };

        _context.PromoCodes.Add(promo);
        await _context.SaveChangesAsync(ct);

        return CreatedAtAction(nameof(GetAllPromos), new { id = promo.Id }, promo);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdatePromo(Guid id, [FromBody] UpdatePromoRequest request, CancellationToken ct)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var promo = await _context.PromoCodes.FirstOrDefaultAsync(p => p.Id == id, ct);
        if (promo == null) return NotFound(new { message = "Promo code not found." });

        var normalizedCode = request.Code.Trim().ToUpperInvariant();
        if (promo.Code != normalizedCode)
        {
            var exists = await _context.PromoCodes.AnyAsync(p => p.Code == normalizedCode && p.Id != id, ct);
            if (exists)
            {
                return BadRequest(new { message = $"Promo code '{normalizedCode}' is already taken by another promo." });
            }
            promo.Code = normalizedCode;
        }

        promo.Description = request.Description.Trim();
        promo.DiscountType = request.DiscountType.Trim().Equals("Flat", StringComparison.OrdinalIgnoreCase) ? "Flat" : "Percentage";
        promo.DiscountValue = request.DiscountValue;
        promo.MaxDiscountAmount = request.MaxDiscountAmount;
        promo.MinimumTravelers = Math.Max(1, request.MinimumTravelers);
        promo.MaxUses = Math.Max(1, request.MaxUses);
        promo.ExpiresAtUtc = request.ExpiresAtUtc;
        promo.IsActive = request.IsActive;
        promo.ApplicableCategory = string.IsNullOrWhiteSpace(request.ApplicableCategory) ? null : request.ApplicableCategory.Trim();
        promo.UpdatedAtUtc = DateTime.UtcNow;

        await _context.SaveChangesAsync(ct);

        return Ok(promo);
    }

    [HttpPatch("{id:guid}/toggle")]
    public async Task<IActionResult> TogglePromo(Guid id, CancellationToken ct)
    {
        var promo = await _context.PromoCodes.FirstOrDefaultAsync(p => p.Id == id, ct);
        if (promo == null) return NotFound(new { message = "Promo code not found." });

        promo.IsActive = !promo.IsActive;
        promo.UpdatedAtUtc = DateTime.UtcNow;
        await _context.SaveChangesAsync(ct);

        return Ok(new { promo.Id, promo.Code, promo.IsActive });
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeletePromo(Guid id, CancellationToken ct)
    {
        var promo = await _context.PromoCodes.FirstOrDefaultAsync(p => p.Id == id, ct);
        if (promo == null) return NotFound(new { message = "Promo code not found." });

        promo.IsDeleted = true;
        promo.UpdatedAtUtc = DateTime.UtcNow;
        await _context.SaveChangesAsync(ct);

        return NoContent();
    }

    public record CreatePromoRequest(
        [Required, MaxLength(40)] string Code,
        [Required, MaxLength(250)] string Description,
        string DiscountType = "Percentage",
        [Range(0.01, 100000)] decimal DiscountValue = 10,
        decimal? MaxDiscountAmount = null,
        int MinimumTravelers = 1,
        int MaxUses = 500,
        DateTime? ExpiresAtUtc = null,
        bool IsActive = true,
        string? ApplicableCategory = null
    );

    public record UpdatePromoRequest(
        [Required, MaxLength(40)] string Code,
        [Required, MaxLength(250)] string Description,
        string DiscountType = "Percentage",
        [Range(0.01, 100000)] decimal DiscountValue = 10,
        decimal? MaxDiscountAmount = null,
        int MinimumTravelers = 1,
        int MaxUses = 500,
        DateTime? ExpiresAtUtc = null,
        bool IsActive = true,
        string? ApplicableCategory = null
    );
}
