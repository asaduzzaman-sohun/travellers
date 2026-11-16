"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Star,
  MapPin,
  Check,
  X,
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Building2
} from "lucide-react";
import ImageWithFallback from "@/components/ImageWithFallback";
import { HOTELS_DATA } from "@/lib/hotels-data";

export default function HotelsReviewPage() {
  const [selectedPlace, setSelectedPlace] = useState("All");
  const [selectedTier, setSelectedTier] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"rating" | "reviews" | "price-asc" | "price-desc">("rating");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const hotels = HOTELS_DATA;

  const places = useMemo(() => {
    const list = Array.from(new Set(HOTELS_DATA.map((h) => h.place)));
    return ["All", ...list];
  }, []);

  const priceTiers = ["All", "Eco/Budget", "Mid-Range", "Luxury"];

  // Filter and Sort
  const filteredHotels = useMemo(() => {
    let result = hotels.filter((h) => {
      const matchPlace = selectedPlace === "All" || h.place === selectedPlace;
      const matchTier = selectedTier === "All" || h.tier === selectedTier;
      const matchSearch =
        !searchQuery ||
        h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.pros.some((p) => p.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchPlace && matchTier && matchSearch;
    });

    if (sortBy === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "reviews") {
      result.sort((a, b) => b.reviewsCount - a.reviewsCount);
    } else if (sortBy === "price-asc") {
      result.sort((a, b) => a.priceNumeric - b.priceNumeric);
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => b.priceNumeric - a.priceNumeric);
    }

    return result;
  }, [hotels, selectedPlace, selectedTier, searchQuery, sortBy]);

  // Reset page when filter changes
  const handleFilterChange = (setter: any, value: any) => {
    setter(value);
    setCurrentPage(1);
  };

  // Pagination Slice
  const totalPages = Math.ceil(filteredHotels.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedHotels = filteredHotels.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] pb-24">
      {/* Header Banner */}
      <section className="border-b border-[#EBE6DC] bg-[#FAF8F5] py-14 sm:py-16">
        <div className="w-full max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-14 2xl:px-20 space-y-4">
          <span className="text-xs sm:text-sm font-semibold tracking-widest uppercase text-amber-800">
            Independent Domestic Traveler Reviews
          </span>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-stone-900 tracking-tight">
            Resorts &amp; Eco-Cottages in Bangladesh
          </h1>
          <p className="text-base sm:text-lg text-stone-600 max-w-3xl leading-relaxed">
            Honest, verified assessments of domestic accommodations. We evaluate real road conditions, water pressure, generator availability, authentic pros and cons, and realistic BDT rates.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="w-full max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-14 2xl:px-20 mt-10 space-y-10">
        {/* Controls Card */}
        <div className="bg-white dark:bg-[#141720] border border-[#EBE6DC] dark:border-[#1e2434] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
          {/* Search & Sort Controls */}
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400 dark:text-stone-500" />
              <input
                type="text"
                placeholder="Search resort by name, location or amenity (e.g. Sayeman, Sairu, infinity pool, tea estate)..."
                value={searchQuery}
                onChange={(e) => handleFilterChange(setSearchQuery, e.target.value)}
                className="w-full bg-[#FAF8F5] dark:bg-[#10131c] border border-[#E5DFD5] dark:border-[#262d3d] rounded-2xl pl-12 pr-10 py-3.5 text-sm sm:text-base text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:bg-white dark:focus:bg-[#10131c] focus:outline-none focus:border-emerald-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => handleFilterChange(setSearchQuery, "")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 p-1 cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Price Tier */}
              <div className="flex items-center gap-2 bg-[#FAF8F5] dark:bg-[#10131c] border border-[#E5DFD5] dark:border-[#262d3d] rounded-2xl px-4 py-2.5">
                <Building2 className="h-4 w-4 text-stone-500 dark:text-stone-400 shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-stone-500 dark:text-stone-400">Tier:</span>
                <select
                  value={selectedTier}
                  onChange={(e) => handleFilterChange(setSelectedTier, e.target.value)}
                  className="bg-transparent text-xs sm:text-sm font-semibold text-stone-900 dark:text-stone-100 focus:outline-none cursor-pointer"
                >
                  {priceTiers.map((t) => (
                    <option key={t} value={t} className="bg-white dark:bg-[#10131c] text-stone-900 dark:text-stone-100">
                      {t === "All" ? "All Price Tiers" : t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2 bg-[#FAF8F5] dark:bg-[#10131c] border border-[#E5DFD5] dark:border-[#262d3d] rounded-2xl px-4 py-2.5">
                <ArrowUpDown className="h-4 w-4 text-stone-500 dark:text-stone-400 shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-stone-500 dark:text-stone-400">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent text-xs sm:text-sm font-semibold text-stone-900 dark:text-stone-100 focus:outline-none cursor-pointer"
                >
                  <option value="rating" className="bg-white dark:bg-[#10131c] text-stone-900 dark:text-stone-100">Highest Rated</option>
                  <option value="reviews" className="bg-white dark:bg-[#10131c] text-stone-900 dark:text-stone-100">Most Reviewed</option>
                  <option value="price-asc" className="bg-white dark:bg-[#10131c] text-stone-900 dark:text-stone-100">Price: Low to High</option>
                  <option value="price-desc" className="bg-white dark:bg-[#10131c] text-stone-900 dark:text-stone-100">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Location Tabs */}
          <div className="pt-2 border-t border-[#F0EBE1] dark:border-[#1e2434] flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {places.map((place) => {
              const active = selectedPlace === place;
              return (
                <button
                  key={place}
                  onClick={() => handleFilterChange(setSelectedPlace, place)}
                  className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    active
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-[#FAF8F5] dark:bg-[#10131c] text-stone-700 dark:text-stone-300 border border-[#E5DFD5] dark:border-[#262d3d] hover:bg-stone-100 dark:hover:bg-[#181d2a] hover:text-stone-900 dark:hover:text-white"
                  }`}
                >
                  {place === "All" ? "All Locations" : place}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Count & Badges */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1 text-sm text-stone-600">
          <div className="flex items-center gap-2">
            <span>
              Showing <strong className="text-stone-900 font-bold">{filteredHotels.length}</strong> verified resorts &amp; cottages
            </span>
            {(searchQuery || selectedPlace !== "All" || selectedTier !== "All") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedPlace("All");
                  setSelectedTier("All");
                  setSortBy("rating");
                }}
                className="text-xs text-amber-800 underline font-medium hover:text-stone-900 ml-2"
              >
                Reset filters
              </button>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-stone-500">
            <ShieldCheck className="h-4 w-4 text-emerald-700 shrink-0" />
            <span>Reviewed by genuine Bangladeshi travelers</span>
          </div>
        </div>

        {/* Hotel Cards List */}
        {filteredHotels.length === 0 ? (
          <div className="py-24 text-center bg-white rounded-3xl border border-[#EBE6DC] p-10 space-y-4 shadow-sm max-w-xl mx-auto">
            <h3 className="text-xl font-serif font-bold text-stone-900">No properties match your filter</h3>
            <p className="text-sm text-stone-600 leading-relaxed">
              We couldn&apos;t find any hotels matching your current location or search term. Try expanding your location or clearing filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedPlace("All");
                setSelectedTier("All");
              }}
              className="px-6 py-2.5 rounded-full bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-500 transition-colors shadow-xs cursor-pointer"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {paginatedHotels.map((hotel) => (
              <div
                key={hotel.id}
                className="bg-white dark:bg-[#141720] border border-[#EBE6DC] dark:border-[#1e2434] rounded-3xl overflow-hidden shadow-xs hover:border-emerald-500/40 dark:hover:border-emerald-500/40 hover-lift transition-smooth flex flex-col lg:flex-row"
              >
                {/* Image Box */}
                <div className="lg:w-2/5 min-h-[260px] lg:min-h-full relative bg-stone-100 dark:bg-stone-900 shrink-0 group">
                  <Link href={`/hotels/${hotel.id}`} className="block w-full h-full">
                    <ImageWithFallback
                      src={hotel.coverImage}
                      fallbackSrc="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80"
                      alt={hotel.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>
                  <div className="absolute top-4 left-4">
                    <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-stone-900/80 backdrop-blur-md text-stone-100 border border-white/20 shadow-sm flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                      {hotel.place}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-stone-900/80 backdrop-blur-sm text-stone-100 border border-white/20 shadow-xs">
                      {hotel.tier}
                    </span>
                  </div>
                </div>

                {/* Content Box */}
                <div className="p-6 sm:p-8 lg:p-10 flex-1 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <Link href={`/hotels/${hotel.id}`} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                        <h3 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                          {hotel.name}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-500/30 text-amber-900 dark:text-amber-300 text-xs sm:text-sm font-bold">
                        <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                        <span>{(hotel.rating ?? 4.8).toFixed(1)}</span>
                        <span className="text-stone-400 dark:text-stone-400 font-normal">({hotel.reviewsCount ?? 120} verified reviews)</span>
                      </div>
                    </div>

                    <div className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-amber-800 dark:text-amber-400 shrink-0" />
                      <span>{hotel.location}</span>
                    </div>

                    <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 leading-relaxed">
                      {hotel.description}
                    </p>

                    {/* Pros & Cons Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div className="bg-[#FAF8F5] dark:bg-[#10131c] border border-emerald-500/30 dark:border-emerald-500/40 rounded-2xl p-4 sm:p-5 space-y-2.5">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                          <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> What Guests Loved
                        </span>
                        <ul className="space-y-2 text-xs sm:text-sm text-stone-700 dark:text-stone-300">
                          {hotel.pros.map((p, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-emerald-700 dark:text-emerald-400 font-bold shrink-0">•</span>
                              <span>{p}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-[#FAF8F5] dark:bg-[#10131c] border border-stone-200 dark:border-[#262d3d] rounded-2xl p-4 sm:p-5 space-y-2.5">
                        <span className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                          <X className="h-4 w-4 text-rose-500" /> Things to Keep in Mind
                        </span>
                        <ul className="space-y-2 text-xs sm:text-sm text-stone-700 dark:text-stone-300">
                          {hotel.cons.map((c, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-stone-400 dark:text-stone-500 font-bold shrink-0">•</span>
                              <span>{c}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Price & Action Button */}
                  <div className="pt-4 border-t border-[#F0EBE1] dark:border-[#1e2434] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-stone-500 dark:text-stone-400 text-xs uppercase font-semibold tracking-wider">Typical Nightly Rate</span>
                      <div className="text-xl sm:text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">{hotel.pricePerNight}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/hotels/${hotel.id}`}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold transition-all shadow-xs group cursor-pointer"
                      >
                        <span>View Property Details & Tariff</span>
                        <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#EBE6DC] dark:border-[#1e2434]">
            <span className="text-xs sm:text-sm text-stone-600 dark:text-stone-400">
              Showing <strong className="text-stone-900 dark:text-stone-100 font-bold">{startIndex + 1}</strong> to{" "}
              <strong className="text-stone-900 dark:text-stone-100 font-bold">
                {Math.min(startIndex + itemsPerPage, filteredHotels.length)}
              </strong>{" "}
              of <strong className="text-stone-900 dark:text-stone-100 font-bold">{filteredHotels.length}</strong> properties
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#141720] border border-[#E5DFD5] dark:border-[#262d3d] text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-[#1c2232] disabled:opacity-40 disabled:pointer-events-none transition-colors flex items-center gap-1 text-xs sm:text-sm font-medium cursor-pointer shadow-2xs"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`h-9 w-9 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    currentPage === pageNum
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-white dark:bg-[#141720] border border-[#E5DFD5] dark:border-[#262d3d] text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-[#1c2232] shadow-2xs"
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#141720] border border-[#E5DFD5] dark:border-[#262d3d] text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-[#1c2232] disabled:opacity-40 disabled:pointer-events-none transition-colors flex items-center gap-1 text-xs sm:text-sm font-medium cursor-pointer shadow-2xs"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
