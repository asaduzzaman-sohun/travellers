using FluentAssertions;
using TourFlow.Api.Services;
using Xunit;

namespace TourFlow.Tests;

public class PasswordHasherTests
{
    private readonly PasswordHasher _hasher = new();

    [Fact]
    public void HashPassword_ShouldGenerateValidSaltedHash()
    {
        var password = "SecurePassword123!";

        var hash = _hasher.HashPassword(password);

        hash.Should().NotBeNullOrWhiteSpace();
        hash.Split('.').Length.Should().Be(3);
    }

    [Fact]
    public void VerifyPassword_ShouldReturnTrue_ForCorrectPassword()
    {
        var password = "BangladeshTravel2026!";
        var hash = _hasher.HashPassword(password);

        var isValid = _hasher.VerifyPassword(password, hash);

        isValid.Should().BeTrue();
    }

    [Fact]
    public void VerifyPassword_ShouldReturnFalse_ForIncorrectPassword()
    {
        var password = "CorrectPassword123";
        var wrongPassword = "WrongPassword456";
        var hash = _hasher.HashPassword(password);

        var isValid = _hasher.VerifyPassword(wrongPassword, hash);

        isValid.Should().BeFalse();
    }
}
