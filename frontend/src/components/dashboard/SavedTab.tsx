"use client";

import React from "react";
import Link from "next/link";
import { Heart, MapPin, Clock, Star, Trash2, Compass } from "lucide-react";
import { TourSummary } from "@/lib/api";
import { useWishlist } from "@/lib/wishlist";

interface SavedTabProps {
  toursList?: TourSummary[];
}

export function SavedTab(_props: SavedTabProps) {
  const { items, removeFromWishlist, clearWishlist } = useWishlist();

  return (
    <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-lg p-6 space-y-5 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F3F4F6] pb-4">
        <div>
          <h3 className="text-sm font-bold text-[#111827] flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            Saved Destinations &amp; Wishlist ({items.length})
          </h3>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Synced across your browser so you can compare dates or reserve seats anytime.
          </p>
        </div>

        {items.length > 0 && (
          <button
            type="button"
            onClick={clearWishlist}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#E5E7EB] text-xs font-medium text-[#6B7280] hover:text-rose-600 hover:border-rose-200 transition self-start"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear All
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="py-10 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-rose-50 border border-rose-100 text-rose-500 flex items-center justify-center">
            <Heart className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-[#111827]">No saved expeditions yet</p>
            <p className="text-xs text-[#6B7280] max-w-md mx-auto">
              Tap the heart icon on any tour card on Home or Destinations to bookmark trips for your next trip across Bangladesh.
            </p>
          </div>
          <Link
            href="/destinations"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#111827] hover:bg-black text-white text-xs font-semibold transition"
          >
            <Compass className="w-3.5 h-3.5" />
            Browse Expeditions
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((tour) => {
            const effectivePrice =
              tour.discountPrice && tour.discountPrice > 0 ? tour.discountPrice : tour.basePrice;
            return (
              <div
                key={tour.id}
                className="border border-[#E5E7EB] rounded-lg overflow-hidden bg-[#FFFFFF] flex flex-col hover:border-[#D1D5DB] transition"
              >
                <div className="relative h-36 bg-stone-100">
                  <img
                    src={tour.coverImageUrl || "/images/placeholder.jpg"}
                    alt={tour.title}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeFromWishlist(tour.id)}
                    aria-label={`Remove ${tour.title} from wishlist`}
                    className="absolute top-2.5 right-2.5 h-7 w-7 rounded-full bg-white/95 text-rose-500 hover:bg-rose-50 flex items-center justify-center shadow-sm transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  {tour.category && (
                    <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded bg-black/70 text-white text-[10px] font-semibold uppercase tracking-wider">
                      {tour.category}
                    </span>
                  )}
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-[11px] text-[#6B7280]">
                      <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                      <span className="truncate">{tour.destination}</span>
                    </div>
                    <h4 className="font-semibold text-sm text-[#111827] line-clamp-1">{tour.title}</h4>
                    <div className="flex items-center gap-3 text-[11px] text-[#6B7280]">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {tour.durationDays}D / {tour.durationNights ?? Math.max(0, tour.durationDays - 1)}N
                      </span>
                      {typeof tour.averageRating === "number" && tour.averageRating > 0 && (
                        <span className="inline-flex items-center gap-1 text-[#111827] font-medium">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          {tour.averageRating.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#F3F4F6] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#6B7280] block">From</span>
                      <span className="text-sm font-bold text-[#111827]">
                        BDT {effectivePrice.toLocaleString()}
                      </span>
                    </div>
                    <Link
                      href={`/tours/${tour.slug}`}
                      className="px-3 py-1.5 rounded-md bg-[#111827] hover:bg-black text-white text-xs font-semibold transition"
                    >
                      Book Now
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
