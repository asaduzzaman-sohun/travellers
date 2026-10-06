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
          tour.region.toLowerCase() === selectedRegion.toLowerCase();

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

  const regions = ["All", "Americas", "Europe", "Asia", "Africa"];
  const categories = [
    { label: "All Styles", value: "All" },
    { label: "Mountain Trekking", value: "MountainTrekking" },
    { label: "Wildlife & Safari", value: "WildlifeAndSafari" },
    { label: "Cultural & Pilgrimage", value: "Cultural" },
    { label: "Coastal & Sailing", value: "BeachAndResort" },
    { label: "Arctic & Adventure", value: "Adventure" },
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
      {/* Filter Control Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-4">
        {/* Search & Sort Row */}
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search destinations, countries, or expeditions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-11 pr-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
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
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
              <option value="duration">Longest Duration</option>
            </select>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800/80 text-xs">
          {/* Region */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-slate-500 text-[11px] font-semibold uppercase mr-1">Region:</span>
            {regions.map((reg) => (
              <button
                key={reg}
                onClick={() => setSelectedRegion(reg)}
                className={`px-3 py-1.5 rounded-full font-medium transition-all ${
                  selectedRegion.toLowerCase() === reg.toLowerCase()
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {reg}
              </button>
            ))}
          </div>

          {/* Difficulty */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 ml-auto">
            <span className="text-slate-500 text-[11px] font-semibold uppercase mr-1">Activity:</span>
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
              className="text-[11px] text-indigo-400 hover:text-indigo-300 underline font-semibold ml-2"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
        <span>
          Showing <strong className="text-white">{filteredTours.length}</strong> of {tours.length} expeditions
        </span>
        <span className="hidden sm:inline">All expeditions include 100% Carbon Offset</span>
      </div>

      {/* Grid of Tours */}
      {loading ? (
        <div className="py-24 text-center text-slate-500">Retrieving expeditions from live database...</div>
      ) : filteredTours.length === 0 ? (
        <div className="py-20 text-center space-y-4 bg-slate-900/40 rounded-3xl border border-slate-800 p-8">
          <p className="text-sm text-slate-400">No expeditions found matching your selected filters.</p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
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
              className="group bg-slate-900/70 border border-slate-800 rounded-3xl overflow-hidden hover:border-slate-700 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col"
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
                    <MapPin className="h-3 w-3 text-indigo-400" />
                    {tour.destination}
                  </span>
                </div>

                <div className="absolute top-4 right-4">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-600/90 backdrop-blur-md text-white shadow">
                    {tour.difficulty}
                  </span>
                </div>

                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-slate-300 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-indigo-400" />
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
                    <span className="text-slate-400">{tour.totalReviews} reviews</span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-2">
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
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{hl}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-semibold">From (per person)</div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-white">
                        ${(tour.discountPrice ?? tour.basePrice).toLocaleString()}
                      </span>
                      {tour.discountPrice && (
                        <span className="text-xs text-slate-500 line-through">
                          ${tour.basePrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="px-4 py-2 rounded-xl bg-indigo-600 group-hover:bg-indigo-500 text-white text-xs font-bold transition-colors flex items-center gap-1 shadow-md shadow-indigo-600/20">
                    Details
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
      {/* Page Header */}
      <div className="space-y-3">
        <div className="text-xs font-bold uppercase tracking-widest text-indigo-400">
          Small-Group Journeys
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          All 2026 / 2027 Expeditions
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
          Every journey is limited to 8-12 guests, featuring guaranteed departures, verified mountain and naturalist guides, and carefully selected boutique heritage accommodations.
        </p>
      </div>

      <Suspense fallback={<div className="py-24 text-center text-slate-500">Loading catalog...</div>}>
        <ToursCatalogContent />
      </Suspense>
    </div>
  );
}
