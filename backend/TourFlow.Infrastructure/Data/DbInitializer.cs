using Microsoft.EntityFrameworkCore;
using TourFlow.Domain.Entities;
using TourFlow.Domain.Enums;

namespace TourFlow.Infrastructure.Data;

public static class DbInitializer
{
    private static DateTime Utc(string s) => DateTime.SpecifyKind(DateTime.Parse(s, null, System.Globalization.DateTimeStyles.AdjustToUniversal), DateTimeKind.Utc);

    public static async Task SeedAsync(TourFlowDbContext context)
    {
        // Seed tour packages ONLY if table is empty (prevent wiping user bookings and data on restarts)
        if (!await context.TourPackages.IgnoreQueryFilters().AnyAsync())
        {
            var bangladeshTours = new List<TourPackage>
        {
            // 1. Sajek Valley: Kingdom of Clouds & Hill Tracts
            new()
            {
                Title = "Sajek Valley: Kingdom of Clouds & Hill Tracts",
                Slug = "sajek-valley-clouds-hill-tracts",
                Summary = "Wake up above a sea of white clouds, ride classic Chander Gari mountain jeeps, and hike to Konglak Para.",
                Description = "A peaceful escape to the highest elevated valley in Bangladesh. Experience sunrise over rolling green hills enveloped in mist, walk through indigenous Lusai and Tripura villages at Ruilui Para, trek to the peak of Konglak Para, and enjoy fresh bamboo-cooked chicken beside a cozy wooden cottage in the cool mountain breeze.",
                Destination = "Sajek Valley, Rangamati",
                Country = "Bangladesh",
                Region = "Chittagong Division",
                StartCity = "Dhaka / Khagrachhari",
                EndCity = "Dhaka",
                IdealSeason = "September – March (Best for Clouds)",
                DurationDays = 3,
                DurationNights = 2,
                BasePrice = 8500.00m,
                DiscountPrice = 7500.00m,
                DepositAmount = 2500.00m,
                MaxGroupSize = 12,
                Difficulty = DifficultyLevel.Easy,
                Category = TourCategory.MountainTrekking,
                CoverImageUrl = "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
                GalleryImages = [ "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80" ],
                Highlights = [ "Sunrise & sunset viewpoints overlooking endless sea of clouds", "Hike to Konglak Para (highest point of Sajek Valley)", "Traditional Chander Gari jeep convoy from Dighinala Army Escort", "Authentic bamboo-cooked chicken and hill forest herbs dinner", "Stay in hill-facing wooden cottages with balcony views" ],
                Inclusions = [ "2 Nights accommodation in hill-view cottage (Ruilui Para)", "Round-trip AC coach from Dhaka to Khagrachhari & reserved Chander Gari", "All meals: 3 breakfasts, 3 lunches, 2 dinners (including bamboo chicken night)", "Experienced local tour coordinator and army escort management", "All entry fees and indigenous community contribution passes" ],
                Exclusions = [ "Personal shopping and extra snacks", "Optional zip-lining", "Personal travel insurance" ],
                PackingTips = [ "Light warm jacket or shawl", "Comfortable sneakers or grip sandals", "Power bank", "NID photocopy (mandatory)" ],
                IsActive = true,
                IsFeatured = true,
                ItineraryDays = [
                    new()
                    {
                        DayNumber = 1,
                        Title = "Dhaka to Khagrachhari & Escort to Sajek",
                        Description = "Arrive in Khagrachhari early morning. Traditional paratha and egg breakfast. Board reserved 4x4 Chander Gari to join Bangladesh Army security convoy through scenic hill passes. Sunset from Helipad.",
                        Accommodation = "Megh Kabbo Cottage",
                        MealsIncluded = "Breakfast, Lunch, Bamboo Chicken Dinner",
                        Location = "Ruilui Para, Sajek",
                        ActivityMetrics = "Jeep 3.5 hrs • Walk"
                    },
                    new()
                    {
                        DayNumber = 2,
                        Title = "Konglak Para Sunrise & Lusai Village Stroll",
                        Description = "Early wake-up at 5:30 AM to witness clouds floating into your balcony. Morning hike to Konglak Para, meet local Lusai families, taste mountain papayas, and enjoy starry night.",
                        Accommodation = "Megh Kabbo Cottage",
                        MealsIncluded = "Breakfast, Lunch, Barbecue Dinner",
                        Location = "Konglak Para",
                        ActivityMetrics = "Hill climb 1 hr • Cultural walk"
                    },
                    new()
                    {
                        DayNumber = 3,
                        Title = "Alutila Cave & Return Journey to Dhaka",
                        Description = "Depart Sajek with morning escort. Explore mystical Alutila Cave with flaming bamboo torches and visit Risang Waterfall. Evening return coach to Dhaka.",
                        Accommodation = "Overnight Coach",
                        MealsIncluded = "Breakfast, Lunch, Dinner",
                        Location = "Khagrachhari",
                        ActivityMetrics = "Cave exploration • Highway coach"
                    },
                ],
                Schedules = [
                    new()
                    {
                        StartDate = Utc("2026-10-18T06:00:00Z"),
                        EndDate = Utc("2026-10-20T22:00:00Z"),
                        PricePerPerson = 7500.00m,
                        TotalSeats = 14,
                        BookedSeats = 4,
                        Status = ScheduleStatus.Guaranteed
                    },
                    new()
                    {
                        StartDate = Utc("2026-10-25T06:00:00Z"),
                        EndDate = Utc("2026-10-27T22:00:00Z"),
                        PricePerPerson = 7500.00m,
                        TotalSeats = 14,
                        BookedSeats = 8,
                        Status = ScheduleStatus.Guaranteed
                    },
                    new()
                    {
                        StartDate = Utc("2026-11-05T06:00:00Z"),
                        EndDate = Utc("2026-11-07T22:00:00Z"),
                        PricePerPerson = 7800.00m,
                        TotalSeats = 14,
                        BookedSeats = 2,
                        Status = ScheduleStatus.Guaranteed
                    },
                ],
                Reviews = [
                    new()
                    {
                        ReviewerName = "Tanvir Hasan",
                        ReviewerLocation = "Dhaka",
                        ReviewerEmail = "tanvir hasan@gmail.com",
                        Rating = 5,
                        Title = "Pure bliss above the clouds",
                        Comment = "Waking up to clouds rolling into our cottage balcony was an unforgettable feeling. The driver was punctual and courteous.",
                        TripDateFormatted = "November 2025",
                        IsVerifiedBooking = true
                    },
                    new()
                    {
                        ReviewerName = "Sadia Afrin",
                        ReviewerLocation = "Chittagong",
                        ReviewerEmail = "sadia afrin@gmail.com",
                        Rating = 5,
                        Title = "Safe and well coordinated",
                        Comment = "The army convoy escort was handled smoothly by TourFlow. Bamboo chicken was the highlight of our culinary experience.",
                        TripDateFormatted = "December 2025",
                        IsVerifiedBooking = true
                    },
                ]
            },
            // 2. Tanguar Haor & Niladri Lake: Houseboat Expedition
            new()
            {
                Title = "Tanguar Haor & Niladri Lake: Houseboat Expedition",
                Slug = "tanguar-haor-niladri-houseboat",
                Summary = "Cruise vast turquoise wetlands, explore Shimul Bagan, and sleep under moonlit skies on a premium wooden bajra.",
                Description = "An immersive wetland journey through Sunamganj's Ramsar ecological wonder. Float past the green foothills of Meghalaya, visit the limestone quarry waters of Niladri Lake, listen to water splashing against the wooden hull, and savor authentic haor fish curries and village duck roast cooked fresh onboard.",
                Destination = "Tanguar Haor, Sunamganj",
                Country = "Bangladesh",
                Region = "Sylhet Division",
                StartCity = "Dhaka / Sunamganj",
                EndCity = "Dhaka",
                IdealSeason = "July – October (Monsoon Haor) & Dec – Feb (Migratory Birds)",
                DurationDays = 3,
                DurationNights = 2,
                BasePrice = 9500.00m,
                DiscountPrice = 8500.00m,
                DepositAmount = 3000.00m,
                MaxGroupSize = 16,
                Difficulty = DifficultyLevel.Easy,
                Category = TourCategory.EcoTour,
                CoverImageUrl = "https://images.unsplash.com/photo-1518457607834-6e8d80c183c5?auto=format&fit=crop&w=1200&q=80",
                GalleryImages = [ "https://images.unsplash.com/photo-1518457607834-6e8d80c183c5?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?auto=format&fit=crop&w=1200&q=80" ],
                Highlights = [ "2 Days living on a traditional wooden houseboat with private cabins & washrooms", "Watchtower panoramic view of the vast wetland sanctuary", "Limestone quarry emerald waters at Niladri (Shahid Siraj Lake)", "Stroll through the shaded canopy of Shimul Bagan by Jadukata River", "Traditional village duck curry and fresh freshwater haor fish delicacies" ],
                Inclusions = [ "Full board stay on private wooden houseboat with fan and solar backup", "Dhaka to Sunamganj return AC bus tickets", "All meals prepared onboard: 3 breakfasts, 3 lunches, 2 dinners & evening snacks", "Life jackets, safety equipment, and certified boat captain", "Local dinghy boat rentals for Niladri lake" ],
                Exclusions = [ "Personal snacks & cold drinks", "Tipping for boat crew", "Motorbike rides at Shimul Bagan" ],
                PackingTips = [ "Personal life jacket if you have toddlers", "Quick-dry shorts and t-shirts", "Waterproof dry bag for phones", "Mosquito repellent" ],
                IsActive = true,
                IsFeatured = true,
                ItineraryDays = [
                    new()
                    {
                        DayNumber = 1,
                        Title = "Boarding Houseboat at Tahirpur & Cruising Haor",
                        Description = "Arrive Sunamganj early morning. Transfer to Tahirpur Ghat and board private wooden houseboat. Enjoy hot tea and khichuri as the boat sails into open turquoise haor. Sunset at Watchtower.",
                        Accommodation = "Luxury Bajra Houseboat",
                        MealsIncluded = "Breakfast, Lunch, Fresh Fish Dinner",
                        Location = "Tanguar Haor",
                        ActivityMetrics = "Boat Cruise 4 hrs"
                    },
                    new()
                    {
                        DayNumber = 2,
                        Title = "Niladri Lake, Shimul Bagan & Jadukata River",
                        Description = "Morning swim in calm waters with life jackets. Cruise to Tekerghat. Visit emerald green Niladri Lake and ride along the clear Jadukata river bank shaded by giant Shimul trees.",
                        Accommodation = "Luxury Bajra Houseboat",
                        MealsIncluded = "Breakfast, Lunch, Duck Roast Dinner",
                        Location = "Niladri & Jadukata",
                        ActivityMetrics = "Leisure stroll • River cruise"
                    },
                    new()
                    {
                        DayNumber = 3,
                        Title = "Bareker Tila & Sunamganj City Heritage",
                        Description = "Breakfast overlooking Meghalaya border hills at Bareker Tila. Cruise back to Tahirpur Ghat. Visit Hasan Raja Museum in Sunamganj town. Evening AC coach to Dhaka.",
                        Accommodation = "Overnight Coach",
                        MealsIncluded = "Breakfast, Lunch, Highway Dinner",
                        Location = "Tahirpur to Sunamganj",
                        ActivityMetrics = "River cruise • Highway coach"
                    },
                ],
                Schedules = [
                    new()
                    {
                        StartDate = Utc("2026-10-15T07:00:00Z"),
                        EndDate = Utc("2026-10-17T21:00:00Z"),
                        PricePerPerson = 8500.00m,
                        TotalSeats = 16,
                        BookedSeats = 10,
                        Status = ScheduleStatus.Guaranteed
                    },
                    new()
                    {
                        StartDate = Utc("2026-10-22T07:00:00Z"),
                        EndDate = Utc("2026-10-24T21:00:00Z"),
                        PricePerPerson = 8500.00m,
                        TotalSeats = 16,
                        BookedSeats = 6,
                        Status = ScheduleStatus.Guaranteed
                    },
                    new()
                    {
                        StartDate = Utc("2026-11-12T07:00:00Z"),
                        EndDate = Utc("2026-11-14T21:00:00Z"),
                        PricePerPerson = 8200.00m,
                        TotalSeats = 16,
                        BookedSeats = 3,
                        Status = ScheduleStatus.Guaranteed
                    },
                ],
                Reviews = [
                    new()
                    {
                        ReviewerName = "Nayeemur Rahman",
                        ReviewerLocation = "Dhaka",
                        ReviewerEmail = "nayeemur rahman@gmail.com",
                        Rating = 5,
                        Title = "Tranquility at its best",
                        Comment = "Sleeping on the houseboat under the open night sky was magical. The crew cooked delicious fresh Boal fish and duck curry.",
                        TripDateFormatted = "September 2025",
                        IsVerifiedBooking = true
                    },
                    new()
                    {
                        ReviewerName = "Dr. Farhana Yasmin",
                        ReviewerLocation = "Sylhet",
                        ReviewerEmail = "dr. farhana yasmin@gmail.com",
                        Rating = 5,
                        Title = "Clean, safe, and breathtaking",
                        Comment = "The boat was spotlessly clean with western attached washrooms. Niladri lake was like a postcard painting.",
                        TripDateFormatted = "August 2025",
                        IsVerifiedBooking = true
                    },
                ]
            },
            // 3. Sreemangal & Lawachara: Tea Garden Trails & Rainforest Quietude
            new()
            {
                Title = "Sreemangal & Lawachara: Tea Garden Trails & Rainforest Quietude",
                Slug = "sreemangal-lawachara-tea-rainforest",
                Summary = "Cycle through rolling green tea gardens, spot Hoolock Gibbons in Lawachara Rainforest, and taste authentic Shatkora cuisine.",
                Description = "Immerse yourself in the tea capital of Bangladesh. Pedal through undulating emerald green estates, trek through the dense canopy of Lawachara National Park with a certified naturalist, observe migratory birds at Baikka Beel, and savor the iconic seven-layer tea at Nilkantha Cabin.",
                Destination = "Sreemangal, Moulvibazar",
                Country = "Bangladesh",
                Region = "Sylhet Division",
                StartCity = "Dhaka",
                EndCity = "Dhaka",
                IdealSeason = "All Year (Monsoon for Lush Greenery, Winter for Fog)",
                DurationDays = 3,
                DurationNights = 2,
                BasePrice = 7200.00m,
                DiscountPrice = 6400.00m,
                DepositAmount = 2000.00m,
                MaxGroupSize = 10,
                Difficulty = DifficultyLevel.Easy,
                Category = TourCategory.EcoTour,
                CoverImageUrl = "https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?auto=format&fit=crop&w=1200&q=80",
                GalleryImages = [ "https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80" ],
                Highlights = [ "Bicycle or open jeep ride through Finlay & Madhabpur Tea Estates", "Wildlife trail in Lawachara National Park with certified naturalist", "Sunset reflection over water lilies at Madhabpur Lake", "Visit to Baikka Beel wetland bird sanctuary", "Tasting authentic 7-layer tea at Nilkantha Tea Cabin" ],
                Inclusions = [ "2 Nights in Deluxe Eco-Resort Cottage", "Dhaka to Sreemangal round-trip Parabat Express train or AC bus", "Daily breakfast and traditional Sylheti dinners featuring Shatkora beef/chicken", "Reserved private auto/jeep for all local sightseeing", "Lawachara National Park entry tickets and forest guide fees" ],
                Exclusions = [ "Personal bike rentals (BDT 200/day)", "Lunch meals at town cafes", "Personal souvenirs and shopping" ],
                PackingTips = [ "Earth-colored clothing for forest walk", "Binoculars for bird watching", "Comfortable walking shoes", "Rain jacket" ],
                IsActive = true,
                IsFeatured = true,
                ItineraryDays = [
                    new()
                    {
                        DayNumber = 1,
                        Title = "Morning Train Journey & Tea Estate Stroll",
                        Description = "Board morning Parabat Express from Kamalapur. Check in to scenic eco resort nestled beside tea garden. Afternoon bicycle ride through green trails followed by 7-layer tea tasting.",
                        Accommodation = "Swiss Valley Eco Resort",
                        MealsIncluded = "Breakfast, Shatkora Dinner",
                        Location = "Sreemangal",
                        ActivityMetrics = "Train 4.5 hrs • Easy cycling"
                    },
                    new()
                    {
                        DayNumber = 2,
                        Title = "Lawachara Canopy Trek & Madhabpur Lake",
                        Description = "Early morning trek inside Lawachara National Park to hear barking deer and Hoolock Gibbons. Afternoon excursion to serene Madhabpur Lake surrounded by rolling hills.",
                        Accommodation = "Swiss Valley Eco Resort",
                        MealsIncluded = "Breakfast, Lunch, Dinner",
                        Location = "Lawachara & Kamalganj",
                        ActivityMetrics = "Nature trek 2.5 hrs • Lake walk"
                    },
                    new()
                    {
                        DayNumber = 3,
                        Title = "Baikka Beel Wetland Sanctuary & Return",
                        Description = "Dawn visit to Baikka Beel to observe thousands of resident and migratory water birds from the watchtower. Afternoon return train journey to Dhaka.",
                        Accommodation = "Home",
                        MealsIncluded = "Breakfast, Traditional Lunch",
                        Location = "Baikka Beel to Dhaka",
                        ActivityMetrics = "Bird watching 2 hrs • Train 4.5 hrs"
                    },
                ],
                Schedules = [
                    new()
                    {
                        StartDate = Utc("2026-10-16T06:30:00Z"),
                        EndDate = Utc("2026-10-18T20:00:00Z"),
                        PricePerPerson = 6400.00m,
                        TotalSeats = 10,
                        BookedSeats = 5,
                        Status = ScheduleStatus.Guaranteed
                    },
                    new()
                    {
                        StartDate = Utc("2026-10-23T06:30:00Z"),
                        EndDate = Utc("2026-10-25T20:00:00Z"),
                        PricePerPerson = 6400.00m,
                        TotalSeats = 10,
                        BookedSeats = 7,
                        Status = ScheduleStatus.Guaranteed
                    },
                    new()
                    {
                        StartDate = Utc("2026-11-06T06:30:00Z"),
                        EndDate = Utc("2026-11-08T20:00:00Z"),
                        PricePerPerson = 6600.00m,
                        TotalSeats = 10,
                        BookedSeats = 2,
                        Status = ScheduleStatus.Guaranteed
                    },
                ],
                Reviews = [
                    new()
                    {
                        ReviewerName = "Kazi Asif",
                        ReviewerLocation = "Dhaka",
                        ReviewerEmail = "kazi asif@gmail.com",
                        Rating = 5,
                        Title = "Refreshing green escape",
                        Comment = "Riding a bicycle through Finlay tea garden in early morning mist made all the work stress disappear completely.",
                        TripDateFormatted = "January 2026",
                        IsVerifiedBooking = true
                    },
                    new()
                    {
                        ReviewerName = "Mahira Sultana",
                        ReviewerLocation = "Comilla",
                        ReviewerEmail = "mahira sultana@gmail.com",
                        Rating = 5,
                        Title = "Saw the rare gibbons!",
                        Comment = "Our guide in Lawachara was exceptionally knowledgeable. We saw a family of Hoolock Gibbons swinging across the canopy.",
                        TripDateFormatted = "December 2025",
                        IsVerifiedBooking = true
                    },
                ]
            },
            // 4. Cox’s Bazar & Inani Marine Drive: Serene Coastal Escape
            new()
            {
                Title = "Cox’s Bazar & Inani Marine Drive: Serene Coastal Escape",
                Slug = "coxs-bazar-inani-marine-drive",
                Summary = "Experience the world's longest unbroken sandy beach, coral shores of Inani, and sunset along scenic Marine Drive.",
                Description = "Leave behind crowded tourist beaches and discover the quiet magic of Southern Cox's Bazar. Ride open-air TomToms along the world-renowned Marine Drive with the hills on your left and the Bay of Bengal on your right, walk among prehistoric coral boulders at Inani, and unwind in secluded beachfront resorts.",
                Destination = "Cox's Bazar & Inani Beach",
                Country = "Bangladesh",
                Region = "Chittagong Division",
                StartCity = "Dhaka / Chittagong",
                EndCity = "Dhaka",
                IdealSeason = "October – April (Gentle Sea & Cool Breezes)",
                DurationDays = 4,
                DurationNights = 3,
                BasePrice = 11000.00m,
                DiscountPrice = 9500.00m,
                DepositAmount = 3000.00m,
                MaxGroupSize = 16,
                Difficulty = DifficultyLevel.Easy,
                Category = TourCategory.BeachAndResort,
                CoverImageUrl = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
                GalleryImages = [ "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80" ],
                Highlights = [ "Scenic 45km Marine Drive drive flanked by steep hills and ocean waves", "Sunset and live coral exploration at secluded Inani Beach", "Fresh Rupchanda and Coral fish barbecue dinner under beach lanterns", "Visit to Himchari National Park waterfall and hilltop ocean viewpoint", "Stay in quiet, peaceful beach resort away from central Kolatoli noise" ],
                Inclusions = [ "3 Nights stay in premium beach resort (Inani / Marine Drive)", "Round-trip AC train tickets (Cox's Bazar Express) or Scania AC coach", "Daily gourmet buffet breakfast and 2 special seafood dinners", "Dedicated open-air transport for Marine Drive and Inani excursions" ],
                Exclusions = [ "Parasailing or speed boat charges", "Personal seafood lunches", "Shopping in Burmese Market" ],
                PackingTips = [ "UV protection sunscreen and sunglasses", "Wide brim sun hat", "Beach sandals and slippers" ],
                IsActive = true,
                IsFeatured = true,
                ItineraryDays = [
                    new()
                    {
                        DayNumber = 1,
                        Title = "Scenic Train Ride to Cox's Bazar Iconic Station",
                        Description = "Board the state-of-the-art Cox's Bazar Express over the historic Karnaphuli and Dohazari rail bridge. Check in to beachfront resort in Marine Drive. Sunset ocean walk.",
                        Accommodation = "Sea Pearl Beach Resort",
                        MealsIncluded = "Breakfast, Welcome Seafood Dinner",
                        Location = "Marine Drive",
                        ActivityMetrics = "Train 8 hrs • Leisure beach walk"
                    },
                    new()
                    {
                        DayNumber = 2,
                        Title = "Marine Drive Drive & Inani Coral Coast",
                        Description = "Morning drive along Marine Drive to Inani Beach. Explore natural coral reefs at low tide. Afternoon coconut water and relaxation under palm trees.",
                        Accommodation = "Sea Pearl Beach Resort",
                        MealsIncluded = "Buffet Breakfast, Coral Fish Dinner",
                        Location = "Inani Beach",
                        ActivityMetrics = "Scenic drive 1 hr • Beach exploration"
                    },
                    new()
                    {
                        DayNumber = 3,
                        Title = "Himchari Hilltop Viewpoint & Red Crab Beach",
                        Description = "Morning climb to Himchari hilltop view pavilion overlooking the curved shoreline. Afternoon visit to secluded red crab sandy shores.",
                        Accommodation = "Sea Pearl Beach Resort",
                        MealsIncluded = "Buffet Breakfast, Beach Barbecue",
                        Location = "Himchari",
                        ActivityMetrics = "Hill stairs • Coastal stroll"
                    },
                    new()
                    {
                        DayNumber = 4,
                        Title = "Burmese Market Souvenirs & Return Train",
                        Description = "Morning leisure swim in resort pool. Visit colorful Burmese market for dry fish and handicrafts. Board evening return train to Dhaka.",
                        Accommodation = "Home",
                        MealsIncluded = "Buffet Breakfast, Lunch",
                        Location = "Cox's Bazar Station",
                        ActivityMetrics = "Train journey"
                    },
                ],
                Schedules = [
                    new()
                    {
                        StartDate = Utc("2026-10-20T06:00:00Z"),
                        EndDate = Utc("2026-10-23T22:00:00Z"),
                        PricePerPerson = 9500.00m,
                        TotalSeats = 16,
                        BookedSeats = 8,
                        Status = ScheduleStatus.Guaranteed
                    },
                    new()
                    {
                        StartDate = Utc("2026-11-03T06:00:00Z"),
                        EndDate = Utc("2026-11-06T22:00:00Z"),
                        PricePerPerson = 9500.00m,
                        TotalSeats = 16,
                        BookedSeats = 12,
                        Status = ScheduleStatus.Guaranteed
                    },
                    new()
                    {
                        StartDate = Utc("2026-11-17T06:00:00Z"),
                        EndDate = Utc("2026-11-20T22:00:00Z"),
                        PricePerPerson = 9800.00m,
                        TotalSeats = 16,
                        BookedSeats = 4,
                        Status = ScheduleStatus.Guaranteed
                    },
                ],
                Reviews = [
                    new()
                    {
                        ReviewerName = "Tahmid Hasan",
                        ReviewerLocation = "Chittagong",
                        ReviewerEmail = "tahmid hasan@gmail.com",
                        Rating = 5,
                        Title = "Best way to see Cox's Bazar",
                        Comment = "Staying on Marine Drive instead of Kolatoli changed our entire impression of Cox's Bazar. Completely quiet and peaceful.",
                        TripDateFormatted = "January 2026",
                        IsVerifiedBooking = true
                    },
                    new()
                    {
                        ReviewerName = "Rezaul Karim",
                        ReviewerLocation = "Dhaka",
                        ReviewerEmail = "rezaul karim@gmail.com",
                        Rating = 5,
                        Title = "Smooth train journey",
                        Comment = "The train station in Cox's Bazar is modern and spacious. Highly recommend the sunset at Inani.",
                        TripDateFormatted = "December 2025",
                        IsVerifiedBooking = true
                    },
                ]
            },
            // 5. Sundarbans: 3-Day Eco Cruise into Kotka, Kochikhali & Harbaria
            new()
            {
                Title = "Sundarbans: 3-Day Eco Cruise into Kotka, Kochikhali & Harbaria",
                Slug = "sundarbans-mangrove-kotka-cruise",
                Summary = "Navigate silent mangrove creeks on wooden country boats, observe spotted deer and kingfishers in the world's largest tidal forest.",
                Description = "An awe-inspiring expedition into the UNESCO World Heritage Sundarbans. Cruise aboard a specialized small-ship eco vessel from Khulna/Mongla deep into Kotka wildlife sanctuary, glide through silent tidal canals on rowboats, and discover pristine coastal mudflats with forest armed guards.",
                Destination = "Sundarbans, Khulna & Bagerhat",
                Country = "Bangladesh",
                Region = "Khulna Division",
                StartCity = "Khulna / Mongla",
                EndCity = "Khulna",
                IdealSeason = "November – March (Cool Weather & Abundant Wildlife)",
                DurationDays = 3,
                DurationNights = 3,
                BasePrice = 14500.00m,
                DiscountPrice = 13200.00m,
                DepositAmount = 4000.00m,
                MaxGroupSize = 16,
                Difficulty = DifficultyLevel.Moderate,
                Category = TourCategory.WildlifeAndSafari,
                CoverImageUrl = "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1200&q=80",
                GalleryImages = [ "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80" ],
                Highlights = [ "Silent country boat rowing inside narrow tidal creeks for bird and deer watching", "Canopy walkway and watchtower at Harbaria Eco Center", "Kotka wildlife sanctuary beach walk and spotted deer feeding grounds", "Freshly prepared meals onboard with Bhetki and Golda Chingri (giant prawns)", "Accompanied by licensed armed Bangladesh Forest Department guards" ],
                Inclusions = [ "3 Days full board cabin accommodation on tourist vessel", "All meals: 3 breakfasts, 3 lunches, 3 dinners & afternoon tea", "Official Bangladesh Forest Department entry permits, camera fees & guard charges", "Certified wildlife naturalist guide and silent wooden country boat excursions" ],
                Exclusions = [ "Dhaka to Khulna/Mongla transport (available as add-on)", "Special tipping for forest guards" ],
                PackingTips = [ "Earth-colored clothing (dull olive, khaki, brown)", "Strong binoculars (8x42 or 10x42)", "Slip-resistant footwear for muddy shores" ],
                IsActive = true,
                IsFeatured = true,
                ItineraryDays = [
                    new()
                    {
                        DayNumber = 1,
                        Title = "Boarding at Mongla & Harbaria Canopy Walk",
                        Description = "Board tourist vessel at Mongla Ghat early morning. Sail south past the confluence of Pasur river. Stop at Harbaria Eco Park for guided boardwalk trek.",
                        Accommodation = "Air-Cooled Vessel Cabin",
                        MealsIncluded = "Breakfast, Lunch, Giant Prawn Dinner",
                        Location = "Harbaria",
                        ActivityMetrics = "River cruise 6 hrs • Boardwalk 1.5 hrs"
                    },
                    new()
                    {
                        DayNumber = 2,
                        Title = "Kotka Tiger Corridor & Jamtola Sea Beach",
                        Description = "Silent dawn boat ride through Kotka canal. Watch herds of spotted deer, wild boars, and river otters. Trek through forest to deserted Jamtola beach on Bay of Bengal.",
                        Accommodation = "Air-Cooled Vessel Cabin",
                        MealsIncluded = "Breakfast, Lunch, Barbecue Dinner",
                        Location = "Kotka & Jamtola",
                        ActivityMetrics = "Forest trek 3 hrs • Dinghy ride"
                    },
                    new()
                    {
                        DayNumber = 3,
                        Title = "Kochikhali Creek & Return Sail to Mongla",
                        Description = "Early morning silent exploration of Kochikhali creeks. Sail northward watching dolphin pods in river channels. Disembark at Mongla by evening.",
                        Accommodation = "Return Journey",
                        MealsIncluded = "Breakfast, Lunch, Evening Snacks",
                        Location = "Mongla Ghat",
                        ActivityMetrics = "Cruise 7 hrs"
                    },
                ],
                Schedules = [
                    new()
                    {
                        StartDate = Utc("2026-11-10T06:00:00Z"),
                        EndDate = Utc("2026-11-12T20:00:00Z"),
                        PricePerPerson = 13200.00m,
                        TotalSeats = 16,
                        BookedSeats = 6,
                        Status = ScheduleStatus.Guaranteed
                    },
                    new()
                    {
                        StartDate = Utc("2026-11-24T06:00:00Z"),
                        EndDate = Utc("2026-11-26T20:00:00Z"),
                        PricePerPerson = 13200.00m,
                        TotalSeats = 16,
                        BookedSeats = 9,
                        Status = ScheduleStatus.Guaranteed
                    },
                    new()
                    {
                        StartDate = Utc("2026-12-08T06:00:00Z"),
                        EndDate = Utc("2026-12-10T20:00:00Z"),
                        PricePerPerson = 13500.00m,
                        TotalSeats = 16,
                        BookedSeats = 4,
                        Status = ScheduleStatus.Guaranteed
                    },
                ],
                Reviews = [
                    new()
                    {
                        ReviewerName = "Rafiqul Islam",
                        ReviewerLocation = "Dhaka",
                        ReviewerEmail = "rafiqul islam@gmail.com",
                        Rating = 5,
                        Title = "Unforgettable wilderness silence",
                        Comment = "The dawn boat ride in the narrow canals was serene beyond words. Seeing wild deer so close was magical.",
                        TripDateFormatted = "November 2025",
                        IsVerifiedBooking = true
                    },
                    new()
                    {
                        ReviewerName = "Nazmul Huda",
                        ReviewerLocation = "Khulna",
                        ReviewerEmail = "nazmul huda@gmail.com",
                        Rating = 5,
                        Title = "First-class safety and food",
                        Comment = "The crew prepared incredible dishes every single meal. Forest guards were polite and watchful.",
                        TripDateFormatted = "December 2025",
                        IsVerifiedBooking = true
                    },
                ]
            },
            // 6. Bandarban: Nilgiri Cloud Station, Chimbuk & Boga Lake
            new()
            {
                Title = "Bandarban: Nilgiri Cloud Station, Chimbuk & Boga Lake",
                Slug = "bandarban-nilgiri-chimbuk-boga-lake",
                Summary = "Ascend to 2,200 feet above sea level at Nilgiri Resort, explore crater waters of Boga Lake, and experience Bawm indigenous hospitality.",
                Description = "A dramatic highland tour across the highest motorable road in Bangladesh. Stand high above mountain mist at Nilgiri, visit the historic freshwater crater of Boga Lake nestled between steep peaks, see golden temples, and taste aromatic indigenous bamboo delicacies.",
                Destination = "Bandarban Hill Tracts",
                Country = "Bangladesh",
                Region = "Chittagong Division",
                StartCity = "Dhaka / Chittagong",
                EndCity = "Dhaka",
                IdealSeason = "October – March (Crisp Mountain Days)",
                DurationDays = 3,
                DurationNights = 2,
                BasePrice = 8800.00m,
                DiscountPrice = 7800.00m,
                DepositAmount = 2500.00m,
                MaxGroupSize = 10,
                Difficulty = DifficultyLevel.Moderate,
                Category = TourCategory.MountainTrekking,
                CoverImageUrl = "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
                GalleryImages = [ "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80" ],
                Highlights = [ "Visit Nilgiri Resort (2,200 feet above sea level, touching the clouds)", "Scenic drive through Chimbuk Hill and Shoilo Propat waterfall", "Excursion to mystical freshwater Boga Lake (crater lake)", "Experience local indigenous hill cuisine and wild mountain tea", "Golden Temple (Buddha Dhatu Jadi) architectural visit" ],
                Inclusions = [ "2 Nights accommodation in hill-view eco resort / wooden cottage", "Reserved 4x4 Chander Gari for all mountain transfers", "Round-trip AC coach from Dhaka to Bandarban", "All meals: 3 breakfasts, 3 lunches, 2 dinners", "Registered indigenous Bawm tour guide & security checkpost clearance" ],
                Exclusions = [ "Personal horse riding or quad biking", "Trekking gear", "Personal insurance" ],
                PackingTips = [ "Warm windproof jacket for high altitudes", "Sturdy trekking shoes with rubber grip", "National ID photocopy (mandatory)" ],
                IsActive = true,
                IsFeatured = true,
                ItineraryDays = [
                    new()
                    {
                        DayNumber = 1,
                        Title = "Bandarban Town & Nilgiri Cloud Station",
                        Description = "Arrive in Bandarban. Board open-hood Chander Gari. Climb the winding mountain highway past Shoilo Propat waterfall to Nilgiri summit touching the morning clouds.",
                        Accommodation = "Hill View Eco Resort",
                        MealsIncluded = "Breakfast, Lunch, Hill Herb Dinner",
                        Location = "Nilgiri",
                        ActivityMetrics = "Jeep 3 hrs • Viewpoints"
                    },
                    new()
                    {
                        DayNumber = 2,
                        Title = "Chimbuk Hill & Trek to Boga Lake",
                        Description = "Drive past Chimbuk Hill to Ruma Bazaar. Register at Army Camp and proceed by 4x4 to mystic freshwater Boga Lake surrounded by lush bamboo groves.",
                        Accommodation = "Bawm Eco Cottage at Boga Lake",
                        MealsIncluded = "Breakfast, Lunch, Indigenous Dinner",
                        Location = "Boga Lake",
                        ActivityMetrics = "4x4 mountain drive • Lake walk"
                    },
                    new()
                    {
                        DayNumber = 3,
                        Title = "Golden Temple Architecture & Return",
                        Description = "Morning sunrise over Boga Lake. Return to Bandarban town. Visit majestic Golden Temple (Buddha Dhatu Jadi). Board return AC coach to Dhaka.",
                        Accommodation = "Overnight Coach",
                        MealsIncluded = "Breakfast, Lunch, Dinner",
                        Location = "Bandarban Town",
                        ActivityMetrics = "Temple stroll • Highway coach"
                    },
                ],
                Schedules = [
                    new()
                    {
                        StartDate = Utc("2026-10-22T06:00:00Z"),
                        EndDate = Utc("2026-10-24T22:00:00Z"),
                        PricePerPerson = 7800.00m,
                        TotalSeats = 10,
                        BookedSeats = 4,
                        Status = ScheduleStatus.Guaranteed
                    },
                    new()
                    {
                        StartDate = Utc("2026-11-05T06:00:00Z"),
                        EndDate = Utc("2026-11-07T22:00:00Z"),
                        PricePerPerson = 7800.00m,
                        TotalSeats = 10,
                        BookedSeats = 7,
                        Status = ScheduleStatus.Guaranteed
                    },
                    new()
                    {
                        StartDate = Utc("2026-11-19T06:00:00Z"),
                        EndDate = Utc("2026-11-21T22:00:00Z"),
                        PricePerPerson = 8000.00m,
                        TotalSeats = 10,
                        BookedSeats = 3,
                        Status = ScheduleStatus.Guaranteed
                    },
                ],
                Reviews = [
                    new()
                    {
                        ReviewerName = "Sohail Arman",
                        ReviewerLocation = "Dhaka",
                        ReviewerEmail = "sohail arman@gmail.com",
                        Rating = 5,
                        Title = "The view from Nilgiri is unreal",
                        Comment = "Standing above the clouds with the mountain wind blowing around us was breathtaking. Our guide was courteous and helpful.",
                        TripDateFormatted = "January 2026",
                        IsVerifiedBooking = true
                    },
                    new()
                    {
                        ReviewerName = "Shanta Debnath",
                        ReviewerLocation = "Sylhet",
                        ReviewerEmail = "shanta debnath@gmail.com",
                        Rating = 5,
                        Title = "Boga Lake was so peaceful",
                        Comment = "Boga Lake was the quietest place I have ever visited in my life. Pure crystal clear water and friendly villagers.",
                        TripDateFormatted = "December 2025",
                        IsVerifiedBooking = true
                    },
                ]
            },
            // 7. Saint Martin’s Island: Coral Shores, Coconut Groves & Chera Dwip
            new()
            {
                Title = "Saint Martin’s Island: Coral Shores, Coconut Groves & Chera Dwip",
                Slug = "saint-martins-island-coral-shores",
                Summary = "Cruise across deep blue Bay of Bengal waters, bicycle around the coral island, and explore the living reefs of Chera Dwip.",
                Description = "Experience Bangladesh's only coral island in its purest, most serene state. Sail aboard comfortable cruise ships from Teknaf, stay in quiet coconut grove eco-resorts away from the main jetty, and take low-tide walks along the corals of Chera Dwip.",
                Destination = "Saint Martin's Island & Chera Dwip",
                Country = "Bangladesh",
                Region = "Chittagong Division",
                StartCity = "Dhaka / Teknaf",
                EndCity = "Dhaka",
                IdealSeason = "November – March (Calm Bay of Bengal)",
                DurationDays = 4,
                DurationNights = 3,
                BasePrice = 10500.00m,
                DiscountPrice = 9200.00m,
                DepositAmount = 3000.00m,
                MaxGroupSize = 14,
                Difficulty = DifficultyLevel.Easy,
                Category = TourCategory.BeachAndResort,
                CoverImageUrl = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
                GalleryImages = [ "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80" ],
                Highlights = [ "Cruise across Bay of Bengal on luxury sea vessel", "Low-tide coral reef walking expedition at Chera Dwip", "Bicycle tour around the circumference of the island", "Fresh coconut water and grilled Rupchanda / Red Snapper beach dinners", "Stargazing under crystal-clear ocean skies free from light pollution" ],
                Inclusions = [ "3 Nights in beachside wooden resort (West Beach)", "Round-trip sea cruise tickets (Teknaf to Saint Martin)", "Dhaka to Teknaf round-trip AC coach tickets", "Daily breakfast and traditional seafood dinners" ],
                Exclusions = [ "Bicycle rental fees (BDT 250/day)", "Snorkeling gear rental", "Personal shopping" ],
                PackingTips = [ "Coral-safe water shoes (sharp coral reefs)", "Sun protection hat", "Power bank", "Cash (ATM availability is limited)" ],
                IsActive = true,
                IsFeatured = true,
                ItineraryDays = [
                    new()
                    {
                        DayNumber = 1,
                        Title = "Teknaf to Saint Martin Sea Cruise",
                        Description = "Board morning cruise ship from Teknaf Ghat accompanied by seagulls over the Naf River. Arrive at Saint Martin by noon. Check-in to west beach resort.",
                        Accommodation = "Blue Lagoon Eco Resort",
                        MealsIncluded = "Breakfast, Seafood Dinner",
                        Location = "Saint Martin West Beach",
                        ActivityMetrics = "Sea cruise 2.5 hrs • Beach walk"
                    },
                    new()
                    {
                        DayNumber = 2,
                        Title = "Chera Dwip Coral Reef Expedition",
                        Description = "Morning boat to Chera Dwip at low tide. Walk amongst fossilized corals and crystal turquoise tide pools. Afternoon relaxing under coconut groves.",
                        Accommodation = "Blue Lagoon Eco Resort",
                        MealsIncluded = "Breakfast, Lunch, Coral BBQ",
                        Location = "Chera Dwip",
                        ActivityMetrics = "Trawler ride • Coral hike"
                    },
                    new()
                    {
                        DayNumber = 3,
                        Title = "Island Circumference Bike Ride",
                        Description = "Rent beach bicycles to ride around the whole island trail. Meet local fishermen drying Bombay Duck and savor fresh coconut water.",
                        Accommodation = "Blue Lagoon Eco Resort",
                        MealsIncluded = "Breakfast, Seafood Dinner",
                        Location = "Saint Martin East Beach",
                        ActivityMetrics = "Bicycle ride 3 hrs"
                    },
                    new()
                    {
                        DayNumber = 4,
                        Title = "Morning Swim & Return Cruise",
                        Description = "Early morning swim in turquoise waters. Board afternoon cruise back to Teknaf, connecting to return coach to Dhaka.",
                        Accommodation = "Home",
                        MealsIncluded = "Breakfast, Lunch",
                        Location = "Teknaf to Dhaka",
                        ActivityMetrics = "Sea cruise • Coach"
                    },
                ],
                Schedules = [
                    new()
                    {
                        StartDate = Utc("2026-11-12T06:00:00Z"),
                        EndDate = Utc("2026-11-15T22:00:00Z"),
                        PricePerPerson = 9200.00m,
                        TotalSeats = 14,
                        BookedSeats = 6,
                        Status = ScheduleStatus.Guaranteed
                    },
                    new()
                    {
                        StartDate = Utc("2026-11-26T06:00:00Z"),
                        EndDate = Utc("2026-11-29T22:00:00Z"),
                        PricePerPerson = 9200.00m,
                        TotalSeats = 14,
                        BookedSeats = 8,
                        Status = ScheduleStatus.Guaranteed
                    },
                    new()
                    {
                        StartDate = Utc("2026-12-10T06:00:00Z"),
                        EndDate = Utc("2026-12-13T22:00:00Z"),
                        PricePerPerson = 9500.00m,
                        TotalSeats = 14,
                        BookedSeats = 4,
                        Status = ScheduleStatus.Guaranteed
                    },
                ],
                Reviews = [
                    new()
                    {
                        ReviewerName = "Fahim Reza",
                        ReviewerLocation = "Dhaka",
                        ReviewerEmail = "fahim reza@gmail.com",
                        Rating = 5,
                        Title = "Chera Dwip water is transparent",
                        Comment = "The water around Chera Dwip was crystal clear. We could see corals and small fish swimming directly beneath our feet.",
                        TripDateFormatted = "December 2025",
                        IsVerifiedBooking = true
                    },
                ]
            },
            // 8. Kuakata: 360° Sunrise & Sunset Beach & Mangrove Trails
            new()
            {
                Title = "Kuakata: 360° Sunrise & Sunset Beach & Mangrove Trails",
                Slug = "kuakata-sunrise-sunset-beach-mangrove",
                Summary = "Witness both sunrise and sunset from the same sandy shore, visit Fatrar Bon mangrove forest, and see ancient Rakhine Buddhist temples.",
                Description = "Kuakata, the 'Daughter of the Ocean', is uniquely gifted with panoramic views of both sunrise and sunset melting into the Bay of Bengal. Explore the dense mangrove canopy of Fatrar Bon, visit centuries-old wooden Rakhine Buddhist temples, and walk the serene red crab beaches.",
                Destination = "Kuakata & Gangamati, Patuakhali",
                Country = "Bangladesh",
                Region = "Barishal Division",
                StartCity = "Dhaka / Barishal",
                EndCity = "Dhaka",
                IdealSeason = "October – March (Calm Seas & Cool Mornings)",
                DurationDays = 3,
                DurationNights = 2,
                BasePrice = 7800.00m,
                DiscountPrice = 6800.00m,
                DepositAmount = 2000.00m,
                MaxGroupSize = 14,
                Difficulty = DifficultyLevel.Easy,
                Category = TourCategory.BeachAndResort,
                CoverImageUrl = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
                GalleryImages = [ "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80" ],
                Highlights = [ "Witness sunrise and sunset over the Bay of Bengal from one location", "Boat excursion into Fatrar Bon (part of Sundarbans mangrove eco-zone)", "Gangamati pine forest and red crab sanctuary beach walk", "Centuries-old Misripara Buddhist temple and giant Buddha statue", "Traditional Rakhine handloom weavers and seafood culinary treats" ],
                Inclusions = [ "2 Nights deluxe hotel accommodation in Kuakata", "Dhaka to Kuakata round-trip modern AC bus via Padma Bridge and Payra Bridge", "All meals: 3 breakfasts, 3 lunches, 2 dinners", "Reserved transport for sunrise and mangrove excursions" ],
                Exclusions = [ "Speedboat rides", "Personal shopping", "Motorbike hire on beach" ],
                PackingTips = [ "Comfortable beach footwear", "Sun protection gear", "Camera with telephoto lens for red crabs" ],
                IsActive = true,
                IsFeatured = true,
                ItineraryDays = [
                    new()
                    {
                        DayNumber = 1,
                        Title = "Scenic Journey via Padma Bridge to Kuakata",
                        Description = "Cross the magnificent Padma Bridge and Payra Bridge on express AC coach. Arrive in Kuakata by early afternoon. Enjoy sunset from the central beach.",
                        Accommodation = "Sikder Resort / Hotel Graver Inn",
                        MealsIncluded = "Breakfast, Welcome Dinner",
                        Location = "Kuakata Beach",
                        ActivityMetrics = "Highway drive 6.5 hrs • Sunset walk"
                    },
                    new()
                    {
                        DayNumber = 2,
                        Title = "Gangamati Sunrise & Fatrar Bon Mangrove",
                        Description = "Early morning 5:15 AM drive to Gangamati forest to watch sunrise emerging from the ocean. Board wooden trawler into Fatrar Bon mangrove forest. Visit Rakhine village.",
                        Accommodation = "Sikder Resort",
                        MealsIncluded = "Breakfast, Lunch, Seafood Dinner",
                        Location = "Gangamati & Fatrar Bon",
                        ActivityMetrics = "Boat ride • Forest walk"
                    },
                    new()
                    {
                        DayNumber = 3,
                        Title = "Lebaubon Red Crab Beach & Return",
                        Description = "Morning visit to Lebaubon where thousands of red crabs carpet the beach. Visit centuries-old well (Kua) from which Kuakata derives its name. Return to Dhaka.",
                        Accommodation = "Home",
                        MealsIncluded = "Breakfast, Highway Lunch",
                        Location = "Kuakata to Dhaka",
                        ActivityMetrics = "Highway drive"
                    },
                ],
                Schedules = [
                    new()
                    {
                        StartDate = Utc("2026-10-18T06:30:00Z"),
                        EndDate = Utc("2026-10-20T21:00:00Z"),
                        PricePerPerson = 6800.00m,
                        TotalSeats = 14,
                        BookedSeats = 5,
                        Status = ScheduleStatus.Guaranteed
                    },
                    new()
                    {
                        StartDate = Utc("2026-11-08T06:30:00Z"),
                        EndDate = Utc("2026-11-10T21:00:00Z"),
                        PricePerPerson = 6800.00m,
                        TotalSeats = 14,
                        BookedSeats = 7,
                        Status = ScheduleStatus.Guaranteed
                    },
                ],
                Reviews = [
                    new()
                    {
                        ReviewerName = "Anisur Rahman",
                        ReviewerLocation = "Barishal",
                        ReviewerEmail = "anisur rahman@gmail.com",
                        Rating = 5,
                        Title = "Road journey is so fast now",
                        Comment = "Thanks to Padma Bridge, Kuakata is now a very quick and smooth trip from Dhaka. The sunrise at Gangamati was breathtaking.",
                        TripDateFormatted = "January 2026",
                        IsVerifiedBooking = true
                    },
                ]
            },
            // 9. Barishal Backwaters: Floating Guava Markets & Rural Canal Cruise
            new()
            {
                Title = "Barishal Backwaters: Floating Guava Markets & Rural Canal Cruise",
                Slug = "barishal-backwaters-floating-guava-market",
                Summary = "Glide along silent freshwater canals shaded by hog-plum orchards, witness the century-old floating market at Bhimruli, and experience peaceful village life.",
                Description = "Known as the 'Venice of Bengal', Barishal's backwater canals provide an authentic glimpse of peaceful riverine life. Paddle small wooden dinghies through narrow waterways, watch hundreds of wooden boats laden with sweet green guavas at Bhimruli floating bazaar, and stay in idyllic canal-facing homestays.",
                Destination = "Bhimruli & Kirtipasha, Jhalakathi",
                Country = "Bangladesh",
                Region = "Barishal Division",
                StartCity = "Dhaka",
                EndCity = "Dhaka",
                IdealSeason = "July – September (Peak Guava Harvest) & Oct – Feb (Cool Canal Breezes)",
                DurationDays = 2,
                DurationNights = 2,
                BasePrice = 5500.00m,
                DiscountPrice = 4800.00m,
                DepositAmount = 1500.00m,
                MaxGroupSize = 12,
                Difficulty = DifficultyLevel.Easy,
                Category = TourCategory.EcoTour,
                CoverImageUrl = "https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?auto=format&fit=crop&w=1200&q=80",
                GalleryImages = [ "https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80" ],
                Highlights = [ "Bhimruli floating market boat gathering at the three-canal junction", "Cruise through narrow, arched village canals shaded by Betel nut and Amra trees", "Overnight historic paddle steamer (Rocket) or luxury launch journey on Meghna river", "Taste fresh village guavas and traditional Barishali sweets", "Visit Kirtipasha Zamindar Bari heritage ruins" ],
                Inclusions = [ "Overnight AC cabin on luxury river launch from Dhaka to Barishal", "1 Night stay in river-view hotel / eco cottage in Barishal", "Reserved engine trawler and wooden dinghy for canal exploration", "Traditional meals including Hilsha fish and village breakfast" ],
                Exclusions = [ "Personal fruits shopping", "Tips for boatmen" ],
                PackingTips = [ "Light rain protection", "Waterproof pouch for phones", "Non-slip shoes" ],
                IsActive = true,
                IsFeatured = true,
                ItineraryDays = [
                    new()
                    {
                        DayNumber = 1,
                        Title = "Meghna Night Launch & Dawn at Bhimruli",
                        Description = "Board luxury passenger launch from Sadarghat Dhaka. Arrive Barishal at dawn. Transfer to wooden boat into Bhimruli floating market where farmers trade directly from canoes.",
                        Accommodation = "Grand Park Barishal",
                        MealsIncluded = "Breakfast, Traditional Hilsha Lunch, Dinner",
                        Location = "Bhimruli Canal",
                        ActivityMetrics = "River launch • Boat cruise 4 hrs"
                    },
                    new()
                    {
                        DayNumber = 2,
                        Title = "Canal Orchards, Zamindar Palace & Return",
                        Description = "Morning dinghy rowing through narrow village canals. Visit Kirtipasha Zamindar Bari. Afternoon departure back to Dhaka via express launch or Padma Bridge coach.",
                        Accommodation = "Home",
                        MealsIncluded = "Breakfast, Lunch",
                        Location = "Jhalakathi to Dhaka",
                        ActivityMetrics = "Canal rowing • Highway"
                    },
                ],
                Schedules = [
                    new()
                    {
                        StartDate = Utc("2026-10-17T20:00:00Z"),
                        EndDate = Utc("2026-10-19T18:00:00Z"),
                        PricePerPerson = 4800.00m,
                        TotalSeats = 12,
                        BookedSeats = 7,
                        Status = ScheduleStatus.Guaranteed
                    },
                    new()
                    {
                        StartDate = Utc("2026-10-24T20:00:00Z"),
                        EndDate = Utc("2026-10-26T18:00:00Z"),
                        PricePerPerson = 4800.00m,
                        TotalSeats = 12,
                        BookedSeats = 5,
                        Status = ScheduleStatus.Guaranteed
                    },
                ],
                Reviews = [
                    new()
                    {
                        ReviewerName = "Suman Barua",
                        ReviewerLocation = "Chittagong",
                        ReviewerEmail = "suman barua@gmail.com",
                        Rating = 5,
                        Title = "A hidden gem of peaceful Bengal",
                        Comment = "The canals are so quiet and shaded. Bhimruli floating market was vibrant yet peaceful. Loved the Hilsha fish lunch.",
                        TripDateFormatted = "September 2025",
                        IsVerifiedBooking = true
                    },
                ]
            },
            // 10. Sylhet: Ratargul Swamp Forest, Bisnakandi & Jaflong River
            new()
            {
                Title = "Sylhet: Ratargul Swamp Forest, Bisnakandi & Jaflong River",
                Slug = "sylhet-ratargul-bisnakandi-jaflong",
                Summary = "Paddle through the only freshwater swamp forest in Bangladesh, admire crystal waters of Bisnakandi, and gaze upon Dawki border suspension bridge.",
                Description = "An exhilarating water and stone expedition across northern Sylhet bordering the Khasi and Jaintia hills. Navigate hand-rowed dinghies under the submerged canopy of Ratargul Freshwater Swamp Forest, wade in the clear mountain streams of Bisnakandi, and marvel at the emerald Dawki river at Jaflong.",
                Destination = "Ratargul, Bisnakandi & Jaflong, Sylhet",
                Country = "Bangladesh",
                Region = "Sylhet Division",
                StartCity = "Dhaka / Sylhet",
                EndCity = "Dhaka",
                IdealSeason = "June – October (Best for Swamp Water Levels)",
                DurationDays = 3,
                DurationNights = 2,
                BasePrice = 7900.00m,
                DiscountPrice = 6900.00m,
                DepositAmount = 2000.00m,
                MaxGroupSize = 12,
                Difficulty = DifficultyLevel.Easy,
                Category = TourCategory.EcoTour,
                CoverImageUrl = "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80",
                GalleryImages = [ "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1518457607834-6e8d80c183c5?auto=format&fit=crop&w=1200&q=80" ],
                Highlights = [ "Wooden canoe navigation inside submerged canopy of Ratargul Swamp Forest", "Crystal-clear water running over smooth river stones at Bisnakandi", "Emerald green Piain and Dawki river at Jaflong Zero Point", "Scenic views of towering waterfalls in Meghalaya across the international border", "Authentic Sylheti cuisine featuring Shatkora beef and local haor curries" ],
                Inclusions = [ "2 Nights stay in premium Sylhet hotel", "Dhaka to Sylhet round-trip Parabat/Upaban train or AC coach", "Private reserved microbus / Leguna for all destination tours", "Local dinghy boat rentals for Ratargul and Bisnakandi", "All meals: 3 breakfasts, 3 lunches, 2 dinners" ],
                Exclusions = [ "Personal shopping at Tamabil border", "Extra snacks" ],
                PackingTips = [ "Water shoes with good stone grip", "Dry bag for camera", "Change of clothes for river dip" ],
                IsActive = true,
                IsFeatured = true,
                ItineraryDays = [
                    new()
                    {
                        DayNumber = 1,
                        Title = "Ratargul Freshwater Swamp Forest Canopy",
                        Description = "Arrive in Sylhet morning. Check-in and drive to Gowainghat. Board silent hand-paddled wooden dinghy under the submerged trees and creeping vines of Ratargul swamp.",
                        Accommodation = "Hotel Rose View / Nirvana Inn",
                        MealsIncluded = "Breakfast, Lunch, Dinner",
                        Location = "Ratargul",
                        ActivityMetrics = "Dinghy canoe 2 hrs"
                    },
                    new()
                    {
                        DayNumber = 2,
                        Title = "Bisnakandi Mountain Stream Oasis",
                        Description = "Drive through scenic rural roads to Bisnakandi where cool mountain streams cascade over smooth stone beds with Meghalaya clouds in backdrop.",
                        Accommodation = "Hotel Rose View",
                        MealsIncluded = "Breakfast, Lunch, Dinner",
                        Location = "Bisnakandi",
                        ActivityMetrics = "Boat ride • Stone wading"
                    },
                    new()
                    {
                        DayNumber = 3,
                        Title = "Jaflong Zero Point & Hazrat Shah Jalal Shrine",
                        Description = "Visit Jaflong stone beds and view Dawki suspension bridge. Visit historic Hazrat Shah Jalal Mazar in Sylhet town before evening return train to Dhaka.",
                        Accommodation = "Home",
                        MealsIncluded = "Breakfast, Lunch",
                        Location = "Jaflong & Sylhet",
                        ActivityMetrics = "Cultural stroll • Train"
                    },
                ],
                Schedules = [
                    new()
                    {
                        StartDate = Utc("2026-10-16T06:00:00Z"),
                        EndDate = Utc("2026-10-18T21:00:00Z"),
                        PricePerPerson = 6900.00m,
                        TotalSeats = 12,
                        BookedSeats = 6,
                        Status = ScheduleStatus.Guaranteed
                    },
                    new()
                    {
                        StartDate = Utc("2026-10-30T06:00:00Z"),
                        EndDate = Utc("2026-11-01T21:00:00Z"),
                        PricePerPerson = 6900.00m,
                        TotalSeats = 12,
                        BookedSeats = 4,
                        Status = ScheduleStatus.Guaranteed
                    },
                ],
                Reviews = [
                    new()
                    {
                        ReviewerName = "Kazi Nabil",
                        ReviewerLocation = "Dhaka",
                        ReviewerEmail = "kazi nabil@gmail.com",
                        Rating = 5,
                        Title = "Mesmerizing green waters",
                        Comment = "Ratargul swamp was peaceful like an Amazon rainforest. Bisnakandi water was crystal clear and refreshing.",
                        TripDateFormatted = "August 2025",
                        IsVerifiedBooking = true
                    },
                ]
            },
            // 11. Paharpur & Mahasthangarh: Ancient Bengal UNESCO Heritage Trail
            new()
            {
                Title = "Paharpur & Mahasthangarh: Ancient Bengal UNESCO Heritage Trail",
                Slug = "paharpur-mahasthangarh-ancient-heritage",
                Summary = "Walk through the 8th-century Buddhist monastic ruins of Somapura Mahavihara, the 3rd-century BC citadel of Mahasthangarh, and terracotta temples.",
                Description = "Journey back over twelve centuries into Bengal's glorious architectural past. Explore the UNESCO World Heritage Buddhist vihara at Somapura Mahavihara Paharpur, examine intricate terracotta plaques, wander the historic ramparts of Pundranagar at Mahasthangarh, and marvel at the terracotta beauty of Kantajew Temple.",
                Destination = "Paharpur, Naogaon & Mahasthangarh, Bogura",
                Country = "Bangladesh",
                Region = "Rajshahi Division",
                StartCity = "Dhaka",
                EndCity = "Dhaka",
                IdealSeason = "October – March (Pleasant Autumn & Winter Days)",
                DurationDays = 3,
                DurationNights = 2,
                BasePrice = 8200.00m,
                DiscountPrice = 7200.00m,
                DepositAmount = 2000.00m,
                MaxGroupSize = 14,
                Difficulty = DifficultyLevel.Easy,
                Category = TourCategory.Cultural,
                CoverImageUrl = "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80",
                GalleryImages = [ "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80" ],
                Highlights = [ "Somapura Mahavihara at Paharpur (largest Buddhist monastery south of the Himalayas)", "Mahasthangarh citadel ruins and archaeological museum in Bogura", "Gokul Medh (Behula's bridal chamber monument)", "Taste authentic Bogurar Doi (famous sweet yogurt of Bogura)", "Puthia Royal Palace and Shiva Temple complex" ],
                Inclusions = [ "2 Nights hotel accommodation in Bogura / Rajshahi", "Round-trip AC coach from Dhaka across Jamuna Bridge", "Dedicated AC microbus for all archaeological site visits", "Certified archaeological history guide and museum entry fees", "All meals including Bogurar Doi tasting" ],
                Exclusions = [ "Personal souvenirs", "Special camera permits for museum interiors" ],
                PackingTips = [ "Comfortable walking shoes for walking archaeological grounds", "Sun umbrella or hat", "Notebook for history enthusiasts" ],
                IsActive = true,
                IsFeatured = true,
                ItineraryDays = [
                    new()
                    {
                        DayNumber = 1,
                        Title = "Dhaka to Bogura & Mahasthangarh Ancient Citadel",
                        Description = "Depart Dhaka crossing Jamuna Bangabandhu Bridge. Reach Bogura. Tour 2,500-year-old Pundranagar ramparts at Mahasthangarh and Gokul Medh. Evening authentic Bogurar Doi tasting.",
                        Accommodation = "Hotel Castle Soad / Momo Inn",
                        MealsIncluded = "Breakfast, Lunch, Dinner",
                        Location = "Mahasthangarh",
                        ActivityMetrics = "Highway 5 hrs • Heritage walk"
                    },
                    new()
                    {
                        DayNumber = 2,
                        Title = "Paharpur Somapura Mahavihara UNESCO Expedition",
                        Description = "Full day excursion to Somapura Mahavihara at Paharpur. Explore the central cruciform temple, monastic cells, and onsite museum preserving ancient terracotta art.",
                        Accommodation = "Hotel Castle Soad",
                        MealsIncluded = "Breakfast, Lunch, Dinner",
                        Location = "Paharpur, Naogaon",
                        ActivityMetrics = "Archaeological walk 3 hrs"
                    },
                    new()
                    {
                        DayNumber = 3,
                        Title = "Puthia Temple Complex & Return Journey",
                        Description = "Visit Puthia Rajbari and Shiva Temple adorned with exquisite terracotta carvings. Return journey to Dhaka arriving by late evening.",
                        Accommodation = "Home",
                        MealsIncluded = "Breakfast, Lunch",
                        Location = "Puthia to Dhaka",
                        ActivityMetrics = "Heritage walk • Highway"
                    },
                ],
                Schedules = [
                    new()
                    {
                        StartDate = Utc("2026-10-23T06:30:00Z"),
                        EndDate = Utc("2026-10-25T21:00:00Z"),
                        PricePerPerson = 7200.00m,
                        TotalSeats = 14,
                        BookedSeats = 5,
                        Status = ScheduleStatus.Guaranteed
                    },
                    new()
                    {
                        StartDate = Utc("2026-11-13T06:30:00Z"),
                        EndDate = Utc("2026-11-15T21:00:00Z"),
                        PricePerPerson = 7200.00m,
                        TotalSeats = 14,
                        BookedSeats = 4,
                        Status = ScheduleStatus.Guaranteed
                    },
                ],
                Reviews = [
                    new()
                    {
                        ReviewerName = "Prof. Abul Kalam",
                        ReviewerLocation = "Dhaka",
                        ReviewerEmail = "prof. abul kalam@gmail.com",
                        Rating = 5,
                        Title = "Remarkable architectural legacy",
                        Comment = "Paharpur is awe-inspiring. Standing before the monumental central shrine brings ancient Buddhist Bengal to life.",
                        TripDateFormatted = "November 2025",
                        IsVerifiedBooking = true
                    },
                ]
            },
            // 12. Birishiri: Turquoise Ceramic Hills & Shomeshwari River
            new()
            {
                Title = "Birishiri: Turquoise Ceramic Hills & Shomeshwari River",
                Slug = "birishiri-ceramic-hills-shomeshwari",
                Summary = "Discover the turquoise waters of China Clay Lake, cross the crystal Shomeshwari river on wooden country boats, and explore the Garo Hills.",
                Description = "An extraordinary scenic trip to Susang Durgapur in Netrokona. Admire the striking contrast between white ceramic clay hills and turquoise blue water, cross the sandy shallows of Shomeshwari river by hand-rowed boat, visit indigenous Garo and Hajong cultural villages, and view the Indian border hills.",
                Destination = "Birishiri & Susang Durgapur, Netrokona",
                Country = "Bangladesh",
                Region = "Mymensingh Division",
                StartCity = "Dhaka",
                EndCity = "Dhaka",
                IdealSeason = "October – March (Dry River Bed & Clear Water)",
                DurationDays = 2,
                DurationNights = 1,
                BasePrice = 5800.00m,
                DiscountPrice = 4900.00m,
                DepositAmount = 1500.00m,
                MaxGroupSize = 12,
                Difficulty = DifficultyLevel.Easy,
                Category = TourCategory.EcoTour,
                CoverImageUrl = "https://images.unsplash.com/photo-1518457607834-6e8d80c183c5?auto=format&fit=crop&w=1200&q=80",
                GalleryImages = [ "https://images.unsplash.com/photo-1518457607834-6e8d80c183c5?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80" ],
                Highlights = [ "Turquoise blue waters of China Clay Lake (Ceramic Hills)", "Crossing crystal-clear Shomeshwari river on wooden country boats", "Stroll through Garo and Hajong tribal cultural villages", "Visit historic Rani Rashmoni memorial monument", "Garo hill borders and orange orchards of Susang Durgapur" ],
                Inclusions = [ "1 Night stay in clean eco guesthouse / YMCA in Birishiri", "Round-trip reserved transport from Dhaka via Mymensingh", "Local river boat crossings and auto rickshaw rides", "All meals: 2 breakfasts, 2 lunches, 1 dinner" ],
                Exclusions = [ "Personal bike hire", "Tips for boatmen" ],
                PackingTips = [ "Comfortable sandals for crossing river sand", "Light warm wear for night breezes" ],
                IsActive = true,
                IsFeatured = true,
                ItineraryDays = [
                    new()
                    {
                        DayNumber = 1,
                        Title = "Dhaka to Birishiri & Shomeshwari River Crossing",
                        Description = "Early morning drive from Dhaka via Mymensingh. Arrive in Susang Durgapur. Cross transparent Shomeshwari river by boat. Visit magnificent Ceramic Hills and turquoise lake.",
                        Accommodation = "YMCA Guesthouse / Swarna Eco Lodge",
                        MealsIncluded = "Breakfast, Lunch, Local Dinner",
                        Location = "Ceramic Hills",
                        ActivityMetrics = "Drive 5 hrs • Scenic walk"
                    },
                    new()
                    {
                        DayNumber = 2,
                        Title = "Rani Rashmoni Monument & Garo Cultural Heritage",
                        Description = "Visit historic Rani Rashmoni memorial and cultural academy. Stroll through indigenous Garo village before starting return drive to Dhaka.",
                        Accommodation = "Home",
                        MealsIncluded = "Breakfast, Lunch",
                        Location = "Durgapur to Dhaka",
                        ActivityMetrics = "Cultural walk • Drive"
                    },
                ],
                Schedules = [
                    new()
                    {
                        StartDate = Utc("2026-10-24T06:00:00Z"),
                        EndDate = Utc("2026-10-25T20:00:00Z"),
                        PricePerPerson = 4900.00m,
                        TotalSeats = 12,
                        BookedSeats = 6,
                        Status = ScheduleStatus.Guaranteed
                    },
                    new()
                    {
                        StartDate = Utc("2026-11-07T06:00:00Z"),
                        EndDate = Utc("2026-11-08T20:00:00Z"),
                        PricePerPerson = 4900.00m,
                        TotalSeats = 12,
                        BookedSeats = 4,
                        Status = ScheduleStatus.Guaranteed
                    },
                ],
                Reviews = [
                    new()
                    {
                        ReviewerName = "Arifur Rahman",
                        ReviewerLocation = "Dhaka",
                        ReviewerEmail = "arifur rahman@gmail.com",
                        Rating = 5,
                        Title = "The clay lake color is surreal",
                        Comment = "The blue water against the white ceramic hills looks like something outside of Bangladesh. Peaceful and scenic.",
                        TripDateFormatted = "January 2026",
                        IsVerifiedBooking = true
                    },
                ]
            },
            // 13. Sonargaon & Panam City: Ancient Bengal Capital Day Escape
            new()
            {
                Title = "Sonargaon & Panam City: Ancient Bengal Capital Day Escape",
                Slug = "sonargaon-panam-city-heritage-day-tour",
                Summary = "Step into the 19th-century ghost town of Panam City, explore the Folk Art Museum, and cruise the gentle Meghna river.",
                Description = "A tranquil day tour just an hour from Dhaka into the historical medieval capital of Bengal. Walk down the preserved avenue of 52 heritage merchant mansions at Panam Nagar, visit the Folk Art and Craft Museum established by Shilpacharya Zainul Abedin at Sardar Bari palace, and cruise the peaceful waters of Meghna river.",
                Destination = "Sonargaon, Narayanganj",
                Country = "Bangladesh",
                Region = "Dhaka Division",
                StartCity = "Dhaka",
                EndCity = "Dhaka",
                IdealSeason = "All Year",
                DurationDays = 1,
                DurationNights = 0,
                BasePrice = 3200.00m,
                DiscountPrice = 2700.00m,
                DepositAmount = 1000.00m,
                MaxGroupSize = 16,
                Difficulty = DifficultyLevel.Easy,
                Category = TourCategory.Cultural,
                CoverImageUrl = "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80",
                GalleryImages = [ "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80" ],
                Highlights = [ "Guided walking tour of Panam City (Panam Nagar) heritage mansions", "Folk Art & Craft Museum and Zainul Abedin gallery at Sardar Bari", "Traditional Jamdani saree weaving demonstration in village workshop", "Relaxing river boat cruise on the Meghna river", "Authentic Bengali lunch featuring local Hilsha fish and bhortas" ],
                Inclusions = [ "Round-trip AC microbus transport from Dhaka", "All entrance fees and guided tour services", "Traditional Bengali lunch and morning/evening refreshments", "Meghna river boat cruise" ],
                Exclusions = [ "Personal Jamdani saree shopping" ],
                PackingTips = [ "Walking shoes", "Camera", "Sun umbrella" ],
                IsActive = true,
                IsFeatured = true,
                ItineraryDays = [
                    new()
                    {
                        DayNumber = 1,
                        Title = "Panam City Mansions, Folk Art Museum & Meghna Boat Cruise",
                        Description = "Depart Dhaka at 8:00 AM. Arrive Sonargaon. Tour historic Panam Nagar street. Visit Zainul Abedin Folk Art Museum. Traditional lunch. Afternoon Jamdani village visit and Meghna cruise. Return to Dhaka by 6:00 PM.",
                        Accommodation = "Home",
                        MealsIncluded = "Morning Snacks, Authentic Bengali Lunch",
                        Location = "Sonargaon",
                        ActivityMetrics = "Drive 1 hr • Walking tour"
                    },
                ],
                Schedules = [
                    new()
                    {
                        StartDate = Utc("2026-10-17T08:00:00Z"),
                        EndDate = Utc("2026-10-17T18:00:00Z"),
                        PricePerPerson = 2700.00m,
                        TotalSeats = 16,
                        BookedSeats = 10,
                        Status = ScheduleStatus.Guaranteed
                    },
                    new()
                    {
                        StartDate = Utc("2026-10-24T08:00:00Z"),
                        EndDate = Utc("2026-10-24T18:00:00Z"),
                        PricePerPerson = 2700.00m,
                        TotalSeats = 16,
                        BookedSeats = 8,
                        Status = ScheduleStatus.Guaranteed
                    },
                ],
                Reviews = [
                    new()
                    {
                        ReviewerName = "Rubina Akhtar",
                        ReviewerLocation = "Dhaka",
                        ReviewerEmail = "rubina akhtar@gmail.com",
                        Rating = 5,
                        Title = "Great weekend day trip",
                        Comment = "Panam Nagar is full of architectural history. Excellent guide and delicious traditional lunch.",
                        TripDateFormatted = "February 2026",
                        IsVerifiedBooking = true
                    },
                ]
            },
            // 14. Keokradong & Nafakhum: The Ultimate Hill Tracts Wilderness Trek
            new()
            {
                Title = "Keokradong & Nafakhum: The Ultimate Hill Tracts Wilderness Trek",
                Slug = "keokradong-nafakhum-wilderness-trek",
                Summary = "Hike to the summit of Keokradong, swim beneath roaring Nafakhum Waterfall, and camp in indigenous Remakri village.",
                Description = "For adventurous explorers seeking genuine untamed wilderness. Trek through pristine bamboo forests, cross bubbling mountain streams, sleep in authentic Marma and Bawm wooden stilt houses at Boga Lake and Remakri, and experience the mighty rush of Nafakhum, the 'Niagara of Bangladesh'.",
                Destination = "Ruma, Thanchi & Keokradong, Bandarban",
                Country = "Bangladesh",
                Region = "Chittagong Division",
                StartCity = "Dhaka / Bandarban",
                EndCity = "Dhaka",
                IdealSeason = "October – March (Trail Season)",
                DurationDays = 5,
                DurationNights = 4,
                BasePrice = 13500.00m,
                DiscountPrice = 11900.00m,
                DepositAmount = 3500.00m,
                MaxGroupSize = 10,
                Difficulty = DifficultyLevel.Challenging,
                Category = TourCategory.MountainTrekking,
                CoverImageUrl = "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
                GalleryImages = [ "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80" ],
                Highlights = [ "Stand on the peak of Keokradong (3,172 feet)", "Boat ride on turquoise Sangu river through towering stone canyons", "Trek to roaring Nafakhum Waterfall", "Stay in indigenous Bawm and Marma stilt huts at Boga Lake and Remakri", "Certified local tribal mountain guide & Tourist Police permit handling" ],
                Inclusions = [ "All 4x4 Chander Gari jeep transfers and engine boat rides on Sangu River", "4 Nights accommodation in indigenous village cottages", "All meals cooked with fresh mountain ingredients", "Certified tribal trekking guide and security checkpost permits", "Round-trip AC coach from Dhaka to Bandarban" ],
                Exclusions = [ "Personal trekking backpack and gear", "Trekking poles" ],
                PackingTips = [ "Trekking boots with deep lugs", "Dry bags", "Personal first aid kit", "Photocopies of NID (6 copies)" ],
                IsActive = true,
                IsFeatured = true,
                ItineraryDays = [
                    new()
                    {
                        DayNumber = 1,
                        Title = "Bandarban to Ruma & Boga Lake",
                        Description = "Arrive Bandarban. 4x4 Chander Gari to Ruma. Clear army checkpost. Proceed to Boga Lake crater. Sunset over lake.",
                        Accommodation = "Boga Lake Cottage",
                        MealsIncluded = "Breakfast, Lunch, Dinner",
                        Location = "Boga Lake",
                        ActivityMetrics = "Jeep 4 hrs"
                    },
                    new()
                    {
                        DayNumber = 2,
                        Title = "Trek to Keokradong Peak",
                        Description = "Morning 4-hour trek through bamboo forests to Keokradong summit. Panoramic views of Myanmar border peaks. Overnight at peak cottage.",
                        Accommodation = "Keokradong Summit Hut",
                        MealsIncluded = "Breakfast, Lunch, Dinner",
                        Location = "Keokradong",
                        ActivityMetrics = "Trek 4.5 hrs"
                    },
                    new()
                    {
                        DayNumber = 3,
                        Title = "Descent to Thanchi & Sangu River Boat to Remakri",
                        Description = "Descend to Thanchi. Board wooden boat on Sangu river past towering stone canyons to Remakri.",
                        Accommodation = "Remakri Tribal Cottage",
                        MealsIncluded = "Breakfast, Lunch, Dinner",
                        Location = "Remakri",
                        ActivityMetrics = "Boat 2.5 hrs • Trek"
                    },
                    new()
                    {
                        DayNumber = 4,
                        Title = "Nafakhum Waterfall Expedition",
                        Description = "Trek along the riverbank to roaring Nafakhum waterfall. Swim in crystal pools. Afternoon return boat to Thanchi.",
                        Accommodation = "Thanchi Eco Lodge",
                        MealsIncluded = "Breakfast, Lunch, Dinner",
                        Location = "Nafakhum",
                        ActivityMetrics = "Trek 3 hrs • Boat"
                    },
                    new()
                    {
                        DayNumber = 5,
                        Title = "Bandarban Return & Night Coach to Dhaka",
                        Description = "Scenic jeep drive back to Bandarban town. Evening dinner and return AC coach to Dhaka.",
                        Accommodation = "Home",
                        MealsIncluded = "Breakfast, Lunch, Dinner",
                        Location = "Bandarban to Dhaka",
                        ActivityMetrics = "Highway coach"
                    },
                ],
                Schedules = [
                    new()
                    {
                        StartDate = Utc("2026-11-04T06:00:00Z"),
                        EndDate = Utc("2026-11-08T22:00:00Z"),
                        PricePerPerson = 11900.00m,
                        TotalSeats = 10,
                        BookedSeats = 5,
                        Status = ScheduleStatus.Guaranteed
                    },
                    new()
                    {
                        StartDate = Utc("2026-11-18T06:00:00Z"),
                        EndDate = Utc("2026-11-22T22:00:00Z"),
                        PricePerPerson = 11900.00m,
                        TotalSeats = 10,
                        BookedSeats = 8,
                        Status = ScheduleStatus.Guaranteed
                    },
                ],
                Reviews = [
                    new()
                    {
                        ReviewerName = "Tanvir Ahmed",
                        ReviewerLocation = "Dhaka",
                        ReviewerEmail = "tanvir ahmed@gmail.com",
                        Rating = 5,
                        Title = "Life-changing expedition",
                        Comment = "Sangu river canyon and Nafakhum waterfall are the greatest natural spectacles in Bangladesh. Our guide kept us safe at every step.",
                        TripDateFormatted = "January 2026",
                        IsVerifiedBooking = true
                    },
                ]
            },
            // 15. Kantajew Temple & Ramsagar: Northern Terracotta Heritage
            new()
            {
                Title = "Kantajew Temple & Ramsagar: Northern Terracotta Heritage",
                Slug = "kantajew-temple-ramsagar-dinajpur",
                Summary = "Admire the 18th-century terracotta masterpiece of Kantajew Temple, the vast manmade waters of Ramsagar, and northern mango orchards.",
                Description = "Explore the architectural jewel of Northern Bangladesh in Dinajpur. Kantajew Temple is globally celebrated for its thousands of intricate terracotta relief tiles depicting scenes from ancient epics, complemented by the tranquil man-made waters of Ramsagar Lake and historic Nayabad Mosque.",
                Destination = "Kantajew, Dinajpur",
                Country = "Bangladesh",
                Region = "Rangpur Division",
                StartCity = "Dhaka",
                EndCity = "Dhaka",
                IdealSeason = "October – March",
                DurationDays = 2,
                DurationNights = 2,
                BasePrice = 6500.00m,
                DiscountPrice = 5600.00m,
                DepositAmount = 1500.00m,
                MaxGroupSize = 14,
                Difficulty = DifficultyLevel.Easy,
                Category = TourCategory.Cultural,
                CoverImageUrl = "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80",
                GalleryImages = [ "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80" ],
                Highlights = [ "World-famous Kantanagar (Kantajew) Temple with thousands of terracotta relief tiles", "Ramsagar National Park and historic manmade lake", "Nayabad Mosque built by the artisans of Kantajew Temple (1793)", "Traditional northern Katari Bhog aromatic rice and curd cuisine" ],
                Inclusions = [ "Round-trip AC train tickets (Ekota Express) or AC bus", "1 Night hotel accommodation in Dinajpur", "Reserved microbus for temple and lake excursions", "All meals and certified heritage guide fees" ],
                Exclusions = [ "Personal souvenirs" ],
                PackingTips = [ "Camera with good macro lens for terracotta detail", "Sun hat" ],
                IsActive = true,
                IsFeatured = true,
                ItineraryDays = [
                    new()
                    {
                        DayNumber = 1,
                        Title = "Ekota Express Train & Kantajew Terracotta Marvel",
                        Description = "Board morning Ekota Express train from Dhaka to Dinajpur. Check in. Afternoon in-depth tour of Kantajew Temple and nearby Nayabad Mosque. Sunset by Dhepa river.",
                        Accommodation = "Hotel Diamond / Tourism Motel",
                        MealsIncluded = "Breakfast, Lunch, Dinner",
                        Location = "Kantanagar",
                        ActivityMetrics = "Train 6.5 hrs • Heritage walk"
                    },
                    new()
                    {
                        DayNumber = 2,
                        Title = "Ramsagar Lake Sanctuary & Return Journey",
                        Description = "Morning visit to Ramsagar Lake surrounded by eucalyptus forest. Enjoy lunch featuring Katari Bhog rice. Evening return train to Dhaka.",
                        Accommodation = "Home",
                        MealsIncluded = "Breakfast, Lunch",
                        Location = "Ramsagar to Dhaka",
                        ActivityMetrics = "Park walk • Train"
                    },
                ],
                Schedules = [
                    new()
                    {
                        StartDate = Utc("2026-10-23T07:00:00Z"),
                        EndDate = Utc("2026-10-24T22:00:00Z"),
                        PricePerPerson = 5600.00m,
                        TotalSeats = 14,
                        BookedSeats = 6,
                        Status = ScheduleStatus.Guaranteed
                    },
                    new()
                    {
                        StartDate = Utc("2026-11-13T07:00:00Z"),
                        EndDate = Utc("2026-11-14T22:00:00Z"),
                        PricePerPerson = 5600.00m,
                        TotalSeats = 14,
                        BookedSeats = 4,
                        Status = ScheduleStatus.Guaranteed
                    },
                ],
                Reviews = [
                    new()
                    {
                        ReviewerName = "Murtaza Ali",
                        ReviewerLocation = "Dhaka",
                        ReviewerEmail = "murtaza ali@gmail.com",
                        Rating = 5,
                        Title = "Terracotta details are stunning",
                        Comment = "Every square inch of Kantajew Temple tells a story. One of the finest artistic treasures of South Asia.",
                        TripDateFormatted = "November 2025",
                        IsVerifiedBooking = true
                    },
                ]
            },
            // 16. Kaptai Lake & Rangamati: Emerald Waterways & Indigenous Culture
            new()
            {
                Title = "Kaptai Lake & Rangamati: Emerald Waterways & Indigenous Culture",
                Slug = "kaptai-lake-rangamati-emerald-waters",
                Summary = "Cruise the sprawling green waters of Kaptai Lake, visit Shuvolong Waterfalls, and explore Chakma Rajbari cultural heritage.",
                Description = "A restorative lake journey across the largest man-made lake in South Asia. Sail through emerald waters flanked by rolling green hills, visit the cascading streams of Shuvolong Waterfalls, meet local weavers in Chakma tribal villages, and stay in serene island eco-cottages.",
                Destination = "Kaptai Lake, Rangamati",
                Country = "Bangladesh",
                Region = "Chittagong Division",
                StartCity = "Dhaka / Chittagong",
                EndCity = "Dhaka",
                IdealSeason = "September – March",
                DurationDays = 3,
                DurationNights = 2,
                BasePrice = 7800.00m,
                DiscountPrice = 6900.00m,
                DepositAmount = 2000.00m,
                MaxGroupSize = 14,
                Difficulty = DifficultyLevel.Easy,
                Category = TourCategory.EcoTour,
                CoverImageUrl = "https://images.unsplash.com/photo-1518457607834-6e8d80c183c5?auto=format&fit=crop&w=1200&q=80",
                GalleryImages = [ "https://images.unsplash.com/photo-1518457607834-6e8d80c183c5?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?auto=format&fit=crop&w=1200&q=80" ],
                Highlights = [ "Private boat cruise across emerald Kaptai Lake to Shuvolong Waterfall", "Hanging Bridge of Rangamati and scenic island parks", "Chakma Rajbari, Rajban Vihar, and indigenous handicraft bazaar", "Stay in serene island eco resort surrounded by 360-degree lake water", "Authentic tribal lunch cooked inside fresh bamboo stalks (Hebaang)" ],
                Inclusions = [ "2 Nights stay in lake-view resort / island cottage", "Round-trip AC coach from Dhaka to Rangamati", "Full-day private motorized boat charter on Kaptai Lake", "All meals: 3 breakfasts, 3 lunches, 2 dinners" ],
                Exclusions = [ "Personal handicraft shopping" ],
                PackingTips = [ "Light sandals", "Swimwear if you wish to swim with lifejacket", "Camera" ],
                IsActive = true,
                IsFeatured = true,
                ItineraryDays = [
                    new()
                    {
                        DayNumber = 1,
                        Title = "Rangamati Arrival & Hanging Bridge Sunset",
                        Description = "Arrive in Rangamati morning. Check-in to lakefront cottage. Stroll across the iconic Hanging Bridge. Sunset boat ride.",
                        Accommodation = "Polwel Park Eco Resort",
                        MealsIncluded = "Breakfast, Lunch, Dinner",
                        Location = "Rangamati",
                        ActivityMetrics = "Lake cruise 2 hrs"
                    },
                    new()
                    {
                        DayNumber = 2,
                        Title = "Kaptai Lake Cruise & Shuvolong Waterfall",
                        Description = "Full-day boat cruise across expansive Kaptai Lake. Visit Shuvolong Waterfall and remote island tribal cafes serving fresh Chapila fish.",
                        Accommodation = "Polwel Park Eco Resort",
                        MealsIncluded = "Breakfast, Bamboo Hebaang Lunch, Dinner",
                        Location = "Kaptai Lake",
                        ActivityMetrics = "Boat cruise 5 hrs"
                    },
                    new()
                    {
                        DayNumber = 3,
                        Title = "Rajban Vihar & Return Coach to Dhaka",
                        Description = "Morning visit to peaceful Rajban Vihar Buddhist monastery. Explore indigenous textile market. Board return AC coach to Dhaka.",
                        Accommodation = "Home",
                        MealsIncluded = "Breakfast, Lunch",
                        Location = "Rangamati to Dhaka",
                        ActivityMetrics = "Highway coach"
                    },
                ],
                Schedules = [
                    new()
                    {
                        StartDate = Utc("2026-10-18T06:00:00Z"),
                        EndDate = Utc("2026-10-20T21:00:00Z"),
                        PricePerPerson = 6900.00m,
                        TotalSeats = 14,
                        BookedSeats = 7,
                        Status = ScheduleStatus.Guaranteed
                    },
                    new()
                    {
                        StartDate = Utc("2026-11-01T06:00:00Z"),
                        EndDate = Utc("2026-11-03T21:00:00Z"),
                        PricePerPerson = 6900.00m,
                        TotalSeats = 14,
                        BookedSeats = 4,
                        Status = ScheduleStatus.Guaranteed
                    },
                ],
                Reviews = [
                    new()
                    {
                        ReviewerName = "Shakil Chowdhury",
                        ReviewerLocation = "Chittagong",
                        ReviewerEmail = "shakil chowdhury@gmail.com",
                        Rating = 5,
                        Title = "Kaptai lake breeze is therapeutic",
                        Comment = "Sitting on the boat with gentle wind and green mountains on all sides was deeply relaxing. Highly recommended.",
                        TripDateFormatted = "November 2025",
                        IsVerifiedBooking = true
                    },
                ]
            },
        };

        context.TourPackages.AddRange(bangladeshTours);
        await context.SaveChangesAsync();
        }

        // Seed Users if not present
        if (!await context.Users.AnyAsync())
        {
            var adminUser = new User
            {
                Id = Guid.NewGuid(),
                FullName = "Tahmina Akter",
                Email = "admin@tourflow.com.bd",
                PasswordHash = HashPassword("Admin@123456"),
                Role = "Admin",
                PhoneNumber = "+880 1320-222222",
                HomeCity = "Dhaka",
                NidOrPassport = "19902692810001111",
                Bio = "Senior Operations Coordinator & Guide Supervisor for Domestic Expeditions.",
                IsVerified = true,
                CreatedAt = DateTime.UtcNow
            };

            var travelerUser = new User
            {
                Id = Guid.NewGuid(),
                FullName = "Tanvir Ahmed",
                Email = "tanvir@tourflow.com.bd",
                PasswordHash = HashPassword("Tanvir@123456"),
                Role = "User",
                PhoneNumber = "+880 1711-234567",
                HomeCity = "Dhaka",
                NidOrPassport = "19952692810003412",
                Bio = "Explorer of hill tracts and haors across Bangladesh. Dedicated to clean ecotourism.",
                IsVerified = true,
                CreatedAt = DateTime.UtcNow
            };

            context.Users.AddRange(adminUser, travelerUser);
            await context.SaveChangesAsync();
        }

        // Seed 15+ Detailed Bangladesh Community Blog Posts with Comments (only if empty)
        if (!await context.BlogPosts.AnyAsync())
        {
            var seededPosts = new List<BlogPost>
        {
            new()
            {
                Id = Guid.NewGuid(),
                Title = "Monsoon Serenity in Tanguar Haor: Sleeping under the Stars on a Wooden Houseboat",
                Slug = "monsoon-serenity-tanguar-haor-houseboat",
                Category = "Hidden Gems",
                Division = "Sylhet",
                AuthorName = "Tanvir Ahmed",
                AuthorEmail = "tanvir@tourflow.com.bd",
                CoverImageUrl = "https://images.unsplash.com/photo-1518457607834-6e8d80c183c5?auto=format&fit=crop&w=1200&q=80",
                Summary = "Gliding past Niladri Lake, Shimul Bagan, and the calm turquoise wetland waters of Sunamganj on an eco-friendly wooden boat.",
                Content = @"Tanguar Haor in Sunamganj is unlike anywhere else on earth during monsoon. The entire landscape transforms into an inland freshwater ocean flanked by the misty blue Meghalaya hills across the border.

### The Houseboat Journey
We boarded our traditional wooden boat from Tahirpur Ghat early in the morning. As the boat gently moved into the open haor, the noise of traffic vanished completely, replaced by the rhythm of splashing water and gentle river breezes.

### Highlights & Practical Tips:
1. **Niladri Lake (Shahid Siraj Lake)**: The limestone quarry lake with emerald green water against towering hills. Rent a tiny wooden dinghy for quiet photos.
2. **Shimul Bagan**: A massive grove of silk cotton trees near Jadukata river. In spring it blooms fiery red; in monsoon it is lush emerald green.
3. **Food on the Boat**: Freshly caught haor fish (Boal, Rupchanda), hot steamed rice, and village duck curry cooked right on the boat deck.
4. **Eco-Etiquette**: Please carry your own garbage bag and never throw plastic into the haor waters.",
                Upvotes = 42,
                Views = 650,
                IsPinned = true,
                CreatedAtUtc = DateTime.UtcNow.AddDays(-7),
                Comments = new List<BlogComment>
                {
                    new()
                    {
                        Id = Guid.NewGuid(),
                        AuthorName = "Nusrat Jahan",
                        AuthorEmail = "nusrat@gmail.com",
                        Content = "Such a peaceful read! How many days would you recommend for a family with kids?",
                        CreatedAtUtc = DateTime.UtcNow.AddDays(-1)
                    },
                    new()
                    {
                        Id = Guid.NewGuid(),
                        AuthorName = "Tanvir Ahmed",
                        AuthorEmail = "tanvir@tourflow.com.bd",
                        Content = "2 days and 1 night on the boat is ideal! Just make sure to bring life jackets for the children.",
                        CreatedAtUtc = DateTime.UtcNow.AddDays(-1)
                    },
                    new()
                    {
                        Id = Guid.NewGuid(),
                        AuthorName = "Rakibul Hasan",
                        AuthorEmail = "rakib@yahoo.com",
                        Content = "Is Teletalk network available on the water?",
                        CreatedAtUtc = DateTime.UtcNow.AddDays(-1)
                    },
                    new()
                    {
                        Id = Guid.NewGuid(),
                        AuthorName = "Tanvir Ahmed",
                        AuthorEmail = "tanvir@tourflow.com.bd",
                        Content = "Yes! Teletalk and Robi have decent signal in most parts of the haor.",
                        CreatedAtUtc = DateTime.UtcNow.AddDays(-1)
                    },
                }
            },
            new()
            {
                Id = Guid.NewGuid(),
                Title = "First-Timer’s Guide to Sajek Valley: Army Escort, Mountain Jeeps & Cloud Watching",
                Slug = "first-timers-guide-sajek-valley-clouds",
                Category = "Travel Guide",
                Division = "Chattogram",
                AuthorName = "Nusrat Jahan",
                AuthorEmail = "nusrat.jahan@gmail.com",
                CoverImageUrl = "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
                Summary = "Everything you need to know about Dighinala Army Escort schedules, choosing the right balcony cottage, and sunrise at Konglak Para.",
                Content = @"Standing at 1,800 feet above sea level, Sajek Valley in Rangamati is known as the 'Kingdom of Clouds'. Here is how to plan your trip smoothly without unnecessary hassle.

### 1. Escort Timings are Strict
Entry into Sajek is monitored by the Bangladesh Army for passenger safety. Jeeps depart from Dighinala at 10:00 AM and 3:00 PM. Arrive at least 45 minutes early at Dighinala to buy entry tickets and arrange your Chander Gari.

### 2. Best Cloud Vantage Points
- **Helipad 1 & 2**: Perfect 360-degree sunset and sunrise panoramic views.
- **Konglak Para**: The highest settled point inhabited by Lusai people. A 20-minute hike from Ruilui Para rewarded with floating clouds at your feet.

### 3. Food You Must Try
Order authentic bamboo chicken (Bash Khora Murgi) from local tribal cafes in Ruilui bazaar. It takes about an hour to slow-roast inside fresh green bamboo stalks over wood embers, but the smoky aroma is unmatched.",
                Upvotes = 56,
                Views = 820,
                IsPinned = true,
                CreatedAtUtc = DateTime.UtcNow.AddDays(-1),
                Comments = new List<BlogComment>
                {
                    new()
                    {
                        Id = Guid.NewGuid(),
                        AuthorName = "Fahim Reza",
                        AuthorEmail = "fahim@gmail.com",
                        Content = "Bamboo chicken at Megh Machang was unbelievable when we went last November!",
                        CreatedAtUtc = DateTime.UtcNow.AddDays(-1)
                    },
                }
            },
            new()
            {
                Id = Guid.NewGuid(),
                Title = "Cycling through the Tea Gardens of Sreemangal at Dawn",
                Slug = "cycling-through-tea-gardens-sreemangal",
                Category = "Photography",
                Division = "Sylhet",
                AuthorName = "Rafiqul Islam",
                AuthorEmail = "rafiqul.photo@gmail.com",
                CoverImageUrl = "https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?auto=format&fit=crop&w=1200&q=80",
                Summary = "Crisp morning fog clinging to tea bushes, whistling hollock gibbons in Lawachara, and 7-layer tea at Nilkantha Cabin.",
                Content = @"Sreemangal is the tea capital of Bangladesh, and the best way to experience its gentle sloping green hills is on a humble bicycle rented from town.

We set off at 5:45 AM toward the Finlay Tea Estate. The morning air was delightfully cool with thick fog drifting between tea bushes. We spotted golden orioles and kingfishers alongside silent streams. If you seek calm and restorative quiet, Sreemangal is pure heaven.",
                Upvotes = 38,
                Views = 490,
                IsPinned = false,
                CreatedAtUtc = DateTime.UtcNow.AddDays(-9),
                Comments = new List<BlogComment>
                {
                    new()
                    {
                        Id = Guid.NewGuid(),
                        AuthorName = "Zahid Hasan",
                        AuthorEmail = "zahid@gmail.com",
                        Content = "Where did you rent the bicycle from?",
                        CreatedAtUtc = DateTime.UtcNow.AddDays(-1)
                    },
                    new()
                    {
                        Id = Guid.NewGuid(),
                        AuthorName = "Rafiqul Islam",
                        AuthorEmail = "rafiqul.photo@gmail.com",
                        Content = "From College Road in Sreemangal town, for about BDT 150 per day.",
                        CreatedAtUtc = DateTime.UtcNow.AddDays(-1)
                    },
                }
            },
            new()
            {
                Id = Guid.NewGuid(),
                Title = "Silent Waters of the Sundarbans: A 3-Day Journey into Kotka & Kochikhali",
                Slug = "silent-waters-sundarbans-mangrove-odyssey",
                Category = "Nature & Wildlife",
                Division = "Khulna",
                AuthorName = "Kazi Asif",
                AuthorEmail = "asif.wildlife@gmail.com",
                CoverImageUrl = "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1200&q=80",
                Summary = "Navigating narrow tidal canals on silent wooden country boats, spotting spotted deer and kingfishers deep in the mangrove forest.",
                Content = @"The silence of the Sundarbans in early winter is profound. We anchored our small eco-vessel near Kotka canal. At dawn, we transferred to a tiny hand-rowed dinghy. With no engine sound, we glided past spotted deer grazing on breathing pneumatophore roots and saw fresh paw prints on the muddy bank. A deeply humbling sanctuary.",
                Upvotes = 64,
                Views = 910,
                IsPinned = false,
                CreatedAtUtc = DateTime.UtcNow.AddDays(-1),
                Comments = new List<BlogComment>
                {
                    new()
                    {
                        Id = Guid.NewGuid(),
                        AuthorName = "Imran Khan",
                        AuthorEmail = "imran@gmail.com",
                        Content = "Did you spot any crocodiles near the mudflats?",
                        CreatedAtUtc = DateTime.UtcNow.AddDays(-1)
                    },
                    new()
                    {
                        Id = Guid.NewGuid(),
                        AuthorName = "Kazi Asif",
                        AuthorEmail = "asif.wildlife@gmail.com",
                        Content = "Yes, two large saltwater crocodiles basking near the bank at Harbaria!",
                        CreatedAtUtc = DateTime.UtcNow.AddDays(-1)
                    },
                }
            },
            new()
            {
                Id = Guid.NewGuid(),
                Title = "Marine Drive Road Trip: Exploring Inani’s Coral Coast Beyond the Crowds",
                Slug = "marine-drive-road-trip-inani-coral",
                Category = "Travel Guide",
                Division = "Chattogram",
                AuthorName = "Tahmid Hasan",
                AuthorEmail = "tahmid.hasan@yahoo.com",
                CoverImageUrl = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
                Summary = "Renting open-air TomToms along the world-renowned Marine Drive, watching sunset over coral boulders at Inani.",
                Content = @"Most people visit Cox's Bazar and stay at crowded Kolatoli beach. The real beauty begins 20 kilometers south down Marine Drive. The road winds between steep green hills and crashing sea waves. At Inani, the beach is strewn with ancient living corals and tidal rock pools. A haven for peaceful strolls.",
                Upvotes = 49,
                Views = 730,
                IsPinned = false,
                CreatedAtUtc = DateTime.UtcNow.AddDays(-8),
                Comments = new List<BlogComment>
                {
                }
            },
            new()
            {
                Id = Guid.NewGuid(),
                Title = "Bhimruli Backwater Diary: A Morning at the Floating Guava Market",
                Slug = "bhimruli-backwater-floating-guava-market",
                Category = "Hidden Gems",
                Division = "Barishal",
                AuthorName = "Rumana Sharmin",
                AuthorEmail = "rumana@gmail.com",
                CoverImageUrl = "https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?auto=format&fit=crop&w=1200&q=80",
                Summary = "Paddling wooden canoes through the serene canals of Jhalakathi, observing local farmers trading sweet guavas directly from boats.",
                Content = @"Visiting Bhimruli during late monsoon is like entering a tranquil water world. The canal banks are lined with guava orchards, hog-plum groves, and betel nut trees. Farmers in lungis row their narrow dinghies laden with bamboo baskets full of green guavas. The air smells sweet and pure.",
                Upvotes = 35,
                Views = 520,
                IsPinned = false,
                CreatedAtUtc = DateTime.UtcNow.AddDays(-9),
                Comments = new List<BlogComment>
                {
                }
            },
            new()
            {
                Id = Guid.NewGuid(),
                Title = "Exploring Ancient Pundranagar: Walking the Ramparts of Mahasthangarh",
                Slug = "exploring-ancient-pundranagar-mahasthangarh",
                Category = "Cultural Heritage",
                Division = "Rajshahi",
                AuthorName = "Anisur Rahman",
                AuthorEmail = "anisur@gmail.com",
                CoverImageUrl = "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80",
                Summary = "Discovering 2,500 years of civilization at the historic brick citadel in Bogura and savoring world-famous Bogurar Doi.",
                Content = @"Mahasthangarh is the oldest urban archaeological site discovered in Bangladesh, dating back to at least the 3rd century BC. Walking along the Karatoya river ramparts evokes deep reverence for our ancient ancestors. Afterwards, do not miss tasting authentic clay-pot Bogurar Doi in town!",
                Upvotes = 31,
                Views = 410,
                IsPinned = false,
                CreatedAtUtc = DateTime.UtcNow.AddDays(-3),
                Comments = new List<BlogComment>
                {
                }
            },
            new()
            {
                Id = Guid.NewGuid(),
                Title = "Birishiri Ceramic Hills: Transparent Waters Beneath White Clay Clifftops",
                Slug = "birishiri-ceramic-hills-transparent-waters",
                Category = "Photography",
                Division = "Mymensingh",
                AuthorName = "Mehedi Hasan",
                AuthorEmail = "mehedi@gmail.com",
                CoverImageUrl = "https://images.unsplash.com/photo-1518457607834-6e8d80c183c5?auto=format&fit=crop&w=1200&q=80",
                Summary = "Crossing the shallow sandy bed of Shomeshwari river to reach the China Clay Lake in Susang Durgapur.",
                Content = @"Netrokona's Susang Durgapur is one of the most visually distinctive places in Bangladesh. The China Clay Lake has water so turquoise and clear that you can see white ceramic stone formations beneath the surface. Crossing the Shomeshwari river on a country boat in winter feels meditative and quiet.",
                Upvotes = 44,
                Views = 610,
                IsPinned = false,
                CreatedAtUtc = DateTime.UtcNow.AddDays(-6),
                Comments = new List<BlogComment>
                {
                }
            },
        };

        context.BlogPosts.AddRange(seededPosts);
        await context.SaveChangesAsync();
        }

        // Seed Hotels if table is empty
        if (!await context.Hotels.IgnoreQueryFilters().AnyAsync())
        {
            var assembly = typeof(DbInitializer).Assembly;
            using var stream = assembly.GetManifestResourceStream("TourFlow.Infrastructure.Data.hotels_seed.json");
            if (stream != null)
            {
                using var reader = new StreamReader(stream);
                var json = await reader.ReadToEndAsync();
                var options = new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var rawHotels = System.Text.Json.JsonSerializer.Deserialize<List<RawHotelSeed>>(json, options);
                if (rawHotels != null)
                {
                    var hotels = rawHotels.Select(h => new Hotel
                    {
                        Id = Guid.NewGuid(),
                        Slug = h.id,
                        Name = h.name,
                        Location = h.location,
                        Place = h.place,
                        Tier = h.tier,
                        Rating = h.rating,
                        ReviewsCount = h.reviewsCount,
                        PriceNumeric = h.priceNumeric,
                        PricePerNight = h.pricePerNight,
                        CoverImage = h.coverImage,
                        GalleryImages = h.galleryImages ?? [],
                        Description = h.description,
                        Pros = h.pros ?? [],
                        Cons = h.cons ?? [],
                        Amenities = h.amenities ?? [],
                        RoomTypesJson = h.roomTypes.ValueKind != System.Text.Json.JsonValueKind.Undefined ? h.roomTypes.GetRawText() : "[]",
                        HowToReach = h.howToReach ?? "",
                        NearbyAttractionsJson = h.nearbyAttractions.ValueKind != System.Text.Json.JsonValueKind.Undefined ? h.nearbyAttractions.GetRawText() : "[]",
                        ReceptionPhone = h.receptionPhone ?? "",
                        ReceptionEmail = h.receptionEmail ?? "",
                        CheckInTime = h.checkInTime ?? "12:00 PM",
                        CheckOutTime = h.checkOutTime ?? "11:00 AM",
                        RelatedTourSlug = h.relatedTourSlug,
                        RelatedTourTitle = h.relatedTourTitle,
                        IsActive = true,
                        CreatedAtUtc = DateTime.UtcNow
                    }).ToList();

                    context.Hotels.AddRange(hotels);
                    await context.SaveChangesAsync();
                }
            }
        }

        // Seed TravelTips if table is empty
        if (!await context.TravelTips.IgnoreQueryFilters().AnyAsync())
        {
            var assembly = typeof(DbInitializer).Assembly;
            using var stream = assembly.GetManifestResourceStream("TourFlow.Infrastructure.Data.tips_seed.json");
            if (stream != null)
            {
                using var reader = new StreamReader(stream);
                var json = await reader.ReadToEndAsync();
                var options = new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var rawTips = System.Text.Json.JsonSerializer.Deserialize<List<RawTipSeed>>(json, options);
                if (rawTips != null)
                {
                    var tips = rawTips.Select(t => new TravelTip
                    {
                        Id = Guid.NewGuid(),
                        Slug = t.id,
                        Category = t.category,
                        Title = t.title,
                        BadgeColor = t.badgeColor,
                        ReadingTime = t.readingTime,
                        Division = t.division,
                        CoverImage = t.coverImage,
                        Summary = t.summary,
                        KeyHighlights = t.keyHighlights ?? [],
                        Overview = t.overview,
                        CheckpostProceduresJson = t.checkpostProcedures.ValueKind != System.Text.Json.JsonValueKind.Undefined ? t.checkpostProcedures.GetRawText() : null,
                        TransportationJson = t.transportation.ValueKind != System.Text.Json.JsonValueKind.Undefined ? t.transportation.GetRawText() : null,
                        FieldScheduleJson = t.fieldSchedule.ValueKind != System.Text.Json.JsonValueKind.Undefined ? t.fieldSchedule.GetRawText() : null,
                        PackingList = t.packingList ?? [],
                        SafetyDirectives = t.safetyDirectives ?? [],
                        CommunityEtiquette = t.communityEtiquette ?? [],
                        EmergencyContactsJson = t.emergencyContacts.ValueKind != System.Text.Json.JsonValueKind.Undefined ? t.emergencyContacts.GetRawText() : null,
                        RelatedTourSlug = t.relatedTourSlug,
                        RelatedTourTitle = t.relatedTourTitle,
                        RelatedHotelId = t.relatedHotelId,
                        RelatedHotelName = t.relatedHotelName,
                        IsActive = true,
                        CreatedAtUtc = DateTime.UtcNow
                    }).ToList();

                    context.TravelTips.AddRange(tips);
                    await context.SaveChangesAsync();
                }
            }
        }

        // Seed or update the 3 dedicated role accounts
        var accounts = new (string Email, string Password, string FullName, string Role, string Phone, string City, string Nid, string Bio)[]
        {
            ("super.admin@traveller.com", "Traveller@2026", "Md. Asaduzzaman", "SuperAdmin", "+880 1711-000001", "Dhaka", "19852692810009999", "Lead Platform Architect & System Administrator for Traveller's Bangladesh."),
            ("admin@traveller.com", "Admin@2026", "Farhan Ahmed", "Admin", "+880 1819-000002", "Chattogram", "19902692810008888", "Operations Director & Verified Tour Coordinator for Domestic Expeditions."),
            ("asad@gmail.com", "Asad@2026", "Asaduzzaman Sohan", "User", "+880 1912-345678", "Dhaka", "19982692810007777", "Passionate Bangladeshi traveler, photographer, and ecotourism advocate.")
        };

        foreach (var acc in accounts)
        {
            var existing = await context.Users.FirstOrDefaultAsync(u => u.Email == acc.Email);
            if (existing != null)
            {
                existing.FullName = acc.FullName;
                existing.PasswordHash = HashPassword(acc.Password);
                existing.Role = acc.Role;
                existing.PhoneNumber = acc.Phone;
                existing.HomeCity = acc.City;
                existing.NidOrPassport = acc.Nid;
                existing.Bio = acc.Bio;
                existing.IsVerified = true;
                existing.UpdatedAt = DateTime.UtcNow;
            }
            else
            {
                context.Users.Add(new User
                {
                    Id = Guid.NewGuid(),
                    FullName = acc.FullName,
                    Email = acc.Email,
                    PasswordHash = HashPassword(acc.Password),
                    Role = acc.Role,
                    PhoneNumber = acc.Phone,
                    HomeCity = acc.City,
                    NidOrPassport = acc.Nid,
                    Bio = acc.Bio,
                    IsVerified = true,
                    CreatedAt = DateTime.UtcNow
                });
            }
        }
        await context.SaveChangesAsync();
    }

