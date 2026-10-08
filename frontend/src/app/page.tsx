"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Clock,
  Users,
  Search,
  ArrowRight,
  ShieldCheck,
  Star,
  CheckCircle2,
  ChevronRight,
  PenSquare,
  MessageSquare,
  Compass
} from "lucide-react";
import { TourSummary, API_BASE, BlogPost, getBlogPosts } from "@/lib/api";
import ImageWithFallback from "@/components/ImageWithFallback";
import LiveOmnibarSearch from "@/components/LiveOmnibarSearch";
import { TourCardSkeleton, StoryCardSkeleton } from "@/components/ui/Skeletons";

export default function HomePage() {
  const [tours, setTours] = useState<TourSummary[]>([]);
  const [recentStories, setRecentStories] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDivision, setSelectedDivision] = useState("All");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [toursRes, storiesData] = await Promise.all([
          fetch(`${API_BASE}/tourpackages`).then((r) => (r.ok ? r.json() : [])),
          getBlogPosts().catch(() => []),
        ]);
        setTours(toursRes);
        setRecentStories(storiesData.slice(0, 3));
      } catch (err) {
        console.error("Failed to load initial data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const divisions = [
    { label: "All Regions", value: "All" },
    { label: "Chittagong", value: "Chittagong" },
    { label: "Sylhet", value: "Sylhet" },
    { label: "Khulna", value: "Khulna" },
    { label: "Barishal", value: "Barishal" },
    { label: "Dhaka", value: "Dhaka" },
    { label: "Rajshahi", value: "Rajshahi" },
    { label: "Rangpur", value: "Rangpur" },
    { label: "Mymensingh", value: "Mymensingh" },
  ];

  const filteredTours = tours.filter((t) => {
    const matchesSearch =
      !searchQuery ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.destination.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDiv =
      selectedDivision === "All" ||
      t.region.toLowerCase().includes(selectedDivision.toLowerCase());
    return matchesSearch && matchesDiv;
  });

  return (
    <div className="space-y-20 pb-28">
      {/* 1. Spacious Editorial Hero Section */}
      <section className="relative w-full pt-14 pb-20 border-b border-[#EBE6DC] bg-[#FAF8F5]">
        <div className="w-full max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-14 2xl:px-20 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <span className="text-xs sm:text-sm font-semibold tracking-widest uppercase text-amber-800">
              Bangladesh Travel &amp; Heritage
            </span>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-bold text-stone-900 tracking-tight leading-[1.12]">
              Peaceful Journeys <br className="hidden sm:inline" />
              Across Bangladesh
            </h1>

            <p className="text-base sm:text-xl text-stone-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Wake up above the clouds in Sajek, drift quietly across Tanguar Haor, explore lush tea gardens in Sreemangal, and walk the serene coastline of Inani.
            </p>

            {/* Omnibar Autocomplete Search */}
            <div className="pt-2 max-w-xl mx-auto lg:mx-0">
              <LiveOmnibarSearch tours={tours} />
            </div>

            {/* Reassurance Tags */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-stone-600">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-700" />
                <span className="font-medium">Tourist Police Escort Verified</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-amber-800" />
                <span className="font-medium">Certified Indigenous Hosts &amp; Guides</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden border border-[#EBE6DC] shadow-md h-[400px] sm:h-[480px] bg-stone-100 group">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80"
                fallbackSrc="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80"
                alt="Sajek Valley Sea of Clouds"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent" />

              <div className="absolute bottom-6 left-6 right-6 p-5 rounded-2xl bg-white/95 backdrop-blur-md border border-stone-200/80 shadow-sm space-y-1">
                <div className="flex items-center justify-between text-sm sm:text-base">
                  <span className="text-stone-900 font-bold">Sajek Valley, Rangamati</span>
                  <span className="text-amber-800 font-bold flex items-center gap-1">
                    <Star className="h-4 w-4 fill-amber-500 text-amber-500" /> 4.9
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-stone-600 line-clamp-1">
                  Misty hill tracts touching morning clouds above Ruilui and Konglak Para.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Key Regions Filter Bar */}
      <section className="w-full max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-14 2xl:px-20">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-[#EBE6DC] pb-6">
          <div className="space-y-2">
            <span className="text-xs sm:text-sm font-semibold tracking-widest uppercase text-amber-800">
              Curated Destinations
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-stone-900 tracking-tight">
              Featured Tours &amp; Expeditions
            </h2>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {divisions.map((div) => (
              <button
                key={div.value}
                onClick={() => setSelectedDivision(div.value)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                  selectedDivision === div.value
                    ? "bg-stone-900 text-stone-50 shadow-xs"
                    : "bg-white text-stone-700 border border-[#E5DFD5] hover:bg-[#F5F2EB] hover:text-stone-950"
                }`}
              >
                {div.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Tour Packages Grid */}
      <section className="w-full max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-14 2xl:px-20">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <TourCardSkeleton />
            <TourCardSkeleton />
            <TourCardSkeleton />
            <TourCardSkeleton />
            <TourCardSkeleton />
            <TourCardSkeleton />
          </div>
        ) : filteredTours.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-[#EBE6DC] p-10 space-y-4 max-w-xl mx-auto shadow-sm">
            <h3 className="text-xl font-serif font-bold text-stone-900">No tour packages match this selection</h3>
            <p className="text-sm text-stone-600">Try choosing a different division or clearing your search term.</p>
            <button
              onClick={() => {
                setSelectedDivision("All");
                setSearchQuery("");
              }}
              className="px-6 py-2.5 rounded-full bg-stone-900 text-stone-50 text-sm font-semibold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTours.slice(0, 6).map((tour) => (
              <Link
                key={tour.id}
                href={`/tours/${tour.slug}`}
                className="group bg-white border border-[#EBE6DC] rounded-3xl overflow-hidden hover:border-[#C4BAA9] hover-lift transition-smooth flex flex-col shadow-xs"
              >
                {/* Image Box */}
                <div className="relative h-72 w-full overflow-hidden bg-stone-100">
                  <ImageWithFallback
                    src={tour.coverImageUrl}
                    fallbackSrc="https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?auto=format&fit=crop&w=1200&q=80"
                    alt={tour.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent opacity-90" />

                  <div className="absolute top-4 left-4">
                    <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/95 backdrop-blur-md text-stone-900 border border-stone-200/60 shadow-sm flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-amber-700" />
                      {tour.destination}
                    </span>
                  </div>

                  <div className="absolute top-4 right-4">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-stone-900/80 backdrop-blur-sm text-stone-100 border border-white/20 shadow-xs">
                      {tour.difficulty}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs sm:text-sm text-white font-medium">
                    <span className="flex items-center gap-1.5 drop-shadow">
                      <Clock className="h-4 w-4 text-amber-200" />
                      {tour.durationDays} Days / {tour.durationNights} Nights
                    </span>
                    <span className="flex items-center gap-1.5 drop-shadow">
                      <Users className="h-4 w-4 text-stone-200" />
                      Max {tour.maxGroupSize} Guests
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-5">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <div className="flex items-center text-amber-600">
                        <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                        <span className="ml-1.5 font-bold text-stone-900">{(tour.averageRating ?? 4.9).toFixed(1)}</span>
                        <span className="text-stone-400 mx-1.5">•</span>
                        <span className="text-stone-500">{tour.totalReviews ?? 14} reviews</span>
                      </div>
                      <span className="text-stone-500 font-medium">{tour.region}</span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 group-hover:text-amber-800 transition-colors line-clamp-2 leading-snug">
                      {tour.title}
                    </h3>

                    <p className="text-sm text-stone-600 line-clamp-2 leading-relaxed">
                      {tour.summary}
                    </p>
                  </div>

                  {tour.highlights && tour.highlights.length > 0 && (
                    <div className="space-y-2 border-t border-[#F0EBE1] pt-3.5">
                      {tour.highlights.slice(0, 2).map((hl, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs sm:text-sm text-stone-600">
                          <CheckCircle2 className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{hl}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="pt-4 border-t border-[#F0EBE1] flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-stone-500 uppercase font-semibold tracking-wider">Per Person From</div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl sm:text-3xl font-extrabold text-stone-900">
                          BDT {(tour.discountPrice ?? tour.basePrice).toLocaleString()}
                        </span>
                        {tour.discountPrice && (
                          <span className="text-xs sm:text-sm text-stone-400 line-through">
                            BDT {tour.basePrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <span className="px-5 py-2.5 rounded-full bg-stone-900 group-hover:bg-stone-800 text-stone-50 text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1 shadow-xs">
                      View Package
                      <ChevronRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="pt-8 text-center">
          <Link
            href="/destinations"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-stone-900 hover:bg-stone-800 text-stone-50 text-sm font-semibold transition-all shadow-sm"
          >
            <span>View All {tours.length} Bangladesh Tour Packages</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* 4. Travel Advisory Snapshot */}
      <section className="w-full max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-14 2xl:px-20">
        <div className="bg-white border border-[#EBE6DC] rounded-3xl p-8 sm:p-12 space-y-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#F0EBE1] pb-6">
            <div className="space-y-1">
              <span className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-amber-800">
                Practical Travel Guidance
              </span>
              <h2 className="text-2xl sm:text-4xl font-serif font-bold text-stone-900 tracking-tight">
                Essential Road &amp; Route Notes
              </h2>
            </div>
            <Link
              href="/tips"
              className="text-sm font-semibold text-stone-800 hover:text-stone-950 flex items-center gap-1.5 transition-colors"
            >
              <span>View Full Handbook</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div className="p-6 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5] space-y-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800 block">Hill Tracts</span>
              <h4 className="text-lg font-serif font-bold text-stone-900">Army Convoy at Dighinala</h4>
              <p className="text-stone-600 leading-relaxed text-sm">
                Vehicles to Sajek Valley depart strictly under military escort at 10:30 AM and 3:30 PM. Arrive at least 45 minutes prior for manifest registration.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5] space-y-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800 block">Haor Wetlands</span>
              <h4 className="text-lg font-serif font-bold text-stone-900">Monsoon Safety in Sunamganj</h4>
              <p className="text-stone-600 leading-relaxed text-sm">
                Open haor waters experience sudden weather shifts. Always inspect certified lifejackets before leaving Tahirpur Ghat.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5] space-y-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800 block">Security Checkposts</span>
              <h4 className="text-lg font-serif font-bold text-stone-900">National ID Photocopies</h4>
              <p className="text-stone-600 leading-relaxed text-sm">
                Carry 4 to 6 physical photocopies of your NID or Passport for security checkposts in Thanchi, Ruma, and Sajek Valley.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Live Community Stories Feed on Home */}
      {(loading || recentStories.length > 0) && (
        <section className="w-full max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-14 2xl:px-20 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#EBE6DC] pb-6">
            <div className="space-y-1">
              <span className="text-xs sm:text-sm font-semibold tracking-widest uppercase text-amber-800">
                Community Journal
              </span>
              <h2 className="text-2xl sm:text-4xl font-serif font-bold text-stone-900 tracking-tight">
                Stories from Fellow Travelers
              </h2>
            </div>
            <Link
              href="/community"
              className="text-sm font-semibold text-stone-800 hover:text-stone-950 flex items-center gap-1.5 transition-colors"
            >
              <span>Explore All Community Stories</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {loading ? (
              <>
                <StoryCardSkeleton />
                <StoryCardSkeleton />
                <StoryCardSkeleton />
              </>
            ) : (
              recentStories.map((story) => (
                <Link
                  key={story.id}
                  href={`/community/${story.id}`}
                  className="group bg-white border border-[#EBE6DC] rounded-3xl overflow-hidden hover:border-[#C4BAA9] hover-lift transition-smooth p-6 sm:p-7 flex flex-col justify-between space-y-4 shadow-xs"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs sm:text-sm text-stone-500">
                      <span className="font-semibold text-stone-900 px-3 py-1 rounded-full bg-[#FAF8F5] border border-stone-200">{story.category}</span>
                      <span className="font-medium text-stone-600">{story.division}</span>
                    </div>
                    <h4 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 group-hover:text-amber-800 line-clamp-2 transition-colors leading-snug">
                      {story.title}
                    </h4>
                    <p className="text-sm text-stone-600 line-clamp-3 leading-relaxed">
                      {story.summary}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#F0EBE1] flex items-center justify-between text-xs sm:text-sm text-stone-500">
                    <span className="font-semibold text-stone-800">By {story.authorName}</span>
                    <span className="flex items-center gap-1.5 text-stone-600">
                      <MessageSquare className="h-4 w-4" />
                      <span>{story.commentCount ?? 0} comments</span>
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>
      )}
    </div>
  );
}
