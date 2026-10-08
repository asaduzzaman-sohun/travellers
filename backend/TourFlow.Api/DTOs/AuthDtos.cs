namespace TourFlow.Api.DTOs;

public record RegisterRequestDto(
    string FullName,
    string Email,
    string Password,
    string? PhoneNumber,
    string? HomeCity
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
    string? AvatarUrl,
    bool IsVerified,
    DateTime CreatedAt
);

public record AuthResponseDto(
    string Token,
    UserDto User,
    string? RefreshToken = null
);

public record RefreshTokenRequestDto(
    string Token,
    string RefreshToken
);

public record UpdateProfileDto(
    string FullName,
    string? PhoneNumber,
    string? HomeCity,
    string? NidOrPassport,
    string? Bio,
    string? AvatarUrl
);

public record ChangePasswordDto(
    string CurrentPassword,
    string NewPassword
);

public record ChangeRoleDto(
    string Role
);
