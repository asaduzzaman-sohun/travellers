# Stage 1: Build .NET application
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy project files for layer caching
COPY TourFlow.Domain/TourFlow.Domain.csproj TourFlow.Domain/
COPY TourFlow.Application/TourFlow.Application.csproj TourFlow.Application/
COPY TourFlow.Infrastructure/TourFlow.Infrastructure.csproj TourFlow.Infrastructure/
COPY TourFlow.Api/TourFlow.Api.csproj TourFlow.Api/

# Restore dependencies
RUN dotnet restore TourFlow.Api/TourFlow.Api.csproj

# Copy all source files
COPY TourFlow.Domain/ TourFlow.Domain/
COPY TourFlow.Application/ TourFlow.Application/
COPY TourFlow.Infrastructure/ TourFlow.Infrastructure/
COPY TourFlow.Api/ TourFlow.Api/

# Build and publish release binaries
RUN dotnet publish TourFlow.Api/TourFlow.Api.csproj -c Release -o /app/publish --no-restore

# Stage 2: ASP.NET Core Runtime
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

ENV ASPNETCORE_URLS=http://+:5000
ENV ASPNETCORE_ENVIRONMENT=Production

COPY --from=build /app/publish .

EXPOSE 5000
ENTRYPOINT ["dotnet", "TourFlow.Api.dll"]
