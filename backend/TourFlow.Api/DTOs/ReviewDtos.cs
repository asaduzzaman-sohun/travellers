using System.ComponentModel.DataAnnotations;

namespace TourFlow.Api.DTOs;

public class CreateReviewRequestDto
{
    [Required]
    [Range(1, 5, ErrorMessage = "Rating must be between 1 and 5.")]
    public int Rating { get; set; }

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [MaxLength(2000)]
    public string Comment { get; set; } = string.Empty;

    public string? ReviewerLocation { get; set; }
    public string? TripDateFormatted { get; set; }
}

public class ReviewResponseDto
{
    public Guid Id { get; set; }
    public Guid TourPackageId { get; set; }
    public Guid? UserId { get; set; }
    public string ReviewerName { get; set; } = string.Empty;
    public string ReviewerLocation { get; set; } = string.Empty;
    public string ReviewerEmail { get; set; } = string.Empty;
    public int Rating { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Comment { get; set; } = string.Empty;
    public string TripDateFormatted { get; set; } = string.Empty;
    public bool IsVerifiedBooking { get; set; }
    public bool IsApproved { get; set; }
    public DateTime CreatedAtUtc { get; set; }
}
