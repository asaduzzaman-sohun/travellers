using System.Collections.Concurrent;
using System.Threading.RateLimiting;
using Yarp.ReverseProxy;
using Yarp.ReverseProxy.Health;
using Yarp.ReverseProxy.LoadBalancing;
using Yarp.ReverseProxy.Model;

var builder = WebApplication.CreateBuilder(args);

var startedAtUtc = DateTime.UtcNow;
long totalGatewayRequests = 0;
long totalGatewayThrottled = 0;
var throttlesByPolicy = new ConcurrentDictionary<string, long>(StringComparer.OrdinalIgnoreCase);

static string ResolveClientIp(HttpContext context)
{
    var forwardedFor = context.Request.Headers["X-Forwarded-For"].FirstOrDefault();
    if (!string.IsNullOrWhiteSpace(forwardedFor))
    {
        var first = forwardedFor.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .FirstOrDefault();
        if (!string.IsNullOrWhiteSpace(first))
        {
            return first;
        }
    }

    return context.Request.Headers["X-Real-IP"].FirstOrDefault()?.Trim()
        ?? context.Connection.RemoteIpAddress?.ToString()
        ?? "unknown";
}

static (string Policy, bool IsBypassed) ClassifyRoute(HttpContext context)
{
    var path = context.Request.Path.Value ?? string.Empty;
    var method = context.Request.Method;

    if (path.Equals("/lb-status", StringComparison.OrdinalIgnoreCase) ||
        path.StartsWith("/api/health", StringComparison.OrdinalIgnoreCase) ||
        path.StartsWith("/hubs", StringComparison.OrdinalIgnoreCase) ||
        path.StartsWith("/scalar", StringComparison.OrdinalIgnoreCase) ||
        path.StartsWith("/openapi", StringComparison.OrdinalIgnoreCase) ||
        path.StartsWith("/uploads", StringComparison.OrdinalIgnoreCase) ||
        HttpMethods.IsOptions(method))
    {
        return ("bypass", true);
    }

    if (path.StartsWith("/api/auth/", StringComparison.OrdinalIgnoreCase) && !HttpMethods.IsGet(method))
    {
        return ("auth", false);
    }

    if ((path.StartsWith("/api/bookings", StringComparison.OrdinalIgnoreCase) ||
         path.StartsWith("/api/payments", StringComparison.OrdinalIgnoreCase)) &&
        !HttpMethods.IsGet(method))
    {
        return ("booking", false);
    }

    if ((path.StartsWith("/api/blogposts", StringComparison.OrdinalIgnoreCase) ||
         path.StartsWith("/api/reviews", StringComparison.OrdinalIgnoreCase)) &&
        (HttpMethods.IsPost(method) || HttpMethods.IsPut(method) || HttpMethods.IsPatch(method) || HttpMethods.IsDelete(method)))
    {
        return ("write", false);
    }

    return ("global", false);
}

// Gateway CORS policy exclusively for gateway-local endpoints (/lb-status and gateway 429 responses).
// Normal proxied API responses preserve upstream TourFlow.Api CORS headers without duplicating them.
builder.Services.AddCors(options =>
{
    options.AddPolicy("GatewayDiagnostics", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:3001")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Cluster-wide Route-Aware Partitioned Rate Limiter (prevents limit dilution across N backend replicas)
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
    {
        var (policy, bypassed) = ClassifyRoute(context);
        if (bypassed)
        {
            return RateLimitPartition.GetNoLimiter("gateway-bypass");
        }

        var clientIp = ResolveClientIp(context);
        return policy switch
        {
            "auth" => RateLimitPartition.GetSlidingWindowLimiter($"gw:auth:{clientIp}", _ => new SlidingWindowRateLimiterOptions
            {
                PermitLimit = 15,
                Window = TimeSpan.FromMinutes(1),
                SegmentsPerWindow = 6,
                QueueLimit = 0,
                AutoReplenishment = true
            }),
            "booking" => RateLimitPartition.GetTokenBucketLimiter($"gw:booking:{clientIp}", _ => new TokenBucketRateLimiterOptions
            {
                TokenLimit = 10,
                TokensPerPeriod = 5,
                ReplenishmentPeriod = TimeSpan.FromSeconds(30),
                QueueLimit = 2,
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                AutoReplenishment = true
            }),
            "write" => RateLimitPartition.GetTokenBucketLimiter($"gw:write:{clientIp}", _ => new TokenBucketRateLimiterOptions
            {
                TokenLimit = 12,
                TokensPerPeriod = 4,
                ReplenishmentPeriod = TimeSpan.FromSeconds(30),
                QueueLimit = 1,
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                AutoReplenishment = true
            }),
            _ => RateLimitPartition.GetSlidingWindowLimiter($"gw:global:{clientIp}", _ => new SlidingWindowRateLimiterOptions
            {
                PermitLimit = 300,
                Window = TimeSpan.FromMinutes(1),
                SegmentsPerWindow = 6,
                QueueLimit = 4,
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                AutoReplenishment = true
            })
        };
    });

    options.OnRejected = async (ctx, ct) =>
    {
        var http = ctx.HttpContext;
        var (policy, _) = ClassifyRoute(http);
        Interlocked.Increment(ref totalGatewayThrottled);
        throttlesByPolicy.AddOrUpdate(policy, 1, (_, c) => c + 1);

        var retryAfterSeconds = 30;
        if (ctx.Lease.TryGetMetadata(MetadataName.RetryAfter, out var retryAfter))
        {
            retryAfterSeconds = Math.Max(1, (int)Math.Ceiling(retryAfter.TotalSeconds));
        }

        var origin = http.Request.Headers["Origin"].FirstOrDefault();
        if (origin is "http://localhost:3000" or "http://localhost:3001")
        {
            http.Response.Headers["Access-Control-Allow-Origin"] = origin;
            http.Response.Headers["Access-Control-Allow-Credentials"] = "true";
            http.Response.Headers["Access-Control-Expose-Headers"] = "X-Served-By, X-Response-Time-Ms, X-LoadBalancer, X-RateLimit-Policy, Retry-After";
        }

        http.Response.StatusCode = StatusCodes.Status429TooManyRequests;
        http.Response.Headers["Retry-After"] = retryAfterSeconds.ToString();
        http.Response.Headers["X-LoadBalancer"] = "TourFlow-YARP";
        http.Response.Headers["X-Served-By"] = "yarp-gateway";
        http.Response.Headers["X-RateLimit-Policy"] = policy;

        await http.Response.WriteAsJsonAsync(new
        {
            error = "Too many requests",
            message = $"Cluster gateway rate limit exceeded for policy '{policy}'. Retry after {retryAfterSeconds}s.",
            policy,
            retryAfterSeconds,
            clientIp = ResolveClientIp(http),
            gateway = "TourFlow-YARP"
        }, ct);
    };
});

