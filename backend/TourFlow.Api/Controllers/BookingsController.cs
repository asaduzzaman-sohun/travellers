using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using MediatR;
using TourFlow.Api.Services;
using TourFlow.Application.Bookings.Commands.CreateBooking;
using TourFlow.Application.Bookings.Queries.ValidatePromoCode;
using TourFlow.Domain.Entities;
using TourFlow.Domain.Enums;
using TourFlow.Infrastructure.Data;

namespace TourFlow.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BookingsController : ControllerBase
{
    private readonly TourFlowDbContext _context;
    private readonly IMediator _mediator;
    private readonly IRealtimeNotifier _notifier;

    public BookingsController(TourFlowDbContext context, IMediator mediator, IRealtimeNotifier notifier)
    {
        _context = context;
        _mediator = mediator;
        _notifier = notifier;
    }

    [Authorize]
    [HttpGet]
    public async Task<IActionResult> GetBookings()
    {
        var callerRole = User.FindFirstValue(ClaimTypes.Role);
        var callerIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var callerEmail = User.FindFirstValue(ClaimTypes.Email);
        Guid.TryParse(callerIdStr, out var callerId);

        var query = _context.Bookings
            .Include(b => b.TourPackage)
            .Include(b => b.TourSchedule)
            .Include(b => b.Travelers)
            .AsNoTracking()
            .AsQueryable();

        // If not Admin/SuperAdmin, strictly return only caller's own bookings
        if (callerRole != "Admin" && callerRole != "SuperAdmin")
        {
            query = query.Where(b => (callerId != Guid.Empty && b.UserId == callerId) ||
                                     (!string.IsNullOrEmpty(callerEmail) && b.CustomerEmail.ToLower() == callerEmail.ToLower()));
        }

        var bookings = await query
            .OrderByDescending(b => b.CreatedAtUtc)
            .Select(b => new
            {
                b.Id,
                b.BookingReference,
                TourPackageId = b.TourPackageId,
                TourTitle = b.TourPackage != null ? b.TourPackage.Title : "N/A",
                Destination = b.TourPackage != null ? b.TourPackage.Destination : "N/A",
                DepartureDate = b.TourSchedule != null ? b.TourSchedule.StartDate : DateTime.MinValue,
                ReturnDate = b.TourSchedule != null ? b.TourSchedule.EndDate : DateTime.MinValue,
                b.CustomerName,
                b.CustomerEmail,
                b.CustomerPhone,
                b.NumberOfTravelers,
                b.UnitPrice,
                b.TotalAmount,
                b.DepositPaid,
                b.BalanceRemaining,
                b.Status,
                b.PaymentStatus,
                b.DietaryRequirements,
                b.SpecialRequests,
                b.EmergencyContactName,
                b.EmergencyContactPhone,
                b.CreatedAtUtc,
                Travelers = b.Travelers.Select(t => new
                {
                    t.FullName,
                    t.Email,
                    t.PassportNumber,
                    t.Nationality
                })
            })
            .ToListAsync();

        return Ok(bookings);
    }

    [HttpGet("reference/{refCode}")]
    public async Task<IActionResult> GetBookingByReference(string refCode, [FromQuery] string? email)
    {
        var isAuthenticated = User.Identity?.IsAuthenticated == true;
        var isAdmin = User.IsInRole("Admin") || User.IsInRole("SuperAdmin");

        // Prevent unauthenticated reference enumeration; anonymous voucher lookup must match both refCode and email.
        if (!isAuthenticated && string.IsNullOrWhiteSpace(email))
        {
            return BadRequest(new { message = "Email address is required to verify a booking reference." });
        }

        var query = _context.Bookings
            .AsNoTracking()
            .Include(b => b.TourPackage)
            .Include(b => b.TourSchedule)
            .Include(b => b.Travelers)
            .Where(b => b.BookingReference.ToUpper() == refCode.ToUpper());

        if (!string.IsNullOrWhiteSpace(email))
        {
            query = query.Where(b => b.CustomerEmail.ToLower() == email.Trim().ToLower());
        }

        var booking = await query.FirstOrDefaultAsync();

        if (booking == null)
        {
            return NotFound(new { message = "Reservation record not found. Please check your reference code and email." });
        }

        if (isAuthenticated && !isAdmin)
        {
            var callerEmail = User.FindFirstValue(ClaimTypes.Email)?.Trim();
            var callerIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            Guid.TryParse(callerIdStr, out var callerId);

            var ownsBooking = (callerId != Guid.Empty && booking.UserId == callerId)
                || (!string.IsNullOrWhiteSpace(callerEmail) && string.Equals(booking.CustomerEmail, callerEmail, StringComparison.OrdinalIgnoreCase));

            if (!ownsBooking)
            {
                return Forbid();
            }
        }

        // Redact sensitive passenger documents on unauthenticated lookups while returning full voucher details to owners/admins.
        if (!isAuthenticated)
        {
            foreach (var traveler in booking.Travelers)
            {
                traveler.PassportNumber = null;
                traveler.DateOfBirth = null;
                traveler.Email = null;
                traveler.PhoneNumber = null;
            }
        }

        return Ok(booking);
    }

