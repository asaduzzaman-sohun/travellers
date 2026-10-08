using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MediatR;
using TourFlow.Application.Bookings.Commands.CreateBooking;
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

    public BookingsController(TourFlowDbContext context, IMediator mediator)
    {
        _context = context;
        _mediator = mediator;
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
        var query = _context.Bookings
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
        List<CreateTravelerRequest>? Travelers
    );

    public record CreateTravelerRequest(
        string FullName,
        string? Email,
        string? PhoneNumber,
        string? PassportNumber,
        string? Nationality
    );

    [HttpPost]
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
            callerEmail
        );

        var result = await _mediator.Send(command);

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

        return Ok(new { message = "Booking status updated.", booking.Id, booking.Status, booking.PaymentStatus });
    }

    public record UpdateStatusRequest(BookingStatus Status, PaymentStatus? PaymentStatus);
}
