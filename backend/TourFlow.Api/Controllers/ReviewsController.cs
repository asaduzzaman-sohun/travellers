using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TourFlow.Api.DTOs;
using TourFlow.Domain.Entities;
using TourFlow.Domain.Enums;
using TourFlow.Infrastructure.Data;

namespace TourFlow.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReviewsController : ControllerBase
{
    private readonly TourFlowDbContext _context;

    public ReviewsController(TourFlowDbContext context)
    {
        _context = context;
    }

    [HttpGet("tour/{tourId:guid}")]
    public async Task<IActionResult> GetTourReviews(Guid tourId)
    {
        var reviews = await _context.Reviews
            .Where(r => r.TourPackageId == tourId && r.IsApproved && !r.IsDeleted)
            .OrderByDescending(r => r.CreatedAtUtc)
            .Select(r => new ReviewResponseDto
            {
                Id = r.Id,
                TourPackageId = r.TourPackageId,
                UserId = r.UserId,
                ReviewerName = r.ReviewerName,
                ReviewerLocation = r.ReviewerLocation,
                ReviewerEmail = r.ReviewerEmail,
                Rating = r.Rating,
                Title = r.Title,
                Comment = r.Comment,
                TripDateFormatted = r.TripDateFormatted,
                IsVerifiedBooking = r.IsVerifiedBooking,
                IsApproved = r.IsApproved,
                CreatedAtUtc = r.CreatedAtUtc
            })
            .ToListAsync();

        return Ok(reviews);
    }

    [Authorize]
    [HttpPost("tour/{tourId:guid}")]
    public async Task<IActionResult> CreateReview(Guid tourId, [FromBody] CreateReviewRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var tour = await _context.TourPackages
            .FirstOrDefaultAsync(t => t.Id == tourId && !t.IsDeleted);

        if (tour == null)
        {
            return NotFound(new { message = "Tour package not found." });
        }

        var emailClaim = User.FindFirstValue(ClaimTypes.Email);
        var subClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var nameClaim = User.FindFirstValue(ClaimTypes.Name);

        Guid? userId = null;
        if (Guid.TryParse(subClaim, out var parsedGuid))
        {
            userId = parsedGuid;
        }

        User? dbUser = null;
        if (userId.HasValue)
        {
            dbUser = await _context.Users.FindAsync(userId.Value);
        }
        else if (!string.IsNullOrEmpty(emailClaim))
        {
            dbUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == emailClaim);
            userId = dbUser?.Id;
        }

        var reviewerEmail = dbUser?.Email ?? emailClaim ?? "anonymous@traveller.com";
        var reviewerName = dbUser?.FullName ?? nameClaim ?? "Fellow Traveler";
        var reviewerLocation = request.ReviewerLocation ?? dbUser?.HomeCity ?? "Dhaka, Bangladesh";
        var tripDate = request.TripDateFormatted ?? $"Traveled {DateTime.UtcNow:MMMM yyyy}";

        // Verify if user actually booked this tour package
        var hasConfirmedBooking = await _context.Bookings.AnyAsync(b =>
            b.TourPackageId == tourId &&
            !b.IsDeleted &&
            (b.Status == BookingStatus.Confirmed || b.PaymentStatus == PaymentStatus.Paid) &&
            ((userId.HasValue && b.UserId == userId) || b.CustomerEmail.ToLower() == reviewerEmail.ToLower()));

        var review = new Review
        {
            Id = Guid.NewGuid(),
            TourPackageId = tourId,
            UserId = userId,
            ReviewerName = reviewerName,
            ReviewerLocation = reviewerLocation,
            ReviewerEmail = reviewerEmail,
            Rating = request.Rating,
            Title = request.Title,
            Comment = request.Comment,
            TripDateFormatted = tripDate,
            IsVerifiedBooking = hasConfirmedBooking,
            IsApproved = true, // Approved immediately, admins can unapprove if abusive
            CreatedAtUtc = DateTime.UtcNow
        };

        _context.Reviews.Add(review);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetTourReviews), new { tourId }, new ReviewResponseDto
        {
            Id = review.Id,
            TourPackageId = review.TourPackageId,
            UserId = review.UserId,
            ReviewerName = review.ReviewerName,
            ReviewerLocation = review.ReviewerLocation,
            ReviewerEmail = review.ReviewerEmail,
            Rating = review.Rating,
            Title = review.Title,
            Comment = review.Comment,
            TripDateFormatted = review.TripDateFormatted,
            IsVerifiedBooking = review.IsVerifiedBooking,
            IsApproved = review.IsApproved,
            CreatedAtUtc = review.CreatedAtUtc
        });
    }

    [Authorize(Roles = "Admin,SuperAdmin")]
    [HttpGet("pending")]
    public async Task<IActionResult> GetPendingReviews()
    {
        var pendingReviews = await _context.Reviews
            .Include(r => r.TourPackage)
            .Where(r => !r.IsApproved && !r.IsDeleted)
            .OrderByDescending(r => r.CreatedAtUtc)
            .Select(r => new
            {
                r.Id,
                r.TourPackageId,
                TourTitle = r.TourPackage != null ? r.TourPackage.Title : "Unknown",
                r.ReviewerName,
                r.ReviewerEmail,
                r.Rating,
                r.Title,
                r.Comment,
                r.TripDateFormatted,
                r.IsVerifiedBooking,
                r.CreatedAtUtc
            })
            .ToListAsync();

        return Ok(pendingReviews);
    }

    [Authorize(Roles = "Admin,SuperAdmin")]
    [HttpPatch("{id:guid}/approve")]
    public async Task<IActionResult> ApproveReview(Guid id)
    {
        var review = await _context.Reviews.FindAsync(id);
        if (review == null || review.IsDeleted)
        {
            return NotFound(new { message = "Review not found." });
        }

        review.IsApproved = true;
        review.UpdatedAtUtc = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Review approved successfully." });
    }

    [Authorize]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteReview(Guid id)
    {
        var review = await _context.Reviews.FindAsync(id);
        if (review == null || review.IsDeleted)
        {
            return NotFound(new { message = "Review not found." });
        }

        var userRole = User.FindFirstValue(ClaimTypes.Role);
        var userEmail = User.FindFirstValue(ClaimTypes.Email);
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);

        var isAdmin = userRole == "Admin" || userRole == "SuperAdmin";
        var isOwner = (review.UserId.HasValue && review.UserId.ToString() == userIdStr) ||
                      (!string.IsNullOrEmpty(userEmail) && review.ReviewerEmail.Equals(userEmail, StringComparison.OrdinalIgnoreCase));

        if (!isAdmin && !isOwner)
        {
            return Forbid();
        }

        review.IsDeleted = true;
        review.UpdatedAtUtc = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Review deleted successfully." });
    }
}
