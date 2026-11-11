using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using TourFlow.Api.DTOs;
using TourFlow.Api.Services;
using TourFlow.Domain.Entities;
using TourFlow.Domain.Enums;
using TourFlow.Infrastructure.Data;

namespace TourFlow.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaymentsController : ControllerBase
{
    private readonly TourFlowDbContext _context;
    private readonly IRealtimeNotifier _notifier;
    private readonly IConfiguration _configuration;

    public PaymentsController(
        TourFlowDbContext context,
        IRealtimeNotifier notifier,
        IConfiguration configuration)
    {
        _context = context;
        _notifier = notifier;
        _configuration = configuration;
    }

    [HttpGet("methods")]
    public IActionResult GetPaymentMethods()
    {
        var methods = new[]
        {
            new
            {
                Id = "bkash",
                Name = "bKash Direct Gateway",
                Type = "MFS",
                Currency = "BDT",
                Description = "Instant mobile balance checkout with zero gateway surcharge.",
                IsActive = true,
                Badge = "Most Popular in Bangladesh"
            },
            new
            {
                Id = "nagad",
                Name = "Nagad Online Pay",
                Type = "MFS",
                Currency = "BDT",
                Description = "Fast postal digital payment gateway via verified OTP.",
                IsActive = true,
                Badge = "Govt. Backed Postal MFS"
            },
            new
            {
                Id = "sslcommerz",
                Name = "SSLCommerz Multi-Channel",
                Type = "Gateway",
                Currency = "BDT / USD",
                Description = "Bangladesh's leading aggregator supporting 30+ internet banks & cards.",
                IsActive = true,
                Badge = "Comprehensive Aggregator"
            },
            new
            {
                Id = "card",
                Name = "Visa / Mastercard / Amex",
                Type = "Card",
                Currency = "BDT / USD",
                Description = "Secure 3D-authenticated credit or debit card transactions with tokenization.",
                IsActive = true,
                Badge = "International & Local Cards"
            }
        };

        return Ok(methods);
    }

    [Authorize]
    [EnableRateLimiting("booking")]
    [HttpPost("initiate")]
    public async Task<IActionResult> InitiatePayment([FromBody] InitiatePaymentRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var booking = await _context.Bookings
            .Include(b => b.TourPackage)
            .FirstOrDefaultAsync(b => b.Id == request.BookingId && !b.IsDeleted);

        if (booking == null)
        {
            return NotFound(new { message = "Booking not found." });
        }

        if (!CanCallerAccessBooking(booking))
        {
            return Forbid();
        }

        if (booking.PaymentStatus == PaymentStatus.Paid && booking.BalanceRemaining <= 0)
        {
            return BadRequest(new { message = "This booking has already been paid in full." });
        }

        var methodNormalized = request.PaymentMethod.Trim().ToLower();
        var prefix = methodNormalized switch
        {
            "bkash" => "BKASH",
            "nagad" => "NAGAD",
            "sslcommerz" => "SSL",
            "card" => "CARD",
            _ => "PAY"
        };

        var txId = $"TRX-{prefix}-{Guid.NewGuid().ToString("N")[..8].ToUpper()}";
        var amountDue = booking.BalanceRemaining > 0 ? booking.BalanceRemaining : booking.TotalAmount;
        var frontendUrl = (_configuration["FrontendUrl"] ?? "http://localhost:3000").TrimEnd('/');

        // In production, this would call bKash / SSLCommerz merchant API to create checkout URL.
        // In local/sandbox mode, we generate the simulated gateway redirection session.
        var checkoutUrl = $"{frontendUrl}/booking/payment?bookingId={booking.Id}&trx={txId}&method={methodNormalized}";

        booking.PaymentTransactionId = txId;
        booking.UpdatedAtUtc = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(new InitiatePaymentResponseDto
        {
            Success = true,
            TransactionId = txId,
            BookingId = booking.Id,
            BookingReference = booking.BookingReference,
            Amount = amountDue,
            PaymentMethod = request.PaymentMethod,
            GatewayUrl = checkoutUrl,
            ExpiresAtUtc = DateTime.UtcNow.AddMinutes(20),
            Message = $"Payment session initialized successfully for booking {booking.BookingReference}."
        });
    }