    public record CreateBookingRequest(
        Guid TourPackageId,
        Guid TourScheduleId,
        string CustomerName,
        string CustomerEmail,
        string CustomerPhone,
        int NumberOfTravelers,
        string? DietaryRequirements,
        string? SpecialRequests,
        string? EmergencyContactName,
        string? EmergencyContactPhone,
        bool PayDepositOnly,
        List<CreateTravelerRequest>? Travelers,
        string? PromoCode = null
    );

    public record CreateTravelerRequest(
        string FullName,
        string? Email,
        string? PhoneNumber,
        string? PassportNumber,
        string? Nationality
    );

    public record ValidatePromoRequest(
        Guid TourScheduleId,
        int NumberOfTravelers,
        string PromoCode
    );

    [AllowAnonymous]
    [HttpGet("promos")]
    public async Task<IActionResult> GetActivePromos()
    {
        var now = DateTime.UtcNow;
        var promos = await _context.PromoCodes
            .Where(p => p.IsActive && (!p.ExpiresAtUtc.HasValue || p.ExpiresAtUtc > now) && p.TimesUsed < p.MaxUses)
            .OrderByDescending(p => p.DiscountValue)
            .Select(p => new
            {
                p.Code,
                p.Description,
                p.DiscountType,
                p.DiscountValue,
                p.MaxDiscountAmount,
                p.MinimumTravelers,
                p.ApplicableCategory
            })
            .ToListAsync();

        return Ok(promos);
    }

    [AllowAnonymous]
    [EnableRateLimiting("booking")]
    [HttpPost("validate-promo")]
    public async Task<IActionResult> ValidatePromo([FromBody] ValidatePromoRequest request)
    {
        var result = await _mediator.Send(new ValidatePromoCodeQuery(
            request.TourScheduleId,
            request.NumberOfTravelers,
            request.PromoCode ?? string.Empty
        ));

        return result.IsValid ? Ok(result) : BadRequest(result);
    }

    [HttpPost]
    [EnableRateLimiting("booking")]
    public async Task<IActionResult> CreateBooking([FromBody] CreateBookingRequest request)
    {
        var callerIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        Guid? callerId = Guid.TryParse(callerIdStr, out var id) ? id : null;
        var callerEmail = User.FindFirstValue(ClaimTypes.Email);

        var command = new CreateBookingCommand(
            request.TourScheduleId,
            request.CustomerName,
            request.CustomerEmail,
            request.CustomerPhone,
            request.NumberOfTravelers,
            request.DietaryRequirements,
            request.SpecialRequests,
            request.EmergencyContactName,
            request.EmergencyContactPhone,
            "bkash",
            request.Travelers?.Select(t => new TravelerInputDto(t.FullName, 30, "Other", t.Email, t.PhoneNumber, t.PassportNumber, t.Nationality)).ToList(),
            callerId,
            callerEmail,
            request.PayDepositOnly,
            request.PromoCode
        );

        var result = await _mediator.Send(command);

        if (!string.IsNullOrWhiteSpace(command.CustomerEmail))
        {
            await _notifier.PublishNotificationAsync(new RealtimeNotificationPublishRequest(
                TargetUserId: command.CallerUserId,
                TargetEmail: command.CustomerEmail,
                TargetRole: null,
                Category: "booking",
                Title: $"Booking Confirmed · {result.BookingReference}",
                Message: $"Your reservation for {result.TourTitle} ({result.NumberOfTravelers} guest{(result.NumberOfTravelers == 1 ? "" : "s")}) is {result.Status}.",
                ActionUrl: "/profile"
            ));
        }

        await _notifier.PublishNotificationAsync(new RealtimeNotificationPublishRequest(
            TargetUserId: null,
            TargetEmail: null,
            TargetRole: "Admin",
            Category: "booking",
            Title: $"New Booking · {result.BookingReference}",
            Message: $"{command.CustomerName} booked {result.TourTitle} ({result.NumberOfTravelers} guest{(result.NumberOfTravelers == 1 ? "" : "s")}, BDT {result.DepositPaid:N0} paid).",
            ActionUrl: "/admin"
        ));

        return CreatedAtAction(nameof(GetBookingByReference), new { refCode = result.BookingReference }, result);
    }

    [Authorize(Roles = "Admin,SuperAdmin")]
    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateBookingStatus(Guid id, [FromBody] UpdateStatusRequest request)
    {
        var booking = await _context.Bookings.FindAsync(id);
        if (booking == null) return NotFound();

        booking.Status = request.Status;
        if (request.PaymentStatus.HasValue)
        {
            booking.PaymentStatus = request.PaymentStatus.Value;
        }

        booking.UpdatedAtUtc = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        if (!string.IsNullOrWhiteSpace(booking.CustomerEmail))
        {
            await _notifier.PublishNotificationAsync(new RealtimeNotificationPublishRequest(
                TargetUserId: booking.UserId,
                TargetEmail: booking.CustomerEmail,
                TargetRole: null,
                Category: "booking",
                Title: $"Booking Update · {booking.BookingReference}",
                Message: $"Your booking status is now {booking.Status} (Payment: {booking.PaymentStatus}).",
                ActionUrl: "/profile"
            ));
        }

        return Ok(new { message = "Booking status updated.", booking.Id, booking.Status, booking.PaymentStatus });
    }

    public record UpdateStatusRequest(BookingStatus Status, PaymentStatus? PaymentStatus);
}
