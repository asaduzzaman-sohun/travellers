using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using TourFlow.Application.Bookings.Commands.CreateBooking;
using TourFlow.Application.Bookings.Common;
using TourFlow.Domain.Entities;
using TourFlow.Domain.Enums;
using TourFlow.Infrastructure.Data;
using Xunit;

namespace TourFlow.Tests;

public class PromoAndBookingHandlerTests
{
    private TourFlowDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<TourFlowDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new TourFlowDbContext(options);
    }

    [Fact]
    public void Evaluate_PercentagePromo_RespectsMaxCapAndMinTravelers()
    {
        var promo = new PromoCode
        {
            Code = "GROUP12",
            Description = "12% off groups of 4+",
            DiscountType = "Percentage",
            DiscountValue = 12,
            MaxDiscountAmount = 6000,
            MinimumTravelers = 4,
            MaxUses = 100,
            TimesUsed = 10,
            ExpiresAtUtc = DateTime.UtcNow.AddDays(30),
            IsActive = true
        };

        var tooSmall = PromoCodeCalculator.Evaluate(promo, 20000m, 2, "Adventure");
        tooSmall.IsValid.Should().BeFalse();
        tooSmall.DiscountAmount.Should().Be(0m);

        var capped = PromoCodeCalculator.Evaluate(promo, 60000m, 5, "Adventure");
        capped.IsValid.Should().BeTrue();
        capped.DiscountAmount.Should().Be(6000m); // 12% of 60k = 7,200 capped at 6,000
        capped.FinalTotal.Should().Be(54000m);
    }

    [Fact]
    public async Task CreateBooking_WithPromoAndFullPayment_AppliesDiscountAndClearsBalance()
    {
        using var context = CreateDbContext();
        var tourId = Guid.NewGuid();
        var scheduleId = Guid.NewGuid();

        context.TourPackages.Add(new TourPackage
        {
            Id = tourId,
            Title = "Sundarban Eco Cruise",
            Slug = "sundarban-eco-cruise",
            Destination = "Khulna & Sundarbans",
            Country = "Bangladesh",
            Region = "Khulna",
            BasePrice = 10000m,
            DepositAmount = 2500m,
            Category = TourCategory.WildlifeAndSafari,
            MaxGroupSize = 16,
            IsActive = true
        });

        context.TourSchedules.Add(new TourSchedule
        {
            Id = scheduleId,
            TourPackageId = tourId,
            StartDate = DateTime.UtcNow.AddDays(15),
            EndDate = DateTime.UtcNow.AddDays(18),
            TotalSeats = 20,
            BookedSeats = 2,
            PricePerPerson = 10000m,
            Status = ScheduleStatus.Scheduled
        });

        context.PromoCodes.Add(new PromoCode
        {
            Id = Guid.NewGuid(),
            Code = "MONSOON15",
            Description = "15% off seasonal trips",
            DiscountType = "Percentage",
            DiscountValue = 15,
            MaxDiscountAmount = 4000m,
            MinimumTravelers = 1,
            MaxUses = 100,
            TimesUsed = 5,
            ExpiresAtUtc = DateTime.UtcNow.AddDays(30),
            IsActive = true
        });

        await context.SaveChangesAsync();

        var handler = new CreateBookingCommandHandler(context);
        var command = new CreateBookingCommand(
            TourScheduleId: scheduleId,
            CustomerName: "Tariq Rahman",
            CustomerEmail: "tariq@example.com",
            CustomerPhone: "+8801711000000",
            NumberOfTravelers: 2,
            PayDepositOnly: false,
            PromoCode: "monsoon15"
        );

        var result = await handler.Handle(command, CancellationToken.None);

        result.AppliedPromoCode.Should().Be("MONSOON15");
        result.PromoDiscountAmount.Should().Be(3000m); // 15% of 20,000
        result.TotalAmount.Should().Be(17000m);
        result.DepositPaid.Should().Be(17000m);
        result.BalanceRemaining.Should().Be(0m);
        result.PaymentStatus.Should().Be(PaymentStatus.Paid.ToString());

        var updatedPromo = await context.PromoCodes.FirstAsync(p => p.Code == "MONSOON15");
        updatedPromo.TimesUsed.Should().Be(6);
    }

    [Fact]
    public async Task CreateBooking_WithCategoryMismatchPromo_ThrowsInvalidOperationException()
    {
        using var context = CreateDbContext();
        var tourId = Guid.NewGuid();
        var scheduleId = Guid.NewGuid();

        context.TourPackages.Add(new TourPackage
        {
            Id = tourId,
            Title = "Sylhet Tea Gardens",
            Slug = "sylhet-tea-gardens",
            Destination = "Sylhet",
            Country = "Bangladesh",
            Region = "Sylhet",
            BasePrice = 6000m,
            DepositAmount = 1500m,
            Category = TourCategory.Cultural,
            MaxGroupSize = 15,
            IsActive = true
        });

        context.TourSchedules.Add(new TourSchedule
        {
            Id = scheduleId,
            TourPackageId = tourId,
            StartDate = DateTime.UtcNow.AddDays(10),
            EndDate = DateTime.UtcNow.AddDays(12),
            TotalSeats = 15,
            BookedSeats = 0,
            PricePerPerson = 6000m,
            Status = ScheduleStatus.Scheduled
        });

        context.PromoCodes.Add(new PromoCode
        {
            Id = Guid.NewGuid(),
            Code = "SUNDARBAN10",
            Description = "Wildlife only",
            DiscountType = "Percentage",
            DiscountValue = 10,
            ApplicableCategory = "WildlifeAndSafari",
            IsActive = true
        });

        await context.SaveChangesAsync();

        var handler = new CreateBookingCommandHandler(context);
        var act = async () => await handler.Handle(new CreateBookingCommand(
            TourScheduleId: scheduleId,
            CustomerName: "Nadia Karim",
            CustomerEmail: "nadia@example.com",
            CustomerPhone: "+8801711000001",
            NumberOfTravelers: 1,
            PromoCode: "SUNDARBAN10"
        ), CancellationToken.None);

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*WildlifeAndSafari*");
    }
}
