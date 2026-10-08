"use client";

import React from "react";
import Link from "next/link";
import { TourSummary } from "@/lib/api";

interface SavedTabProps {
  toursList: TourSummary[];
}

export function SavedTab({ toursList }: SavedTabProps) {
  return (
    <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-md p-6 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-[#111827]">Saved Destinations & Bookmarks</h3>
        <p className="text-xs text-[#6B7280]">
          Your curated bucket list for future journeys across Bangladesh.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
        {toursList.slice(0, 3).map((tour) => (
          <div key={tour.id} className="border border-[#E5E7EB] rounded-md p-4 bg-[#FFFFFF] space-y-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]">
              {tour.region}
            </span>
            <h4 className="font-semibold text-xs text-[#111827] line-clamp-1">{tour.title}</h4>
            <p className="text-[11px] text-[#4B5563]">BDT {tour.basePrice.toLocaleString()} per explorer</p>
            <Link
              href={`/tours/${tour.slug}`}
              className="inline-block pt-1 text-xs font-semibold text-[#111827] hover:underline"
            >
              View Details →
            </Link>
          </div>
        ))}
        {toursList.length === 0 && (
          <div className="col-span-3 text-center py-6 text-xs text-[#6B7280]">
            No saved itineraries yet. Explore tours to bookmark your favorites!
          </div>
        )}
      </div>
    </div>
  );
}
