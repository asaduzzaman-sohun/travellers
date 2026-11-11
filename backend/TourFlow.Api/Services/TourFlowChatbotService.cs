using System.Globalization;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using TourFlow.Api.DTOs;
using TourFlow.Application.Bookings.Common;
using TourFlow.Domain.Entities;
using TourFlow.Infrastructure.Data;

namespace TourFlow.Api.Services;

public interface ITourFlowChatbotService
{
    Task<List<ChatSessionDto>> GetSessionsAsync(Guid callerUserId, string callerEmail, bool isAdmin, CancellationToken ct = default);
    Task<ChatSessionDto> CreateSessionAsync(Guid userId, string userEmail, string userName, CreateChatSessionRequest? request, CancellationToken ct = default);
    Task<List<ChatMessageDto>> GetSessionMessagesAsync(Guid sessionId, int take, CancellationToken ct = default);
    Task<AskChatbotResponse> AskAsync(ChatSession session, Guid callerUserId, string callerEmail, string callerName, string userMessage, CancellationToken ct = default);
    Task<ChatSessionDto> EscalateToHumanAsync(ChatSession session, string callerName, CancellationToken ct = default);
    Task<ChatSessionDto> ReplyAsHumanAsync(ChatSession session, Guid adminId, string adminEmail, string adminName, string adminRole, string message, CancellationToken ct = default);
}

internal sealed record ConversationSignals(
    string RawMessage,
    string SearchCorpus,
    List<string> Keywords,
    int? TravelerCount,
    decimal? BudgetCeiling,
    bool WantsBookings,
    bool WantsPromos,
    bool WantsHotels,
    bool WantsTips,
    bool WantsItinerary,
    bool IsGreetingOnly
);

/// <summary>
/// Grounded multi-turn AI Travel Concierge backed directly by live PostgreSQL catalog, schedule,
/// promo, travel-tip, and user-scoped booking data, with optional Gemini API prose enrichment.
/// </summary>
public partial class TourFlowChatbotService : ITourFlowChatbotService
{
    private const string BotName = "TourFlow AI Concierge";
    private const string BotEmail = "concierge@tourflow.ai";
    private const string BotRole = "Bot";
    private const string DefaultSessionTitle = "New Travel Concierge";

    private static readonly string[] KnownPlacesAndThemes =
    [
        "sylhet", "sreemangal", "bandarban", "rangamati", "sajek", "sundarban", "sundarbans",
        "cox", "coxs", "kuakata", "saint martin", "st martin", "paharpur", "barishal",
        "tanguar", "ratargul", "jaflong", "chattogram", "dhaka", "rajshahi", "khulna",
        "tea", "beach", "mountain", "hill", "heritage", "eco", "forest", "river",
        "island", "luxury", "resort", "wellness", "nature", "adventure", "family"
    ];

    private static readonly HashSet<string> StopWords = new(StringComparer.OrdinalIgnoreCase)
    {
        "the", "and", "for", "with", "that", "this", "from", "have", "what", "when", "where",
        "which", "about", "there", "please", "could", "would", "should", "can", "you", "your",
        "tour", "tours", "trip", "trips", "need", "want", "show", "give", "find", "best",
        "tell", "more", "some", "any", "into", "help", "me", "my", "are", "how", "much"
    };

    private readonly TourFlowDbContext _context;
    private readonly IRealtimeNotifier _notifier;
    private readonly IConfiguration _configuration;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<TourFlowChatbotService> _logger;

