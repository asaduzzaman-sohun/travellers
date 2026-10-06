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
                b.CustomerName,
                b.CustomerEmail,
                b.CustomerPhone,
                b.NumberOfTravelers,
                b.TotalAmount,
                b.Status,
                b.PaymentStatus,
                b.CreatedAtUtc
            })
            .ToListAsync();

        return Ok(bookings);
    }

    public record CreateBookingRequest(
        Guid TourPackageId,
        Guid TourScheduleId,
        string CustomerName,
        string CustomerEmail,
        string CustomerPhone,
        int NumberOfTravelers,
        string? SpecialRequests,
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

        if (schedule.AvailableSeats < request.NumberOfTravelers)
        {
            return BadRequest(new { message = $"Only {schedule.AvailableSeats} seat(s) available for this departure." });
        }

        var unitPrice = schedule.PricePerPerson;
        var totalAmount = unitPrice * request.NumberOfTravelers;
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
            Status = BookingStatus.Confirmed,
            PaymentStatus = PaymentStatus.Paid,
            SpecialRequests = request.SpecialRequests
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

        return CreatedAtAction(nameof(GetBookings), new { id = booking.Id }, new
        {
            booking.Id,
            booking.BookingReference,
            booking.TotalAmount,
            booking.Status,
            booking.PaymentStatus,
            Message = "Booking confirmed successfully!"
        });
    }
}
