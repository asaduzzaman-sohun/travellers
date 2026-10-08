using System.Security.Claims;
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

        bool valid = _passwordHasher.VerifyPassword(dto.Password, user.PasswordHash);
        if (!valid)
        {
            return Unauthorized(new { message = "Invalid email or password." });
        }

        var token = _jwtTokenService.GenerateToken(user);
        var refreshToken = _jwtTokenService.GenerateRefreshToken();

        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
        await _context.SaveChangesAsync();

        var userDto = MapToDto(user);

        return Ok(new AuthResponseDto(token, userDto, refreshToken));
    }

    [HttpPost("refresh-token")]
    public async Task<ActionResult<AuthResponseDto>> RefreshToken([FromBody] RefreshTokenRequestDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Token) || string.IsNullOrWhiteSpace(dto.RefreshToken))
        {
            return BadRequest(new { message = "Token and refresh token are required." });
        }

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

        var user = await _context.Users.FindAsync(userId);
        if (user == null || user.RefreshToken != dto.RefreshToken || user.RefreshTokenExpiryTime <= DateTime.UtcNow)
        {
            return Unauthorized(new { message = "Invalid or expired refresh token." });
        }

        var newToken = _jwtTokenService.GenerateToken(user);
        var newRefreshToken = _jwtTokenService.GenerateRefreshToken();

        user.RefreshToken = newRefreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
        await _context.SaveChangesAsync();

        return Ok(new AuthResponseDto(newToken, MapToDto(user), newRefreshToken));
    }

    [Authorize]
    [HttpPost("revoke-token")]
    public async Task<IActionResult> RevokeToken()
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (Guid.TryParse(userIdStr, out var userId))
        {
            var user = await _context.Users.FindAsync(userId);
            if (user != null)
            {
                user.RefreshToken = null;
                user.RefreshTokenExpiryTime = null;
                await _context.SaveChangesAsync();
            }
        }
        return Ok(new { message = "Token successfully revoked." });
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
