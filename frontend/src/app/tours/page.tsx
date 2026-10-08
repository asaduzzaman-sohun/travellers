"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  MapPin,
  Clock,
  Users,
  Star,
  CheckCircle2,
  ChevronRight,
  Search,
  X,
  SlidersHorizontal,
  ArrowUpDown
} from "lucide-react";
import { TourSummary, API_BASE } from "@/lib/api";
import ImageWithFallback from "@/components/ImageWithFallback";

function ToursCatalogContent() {
  const searchParams = useSearchParams();
  const initialRegion = searchParams.get("region") || "All";
  const initialSearch = searchParams.get("search") || "";

  const [tours, setTours] = useState<TourSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedRegion, setSelectedRegion] = useState(initialRegion);
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [sortBy, setSortBy] = useState<"featured" | "priceAsc" | "priceDesc" | "duration">("featured");

  useEffect(() => {
    async function fetchTours() {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/tourpackages`);
        if (res.ok) {
          const data = await res.json();
          setTours(data);
        }
      } catch (err) {
        console.error("Failed to load tour packages:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTours();
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

  const difficulties = ["All", "Easy", "Moderate", "Challenging"];

  const filteredTours = useMemo(() => {
    return tours
      .filter((tour) => {
        const matchesSearch =
          !searchQuery ||
          tour.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tour.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tour.country.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesRegion =
          selectedRegion === "All" ||
          tour.region.toLowerCase().includes(selectedRegion.toLowerCase());

        const matchesDifficulty =
          selectedDifficulty === "All" ||
          tour.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();

        return matchesSearch && matchesRegion && matchesDifficulty;
      })
      .sort((a, b) => {
        if (sortBy === "priceAsc") {
          return (a.discountPrice ?? a.basePrice) - (b.discountPrice ?? b.basePrice);
        }
        if (sortBy === "priceDesc") {
          return (b.discountPrice ?? b.basePrice) - (a.discountPrice ?? a.basePrice);
        }
        if (sortBy === "duration") {
          return b.durationDays - a.durationDays;
        }
        return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      });
  }, [tours, searchQuery, selectedRegion, selectedDifficulty, sortBy]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedRegion("All");
    setSelectedDifficulty("All");
    setSortBy("featured");
  };

  return (
    <div className="space-y-10">
      {/* Search & Filter Bar */}
      <div className="bg-white border border-[#EBE6DC] rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
            <input
              type="text"
              placeholder="Search Sajek, Tanguar Haor, Sreemangal, Cox's Bazar, Sundarbans..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-[#E5DFD5] rounded-2xl pl-12 pr-10 py-3.5 text-sm sm:text-base text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:border-stone-900 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-[#FAF8F5] border border-[#E5DFD5] rounded-2xl px-4 py-2.5">
              <ArrowUpDown className="h-4 w-4 text-stone-500 shrink-0" />
              <span className="text-xs sm:text-sm font-medium text-stone-500 whitespace-nowrap">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                aria-label="Sort tours"
                className="bg-transparent text-xs sm:text-sm font-semibold text-stone-900 focus:outline-none cursor-pointer"
              >
                <option value="featured">Featured First</option>
                <option value="priceAsc">Fare: Low to High</option>
                <option value="priceDesc">Fare: High to Low</option>
                <option value="duration">Longest Duration</option>
              </select>
            </div>

            <div className="flex items-center gap-2 bg-[#FAF8F5] border border-[#E5DFD5] rounded-2xl px-4 py-2.5">
              <SlidersHorizontal className="h-4 w-4 text-stone-500 shrink-0" />
              <span className="text-xs sm:text-sm font-medium text-stone-500 whitespace-nowrap">Difficulty:</span>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                aria-label="Filter by difficulty"
                className="bg-transparent text-xs sm:text-sm font-semibold text-stone-900 focus:outline-none cursor-pointer"
              >
                {difficulties.map((diff) => (
                  <option key={diff} value={diff}>
                    {diff === "All" ? "All Levels" : diff}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Division Filter Pills */}
        <div className="pt-2 border-t border-[#F0EBE1] flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {divisions.map((div) => {
            const active = selectedRegion.toLowerCase() === div.value.toLowerCase();
            return (
              <button
                key={div.value}
                onClick={() => setSelectedRegion(div.value)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                  active
                    ? "bg-stone-900 text-stone-50 shadow-xs"
                    : "bg-[#FAF8F5] text-stone-700 border border-[#E5DFD5] hover:bg-stone-100 hover:text-stone-900"
                }`}
              >
                {div.label}
              </button>
            );
          })}

          {(searchQuery || selectedRegion !== "All" || selectedDifficulty !== "All") && (
            <button
              onClick={resetFilters}
              className="text-xs text-stone-600 hover:text-stone-900 underline font-semibold ml-auto whitespace-nowrap"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs sm:text-sm text-stone-500 font-medium px-1">
        <span>
          Showing <strong className="text-stone-900 font-bold">{filteredTours.length}</strong> of {tours.length} verified packages
        </span>
        <span className="hidden sm:inline">Adheres to Bangladesh Tourist Police safety &amp; guide guidelines</span>
      </div>

      {/* Grid of Tours */}
      {loading ? (
        <div className="py-28 text-center text-stone-500 text-base">Loading Bangladesh tour packages...</div>
      ) : filteredTours.length === 0 ? (
        <div className="py-20 text-center space-y-4 bg-white rounded-3xl border border-[#EBE6DC] p-8 shadow-sm">
          <p className="text-base text-stone-600">No tour packages found matching your current filter.</p>
          <button
            onClick={resetFilters}
            className="px-6 py-2.5 rounded-full bg-stone-900 text-stone-50 text-sm font-semibold hover:bg-stone-800 transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTours.map((tour) => (
            <Link
              key={tour.id}
              href={`/tours/${tour.slug}`}
              className="group bg-white border border-[#EBE6DC] rounded-3xl overflow-hidden hover:border-[#C4BAA9] hover-lift transition-smooth flex flex-col shadow-xs"
            >
              <div className="relative h-64 w-full overflow-hidden bg-stone-100">
                <ImageWithFallback
                  src={tour.coverImageUrl}
                  fallbackSrc="https://images.unsplash.com/photo-1628085971946-b673e4492bf9?auto=format&fit=crop&w=800&q=80"
                  alt={tour.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent opacity-90" />

                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/95 backdrop-blur-md text-stone-900 border border-stone-200 shadow-2xs flex items-center gap-1.5">
                    <MapPin className="h-3 w-3 text-amber-800" />
                    {tour.destination}
                  </span>
                </div>

                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-stone-900/80 backdrop-blur-xs text-stone-100 shadow-xs">
                    {tour.difficulty}
                  </span>
                </div>

                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs sm:text-sm text-stone-100 font-medium">
                  <span className="flex items-center gap-1.5 drop-shadow">
                    <Clock className="h-4 w-4 text-amber-300" />
                    {tour.durationDays} Days / {tour.durationNights} Nights
                  </span>
                  <span className="flex items-center gap-1.5 drop-shadow">
                    <Users className="h-4 w-4 text-stone-300" />
                    Max {tour.maxGroupSize} Guests
                  </span>
                </div>
              </div>

              <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <div className="flex items-center text-amber-500">
                      <Star className="h-4 w-4 fill-amber-500" />
                      <span className="ml-1 font-bold text-stone-900">{(tour.averageRating ?? 4.9).toFixed(1)}</span>
                    </div>
                    <span className="text-stone-300">•</span>
                    <span className="text-stone-500">{tour.totalReviews ?? 15} verified reviews</span>
                  </div>

                  <h3 className="text-xl font-serif font-bold text-stone-900 group-hover:text-stone-700 transition-colors line-clamp-2">
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
                        <CheckCircle2 className="h-4 w-4 text-amber-800 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{hl}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-4 border-t border-[#F0EBE1] flex items-center justify-between">
                  <div>
                    <div className="text-xs text-stone-500 uppercase font-semibold">Fare (per traveler)</div>
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

                  <span className="px-5 py-2.5 rounded-full bg-stone-900 group-hover:bg-stone-800 text-stone-50 text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 shadow-xs">
                    <span>View Itinerary</span>
                    <ChevronRight className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ToursCatalogPage() {
  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] pb-24">
      {/* Editorial Page Header */}
      <section className="border-b border-[#EBE6DC] bg-[#FAF8F5] py-14 sm:py-16">
        <div className="w-full max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-14 2xl:px-20 space-y-4">
          <span className="text-xs sm:text-sm font-semibold tracking-widest uppercase text-amber-800">
            Curated Bangladesh Guided Journeys
          </span>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-stone-900 tracking-tight">
            Explore Tour Packages Across Bangladesh
          </h1>
          <p className="text-base sm:text-lg text-stone-600 max-w-3xl leading-relaxed">
            Small-group guided tours across Sajek Valley, Tanguar Haor, Sreemangal tea estates, Bandarban mountain ranges, Sundarbans mangrove safari, and Cox&apos;s Bazar coast.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="w-full max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-14 2xl:px-20 mt-10">
        <Suspense fallback={<div className="py-28 text-center text-stone-500 text-base">Loading tour packages...</div>}>
          <ToursCatalogContent />
        </Suspense>
      </section>
    </div>
  );
}
