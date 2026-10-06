"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Compass,
  MapPin,
  Calendar,
  Users,
  Clock,
  Star,
  CheckCircle2,
  ChevronRight,
  Filter,
  Search,
  SlidersHorizontal,
  X
} from "lucide-react";
import { TourSummary, API_BASE } from "@/lib/api";

function ToursCatalogContent() {
  const searchParams = useSearchParams();
  const initialRegion = searchParams.get("region") || "All";
  const initialSearch = searchParams.get("search") || "";

  const [tours, setTours] = useState<TourSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedRegion, setSelectedRegion] = useState(initialRegion);
  const [selectedCategory, setSelectedCategory] = useState("All");
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

        const matchesCategory =
          selectedCategory === "All" ||
          tour.category.toLowerCase() === selectedCategory.toLowerCase();

        const matchesDifficulty =
          selectedDifficulty === "All" ||
          tour.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();

        return matchesSearch && matchesRegion && matchesCategory && matchesDifficulty;
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
  }, [tours, searchQuery, selectedRegion, selectedCategory, selectedDifficulty, sortBy]);

  const regions = ["All", "Chittagong", "Sylhet", "Khulna", "Barisal", "Rajshahi"];
  const categories = [
    { label: "All Styles", value: "All" },
    { label: "Hill Tracts", value: "MountainTrekking" },
    { label: "Haor & Waterways", value: "BeachAndResort" },
    { label: "Tea Estates & Rain Forests", value: "Cultural" },
    { label: "Mangrove & Wildlife", value: "WildlifeAndSafari" },
  ];
  const difficulties = ["All", "Easy", "Moderate", "Challenging"];

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedRegion("All");
    setSelectedCategory("All");
    setSelectedDifficulty("All");
    setSortBy("featured");
  };

  return (
    <div className="space-y-8">
      {/* Search & Filter Bar */}
      <div className="bg-[#090f1d] border border-slate-800/80 rounded-3xl p-5 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search Sajek, Tanguar Haor, Sreemangal, Cox's Bazar, Sundarbans..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-11 pr-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-3.5 text-slate-500 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 shrink-0 font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-3 text-xs text-white focus:outline-none cursor-pointer"
            >
              <option value="featured">Featured First</option>
              <option value="priceAsc">Fare: Low to High</option>
              <option value="priceDesc">Fare: High to Low</option>
              <option value="duration">Longest Duration</option>
            </select>
          </div>
        </div>

        {/* Division Filter Pills */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800/80 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-slate-500 text-[11px] font-semibold uppercase mr-1">Division:</span>
            {regions.map((reg) => (
              <button
                key={reg}
                onClick={() => setSelectedRegion(reg)}
                className={`px-3 py-1.5 rounded-full font-medium transition-all ${
                  selectedRegion.toLowerCase() === reg.toLowerCase()
                    ? "bg-teal-600 text-white shadow-sm"
                    : "bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {reg}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 ml-auto">
            <span className="text-slate-500 text-[11px] font-semibold uppercase mr-1">Trek Grade:</span>
            {difficulties.map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-3 py-1.5 rounded-full font-medium transition-all ${
                  selectedDifficulty.toLowerCase() === diff.toLowerCase()
                    ? "bg-sky-600 text-white shadow-sm"
                    : "bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {diff}
              </button>
            ))}
          </div>

          {(searchQuery || selectedRegion !== "All" || selectedDifficulty !== "All" || selectedCategory !== "All") && (
            <button
              onClick={resetFilters}
              className="text-[11px] text-teal-400 hover:text-teal-300 underline font-semibold ml-2"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
        <span>
          Showing <strong className="text-white">{filteredTours.length}</strong> of {tours.length} tour packages
        </span>
        <span className="hidden sm:inline">All tours adhere to Bangladesh Tourist Police safety standards</span>
      </div>

      {/* Grid of Tours */}
      {loading ? (
        <div className="py-24 text-center text-slate-500 text-sm">Loading Bangladesh tour packages...</div>
      ) : filteredTours.length === 0 ? (
        <div className="py-20 text-center space-y-4 bg-[#090f1d] rounded-3xl border border-slate-800 p-8">
          <p className="text-sm text-slate-400">No tour packages found matching your current filter.</p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold"
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
              className="group bg-[#090f1d] border border-slate-800/80 rounded-3xl overflow-hidden hover:border-slate-700 hover:shadow-2xl transition-all duration-300 flex flex-col"
            >
              <div className="relative h-60 w-full overflow-hidden bg-slate-800">
                <img
                  src={tour.coverImageUrl}
                  alt={tour.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />

                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-950/80 backdrop-blur-md text-white border border-slate-800 flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-sky-400" />
                    {tour.destination}
                  </span>
                </div>

                <div className="absolute top-4 right-4">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-600/90 backdrop-blur-md text-white shadow">
                    {tour.difficulty}
                  </span>
                </div>

                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-slate-300 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-teal-400" />
                    {tour.durationDays} Days / {tour.durationNights} Nights
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-sky-400" />
                    Max {tour.maxGroupSize} Guests
                  </span>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="flex items-center text-amber-400">
                      <Star className="h-3.5 w-3.5 fill-amber-400" />
                      <span className="ml-1 font-bold text-white">{tour.averageRating.toFixed(1)}</span>
                    </div>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-400">{tour.totalReviews} verified reviews</span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-teal-400 transition-colors line-clamp-2">
                    {tour.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {tour.summary}
                  </p>
                </div>

                {tour.highlights && tour.highlights.length > 0 && (
                  <div className="space-y-1 border-t border-slate-800/80 pt-3">
                    {tour.highlights.slice(0, 2).map((hl, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-xs text-slate-300">
                        <CheckCircle2 className="h-3.5 w-3.5 text-teal-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{hl}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-semibold">Fare (per person)</div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-white">
                        ৳{(tour.discountPrice ?? tour.basePrice).toLocaleString()}
                      </span>
                      {tour.discountPrice && (
                        <span className="text-xs text-slate-500 line-through">
                          ৳{tour.basePrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="px-4 py-2 rounded-xl bg-teal-600 group-hover:bg-teal-500 text-white text-xs font-bold transition-colors flex items-center gap-1 shadow-md">
                    View Details
                    <ChevronRight className="h-3.5 w-3.5" />
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="space-y-3">
        <div className="text-xs font-bold uppercase tracking-widest text-teal-400">
          Domestic Guided Journeys
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          Explore Tour Packages Across Bangladesh
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
          Small-group guided tours across Sajek Valley, Tanguar Haor, Sreemangal tea estates, Bandarban mountain ranges, Sundarbans mangrove safari, and Cox's Bazar coast.
        </p>
      </div>

      <Suspense fallback={<div className="py-24 text-center text-slate-500">Loading catalog...</div>}>
        <ToursCatalogContent />
      </Suspense>
    </div>
  );
}
