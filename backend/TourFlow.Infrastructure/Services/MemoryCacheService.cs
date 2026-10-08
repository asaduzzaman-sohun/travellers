using System.Collections.Concurrent;
using Microsoft.Extensions.Caching.Memory;
using TourFlow.Application.Common.Interfaces;

namespace TourFlow.Infrastructure.Services;

public class MemoryCacheService : ICacheService
{
    private readonly IMemoryCache _memoryCache;
    private static readonly ConcurrentDictionary<string, int> _domainVersions = new();

    public MemoryCacheService(IMemoryCache memoryCache)
    {
        _memoryCache = memoryCache;
    }

    public Task<T?> GetAsync<T>(string key)
    {
        if (_memoryCache.TryGetValue(key, out T? value))
        {
            return Task.FromResult(value);
        }

        return Task.FromResult<T?>(default);
    }

    public Task SetAsync<T>(string key, T value, TimeSpan? expiration = null)
    {
        var options = new MemoryCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = expiration ?? TimeSpan.FromMinutes(10),
            SlidingExpiration = TimeSpan.FromMinutes(3)
        };

        _memoryCache.Set(key, value, options);
        return Task.CompletedTask;
    }

    public Task RemoveAsync(string key)
    {
        _memoryCache.Remove(key);
        return Task.CompletedTask;
    }

    public Task<string> GetVersionedKeyAsync(string domain, string subKey)
    {
        var version = _domainVersions.GetOrAdd(domain, 1);
        return Task.FromResult($"{domain}:v{version}:{subKey}");
    }

    public Task InvalidateDomainAsync(string domain)
    {
        _domainVersions.AddOrUpdate(domain, 2, (_, current) => current + 1);
        return Task.CompletedTask;
    }
}
