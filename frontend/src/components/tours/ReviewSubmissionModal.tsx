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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-[#EBE6DC] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative my-8 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          type="button"
          className="absolute top-5 right-5 h-8 w-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 hover:text-stone-900 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="space-y-5">
          <div>
            <span className="text-xs text-amber-800 uppercase font-bold tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" />
              Community Feedback
            </span>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 mt-1">
              Share Your Journey
            </h3>
            <p className="text-xs text-stone-500 mt-0.5 line-clamp-1">
              Reviewing: {tourTitle}
            </p>
          </div>

          {!isLoggedIn ? (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-3 text-xs">
              <div className="flex items-start gap-2.5 text-amber-950">
                <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
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
                className="w-full py-2.5 rounded-full bg-stone-900 hover:bg-stone-800 text-white font-semibold flex items-center justify-center gap-2 transition"
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign In to Post Review
              </button>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
            {/* Rating Stars Selector */}
            <div>
              <label className="block text-stone-700 mb-1.5 font-semibold">
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
                      className="p-1 hover:scale-110 transition-transform focus:outline-none"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          active
                            ? "fill-amber-500 text-amber-500"
                            : "text-stone-300"
                        }`}
                      />
                    </button>
                  );
                })}
                <span className="ml-2 font-bold text-stone-800 text-sm">
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
              <label className="block text-stone-700 mb-1 font-semibold">
                Headline
              </label>
              <input
                type="text"
                placeholder="e.g. Sunrise above the clouds at Konglak Para was surreal!"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#E5DFD5] rounded-2xl px-4 py-2.5 text-stone-900 focus:outline-none focus:border-stone-900"
                required
              />
            </div>

            {/* Full Comments */}
            <div>
              <label className="block text-stone-700 mb-1 font-semibold">
                Detailed Experience &amp; Tips for Fellow Travelers
              </label>
              <textarea
                rows={4}
                placeholder="Share your thoughts on the local guide, eco-cottage stay, food quality, or security escorts..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#E5DFD5] rounded-2xl p-4 text-stone-900 focus:outline-none focus:border-stone-900"
                required
              />
            </div>

            {/* Author info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-700 mb-1 font-semibold">
                  Your Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Asaduzzaman"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#E5DFD5] rounded-2xl px-4 py-2 text-stone-900 focus:outline-none focus:border-stone-900"
                  required={isLoggedIn}
                />
              </div>
              <div>
                <label className="block text-stone-700 mb-1 font-semibold">
                  Home City / Region
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dhaka / Sylhet"
                  value={reviewerLocation}
                  onChange={(e) => setReviewerLocation(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#E5DFD5] rounded-2xl px-4 py-2 text-stone-900 focus:outline-none focus:border-stone-900"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-[#F0EBE1] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-full text-stone-600 hover:text-stone-900 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-full bg-stone-900 hover:bg-stone-800 text-stone-50 font-semibold text-xs shadow-xs transition-colors disabled:opacity-50"
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
