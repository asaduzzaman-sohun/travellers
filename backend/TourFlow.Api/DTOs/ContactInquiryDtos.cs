using System.ComponentModel.DataAnnotations;

namespace TourFlow.Api.DTOs;

public record CreateContactInquiryRequestDto(
    [Required, MaxLength(150)] string Name,
    [Required, EmailAddress, MaxLength(180)] string Email,
    [Required, MaxLength(40)] string Phone,
    [MaxLength(80)] string? Division = "Dhaka",
    [Required, MaxLength(200)] string Subject = "General Inquiry",
    [Required, MaxLength(4000)] string Message = ""
);

public record ContactInquiryResponseDto(
    Guid Id,
    string TicketNumber,
    string Name,
    string Email,
    string Phone,
    string Division,
    string Subject,
    string Message,
    string Status,
    string Priority,
    string? AdminNotes,
    DateTime CreatedAtUtc,
    DateTime? ResolvedAtUtc
);

public record UpdateContactInquiryStatusDto(
    [Required] string Status,
    string? AdminNotes = null
);