builder.Services.AddSingleton<ILoadBalancingPolicy, AdaptiveLeastRequestsLoadBalancingPolicy>();

builder.Services
    .AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

var app = builder.Build();

app.MapGet("/lb-status", (IProxyStateLookup lookup) =>
{
    var cluster = lookup.TryGetCluster("tourflow-api-cluster", out var clusterState)
        ? clusterState
        : null;

    var destinations = cluster?.Destinations.Values.Select(d => new
    {
        id = d.DestinationId,
        address = d.Model.Config.Address,
        activeHealth = d.Health.Active.ToString(),
        passiveHealth = d.Health.Passive.ToString(),
        isAvailable = cluster.DestinationsState.AvailableDestinations.Contains(d),
        concurrentRequests = d.ConcurrentRequestCount
    }).OrderBy(d => d.id).ToList();

    return Results.Ok(new
    {
        gateway = "TourFlow YARP Load Balancer",
        algorithm = "AdaptiveLeastRequests",
        edgeRateLimit = "Route-aware partitioned (auth:15/m, booking:10+5/30s, write:12+4/30s, global:300/m)",
        healthCheckIntervalSeconds = 10,
        uptimeSeconds = Math.Round((DateTime.UtcNow - startedAtUtc).TotalSeconds, 1),
        totalProxiedRequests = Interlocked.Read(ref totalGatewayRequests),
        totalGatewayThrottled = Interlocked.Read(ref totalGatewayThrottled),
        throttlesByPolicy = throttlesByPolicy.ToDictionary(k => k.Key, k => k.Value),
        healthyNodeCount = destinations?.Count(d => d.isAvailable && d.activeHealth != nameof(DestinationHealth.Unhealthy)) ?? 0,
        totalNodeCount = destinations?.Count ?? 0,
        destinations
    });
}).RequireCors("GatewayDiagnostics");

app.UseCors();
app.UseRateLimiter();

app.Use(async (context, next) =>
{
    context.Response.OnStarting(() =>
    {
        var headers = context.Response.Headers;
        headers.TryAdd("X-Content-Type-Options", "nosniff");
        headers.TryAdd("X-Frame-Options", "DENY");
        headers.TryAdd("Referrer-Policy", "strict-origin-when-cross-origin");
        headers.TryAdd("Permissions-Policy", "camera=(), microphone=(), geolocation=(self)");
        return Task.CompletedTask;
    });

    if (!context.Request.Path.StartsWithSegments("/lb-status"))
    {
        Interlocked.Increment(ref totalGatewayRequests);
    }
    await next();
});

app.MapReverseProxy();

app.Run();

/// <summary>
/// Picks the healthy destination with the fewest concurrent active requests,
/// breaking ties via round-robin rotation across healthy nodes.
/// </summary>
public sealed class AdaptiveLeastRequestsLoadBalancingPolicy : ILoadBalancingPolicy
{
    private long _cursor = -1;

    public string Name => "AdaptiveLeastRequests";

    public DestinationState? PickDestination(
        HttpContext context,
        ClusterState cluster,
        IReadOnlyList<DestinationState> availableDestinations)
    {
        if (availableDestinations.Count == 0)
        {
            return null;
        }

        if (availableDestinations.Count == 1)
        {
            return availableDestinations[0];
        }

        var count = availableDestinations.Count;
        var startIndex = (int)(Interlocked.Increment(ref _cursor) & 0x7FFFFFFF) % count;

        DestinationState? best = null;
        var lowestConcurrency = int.MaxValue;

        for (var i = 0; i < count; i++)
        {
            var candidate = availableDestinations[(startIndex + i) % count];
            var concurrency = candidate.ConcurrentRequestCount;
            if (concurrency < lowestConcurrency)
            {
                lowestConcurrency = concurrency;
                best = candidate;
            }
        }

        return best;
    }
}
