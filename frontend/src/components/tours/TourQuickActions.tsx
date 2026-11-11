"use client";

import { Heart, Scale } from "lucide-react";
import { useWishlist } from "@/lib/wishlist";
import { useTourCompare } from "@/lib/compare";
import { useToast } from "@/lib/toast-context";
import { TourSummary } from "@/lib/api";

interface TourQuickActionsProps {
  tour: Pick<
    TourSummary,
    | "id"
    | "slug"
    | "title"
    | "destination"
    | "coverImageUrl"
    | "basePrice"
    | "discountPrice"
    | "durationDays"
    | "durationNights"
    | "averageRating"
    | "totalReviews"
    | "category"
    | "difficulty"
    | "depositAmount"
    | "maxGroupSize"
    | "idealSeason"
    | "startCity"
    | "highlights"
    | "country"
  >;
  variant?: "overlay" | "header";
}

export default function TourQuickActions({
  tour,
  variant = "overlay",
}: TourQuickActionsProps) {
  const { isSaved, toggleWishlist } = useWishlist();
  const { isInCompare, toggleCompare, maxItems } = useTourCompare();
  const { toast } = useToast();

  const saved = isSaved(tour.id);
  const compared = isInCompare(tour.id);

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nowSaved = toggleWishlist({
      id: tour.id,
      slug: tour.slug,
      title: tour.title,
      destination: tour.destination,
      country: tour.country,
      coverImageUrl: tour.coverImageUrl,
      basePrice: tour.basePrice,
      discountPrice: tour.discountPrice ?? null,
      durationDays: tour.durationDays,
      durationNights: tour.durationNights,
      averageRating: tour.averageRating,
      reviewCount: tour.totalReviews,
      category: tour.category,
      difficulty: tour.difficulty,
    });

    if (nowSaved) {
      toast.success("Saved to Wishlist", `${tour.title} added to your saved list.`);
    } else {
      toast.info("Removed from Wishlist", `${tour.title} was removed from saved tours.`);
    }
  };

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const result = toggleCompare({
      id: tour.id,
      slug: tour.slug,
      title: tour.title,
      destination: tour.destination,
      coverImageUrl: tour.coverImageUrl,
      basePrice: tour.basePrice,
      discountPrice: tour.discountPrice ?? null,
      depositAmount: tour.depositAmount,
      durationDays: tour.durationDays,
      durationNights: tour.durationNights,
      maxGroupSize: tour.maxGroupSize,
      difficulty: tour.difficulty,
      category: tour.category,
      idealSeason: tour.idealSeason,
      startCity: tour.startCity,
      averageRating: tour.averageRating,
      reviewCount: tour.totalReviews,
      highlights: tour.highlights,
    });

    if (result.limitReached) {
      toast.error(
        "Comparison Limit Reached",
        `You can compare up to ${maxItems} tours at once. Remove one from the bar below first.`
      );
      return;
    }

    if (result.added) {
      toast.success("Added to Compare", `${tour.title} queued for side-by-side comparison.`);
    } else {
      toast.info("Removed from Compare", `${tour.title} removed from comparison.`);
    }
  };

  if (variant === "header") {
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleWishlist}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full border text-xs font-semibold transition-all cursor-pointer ${
            saved
              ? "bg-rose-50 border-rose-300 text-rose-700"
              : "bg-white border-[#E5DFD5] text-stone-700 hover:border-stone-900"
          }`}
        >
          <Heart className={`w-4 h-4 ${saved ? "fill-rose-500 text-rose-500" : ""}`} />
          <span>{saved ? "Saved" : "Save Tour"}</span>
        </button>

        <button
          type="button"
          onClick={handleCompare}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full border text-xs font-semibold transition-all cursor-pointer ${
            compared
              ? "bg-teal-50 border-teal-400 text-teal-800"
              : "bg-white border-[#E5DFD5] text-stone-700 hover:border-stone-900"
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>{compared ? "Comparing" : "Compare"}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={handleCompare}
        title={compared ? "Remove from comparison" : "Compare tour"}
        aria-label={compared ? `Remove ${tour.title} from comparison` : `Compare ${tour.title}`}
        className={`h-8 w-8 rounded-full flex items-center justify-center backdrop-blur-md border transition-all cursor-pointer shadow-xs ${
          compared
            ? "bg-teal-600 border-teal-400 text-white"
            : "bg-white/90 border-white/60 text-stone-700 hover:bg-white hover:text-teal-700"
        }`}
      >
        <Scale className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        onClick={handleWishlist}
        title={saved ? "Remove from wishlist" : "Save to wishlist"}
        aria-label={saved ? `Remove ${tour.title} from wishlist` : `Save ${tour.title} to wishlist`}
        className={`h-8 w-8 rounded-full flex items-center justify-center backdrop-blur-md border transition-all cursor-pointer shadow-xs ${
          saved
            ? "bg-rose-500 border-rose-400 text-white"
            : "bg-white/90 border-white/60 text-stone-700 hover:bg-white hover:text-rose-600"
        }`}
      >
        <Heart className={`w-3.5 h-3.5 ${saved ? "fill-white" : ""}`} />
      </button>
    </div>
  );
}
