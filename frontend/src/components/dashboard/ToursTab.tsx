"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, ExternalLink, Search, Copy, Compass, MapPin, Calendar, Users } from "lucide-react";
import { TourSummary } from "@/lib/api";
import { useToast } from "@/lib/toast-context";

interface ToursTabProps {
  toursList: TourSummary[];
  isTraveller: boolean;
  setCreateTourOpen: (open: boolean) => void;
}

export function ToursTab({
  toursList,
  isTraveller,
  setCreateTourOpen,
}: ToursTabProps) {
  const { toast } = useToast();
  const [tourSearch, setTourSearch] = useState("");
  const [divisionFilter, setDivisionFilter] = useState("all");

  const filteredTours = toursList.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(tourSearch.toLowerCase()) ||
      t.destination.toLowerCase().includes(tourSearch.toLowerCase()) ||
      t.region.toLowerCase().includes(tourSearch.toLowerCase());

    const matchesDivision =
      divisionFilter === "all" || t.region.toLowerCase() === divisionFilter.toLowerCase();

    return matchesSearch && matchesDivision;
  });

  const copyTourLink = (slug: string) => {
    const url = `${window.location.origin}/tours/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Tour URL Copied", url);
  };

  const getRegionBadge = (region: string) => {
    const r = region?.toLowerCase() || "";
    if (r.includes("sylhet")) {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
    if (r.includes("chittagong") || r.includes("hill tracts")) {
      return "bg-teal-50 text-teal-700 border-teal-200";
    }
    if (r.includes("khulna") || r.includes("sundarbans")) {
      return "bg-amber-50 text-amber-700 border-amber-200";
    }
    if (r.includes("barishal")) {
      return "bg-cyan-50 text-cyan-700 border-cyan-200";
    }
    return "bg-stone-100 text-stone-700 border-stone-200";
  };

  return (
    <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-lg overflow-hidden shadow-xs">
      {/* Header */}
      <div className="p-4 border-b border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAFAFA]">
        <div>
          <h3 className="text-sm font-semibold text-[#111827] flex items-center gap-2">
            <Compass className="h-4 w-4 text-stone-700" />
            <span>Domestic Expeditions Catalog</span>
          </h3>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Verified travel itineraries across hill tracts, haors, mangrove forests, and coasts.
          </p>
        </div>
        {!isTraveller && (
          <button
            onClick={() => setCreateTourOpen(true)}
            className="px-3.5 py-1.5 bg-[#111827] hover:bg-black text-white rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 self-start sm:self-auto shrink-0 shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Expedition</span>
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 border-b border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Search tours by title, region, or location..."
            value={tourSearch}
            onChange={(e) => setTourSearch(e.target.value)}
            className="w-full bg-[#FFFFFF] border border-[#D1D5DB] rounded-md pl-9 pr-3 py-1.5 text-xs text-[#111827] focus:outline-none focus:border-[#111827]"
          />
          {tourSearch && (
            <button
              type="button"
              onClick={() => setTourSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 text-[10px]"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {["all", "Chittagong", "Sylhet", "Khulna", "Barishal", "Dhaka"].map((div) => {
            const count =
              div === "all"
                ? toursList.length
                : toursList.filter((t) => t.region?.toLowerCase() === div.toLowerCase()).length;
            const isActive = divisionFilter.toLowerCase() === div.toLowerCase();

            return (
              <button
                key={div}
                onClick={() => setDivisionFilter(div)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-[#111827] text-white"
                    : "bg-white text-stone-600 hover:text-stone-900 border border-stone-200"
                }`}
              >
                {div === "all" ? "All Divisions" : div} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Tours Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-[#4B5563]">
          <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[#111827] font-semibold">
            <tr>
              <th className="py-3 px-5">Expedition Title & Location</th>
              <th className="py-3 px-5">Division</th>
              <th className="py-3 px-5">Duration</th>
              <th className="py-3 px-5">Capacity</th>
              <th className="py-3 px-5 text-right">Price / Person</th>
              <th className="py-3 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {filteredTours.map((t) => (
              <tr key={t.id} className="hover:bg-[#F9FAFB] transition-colors">
                <td className="py-3.5 px-5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-14 rounded overflow-hidden bg-stone-100 border border-stone-200 shrink-0 relative">
                      {t.coverImageUrl ? (
                        <img
                          src={t.coverImageUrl}
                          alt={t.title}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-stone-400">
                          <Compass className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                    <div>
                      <Link
                        href={`/tours/${t.slug}`}
                        className="font-semibold text-[#111827] hover:underline block line-clamp-1"
                      >
                        {t.title}
                      </Link>
                      <span className="text-[11px] text-[#6B7280] inline-flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3 text-stone-400" />
                        {t.destination}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-5">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium border ${getRegionBadge(
                      t.region
                    )}`}
                  >
                    {t.region}
                  </span>
                </td>
                <td className="py-3.5 px-5 text-stone-700">
                  <span className="inline-flex items-center gap-1 font-medium">
                    <Calendar className="h-3 w-3 text-stone-400" />
                    {t.durationDays}D / {t.durationNights}N
                  </span>
                </td>
                <td className="py-3.5 px-5 text-stone-700">
                  <span className="inline-flex items-center gap-1 font-medium">
                    <Users className="h-3 w-3 text-stone-400" />
                    {t.maxGroupSize || 14} seats
                  </span>
                </td>
                <td className="py-3.5 px-5 text-right font-bold text-[#111827]">
                  BDT {t.basePrice.toLocaleString()}
                </td>
                <td className="py-3.5 px-5 text-right">
                  <div className="inline-flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => copyTourLink(t.slug)}
                      className="p-1 text-stone-400 hover:text-stone-800 transition-colors"
                      title="Copy Public Link"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <Link
                      href={`/tours/${t.slug}`}
                      className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-[#111827] font-medium rounded text-[11px] transition-colors inline-flex items-center gap-1"
                    >
                      <span>View</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {filteredTours.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center">
                  <div className="max-w-xs mx-auto flex flex-col items-center justify-center text-center space-y-2">
                    <div className="h-10 w-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
                      <Compass className="h-5 w-5" />
                    </div>
                    <p className="text-xs font-semibold text-stone-900">No expeditions found</p>
                    <p className="text-[11px] text-stone-500">
                      {tourSearch || divisionFilter !== "all"
                        ? "No tours match the current filter selection."
                        : "No tour packages have been added to the catalog yet."}
                    </p>
                    {tourSearch || divisionFilter !== "all" ? (
                      <button
                        onClick={() => {
                          setTourSearch("");
                          setDivisionFilter("all");
                        }}
                        className="mt-2 text-xs font-medium text-stone-800 underline hover:text-stone-950"
                      >
                        Reset Search Filters
                      </button>
                    ) : (
                      !isTraveller && (
                        <button
                          onClick={() => setCreateTourOpen(true)}
                          className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-[#111827] text-white text-xs font-medium hover:bg-black transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                          <span>Create First Tour</span>
                        </button>
                      )
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
