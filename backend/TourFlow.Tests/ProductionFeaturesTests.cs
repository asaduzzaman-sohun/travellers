using System.Security.Claims;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using TourFlow.Api.Controllers;
using TourFlow.Api.DTOs;
using TourFlow.Api.Hubs;
using TourFlow.Api.Services;
using TourFlow.Domain.Entities;
using TourFlow.Domain.Enums;
using TourFlow.Infrastructure.Data;
using TourFlow.Infrastructure.Services;

namespace TourFlow.Tests;

public class ProductionFeaturesTests
{
    private static TourFlowDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<TourFlowDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new TourFlowDbContext(options);
    }

    private static ClaimsPrincipal BuildPrincipal(Guid userId, string email, string name, string role = "User") =>
        new(new ClaimsIdentity(new[]
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim(ClaimTypes.Email, email),
            new Claim(ClaimTypes.Name, name),
            new Claim(ClaimTypes.Role, role)
        }, "TestAuth"));

    private static IRealtimeNotifier CreateNotifier(TourFlowDbContext context)
    {
        var proxyMock = new Mock<IClientProxy>();
        proxyMock
            .Setup(p => p.SendCoreAsync(It.IsAny<string>(), It.IsAny<object?[]>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);
        var clientsMock = new Mock<IHubClients>();
        clientsMock.Setup(c => c.Groups(It.IsAny<IReadOnlyList<string>>())).Returns(proxyMock.Object);
        var hubMock = new Mock<IHubContext<TourFlowHub>>();
        hubMock.SetupGet(h => h.Clients).Returns(clientsMock.Object);
        return new RealtimeNotificationService(context, hubMock.Object, NullLogger<RealtimeNotificationService>.Instance);
    }

    [Fact]
    public async Task AuthController_LocksOutRepeatedFailures_AndRecoversViaPasswordReset()
    {
        await using var context = CreateDbContext();
        var hasher = new PasswordHasher();
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:Secret"] = "test-super-secret-jwt-key-minimum-32-characters-long",
                ["Jwt:Issuer"] = "TourFlowApi",
                ["Jwt:Audience"] = "TourFlowApp"
            })
            .Build();
        var jwt = new JwtTokenService(config);

        var envMock = new Mock<IHostEnvironment>();
        envMock.SetupGet(e => e.EnvironmentName).Returns(Environments.Development);
        var sp = new ServiceCollection()
            .AddSingleton(envMock.Object)
            .BuildServiceProvider();

        var controller = new AuthController(context, hasher, jwt, NullLogger<AuthController>.Instance)
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { RequestServices = sp }
            }
        };

        var user = new User
        {
            Id = Guid.NewGuid(),
            FullName = "Nadia Rahman",
            Email = "nadia@tourflow.bd",
            PasswordHash = hasher.HashPassword("OldPass123"),
            Role = "User",
            RefreshToken = "existing-refresh-token",
            RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(3)
        };
        context.Users.Add(user);
        await context.SaveChangesAsync();

        // Trigger 5 invalid login attempts -> lockout on 6th check
        for (var i = 0; i < 5; i++)
        {
            var failRes = await controller.Login(new LoginRequestDto("nadia@tourflow.bd", "WrongPass99"));
            failRes.Result.Should().BeOfType<UnauthorizedObjectResult>();
        }

        var lockedRes = await controller.Login(new LoginRequestDto("nadia@tourflow.bd", "OldPass123"));
        var statusObj = lockedRes.Result.Should().BeOfType<ObjectResult>().Subject;
        statusObj.StatusCode.Should().Be(StatusCodes.Status429TooManyRequests);

        // Forgot password generates sandbox token in Development and hashes in DB
        var forgotRes = await controller.ForgotPassword(new ForgotPasswordRequestDto("nadia@tourflow.bd"));
        var forgotOk = forgotRes.Result.Should().BeOfType<OkObjectResult>().Subject;
        var forgotPayload = forgotOk.Value.Should().BeOfType<ForgotPasswordResponseDto>().Subject;
        forgotPayload.Accepted.Should().BeTrue();
        forgotPayload.ResetTokenPreview.Should().NotBeNullOrWhiteSpace();

        // Reset password clears lockout & revokes previous refresh token
        var resetRes = await controller.ResetPassword(new ResetPasswordRequestDto(
            "nadia@tourflow.bd",
            forgotPayload.ResetTokenPreview!,
            "NewStrongPass2026"
        ));
        resetRes.Should().BeOfType<OkObjectResult>();

        var updatedUser = await context.Users.FirstAsync(u => u.Id == user.Id);
        updatedUser.LockoutEndUtc.Should().BeNull();
        updatedUser.RefreshToken.Should().BeNull();

        // Subsequent login succeeds with new password
        var loginOk = await controller.Login(new LoginRequestDto("nadia@tourflow.bd", "NewStrongPass2026"));
        loginOk.Result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task WishlistController_SyncsAndTogglesIdempotently()
    {
        await using var context = CreateDbContext();
        var userId = Guid.NewGuid();
        var tourA = new TourPackage { Id = Guid.NewGuid(), Title = "Sylhet Tea Escape", Slug = "sylhet-escape", Destination = "Sylhet", Region = "Sylhet", BasePrice = 8500m, IsActive = true };
        var tourB = new TourPackage { Id = Guid.NewGuid(), Title = "Bandarban Crest", Slug = "bandarban-crest", Destination = "Bandarban", Region = "Chattogram", BasePrice = 12500m, IsActive = true };
        context.TourPackages.AddRange(tourA, tourB);
        await context.SaveChangesAsync();

        var controller = new WishlistController(context)
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = BuildPrincipal(userId, "user@tourflow.bd", "User") }
            }
        };

        // Duplicate IDs in sync payload produce clean single records
        var syncRes = await controller.SyncWishlist(new SyncWishlistRequest([tourA.Id, tourB.Id, tourA.Id]), CancellationToken.None);
        var syncOk = syncRes.Result.Should().BeOfType<OkObjectResult>().Subject;
        var syncedList = syncOk.Value.Should().BeOfType<List<WishlistTourDto>>().Subject;
        syncedList.Should().HaveCount(2);

        // Toggle removes tourA, leaving 1
        var toggleRes = (await controller.ToggleWishlist(tourA.Id, CancellationToken.None)).Should().BeOfType<OkObjectResult>().Subject;
        toggleRes.Value!.ToString().Should().Contain("saved = False");

        var getRes = await controller.GetWishlist(CancellationToken.None);
        var items = getRes.Result.Should().BeOfType<OkObjectResult>().Subject.Value.Should().BeOfType<List<WishlistTourDto>>().Subject;
        items.Should().ContainSingle(x => x.Id == tourB.Id);

        (await controller.ClearWishlist(CancellationToken.None)).Should().BeOfType<NoContentResult>();
        (await context.WishlistItems.CountAsync()).Should().Be(0);
    }

    [Fact]
    public async Task SearchController_ReturnsCrossDomainHits()
    {
        await using var context = CreateDbContext();
        using var memCache = new MemoryCache(new MemoryCacheOptions());
        var cacheService = new MemoryCacheService(memCache);

        context.TourPackages.Add(new TourPackage
        {
            Id = Guid.NewGuid(),
            Title = "Sylhet Waterfall & Tea Reserve",
            Slug = "sylhet-waterfall",
            Destination = "Sylhet",
            Region = "Sylhet",
            Summary = "Scenic tea estates",
            BasePrice = 9500m,
            DurationDays = 3,
            DurationNights = 2,
            IsActive = true
        });
        context.Hotels.Add(new Hotel
        {
            Id = Guid.NewGuid(),
            Name = "Grand Sultan Retreat",
            Slug = "grand-sultan",
            Location = "Sreemangal, Sylhet",
            Place = "Sylhet",
            Tier = "Luxury",
            PriceNumeric = 14000m,
            IsActive = true
        });
        context.TravelTips.Add(new TravelTip
        {
            Id = Guid.NewGuid(),
            Slug = "sylhet-packing",
            Title = "Monsoon Trail Tips for Sylhet",
            Division = "Sylhet",
            Category = "Safety",
            ReadingTime = "4 min",
            Summary = "Pack rain gear",
            IsActive = true
        });
        context.BlogPosts.Add(new BlogPost
        {
            Id = Guid.NewGuid(),
            Title = "Dawn over Ratargul Swamp Forest",
            Slug = "ratargul-story",
            Division = "Sylhet",
            Category = "Stories",
            AuthorName = "Tariq",
            Summary = "Sylhet river boat diary"
        });
        await context.SaveChangesAsync();

        var controller = new SearchController(context, cacheService);
        var result = await controller.Search("Sylhet", 5, CancellationToken.None);
        var ok = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var payload = ok.Value.Should().BeOfType<GlobalSearchResponseDto>().Subject;

        payload.Tours.Should().ContainSingle();
        payload.Hotels.Should().ContainSingle();
        payload.Tips.Should().ContainSingle();
        payload.Stories.Should().ContainSingle();
    }

    [Fact]
    public async Task PaymentsController_RejectsForgedHmacAndAcceptsSignedWebhook()
    {
        await using var context = CreateDbContext();
        var notifier = CreateNotifier(context);
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["PaymentGateway:HmacSecret"] = "unit-test-hmac-secret-minimum-32-chars"
            })
            .Build();

        var ownerId = Guid.NewGuid();
        var tour = new TourPackage { Id = Guid.NewGuid(), Title = "Sajek Horizon", Slug = "sajek-horizon" };
        var booking = new Booking
        {
            Id = Guid.NewGuid(),
            BookingReference = "TF-HMAC-01",
            TourPackageId = tour.Id,
            TourPackage = tour,
            TourScheduleId = Guid.NewGuid(),
            UserId = ownerId,
            CustomerName = "Tariq",
            CustomerEmail = "tariq@tourflow.bd",
            CustomerPhone = "01711111111",
            TotalAmount = 12000m,
            DepositPaid = 0m,
            BalanceRemaining = 12000m,
            Status = BookingStatus.Pending,
            PaymentStatus = PaymentStatus.PartiallyPaid
        };
        context.TourPackages.Add(tour);
        context.Bookings.Add(booking);
        await context.SaveChangesAsync();

        var controller = new PaymentsController(context, notifier, config)
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = BuildPrincipal(ownerId, "tariq@tourflow.bd", "Tariq") }
            }
        };

        var initOk = (await controller.InitiatePayment(new InitiatePaymentRequestDto { BookingId = booking.Id, PaymentMethod = "bkash" }))
            .Should().BeOfType<OkObjectResult>().Subject;
        var initDto = initOk.Value.Should().BeOfType<InitiatePaymentResponseDto>().Subject;
        initDto.GatewaySignature.Should().NotBeNullOrWhiteSpace();

        // Verify with forged signature fails
        (await controller.VerifyPayment(new VerifyPaymentRequestDto
        {
            BookingId = booking.Id,
            TransactionId = initDto.TransactionId,
            PaymentMethod = "bkash",
            GatewaySignature = "deadbeef0000forgedsignature"
        })).Should().BeOfType<BadRequestObjectResult>();

        // Webhook with valid HMAC settles payment even without logged-in user claims
        controller.ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() };
        var webhookRes = await controller.HandleGatewayWebhook(new VerifyPaymentRequestDto
        {
            BookingId = booking.Id,
            TransactionId = initDto.TransactionId,
            PaymentMethod = "bkash",
            GatewaySignature = initDto.GatewaySignature
        });
        webhookRes.Should().BeOfType<OkObjectResult>();

        var settled = await context.Bookings.FirstAsync(b => b.Id == booking.Id);
        settled.PaymentStatus.Should().Be(PaymentStatus.Paid);
        settled.BalanceRemaining.Should().Be(0m);
    }

    [Fact]
    public async Task TourFlowChatbotService_HandlesBanglaBanglishNluAndItineraryDays()
    {
        await using var context = CreateDbContext();
        var notifier = CreateNotifier(context);
        var config = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>()).Build();
        var httpFactory = new Mock<IHttpClientFactory>();
        var service = new TourFlowChatbotService(context, notifier, config, httpFactory.Object, NullLogger<TourFlowChatbotService>.Instance);

        var tourId = Guid.NewGuid();
        context.TourPackages.Add(new TourPackage
        {
            Id = tourId,
            Title = "Sylhet Ratargul & Jaflong Explorer",
            Slug = "sylhet-explorer",
            Destination = "Sylhet",
            Region = "Sylhet",
            BasePrice = 9500m,
            DurationDays = 2,
            DurationNights = 1,
            IsActive = true,
            IsFeatured = true
        });
        context.ItineraryDays.Add(new ItineraryDay
        {
            Id = Guid.NewGuid(),
            TourPackageId = tourId,
            DayNumber = 1,
            Title = "Ratargul Swamp Boat Dawn",
            Description = "Early morning boat ride through flooded freshwater forest canopy."
        });
        context.PromoCodes.Add(new PromoCode
        {
            Id = Guid.NewGuid(),
            Code = "GROUP4BD",
            Description = "10% group savings",
            DiscountType = "Percentage",
            DiscountValue = 10m,
            MinimumTravelers = 4,
            MaxUses = 100,
            IsActive = true
        });
        await context.SaveChangesAsync();

        var userId = Guid.NewGuid();
        var sessionDto = await service.CreateSessionAsync(userId, "farhan@tourflow.bd", "Farhan", null);
        var sessionEntity = await context.ChatSessions.FirstAsync(s => s.Id == sessionDto.Id);

        // Mixed Bangla script + Banglish prompt: "\u09B8\u09BF\u09B2\u09C7\u099F \u09EA jon 15 hazar \u099F\u09BE\u0995\u09BE \u09AA\u09CD\u09B2\u09CD\u09AF\u09BE\u09A8 promo"
        var mixedPrompt = "\u09B8\u09BF\u09B2\u09C7\u099F \u09EA jon 15 hazar \u099F\u09BE\u0995\u09BE \u09AA\u09CD\u09B2\u09CD\u09AF\u09BE\u09A8 promo";
        var reply = await service.AskAsync(sessionEntity, userId, "farhan@tourflow.bd", "Farhan", mixedPrompt);

        reply.AssistantMessage.Metadata.Should().NotBeNull();
        reply.AssistantMessage.Metadata!.Tours.Should().Contain(t => t.Destination == "Sylhet");
        reply.AssistantMessage.Metadata.Promos.Should().Contain(p => p.Code == "GROUP4BD");
        reply.AssistantMessage.Message.Should().Contain("GROUP4BD");
        reply.AssistantMessage.Message.Should().Contain("4 travelers");
        reply.AssistantMessage.Message.Should().Contain("Ratargul Swamp Boat Dawn");
    }
}
