"use client";

import { useState } from "react";
import { Star, X, CheckCircle2, MessageSquare } from "lucide-react";
import { useToast } from "@/lib/toast-context";

export interface SubmittedReview {
  id: string;
  rating: number;
  title: string;
  comment: string;
  reviewerName: string;
  reviewerLocation: string;
  tripDateFormatted: string;
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
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [reviewerName, setReviewerName] = useState("");
  const [reviewerLocation, setReviewerLocation] = useState("Dhaka");
  const [travelMonth, setTravelMonth] = useState("October 2026");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || !title.trim() || !reviewerName.trim()) {
      toast.error("Missing Fields", "Please fill in all review details.");
      return;
    }

    setSubmitting(true);
    // Construct local high-fidelity review
    const newReview: SubmittedReview = {
      id: `rev-${Date.now()}`,
      rating,
      title: title.trim(),
      comment: comment.trim(),
      reviewerName: reviewerName.trim(),
      reviewerLocation: reviewerLocation.trim(),
      tripDateFormatted: travelMonth,
    };

    setTimeout(() => {
      setSubmitting(false);
      toast.success(
        "Review Submitted!",
        "Thank you for sharing your authentic journey with our travel community."
      );
      if (onSuccess) onSuccess(newReview);
      onClose();
    }, 600);
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
                  required
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
