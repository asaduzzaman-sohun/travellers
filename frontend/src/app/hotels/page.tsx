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
        <div className="bg-white border border-[#EBE6DC] rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          {/* Search & Sort Controls */}
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
              <input
                type="text"
                placeholder="Search resort by name, location or amenity (e.g. Sayeman, Sairu, infinity pool, tea estate)..."
                value={searchQuery}
                onChange={(e) => handleFilterChange(setSearchQuery, e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#E5DFD5] rounded-2xl pl-12 pr-10 py-3.5 text-sm sm:text-base text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:border-stone-900 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => handleFilterChange(setSearchQuery, "")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Price Tier */}
              <div className="flex items-center gap-2 bg-[#FAF8F5] border border-[#E5DFD5] rounded-2xl px-4 py-2.5">
                <Building2 className="h-4 w-4 text-stone-500 shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-stone-500">Tier:</span>
                <select
                  value={selectedTier}
                  onChange={(e) => handleFilterChange(setSelectedTier, e.target.value)}
                  className="bg-transparent text-xs sm:text-sm font-semibold text-stone-900 focus:outline-none cursor-pointer"
                >
                  {priceTiers.map((t) => (
                    <option key={t} value={t}>
                      {t === "All" ? "All Price Tiers" : t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2 bg-[#FAF8F5] border border-[#E5DFD5] rounded-2xl px-4 py-2.5">
                <ArrowUpDown className="h-4 w-4 text-stone-500 shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-stone-500">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent text-xs sm:text-sm font-semibold text-stone-900 focus:outline-none cursor-pointer"
                >
                  <option value="rating">Highest Rated</option>
                  <option value="reviews">Most Reviewed</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Location Tabs */}
          <div className="pt-2 border-t border-[#F0EBE1] flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {places.map((place) => {
              const active = selectedPlace === place;
              return (
                <button
                  key={place}
                  onClick={() => handleFilterChange(setSelectedPlace, place)}
                  className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                    active
                      ? "bg-stone-900 text-stone-50 shadow-xs"
                      : "bg-[#FAF8F5] text-stone-700 border border-[#E5DFD5] hover:bg-stone-100 hover:text-stone-900"
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
              className="px-6 py-2.5 rounded-full bg-stone-900 text-stone-50 text-sm font-semibold hover:bg-stone-800 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {paginatedHotels.map((hotel) => (
              <div
                key={hotel.id}
                className="bg-white border border-[#EBE6DC] rounded-3xl overflow-hidden shadow-xs hover:border-[#C4BAA9] hover-lift transition-smooth flex flex-col lg:flex-row"
              >
                {/* Image Box */}
                <div className="lg:w-2/5 min-h-[260px] lg:min-h-full relative bg-stone-100 shrink-0 group">
                  <Link href={`/hotels/${hotel.id}`} className="block w-full h-full">
                    <ImageWithFallback
                      src={hotel.coverImage}
                      fallbackSrc="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80"
                      alt={hotel.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>
                  <div className="absolute top-4 left-4">
                    <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/95 backdrop-blur-md text-stone-900 border border-stone-200/60 shadow-sm flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-amber-700" />
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
                      <Link href={`/hotels/${hotel.id}`} className="hover:text-amber-800 transition-colors">
                        <h3 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 hover:text-amber-800 transition-colors">
                          {hotel.name}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200/80 text-amber-900 text-xs sm:text-sm font-bold">
                        <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                        <span>{(hotel.rating ?? 4.8).toFixed(1)}</span>
                        <span className="text-stone-400 font-normal">({hotel.reviewsCount ?? 120} verified reviews)</span>
                      </div>
                    </div>

                    <div className="text-xs sm:text-sm text-stone-500 flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-amber-800 shrink-0" />
                      <span>{hotel.location}</span>
                    </div>

                    <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
                      {hotel.description}
                    </p>

                    {/* Pros & Cons Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div className="bg-[#FAF8F5] border border-emerald-200/60 rounded-2xl p-4 sm:p-5 space-y-2.5">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                          <Check className="h-4 w-4 text-emerald-600" /> What Guests Loved
                        </span>
                        <ul className="space-y-2 text-xs sm:text-sm text-stone-700">
                          {hotel.pros.map((p, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-emerald-700 font-bold shrink-0">•</span>
                              <span>{p}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-[#FAF8F5] border border-stone-200 rounded-2xl p-4 sm:p-5 space-y-2.5">
                        <span className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                          <X className="h-4 w-4 text-rose-500" /> Things to Keep in Mind
                        </span>
                        <ul className="space-y-2 text-xs sm:text-sm text-stone-700">
                          {hotel.cons.map((c, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-stone-400 font-bold shrink-0">•</span>
                              <span>{c}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Price & Action Button */}
                  <div className="pt-4 border-t border-[#F0EBE1] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-stone-500 text-xs uppercase font-semibold tracking-wider">Typical Nightly Rate</span>
                      <div className="text-xl sm:text-2xl font-serif font-bold text-stone-900">{hotel.pricePerNight}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/hotels/${hotel.id}`}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-stone-900 text-stone-50 text-xs sm:text-sm font-semibold hover:bg-stone-800 transition-all shadow-sm group"
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
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#EBE6DC]">
            <span className="text-xs sm:text-sm text-stone-600">
              Showing <strong className="text-stone-900 font-bold">{startIndex + 1}</strong> to{" "}
              <strong className="text-stone-900 font-bold">
                {Math.min(startIndex + itemsPerPage, filteredHotels.length)}
              </strong>{" "}
              of <strong className="text-stone-900 font-bold">{filteredHotels.length}</strong> properties
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3.5 py-2 rounded-xl bg-white border border-[#E5DFD5] text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:pointer-events-none transition-colors flex items-center gap-1 text-xs sm:text-sm font-medium"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`h-9 w-9 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    currentPage === pageNum
                      ? "bg-stone-900 text-stone-50 shadow-xs"
                      : "bg-white border border-[#E5DFD5] text-stone-700 hover:bg-stone-50"
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3.5 py-2 rounded-xl bg-white border border-[#E5DFD5] text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:pointer-events-none transition-colors flex items-center gap-1 text-xs sm:text-sm font-medium"
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
