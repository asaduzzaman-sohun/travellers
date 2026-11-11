using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.RateLimiting;
using TourFlow.Api.Middleware;
using TourFlow.Api.Services;
using TourFlow.Infrastructure.Data;

namespace TourFlow.Api.Extensions;

public static class ResilienceExtensions
{
    public static IServiceCollection AddTourFlowResilience(this IServiceCollection services)
    {
        services.AddSingleton<RuntimeMetricsService>();

        services.Configure<ForwardedHeadersOptions>(options =>
        {
            options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
            options.ForwardLimit = 2;
            options.KnownIPNetworks.Clear();
            options.KnownProxies.Clear();
        });

        services.AddRateLimiter(options =>
        {
            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

            options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(httpContext =>
            {
                var path = httpContext.Request.Path.Value ?? string.Empty;
                if (path.StartsWith("/api/health", StringComparison.OrdinalIgnoreCase) ||
                    path.StartsWith("/hubs", StringComparison.OrdinalIgnoreCase) ||
                    path.StartsWith("/scalar", StringComparison.OrdinalIgnoreCase) ||
                    path.StartsWith("/openapi", StringComparison.OrdinalIgnoreCase) ||
                    path.StartsWith("/uploads", StringComparison.OrdinalIgnoreCase))
                {
                    return RateLimitPartition.GetNoLimiter("infra-bypass");
                }

                var key = ClientIpResolver.GetPartitionKey(httpContext);
                return RateLimitPartition.GetSlidingWindowLimiter($"global:{key}", _ => new SlidingWindowRateLimiterOptions
                {
                    PermitLimit = 200,
                    Window = TimeSpan.FromMinutes(1),
                    SegmentsPerWindow = 6,
                    QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                    QueueLimit = 2,
                    AutoReplenishment = true
                });
            });

            options.AddPolicy("auth", httpContext =>
            {
                var key = ClientIpResolver.GetPartitionKey(httpContext, ipOnly: true);
                return RateLimitPartition.GetSlidingWindowLimiter($"auth:{key}", _ => new SlidingWindowRateLimiterOptions
                {
                    PermitLimit = 15,
                    Window = TimeSpan.FromMinutes(1),
                    SegmentsPerWindow = 6,
                    QueueLimit = 0,
                    AutoReplenishment = true
                });
            });

            options.AddPolicy("booking", httpContext =>
            {
                var key = ClientIpResolver.GetPartitionKey(httpContext);
                return RateLimitPartition.GetTokenBucketLimiter($"booking:{key}", _ => new TokenBucketRateLimiterOptions
                {
                    TokenLimit = 10,
                    TokensPerPeriod = 5,
                    ReplenishmentPeriod = TimeSpan.FromSeconds(30),
                    QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                    QueueLimit = 2,
                    AutoReplenishment = true
                });
            });

            options.AddPolicy("write", httpContext =>
            {
                var key = ClientIpResolver.GetPartitionKey(httpContext);
                return RateLimitPartition.GetTokenBucketLimiter($"write:{key}", _ => new TokenBucketRateLimiterOptions
                {
                    TokenLimit = 12,
                    TokensPerPeriod = 4,
                    ReplenishmentPeriod = TimeSpan.FromSeconds(30),
                    QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                    QueueLimit = 1,
                    AutoReplenishment = true
                });
            });

            options.AddPolicy("general", httpContext =>
            {
                var key = ClientIpResolver.GetPartitionKey(httpContext);
                return RateLimitPartition.GetSlidingWindowLimiter($"general:{key}", _ => new SlidingWindowRateLimiterOptions
                {
                    PermitLimit = 150,
                    Window = TimeSpan.FromMinutes(1),
                    SegmentsPerWindow = 6,
                    QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                    QueueLimit = 3,
                    AutoReplenishment = true
                });
            });

            options.OnRejected = async (context, cancellationToken) =>
            {
                var httpContext = context.HttpContext;
                var metrics = httpContext.RequestServices.GetRequiredService<RuntimeMetricsService>();

                var endpointPolicy = httpContext.GetEndpoint()?
                    .Metadata.GetMetadata<EnableRateLimitingAttribute>()?.PolicyName ?? "global";

                var clientKey = ClientIpResolver.GetPartitionKey(
                    httpContext,
                    ipOnly: string.Equals(endpointPolicy, "auth", StringComparison.OrdinalIgnoreCase));

                metrics.RecordRejection(endpointPolicy, clientKey, httpContext.Request.Path.Value ?? "/");

                var retryAfterSeconds = 30;
                if (context.Lease.TryGetMetadata(MetadataName.RetryAfter, out var retryAfter))
                {
                    retryAfterSeconds = Math.Max(1, (int)Math.Ceiling(retryAfter.TotalSeconds));
                }

                httpContext.Response.StatusCode = StatusCodes.Status429TooManyRequests;
                httpContext.Response.Headers["Retry-After"] = retryAfterSeconds.ToString();
                httpContext.Response.Headers["X-RateLimit-Policy"] = endpointPolicy;
                httpContext.Response.Headers["X-Served-By"] = metrics.InstanceId;

                await httpContext.Response.WriteAsJsonAsync(new
                {
                    error = "Too many requests",
                    message = $"Rate limit exceeded for policy '{endpointPolicy}'. Please wait {retryAfterSeconds}s before retrying.",
                    policy = endpointPolicy,
                    retryAfterSeconds,
                    servedBy = metrics.InstanceId,
                    timestampUtc = DateTime.UtcNow
                }, cancellationToken);
            };
        });

        return services;
    }

    public static WebApplication MapTourFlowObservability(this WebApplication app)
    {
        app.MapGet("/api/health", async (TourFlowDbContext db, RuntimeMetricsService metrics, CancellationToken ct) =>
        {
            var dbOk = await CanConnectSafelyAsync(db, ct);
            return Results.Ok(new
            {
                status = dbOk ? "Healthy" : "Degraded",
                service = "TourFlow Backend API",
                platform = "Traveller's Bangladesh",
                instanceId = metrics.InstanceId,
                timestampUtc = DateTime.UtcNow,
                database = dbOk ? "PostgreSQL 16 Connected" : "Database Unavailable"
            });
        });

        app.MapGet("/api/health/live", (RuntimeMetricsService metrics) => Results.Ok(new
        {
            status = "Live",
            instanceId = metrics.InstanceId,
            timestampUtc = DateTime.UtcNow
        }));

        app.MapGet("/api/health/ready", async (TourFlowDbContext db, RuntimeMetricsService metrics, CancellationToken ct) =>
        {
            var dbOk = await CanConnectSafelyAsync(db, ct);
            var payload = new
            {
                status = dbOk ? "Ready" : "Unavailable",
                instanceId = metrics.InstanceId,
                database = dbOk ? "Connected" : "Unreachable",
                timestampUtc = DateTime.UtcNow
            };
            return dbOk
                ? Results.Ok(payload)
                : Results.Json(payload, statusCode: StatusCodes.Status503ServiceUnavailable);
        });

        app.MapGet("/api/system/metrics", [Authorize(Roles = "Admin,SuperAdmin")] (RuntimeMetricsService metrics) =>
        {
            return Results.Ok(metrics.GetSnapshot());
        });

        return app;
    }

    private static async Task<bool> CanConnectSafelyAsync(TourFlowDbContext db, CancellationToken ct)
    {
        try
        {
            return await db.Database.CanConnectAsync(ct);
        }
        catch
        {
            return false;
        }
    }
}
