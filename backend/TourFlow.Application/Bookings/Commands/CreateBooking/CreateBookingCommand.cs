using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TourFlow.Application.Common.Interfaces;
using TourFlow.Domain.Entities;
using TourFlow.Domain.Enums;

namespace TourFlow.Application.Bookings.Commands.CreateBooking;

public record TravelerInputDto(
    string FullName,
    int Age,
    string Gender,
    string? Email = null,
    string? PhoneNumber = null,
    string? PassportNumber = null,
    string? Nationality = null
);

public record CreateBookingCommand(
    Guid TourScheduleId,
    string CustomerName,
    string CustomerEmail,
    string CustomerPhone,
    int NumberOfTravelers,
    string? DietaryRequirements = null,
    string? SpecialRequests = null,
    string? EmergencyContactName = null,
    string? EmergencyContactPhone = null,
    string PaymentMethod = "bkash",
    List<TravelerInputDto>? Travelers = null,
    Guid? CallerUserId = null,
    string? CallerEmail = null
) : IRequest<BookingResultDto>;

public record BookingResultDto(
    Guid Id,
    string BookingReference,
    Guid TourPackageId,
    string TourTitle,
    DateTime DepartureDate,
    int NumberOfTravelers,
    decimal TotalAmount,
    decimal DepositPaid,
    decimal BalanceRemaining,
    string Status,
    string PaymentStatus
);

public class CreateBookingCommandValidator : AbstractValidator<CreateBookingCommand>
{
    public CreateBookingCommandValidator()
    {
        RuleFor(x => x.TourScheduleId)
            .NotEmpty().WithMessage("Tour schedule is required.");

        RuleFor(x => x.CustomerName)
            .NotEmpty().WithMessage("Customer name is required.")
            .MaximumLength(150).WithMessage("Customer name cannot exceed 150 characters.");

        RuleFor(x => x.CustomerEmail)
            .NotEmpty().WithMessage("Customer email is required.")
            .EmailAddress().WithMessage("A valid email address is required.");

        RuleFor(x => x.CustomerPhone)
            .NotEmpty().WithMessage("Customer phone number is required.")
            .MaximumLength(50).WithMessage("Phone number cannot exceed 50 characters.");

        RuleFor(x => x.NumberOfTravelers)
            .GreaterThan(0).WithMessage("Number of travelers must be at least 1.")
            .LessThanOrEqualTo(20).WithMessage("Group size cannot exceed 20 travelers per booking.");
    }
}

public class CreateBookingCommandHandler : IRequestHandler<CreateBookingCommand, BookingResultDto>
{
    private readonly ITourFlowDbContext _context;

    public CreateBookingCommandHandler(ITourFlowDbContext context)
    {
        _context = context;
    }

    public async Task<BookingResultDto> Handle(CreateBookingCommand request, CancellationToken cancellationToken)
    {
        var schedule = await _context.TourSchedules
            .Include(s => s.TourPackage)
            .FirstOrDefaultAsync(s => s.Id == request.TourScheduleId, cancellationToken);

        if (schedule == null || schedule.TourPackage == null)
        {
            throw new KeyNotFoundException("Tour schedule not found.");
        }

        var availableSeats = schedule.TotalSeats - schedule.BookedSeats;
        if (availableSeats < request.NumberOfTravelers)
        {
            throw new InvalidOperationException($"Only {availableSeats} seat(s) remaining for this departure. Requested: {request.NumberOfTravelers}.");
        }

        // Determine price
        var unitPrice = schedule.TourPackage.DiscountPrice ?? schedule.PricePerPerson;
        if (unitPrice <= 0) unitPrice = schedule.TourPackage.BasePrice;

        var totalAmount = unitPrice * request.NumberOfTravelers;
        var depositAmount = schedule.TourPackage.DepositAmount > 0
            ? schedule.TourPackage.DepositAmount * request.NumberOfTravelers
            : totalAmount;

        var refCode = $"TF-{DateTime.UtcNow:yyyyMM}-{Random.Shared.Next(1000, 9999)}";

        // Resolve UserId
        Guid? userId = request.CallerUserId;
        if (!userId.HasValue)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == request.CustomerEmail.ToLower(), cancellationToken);
            userId = user?.Id;
        }

        var booking = new Booking
        {
            Id = Guid.NewGuid(),
            BookingReference = refCode,
            TourScheduleId = schedule.Id,
            TourPackageId = schedule.TourPackageId,
            UserId = userId,
            CustomerName = request.CustomerName,
            CustomerEmail = request.CustomerEmail,
            CustomerPhone = request.CustomerPhone,
            NumberOfTravelers = request.NumberOfTravelers,
            UnitPrice = unitPrice,
            TotalAmount = totalAmount,
            DepositPaid = depositAmount,
            BalanceRemaining = Math.Max(0, totalAmount - depositAmount),
            Status = BookingStatus.Confirmed,
            PaymentStatus = (totalAmount - depositAmount) > 0 ? (depositAmount > 0 ? PaymentStatus.PartiallyPaid : PaymentStatus.Unpaid) : PaymentStatus.Paid,
            DietaryRequirements = request.DietaryRequirements,
            SpecialRequests = request.SpecialRequests,
            EmergencyContactName = request.EmergencyContactName,
            EmergencyContactPhone = request.EmergencyContactPhone,
            PaymentTransactionId = $"TRX-MOCK-{Guid.NewGuid().ToString("N")[..8].ToUpper()}",
            CreatedAtUtc = DateTime.UtcNow
        };

        if (request.Travelers != null && request.Travelers.Any())
        {
            foreach (var t in request.Travelers)
            {
                booking.Travelers.Add(new Traveler
                {
                    Id = Guid.NewGuid(),
                    BookingId = booking.Id,
                    FullName = t.FullName,
                    DateOfBirth = t.Age > 0 ? DateTime.UtcNow.AddYears(-t.Age) : null,
                    Gender = t.Gender,
                    Email = t.Email,
                    PhoneNumber = t.PhoneNumber,
                    PassportNumber = t.PassportNumber,
                    Nationality = t.Nationality ?? "Bangladeshi"
                });
            }
        }
        else
        {
            booking.Travelers.Add(new Traveler
            {
                Id = Guid.NewGuid(),
                BookingId = booking.Id,
                FullName = request.CustomerName,
                DateOfBirth = DateTime.UtcNow.AddYears(-30),
                Gender = "Other",
                Email = request.CustomerEmail,
                PhoneNumber = request.CustomerPhone,
                Nationality = "Bangladeshi"
            });
        }

        schedule.BookedSeats += request.NumberOfTravelers;
        _context.Bookings.Add(booking);

        await _context.SaveChangesAsync(cancellationToken);

        return new BookingResultDto(
            booking.Id,
            booking.BookingReference,
            booking.TourPackageId,
            schedule.TourPackage.Title,
            schedule.StartDate,
            booking.NumberOfTravelers,
            booking.TotalAmount,
            booking.DepositPaid,
            booking.BalanceRemaining,
            booking.Status.ToString(),
            booking.PaymentStatus.ToString()
        );
    }
}