    public TourFlowChatbotService(
        TourFlowDbContext context,
        IRealtimeNotifier notifier,
        IConfiguration configuration,
        IHttpClientFactory httpClientFactory,
        ILogger<TourFlowChatbotService> logger)
    {
        _context = context;
        _notifier = notifier;
        _configuration = configuration;
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    public async Task<List<ChatSessionDto>> GetSessionsAsync(
        Guid callerUserId,
        string callerEmail,
        bool isAdmin,
        CancellationToken ct = default)
    {
        var normalizedEmail = (callerEmail ?? string.Empty).Trim().ToLowerInvariant();

        var sessions = await _context.ChatSessions
            .AsNoTracking()
            .Where(s =>
                (callerUserId != Guid.Empty && s.OwnerUserId == callerUserId)
                || (!string.IsNullOrWhiteSpace(normalizedEmail) && s.OwnerEmail == normalizedEmail)
                || (isAdmin && s.IsEscalatedToHuman))
            .OrderByDescending(s => s.LastMessageAtUtc)
            .Take(40)
            .Select(s => new
            {
                Session = s,
                MessageCount = s.Messages.Count,
                LastPreview = s.Messages
                    .OrderByDescending(m => m.CreatedAtUtc)
                    .Select(m => m.Message)
                    .FirstOrDefault()
            })
            .ToListAsync(ct);

        return sessions.Select(item => MapSessionDto(
            item.Session,
            item.MessageCount,
            TruncatePreview(item.LastPreview)
        )).ToList();
    }

    public async Task<ChatSessionDto> CreateSessionAsync(
        Guid userId,
        string userEmail,
        string userName,
        CreateChatSessionRequest? request,
        CancellationToken ct = default)
    {
        var cleanTitle = string.IsNullOrWhiteSpace(request?.Title)
            ? DefaultSessionTitle
            : Truncate(request.Title.Trim(), 140);

        var session = new ChatSession
        {
            OwnerUserId = userId,
            OwnerEmail = (userEmail ?? string.Empty).Trim().ToLowerInvariant(),
            OwnerName = Truncate(string.IsNullOrWhiteSpace(userName) ? "Traveler" : userName.Trim(), 120),
            Title = cleanTitle,
            IsEscalatedToHuman = false,
            LastMessageAtUtc = DateTime.UtcNow
        };

        _context.ChatSessions.Add(session);
        await _context.SaveChangesAsync(ct);

        if (string.IsNullOrWhiteSpace(request?.InitialMessage))
        {
            var welcomeMetadata = new ChatRichMetadata(
                SuggestedFollowUps:
                [
                    "Show me tours under 15,000 BDT",
                    "What promo codes work for 4 travelers?",
                    "Recommend eco resorts in Sylhet or Sajek",
                    "Check my bookings and remaining balance"
                ]
            );

            await _notifier.PublishChatMessageAsync(new ChatMessagePublishRequest(
                RoomId: RealtimeRoomPolicy.SessionRoom(session.Id),
                SenderUserId: null,
                SenderName: BotName,
                SenderEmail: BotEmail,
                SenderRole: BotRole,
                Message: $"Hello **{session.OwnerName}** — I am your **TourFlow AI Concierge**. Ask me about curated Bangladesh tours, live seat availability, resorts, group promo discounts, packing tips, or your own booking balances.",
                SessionId: session.Id,
                Metadata: welcomeMetadata
            ), ct);

            session.LastMessageAtUtc = DateTime.UtcNow;
            await _context.SaveChangesAsync(ct);

            return MapSessionDto(session, 1, "Hello — I am your TourFlow AI Concierge...");
        }

        var response = await AskAsync(session, userId, session.OwnerEmail, session.OwnerName, request.InitialMessage, ct);
        return response.Session;
    }

    public async Task<List<ChatMessageDto>> GetSessionMessagesAsync(
        Guid sessionId,
        int take,
        CancellationToken ct = default)
    {
        var clampedTake = Math.Clamp(take, 1, 150);
        var recentDesc = await _context.ChatMessages
            .AsNoTracking()
            .Where(m => m.SessionId == sessionId)
            .OrderByDescending(m => m.CreatedAtUtc)
            .Take(clampedTake)
            .ToListAsync(ct);

        recentDesc.Reverse();
        return recentDesc.Select(MapMessageDto).ToList();
    }

    public async Task<AskChatbotResponse> AskAsync(
        ChatSession session,
        Guid callerUserId,
        string callerEmail,
        string callerName,
        string userMessage,
        CancellationToken ct = default)
    {
        var cleanPrompt = Truncate((userMessage ?? string.Empty).Trim(), 2000);
        if (string.IsNullOrWhiteSpace(cleanPrompt))
        {
            throw new ArgumentException("Prompt cannot be empty.", nameof(userMessage));
        }

        // Load recent conversation turns BEFORE inserting current message so multi-turn follow-ups inherit location/group context.
        var recentHistory = await _context.ChatMessages
            .AsNoTracking()
            .Where(m => m.SessionId == session.Id)
            .OrderByDescending(m => m.CreatedAtUtc)
            .Take(6)
            .ToListAsync(ct);
        recentHistory.Reverse();

        var roomId = RealtimeRoomPolicy.SessionRoom(session.Id);
        if (string.Equals(session.Title, DefaultSessionTitle, StringComparison.Ordinal))
        {
            session.Title = DeriveTitleFromPrompt(cleanPrompt);
        }

        var userDto = await _notifier.PublishChatMessageAsync(new ChatMessagePublishRequest(
            RoomId: roomId,
            SenderUserId: callerUserId == Guid.Empty ? null : callerUserId,
            SenderName: callerName,
            SenderEmail: callerEmail,
            SenderRole: "Traveler",
            Message: cleanPrompt,
            SessionId: session.Id,
            Metadata: null,
            NotifyAdminOnEscalation: session.IsEscalatedToHuman
        ), ct);

        await _notifier.PublishTypingAsync(new TypingIndicatorPayload(
            SessionId: session.Id,
            RoomId: roomId,
            UserName: BotName,
            IsTyping: true,
            IsBot: true
        ), ct);

        try
        {
            var signals = ExtractSignals(cleanPrompt, recentHistory);

            var bookings = signals.WantsBookings
                ? await QueryUserBookingsAsync(session.OwnerUserId, session.OwnerEmail, ct)
                : new List<ChatBookingCardDto>();

            var tours = signals.IsGreetingOnly
                ? new List<ChatTourCardDto>()
                : await QueryRelevantToursAsync(signals, ct);

            var hotels = (signals.WantsHotels || (!signals.IsGreetingOnly && !signals.WantsBookings && tours.Count <= 1))
                ? await QueryRelevantHotelsAsync(signals, ct)
                : new List<ChatHotelCardDto>();

            var (promos, promoSummaryLines) = (signals.WantsPromos || signals.TravelerCount.HasValue || tours.Count > 0)
                ? await QueryRelevantPromosAsync(signals, tours, ct)
                : (new List<ChatPromoChipDto>(), new List<string>());

            var tips = (signals.WantsTips || signals.Keywords.Any(k => KnownPlacesAndThemes.Contains(k, StringComparer.OrdinalIgnoreCase)))
                ? await QueryRelevantTipsAsync(signals, ct)
                : new List<TravelTip>();

            var geminiReply = await TryGenerateGeminiReplyAsync(
                cleanPrompt,
                session.OwnerName,
                recentHistory,
                signals,
                tours,
                hotels,
                promos,
                promoSummaryLines,
                bookings,
                tips,
                ct);

            var finalReplyText = !string.IsNullOrWhiteSpace(geminiReply)
                ? geminiReply!
                : BuildDeterministicGroundedReply(
                    session.OwnerName,
                    signals,
                    tours,
                    hotels,
                    promos,
                    promoSummaryLines,
                    bookings,
                    tips);

            var suggestions = BuildFollowUpSuggestions(signals, tours, promos, bookings);

            var metadata = new ChatRichMetadata(
                Tours: tours.Count > 0 ? tours : null,
                Hotels: hotels.Count > 0 ? hotels : null,
                Promos: promos.Count > 0 ? promos : null,
                Bookings: bookings.Count > 0 ? bookings : null,
                SuggestedFollowUps: suggestions,
                UsedExternalLlm: !string.IsNullOrWhiteSpace(geminiReply)
            );

            var assistantDto = await _notifier.PublishChatMessageAsync(new ChatMessagePublishRequest(
                RoomId: roomId,
                SenderUserId: null,
                SenderName: BotName,
                SenderEmail: BotEmail,
                SenderRole: BotRole,
                Message: finalReplyText,
                SessionId: session.Id,
                Metadata: metadata
            ), ct);

            session.LastMessageAtUtc = assistantDto.CreatedAtUtc;
            await _context.SaveChangesAsync(ct);

            var messageCount = await _context.ChatMessages.CountAsync(m => m.SessionId == session.Id, ct);
            var sessionDto = MapSessionDto(session, messageCount, TruncatePreview(assistantDto.Message));

            return new AskChatbotResponse(sessionDto, userDto, assistantDto);
        }
        finally
        {
            await _notifier.PublishTypingAsync(new TypingIndicatorPayload(
                SessionId: session.Id,
                RoomId: roomId,
                UserName: BotName,
                IsTyping: false,
                IsBot: true
            ), ct);
        }
    }

    public async Task<ChatSessionDto> EscalateToHumanAsync(
        ChatSession session,
        string callerName,
        CancellationToken ct = default)
    {
        if (!session.IsEscalatedToHuman)
        {
            session.IsEscalatedToHuman = true;
            session.LastMessageAtUtc = DateTime.UtcNow;
            await _context.SaveChangesAsync(ct);

            await _notifier.PublishChatMessageAsync(new ChatMessagePublishRequest(
                RoomId: RealtimeRoomPolicy.SessionRoom(session.Id),
                SenderUserId: null,
                SenderName: BotName,
                SenderEmail: BotEmail,
                SenderRole: BotRole,
                Message: "I have flagged this conversation for a human **TourFlow Travel Specialist**. An administrator has received a live alert and can join this exact thread with full trip context.",
                SessionId: session.Id,
                Metadata: new ChatRichMetadata(SuggestedFollowUps:
                [
                    "Share preferred travel dates while waiting",
                    "Check refund or payment confirmation policy"
                ])
            ), ct);
        }

        await _notifier.PublishNotificationAsync(new RealtimeNotificationPublishRequest(
            TargetUserId: null,
            TargetEmail: null,
            TargetRole: "Admin",
            Category: "chat",
            Title: $"Human Concierge Requested · {callerName}",
            Message: $"Traveler requested human assistance in thread \"{session.Title}\".",
            ActionUrl: $"/concierge?session={session.Id:D}"
        ), ct);

        var count = await _context.ChatMessages.CountAsync(m => m.SessionId == session.Id, ct);
        return MapSessionDto(session, count, "Escalated to human travel specialist.");
    }

    public async Task<ChatSessionDto> ReplyAsHumanAsync(
        ChatSession session,
        Guid adminId,
        string adminEmail,
        string adminName,
        string adminRole,
        string message,
        CancellationToken ct = default)
    {
        var dto = await _notifier.PublishChatMessageAsync(new ChatMessagePublishRequest(
            RoomId: RealtimeRoomPolicy.SessionRoom(session.Id),
            SenderUserId: adminId == Guid.Empty ? null : adminId,
            SenderName: adminName,
            SenderEmail: adminEmail,
            SenderRole: adminRole,
            Message: message,
            SessionId: session.Id
        ), ct);

        session.LastMessageAtUtc = dto.CreatedAtUtc;
        await _context.SaveChangesAsync(ct);

        await _notifier.PublishNotificationAsync(new RealtimeNotificationPublishRequest(
            TargetUserId: session.OwnerUserId,
            TargetEmail: session.OwnerEmail,
            TargetRole: null,
            Category: "chat",
            Title: $"Reply from {adminName}",
            Message: Truncate(dto.Message, 160),
            ActionUrl: $"/concierge?session={session.Id:D}"
        ), ct);

        var count = await _context.ChatMessages.CountAsync(m => m.SessionId == session.Id, ct);
        return MapSessionDto(session, count, TruncatePreview(dto.Message));
    }

    private static ConversationSignals ExtractSignals(string message, IReadOnlyList<ChatMessage> recentHistory)
    {
        var lower = message.ToLowerInvariant();
        var recentUserTurns = string.Join(
            " ",
            recentHistory
                .Where(m => !string.Equals(m.SenderRole, BotRole, StringComparison.OrdinalIgnoreCase))
                .Select(m => m.Message.ToLowerInvariant()));

        // Combine current prompt with recent user context when the prompt looks like a follow-up.
        var combined = $"{lower} {recentUserTurns}".Trim();

        var tokens = Regex.Matches(lower, @"[a-z0-9']+")
            .Select(m => m.Value.Trim('\''))
            .Where(w => w.Length >= 3 && !StopWords.Contains(w))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        // Inherit known destinations/themes from recent turns when current turn lacks an explicit place keyword.
        if (!tokens.Any(t => KnownPlacesAndThemes.Contains(t, StringComparer.OrdinalIgnoreCase)))
        {
            foreach (var place in KnownPlacesAndThemes)
            {
                if (recentUserTurns.Contains(place, StringComparison.OrdinalIgnoreCase) && !tokens.Contains(place, StringComparer.OrdinalIgnoreCase))
                {
                    tokens.Add(place);
                }
            }
        }

        int? travelerCount = null;
        var countMatch = TravelerCountRegex().Match(lower);
        if (countMatch.Success && int.TryParse(countMatch.Groups[1].Value, out var parsedCount) && parsedCount is >= 1 and <= 40)
        {
            travelerCount = parsedCount;
        }
        else if (lower.Contains("couple") || lower.Contains("honeymoon") || lower.Contains("two of us"))
        {
            travelerCount = 2;
        }
        else if (lower.Contains("solo") || lower.Contains("just me"))
        {
            travelerCount = 1;
        }

        decimal? budget = null;
        var budgetMatch = BudgetRegex().Match(lower);
        if (budgetMatch.Success)
        {
            var rawDigits = budgetMatch.Groups[1].Value.Replace(",", "");
            if (decimal.TryParse(rawDigits, NumberStyles.Number, CultureInfo.InvariantCulture, out var amount))
            {
                if (budgetMatch.Groups[2].Success && budgetMatch.Groups[2].Value.Equals("k", StringComparison.OrdinalIgnoreCase))
                {
                    amount *= 1000m;
                }
                if (amount >= 1000m && amount <= 500000m)
                {
                    budget = amount;
                }
            }
        }

        var wantsBookings = ContainsAny(lower, "booking", "reservation", "my trip", "my tour", "ticket", "voucher", "balance", "deposit", "payment", "paid", "status", "tf-");
        var wantsPromos = ContainsAny(lower, "promo", "coupon", "discount", "code", "offer", "deal", "cheaper", "save");
        var wantsHotels = ContainsAny(lower, "hotel", "resort", "stay", "room", "accommodation", "lodge", "villa");
        var wantsTips = ContainsAny(lower, "tip", "pack", "packing", "safety", "advice", "season", "weather", "best time", "checklist");
        var wantsItinerary = ContainsAny(lower, "itinerary", "schedule", "day ", "included", "inclusion", "plan");

        var isGreeting = GreetingRegex().IsMatch(lower.Trim())
            && tokens.Count <= 1
            && !wantsBookings
            && !wantsPromos
            && !wantsHotels
            && !wantsTips
            && budget == null
            && travelerCount == null;

        return new ConversationSignals(
            RawMessage: message,
            SearchCorpus: combined,
            Keywords: tokens,
            TravelerCount: travelerCount,
            BudgetCeiling: budget,
            WantsBookings: wantsBookings,
            WantsPromos: wantsPromos,
            WantsHotels: wantsHotels,
            WantsTips: wantsTips,
            WantsItinerary: wantsItinerary,
            IsGreetingOnly: isGreeting
        );
    }

    private async Task<List<ChatTourCardDto>> QueryRelevantToursAsync(ConversationSignals signals, CancellationToken ct)
    {
        var tours = await _context.TourPackages
            .AsNoTracking()
            .Include(t => t.Schedules)
            .Where(t => t.IsActive)
            .ToListAsync(ct);

        var now = DateTime.UtcNow.AddDays(-1);
        var scored = tours
            .Select(t =>
            {
                var effectivePrice = t.DiscountPrice ?? t.BasePrice;
                var categoryText = t.Category.ToString();
                var highlightsText = t.Highlights.Count > 0 ? string.Join(" ", t.Highlights) : string.Empty;
                var haystack = $"{t.Title} {t.Destination} {t.Region} {categoryText} {t.Summary} {highlightsText} {t.IdealSeason}".ToLowerInvariant();
                var score = 0;

                foreach (var kw in signals.Keywords)
                {
                    if (t.Title.Contains(kw, StringComparison.OrdinalIgnoreCase) || t.Destination.Contains(kw, StringComparison.OrdinalIgnoreCase))
                        score += 6;
                    else if (t.Region.Contains(kw, StringComparison.OrdinalIgnoreCase) || categoryText.Contains(kw, StringComparison.OrdinalIgnoreCase))
                        score += 4;
                    else if (haystack.Contains(kw, StringComparison.OrdinalIgnoreCase))
                        score += 2;
                }

                if (signals.BudgetCeiling.HasValue)
                {
                    if (effectivePrice <= signals.BudgetCeiling.Value) score += 3;
                    else score -= 4;
                }

                if (t.IsFeatured) score += 1;

                var nextSchedule = t.Schedules
                    .Where(s => s.StartDate >= now && s.AvailableSeats > 0)
                    .OrderBy(s => s.StartDate)
                    .FirstOrDefault()
                    ?? t.Schedules.OrderByDescending(s => s.StartDate).FirstOrDefault();

                return new { Tour = t, EffectivePrice = effectivePrice, NextSchedule = nextSchedule, Score = score };
            })
            .Where(x => !signals.BudgetCeiling.HasValue || x.EffectivePrice <= signals.BudgetCeiling.Value * 1.15m)
            .OrderByDescending(x => x.Score)
            .ThenBy(x => x.EffectivePrice)
            .Take(3)
            .ToList();

        return scored.Select(x => new ChatTourCardDto(
            x.Tour.Id,
            x.Tour.Title,
            x.Tour.Slug,
            x.Tour.Destination,
            x.Tour.Region,
            x.Tour.DurationDays,
            x.Tour.DurationNights,
            x.EffectivePrice,
            "BDT",
            x.Tour.CoverImageUrl,
            x.NextSchedule?.StartDate,
            x.NextSchedule?.AvailableSeats
        )).ToList();
    }

    private async Task<List<ChatHotelCardDto>> QueryRelevantHotelsAsync(ConversationSignals signals, CancellationToken ct)
    {
        var hotels = await _context.Hotels
            .AsNoTracking()
            .Where(h => h.IsActive)
            .ToListAsync(ct);

        var ranked = hotels
            .Select(h =>
            {
                var amenitiesText = h.Amenities.Count > 0 ? string.Join(" ", h.Amenities) : string.Empty;
                var haystack = $"{h.Name} {h.Location} {h.Place} {h.Tier} {h.Description} {amenitiesText}".ToLowerInvariant();
                var score = signals.Keywords.Sum(kw => haystack.Contains(kw, StringComparison.OrdinalIgnoreCase) ? 4 : 0);
                if (signals.BudgetCeiling.HasValue && h.PriceNumeric <= signals.BudgetCeiling.Value) score += 2;
                return new { Hotel = h, Score = score };
            })
            .OrderByDescending(x => x.Score)
            .ThenByDescending(x => x.Hotel.Rating)
            .Take(3)
            .Select(x => new ChatHotelCardDto(
                x.Hotel.Id,
                x.Hotel.Name,
                x.Hotel.Slug,
                x.Hotel.Location,
                x.Hotel.Tier,
                x.Hotel.PriceNumeric,
                "BDT",
                x.Hotel.Rating,
                x.Hotel.CoverImage,
                x.Hotel.RelatedTourSlug
            ))
            .ToList();

        return ranked;
    }

    private async Task<(List<ChatPromoChipDto> Promos, List<string> SavingsLines)> QueryRelevantPromosAsync(
        ConversationSignals signals,
        IReadOnlyList<ChatTourCardDto> matchedTours,
        CancellationToken ct)
    {
        var now = DateTime.UtcNow;
        var promos = await _context.PromoCodes
            .AsNoTracking()
            .Where(p => p.IsActive && (!p.ExpiresAtUtc.HasValue || p.ExpiresAtUtc >= now) && p.TimesUsed < p.MaxUses)
            .OrderBy(p => p.MinimumTravelers)
            .ThenByDescending(p => p.DiscountValue)
            .Take(5)
            .ToListAsync(ct);

        var chips = promos.Select(p =>
        {
            var discountLabel = string.Equals(p.DiscountType, "Flat", StringComparison.OrdinalIgnoreCase)
                ? $"BDT {p.DiscountValue:N0} OFF"
                : $"{p.DiscountValue:0.##}% OFF";
            return new ChatPromoChipDto(
                p.Code,
                Truncate(p.Description, 90),
                discountLabel,
                p.MinimumTravelers,
                p.ApplicableCategory
            );
        }).ToList();

        var savingsLines = new List<string>();
        var sampleTour = matchedTours.FirstOrDefault();
        var travelers = signals.TravelerCount ?? 2;

        if (sampleTour != null && promos.Count > 0)
        {
            var gross = sampleTour.EffectivePrice * travelers;
            foreach (var promo in promos.Take(3))
            {
                var eval = PromoCodeCalculator.Evaluate(promo, gross, travelers, null, now);
                if (eval.IsValid)
                {
                    savingsLines.Add(
                        $"Code **{eval.NormalizedCode}** saves **BDT {eval.DiscountAmount:N0}** for {travelers} travelers on {sampleTour.Title} (Total: BDT {eval.FinalTotal:N0}).");
                }
                else
                {
                    savingsLines.Add($"Code **{promo.Code}**: {eval.Message}");
                }
            }
        }

        return (chips, savingsLines);
    }

    private async Task<List<TravelTip>> QueryRelevantTipsAsync(ConversationSignals signals, CancellationToken ct)
    {
        var tips = await _context.TravelTips
            .AsNoTracking()
            .Where(t => t.IsActive)
            .ToListAsync(ct);

        return tips
            .Select(t =>
            {
                var packingText = t.PackingList.Count > 0 ? string.Join(" ", t.PackingList) : string.Empty;
                var haystack = $"{t.Title} {t.Division} {t.Category} {t.Summary} {packingText}".ToLowerInvariant();
                var score = signals.Keywords.Sum(kw => haystack.Contains(kw, StringComparison.OrdinalIgnoreCase) ? 4 : 0);
                return new { Tip = t, Score = score };
            })
            .OrderByDescending(x => x.Score)
            .Take(2)
            .Select(x => x.Tip)
            .ToList();
    }

    private async Task<List<ChatBookingCardDto>> QueryUserBookingsAsync(
        Guid userId,
        string userEmail,
        CancellationToken ct)
    {
        var normalizedEmail = (userEmail ?? string.Empty).Trim().ToLowerInvariant();

        // Strictly isolated to the owning user's UserId or CustomerEmail — never exposes third-party PII.
        return await _context.Bookings
            .AsNoTracking()
            .Where(b =>
                (userId != Guid.Empty && b.UserId == userId)
                || (!string.IsNullOrWhiteSpace(normalizedEmail) && b.CustomerEmail.ToLower() == normalizedEmail))
            .OrderByDescending(b => b.CreatedAtUtc)
            .Take(3)
            .Select(b => new ChatBookingCardDto(
                b.Id,
                b.BookingReference,
                b.TourPackage != null ? b.TourPackage.Title : "Curated Tour Package",
                b.Status.ToString(),
                b.PaymentStatus.ToString(),
                b.TotalAmount,
                b.DepositPaid,
                b.BalanceRemaining,
                b.NumberOfTravelers,
                b.TourSchedule != null ? b.TourSchedule.StartDate : null
            ))
            .ToListAsync(ct);
    }

    private async Task<string?> TryGenerateGeminiReplyAsync(
        string prompt,
        string travelerName,
        IReadOnlyList<ChatMessage> recentHistory,
        ConversationSignals signals,
        IReadOnlyList<ChatTourCardDto> tours,
        IReadOnlyList<ChatHotelCardDto> hotels,
        IReadOnlyList<ChatPromoChipDto> promos,
        IReadOnlyList<string> promoSavings,
        IReadOnlyList<ChatBookingCardDto> bookings,
        IReadOnlyList<TravelTip> tips,
        CancellationToken ct)
    {
        var apiKey = _configuration["Gemini:ApiKey"] ?? Environment.GetEnvironmentVariable("GEMINI_API_KEY");
        if (string.IsNullOrWhiteSpace(apiKey) || apiKey.StartsWith("YOUR_", StringComparison.OrdinalIgnoreCase))
        {
            return null;
        }

        try
        {
            var groundedContext = JsonSerializer.Serialize(new
            {
                travelerName,
                detectedTravelerCount = signals.TravelerCount,
                detectedBudgetBdt = signals.BudgetCeiling,
                matchedTours = tours,
                matchedHotels = hotels,
                activePromos = promos,
                promoCalculations = promoSavings,
                userOwnBookings = bookings,
                relevantTravelTips = tips.Select(t => new { t.Title, t.Division, t.Summary, t.PackingList, t.SafetyDirectives })
            }, RealtimeNotificationService.JsonOptions);

            var historyBlock = string.Join("\n", recentHistory.Select(m => $"{m.SenderRole}: {m.Message}"));
            var systemInstruction = """
                You are TourFlow AI Concierge, an authorized Bangladesh travel assistant.
                Answer in concise, clear Markdown using ONLY the grounded JSON database records provided below.
                Do not invent tour prices, seat counts, promo codes, or booking statuses. Use BDT currency formatting.
                """;

            var payload = new
            {
                system_instruction = new { parts = new[] { new { text = systemInstruction } } },
                contents = new[]
                {
                    new
                    {
                        role = "user",
                        parts = new[]
                        {
                            new
                            {
                                text = $"Recent turns:\n{historyBlock}\n\nGrounded TourFlow DB JSON:\n{groundedContext}\n\nTraveler question: {prompt}"
                            }
                        }
                    }
                },
                generationConfig = new { temperature = 0.25, maxOutputTokens = 450 }
            };

            var client = _httpClientFactory.CreateClient("GeminiConcierge");
            using var req = new HttpRequestMessage(
                HttpMethod.Post,
                $"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key={Uri.EscapeDataString(apiKey)}")
            {
                Content = JsonContent.Create(payload)
            };

            using var resp = await client.SendAsync(req, ct);
            if (!resp.IsSuccessStatusCode)
            {
                return null;
            }

            using var doc = await JsonDocument.ParseAsync(await resp.Content.ReadAsStreamAsync(ct), cancellationToken: ct);
            if (doc.RootElement.TryGetProperty("candidates", out var candidates) && candidates.GetArrayLength() > 0)
            {
                var text = candidates[0]
                    .GetProperty("content")
                    .GetProperty("parts")[0]
                    .GetProperty("text")
                    .GetString();
                return string.IsNullOrWhiteSpace(text) ? null : Truncate(text.Trim(), 3500);
            }
        }
        catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException or JsonException or KeyNotFoundException)
        {
            _logger.LogDebug(ex, "External Gemini enrichment unavailable; using deterministic grounded concierge reply.");
        }

        return null;
    }

