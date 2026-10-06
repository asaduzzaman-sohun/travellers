namespace TourFlow.Api.DTOs;

public record RegisterRequestDto(
    string FullName,
    string Email,
    string Password,
    string? PhoneNumber,
    string? HomeCity,
    string? Role = "User"
);

public record LoginRequestDto(
    string Email,
    string Password
);

public record UserDto(
    Guid Id,
    string FullName,
    string Email,
    string Role,
    string? PhoneNumber,
    string? HomeCity,
    string? NidOrPassport,
    string? Bio,
    bool IsVerified,
    DateTime CreatedAt
);

public record AuthResponseDto(
    string Token,
    UserDto User
);

public record UpdateProfileDto(
    string FullName,
    string? PhoneNumber,
    string? HomeCity,
    string? NidOrPassport,
    string? Bio
);

public record ChangePasswordDto(
    string CurrentPassword,
    string NewPassword
);