    private static string HashPassword(string password)
    {
        byte[] salt = System.Security.Cryptography.RandomNumberGenerator.GetBytes(16);
        byte[] key = System.Security.Cryptography.Rfc2898DeriveBytes.Pbkdf2(
            password,
            salt,
            100_000,
            System.Security.Cryptography.HashAlgorithmName.SHA256,
            32);
        return $"100000.{Convert.ToBase64String(salt)}.{Convert.ToBase64String(key)}";
    }

    private class RawHotelSeed
    {
        public string id { get; set; } = "";
        public string name { get; set; } = "";
        public string location { get; set; } = "";
        public string place { get; set; } = "";
        public string tier { get; set; } = "";
        public double rating { get; set; }
        public int reviewsCount { get; set; }
        public decimal priceNumeric { get; set; }
        public string pricePerNight { get; set; } = "";
        public string coverImage { get; set; } = "";
        public List<string>? galleryImages { get; set; }
        public string description { get; set; } = "";
        public List<string>? pros { get; set; }
        public List<string>? cons { get; set; }
        public List<string>? amenities { get; set; }
        public System.Text.Json.JsonElement roomTypes { get; set; }
        public string? howToReach { get; set; }
        public System.Text.Json.JsonElement nearbyAttractions { get; set; }
        public string? receptionPhone { get; set; }
        public string? receptionEmail { get; set; }
        public string? checkInTime { get; set; }
        public string? checkOutTime { get; set; }
        public string? relatedTourSlug { get; set; }
        public string? relatedTourTitle { get; set; }
    }

    private class RawTipSeed
    {
        public string id { get; set; } = "";
        public string category { get; set; } = "";
        public string title { get; set; } = "";
        public string badgeColor { get; set; } = "";
        public string readingTime { get; set; } = "";
        public string division { get; set; } = "";
        public string coverImage { get; set; } = "";
        public string summary { get; set; } = "";
        public List<string>? keyHighlights { get; set; }
        public string overview { get; set; } = "";
        public System.Text.Json.JsonElement checkpostProcedures { get; set; }
        public System.Text.Json.JsonElement transportation { get; set; }
        public System.Text.Json.JsonElement fieldSchedule { get; set; }
        public List<string>? packingList { get; set; }
        public List<string>? safetyDirectives { get; set; }
        public List<string>? communityEtiquette { get; set; }
        public System.Text.Json.JsonElement emergencyContacts { get; set; }
        public string? relatedTourSlug { get; set; }
        public string? relatedTourTitle { get; set; }
        public string? relatedHotelId { get; set; }
        public string? relatedHotelName { get; set; }
    }
}