    private static string BuildDeterministicGroundedReply(
        string travelerName,
        ConversationSignals signals,
        IReadOnlyList<ChatTourCardDto> tours,
        IReadOnlyList<ChatHotelCardDto> hotels,
        IReadOnlyList<ChatPromoChipDto> promos,
        IReadOnlyList<string> promoSavings,
        IReadOnlyList<ChatBookingCardDto> bookings,
        IReadOnlyList<TravelTip> tips)
    {
        if (signals.IsGreetingOnly)
        {
            return $"Welcome back, **{travelerName}**! Tell me your destination, budget in BDT, or group size and I will pull live TourFlow departures, verified resort matches, promo savings, or your private booking status.";
        }

        var sb = new StringBuilder();

        if (signals.WantsBookings)
        {
            if (bookings.Count == 0)
            {
                sb.AppendLine($"I checked your private **TourFlow account** (`{travelerName}`) and did not find any active bookings yet. Ready to plan one? Here are our top curated options right now:");
            }
            else
            {
                sb.AppendLine($"Here are your latest verified **TourFlow bookings** (scoped strictly to your account):");
                foreach (var b in bookings)
                {
                    var dateText = b.DepartureDate.HasValue ? $" · Departs {b.DepartureDate.Value:dd MMM yyyy}" : string.Empty;
                    sb.AppendLine($"- **{b.BookingReference}** — {b.TourTitle} · Status: **{b.Status}** ({b.PaymentStatus}) · Paid **BDT {b.DepositPaid:N0}**, Balance **BDT {b.BalanceRemaining:N0}**{dateText}");
                }
            }
        }

        if (tours.Count > 0 && (!signals.WantsBookings || bookings.Count == 0))
        {
            var qualifiers = new List<string>();
            if (signals.TravelerCount.HasValue) qualifiers.Add($"for **{signals.TravelerCount.Value} travelers**");
            if (signals.BudgetCeiling.HasValue) qualifiers.Add($"around **BDT {signals.BudgetCeiling.Value:N0}**");
            var qualifierText = qualifiers.Count > 0 ? $" {string.Join(" ", qualifiers)}" : string.Empty;

            sb.AppendLine($"Based on live **TourFlow** inventory{qualifierText}, here are the strongest tour matches:");
            foreach (var t in tours)
            {
                var sched = t.NextStartDate.HasValue
                    ? $"Next departure **{t.NextStartDate.Value:dd MMM yyyy}** ({t.NextAvailableSeats ?? 0} seats left)"
                    : "Custom private departure available";
                sb.AppendLine($"- **{t.Title}** ({t.Destination}) — **BDT {t.EffectivePrice:N0}**/person · {t.DurationDays}D/{t.DurationNights}N · {sched}");
            }
        }
        else if (!signals.WantsBookings && !signals.WantsHotels && !signals.WantsPromos && !signals.WantsTips)
        {
            sb.AppendLine($"No exact tour matched **BDT {signals.BudgetCeiling ?? 0:N0}** for those criteria right now — try raising your budget slightly or switching regions (Sylhet, Bandarban, Sundarbans, Cox's Bazar).");
        }

        if (hotels.Count > 0 && (signals.WantsHotels || tours.Count == 0))
        {
            sb.AppendLine();
            sb.AppendLine("**Recommended Partner Stays & Resorts:**");
            foreach (var h in hotels)
            {
                sb.AppendLine($"- **{h.Name}** ({h.Location}) — **BDT {h.PriceNumeric:N0}**/night · Rating {h.Rating:0.0}/5 · {h.Tier} Tier");
            }
        }

        if (promos.Count > 0 && (signals.WantsPromos || signals.TravelerCount.HasValue))
        {
            sb.AppendLine();
            sb.AppendLine("**Verified Promo & Group Savings:**");
            if (promoSavings.Count > 0)
            {
                foreach (var line in promoSavings)
                {
                    sb.AppendLine($"- {line}");
                }
            }
            else
            {
                foreach (var p in promos.Take(3))
                {
                    sb.AppendLine($"- **{p.Code}** ({p.DiscountLabel}) — {p.Description} (Min {p.MinimumTravelers} travelers)");
                }
            }
        }

        if (tips.Count > 0)
        {
            sb.AppendLine();
            sb.AppendLine("**Essential Preparation & Safety Directives:**");
            foreach (var tip in tips)
            {
                sb.AppendLine($"- **{tip.Title} ({tip.Division})**: {tip.Summary}");
                if (tip.PackingList.Count > 0)
                {
                    sb.AppendLine($"  Packing: {Truncate(string.Join(", ", tip.PackingList), 160)}");
                }
            }
        }

        var result = sb.ToString().Trim();
        return string.IsNullOrWhiteSpace(result)
            ? "I searched our live TourFlow catalog and couldn't pinpoint an exact match. Try asking about Sylhet, Bandarban, Cox's Bazar, active promo codes, or your booking status."
            : result;
    }

