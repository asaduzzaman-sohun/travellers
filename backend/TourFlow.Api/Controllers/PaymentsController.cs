using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
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
        var gatewaySignature = ComputeGatewaySignature(booking.Id, txId, amountDue, methodNormalized);

        // In production, this calls the gateway merchant API to create a signed checkout URL.
        // In sandbox mode, we generate an HMAC-signed redirection URL for /booking/payment.
        var checkoutUrl = $"{frontendUrl}/booking/payment?bookingId={booking.Id}&trx={txId}&method={methodNormalized}&sig={Uri.EscapeDataString(gatewaySignature)}";

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
            GatewaySignature = gatewaySignature,
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
            return Ok(BuildReceipt(booking, booking.PaymentTransactionId ?? request.TransactionId, booking.DepositPaid));
        }

        var submittedTxId = request.TransactionId.Trim();
        if (string.IsNullOrWhiteSpace(booking.PaymentTransactionId)
            || !string.Equals(booking.PaymentTransactionId, submittedTxId, StringComparison.Ordinal))
        {
            return BadRequest(new { message = "Invalid or uninitiated payment transaction reference." });
        }

        var expectedAmount = booking.BalanceRemaining > 0 ? booking.BalanceRemaining : booking.TotalAmount;
        if (!string.IsNullOrWhiteSpace(request.GatewaySignature)
            && !IsGatewaySignatureValid(booking.Id, submittedTxId, expectedAmount, request.PaymentMethod, request.GatewaySignature))
        {
            return BadRequest(new { message = "Invalid payment gateway HMAC signature." });
        }

        return await FinalizeVerifiedPaymentAsync(booking);
    }

    /// <summary>
    /// Cryptographically authenticated payment webhook endpoint validated via HMAC-SHA256.
    /// </summary>
    [AllowAnonymous]
    [EnableRateLimiting("booking")]
    [HttpPost("webhook")]
    public async Task<IActionResult> HandleGatewayWebhook([FromBody] VerifyPaymentRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        if (string.IsNullOrWhiteSpace(request.GatewaySignature))
        {
            return Unauthorized(new { message = "Missing gateway HMAC signature." });
        }

        var booking = await _context.Bookings
            .Include(b => b.TourPackage)
            .FirstOrDefaultAsync(b => b.Id == request.BookingId && !b.IsDeleted);

        if (booking == null)
        {
            return NotFound(new { message = "Booking not found." });
        }

        if (booking.PaymentStatus == PaymentStatus.Paid && booking.BalanceRemaining <= 0)
        {
            return Ok(BuildReceipt(booking, booking.PaymentTransactionId ?? request.TransactionId, booking.DepositPaid));
        }

        var submittedTxId = request.TransactionId.Trim();
        if (!string.Equals(booking.PaymentTransactionId, submittedTxId, StringComparison.Ordinal))
        {
            return BadRequest(new { message = "Transaction ID does not match initiated session." });
        }

        var expectedAmount = booking.BalanceRemaining > 0 ? booking.BalanceRemaining : booking.TotalAmount;
        if (!IsGatewaySignatureValid(booking.Id, submittedTxId, expectedAmount, request.PaymentMethod, request.GatewaySignature))
        {
            return Unauthorized(new { message = "Invalid payment gateway HMAC signature." });
        }

        return await FinalizeVerifiedPaymentAsync(booking);
    }

    private async Task<IActionResult> FinalizeVerifiedPaymentAsync(Booking booking)
    {
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

        return Ok(BuildReceipt(booking, booking.PaymentTransactionId ?? string.Empty, booking.TotalAmount));
    }

    private static PaymentReceiptDto BuildReceipt(Booking booking, string transactionId, decimal amountPaid) =>
        new()
        {
            Success = true,
            BookingId = booking.Id,
            BookingReference = booking.BookingReference,
            TransactionId = transactionId,
            PaymentStatus = booking.PaymentStatus.ToString(),
            BookingStatus = booking.Status.ToString(),
            TotalAmount = booking.TotalAmount,
            AmountPaid = amountPaid,
            PaidAtUtc = booking.UpdatedAtUtc ?? DateTime.UtcNow,
            CustomerName = booking.CustomerName,
            CustomerEmail = booking.CustomerEmail,
            TourTitle = booking.TourPackage?.Title ?? "Tour Package"
        };

    private string ComputeGatewaySignature(Guid bookingId, string transactionId, decimal amount, string paymentMethod)
    {
        var secret = _configuration["PaymentGateway:HmacSecret"];
        if (string.IsNullOrWhiteSpace(secret))
        {
            secret = _configuration["Jwt:Secret"];
        }
        if (string.IsNullOrWhiteSpace(secret))
        {
            secret = "tourflow-sandbox-payment-hmac-secret-2026";
        }

        var canonicalPayload = $"{bookingId:N}|{transactionId.Trim()}|{amount:F2}|{paymentMethod.Trim().ToLowerInvariant()}";
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secret));
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(canonicalPayload));
        return Convert.ToHexStringLower(hash);
    }

    private bool IsGatewaySignatureValid(
        Guid bookingId,
        string transactionId,
        decimal amount,
        string paymentMethod,
        string providedSignature)
    {
        var expected = ComputeGatewaySignature(bookingId, transactionId, amount, paymentMethod);
        var expectedBytes = Encoding.UTF8.GetBytes(expected);
        var providedBytes = Encoding.UTF8.GetBytes(providedSignature.Trim().ToLowerInvariant());
        return expectedBytes.Length == providedBytes.Length
            && CryptographicOperations.FixedTimeEquals(expectedBytes, providedBytes);
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
