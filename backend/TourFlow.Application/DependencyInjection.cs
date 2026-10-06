using Microsoft.Extensions.DependencyInjection;

namespace TourFlow.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        // Business logic services, validators, and handlers will be registered here
        return services;
    }
}
