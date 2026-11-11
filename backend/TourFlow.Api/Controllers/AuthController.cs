using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TourFlow.Api.DTOs;
using TourFlow.Api.Services;
using TourFlow.Domain.Entities;
using TourFlow.Infrastructure.Data;

using Microsoft.AspNetCore.RateLimiting;

namespace TourFlow.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[EnableRateLimiting("auth")]
public class AuthController : ControllerBase
{
    private readonly TourFlowDbContext _context;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        TourFlowDbContext context,
        IPasswordHasher passwordHasher,
        IJwtTokenService jwtTokenService,
        ILogger<AuthController> logger)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _jwtTokenService = jwtTokenService;
        _logger = logger;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponseDto>> Register([FromBody] RegisterRequestDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password) || string.IsNullOrWhiteSpace(dto.FullName))
        {
            return BadRequest(new { message = "Full name, email, and password are required." });
        }

        var normalizedEmail = dto.Email.Trim().ToLowerInvariant();
        if (!System.Net.Mail.MailAddress.TryCreate(normalizedEmail, out _))
        {
            return BadRequest(new { message = "Please enter a valid email address." });
        }

        if (dto.Password.Length < 8 || !dto.Password.Any(char.IsLetter) || !dto.Password.Any(char.IsDigit))
        {
            return BadRequest(new { message = "Password must be at least 8 characters and include both letters and numbers." });
        }

        var existingUser = await _context.Users.AnyAsync(u => u.Email == normalizedEmail);
        if (existingUser)
        {
            return Conflict(new { message = "An account with this email address already exists." });
        }

        // Enforce safe default role "User" - prevent privilege escalation
        var refreshToken = _jwtTokenService.GenerateRefreshToken();
        var user = new User
        {
            Id = Guid.NewGuid(),
            FullName = dto.FullName.Trim(),
            Email = normalizedEmail,
            PasswordHash = _passwordHasher.HashPassword(dto.Password),
            Role = "User",
            PhoneNumber = dto.PhoneNumber?.Trim(),
            HomeCity = string.IsNullOrWhiteSpace(dto.HomeCity) ? "Dhaka" : dto.HomeCity.Trim(),
            RefreshToken = refreshToken,
            RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7),
            IsVerified = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        SetRefreshTokenCookie(refreshToken, user.RefreshTokenExpiryTime.Value);
        var token = _jwtTokenService.GenerateToken(user);
        var userDto = MapToDto(user);

        return Ok(new AuthResponseDto(token, userDto, refreshToken));
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginRequestDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
        {
            return BadRequest(new { message = "Email and password are required." });
        }

        var normalizedEmail = dto.Email.Trim().ToLowerInvariant();

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == normalizedEmail);
        if (user == null)
        {
            return Unauthorized(new { message = "Invalid email or password." });
        }

        if (user.LockoutEndUtc.HasValue && user.LockoutEndUtc.Value > DateTime.UtcNow)
        {
            var remainingSeconds = Math.Max(1, (int)Math.Ceiling((user.LockoutEndUtc.Value - DateTime.UtcNow).TotalSeconds));
            return StatusCode(StatusCodes.Status429TooManyRequests, new
            {
                message = $"Account temporarily locked due to repeated failed attempts. Try again in {Math.Ceiling(remainingSeconds / 60.0)} minute(s).",
                retryAfterSeconds = remainingSeconds
            });
        }

        bool valid = _passwordHasher.VerifyPassword(dto.Password, user.PasswordHash);
        if (!valid)
        {
            user.FailedLoginAttempts += 1;
            if (user.FailedLoginAttempts >= 5)
            {
                user.LockoutEndUtc = DateTime.UtcNow.AddMinutes(5);
                user.FailedLoginAttempts = 0;
            }
            await _context.SaveChangesAsync();
            return Unauthorized(new { message = "Invalid email or password." });
        }

        user.FailedLoginAttempts = 0;
        user.LockoutEndUtc = null;

        var token = _jwtTokenService.GenerateToken(user);
        var refreshToken = _jwtTokenService.GenerateRefreshToken();

        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
        await _context.SaveChangesAsync();

        SetRefreshTokenCookie(refreshToken, user.RefreshTokenExpiryTime.Value);
        var userDto = MapToDto(user);

        return Ok(new AuthResponseDto(token, userDto, refreshToken));
    }

    private const string RefreshCookieName = "tourflow_refresh_token";

    [HttpPost("refresh-token")]
    public async Task<ActionResult<AuthResponseDto>> RefreshToken(
        [FromBody(EmptyBodyBehavior = Microsoft.AspNetCore.Mvc.ModelBinding.EmptyBodyBehavior.Allow)] RefreshTokenRequestDto? dto = null)
    {
        var cookieRefreshToken = HttpContext?.Request?.Cookies[RefreshCookieName];
        var submittedRefreshToken = !string.IsNullOrWhiteSpace(dto?.RefreshToken)
            ? dto.RefreshToken.Trim()
            : cookieRefreshToken;

        if (string.IsNullOrWhiteSpace(submittedRefreshToken))
        {
            return BadRequest(new { message = "Refresh token is required." });
        }

        User? user = null;
        if (!string.IsNullOrWhiteSpace(dto?.Token))
        {
            var principal = _jwtTokenService.GetPrincipalFromExpiredToken(dto.Token);
            if (principal == null)
            {
                return BadRequest(new { message = "Invalid access token." });
            }

            var userIdStr = principal.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdStr, out var userId))
            {
                return Unauthorized(new { message = "Invalid user identifier in token." });
            }

            user = await _context.Users.FindAsync(userId);
        }
        else
        {
            user = await _context.Users.FirstOrDefaultAsync(u => u.RefreshToken == submittedRefreshToken);
        }

        if (user == null || user.RefreshToken != submittedRefreshToken || user.RefreshTokenExpiryTime <= DateTime.UtcNow)
        {
            ClearRefreshTokenCookie();
            return Unauthorized(new { message = "Invalid or expired refresh token." });
        }

        var newToken = _jwtTokenService.GenerateToken(user);
        var newRefreshToken = _jwtTokenService.GenerateRefreshToken();

        user.RefreshToken = newRefreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
        await _context.SaveChangesAsync();

        SetRefreshTokenCookie(newRefreshToken, user.RefreshTokenExpiryTime.Value);
        return Ok(new AuthResponseDto(newToken, MapToDto(user), newRefreshToken));
    }

    [AllowAnonymous]
    [HttpPost("revoke-token")]
    public async Task<IActionResult> RevokeToken()
    {
        User? user = null;
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (Guid.TryParse(userIdStr, out var userId))
        {
            user = await _context.Users.FindAsync(userId);
        }
        else
        {
            var cookieRefresh = HttpContext?.Request?.Cookies[RefreshCookieName];
            if (!string.IsNullOrWhiteSpace(cookieRefresh))
            {
                user = await _context.Users.FirstOrDefaultAsync(u => u.RefreshToken == cookieRefresh);
            }
        }

        if (user != null)
        {
            user.RefreshToken = null;
            user.RefreshTokenExpiryTime = null;
            await _context.SaveChangesAsync();
        }

        ClearRefreshTokenCookie();
        return Ok(new { message = "Token successfully revoked." });
    }

    [AllowAnonymous]
    [HttpPost("forgot-password")]
    public async Task<ActionResult<ForgotPasswordResponseDto>> ForgotPassword([FromBody] ForgotPasswordRequestDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var normalizedEmail = dto.Email.Trim().ToLowerInvariant();
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == normalizedEmail);
        string? devPreview = null;

        if (user != null)
        {
            var rawBytes = RandomNumberGenerator.GetBytes(24);
            var rawToken = Convert.ToHexString(rawBytes);
            user.PasswordResetTokenHash = HashResetToken(rawToken);
            user.PasswordResetTokenExpiryUtc = DateTime.UtcNow.AddMinutes(15);
            await _context.SaveChangesAsync();

            var env = HttpContext?.RequestServices.GetService<IHostEnvironment>();
            if (env?.IsDevelopment() == true)
            {
                devPreview = rawToken;
            }

            _logger.LogInformation("Password reset token generated for {Email}", normalizedEmail);
        }

        return Ok(new ForgotPasswordResponseDto(
            Accepted: true,
            Message: "If an account exists for that email, reset instructions have been generated (valid for 15 minutes).",
            ResetTokenPreview: devPreview
        ));
    }

    [AllowAnonymous]
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequestDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        if (dto.NewPassword.Length < 8 || !dto.NewPassword.Any(char.IsLetter) || !dto.NewPassword.Any(char.IsDigit))
        {
            return BadRequest(new { message = "New password must be at least 8 characters and include both letters and numbers." });
        }

        var normalizedEmail = dto.Email.Trim().ToLowerInvariant();
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == normalizedEmail);
        if (user == null || string.IsNullOrWhiteSpace(user.PasswordResetTokenHash) || !user.PasswordResetTokenExpiryUtc.HasValue)
        {
            return BadRequest(new { message = "Invalid or expired password reset token." });
        }

        if (user.PasswordResetTokenExpiryUtc.Value <= DateTime.UtcNow)
        {
            return BadRequest(new { message = "Password reset token has expired. Please request a new one." });
        }

        var submittedHash = HashResetToken(dto.Token.Trim());
        var expectedBytes = Encoding.UTF8.GetBytes(user.PasswordResetTokenHash);
        var actualBytes = Encoding.UTF8.GetBytes(submittedHash);

        if (expectedBytes.Length != actualBytes.Length || !CryptographicOperations.FixedTimeEquals(expectedBytes, actualBytes))
        {
            return BadRequest(new { message = "Invalid or expired password reset token." });
        }

        user.PasswordHash = _passwordHasher.HashPassword(dto.NewPassword);
        user.PasswordResetTokenHash = null;
        user.PasswordResetTokenExpiryUtc = null;
        user.FailedLoginAttempts = 0;
        user.LockoutEndUtc = null;
        // Invalidate existing refresh tokens upon password recovery.
        user.RefreshToken = null;
        user.RefreshTokenExpiryTime = null;
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        ClearRefreshTokenCookie();

        return Ok(new { message = "Password has been reset successfully. You may now sign in." });
    }

    private void SetRefreshTokenCookie(string refreshToken, DateTime expiresUtc)
    {
        if (HttpContext?.Response?.Cookies == null) return;

        HttpContext.Response.Cookies.Append(RefreshCookieName, refreshToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = HttpContext.Request.IsHttps,
            SameSite = SameSiteMode.Lax,
            Expires = expiresUtc,
            Path = "/api/auth"
        });
    }

    private void ClearRefreshTokenCookie()
    {
        if (HttpContext?.Response?.Cookies == null) return;

        HttpContext.Response.Cookies.Delete(RefreshCookieName, new CookieOptions
        {
            HttpOnly = true,
            Secure = HttpContext.Request.IsHttps,
            SameSite = SameSiteMode.Lax,
            Path = "/api/auth"
        });
    }

    private static string HashResetToken(string rawToken)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(rawToken));
        return Convert.ToHexStringLower(bytes);
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<UserDto>> GetCurrentUser()
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
        {
            return Unauthorized(new { message = "User identity claim not found." });
        }

        var user = await _context.Users.FindAsync(userId);
        if (user == null)
        {
            return NotFound(new { message = "User record not found." });
        }

        return Ok(MapToDto(user));
    }

    [Authorize]
    [HttpPut("profile")]
    public async Task<ActionResult<UserDto>> UpdateProfile([FromBody] UpdateProfileDto dto)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
        {
            return Unauthorized();
        }

        var user = await _context.Users.FindAsync(userId);
        if (user == null)
        {
            return NotFound();
        }

        if (!string.IsNullOrWhiteSpace(dto.FullName))
            user.FullName = dto.FullName.Trim();

        user.PhoneNumber = dto.PhoneNumber?.Trim();
        user.HomeCity = dto.HomeCity?.Trim();
        user.NidOrPassport = dto.NidOrPassport?.Trim();
        user.Bio = dto.Bio?.Trim();
        if (dto.AvatarUrl != null)
            user.AvatarUrl = dto.AvatarUrl.Trim();
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(MapToDto(user));
    }

    [Authorize]
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
        {
            return Unauthorized();
        }

        var user = await _context.Users.FindAsync(userId);
        if (user == null)
        {
            return NotFound();
        }

        if (!_passwordHasher.VerifyPassword(dto.CurrentPassword, user.PasswordHash))
        {
            return BadRequest(new { message = "Current password is incorrect." });
        }

        user.PasswordHash = _passwordHasher.HashPassword(dto.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Password successfully changed." });
    }

    [Authorize]
    [HttpGet("users")]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetAllUsers()
    {
        var role = User.FindFirstValue(ClaimTypes.Role);
        if (role != "SuperAdmin" && role != "Admin")
        {
            return Forbid();
        }

        var users = await _context.Users
            .OrderByDescending(u => u.CreatedAt)
            .ToListAsync();

        return Ok(users.Select(MapToDto));
    }

    [Authorize]
    [HttpPatch("users/{id}/role")]
    public async Task<IActionResult> UpdateUserRole(Guid id, [FromBody] ChangeRoleDto dto)
    {
        var callerRole = User.FindFirstValue(ClaimTypes.Role);
        if (callerRole != "SuperAdmin")
        {
            return Forbid();
        }

        if (string.IsNullOrWhiteSpace(dto.Role) ||
            (dto.Role != "SuperAdmin" && dto.Role != "Admin" && dto.Role != "User"))
        {
            return BadRequest(new { message = "Role must be 'SuperAdmin', 'Admin', or 'User'." });
        }

        var user = await _context.Users.FindAsync(id);
        if (user == null)
        {
            return NotFound(new { message = "User not found." });
        }

        user.Role = dto.Role;
        user.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(new { message = $"User role updated to {dto.Role}.", user = MapToDto(user) });
    }

    [Authorize]
    [HttpGet("platform-stats")]
    public async Task<IActionResult> GetPlatformStats()
    {
        var role = User.FindFirstValue(ClaimTypes.Role);
        if (role != "SuperAdmin" && role != "Admin")
        {
            return Forbid();
        }

        var totalUsers = await _context.Users.CountAsync();
        var superAdmins = await _context.Users.CountAsync(u => u.Role == "SuperAdmin");
        var admins = await _context.Users.CountAsync(u => u.Role == "Admin");
        var travelers = await _context.Users.CountAsync(u => u.Role == "User");

        var totalTours = await _context.TourPackages.CountAsync();
        var totalBookings = await _context.Bookings.CountAsync();
        var totalRevenue = await _context.Bookings.SumAsync(b => b.TotalAmount);
        var totalDeposit = await _context.Bookings.SumAsync(b => b.DepositPaid);
        var totalBlogs = await _context.BlogPosts.CountAsync();

        return Ok(new
        {
            totalUsers,
            superAdminCount = superAdmins,
            adminCount = admins,
            travelerCount = travelers,
            totalTours,
            totalBookings,
            totalRevenue,
            totalDepositCollected = totalDeposit,
            totalBlogs,
            databaseStatus = "Operational",
            encryptionAlgorithm = "PBKDF2-SHA256 (100,000 rounds)",
            serverTimeUtc = DateTime.UtcNow
        });
    }

    private static UserDto MapToDto(User user)
    {
        return new UserDto(
            user.Id,
            user.FullName,
            user.Email,
            user.Role,
            user.PhoneNumber,
            user.HomeCity,
            user.NidOrPassport,
            user.Bio,
            user.AvatarUrl,
            user.IsVerified,
            user.CreatedAt
        );
    }
}
