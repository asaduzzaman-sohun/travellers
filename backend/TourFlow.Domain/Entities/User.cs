using TourFlow.Domain.Common;

namespace TourFlow.Domain.Entities;

public class User : BaseEntity
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Role { get; set; } = "User"; // "User" or "Admin"
    public string? PhoneNumber { get; set; }
    public string? HomeCity { get; set; }
    public string? NidOrPassport { get; set; }
    public string? Bio { get; set; }
    public bool IsVerified { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
