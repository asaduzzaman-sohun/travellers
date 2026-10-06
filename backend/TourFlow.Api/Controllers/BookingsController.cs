using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TourFlow.Domain.Entities;
using TourFlow.Domain.Enums;
using TourFlow.Infrastructure.Data;

namespace TourFlow.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BookingsController : ControllerBase
{
    private readonly TourFlowDbContext _context;

    public BookingsController(TourFlowDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetBookings()
    {
        var bookings = await _context.Bookings
            .Include(b => b.TourPackage)
            .Include(b => b.TourSchedule)
            .Include(b => b.Travelers)
            .OrderByDescending(b => b.CreatedAtUtc)
            .Select(b => new
            {
                b.Id,
                b.BookingReference,
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
        var schedule = await _context.TourSchedules
            .Include(s => s.TourPackage)
            .FirstOrDefaultAsync(s => s.Id == request.TourScheduleId && s.TourPackageId == request.TourPackageId);

        if (schedule == null)
        {
            return NotFound(new { message = "Selected departure schedule was not found." });
        }

        var availableSeats = schedule.TotalSeats - schedule.BookedSeats;
        if (availableSeats < request.NumberOfTravelers)
        {
            return BadRequest(new { message = $"Only {availableSeats} seat(s) remaining on this departure." });
        }

        var tour = schedule.TourPackage!;
        var unitPrice = schedule.PricePerPerson > 0 ? schedule.PricePerPerson : (tour.DiscountPrice ?? tour.BasePrice);
        var totalAmount = unitPrice * request.NumberOfTravelers;
        var depositPerPerson = tour.DepositAmount > 0 ? tour.DepositAmount : (unitPrice * 0.20m);
        var totalDeposit = depositPerPerson * request.NumberOfTravelers;

        decimal depositPaid;
        decimal balanceRemaining;
        PaymentStatus paymentStatus;

        if (request.PayDepositOnly)
        {
            depositPaid = totalDeposit;
            balanceRemaining = totalAmount - totalDeposit;
            paymentStatus = PaymentStatus.PartiallyPaid;
        }
        else
        {
            depositPaid = totalAmount;
            balanceRemaining = 0m;
            paymentStatus = PaymentStatus.Paid;
        }

        var refCode = $"TF-{DateTime.UtcNow:yyyyMM}-{Random.Shared.Next(1000, 9999)}";

        var booking = new Booking
        {
            BookingReference = refCode,
            TourPackageId = request.TourPackageId,
            TourScheduleId = request.TourScheduleId,
            CustomerName = request.CustomerName,
            CustomerEmail = request.CustomerEmail,
            CustomerPhone = request.CustomerPhone,
            NumberOfTravelers = request.NumberOfTravelers,
            UnitPrice = unitPrice,
            TotalAmount = totalAmount,
            DepositPaid = depositPaid,
            BalanceRemaining = balanceRemaining,
            Status = BookingStatus.Confirmed,
            PaymentStatus = paymentStatus,
            DietaryRequirements = request.DietaryRequirements,
            SpecialRequests = request.SpecialRequests,
            EmergencyContactName = request.EmergencyContactName,
            EmergencyContactPhone = request.EmergencyContactPhone,
            PaymentTransactionId = $"TXN-STRIPE-{Guid.NewGuid().ToString()[..8].ToUpper()}"
        };

        if (request.Travelers != null && request.Travelers.Any())
        {
            foreach (var t in request.Travelers)
            {
                booking.Travelers.Add(new Traveler
                {
                    FullName = t.FullName,
                    Email = t.Email,
                    PhoneNumber = t.PhoneNumber,
                    PassportNumber = t.PassportNumber,
                    Nationality = t.Nationality
                });
            }
        }
        else
        {
            booking.Travelers.Add(new Traveler
            {
                FullName = request.CustomerName,
                Email = request.CustomerEmail,
                PhoneNumber = request.CustomerPhone
            });
        }

        schedule.BookedSeats += request.NumberOfTravelers;

        _context.Bookings.Add(booking);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetBookingByReference), new { refCode = booking.BookingReference }, new
        {
            booking.Id,
            booking.BookingReference,
            booking.CustomerName,
            booking.CustomerEmail,
            TourTitle = tour.Title,
            DepartureDate = schedule.StartDate,
            booking.NumberOfTravelers,
            booking.TotalAmount,
            booking.DepositPaid,
            booking.BalanceRemaining,
            booking.Status,
            booking.PaymentStatus,
            booking.PaymentTransactionId,
            Message = "Reservation secured successfully."
        });
    }

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