    [Authorize]
    [EnableRateLimiting("booking")]
    [HttpPost("verify")]
    public async Task<IActionResult> VerifyPayment([FromBody] VerifyPaymentRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var booking = await _context.Bookings
            .Include(b => b.TourPackage)
            .FirstOrDefaultAsync(b => b.Id == request.BookingId && !b.IsDeleted);

        if (booking == null)
        {
            return NotFound(new { message = "Booking not found." });
        }

        if (!CanCallerAccessBooking(booking))
        {
            return Forbid();
        }

        if (booking.PaymentStatus == PaymentStatus.Paid && booking.BalanceRemaining <= 0)
        {
            return Ok(new PaymentReceiptDto
            {
                Success = true,
                BookingId = booking.Id,
                BookingReference = booking.BookingReference,
                TransactionId = booking.PaymentTransactionId ?? request.TransactionId,
                PaymentStatus = booking.PaymentStatus.ToString(),
                BookingStatus = booking.Status.ToString(),
                TotalAmount = booking.TotalAmount,
                AmountPaid = booking.DepositPaid,
                PaidAtUtc = booking.UpdatedAtUtc ?? DateTime.UtcNow,
                CustomerName = booking.CustomerName,
                CustomerEmail = booking.CustomerEmail,
                TourTitle = booking.TourPackage?.Title ?? "Tour Package"
            });
        }

        var submittedTxId = request.TransactionId.Trim();
        if (string.IsNullOrWhiteSpace(booking.PaymentTransactionId)
            || !string.Equals(booking.PaymentTransactionId, submittedTxId, StringComparison.Ordinal))
        {
            return BadRequest(new { message = "Invalid or uninitiated payment transaction reference." });
        }

        // Apply payment confirmation
        booking.PaymentStatus = PaymentStatus.Paid;
        booking.Status = BookingStatus.Confirmed;
        booking.DepositPaid = booking.TotalAmount;
        booking.BalanceRemaining = 0m;
        booking.UpdatedAtUtc = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        await _notifier.PublishNotificationAsync(new RealtimeNotificationPublishRequest(
            TargetUserId: booking.UserId,
            TargetEmail: booking.CustomerEmail,
            TargetRole: null,
            Category: "payment",
            Title: $"Payment Verified · {booking.BookingReference}",
            Message: $"Full payment of BDT {booking.TotalAmount:N0} verified for {booking.TourPackage?.Title ?? "your tour"}.",
            ActionUrl: "/profile?tab=bookings"
        ));

        return Ok(new PaymentReceiptDto
        {
            Success = true,
            BookingId = booking.Id,
            BookingReference = booking.BookingReference,
            TransactionId = booking.PaymentTransactionId,
            PaymentStatus = booking.PaymentStatus.ToString(),
            BookingStatus = booking.Status.ToString(),
            TotalAmount = booking.TotalAmount,
            AmountPaid = booking.TotalAmount,
            PaidAtUtc = booking.UpdatedAtUtc.Value,
            CustomerName = booking.CustomerName,
            CustomerEmail = booking.CustomerEmail,
            TourTitle = booking.TourPackage?.Title ?? "Tour Package"
        });
    }

    private bool CanCallerAccessBooking(Booking booking)
    {
        if (User.IsInRole("Admin") || User.IsInRole("SuperAdmin"))
        {
            return true;
        }

        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (Guid.TryParse(userIdStr, out var callerId) && callerId != Guid.Empty && booking.UserId == callerId)
        {
            return true;
        }

        var email = User.FindFirstValue(ClaimTypes.Email)?.Trim();
        return !string.IsNullOrWhiteSpace(email)
            && string.Equals(booking.CustomerEmail, email, StringComparison.OrdinalIgnoreCase);
    }
}
