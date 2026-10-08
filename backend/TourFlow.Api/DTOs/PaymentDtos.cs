using System.ComponentModel.DataAnnotations;

namespace TourFlow.Api.DTOs;

public class InitiatePaymentRequestDto
{
    [Required]
    public Guid BookingId { get; set; }

    [Required]
    public string PaymentMethod { get; set; } = "bkash"; // bkash | nagad | sslcommerz | card
}

public class InitiatePaymentResponseDto
{
    public bool Success { get; set; }
    public string TransactionId { get; set; } = string.Empty;
    public Guid BookingId { get; set; }
    public string BookingReference { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public string GatewayUrl { get; set; } = string.Empty;
    public DateTime ExpiresAtUtc { get; set; }
    public string Message { get; set; } = string.Empty;
}

public class VerifyPaymentRequestDto
{
    [Required]
    public Guid BookingId { get; set; }

    [Required]
    public string TransactionId { get; set; } = string.Empty;

    public string PaymentMethod { get; set; } = "bkash";
}

public class PaymentReceiptDto
{
    public bool Success { get; set; }
    public Guid BookingId { get; set; }
    public string BookingReference { get; set; } = string.Empty;
    public string TransactionId { get; set; } = string.Empty;
    public string PaymentStatus { get; set; } = string.Empty;
    public string BookingStatus { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public decimal AmountPaid { get; set; }
    public DateTime PaidAtUtc { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public string TourTitle { get; set; } = string.Empty;
}
