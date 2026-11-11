using System.ComponentModel.DataAnnotations;

namespace TourFlow.Api.DTOs;

public record ForgotPasswordRequestDto([Required, EmailAddress] string Email);

public record ForgotPasswordResponseDto(
    bool Accepted,
    string Message,
    string? ResetTokenPreview = null
);

public record ResetPasswordRequestDto(
    [Required, EmailAddress] string Email,
    [Required] string Token,
    [Required, MinLength(8)] string NewPassword
);
