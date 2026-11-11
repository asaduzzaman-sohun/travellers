using System.Collections.Concurrent;

namespace TourFlow.Api.Services;

public record RateLimitEvent(
    DateTime TimestampUtc,
    string Policy,
    string ClientKey,
    string Path
);

public record RateLimitPolicyMetadata(
    string Name,
    string Algorithm,
    int PermitLimit,
    string WindowDescription,
    string PartitionStrategy
);

public class RuntimeMetricsService
{
    private long _totalRequests;
    private long _totalRateLimitRejections;
    private double _cumulativeResponseMs;
    private readonly object _timingLock = new();

    private readonly ConcurrentDictionary<string, long> _rejectionsByPolicy = new(StringComparer.OrdinalIgnoreCase);
    private readonly ConcurrentDictionary<string, long> _requestsByMethod = new(StringComparer.OrdinalIgnoreCase);
    private readonly ConcurrentQueue<RateLimitEvent> _recentThrottles = new();

    public string InstanceId { get; } =
        Environment.GetEnvironmentVariable("INSTANCE_ID")
        ?? Environment.GetEnvironmentVariable("HOSTNAME")
        ?? $"api-node-{Environment.ProcessId}";

    public DateTime StartedAtUtc { get; } = DateTime.UtcNow;

    public void RecordRequest(string method, double elapsedMs)
    {
        Interlocked.Increment(ref _totalRequests);
        _requestsByMethod.AddOrUpdate(method, 1, (_, current) => current + 1);
        lock (_timingLock)
        {
            _cumulativeResponseMs += elapsedMs;
        }
    }

    public void RecordRejection(string policy, string clientKey, string path)
    {
        Interlocked.Increment(ref _totalRateLimitRejections);
        _rejectionsByPolicy.AddOrUpdate(policy, 1, (_, current) => current + 1);

        _recentThrottles.Enqueue(new RateLimitEvent(DateTime.UtcNow, policy, clientKey, path));
        while (_recentThrottles.Count > 15)
        {
            _recentThrottles.TryDequeue(out _);
        }
    }

    public object GetSnapshot()
    {
        var total = Interlocked.Read(ref _totalRequests);
        double avgMs;
        lock (_timingLock)
        {
            avgMs = total > 0 ? Math.Round(_cumulativeResponseMs / total, 2) : 0;
        }

        var policies = new RateLimitPolicyMetadata[]
        {
            new("global", "SlidingWindowLimiter", 200, "1 min (6 segments)", "Per Authenticated User ID or Client IP"),
            new("auth", "SlidingWindowLimiter", 15, "1 min (6 segments)", "Per Client IP (X-Forwarded-For / RemoteIp)"),
            new("booking", "TokenBucketLimiter", 10, "+5 tokens / 30s (burst 10)", "Per Authenticated User ID or Client IP"),
            new("write", "TokenBucketLimiter", 12, "+4 tokens / 30s (burst 12)", "Per Authenticated User ID or Client IP"),
        };

        return new
        {
            instanceId = InstanceId,
            startedAtUtc = StartedAtUtc,
            uptimeSeconds = Math.Round((DateTime.UtcNow - StartedAtUtc).TotalSeconds, 1),
            totalRequests = total,
            totalRateLimitRejections = Interlocked.Read(ref _totalRateLimitRejections),
            averageResponseTimeMs = avgMs,
            requestsByMethod = _requestsByMethod.ToDictionary(kvp => kvp.Key, kvp => kvp.Value),
            rejectionsByPolicy = _rejectionsByPolicy.ToDictionary(kvp => kvp.Key, kvp => kvp.Value),
            recentThrottles = _recentThrottles.ToArray().Reverse(),
            policies
        };
    }
}
