using TourFlow.Domain.Entities;
using TourFlow.Domain.Enums;

namespace TourFlow.Infrastructure.Data;

public static class DbInitializer
{
    public static async Task SeedAsync(TourFlowDbContext context)
    {
        if (context.TourPackages.Any())
        {
            return; // Already seeded
        }

        var baliTour = new TourPackage
        {
            Title = "Bali Tropical Odyssey & Cultural Temples",
            Slug = "bali-tropical-odyssey",
            Summary = "Experience mystical water temples, lush emerald rice terraces, and sun-kissed beaches in Bali.",
            Description = "Embark on a transformative 7-day expedition through the Island of the Gods. Traverse ancient monkey forests in Ubud, marvel at sea temples carved into seaside cliffs, and unwind at private beachfront resorts in Seminyak. Includes authentic cooking classes and sunrise hikes.",
            Destination = "Bali, Ubud & Nusa Penida",
            Country = "Indonesia",
            DurationDays = 7,
            DurationNights = 6,
            BasePrice = 1299.00m,
            DiscountPrice = 1099.00m,
            MaxGroupSize = 14,
            Difficulty = DifficultyLevel.Easy,
            Category = TourCategory.Cultural,
            CoverImageUrl = "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80",
            GalleryImages = [
                "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1555400038-63f5ba517a47?auto=format&fit=crop&w=800&q=80"
            ],
            Inclusions = [
                "6 Nights in 4-Star Boutique Eco-Resorts",
                "Daily Artisan Breakfasts & 4 Cultural Dinners",
                "Private Air-Conditioned Transport with English-speaking Guide",
                "Fast-boat transfer to Nusa Penida island",
                "All temple entry fees and traditional sarong rentals"
            ],
            Exclusions = [
                "International flights to/from Denpasar (DPS)",
                "Personal travel insurance",
                "Alcoholic beverages and personal expenses"
            ],
            IsActive = true,
            IsFeatured = true,
            ItineraryDays = [
                new() {
                    DayNumber = 1,
                    Title = "Arrival in Denpasar & Ubud Welcome",
                    Description = "Airport pickup, transfer to serene boutique resort in Ubud, evening welcome banquet.",
                    Accommodation = "Ubud Valley Sanctuary Resort",
                    MealsIncluded = "Dinner",
                    Location = "Ubud"
                },
                new() {
                    DayNumber = 2,
                    Title = "Sacred Monkey Forest & Tegallalang Rice Terraces",
                    Description = "Morning stroll through lush monkey sanctuary followed by walk among tiered green rice fields.",
                    Accommodation = "Ubud Valley Sanctuary Resort",
                    MealsIncluded = "Breakfast, Lunch",
                    Location = "Tegallalang"
                },
                new() {
                    DayNumber = 3,
                    Title = "Mount Batur Sunrise Trek & Natural Hot Springs",
                    Description = "Early morning trek above the clouds to catch sunrise over active volcanic caldera, soaking in thermal hot springs.",
                    Accommodation = "Ubud Valley Sanctuary Resort",
                    MealsIncluded = "Breakfast",
                    Location = "Kintamani"
                }
            ],
            Schedules = [
                new() {
                    StartDate = DateTime.UtcNow.AddDays(14),
                    EndDate = DateTime.UtcNow.AddDays(21),
                    PricePerPerson = 1099.00m,
                    TotalSeats = 14,
                    BookedSeats = 4,
                    Status = ScheduleStatus.Guaranteed
                },
                new() {
                    StartDate = DateTime.UtcNow.AddDays(35),
                    EndDate = DateTime.UtcNow.AddDays(42),
                    PricePerPerson = 1199.00m,
                    TotalSeats = 14,
                    BookedSeats = 0,
                    Status = ScheduleStatus.Scheduled
                }
            ],
            Reviews = [
                new() {
                    ReviewerName = "Sophia Martinez",
                    ReviewerEmail = "sophia@example.com",
                    Rating = 5,
                    Comment = "Unforgettable experience! The sunrise trek was magical and our tour guide made us feel like family.",
                    IsApproved = true
                }
            ]
        };

        var swissAlpsTour = new TourPackage
        {
            Title = "Majestic Swiss Alps & Glacier Express Adventure",
            Slug = "swiss-alps-glacier-express",
            Summary = "Discover snow-capped peaks, scenic panoramic trains, and alpine lakes across Zermatt and Lucerne.",
            Description = "Witness the majesty of the Matterhorn, ride the iconic Glacier Express panoramic train through pristine mountain passes, and cruise along turquoise alpine lakes. Perfect for nature lovers and luxury seekers.",
            Destination = "Zermatt, St. Moritz & Interlaken",
            Country = "Switzerland",
            DurationDays = 8,
            DurationNights = 7,
            BasePrice = 2850.00m,
            DiscountPrice = 2650.00m,
            MaxGroupSize = 12,
            Difficulty = DifficultyLevel.Moderate,
            Category = TourCategory.MountainTrekking,
            CoverImageUrl = "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80",
            GalleryImages = [
                "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=800&q=80"
            ],
            Inclusions = [
                "7 Nights in Luxury Swiss Chalet Hotels",
                "1st Class Swiss Travel Rail Pass (All trains & cogwheel railways)",
                "Matterhorn Glacier Paradise cable car ticket",
                "Daily Gourmet Breakfasts and Alpine Fondue Night"
            ],
            Exclusions = [
                "International Airfare",
                "Lunches and unlisted dinners",
                "Travel protection insurance"
            ],
            IsActive = true,
            IsFeatured = true,
            ItineraryDays = [
                new() {
                    DayNumber = 1,
                    Title = "Arrival in Zurich & Scenic Train to Lucerne",
                    Description = "Meet tour director in Zurich and take the scenic lake route to historic Lucerne.",
                    Accommodation = "Hotel Schweizerhof Luzern",
                    MealsIncluded = "Dinner",
                    Location = "Lucerne"
                },
                new() {
                    DayNumber = 2,
                    Title = "Glacier Express to Zermatt & Matterhorn View",
                    Description = "Board the panoramic Glacier Express crossing dramatic bridges into car-free Zermatt.",
                    Accommodation = "Mont Cervin Palace Zermatt",
                    MealsIncluded = "Breakfast, Dinner",
                    Location = "Zermatt"
                }
            ],
            Schedules = [
                new() {
                    StartDate = DateTime.UtcNow.AddDays(20),
                    EndDate = DateTime.UtcNow.AddDays(28),
                    PricePerPerson = 2650.00m,
                    TotalSeats = 12,
                    BookedSeats = 6,
                    Status = ScheduleStatus.Guaranteed
                }
            ],
            Reviews = [
                new() {
                    ReviewerName = "David Chen",
                    ReviewerEmail = "david.chen@example.com",
                    Rating = 5,
                    Comment = "Spectacular views from start to finish! The rail journeys were smooth and breathtaking.",
                    IsApproved = true
                }
            ]
        };

        var kyotoTour = new TourPackage
        {
            Title = "Ancient Japan: Kyoto, Nara & Sacred Temples",
            Slug = "ancient-japan-kyoto-nara",
            Summary = "Immerse yourself in bamboo groves, historic geisha quarters, and sacred torii gate shrines.",
            Description = "Journey through centuries of Japanese tradition and serenity. Walk beneath thousands of vermilion torii gates at Fushimi Inari, experience a traditional tea ceremony with a master, and visit the bowing deer in Nara Park.",
            Destination = "Kyoto & Nara",
            Country = "Japan",
            DurationDays = 6,
            DurationNights = 5,
            BasePrice = 1890.00m,
            DiscountPrice = 1750.00m,
            MaxGroupSize = 10,
            Difficulty = DifficultyLevel.Easy,
            Category = TourCategory.Historical,
            CoverImageUrl = "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80",
            GalleryImages = [
                "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80"
            ],
            Inclusions = [
                "5 Nights in Authentic Premium Ryokan & Modern Hotel",
                "All Shinkansen bullet train and local transit passes",
                "Private Tea Ceremony in Gion",
                "Daily Breakfasts and Traditional Kaiseki Dinners"
            ],
            Exclusions = [
                "International flights",
                "Personal shopping and souvenirs"
            ],
            IsActive = true,
            IsFeatured = true,
            ItineraryDays = [
                new() {
                    DayNumber = 1,
                    Title = "Kyoto Arrival & Gion Evening Stroll",
                    Description = "Check-in to traditional Ryokan and enjoy lantern-lit stroll through historical preservation district.",
                    Accommodation = "Kyoto Ryokan Gion Sano",
                    MealsIncluded = "Dinner",
                    Location = "Kyoto"
                }
            ],
            Schedules = [
                new() {
                    StartDate = DateTime.UtcNow.AddDays(10),
                    EndDate = DateTime.UtcNow.AddDays(16),
                    PricePerPerson = 1750.00m,
                    TotalSeats = 10,
                    BookedSeats = 2,
                    Status = ScheduleStatus.Guaranteed
                }
            ],
            Reviews = [
                new() {
                    ReviewerName = "Emma Watson",
                    ReviewerEmail = "emma.w@example.com",
                    Rating = 5,
                    Comment = "The kaiseki meals were art, and walking through Arashiyama bamboo forest in the morning was serene.",
                    IsApproved = true
                }
            ]
        };

        context.TourPackages.AddRange(baliTour, swissAlpsTour, kyotoTour);
        await context.SaveChangesAsync();
    }
}
