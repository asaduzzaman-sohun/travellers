"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, MapPin, Sparkles, ArrowRight, X, Star } from "lucide-react";
import { TourSummary } from "@/lib/api";
import ImageWithFallback from "@/components/ImageWithFallback";

interface LiveOmnibarSearchProps {
  tours?: TourSummary[];
  placeholder?: string;
}

const POPULAR_CIRCUITS = [
  { name: "Sajek Valley", region: "Chittagong", tag: "Cloud Haven" },
  { name: "Tanguar Haor", region: "Sylhet", tag: "Houseboat" },
  { name: "Sreemangal", region: "Sylhet", tag: "Tea Trails" },
  { name: "Sundarbans", region: "Khulna", tag: "Mangrove Safari" },
  { name: "Bandarban", region: "Chittagong", tag: "Mountain Peak" },
  { name: "Cox's Bazar", region: "Chittagong", tag: "Serene Coast" },
];

export default function LiveOmnibarSearch({
  tours = [],
  placeholder = "Search Sajek, Tanguar Haor, Sreemangal, Sundarbans...",
}: LiveOmnibarSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter tour suggestions based on query
  const suggestions = query.trim()
    ? tours
        .filter((t) => {
          const q = query.toLowerCase();
          return (
            t.title.toLowerCase().includes(q) ||
            t.destination.toLowerCase().includes(q) ||
            t.region.toLowerCase().includes(q)
          );
        })
        .slice(0, 4)
    : [];

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsOpen(false);
    if (query.trim()) {
      router.push(`/destinations?search=${encodeURIComponent(query.trim())}`);
    } else {
      router.push("/destinations");
    }
  };

  const handleSelectCircuit = (circuitName: string) => {
    setQuery(circuitName);
    setIsOpen(false);
    router.push(`/destinations?search=${encodeURIComponent(circuitName)}`);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Search Input Bar */}
      <form
        onSubmit={handleSearchSubmit}
        className="bg-white border border-[#E5DFD5] focus-within:border-stone-900 rounded-full p-2 sm:p-2.5 shadow-sm hover:shadow-md transition-all flex items-center gap-2 sm:gap-3"
      >
        <div className="relative flex-1 flex items-center">
          <Search className="absolute left-3.5 sm:left-4 h-4 sm:h-5 w-4 sm:w-5 text-stone-400 shrink-0" />
          <input
            type="text"
            placeholder={placeholder}
            value={query}
            onFocus={() => setIsOpen(true)}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") setIsOpen(false);
            }}
            className="w-full pl-10 sm:pl-12 pr-8 py-2.5 sm:py-3 text-xs sm:text-base text-stone-900 placeholder:text-stone-400 focus:outline-none bg-transparent"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-2 text-stone-400 hover:text-stone-700 p-1"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <button
          type="submit"
          className="px-5 sm:px-7 py-2.5 sm:py-3 rounded-full bg-stone-900 hover:bg-stone-800 text-stone-50 font-semibold text-xs sm:text-sm transition-colors flex items-center gap-1.5 sm:gap-2 shrink-0 shadow-xs"
        >
          <span>Explore</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2.5 bg-white rounded-3xl border border-[#EBE6DC] shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* 1. Quick Circuit Badges */}
          <div className="p-4 sm:p-5 border-b border-stone-100 bg-[#FAF8F5]/60">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Popular Circuits</span>
            </div>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {POPULAR_CIRCUITS.map((circuit) => (
                <button
                  key={circuit.name}
                  type="button"
                  onClick={() => handleSelectCircuit(circuit.name)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white hover:bg-stone-900 hover:text-white border border-[#E5DFD5] text-stone-700 transition-all shadow-xs"
                >
                  <MapPin className="w-3 h-3 text-amber-600" />
                  <span>{circuit.name}</span>
                  <span className="text-[10px] text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded-full group-hover:bg-stone-800">
                    {circuit.tag}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Direct Tour Matches */}
          {query.trim() && (
            <div className="p-4 sm:p-5">
              <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">
                Matching Tour Packages ({suggestions.length})
              </div>

              {suggestions.length === 0 ? (
                <div className="text-center py-6 text-sm text-stone-500">
                  No direct packages matching &ldquo;{query}&rdquo;. Press Enter to search all destinations.
                </div>
              ) : (
                <div className="space-y-2">
                  {suggestions.map((tour) => (
                    <Link
                      key={tour.id}
                      href={`/tours/${tour.slug}`}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 sm:gap-4 p-2 sm:p-2.5 rounded-2xl hover:bg-[#FAF8F5] transition-colors border border-transparent hover:border-stone-200 group"
                    >
                      <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shrink-0 bg-stone-100">
                        <ImageWithFallback
                          src={tour.coverImageUrl}
                          fallbackSrc="https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?auto=format&fit=crop&w=400&q=80"
                          alt={tour.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-stone-900 group-hover:text-amber-800 truncate">
                          {tour.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-stone-500 mt-0.5">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-amber-600" />
                            {tour.destination}
                          </span>
                          <span>•</span>
                          <span>{tour.durationDays}D / {tour.durationNights}N</span>
                          <span className="hidden sm:inline">•</span>
                          <span className="hidden sm:flex items-center gap-0.5 text-amber-700 font-semibold">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                            {(tour.averageRating ?? 4.9).toFixed(1)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0 pr-1">
                        <span className="text-xs text-stone-500 block">from</span>
                        <span className="text-sm sm:text-base font-bold text-stone-900">
                          BDT {tour.basePrice.toLocaleString()}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Footer Action */}
          <div className="p-3 sm:p-3.5 bg-stone-50 border-t border-stone-100 text-center">
            <button
              type="button"
              onClick={() => handleSearchSubmit()}
              className="text-xs sm:text-sm font-semibold text-stone-700 hover:text-stone-900 flex items-center justify-center gap-1.5 mx-auto"
            >
              <span>View all available trips &amp; packages</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
