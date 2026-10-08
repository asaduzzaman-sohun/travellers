using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using TourFlow.Application.Common.Interfaces;
using TourFlow.Application.Tours.Queries.GetTours;
using TourFlow.Domain.Entities;
using TourFlow.Domain.Enums;
using TourFlow.Infrastructure.Data;
using Xunit;

namespace TourFlow.Tests;

public class GetToursQueryHandlerTests
{
    private TourFlowDbContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<TourFlowDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        var context = new TourFlowDbContext(options);

        // Seed 3 test tours
        context.TourPackages.AddRange(
            new TourPackage
            {
                Id = Guid.NewGuid(),
                Title = "Sajek Valley Cloud Expedition",
                Slug = "sajek-valley-cloud-expedition",
                Summary = "Wake up above clouds.",
                Description = "Scenic tour of Sajek.",
                Destination = "Sajek Valley",
                Country = "Bangladesh",
                Region = "Chittagong Division",
                Category = TourCategory.MountainTrekking,
                Difficulty = DifficultyLevel.Easy,
                BasePrice = 8500,
                DepositAmount = 2500,
                IsActive = true,
                IsFeatured = true
            },
            new TourPackage
            {
                Id = Guid.NewGuid(),
                Title = "Sundarbans Mangrove Cruise",
                Slug = "sundarbans-mangrove-cruise",
                Summary = "Tidal forest cruise.",
                Description = "Mangrove and wildlife experience.",
                Destination = "Sundarbans",
                Country = "Bangladesh",
                Region = "Khulna Division",
                Category = TourCategory.WildlifeAndSafari,
                Difficulty = DifficultyLevel.Moderate,
                BasePrice = 14500,
                DepositAmount = 4000,
                IsActive = true,
                IsFeatured = false
            },
            new TourPackage
            {
                Id = Guid.NewGuid(),
                Title = "Cox's Bazar Beach Getaway",
                Slug = "coxs-bazar-beach-getaway",
                Summary = "Longest unbroken beach.",
                Description = "Relax on sandy shores.",
                Destination = "Cox's Bazar",
                Country = "Bangladesh",
                Region = "Chittagong Division",
                Category = TourCategory.BeachAndResort,
                Difficulty = DifficultyLevel.Easy,
                BasePrice = 11000,
                DepositAmount = 3000,
                IsActive = true,
                IsFeatured = false
            }
        );

        context.SaveChanges();
        return context;
    }

    [Fact]
    public async Task Handle_ShouldReturnAllActiveTours_WhenNoFilterApplied()
    {
        using var context = CreateInMemoryDbContext();
        var cacheMock = new Mock<ICacheService>();
        cacheMock.Setup(c => c.GetVersionedKeyAsync(It.IsAny<string>(), It.IsAny<string>()))
            .ReturnsAsync((string d, string k) => $"{d}:v1:{k}");
        cacheMock.Setup(c => c.GetAsync<List<TourSummaryDto>>(It.IsAny<string>()))
            .ReturnsAsync((List<TourSummaryDto>?)null);

        var handler = new GetToursQueryHandler(context, cacheMock.Object);
        var query = new GetToursQuery();

        var result = await handler.Handle(query, CancellationToken.None);

        result.Should().HaveCount(3);
    }

    [Fact]
    public async Task Handle_ShouldFilterByCategory()
    {
        using var context = CreateInMemoryDbContext();
        var cacheMock = new Mock<ICacheService>();
        cacheMock.Setup(c => c.GetVersionedKeyAsync(It.IsAny<string>(), It.IsAny<string>()))
            .ReturnsAsync((string d, string k) => $"{d}:v1:{k}");

        var handler = new GetToursQueryHandler(context, cacheMock.Object);
        var query = new GetToursQuery(Category: TourCategory.WildlifeAndSafari);

        var result = await handler.Handle(query, CancellationToken.None);

        result.Should().HaveCount(1);
        result[0].Title.Should().Be("Sundarbans Mangrove Cruise");
    }

    [Fact]
    public async Task Handle_ShouldFilterBySearchText()
    {
        using var context = CreateInMemoryDbContext();
        var cacheMock = new Mock<ICacheService>();
        cacheMock.Setup(c => c.GetVersionedKeyAsync(It.IsAny<string>(), It.IsAny<string>()))
            .ReturnsAsync((string d, string k) => $"{d}:v1:{k}");

        var handler = new GetToursQueryHandler(context, cacheMock.Object);
        var query = new GetToursQuery(Search: "Sajek");

        var result = await handler.Handle(query, CancellationToken.None);

        result.Should().HaveCount(1);
        result[0].Title.Should().Contain("Sajek");
    }
}
