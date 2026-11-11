using System.Diagnostics;
using System.Globalization;
using System.Security.Claims;
using TourFlow.Api.Services;

namespace TourFlow.Api.Middleware;

public static class ClientIpResolver
{
    public static string GetClientIp(HttpContext context)
    {
        var forwardedFor = context.Request.Headers["X-Forwarded-For"].FirstOrDefault();
        if (!string.IsNullOrWhiteSpace(forwardedFor))
        {
            var firstIp = forwardedFor.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .FirstOrDefault();
            if (!string.IsNullOrWhiteSpace(firstIp))
            {
                return firstIp;
            }
        }

        var realIp = context.Request.Headers["X-Real-IP"].FirstOrDefault();
        if (!string.IsNullOrWhiteSpace(realIp))
        {
            return realIp.Trim();
        }

        return context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
    }

    public static string GetPartitionKey(HttpContext context, bool ipOnly = false)
    {
        if (!ipOnly)
        {
            var userId = context.User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!string.IsNullOrWhiteSpace(userId))
            {
                return $"user:{userId}";
            }
        }

        return $"ip:{GetClientIp(context)}";
    }
}

public class RequestObservabilityMiddleware
{
    private readonly RequestDelegate _next;
    private readonly RuntimeMetricsService _metrics;

    public RequestObservabilityMiddleware(RequestDelegate next, RuntimeMetricsService metrics)
    {
        _next = next;
        _metrics = metrics;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var startTimestamp = Stopwatch.GetTimestamp();

        context.Response.OnStarting(() =>
        {
            var elapsed = Stopwatch.GetElapsedTime(startTimestamp);
            context.Response.Headers["X-Served-By"] = _metrics.InstanceId;
            context.Response.Headers["X-Response-Time-Ms"] = elapsed.TotalMilliseconds.ToString("F2", CultureInfo.InvariantCulture);
            return Task.CompletedTask;
        });

        try
        {
            await _next(context);
        }
        finally
        {
            var elapsed = Stopwatch.GetElapsedTime(startTimestamp);
            _metrics.RecordRequest(context.Request.Method, elapsed.TotalMilliseconds);
        }
    }
}
