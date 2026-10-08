using FluentAssertions;
using TourFlow.Application.Bookings.Commands.CreateBooking;
using Xunit;

namespace TourFlow.Tests;

public class CreateBookingCommandValidatorTests
{
    private readonly CreateBookingCommandValidator _validator = new();

    [Fact]
    public void Should_Pass_When_Command_Is_Valid()
    {
        var command = new CreateBookingCommand(
            TourScheduleId: Guid.NewGuid(),
            CustomerName: "Kazi Nazrul",
            CustomerEmail: "nazrul@tourflow.com",
            CustomerPhone: "+8801711223344",
            NumberOfTravelers: 2,
            DietaryRequirements: "Halal",
            SpecialRequests: "Near front",
            EmergencyContactName: "Pritilata",
            EmergencyContactPhone: "+8801811223344",
            PaymentMethod: "bkash",
            Travelers: null
        );

        var result = _validator.Validate(command);

        result.IsValid.Should().BeTrue();
        result.Errors.Should().BeEmpty();
    }

    [Theory]
    [InlineData("")]
    [InlineData(" ")]
    [InlineData(null)]
    public void Should_Fail_When_CustomerName_Is_Empty(string? invalidName)
    {
        var command = new CreateBookingCommand(
            TourScheduleId: Guid.NewGuid(),
            CustomerName: invalidName!,
            CustomerEmail: "valid@email.com",
            CustomerPhone: "+8801711223344",
            NumberOfTravelers: 1,
            DietaryRequirements: null,
            SpecialRequests: null,
            EmergencyContactName: null,
            EmergencyContactPhone: null,
            PaymentMethod: "bkash",
            Travelers: null
        );

        var result = _validator.Validate(command);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "CustomerName");
    }

    [Theory]
    [InlineData("not-an-email")]
    [InlineData("@missinguser.com")]
    [InlineData("plainaddress")]
    public void Should_Fail_When_CustomerEmail_Is_Invalid(string invalidEmail)
    {
        var command = new CreateBookingCommand(
            TourScheduleId: Guid.NewGuid(),
            CustomerName: "Valid Name",
            CustomerEmail: invalidEmail,
            CustomerPhone: "+8801711223344",
            NumberOfTravelers: 1,
            DietaryRequirements: null,
            SpecialRequests: null,
            EmergencyContactName: null,
            EmergencyContactPhone: null,
            PaymentMethod: "bkash",
            Travelers: null
        );

        var result = _validator.Validate(command);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "CustomerEmail");
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    [InlineData(-10)]
    public void Should_Fail_When_NumberOfTravelers_Is_Less_Than_One(int invalidTravelers)
    {
        var command = new CreateBookingCommand(
            TourScheduleId: Guid.NewGuid(),
            CustomerName: "Valid Name",
            CustomerEmail: "valid@email.com",
            CustomerPhone: "+8801711223344",
            NumberOfTravelers: invalidTravelers,
            DietaryRequirements: null,
            SpecialRequests: null,
            EmergencyContactName: null,
            EmergencyContactPhone: null,
            PaymentMethod: "bkash",
            Travelers: null
        );

        var result = _validator.Validate(command);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "NumberOfTravelers");
    }
}
