using Microsoft.EntityFrameworkCore;
using TourFlow.Domain.Entities;
using TourFlow.Domain.Enums;

namespace TourFlow.Infrastructure.Data;

public static class DbInitializer
{
    public static async Task SeedAsync(TourFlowDbContext context)
    {
        // Re-seed with pure Bangladesh Tourism data
        context.Bookings.RemoveRange(context.Bookings);
        context.TourSchedules.RemoveRange(context.TourSchedules);
        context.ItineraryDays.RemoveRange(context.ItineraryDays);
        context.Reviews.RemoveRange(context.Reviews);
        context.TourPackages.RemoveRange(context.TourPackages);
        await context.SaveChangesAsync();

        var bangladeshTours = new List<TourPackage>
        {
            // 1. Sajek Valley
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
                CoverImageUrl = "https://images.unsplash.com/photo-1628085971946-b673e4492bf9?auto=format&fit=crop&w=1200&q=80",
                GalleryImages = [
                    "https://images.unsplash.com/photo-1628085971946-b673e4492bf9?auto=format&fit=crop&w=1200&q=80",
                    "https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?auto=format&fit=crop&w=1200&q=80"
                ],
                Highlights = [
                    "Sunrise & sunset viewpoints overlooking endless sea of clouds",
                    "Hike to Konglak Para (highest point of Sajek Valley)",
                    "Traditional Chander Gari jeep convoy from Dighinala Army Escort",
                    "Authentic bamboo-cooked chicken and hill forest herbs dinner",
                    "Stay in hill-facing wooden cottages with balcony views"
                ],
                Inclusions = [
                    "2 Nights accommodation in hill-view cottage (Ruilui Para)",
                    "Round-trip AC coach from Dhaka to Khagrachhari & reserved Chander Gari",
                    "All meals: 3 breakfasts, 3 lunches, 2 dinners (including bamboo chicken night)",
                    "Experienced local tour coordinator and army escort management",
                    "All entry fees and indigenous community contribution passes"
                ],
                Exclusions = [
                    "Personal shopping and extra snacks",
                    "Optional zip-lining or quad bike rides",
                    "Personal travel insurance"
                ],
                PackingTips = [
                    "Light warm jacket or shawl for cool mornings and nights",
                    "Comfortable sneakers or grip sandals for stone trails",
                    "Power bank (occasional load-shedding on hills)",
                    "National ID card or photocopy (mandatory for security checkpoints)"
                ],
                IsActive = true,
                IsFeatured = true,
                ItineraryDays = [
                    new()
                    {
                        DayNumber = 1,
                        Title = "Dhaka to Khagrachhari & Chander Gari Escort to Sajek",
                        Description = "Arrive in Khagrachhari early morning. Traditional paratha and egg breakfast. Board reserved open-hood 4x4 Chander Gari to join the morning Bangladesh Army security convoy through the scenic winding green hill passes. Check-in to hilltop cottage in Ruilui Para, followed by sunset from Helipad.",
                        Accommodation = "Megh Kabbo / Sajek Resort",
                        MealsIncluded = "Breakfast, Lunch, Bamboo Chicken Dinner",
                        Location = "Ruilui Para, Sajek",
                        ActivityMetrics = "Jeep ride 3.5 hrs • Leisure walk"
                    },
                    new()
                    {
                        DayNumber = 2,
                        Title = "Konglak Para Sunrise & Tribal Village Stroll",
                        Description = "Early wake-up at 5:30 AM to witness clouds floating directly into your balcony. Morning hike to Konglak Para, meet local indigenous Lusai families, and taste fresh mountain papayas. Afternoon visit to Stone Garden and evening musical gathering under starry skies.",
                        Accommodation = "Megh Kabbo / Sajek Resort",
                        MealsIncluded = "Breakfast, Lunch, Barbecue Dinner",
                        Location = "Konglak Para",
                        ActivityMetrics = "Gentle hill climb 1 hr • Cultural walk"
                    },
                    new()
                    {
                        DayNumber = 3,
                        Title = "Alutila Cave & Return Journey to Dhaka",
                        Description = "Depart Sajek with morning escort. Stop at Khagrachhari to explore mystical Alutila Cave with flaming bamboo torches and visit Risang Waterfall. Evening dinner and board return AC coach to Dhaka.",
                        Accommodation = "Overnight Coach to Dhaka",
                        MealsIncluded = "Breakfast, Lunch, Dinner",
                        Location = "Alutila & Khagrachhari",
                        ActivityMetrics = "Cave exploration • Return transit"
                    }
                ],
                Schedules = [
                    new()
                    {
                        StartDate = DateTime.UtcNow.AddDays(7),
                        EndDate = DateTime.UtcNow.AddDays(10),
                        PricePerPerson = 7500.00m,
                        TotalSeats = 12,
                        BookedSeats = 4,
                        Status = ScheduleStatus.Guaranteed
                    },
                    new()
                    {
                        StartDate = DateTime.UtcNow.AddDays(21),
                        EndDate = DateTime.UtcNow.AddDays(24),
                        PricePerPerson = 7500.00m,
                        TotalSeats = 12,
                        BookedSeats = 2,
                        Status = ScheduleStatus.Scheduled
                    }
                ],
                Reviews = [
                    new()
                    {
                        ReviewerName = "Tanvir Ahmed",
                        ReviewerLocation = "Dhanmondi, Dhaka",
                        ReviewerEmail = "tanvir@example.com",
                        Rating = 5,
                        Title = "The clouds felt within arm's reach",
                        Comment = "Extremely well organized. The Chander Gari driver was skilled and our cottage in Ruilui had an unblocked 180-degree view of the valley. Best trip of the year.",
                        TripDateFormatted = "October 2026",
                        IsVerifiedBooking = true
                    }
                ]
            },

            // 2. Tanguar Haor Luxury Houseboat
            new()
            {
                Title = "Tanguar Haor & Shimul Bagan: Premium Houseboat Bajra",
                Slug = "tanguar-haor-premium-houseboat",
                Summary = "Drift along crystal wetlands in Sunamganj aboard a handcrafted wooden houseboat with fresh haor fish and folk music.",
                Description = "A deeply soothing 3-day journey across the emerald freshwater wetlands of Sunamganj. Float past migrating waterfowl beneath the Meghalaya hill borders, swim in the turquoise waters of Tekerghat limestone lake, stroll through the vibrant Shimul Bagan tree grove, and spend serene nights on the open wooden roof of your boat listening to acoustic Baul music under a moonlit sky.",
                Destination = "Tanguar Haor & Tekerghat, Sunamganj",
                Country = "Bangladesh",
                Region = "Sylhet Division",
                StartCity = "Dhaka / Sunamganj",
                EndCity = "Dhaka",
                IdealSeason = "July – November (Monsoon & Post-Monsoon)",
                DurationDays = 3,
                DurationNights = 2,
                BasePrice = 9800.00m,
                DiscountPrice = 8900.00m,
                DepositAmount = 3000.00m,
                MaxGroupSize = 14,
                Difficulty = DifficultyLevel.Easy,
                Category = TourCategory.BeachAndResort,
                CoverImageUrl = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
                GalleryImages = [
                    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
                ],
                Highlights = [
                    "2 Full days cruising on a luxury wooden houseboat with AC & attached washrooms",
                    "Swim in Niladri Lake (Shahid Siraj Lake / Limestone Quarry)",
                    "Watch sunset across the Meghalaya mountain borderline from Barikka Tila",
                    "Fresh wild haor catch (Boal, Rui, Pabda, Shrimp) cooked live on board",
                    "Evening live folk Baul flute and dotara performance on the open roof deck"
                ],
                Inclusions = [
                    "2 Days / 1 Night onboard luxury wooden houseboat (AC cabin with attached washroom)",
                    "All gourmet haor meals: 5 meals featuring duck curry, fresh fish & local desserts",
                    "Life jackets and safety swim assistance",
                    "Reserved transport from Sunamganj Ghat and back",
                    "Tanguar Haor sanctuary entry and boat permits"
                ],
                Exclusions = [
                    "Dhaka to Sunamganj bus tickets (can be arranged on request)",
                    "Personal tips for boat crew and musician"
                ],
                PackingTips = [
                    "Extra cotton clothes and swimwear",
                    "Waterproof dry pouch for phones and cameras",
                    "Sun hat, sunglasses, and mosquito repellent cream"
                ],
                IsActive = true,
                IsFeatured = true,
                ItineraryDays = [
                    new()
                    {
                        DayNumber = 1,
                        Title = "Boarding Houseboat at Sunamganj & Watchtower Cruise",
                        Description = "Arrive in Sunamganj in the morning. Board your premium wooden bajra at Shaheb Bari Ghat with welcome coconut water. Cruise through the heart of Tanguar Haor, observe local fishermen in wooden dinghies, anchor near the central Watchtower, and take a refreshing dip in clean haor water.",
                        Accommodation = "Private Cabin aboard 'Joltorongo' Houseboat",
                        MealsIncluded = "Breakfast, Fresh Haor Fish Lunch, Duck Curry Dinner",
                        Location = "Central Tanguar Haor",
                        ActivityMetrics = "Smooth boat cruise • Swimming with lifejackets"
                    },
                    new()
                    {
                        DayNumber = 2,
                        Title = "Tekerghat Niladri Lake & Shimul Bagan",
                        Description = "Wake up to misty waters. Cruise towards Tekerghat. Ride local bikes to Niladri Lake (former limestone quarry) with stunning emerald water backed by Indian mountain ranges. Visit the Jadukata riverbank and Barikka Tila in the late afternoon.",
                        Accommodation = "Private Cabin aboard Houseboat",
                        MealsIncluded = "Breakfast, Lunch, Rooftop BBQ Dinner",
                        Location = "Tekerghat & Jadukata River",
                        ActivityMetrics = "Bike ride 1 hr • Scenic walks"
                    }
                ],
                Schedules = [
                    new()
                    {
                        StartDate = DateTime.UtcNow.AddDays(10),
                        EndDate = DateTime.UtcNow.AddDays(13),
                        PricePerPerson = 8900.00m,
                        TotalSeats = 14,
                        BookedSeats = 6,
                        Status = ScheduleStatus.Guaranteed
                    }
                ],
                Reviews = [
                    new()
                    {
                        ReviewerName = "Farhana Islam",
                        ReviewerLocation = "Uttara, Dhaka",
                        ReviewerEmail = "farhana@example.com",
                        Rating = 5,
                        Title = "Peaceful beyond words",
                        Comment = "Sitting on the upper deck at night with cool wind blowing and hearing acoustic Baul flute songs was the most peaceful experience I've had in years. Highly recommended for couples and families.",
                        TripDateFormatted = "September 2026",
                        IsVerifiedBooking = true
                    }
                ]
            },

            // 3. Sreemangal Tea Estates
            new()
            {
                Title = "Sreemangal & Lawachara: Tea Gardens & Rainforest Retreat",
                Slug = "sreemangal-tea-gardens-lawachara",
                Summary = "Pedal along tranquil rolling emerald tea estates, explore Lawachara National Park, and taste seven-layer tea.",
                Description = "Immerse yourself in the calming green capital of Bangladesh. Wander through manicured tea hills that stretch as far as the eye can see, encounter endangered Hoolock gibbons in Lawachara Rainforest, visit indigenous Khasia betel-leaf villages, and unwind in luxurious boutique tea resort cottages surrounded by silence and fresh air.",
                Destination = "Sreemangal, Moulvibazar",
                Country = "Bangladesh",
                Region = "Sylhet Division",
                StartCity = "Dhaka / Sreemangal",
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
                CoverImageUrl = "https://images.unsplash.com/photo-1582650625119-3a31f8418b7d?auto=format&fit=crop&w=1200&q=80",
                GalleryImages = [
                    "https://images.unsplash.com/photo-1582650625119-3a31f8418b7d?auto=format&fit=crop&w=1200&q=80"
                ],
                Highlights = [
                    "Bicycle or open jeep ride through Finlay & Madhabpur Tea Estates",
                    "Wildlife trail in Lawachara National Park with certified naturalist",
                    "Sunset reflection over water lilies at Madhabpur Lake",
                    "Visit to Baikka Beel wetland bird sanctuary",
                    "Tasting authentic 7-layer tea at Nilkantha Tea Cabin"
                ],
                Inclusions = [
                    "2 Nights in Deluxe Eco-Resort Cottage (Grand Selim / Swiss Valley)",
                    "Dhaka to Sreemangal round-trip Parabat/Jayantika Express train or AC bus",
                    "Daily breakfast and traditional Sylheti dinners featuring Shatkora beef/chicken",
                    "Reserved private auto/jeep for all local sightseeing",
                    "Forest entry fees and registered nature guide"
                ],
                Exclusions = [
                    "Personal tea packet purchases",
                    "Lunches during independent tea stall explorations"
                ],
                PackingTips = [
                    "Light cotton shirts, walking shoes, binoculars for birdwatching",
                    "Eco-friendly water bottle (refills available at resort)"
                ],
                IsActive = true,
                IsFeatured = true,
                ItineraryDays = [
                    new()
                    {
                        DayNumber = 1,
                        Title = "Scenic Train to Sreemangal & Madhabpur Lake Sunset",
                        Description = "Morning train from Kamalapur Railway Station through green countryside. Arrive in Sreemangal by noon. Check into serene eco-resort. Afternoon drive through Finlay tea gardens to Madhabpur Lake to see wild pink lotus flowers.",
                        Accommodation = "Grand Selim Eco Resort",
                        MealsIncluded = "Dinner",
                        Location = "Madhabpur Lake",
                        ActivityMetrics = "Train travel 4 hrs • Gentle lake stroll"
                    },
                    new()
                    {
                        DayNumber = 2,
                        Title = "Lawachara Canopy Trek & Khasia Village",
                        Description = "Morning guided forest trek under the dense canopy of Lawachara National Park. Listen for the calls of wild Hoolock gibbons. Visit Khasiapunji betel-leaf farming village. Afternoon tea-testing session at Nilkantha.",
                        Accommodation = "Grand Selim Eco Resort",
                        MealsIncluded = "Breakfast, Traditional Shatkora Dinner",
                        Location = "Lawachara Forest",
                        ActivityMetrics = "3 hours easy nature walk"
                    }
                ],
                Schedules = [
                    new()
                    {
                        StartDate = DateTime.UtcNow.AddDays(14),
                        EndDate = DateTime.UtcNow.AddDays(17),
                        PricePerPerson = 6400.00m,
                        TotalSeats = 10,
                        BookedSeats = 3,
                        Status = ScheduleStatus.Guaranteed
                    }
                ],
                Reviews = [
                    new()
                    {
                        ReviewerName = "Mahmudul Hasan",
                        ReviewerLocation = "Chittagong",
                        ReviewerEmail = "mahmudul@example.com",
                        Rating = 5,
                        Title = "Total greenery and peace of mind",
                        Comment = "Walking through Lawachara in the early morning fog was magical. The resort was super quiet, clean, and the food cooked with local shatkora was unforgettable.",
                        TripDateFormatted = "August 2026",
                        IsVerifiedBooking = true
                    }
                ]
            },

            // 4. Cox's Bazar Marine Drive & Inani
            new()
            {
                Title = "Cox's Bazar & Inani: Longest Beach & Marine Drive Coastal Trail",
                Slug = "coxs-bazar-marine-drive-inani",
                Summary = "Relax on secluded beaches along the world's longest coastline, cruise the Marine Drive, and taste fresh Kolatoli seafood.",
                Description = "Experience the calm and relaxing side of the world's longest natural sea beach (120 km). Stay along the tranquil stretches of Inani Beach, take scenic sunset drives on the cliffside Marine Drive with the Bay of Bengal on one side and green hills on the other, explore coral rocks, and feast on fresh Rupchanda and pomfret.",
                Destination = "Cox's Bazar & Inani Beach",
                Country = "Bangladesh",
                Region = "Chittagong Division",
                StartCity = "Dhaka / Cox's Bazar",
                EndCity = "Dhaka",
                IdealSeason = "October – April",
                DurationDays = 4,
                DurationNights = 3,
                BasePrice = 11500.00m,
                DiscountPrice = 9900.00m,
                DepositAmount = 3000.00m,
                MaxGroupSize = 10,
                Difficulty = DifficultyLevel.Easy,
                Category = TourCategory.BeachAndResort,
                CoverImageUrl = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
                GalleryImages = [
                    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
                ],
                Highlights = [
                    "Stay in premier seaside resort with private beach access",
                    "Sunset open-roof jeep drive along the 80km Marine Drive road",
                    "Explore live coral reefs and clean beaches of Inani & Himchhari",
                    "Authentic coastal seafood dinners: Grilled Rupchanda, Koral & Lobster",
                    "Morning walk at quiet Sugandha and Darianagar secluded spots"
                ],
                Inclusions = [
                    "3 Nights in 4-Star Beachfront Resort (Sayeman Beach Resort or Royal Tulip)",
                    "Roundtrip AC Scania coach from Dhaka or airport transfer assistance",
                    "Daily buffet breakfasts with sea view",
                    "Dedicated private tourist car for Marine Drive, Himchhari & Inani",
                    "One complimentary seafood dinner by the waves"
                ],
                Exclusions = [
                    "Airfare (can be added on request)",
                    "Water sports (parasailing / jet ski)"
                ],
                PackingTips = [
                    "Sunscreen, beach flip-flops, sunglasses, linen casual wear"
                ],
                IsActive = true,
                IsFeatured = true,
                ItineraryDays = [
                    new()
                    {
                        DayNumber = 1,
                        Title = "Arrival in Cox's Bazar & Sunset Beach Stroll",
                        Description = "Arrive in Cox's Bazar. Check in to your seaside room. Spend the afternoon watching the golden sunset over the gentle waves of the Bay of Bengal. Enjoy evening fresh fish fry at Kolatoli.",
                        Accommodation = "Sayeman Beach Resort / Long Beach Hotel",
                        MealsIncluded = "Dinner",
                        Location = "Kolatoli Beach",
                        ActivityMetrics = "Beach walking • Relaxation"
                    },
                    new()
                    {
                        DayNumber = 2,
                        Title = "Marine Drive Safari to Inani & Himchhari",
                        Description = "After breakfast, take a private drive on the world-famous Marine Drive road. Stop at Himchhari national park for panoramic hill views of the ocean. Continue to Inani Beach to inspect unique ancient coral boulders.",
                        Accommodation = "Sayeman Beach Resort",
                        MealsIncluded = "Buffet Breakfast, Seafood Dinner",
                        Location = "Marine Drive & Inani",
                        ActivityMetrics = "Coastal drive 50 km • Coral reef exploration"
                    }
                ],
                Schedules = [
                    new()
                    {
                        StartDate = DateTime.UtcNow.AddDays(15),
                        EndDate = DateTime.UtcNow.AddDays(19),
                        PricePerPerson = 9900.00m,
                        TotalSeats = 10,
                        BookedSeats = 4,
                        Status = ScheduleStatus.Guaranteed
                    }
                ],
                Reviews = [
                    new()
                    {
                        ReviewerName = "Abrar Chowdhury",
                        ReviewerLocation = "Gulshan, Dhaka",
                        ReviewerEmail = "abrar@example.com",
                        Rating = 5,
                        Title = "Best coastal drive in Asia",
                        Comment = "Driving down Marine Drive at 5 PM with the cool ocean breeze was pure happiness. Highly recommend staying away from crowded points and spending time at Inani.",
                        TripDateFormatted = "September 2026",
                        IsVerifiedBooking = true
                    }
                ]
            },

            // 5. Sundarbans Mangrove
            new()
            {
                Title = "Sundarbans Expedition: Mangrove Forest & Tiger Trail Cruise",
                Slug = "sundarbans-mangrove-forest-tiger-trail",
                Summary = "Cruise into the world's largest mangrove forest, observe spotted deer and estuarine crocodiles, and explore Kotka beach.",
                Description = "A deep eco-wilderness voyage into the UNESCO World Heritage Sundarbans. Travel aboard a purpose-built tourist cruiser through silent creeks and misty rivers. Take quiet dawn country boat rides into narrow mangrove channels, climb watchtowers overlooking tiger grounds at Kotka, and walk along the untouched virgin shores of Jamtola sea beach.",
                Destination = "Sundarbans, Khulna & Bagerhat",
                Country = "Bangladesh",
                Region = "Khulna Division",
                StartCity = "Khulna / Mongla",
                EndCity = "Khulna",
                IdealSeason = "November – March",
                DurationDays = 3,
                DurationNights = 3,
                BasePrice = 14500.00m,
                DiscountPrice = 13200.00m,
                DepositAmount = 4000.00m,
                MaxGroupSize = 16,
                Difficulty = DifficultyLevel.Moderate,
                Category = TourCategory.WildlifeAndSafari,
                CoverImageUrl = "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1200&q=80",
                GalleryImages = [
                    "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1200&q=80"
                ],
                Highlights = [
                    "Full cruising inside reserved deep forest zones (Harbaria, Kotka, Kochikhali)",
                    "Silent paddle boat canal cruise at dawn to spot kingfishers, deer & otters",
                    "Walk on Jamtola isolated white sand beach surrounded by mangroves",
                    "Armed forest department security guards accompanying all shore excursions",
                    "Visit historical Sixty Dome Mosque (Shat Gombuj Masjid) in Bagerhat"
                ],
                Inclusions = [
                    "3 Days & 3 Nights cabin accommodation on registered tourist ship (M.V. The Wave / Silverwave)",
                    "All meals on ship (buffet breakfast, lunches, and traditional dinners)",
                    "Forest Department revenue fees, permissions, and armed guard escort",
                    "Licensed expert mangrove naturalist guide",
                    "Small wooden non-motorized boat canal excursions"
                ],
                Exclusions = [
                    "Transport to Mongla/Khulna ghat (can be arranged via coach/train)",
                    "Personal camera fees (if commercial)"
                ],
                PackingTips = [
                    "Dull colored clothes (earthy green, khaki, brown; avoid red and bright yellow)",
                    "Full-sleeved shirts to protect against sun and insects",
                    "Comfortable closed walking shoes or rubber boots for mud trails"
                ],
                IsActive = true,
                IsFeatured = true,
                ItineraryDays = [
                    new()
                    {
                        DayNumber = 1,
                        Title = "Boarding at Mongla & Harbaria Eco Center",
                        Description = "Board the cruise vessel at Mongla Ghat by 7:30 AM. Fresh breakfast as the ship sails into the Sundarbans. First shore excursion along the wooden walkway of Harbaria Eco Tourism Center. Watch for spotted deer, wild boars, and fresh tiger pugmarks.",
                        Accommodation = "Private Twin Cabin on Ship",
                        MealsIncluded = "Breakfast, Lunch, Dinner",
                        Location = "Harbaria",
                        ActivityMetrics = "Mangrove walkway 2 km • River cruise"
                    },
                    new()
                    {
                        DayNumber = 2,
                        Title = "Silent Canal Cruise & Jamtola Tiger Beach",
                        Description = "Dawn canal cruise on country rowboats with engine off, listening to bird calls in absolute silence. Post-breakfast trek through Kotka forest trail leading to the remote Jamtola sea beach on the Bay of Bengal.",
                        Accommodation = "Private Twin Cabin on Ship",
                        MealsIncluded = "Breakfast, Lunch, BBQ Night",
                        Location = "Kotka & Jamtola Beach",
                        ActivityMetrics = "Forest walking 4 km • Quiet rowboat trip"
                    }
                ],
                Schedules = [
                    new()
                    {
                        StartDate = DateTime.UtcNow.AddDays(25),
                        EndDate = DateTime.UtcNow.AddDays(28),
                        PricePerPerson = 13200.00m,
                        TotalSeats = 16,
                        BookedSeats = 8,
                        Status = ScheduleStatus.Guaranteed
                    }
                ],
                Reviews = [
                    new()
                    {
                        ReviewerName = "Sadman Sakib",
                        ReviewerLocation = "Mirpur, Dhaka",
                        ReviewerEmail = "sadman@example.com",
                        Rating = 5,
                        Title = "A true national treasure",
                        Comment = "The silence of the Sundarbans cannot be described. We saw spotted deer grazing right by our boat and saw fresh tiger tracks at Kotka. The boat staff took care of every detail.",
                        TripDateFormatted = "January 2026",
                        IsVerifiedBooking = true
                    }
                ]
            },

            // 6. Bandarban Nilgiri & Boga Lake
            new()
            {
                Title = "Bandarban Mountain Trails: Nilgiri Cloud Resort & Boga Lake",
                Slug = "bandarban-nilgiri-boga-lake",
                Summary = "Climb scenic mountain passes, experience Nilgiri cloud peak, and visit volcanic Boga Lake with indigenous Bawm guides.",
                Description = "An adventurous yet serene journey through the highest peaks of southeastern Bangladesh. Ride through dramatic serpentine mountain roads, witness cloud formations from the cliff edge of Nilgiri, visit indigenous Bawm and Marma hill communities, and stay near mystical Boga Lake nestled at 1,200 feet above sea level.",
                Destination = "Bandarban & Ruma",
                Country = "Bangladesh",
                Region = "Chittagong Division",
                StartCity = "Dhaka / Bandarban",
                EndCity = "Dhaka",
                IdealSeason = "October – March",
                DurationDays = 3,
                DurationNights = 2,
                BasePrice = 8800.00m,
                DiscountPrice = 7800.00m,
                DepositAmount = 2500.00m,
                MaxGroupSize = 10,
                Difficulty = DifficultyLevel.Moderate,
                Category = TourCategory.MountainTrekking,
                CoverImageUrl = "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
                GalleryImages = [
                    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80"
                ],
                Highlights = [
                    "Visit Nilgiri Resort (2,200 feet above sea level, touching the clouds)",
                    "Scenic drive through Chimbuk Hill and Shoilo Propat waterfall",
                    "Excursion to mystical freshwater Boga Lake (crater lake)",
                    "Experience local indigenous hill cuisine and wild mountain tea",
                    "Golden Temple (Buddha Dhatu Jadi) architectural visit"
                ],
                Inclusions = [
                    "2 Nights accommodation in hill-view eco resort / wooden cottage",
                    "Reserved 4x4 Chander Gari for all mountain transfers",
                    "All meals during the expedition",
                    "Registered local indigenous guide and security paperwork clearances",
                    "All community passes and waterfall entry permits"
                ],
                Exclusions = [
                    "Dhaka to Bandarban bus fare (can be booked on request)",
                    "Personal tips"
                ],
                PackingTips = [
                    "Warm jacket for cool mountain breezes",
                    "Grippy hiking shoes",
                    "Photocopies of National ID card (4 sets for army checkposts)"
                ],
                IsActive = true,
                IsFeatured = false,
                ItineraryDays = [
                    new()
                    {
                        DayNumber = 1,
                        Title = "Arrival in Bandarban & Nilgiri Cloud Highway",
                        Description = "Arrive early morning in Bandarban town. Traditional breakfast. Board reserved Chander Gari for the drive up the mountain highway to Nilgiri. Cloud views from the helipad and coffee at the military hilltop cafe. Return via Chimbuk Hill and Shoilo Propat.",
                        Accommodation = "Hill View Resort / Sairu Hill Resort",
                        MealsIncluded = "Breakfast, Lunch, Dinner",
                        Location = "Nilgiri & Chimbuk",
                        ActivityMetrics = "Mountain drive 4 hrs • Sightseeing"
                    },
                    new()
                    {
                        DayNumber = 2,
                        Title = "Journey to Ruma & Boga Lake",
                        Description = "Scenic ride along the Sangu River to Ruma Bazar. Complete security registration and proceed up the mountain track to picturesque Boga Lake. Relax beside the calm volcanic water and meet Bawm villagers.",
                        Accommodation = "Boga Lake Wooden Cottage",
                        MealsIncluded = "Breakfast, Indigenous Hill Lunch, Dinner",
                        Location = "Boga Lake",
                        ActivityMetrics = "Off-road ride 2.5 hrs • Lake walk"
                    }
                ],
                Schedules = [
                    new()
                    {
                        StartDate = DateTime.UtcNow.AddDays(18),
                        EndDate = DateTime.UtcNow.AddDays(21),
                        PricePerPerson = 7800.00m,
                        TotalSeats = 10,
                        BookedSeats = 3,
                        Status = ScheduleStatus.Guaranteed
                    }
                ],
                Reviews = [
                    new()
                    {
                        ReviewerName = "Nafis Imtiaz",
                        ReviewerLocation = "Sylhet",
                        ReviewerEmail = "nafis@example.com",
                        Rating = 5,
                        Title = "Breathtaking landscapes inside Bangladesh",
                        Comment = "Many people don't realize how majestic the Bandarban hills are. Nilgiri was above the clouds and the fresh mountain air was completely rejuvenating.",
                        TripDateFormatted = "September 2026",
                        IsVerifiedBooking = true
                    }
                ]
            }
        };

        context.TourPackages.AddRange(bangladeshTours);
        await context.SaveChangesAsync();
    }
}
