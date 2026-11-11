namespace TourFlow.Api.DTOs;

public record ChatTourCardDto(
    Guid Id,
    string Title,
    string Slug,
    string Destination,
    string Region,
    int DurationDays,
    int DurationNights,
    decimal EffectivePrice,
    string Currency,
    string? CoverImageUrl,
    DateTime? NextStartDate,
    int? NextAvailableSeats
);

public record ChatHotelCardDto(
    Guid Id,
    string Name,
    string Slug,
    string Location,
    string Tier,
    decimal PriceNumeric,
    string Currency,
    double Rating,
    string? CoverImage,
    string? RelatedTourSlug
);

public record ChatPromoChipDto(
    string Code,
    string Description,
    string DiscountLabel,
    int MinimumTravelers,
    string? ApplicableCategory
);

public record ChatBookingCardDto(
    Guid Id,
    string BookingReference,
    string TourTitle,
    string Status,
    string PaymentStatus,
    decimal TotalAmount,
    decimal DepositPaid,
    decimal BalanceRemaining,
    int NumberOfTravelers,
    DateTime? DepartureDate
);

public record ChatRichMetadata(
    List<ChatTourCardDto>? Tours = null,
    List<ChatHotelCardDto>? Hotels = null,
    List<ChatPromoChipDto>? Promos = null,
    List<ChatBookingCardDto>? Bookings = null,
    List<string>? SuggestedFollowUps = null,
    bool? UsedExternalLlm = null
);

public record ChatMessageDto(
    Guid Id,
    Guid? SessionId,
    string RoomId,
    Guid? SenderUserId,
    string SenderName,
    string SenderEmail,
    string SenderRole,
    string Message,
    ChatRichMetadata? Metadata,
    DateTime CreatedAtUtc
);

public record ChatSessionDto(
    Guid Id,
    string RoomId,
    Guid OwnerUserId,
    string OwnerName,
    string OwnerEmail,
    string Title,
    bool IsEscalatedToHuman,
    DateTime LastMessageAtUtc,
    DateTime CreatedAtUtc,
    int MessageCount,
    string? LastMessagePreview
);

public record CreateChatSessionRequest(
    string? Title = null,
    string? InitialMessage = null
);

public record AskChatbotRequest(
    string Message
);

public record AskChatbotResponse(
    ChatSessionDto Session,
    ChatMessageDto UserMessage,
    ChatMessageDto AssistantMessage
);

public record RealtimeNotificationDto(
    Guid Id,
    string Category,
    string Title,
    string Message,
    string? ActionUrl,
    bool IsRead,
    DateTime CreatedAtUtc,
    string? TargetRole
);

public record AdminBroadcastRequest(
    string Title,
    string Message,
    string? Category = "announcement",
    string? ActionUrl = null,
    string? TargetEmail = null,
    string? TargetRole = "All"
);

public record TypingIndicatorPayload(
    Guid? SessionId,
    string RoomId,
    string UserName,
    bool IsTyping,
    bool IsBot = false
);