    private static List<string> BuildFollowUpSuggestions(
        ConversationSignals signals,
        IReadOnlyList<ChatTourCardDto> tours,
        IReadOnlyList<ChatPromoChipDto> promos,
        IReadOnlyList<ChatBookingCardDto> bookings)
    {
        var list = new List<string>();
        var topTour = tours.FirstOrDefault();

        if (!signals.WantsPromos && promos.Count > 0 && topTour != null)
        {
            list.Add($"Calculate {promos[0].Code} savings for 4 travelers on {topTour.Destination}");
        }

        if (!signals.WantsHotels && topTour != null)
        {
            list.Add($"Show top hotels in {topTour.Destination}");
        }

        if (!signals.WantsTips && topTour != null)
        {
            list.Add($"What should I pack for {topTour.Destination}?");
        }

        if (!signals.WantsBookings && bookings.Count == 0)
        {
            list.Add("Check my bookings and balances");
        }

        return list.Distinct().Take(3).ToList();
    }

    private static ChatSessionDto MapSessionDto(ChatSession session, int messageCount, string? lastPreview) =>
        new(
            session.Id,
            RealtimeRoomPolicy.SessionRoom(session.Id),
            session.OwnerUserId,
            session.OwnerName,
            session.OwnerEmail,
            session.Title,
            session.IsEscalatedToHuman,
            session.LastMessageAtUtc,
            session.CreatedAtUtc,
            messageCount,
            lastPreview
        );

