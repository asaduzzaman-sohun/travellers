using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;
using TourFlow.Api.Services;
using TourFlow.Application;
using TourFlow.Infrastructure;
using TourFlow.Infrastructure.Data;

var builder = WebApplication.CreateBuilder(args);

// Register Clean Architecture layers
builder.Services.AddApplicationServices();
builder.Services.AddInfrastructureServices(builder.Configuration);

// Register Auth Services
builder.Services.AddSingleton<IPasswordHasher, PasswordHasher>();
builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();

// Configure JWT Authentication
var jwtSecret = builder.Configuration["Jwt:Secret"] ?? "TourFlow_Super_Secret_Jwt_Security_Key_2026_Bangladesh_Tourism_Special_Key_12345!";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "TourFlowApi";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "TourFlowApp";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
        ValidateIssuer = true,
        ValidIssuer = jwtIssuer,
        ValidateAudience = true,
        ValidAudience = jwtAudience,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };

    // SignalR sends JWTs over WebSocket/SSE via ?access_token=... because browsers cannot set Authorization headers on WebSockets.
    options.Events = new Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;
            if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
            {
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        }
    };
});

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("RequireAdminRole", policy => policy.RequireRole("Admin", "SuperAdmin"));
    options.AddPolicy("RequireSuperAdminRole", policy => policy.RequireRole("SuperAdmin"));
});

// Add Controllers & JSON Options
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

// Real-Time SignalR Hub & PostgreSQL Cross-Node Backplane
builder.Services.AddHttpClient("GeminiConcierge", client =>
{
    client.Timeout = TimeSpan.FromSeconds(10);
});
builder.Services.AddSignalR();
builder.Services.AddScoped<TourFlow.Api.Services.IRealtimeNotifier, TourFlow.Api.Services.RealtimeNotificationService>();
builder.Services.AddScoped<TourFlow.Api.Services.ITourFlowChatbotService, TourFlow.Api.Services.TourFlowChatbotService>();
builder.Services.AddHostedService<TourFlow.Api.Services.PostgresSignalRBackplaneService>();

// Configure CORS for Next.js Frontend
var frontendUrl = builder.Configuration["FrontendUrl"] ?? "http://localhost:3000";
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(frontendUrl, "http://localhost:3001")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials()
              .WithExposedHeaders("X-Served-By", "X-Response-Time-Ms", "X-LoadBalancer", "X-RateLimit-Policy", "Retry-After");
    });
});

// OpenAPI configuration
builder.Services.AddOpenApi();

// Configure Partitioned Rate Limiting, Proxy Forwarded Headers & Node Observability
TourFlow.Api.Extensions.ResilienceExtensions.AddTourFlowResilience(builder.Services);

// Configure Response Compression for high throughput
builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
});

var app = builder.Build();

// Fail fast in Production if critical cryptographic or database secrets are left blank.
if (app.Environment.IsProduction())
{
    var prodConn = app.Configuration.GetConnectionString("DefaultConnection");
    var prodJwtSecret = app.Configuration["Jwt:Secret"];
    var prodPaymentHmac = app.Configuration["PaymentGateway:HmacSecret"];
    if (string.IsNullOrWhiteSpace(prodConn)
        || string.IsNullOrWhiteSpace(prodJwtSecret)
        || prodJwtSecret.Length < 32
        || string.IsNullOrWhiteSpace(prodPaymentHmac)
        || prodPaymentHmac.Length < 16)
    {
        throw new InvalidOperationException(
            "Production startup blocked: configure ConnectionStrings__DefaultConnection, Jwt__Secret (min 32 chars), and PaymentGateway__HmacSecret (min 16 chars) via environment variables.");
    }
}

// Enable Response Compression & Security Headers early in pipeline
app.UseResponseCompression();
app.UseMiddleware<TourFlow.Api.Middleware.SecurityHeadersMiddleware>();

// Global validation & exception handling middleware
app.UseMiddleware<TourFlow.Api.Middleware.ValidationExceptionMiddleware>();

// Seed database on startup
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<TourFlowDbContext>();
        await DbInitializer.SeedAsync(context);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while seeding the database.");
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference(options =>
    {
        options.WithTitle("TourFlow API Documentation")
               .WithTheme(ScalarTheme.Moon);
    });
}

if (app.Configuration.GetValue<bool>("EnableHttpsRedirection"))
{
    app.UseHttpsRedirection();
}

var wwwrootPath = Path.Combine(app.Environment.ContentRootPath, "wwwroot");
if (!Directory.Exists(wwwrootPath))
{
    Directory.CreateDirectory(wwwrootPath);
}
var uploadsPath = Path.Combine(wwwrootPath, "uploads");
if (!Directory.Exists(uploadsPath))
{
    Directory.CreateDirectory(uploadsPath);
}

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(wwwrootPath),
    RequestPath = ""
});

app.UseForwardedHeaders();
app.UseCors("AllowFrontend");
app.UseMiddleware<TourFlow.Api.Middleware.RequestObservabilityMiddleware>();

app.UseAuthentication();
app.UseRateLimiter();
app.UseAuthorization();

app.MapControllers();
app.MapHub<TourFlow.Api.Hubs.TourFlowHub>("/hubs/tourflow");

TourFlow.Api.Extensions.ResilienceExtensions.MapTourFlowObservability(app);

app.Run();
