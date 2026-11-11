using System.Security.Claims;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using TourFlow.Api.Controllers;
using TourFlow.Api.DTOs;
using TourFlow.Api.Hubs;
using TourFlow.Api.Services;
using TourFlow.Domain.Entities;
using TourFlow.Domain.Enums;
using TourFlow.Infrastructure.Data;

namespace TourFlow.Tests;

public class RealtimeSignalRTests
{
    private static TourFlowDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<TourFlowDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new TourFlowDbContext(options);
    }

    private static (Mock<IHubContext<TourFlowHub>> HubMock, Mock<IClientProxy> ProxyMock, List<IReadOnlyList<string>> CapturedGroups) CreateHubMock()
    {
        var capturedGroups = new List<IReadOnlyList<string>>();
        var proxyMock = new Mock<IClientProxy>();
        proxyMock
            .Setup(p => p.SendCoreAsync(It.IsAny<string>(), It.IsAny<object?[]>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        var clientsMock = new Mock<IHubClients>();
        clientsMock
            .Setup(c => c.Groups(It.IsAny<IReadOnlyList<string>>()))
            .Callback<IReadOnlyList<string>>(groups => capturedGroups.Add(groups))
            .Returns(proxyMock.Object);

        var hubMock = new Mock<IHubContext<TourFlowHub>>();
        hubMock.SetupGet(h => h.Clients).Returns(clientsMock.Object);

        return (hubMock, proxyMock, capturedGroups);
    }

    private static ClaimsPrincipal BuildPrincipal(Guid userId, string email, string name, string role) =>
        new(new ClaimsIdentity(new[]
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim(ClaimTypes.Email, email),
            new Claim(ClaimTypes.Name, name),
            new Claim(ClaimTypes.Role, role)
        }, "TestAuth"));

    private static TourFlowChatbotService CreateChatbotService(TourFlowDbContext context, IRealtimeNotifier notifier)
    {
        var config = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>()).Build();
        var httpFactoryMock = new Mock<IHttpClientFactory>();
        return new TourFlowChatbotService(
            context,
            notifier,
            config,
            httpFactoryMock.Object,
            NullLogger<TourFlowChatbotService>.Instance);
    }

    [Fact]
    public async Task PublishNotificationAsync_PersistsAndTargetsUserGroup()
    {
        await using var context = CreateDbContext();
        var (hubMock, proxyMock, capturedGroups) = CreateHubMock();
        var service = new RealtimeNotificationService(context, hubMock.Object, NullLogger<RealtimeNotificationService>.Instance);

        var dto = await service.PublishNotificationAsync(new RealtimeNotificationPublishRequest(
            TargetUserId: Guid.NewGuid(),
            TargetEmail: "Alice@Example.com",
            TargetRole: null,
            Category: "booking",
            Title: "Booking Confirmed",
            Message: "Your Sylhet retreat reservation is confirmed.",
            ActionUrl: "/profile"
        ));

        dto.Title.Should().Be("Booking Confirmed");
        (await context.RealtimeNotifications.CountAsync()).Should().Be(1);

        var saved = await context.RealtimeNotifications.FirstAsync();
        saved.TargetEmail.Should().Be("alice@example.com");
        saved.TargetRole.Should().BeNull();

        capturedGroups.Should().ContainSingle();
        capturedGroups[0].Should().ContainSingle().Which.Should().Be("user:alice@example.com");
        proxyMock.Verify(
            p => p.SendCoreAsync("ReceiveNotification", It.Is<object?[]>(args => args.Length == 1), It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task TourFlowChatbotService_GroundsCatalogPromosAndIsolatesUserBookings()
    {
        await using var context = CreateDbContext();
        var (hubMock, proxyMock, capturedGroups) = CreateHubMock();
        var notifier = new RealtimeNotificationService(context, hubMock.Object, NullLogger<RealtimeNotificationService>.Instance);
        var chatbot = CreateChatbotService(context, notifier);

        var aliceId = Guid.NewGuid();
        var bobId = Guid.NewGuid();

        var sylhetTour = new TourPackage
        {
            Id = Guid.NewGuid(),
            Title = "Sylhet Tea Gardens Escape",
            Slug = "sylhet-tea-escape",
            Destination = "Sylhet",
            Region = "Sylhet Division",
            DurationDays = 3,
            DurationNights = 2,
            BasePrice = 12000m,
            IsActive = true,
            IsFeatured = true
        };
        var scheduleId = Guid.NewGuid();
        context.TourPackages.Add(sylhetTour);
        context.TourSchedules.Add(new TourSchedule
        {
            Id = scheduleId,
            TourPackageId = sylhetTour.Id,
            StartDate = DateTime.UtcNow.AddDays(14),
            EndDate = DateTime.UtcNow.AddDays(17),
            PricePerPerson = 12000m,
            TotalSeats = 16,
            BookedSeats = 4
        });
        context.PromoCodes.Add(new PromoCode
        {
            Id = Guid.NewGuid(),
            Code = "GROUP10",
            Description = "10% group savings for 4+ travelers",
            DiscountType = "Percentage",
            DiscountValue = 10m,
            MinimumTravelers = 4,
            IsActive = true
        });
        context.Bookings.AddRange(
            new Booking
            {
                Id = Guid.NewGuid(),
                BookingReference = "TF-ALICE-01",
                TourPackageId = sylhetTour.Id,
                TourScheduleId = scheduleId,
                UserId = aliceId,
                CustomerName = "Alice Rahman",
                CustomerEmail = "alice@tourflow.bd",
                CustomerPhone = "01700000001",
                NumberOfTravelers = 2,
                TotalAmount = 24000m,
                DepositPaid = 10000m,
                BalanceRemaining = 14000m,
                Status = BookingStatus.Confirmed,
                PaymentStatus = PaymentStatus.PartiallyPaid
            },
            new Booking
            {
                Id = Guid.NewGuid(),
                BookingReference = "TF-BOB-99",
                TourPackageId = sylhetTour.Id,
                TourScheduleId = scheduleId,
                UserId = bobId,
                CustomerName = "Bob Chowdhury",
                CustomerEmail = "bob@tourflow.bd",
                CustomerPhone = "01700000002",
                NumberOfTravelers = 1,
                TotalAmount = 12000m,
                DepositPaid = 12000m,
                BalanceRemaining = 0m,
                Status = BookingStatus.Confirmed,
                PaymentStatus = PaymentStatus.Paid
            });
        await context.SaveChangesAsync();

        var sessionDto = await chatbot.CreateSessionAsync(aliceId, "alice@tourflow.bd", "Alice Rahman", new CreateChatSessionRequest());
        var sessionEntity = await context.ChatSessions.FirstAsync(s => s.Id == sessionDto.Id);

        var tourReply = await chatbot.AskAsync(sessionEntity, aliceId, "alice@tourflow.bd", "Alice Rahman", "Sylhet tour for 4 travelers with promo");
        tourReply.AssistantMessage.Message.Should().Contain("Sylhet Tea Gardens Escape");
        tourReply.AssistantMessage.Message.Should().Contain("GROUP10");
        tourReply.AssistantMessage.Metadata.Should().NotBeNull();
        tourReply.AssistantMessage.Metadata!.Tours.Should().Contain(t => t.Slug == "sylhet-tea-escape");

        var bookingReply = await chatbot.AskAsync(sessionEntity, aliceId, "alice@tourflow.bd", "Alice Rahman", "Check my bookings and balance");
        bookingReply.AssistantMessage.Message.Should().Contain("TF-ALICE-01");
        bookingReply.AssistantMessage.Message.Should().NotContain("TF-BOB-99");
        bookingReply.AssistantMessage.Metadata!.Bookings.Should().ContainSingle(b => b.BookingReference == "TF-ALICE-01");

        capturedGroups.Should().Contain(g => g.Contains(TourFlowHub.RoomGroup(RealtimeRoomPolicy.SessionRoom(sessionDto.Id))));
        proxyMock.Verify(
            p => p.SendCoreAsync("UserTyping", It.IsAny<object?[]>(), It.IsAny<CancellationToken>()),
            Times.AtLeast(2));
    }

    [Fact]
    public async Task ChatController_EnforcesCrossUserPrivacyUntilEscalatedToHuman()
    {
        await using var context = CreateDbContext();
        var (hubMock, _, _) = CreateHubMock();
        var notifier = new RealtimeNotificationService(context, hubMock.Object, NullLogger<RealtimeNotificationService>.Instance);
        var chatbot = CreateChatbotService(context, notifier);

        var aliceId = Guid.NewGuid();
        var bobId = Guid.NewGuid();
        var adminId = Guid.NewGuid();

        var sessionDto = await chatbot.CreateSessionAsync(aliceId, "alice@tourflow.bd", "Alice", new CreateChatSessionRequest());
        var controller = new ChatController(context, chatbot);

        // Bob cannot inspect, prompt, escalate, or delete Alice's thread
        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = BuildPrincipal(bobId, "bob@tourflow.bd", "Bob", "User") }
        };
        (await controller.GetSessionMessages(sessionDto.Id)).Should().BeOfType<ForbidResult>();
        (await controller.AskChatbot(sessionDto.Id, new AskChatbotRequest("Hi"))).Should().BeOfType<ForbidResult>();
        (await controller.DeleteSession(sessionDto.Id)).Should().BeOfType<ForbidResult>();

        // Even Admins cannot peek into private AI sessions prior to explicit user escalation
        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = BuildPrincipal(adminId, "admin@tourflow.bd", "Admin", "Admin") }
        };
        (await controller.GetSessionMessages(sessionDto.Id)).Should().BeOfType<ForbidResult>();

        // Alice escalates to a human specialist -> Admins receive alert and gain access
        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = BuildPrincipal(aliceId, "alice@tourflow.bd", "Alice", "User") }
        };
        (await controller.EscalateSession(sessionDto.Id)).Should().BeOfType<OkObjectResult>();

        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = BuildPrincipal(adminId, "admin@tourflow.bd", "Admin", "Admin") }
        };
        (await controller.GetSessionMessages(sessionDto.Id)).Should().BeOfType<OkObjectResult>();
        (await controller.ReplyAsHumanSpecialist(sessionDto.Id, new AskChatbotRequest("Joining now to confirm seats."))).Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task PaymentsController_BlocksBolaAndForgedTransactionIds()
    {
        await using var context = CreateDbContext();
        var (hubMock, _, _) = CreateHubMock();
        var notifier = new RealtimeNotificationService(context, hubMock.Object, NullLogger<RealtimeNotificationService>.Instance);
        var config = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>()).Build();

        var aliceId = Guid.NewGuid();
        var bobId = Guid.NewGuid();

        var tour = new TourPackage { Id = Guid.NewGuid(), Title = "Sundarbans Eco Cruise", Slug = "sundarbans-cruise" };
        var booking = new Booking
        {
            Id = Guid.NewGuid(),
            BookingReference = "TF-PAY-001",
            TourPackageId = tour.Id,
            TourPackage = tour,
            TourScheduleId = Guid.NewGuid(),
            UserId = aliceId,
            CustomerName = "Alice",
            CustomerEmail = "alice@tourflow.bd",
            CustomerPhone = "01700000001",
            TotalAmount = 15000m,
            DepositPaid = 5000m,
            BalanceRemaining = 10000m,
            Status = BookingStatus.Confirmed,
            PaymentStatus = PaymentStatus.PartiallyPaid
        };
        context.TourPackages.Add(tour);
        context.Bookings.Add(booking);
        await context.SaveChangesAsync();

        var controller = new PaymentsController(context, notifier, config);

        // Bob cannot initiate payment for Alice's booking
        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = BuildPrincipal(bobId, "bob@tourflow.bd", "Bob", "User") }
        };
        (await controller.InitiatePayment(new InitiatePaymentRequestDto { BookingId = booking.Id, PaymentMethod = "bkash" }))
            .Should().BeOfType<ForbidResult>();

        // Alice initiates validly, then a mismatched TransactionId fails verification
        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = BuildPrincipal(aliceId, "alice@tourflow.bd", "Alice", "User") }
        };
        var initOk = (await controller.InitiatePayment(new InitiatePaymentRequestDto { BookingId = booking.Id, PaymentMethod = "bkash" }))
            .Should().BeOfType<OkObjectResult>().Subject;
        var initPayload = initOk.Value.Should().BeOfType<InitiatePaymentResponseDto>().Subject;

        (await controller.VerifyPayment(new VerifyPaymentRequestDto { BookingId = booking.Id, TransactionId = "TRX-FORGED-999", PaymentMethod = "bkash" }))
            .Should().BeOfType<BadRequestObjectResult>();

        // Matching initiated TransactionId succeeds and settles balance
        (await controller.VerifyPayment(new VerifyPaymentRequestDto { BookingId = booking.Id, TransactionId = initPayload.TransactionId, PaymentMethod = "bkash" }))
            .Should().BeOfType<OkObjectResult>();

        var updated = await context.Bookings.FirstAsync(b => b.Id == booking.Id);
        updated.PaymentStatus.Should().Be(PaymentStatus.Paid);
        updated.BalanceRemaining.Should().Be(0m);
        (await context.RealtimeNotifications.CountAsync(n => n.Category == "payment")).Should().Be(1);
    }
}
