using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using TourFlow.Infrastructure.Data;

namespace TourFlow.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection") 
                               ?? "Host=localhost;Port=5432;Database=tourflow_db;Username=postgres;Password=postgres";

        services.AddDbContext<TourFlowDbContext>(options =>
            options.UseNpgsql(connectionString));

        services.AddScoped<TourFlow.Application.Common.Interfaces.ITourFlowDbContext>(provider =>
            provider.GetRequiredService<TourFlowDbContext>());

        services.AddMemoryCache();
        services.AddSingleton<TourFlow.Application.Common.Interfaces.ICacheService, TourFlow.Infrastructure.Services.MemoryCacheService>();
        services.AddSingleton<TourFlow.Application.Common.Interfaces.IPhotoService, TourFlow.Infrastructure.Services.CloudinaryPhotoService>();

        return services;
    }
}