    private static ChatMessageDto MapMessageDto(ChatMessage entity)
    {
        ChatRichMetadata? metadata = null;
        if (!string.IsNullOrWhiteSpace(entity.MetadataJson))
        {
            try
            {
                metadata = JsonSerializer.Deserialize<ChatRichMetadata>(entity.MetadataJson, RealtimeNotificationService.JsonOptions);
            }
            catch (JsonException)
            {
                metadata = null;
            }
        }

        return new ChatMessageDto(
            entity.Id,
            entity.SessionId,
            entity.RoomId,
            entity.SenderUserId,
            entity.SenderName,
            entity.SenderEmail,
            entity.SenderRole,
            entity.Message,
            metadata,
            entity.CreatedAtUtc
        );
    }

    private static string DeriveTitleFromPrompt(string prompt)
    {
        var clean = Regex.Replace(prompt, @"\s+", " ").Trim();
        return clean.Length <= 52 ? clean : $"{clean[..49].TrimEnd()}...";
    }

    private static string? TruncatePreview(string? text)
    {
        if (string.IsNullOrWhiteSpace(text)) return null;
        var clean = Regex.Replace(text.Replace("**", string.Empty), @"\s+", " ").Trim();
        return clean.Length <= 88 ? clean : $"{clean[..85].TrimEnd()}...";
    }

    private static bool ContainsAny(string text, params string[] terms) =>
        terms.Any(term => text.Contains(term, StringComparison.OrdinalIgnoreCase));

    private static string Truncate(string value, int maxLength) =>
        value.Length <= maxLength ? value : value[..maxLength];

    [GeneratedRegex(@"\b(\d{1,2})\s*(?:travelers?|people|persons?|guests?|adults?|friends?|pax|members?)\b|\bfor\s+(\d{1,2})\b", RegexOptions.IgnoreCase)]
    private static partial Regex TravelerCountRegex();

    [GeneratedRegex(@"(?:under|below|max|within|around|budget|upto|up\s*to)\s*(?:bdt|tk|taka)?\s*(\d[\d,]*)(k)?\b|(\d[\d,]*)(k)?\s*(?:bdt|tk|taka)", RegexOptions.IgnoreCase)]
    private static partial Regex BudgetRegex();

    [GeneratedRegex(@"^(?:hi|hello|hey|assalamu\s*alaikum|good\s*(?:morning|afternoon|evening)|help)\b[\s!?.]*$", RegexOptions.IgnoreCase)]
    private static partial Regex GreetingRegex();
}
