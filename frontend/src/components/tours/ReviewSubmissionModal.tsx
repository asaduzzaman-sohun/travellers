"use client";

import { useState, useEffect } from "react";
import { Star, X, MessageSquare, LogIn, ShieldCheck } from "lucide-react";
import { useToast } from "@/lib/toast-context";
import { useAuth } from "@/lib/auth-context";
import { submitReview } from "@/lib/api";

export interface SubmittedReview {
  id: string;
  rating: number;
  title: string;
  comment: string;
  reviewerName: string;
  reviewerLocation: string;
  tripDateFormatted: string;
  isVerifiedBooking?: boolean;
}

interface ReviewSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  tourTitle: string;
  tourPackageId: string;
  onSuccess?: (review: SubmittedReview) => void;
}

export default function ReviewSubmissionModal({
  isOpen,
  onClose,
  tourTitle,
  tourPackageId,
  onSuccess,
}: ReviewSubmissionModalProps) {
  const { toast } = useToast();
  const { user, token, isLoggedIn, openAuthModal } = useAuth();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [reviewerName, setReviewerName] = useState("");
  const [reviewerLocation, setReviewerLocation] = useState("Dhaka");
  const [travelMonth, setTravelMonth] = useState("October 2026");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user?.fullName) {
      setReviewerName((prev) => prev || user.fullName);
    }
    if (user?.homeCity) {
      setReviewerLocation(user.homeCity);
    }
  }, [user?.id, user?.fullName, user?.homeCity]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn || !token) {
      toast.info("Sign In Required", "Please sign in to publish a verified traveler review.");
      onClose();
      openAuthModal("login");
      return;
    }

    if (!comment.trim() || !title.trim()) {
      toast.error("Missing Fields", "Please provide both a headline and review feedback.");
      return;
    }

    setSubmitting(true);
    try {
      const saved = await submitReview(
        tourPackageId,
        {
          rating,
          title: title.trim(),
          comment: comment.trim(),
          reviewerLocation: reviewerLocation.trim() || "Bangladesh",
          tripDateFormatted: `Traveled ${travelMonth}`,
        },
        token
      );

      const newReview: SubmittedReview = {
        id: saved.id || `rev-${Date.now()}`,
        rating: saved.rating ?? rating,
        title: saved.title || title.trim(),
        comment: saved.comment || comment.trim(),
        reviewerName: saved.reviewerName || user?.fullName || reviewerName.trim() || "Verified Traveler",
        reviewerLocation: saved.reviewerLocation || reviewerLocation.trim() || "Bangladesh",
        tripDateFormatted: saved.tripDateFormatted || `Traveled ${travelMonth}`,
        isVerifiedBooking: Boolean(saved.isVerifiedBooking),
      };

      toast.success(
        "Review Published!",
        newReview.isVerifiedBooking
          ? "Saved with your Verified Booking badge."
          : "Your traveler feedback is now live in the database."
      );

      setTitle("");
      setComment("");
      if (onSuccess) onSuccess(newReview);
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not submit review right now.";
      toast.error("Submission Failed", message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 dark:bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-[#141720] border border-[#EBE6DC] dark:border-[#222836] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative my-8 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          type="button"
          className="absolute top-5 right-5 h-8 w-8 rounded-full bg-stone-100 dark:bg-[#1c2230] flex items-center justify-center text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="space-y-5">
          <div>
            <span className="text-xs text-amber-800 dark:text-amber-400 uppercase font-bold tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" />
              Community Feedback
            </span>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 dark:text-stone-100 mt-1">
              Share Your Journey
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 line-clamp-1">
              Reviewing: {tourTitle}
            </p>
          </div>

          {!isLoggedIn ? (
            <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-950/30 border border-amber-500/30 space-y-3 text-xs">
              <div className="flex items-start gap-2.5 text-amber-900 dark:text-amber-200">
                <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <p>
                  Sign in to persist your review directly to PostgreSQL and automatically earn a{" "}
                  <strong>Verified Booking</strong> badge if you booked this tour.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  openAuthModal("login");
                }}
                className="w-full py-2.5 rounded-full bg-stone-900 dark:bg-emerald-600 hover:bg-stone-800 dark:hover:bg-emerald-500 text-white font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign In to Post Review
              </button>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
            {/* Rating Stars Selector */}
            <div>
              <label className="block text-stone-700 dark:text-stone-300 mb-1.5 font-semibold">
                Your Overall Rating
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => {
                  const active = (hoverRating || rating) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-110 transition-transform focus:outline-none cursor-pointer"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          active
                            ? "fill-amber-500 text-amber-500"
                            : "text-stone-300 dark:text-stone-600"
                        }`}
                      />
                    </button>
                  );
                })}
                <span className="ml-2 font-bold text-stone-800 dark:text-stone-200 text-sm">
                  {rating === 5
                    ? "5.0 - Unforgettable Experience"
                    : rating === 4
                    ? "4.0 - Wonderful Journey"
                    : rating === 3
                    ? "3.0 - Decent"
                    : "Needs Improvement"}
                </span>
              </div>
            </div>

            {/* Review Title */}
            <div>
              <label className="block text-stone-700 dark:text-stone-300 mb-1 font-semibold">
                Headline
              </label>
              <input
                type="text"
                placeholder="e.g. Sunrise above the clouds at Konglak Para was surreal!"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#FAF8F5] dark:bg-[#0c0f16] border border-[#E5DFD5] dark:border-[#2a3142] rounded-2xl px-4 py-2.5 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:border-stone-900 dark:focus:border-amber-400"
                required
              />
            </div>

            {/* Full Comments */}
            <div>
              <label className="block text-stone-700 dark:text-stone-300 mb-1 font-semibold">
                Detailed Experience &amp; Tips for Fellow Travelers
              </label>
              <textarea
                rows={4}
                placeholder="Share your thoughts on the local guide, eco-cottage stay, food quality, or security escorts..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full bg-[#FAF8F5] dark:bg-[#0c0f16] border border-[#E5DFD5] dark:border-[#2a3142] rounded-2xl p-4 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:border-stone-900 dark:focus:border-amber-400 resize-none"
                required
              />
            </div>

            {/* Author info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-700 dark:text-stone-300 mb-1 font-semibold">
                  Your Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Asaduzzaman"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  className="w-full bg-[#FAF8F5] dark:bg-[#0c0f16] border border-[#E5DFD5] dark:border-[#2a3142] rounded-2xl px-4 py-2 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:border-stone-900 dark:focus:border-amber-400"
                  required={isLoggedIn}
                />
              </div>
              <div>
                <label className="block text-stone-700 dark:text-stone-300 mb-1 font-semibold">
                  Home City / Region
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dhaka / Sylhet"
                  value={reviewerLocation}
                  onChange={(e) => setReviewerLocation(e.target.value)}
                  className="w-full bg-[#FAF8F5] dark:bg-[#0c0f16] border border-[#E5DFD5] dark:border-[#2a3142] rounded-2xl px-4 py-2 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:border-stone-900 dark:focus:border-amber-400"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-[#F0EBE1] dark:border-[#222836] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-full text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white font-semibold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-full bg-stone-900 dark:bg-emerald-600 hover:bg-stone-800 dark:hover:bg-emerald-500 text-stone-50 font-semibold text-xs shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                {submitting ? "Submitting..." : "Post Review"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
