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
  Filter,
  X
} from "lucide-react";
import { TourSummary, API_BASE } from "@/lib/api";

function DestinationsContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";

  const [tours, setTours] = useState<TourSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedDivision, setSelectedDivision] = useState("All");

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

  const divisions = ["All", "Chittagong Division", "Sylhet Division", "Khulna Division"];

  const filtered = useMemo(() => {
    return tours.filter((t) => {
      const matchSearch =
        !searchQuery ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.destination.toLowerCase().includes(searchQuery.toLowerCase());
      const matchDiv = selectedDivision === "All" || t.region === selectedDivision;
      return matchSearch && matchDiv;
    });
  }, [tours, searchQuery, selectedDivision]);

  return (
    <div className="space-y-8">
      {/* Search and Filters */}
      <div className="bg-[#0b1120] border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by destination or spot (e.g. Sajek, Inani, Niladri)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-3 text-slate-500 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 text-xs">
            {divisions.map((div) => (
              <button
                key={div}
                onClick={() => setSelectedDivision(div)}
                className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap ${
                  selectedDivision === div
                    ? "bg-teal-600 text-white font-semibold"
                    : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-white"
                }`}
              >
                {div === "All" ? "All Divisions" : div.replace(" Division", "")}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Counter */}
      <div className="text-xs text-slate-400">
        Showing <strong className="text-white">{filtered.length}</strong> destinations across Bangladesh
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-500 text-xs">Loading destinations...</div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-slate-500 bg-slate-900/30 rounded-2xl border border-slate-800 text-xs">
          No destinations matching your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((t) => (
            <Link
              key={t.id}
              href={`/tours/${t.slug}`}
              className="group bg-[#0b1120] border border-slate-800 rounded-2xl overflow-hidden hover:border-teal-500/40 hover:shadow-lg transition-all flex flex-col"
            >
              <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                <img
                  src={t.coverImageUrl}
                  alt={t.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-slate-950/80 px-2.5 py-1 rounded-lg text-[11px] font-medium text-white border border-slate-800 flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-teal-400" />
                  {t.destination}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-sky-400" />
                      {t.durationDays} Days / {t.durationNights} Nights
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-400">Max {t.maxGroupSize} Guests</span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-teal-300 transition-colors line-clamp-1">
                    {t.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {t.summary}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Budget From</span>
                    <div className="text-base font-bold text-white">
                      ৳{(t.discountPrice ?? t.basePrice).toLocaleString()}
                    </div>
                  </div>

                  <span className="px-3 py-1.5 rounded-xl bg-teal-600 text-white text-xs font-semibold flex items-center gap-1">
                    View Guide
                    <ChevronRight className="h-3 w-3" />
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

export default function DestinationsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div>
        <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">
          Explore Bangladesh
        </span>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white mt-1">
          Destinations Across Bangladesh
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
          Complete travel guides, local transportation instructions, safe resorts, and recommended days for each natural destination.
        </p>
      </div>

      <Suspense fallback={<div className="py-20 text-center text-slate-500 text-xs">Loading...</div>}>
        <DestinationsContent />
      </Suspense>
    </div>
  );
}
