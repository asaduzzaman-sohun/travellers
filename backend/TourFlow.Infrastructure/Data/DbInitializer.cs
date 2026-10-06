using Microsoft.EntityFrameworkCore;
using TourFlow.Domain.Entities;
using TourFlow.Domain.Enums;

namespace TourFlow.Infrastructure.Data;

public static class DbInitializer
{
    public static async Task SeedAsync(TourFlowDbContext context)
    {
        // If we only had the earlier minimal seed or old schema, let's clear and re-seed to provide rich authentic data
        var existingCount = await context.TourPackages.CountAsync();
        if (existingCount >= 6)
        {
            return;
        }

        if (existingCount > 0)
        {
            // Clean up previous test seed so we have the full production catalog
            context.Bookings.RemoveRange(context.Bookings);
            context.TourSchedules.RemoveRange(context.TourSchedules);
            context.ItineraryDays.RemoveRange(context.ItineraryDays);
            context.Reviews.RemoveRange(context.Reviews);
            context.TourPackages.RemoveRange(context.TourPackages);
            await context.SaveChangesAsync();
        }

        var tours = new List<TourPackage>
        {
            // 1. Patagonia Expedition
            new()
            {
                Title = "Patagonia Frontier: W-Trek & Glaciers of Torres del Paine",
                Slug = "patagonia-frontier-w-trek",
                Summary = "Trek through granite spires, blue icebergs, and golden grasslands across Chilean and Argentine Patagonia.",
                Description = "A masterfully curated 10-day expedition into one of the wildest wilderness frontiers on Earth. Hike the world-renowned W-Trek in Torres del Paine National Park, stand before the thunderous calving ice wall of Perito Moreno Glacier, and witness Mount Fitz Roy glow at sunrise. Nights are spent in sustainable eco-camp geodesic domes and historic Patagonian estancias enjoying traditional wood-fired Asado barbecues and fine Carmenere wine.",
                Destination = "Torres del Paine & Los Glaciares",
                Country = "Chile & Argentina",
                Region = "Americas",
                StartCity = "Punta Arenas, Chile",
                EndCity = "El Calafate, Argentina",
                IdealSeason = "October – April",
                DurationDays = 10,
                DurationNights = 9,
                BasePrice = 3450.00m,
                DiscountPrice = 3190.00m,
                DepositAmount = 600.00m,
                MaxGroupSize = 12,
                Difficulty = DifficultyLevel.Challenging,
                Category = TourCategory.MountainTrekking,
                CoverImageUrl = "https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=1600&q=80",
                GalleryImages = [
                    "https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=1200&q=80",
                    "https://images.unsplash.com/photo-1527004013197-933c4bb611b3?auto=format&fit=crop&w=1200&q=80",
                    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80"
                ],
                Highlights = [
                    "Full guided traverse of the iconic W-Trek in Torres del Paine",
                    "Boat navigation across Grey Lake amongst cobalt blue icebergs",
                    "Exclusive catwalk vantage of Perito Moreno Glacier in Argentina",
                    "Private estancia barbecue with local Baqueano horsemen",
                    "Sunrise hike to the base of granite towers (Mirador Las Torres)"
                ],
                Inclusions = [
                    "9 Nights in Boutique Mountain Refugios & Eco-Lodge Domes",
                    "All meals on trek: 9 hearty breakfasts, 8 trail lunches, 7 chef-prepared dinners",
                    "Certified bilingual UIAGM / Wilderness First Responder mountain guides",
                    "All National Park permits, border transit permits, and lake catamaran fares",
                    "Luggage transfer service between main base lodges and trailheads"
                ],
                Exclusions = [
                    "International flights into Punta Arenas (PUQ) and out of El Calafate (FTE)",
                    "Mandatory international medical and mountain evacuation insurance",
                    "Personal trekking gear (boots, poles, sleeping gear upgrades)"
                ],
                PackingTips = [
                    "Layered thermal base layers (Merino wool recommended)",
                    "GORE-TEX waterproof shell jacket and pants for Patagonian wind",
                    "Sturdy, broken-in waterproof hiking boots with Vibram soles",
                    "Trekking poles with rubber tips"
                ],
                IsActive = true,
                IsFeatured = true,
                ItineraryDays = [
                    new()
                    {
                        DayNumber = 1,
                        Title = "Arrival in Punta Arenas & Transfer to Puerto Natales",
                        Description = "Meet your expedition director at Punta Arenas Airport. Scenic private drive along the Strait of Magellan to the seaside town of Puerto Natales. Evening trip orientation followed by a welcome dinner featuring King Crab and Chilean wines.",
                        Accommodation = "The Singular Patagonia / Hotel Indigo",
                        MealsIncluded = "Dinner",
                        Location = "Puerto Natales",
                        ActivityMetrics = "Scenic drive 3 hrs • Elevation: Sea Level"
                    },
                    new()
                    {
                        DayNumber = 2,
                        Title = "Into Torres del Paine & Mirador Base Las Torres",
                        Description = "Early morning transfer into Torres del Paine National Park. Begin the challenging ascent through the Ascencio Valley, crossing ancient Lenga beech forests before navigating the final moraine to witness the monumental granite horn towers reflected in the turquoise glacial tarn.",
                        Accommodation = "EcoCamp Patagonia Geodesic Domes",
                        MealsIncluded = "Breakfast, Trail Lunch, Dinner",
                        Location = "Torres del Paine",
                        ActivityMetrics = "19 km hiking • 8-9 hours • +900m elevation gain"
                    },
                    new()
                    {
                        DayNumber = 3,
                        Title = "French Valley Hanging Glaciers",
                        Description = "Hike into the dramatic French Valley, a natural amphitheater framed by granite walls and hanging glaciers. Hear the frequent roar of glacial ice calving across the valley basin while looking out over Lake Nordenskjöld.",
                        Accommodation = "Refugio Paine Grande",
                        MealsIncluded = "Breakfast, Trail Lunch, Dinner",
                        Location = "French Valley",
                        ActivityMetrics = "15 km hiking • 6-7 hours • +600m / -600m"
                    },
                    new()
                    {
                        DayNumber = 4,
                        Title = "Grey Glacier Trek & Lake Navigation",
                        Description = "Follow the lake trail to Grey Glacier, part of the Southern Patagonian Ice Field. In the afternoon, board the Grey III vessel for a close-up navigation beside the sheer 30-meter high turquoise ice cliffs.",
                        Accommodation = "EcoCamp Patagonia",
                        MealsIncluded = "Breakfast, Trail Lunch, Dinner",
                        Location = "Grey Glacier",
                        ActivityMetrics = "11 km hiking • 4-5 hours • Boat navigation 2 hrs"
                    },
                    new()
                    {
                        DayNumber = 5,
                        Title = "Cross the Border to El Chaltén, Argentina",
                        Description = "Bid farewell to Chile and cross the pampas into Argentina. Arrive in El Chaltén, Argentina's trekking capital nestled beneath the dramatic sawtooth silhouette of Mount Fitz Roy.",
                        Accommodation = "Destino Sur Hotel de Montaña & Spa",
                        MealsIncluded = "Breakfast, Dinner",
                        Location = "El Chaltén",
                        ActivityMetrics = "Border crossing & drive 5 hrs"
                    }
                ],
                Schedules = [
                    new()
                    {
                        StartDate = DateTime.UtcNow.AddDays(25),
                        EndDate = DateTime.UtcNow.AddDays(35),
                        PricePerPerson = 3190.00m,
                        TotalSeats = 12,
                        BookedSeats = 8,
                        Status = ScheduleStatus.Guaranteed
                    },
                    new()
                    {
                        StartDate = DateTime.UtcNow.AddDays(55),
                        EndDate = DateTime.UtcNow.AddDays(65),
                        PricePerPerson = 3450.00m,
                        TotalSeats = 12,
                        BookedSeats = 3,
                        Status = ScheduleStatus.Scheduled
                    },
                    new()
                    {
                        StartDate = DateTime.UtcNow.AddDays(90),
                        EndDate = DateTime.UtcNow.AddDays(100),
                        PricePerPerson = 3450.00m,
                        TotalSeats = 12,
                        BookedSeats = 0,
                        Status = ScheduleStatus.Scheduled
                    }
                ],
                Reviews = [
                    new()
                    {
                        ReviewerName = "Harrison Croft",
                        ReviewerLocation = "Denver, Colorado",
                        ReviewerEmail = "harrison.c@example.com",
                        Rating = 5,
                        Title = "Life-changing wilderness experience",
                        Comment = "The logistics were completely flawless. Walking up to the Base of the Towers at sunrise was a bucket-list moment I will never forget. Our guide Lucas was extraordinarily knowledgeable about local geology and weather patterns.",
                        TripDateFormatted = "Traveled March 2026",
                        IsVerifiedBooking = true
                    },
                    new()
                    {
                        ReviewerName = "Camilla Lindqvist",
                        ReviewerLocation = "Stockholm, Sweden",
                        ReviewerEmail = "camilla.l@example.com",
                        Rating = 5,
                        Title = "EcoCamp was out of this world",
                        Comment = "Sleeping in the geodesic domes with views of the stars after strenuous days on the trail made this feel like true luxury adventure travel.",
                        TripDateFormatted = "Traveled February 2026",
                        IsVerifiedBooking = true
                    }
                ]
            },

            // 2. Tanzania Great Migration
            new()
            {
                Title = "Serengeti Migration & Ngorongoro Crater Safari",
                Slug = "serengeti-great-migration-safari",
                Summary = "Witness the raw power of the Great Migration and tracking the Big Five across the golden savannah of East Africa.",
                Description = "An extraordinary 8-day wildlife journey traversing the cradle of human history and Africa's greatest game reserves. Experience thrilling sunrise game drives in customized open-roof 4x4 Land Cruisers, descend 600 meters into the volcanic caldera of Ngorongoro Crater, and stay in authentic luxury canvas tented camps that move with the herds under the vast African night sky.",
                Destination = "Serengeti & Ngorongoro Caldera",
                Country = "Tanzania",
                Region = "Africa",
                StartCity = "Kilimanjaro (JRO), Tanzania",
                EndCity = "Arusha, Tanzania",
                IdealSeason = "June – October & December – March",
                DurationDays = 8,
                DurationNights = 7,
                BasePrice = 4200.00m,
                DiscountPrice = 3890.00m,
                DepositAmount = 750.00m,
                MaxGroupSize = 8,
                Difficulty = DifficultyLevel.Easy,
                Category = TourCategory.WildlifeAndSafari,
                CoverImageUrl = "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1600&q=80",
                GalleryImages = [
                    "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80",
                    "https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=1200&q=80",
                    "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1200&q=80"
                ],
                Highlights = [
                    "Guaranteed window seats in custom safari 4x4 Land Cruisers with pop-top roof",
                    "Full-day game drive in the UNESCO-listed Ngorongoro Crater floor",
                    "Tracking lion prides, cheetahs, leopards, and elephant herds in Central & Northern Serengeti",
                    "Intimate luxury tented camps with butler service, bush showers, and campfire sundowners",
                    "Authentic cultural encounter with respectful Maasai community elders"
                ],
                Inclusions = [
                    "7 Nights in Handpicked Luxury Safari Lodges & Semi-Permanent Canvas Camps",
                    "All meals on safari: gourmet bush breakfasts, hot lunches, and 3-course dinners",
                    "Unlimited game drives with professional certified KPSGA Bronze/Silver naturalist guides",
                    "All Tanzania National Park conservation fees, crater entry fees, and concessions",
                    "AMREF Flying Doctors emergency medical evacuation cover"
                ],
                Exclusions = [
                    "International roundtrip flights to Kilimanjaro International Airport (JRO)",
                    "Tanzania tourist visa ($50-$100 depending on nationality)",
                    "Hot air balloon safari over the Serengeti plains (optional add-on $599)"
                ],
                PackingTips = [
                    "Neutral khaki and olive cotton/linen apparel (avoid dark blue and black)",
                    "Quality pair of 8x42 or 10x42 binoculars",
                    "Wide-brim safari sun hat and polarized sunglasses",
                    "High-zoom camera lens (100-400mm recommended)"
                ],
                IsActive = true,
                IsFeatured = true,
                ItineraryDays = [
                    new()
                    {
                        DayNumber = 1,
                        Title = "Arrival in Arusha & Coffee Plantation Retreat",
                        Description = "Arrive at Kilimanjaro International Airport (JRO). Private chauffeured transfer to an idyllic colonial-era organic coffee plantation at the foothills of Mount Meru. Relax by the pool and enjoy farm-to-table dinner.",
                        Accommodation = "Arusha Coffee Lodge by Elewana",
                        MealsIncluded = "Dinner",
                        Location = "Arusha",
                        ActivityMetrics = "Transfer 1 hr • Gentle walk"
                    },
                    new()
                    {
                        DayNumber = 2,
                        Title = "Tarangire National Park: Giants & Baobabs",
                        Description = "Drive into Tarangire, famous for its dense concentration of majestic African elephants and ancient giant baobab trees. Spot tree-climbing lions and vast herds of zebras watering along the Tarangire River.",
                        Accommodation = "Tarangire Treetops Lodge",
                        MealsIncluded = "Breakfast, Picnic Lunch, Dinner",
                        Location = "Tarangire",
                        ActivityMetrics = "Game drive 6 hrs • Abundant wildlife"
                    },
                    new()
                    {
                        DayNumber = 3,
                        Title = "The Lost World of Ngorongoro Crater",
                        Description = "Descend the steep volcanic walls into the world's largest unbroken caldera. The crater floor is an Eden of wildlife where you have the highest probability in Africa of observing black rhinos, hippos, and lion prides in a single morning.",
                        Accommodation = "Ngorongoro Crater Lodge",
                        MealsIncluded = "Breakfast, Picnic Lunch, Dinner",
                        Location = "Ngorongoro",
                        ActivityMetrics = "Crater floor game drive 7 hrs"
                    },
                    new()
                    {
                        DayNumber = 4,
                        Title = "Into the Endless Plains of the Serengeti",
                        Description = "Fly by bush aircraft or drive across Olduvai Gorge into the Serengeti. The name originates from Maasai 'Siringit'—where the land runs forever. Afternoon game drive tracking big cats hunting in the golden grass.",
                        Accommodation = "Serengeti Pioneer Camp",
                        MealsIncluded = "Breakfast, Lunch, Gourmet Dinner",
                        Location = "Serengeti",
                        ActivityMetrics = "Game drive 4 hrs • Sundowner drinks"
                    }
                ],
                Schedules = [
                    new()
                    {
                        StartDate = DateTime.UtcNow.AddDays(18),
                        EndDate = DateTime.UtcNow.AddDays(26),
                        PricePerPerson = 3890.00m,
                        TotalSeats = 8,
                        BookedSeats = 6,
                        Status = ScheduleStatus.Guaranteed
                    },
                    new()
                    {
                        StartDate = DateTime.UtcNow.AddDays(45),
                        EndDate = DateTime.UtcNow.AddDays(53),
                        PricePerPerson = 4200.00m,
                        TotalSeats = 8,
                        BookedSeats = 2,
                        Status = ScheduleStatus.Scheduled
                    }
                ],
                Reviews = [
                    new()
                    {
                        ReviewerName = "Dr. Elena Rostova",
                        ReviewerLocation = "Zurich, Switzerland",
                        ReviewerEmail = "elena.r@example.com",
                        Rating = 5,
                        Title = "Witnessed a river crossing on day three!",
                        Comment = "Words cannot describe the feeling of waking up to the sound of lions calling in the distance. The staff at the camp treated us like royalty. Our guide Moses spotted leopards hidden in acacia trees that nobody else could see.",
                        TripDateFormatted = "Traveled August 2026",
                        IsVerifiedBooking = true
                    }
                ]
            },

            // 3. Amalfi & Capri Private Sailing
            new()
            {
                Title = "Amalfi Coast & Isle of Capri: Private Riva Yacht & Cliffside Trails",
                Slug = "amalfi-coast-capri-private-yacht",
                Summary = "Bespoke Italian coastal escape combining cliffside luxury villas, private boat charters to Capri, and the scenic Path of the Gods.",
                Description = "Savor the dolce vita along Italy's most celebrated coastline. Stay in historic cliff-perched 5-star properties in Positano and Ravello. Charter a private wooden Riva yacht to swim in secluded emerald grottoes of Capri, hike high above the Mediterranean along the ancient Path of the Gods, and dine at Michelin-starred seaside terraces with local vintners.",
                Destination = "Positano, Capri & Ravello",
                Country = "Italy",
                Region = "Europe",
                StartCity = "Naples (NAP), Italy",
                EndCity = "Naples, Italy",
                IdealSeason = "May – October",
                DurationDays = 7,
                DurationNights = 6,
                BasePrice = 3600.00m,
                DiscountPrice = 3350.00m,
                DepositAmount = 500.00m,
                MaxGroupSize = 10,
                Difficulty = DifficultyLevel.Easy,
                Category = TourCategory.BeachAndResort,
                CoverImageUrl = "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1600&q=80",
                GalleryImages = [
                    "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80",
                    "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1200&q=80"
                ],
                Highlights = [
                    "Full-day private Riva yacht charter around Capri and Faraglioni rocks",
                    "Hike the legendary Path of the Gods (Sentiero degli Dei) with coastal geologist",
                    "Private lemon grove tour and artisanal Limoncello masterclass in Amalfi",
                    "Sunset classical concert at the cliffside gardens of Villa Rufolo in Ravello",
                    "VIP fast-track hydrofoil and Mercedes Maybach coastal transfers"
                ],
                Inclusions = [
                    "6 Nights in 5-Star Cliffside Luxury Hotels (Positano & Ravello)",
                    "Daily Champagne Breakfasts & 3 Curated Seaside Tasting Dinners",
                    "Private Mercedes Van and chauffeur for all mainland travel",
                    "Private yacht charter with skipper, towels, and onboard Italian aperitivo",
                    "All guided tours with licensed private Italian art and nature historians"
                ],
                Exclusions = [
                    "Airfare to/from Naples International Airport",
                    "City tourist taxes (payable directly at hotels, €7/night)",
                    "Personal shopping and spa treatments"
                ],
                PackingTips = [
                    "Light linen shirts, sundresses, and smart-casual evening wear",
                    "Comfortable walking shoes with good tread for stone stairways",
                    "Designer sunglasses and reef-safe sunscreen",
                    "Swimwear and dry-bag for yacht excursions"
                ],
                IsActive = true,
                IsFeatured = true,
                ItineraryDays = [
                    new()
                    {
                        DayNumber = 1,
                        Title = "Arrival in Naples & Private Transfer to Positano",
                        Description = "Meet your private chauffeur at Naples Airport or Train Station. Scenic drive along the cliff roads with dramatic sea views. Check-in to your balcony suite overlooking the pastel-hued village of Positano.",
                        Accommodation = "Le Sirenuse / Villa Franca Positano",
                        MealsIncluded = "Welcome Aperitivo & Dinner",
                        Location = "Positano",
                        ActivityMetrics = "Scenic drive 1.5 hrs"
                    },
                    new()
                    {
                        DayNumber = 2,
                        Title = "The Path of the Gods Hike to Nocelle",
                        Description = "Traverse the historic mountain pathway suspended between sea and sky. Walk past shepherd cottages, wild rosemary bushes, and limestone crags with breathtaking panoramic vistas of the entire Sorrentine Peninsula.",
                        Accommodation = "Villa Franca Positano",
                        MealsIncluded = "Breakfast, Rustic Mountain Lunch",
                        Location = "Nocelle",
                        ActivityMetrics = "8 km hike • 4 hours • Moderate stone paths"
                    },
                    new()
                    {
                        DayNumber = 3,
                        Title = "Private Capri Yacht Cruise & Blue Grotto",
                        Description = "Step aboard your private Riva yacht at Positano pier. Cruise past the siren islands of Li Galli, swim in crystal turquoise sea coves, navigate through the arch of the Faraglioni, and explore the boutiques of Capri town.",
                        Accommodation = "Villa Franca Positano",
                        MealsIncluded = "Breakfast, Onboard Prosecco & Lunch",
                        Location = "Capri",
                        ActivityMetrics = "Full day sailing & swimming"
                    }
                ],
                Schedules = [
                    new()
                    {
                        StartDate = DateTime.UtcNow.AddDays(30),
                        EndDate = DateTime.UtcNow.AddDays(37),
                        PricePerPerson = 3350.00m,
                        TotalSeats = 10,
                        BookedSeats = 4,
                        Status = ScheduleStatus.Guaranteed
                    },
                    new()
                    {
                        StartDate = DateTime.UtcNow.AddDays(60),
                        EndDate = DateTime.UtcNow.AddDays(67),
                        PricePerPerson = 3600.00m,
                        TotalSeats = 10,
                        BookedSeats = 1,
                        Status = ScheduleStatus.Scheduled
                    }
                ],
                Reviews = [
                    new()
                    {
                        ReviewerName = "Victoria Sterling",
                        ReviewerLocation = "London, United Kingdom",
                        ReviewerEmail = "victoria.s@example.com",
                        Rating = 5,
                        Title = "The most romantic trip of our lives",
                        Comment = "Every detail was executed with utter perfection. The private boat around Capri and our dinner reservation in Ravello overlooking the Mediterranean felt like something straight out of a classic movie.",
                        TripDateFormatted = "Traveled July 2026",
                        IsVerifiedBooking = true
                    }
                ]
            },

            // 4. Japan Kumano Kodo & Kyoto
            new()
            {
                Title = "Sacred Japan: Kumano Kodo Ancient Trails & Kyoto Zen",
                Slug = "sacred-japan-kumano-kodo-kyoto",
                Summary = "Walk thousand-year-old pilgrimage paths, stay in mountain temple lodgings, and experience authentic tea ceremonies in Kyoto.",
                Description = "A deeply meditative 9-day cultural pilgrimage through the spiritual heart of Japan. Trek UNESCO-listed stone paths through misty cedar forests on the Kii Peninsula, bathe in natural geothermal onsens that have healed pilgrims for a millennium, and experience an overnight shukubo stay in Mount Koya with Shingon Buddhist monks chanting at dawn.",
                Destination = "Kyoto, Kumano Kodo & Mount Koya",
                Country = "Japan",
                Region = "Asia",
                StartCity = "Osaka (KIX), Japan",
                EndCity = "Kyoto, Japan",
                IdealSeason = "March – May & October – November",
                DurationDays = 9,
                DurationNights = 8,
                BasePrice = 3150.00m,
                DiscountPrice = 2890.00m,
                DepositAmount = 500.00m,
                MaxGroupSize = 10,
                Difficulty = DifficultyLevel.Moderate,
                Category = TourCategory.Cultural,
                CoverImageUrl = "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1600&q=80",
                GalleryImages = [
                    "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80",
                    "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80"
                ],
                Highlights = [
                    "Hike sacred cobblestone sections of the UNESCO Kumano Kodo trail",
                    "Traditional Ryokan stays with multi-course Kaiseki seasonal banquets",
                    "Temple lodging (Shukubo) on Mount Koya with vegetarian Shojin Ryori dining",
                    "Morning meditation and Goma fire ritual with Buddhist monks",
                    "Private after-hours tea ceremony in a historic Kyoto teahouse"
                ],
                Inclusions = [
                    "8 Nights in Handpicked Traditional Ryokans, Temple Lodgings & Heritage Hotels",
                    "All breakfasts, 6 elaborate multi-course Kaiseki dinners, 4 trail lunches",
                    "Full baggage forward service between trail segments so you hike with a daypack",
                    "All regional train passes, express Shinkansen bullet trains, and private shuttles",
                    "English-speaking licensed Japanese cultural and mountain guide throughout"
                ],
                Exclusions = [
                    "International roundtrip flights to Osaka Kansai (KIX) / Tokyo (HND/NRT)",
                    "Personal onsen towels and discretionary temple donations",
                    "Alcoholic drinks during meals"
                ],
                PackingTips = [
                    "Slip-on shoes or boots with easy lacing (for frequent ryokan entries)",
                    "Merino wool socks and lightweight trekking gear",
                    "Compact daypack (20-25L) with rain cover"
                ],
                IsActive = true,
                IsFeatured = true,
                ItineraryDays = [
                    new()
                    {
                        DayNumber = 1,
                        Title = "Arrival in Osaka & Coastal Train to Tanabe",
                        Description = "Meet in Osaka and board the coastal Kuroshio train south to Tanabe, the historic gateway to the Kumano Kodo. Enjoy an introductory welcome banquet of fresh Pacific sashimi.",
                        Accommodation = "JR Hotel Clement Wakayama / Tanabe Ryokan",
                        MealsIncluded = "Dinner",
                        Location = "Tanabe",
                        ActivityMetrics = "Train travel 2 hrs"
                    },
                    new()
                    {
                        DayNumber = 2,
                        Title = "Trek Takijiri-oji to Takahara 'Village in the Mist'",
                        Description = "Begin the Kumano pilgrimage at sacred Takijiri shrine. Climb through ancient mossy roots and towering Japanese cedar forests to reach the scenic ridge village of Takahara overlooking mountain valleys.",
                        Accommodation = "Kiri-no-Sato Takahara Lodge",
                        MealsIncluded = "Breakfast, Lunch, Kaiseki Dinner",
                        Location = "Takahara",
                        ActivityMetrics = "4 km hiking • 2.5-3 hours • Steep stone climb +370m"
                    },
                    new()
                    {
                        DayNumber = 3,
                        Title = "Kumano Hongu Taisha & River Onsen of Yunomine",
                        Description = "Hike to the grand shrine of Hongu Taisha and stand beneath the world's largest torii gate at Oyunohara. Conclude the day by soaking in Yunomine Onsen, Japan's oldest hot spring retreat.",
                        Accommodation = "Ryokan Adumaya Yunomine",
                        MealsIncluded = "Breakfast, Bento Lunch, Dinner",
                        Location = "Yunomine Onsen",
                        ActivityMetrics = "13 km trail • 5 hours • Hot spring soak"
                    }
                ],
                Schedules = [
                    new()
                    {
                        StartDate = DateTime.UtcNow.AddDays(20),
                        EndDate = DateTime.UtcNow.AddDays(29),
                        PricePerPerson = 2890.00m,
                        TotalSeats = 10,
                        BookedSeats = 7,
                        Status = ScheduleStatus.Guaranteed
                    },
                    new()
                    {
                        StartDate = DateTime.UtcNow.AddDays(70),
                        EndDate = DateTime.UtcNow.AddDays(79),
                        PricePerPerson = 3150.00m,
                        TotalSeats = 10,
                        BookedSeats = 2,
                        Status = ScheduleStatus.Scheduled
                    }
                ],
                Reviews = [
                    new()
                    {
                        ReviewerName = "Nathaniel Cross",
                        ReviewerLocation = "Melbourne, Australia",
                        ReviewerEmail = "nathaniel.c@example.com",
                        Rating = 5,
                        Title = "Pure peace and serenity in the mountains",
                        Comment = "Walking beneath 800-year-old cedars in the mountain rain was spiritual. The luggage transfer system worked like clockwork. Every night the hot springs and multi-course meals recharged us completely.",
                        TripDateFormatted = "Traveled November 2025",
                        IsVerifiedBooking = true
                    }
                ]
            },

            // 5. Iceland Aurora & Glaciers
            new()
            {
                Title = "Iceland Volcanic Highlands: Ice Caves, Glaciers & Aurora Borealis",
                Slug = "iceland-volcanic-highlands-aurora",
                Summary = "Traverse supernatural volcanic landscapes, explore natural sapphire ice caves, and chase the Northern Lights in modified Super Jeeps.",
                Description = "A 7-day Arctic journey into Iceland's most remote southern wilderness. Journey across black volcanic sand beaches, walk across ancient glacier tongues wearing crampons, crawl into crystalline blue ice caves beneath Vatnajökull, and soak in geothermal mineral lagoons while watching the Aurora dance across midnight skies.",
                Destination = "Vatnajökull, Vik & Golden Circle",
                Country = "Iceland",
                Region = "Europe",
                StartCity = "Reykjavik (KEF), Iceland",
                EndCity = "Reykjavik, Iceland",
                IdealSeason = "September – April",
                DurationDays = 7,
                DurationNights = 6,
                BasePrice = 2950.00m,
                DiscountPrice = 2750.00m,
                DepositAmount = 450.00m,
                MaxGroupSize = 10,
                Difficulty = DifficultyLevel.Moderate,
                Category = TourCategory.Adventure,
                CoverImageUrl = "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1600&q=80",
                GalleryImages = [
                    "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80",
                    "https://images.unsplash.com/photo-1529963183134-61a90db47eaf?auto=format&fit=crop&w=1200&q=80"
                ],
                Highlights = [
                    "Expedition into natural Vatnajökull crystalline blue ice caves",
                    "Northern Lights hunting in dark-sky coastal locations with photography guide",
                    "Crampon glacier walk across Falljökull outlet glacier",
                    "Black sand coast of Reynisfjara and sea basalt columns",
                    "Relaxation pass to the geothermal Retreat Lagoon at Blue Lagoon"
                ],
                Inclusions = [
                    "6 Nights in Design Boutique Hotels and Northern Lights Rural Lodges",
                    "All breakfasts and 4 Arctic tasting dinners with fresh local seafood & lamb",
                    "Private 4x4 Mercedes Sprinter / Super Jeep with onboard Wi-Fi and USB charging",
                    "All glacier equipment: crampons, helmets, harnesses, and ice axes",
                    "Professional Northern Lights forecast monitoring and photo portraits"
                ],
                Exclusions = [
                    "International flights into Keflavik (KEF)",
                    "Lunches and beverages outside dinners",
                    "Personal outdoor cold-weather boots"
                ],
                PackingTips = [
                    "Windproof and waterproof shell jacket (10,000mm+ rating)",
                    "Thermal base layers and insulated down jacket",
                    "Thermal glove liners, waterproof mitts, and wool beanie"
                ],
                IsActive = true,
                IsFeatured = true,
                ItineraryDays = [
                    new()
                    {
                        DayNumber = 1,
                        Title = "Arrival & The Blue Lagoon Geothermal Retreat",
                        Description = "Arrive at Keflavik Airport. Immediate VIP transfer to the secluded Silica Lagoon for a relaxing soak in mineral-rich milky blue waters surrounded by moss-covered lava fields.",
                        Accommodation = "ION Adventure Hotel",
                        MealsIncluded = "Welcome Dinner",
                        Location = "Reykjavik / Grindavik",
                        ActivityMetrics = "Lagoon soak • Scenic drive 1 hr"
                    },
                    new()
                    {
                        DayNumber = 2,
                        Title = "Golden Circle & Thingvellir Rift Valley",
                        Description = "Stand between the North American and Eurasian tectonic plates at Thingvellir. Marvel at the powerful Gullfoss waterfall and witness the erupting Strokkur geyser throwing boiling steam into the crisp Arctic air.",
                        Accommodation = "ION Adventure Hotel",
                        MealsIncluded = "Breakfast, Dinner",
                        Location = "Golden Circle",
                        ActivityMetrics = "Walking 5 km • Tectonic rift tour"
                    },
                    new()
                    {
                        DayNumber = 3,
                        Title = "Glacier Hike & Jökulsárlón Glacier Lagoon",
                        Description = "Drive along the South Coast past Seljalandsfoss. Reach Jökulsárlón lagoon where floating icebergs drift out to the Atlantic and wash ashore on the black sand of Diamond Beach.",
                        Accommodation = "Fosshotel Glacier Lagoon",
                        MealsIncluded = "Breakfast, Dinner",
                        Location = "Vatnajökull",
                        ActivityMetrics = "Glacier hike 3 hrs • Crampons provided"
                    }
                ],
                Schedules = [
                    new()
                    {
                        StartDate = DateTime.UtcNow.AddDays(14),
                        EndDate = DateTime.UtcNow.AddDays(21),
                        PricePerPerson = 2750.00m,
                        TotalSeats = 10,
                        BookedSeats = 5,
                        Status = ScheduleStatus.Guaranteed
                    },
                    new()
                    {
                        StartDate = DateTime.UtcNow.AddDays(40),
                        EndDate = DateTime.UtcNow.AddDays(47),
                        PricePerPerson = 2950.00m,
                        TotalSeats = 10,
                        BookedSeats = 2,
                        Status = ScheduleStatus.Scheduled
                    }
                ],
                Reviews = [
                    new()
                    {
                        ReviewerName = "Astrid Larsson",
                        ReviewerLocation = "Copenhagen, Denmark",
                        ReviewerEmail = "astrid.l@example.com",
                        Rating = 5,
                        Title = "The ice caves left me speechless",
                        Comment = "Walking deep inside a blue glacier was like being on another planet. We also saw aurora borealis three nights in a row right outside our hotel windows.",
                        TripDateFormatted = "Traveled January 2026",
                        IsVerifiedBooking = true
                    }
                ]
            },

            // 6. Morocco Sahara & Imperial Cities
            new()
            {
                Title = "Moroccan Imperial Odyssey: High Atlas Trails to Luxury Sahara Dunes",
                Slug = "morocco-imperial-sahara-luxury",
                Summary = "Wander labyrinthine medinas, trek past High Atlas Berber settlements, and sleep beneath Saharan stars in a luxury tented camp.",
                Description = "An immersive 8-day sensory journey through the colors, scents, and history of North Africa. Traverse ancient caravan routes through the High Atlas Mountains, explore the UNESCO fortified clay village of Ait Benhaddou, and ride camels into the golden Erg Chebbi dunes for an unforgettable private luxury desert camp experience with live Gnawa music under the Milky Way.",
                Destination = "Marrakech, Dades Valley & Erg Chebbi",
                Country = "Morocco",
                Region = "Africa",
                StartCity = "Marrakech (RAK), Morocco",
                EndCity = "Marrakech, Morocco",
                IdealSeason = "October – May",
                DurationDays = 8,
                DurationNights = 7,
                BasePrice = 2250.00m,
                DiscountPrice = 1990.00m,
                DepositAmount = 350.00m,
                MaxGroupSize = 12,
                Difficulty = DifficultyLevel.Easy,
                Category = TourCategory.Cultural,
                CoverImageUrl = "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?auto=format&fit=crop&w=1600&q=80",
                GalleryImages = [
                    "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?auto=format&fit=crop&w=1200&q=80",
                    "https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?auto=format&fit=crop&w=1200&q=80"
                ],
                Highlights = [
                    "Private luxury desert camp with ensuite bathroom and king beds in Erg Chebbi",
                    "Sunset camel trek and sandboarding on 150-meter-high dunes",
                    "Guided architecture tour of fortified clay kasbah Ait Benhaddou",
                    "Private cooking masterclass crafting traditional lamb and prunes tagine",
                    "VIP exploration of Majorelle Gardens and the Yves Saint Laurent Museum"
                ],
                Inclusions = [
                    "7 Nights in Handpicked Luxury Riads, Kasbahs & Desert Luxury Glamping",
                    "Daily traditional Moroccan breakfasts and 6 chef-prepared dinners",
                    "Private 4x4 Mercedes V-Class with professional English-speaking driver",
                    "All local certified guides in Marrakech and Ait Benhaddou",
                    "Camel trek and 4x4 dune transport in the Sahara"
                ],
                Exclusions = [
                    "International airfare to Marrakech (RAK)",
                    "Lunches and gratuities for driver/guides",
                    "Alcoholic drinks outside riads"
                ],
                PackingTips = [
                    "Modest, breathable linen clothing covering shoulders and knees",
                    "Warm evening fleece (Sahara nights can be crisp)",
                    "Scarf or shemagh to protect against blowing sand"
                ],
                IsActive = true,
                IsFeatured = false,
                ItineraryDays = [
                    new()
                    {
                        DayNumber = 1,
                        Title = "Arrival in Marrakech & Riad Welcome",
                        Description = "Private airport greeting and escort to a peaceful restored 18th-century riad in the heart of the medina. Evening welcome banquet featuring slow-cooked tagine and fresh mint tea.",
                        Accommodation = "Riad Kniza / Villa des Orangers",
                        MealsIncluded = "Dinner",
                        Location = "Marrakech",
                        ActivityMetrics = "Transfer 30 min • Medina walk"
                    },
                    new()
                    {
                        DayNumber = 2,
                        Title = "Over the Tizi n'Tichka Pass to Ait Benhaddou",
                        Description = "Wind through the dramatic High Atlas Mountains over the 2,260m Tizi n'Tichka pass. Arrive at the red clay towers of Ait Benhaddou where Gladiator and Lawrence of Arabia were filmed.",
                        Accommodation = "Ksar Ighnda",
                        MealsIncluded = "Breakfast, Dinner",
                        Location = "Ait Benhaddou",
                        ActivityMetrics = "Scenic mountain drive 4 hrs • Kasbah exploration"
                    },
                    new()
                    {
                        DayNumber = 3,
                        Title = "Dades Gorges to Erg Chebbi Sahara Luxury Camp",
                        Description = "Journey through the Valley of a Thousand Kasbahs. As afternoon shadows lengthen, switch to dromedary camels or 4x4s to ride into the golden Erg Chebbi dunes. Dine by candlelight around the desert bonfire.",
                        Accommodation = "Merzouga Luxury Desert Camp",
                        MealsIncluded = "Breakfast, Sunset Camp Dinner",
                        Location = "Merzouga / Sahara",
                        ActivityMetrics = "Camel ride 1.5 hrs • Stargazing"
                    }
                ],
                Schedules = [
                    new()
                    {
                        StartDate = DateTime.UtcNow.AddDays(35),
                        EndDate = DateTime.UtcNow.AddDays(43),
                        PricePerPerson = 1990.00m,
                        TotalSeats = 12,
                        BookedSeats = 4,
                        Status = ScheduleStatus.Guaranteed
                    }
                ],
                Reviews = [
                    new()
                    {
                        ReviewerName = "Fiona Gallagher",
                        ReviewerLocation = "Dublin, Ireland",
                        ReviewerEmail = "fiona.g@example.com",
                        Rating = 5,
                        Title = "The desert camp surpassed all expectations",
                        Comment = "I was hesitant about camping in the Sahara, but this was five-star luxury. Hot showers, plush carpets, delicious food, and the stars at night were miraculous.",
                        TripDateFormatted = "Traveled March 2026",
                        IsVerifiedBooking = true
                    }
                ]
            }
        };

        context.TourPackages.AddRange(tours);
        await context.SaveChangesAsync();
    }
}
