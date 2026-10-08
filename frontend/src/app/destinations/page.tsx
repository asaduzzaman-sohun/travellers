"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  MapPin,
  Clock,
  Users,
  Star,
  Search,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  X,
  SlidersHorizontal,
  Compass,
  ArrowUpDown
} from "lucide-react";
import { TourSummary, API_BASE } from "@/lib/api";
import ImageWithFallback from "@/components/ImageWithFallback";
import { TourCardSkeleton } from "@/components/ui/Skeletons";

function DestinationsContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const initialRegion = searchParams.get("region") || "All";

  const [tours, setTours] = useState<TourSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedDivision, setSelectedDivision] = useState(initialRegion);
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "rating">("featured");
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

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
        console.error("Failed to load destinations:", err);
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

  const difficulties = ["All", "Easy", "Moderate", "Challenging", "Difficult"];

  // Filter and Sort
  const filteredAndSorted = useMemo(() => {
    let result = tours.filter((t) => {
      const matchSearch =
        !searchQuery ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.summary && t.summary.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchDiv =
        selectedDivision === "All" ||
        t.region.toLowerCase().includes(selectedDivision.toLowerCase());

      const matchDiff =
        selectedDifficulty === "All" ||
        t.difficulty?.toString().toLowerCase() === selectedDifficulty.toLowerCase();

      return matchSearch && matchDiv && matchDiff;
    });

    // Sorting
    if (sortBy === "price-asc") {
      result.sort((a, b) => (a.discountPrice ?? a.basePrice) - (b.discountPrice ?? b.basePrice));
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => (b.discountPrice ?? b.basePrice) - (a.discountPrice ?? a.basePrice));
    } else if (sortBy === "rating") {
      result.sort((a, b) => b.averageRating - a.averageRating);
    } else {
      // featured first
      result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }

    return result;
  }, [tours, searchQuery, selectedDivision, selectedDifficulty, sortBy]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedDivision, selectedDifficulty, sortBy]);

  // Pagination Slice
  const totalPages = Math.ceil(filteredAndSorted.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTours = filteredAndSorted.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  return (
    <div className="space-y-10">
      {/* Search & Filter Controls Panel */}
      <div className="bg-white border border-[#EBE6DC] rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
        {/* Search Input & Sort */}
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
            <input
              type="text"
              placeholder="Search by destination, hill, river or forest (e.g. Sajek, Tanguar Haor, Sundarbans, Sreemangal)..."
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
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 bg-[#FAF8F5] border border-[#E5DFD5] rounded-2xl px-4 py-2.5">
              <ArrowUpDown className="h-4 w-4 text-stone-500 shrink-0" />
              <span className="text-xs sm:text-sm font-medium text-stone-500 whitespace-nowrap">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                aria-label="Sort destinations"
                className="bg-transparent text-xs sm:text-sm font-semibold text-stone-900 focus:outline-none cursor-pointer"
              >
                <option value="featured">Featured First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>

            {/* Difficulty Dropdown */}
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

        {/* Division Filter Tabs */}
        <div className="pt-2 border-t border-[#F0EBE1] flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {divisions.map((div) => {
            const active = selectedDivision === div.value;
            return (
              <button
                key={div.value}
                onClick={() => setSelectedDivision(div.value)}
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
        </div>
      </div>

      {/* Results Count & Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1 text-sm text-stone-600">
        <div className="flex items-center gap-2">
          <span>
            Showing <strong className="text-stone-900 font-bold">{filteredAndSorted.length}</strong> certified travel itineraries
          </span>
          {(searchQuery || selectedDivision !== "All" || selectedDifficulty !== "All") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedDivision("All");
                setSelectedDifficulty("All");
                setSortBy("featured");
              }}
              className="text-xs text-amber-800 underline font-medium hover:text-stone-900 ml-2"
            >
              Reset all filters
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs sm:text-sm text-stone-500">
          <Compass className="h-4 w-4 text-amber-700 shrink-0" />
          <span>Covering all 8 administrative divisions of Bangladesh</span>
        </div>
      </div>

      {/* Destinations Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <TourCardSkeleton />
          <TourCardSkeleton />
          <TourCardSkeleton />
          <TourCardSkeleton />
          <TourCardSkeleton />
          <TourCardSkeleton />
        </div>
      ) : filteredAndSorted.length === 0 ? (
        <div className="py-24 text-center bg-white rounded-3xl border border-[#EBE6DC] p-10 space-y-4 shadow-sm max-w-xl mx-auto">
          <h3 className="text-xl font-serif font-bold text-stone-900">No destinations found</h3>
          <p className="text-sm text-stone-600 leading-relaxed">
            We couldn&apos;t find any tour packages matching your search criteria. Try removing filters or searching for another region.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedDivision("All");
              setSelectedDifficulty("All");
              setSortBy("featured");
            }}
            className="px-6 py-2.5 rounded-full bg-stone-900 text-stone-50 text-sm font-semibold hover:bg-stone-800 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {paginatedTours.map((tour) => (
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

                {/* Location Badge */}
                <div className="absolute top-4 left-4">
                  <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/95 backdrop-blur-md text-stone-900 border border-stone-200/60 shadow-sm flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-amber-700" />
                    {tour.destination}
                  </span>
                </div>

                {/* Difficulty & Featured Badge */}
                <div className="absolute top-4 right-4 flex items-center gap-1.5">
                  {tour.isFeatured && (
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-600 text-white shadow-xs">
                      Featured
                    </span>
                  )}
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-stone-900/80 backdrop-blur-sm text-stone-100 border border-white/20 shadow-xs">
                    {tour.difficulty}
                  </span>
                </div>

                {/* Duration & Group Size Overlay */}
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
                  {/* Rating & Region */}
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <div className="flex items-center text-amber-600">
                      <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                      <span className="ml-1.5 font-bold text-stone-900">{(tour.averageRating ?? 4.9).toFixed(1)}</span>
                      <span className="text-stone-400 mx-1.5">•</span>
                      <span className="text-stone-500">{tour.totalReviews ?? 14} reviews</span>
                    </div>
                    <span className="text-stone-500 font-medium">{tour.region}</span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 group-hover:text-amber-800 transition-colors line-clamp-2 leading-snug">
                    {tour.title}
                  </h3>

                  {/* Summary */}
                  <p className="text-sm text-stone-600 line-clamp-2 leading-relaxed">
                    {tour.summary}
                  </p>
                </div>

                {/* Highlights */}
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

                {/* Price and CTA */}
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#EBE6DC]">
          <span className="text-xs sm:text-sm text-stone-600">
            Showing <strong className="text-stone-900 font-bold">{startIndex + 1}</strong> to{" "}
            <strong className="text-stone-900 font-bold">
              {Math.min(startIndex + itemsPerPage, filteredAndSorted.length)}
            </strong>{" "}
            of <strong className="text-stone-900 font-bold">{filteredAndSorted.length}</strong> destinations
          </span>

          <div className="flex items-center gap-1.5">
            {/* Prev Button */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3.5 py-2 rounded-xl bg-white border border-[#E5DFD5] text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:pointer-events-none transition-colors flex items-center gap-1 text-xs sm:text-sm font-medium"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>

            {/* Page Number Buttons */}
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

            {/* Next Button */}
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
  );
}

export default function DestinationsPage() {
  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] pb-24">
      {/* Editorial Page Header */}
      <section className="border-b border-[#EBE6DC] bg-[#FAF8F5] py-14 sm:py-16">
        <div className="w-full max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-14 2xl:px-20 space-y-4">
          <span className="text-xs sm:text-sm font-semibold tracking-widest uppercase text-amber-800">
            Curated Bangladesh Travel Directory
          </span>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-stone-900 tracking-tight">
            Explore Destinations Across Bangladesh
          </h1>
          <p className="text-base sm:text-lg text-stone-600 max-w-3xl leading-relaxed">
            From the misty high ridges of Sajek and Bandarban to the vast tranquil waterways of Tanguar Haor, Sundarbans mangrove corridors, and the timeless tea gardens of Sreemangal.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="w-full max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-14 2xl:px-20 mt-10">
        <Suspense fallback={<div className="py-28 text-center text-stone-500 text-base">Loading destinations directory...</div>}>
          <DestinationsContent />
        </Suspense>
      </section>
    </div>
  );
}
