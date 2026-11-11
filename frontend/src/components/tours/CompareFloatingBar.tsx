"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Scale,
  X,
  Star,
  Clock,
  Users,
  MapPin,
  Calendar,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useTourCompare, MAX_COMPARE_ITEMS } from "@/lib/compare";

export default function CompareFloatingBar() {
  const { items, count, removeFromCompare, clearCompare } = useTourCompare();
  const [modalOpen, setModalOpen] = useState(false);

  if (count === 0) return null;

  const effectivePrice = (t: (typeof items)[number]) =>
    t.discountPrice && t.discountPrice > 0 ? t.discountPrice : t.basePrice;

  const lowestPrice = Math.min(...items.map(effectivePrice));
  const highestRating = Math.max(...items.map((t) => t.averageRating || 0));

  return (
    <>
      {/* Floating Comparison Bar positioned cleanly above MobileBottomNav */}
      <div className="fixed bottom-16 md:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[94vw] max-w-3xl bg-slate-900/95 backdrop-blur-md text-white rounded-2xl shadow-2xl border border-slate-700/80 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="hidden sm:flex w-9 h-9 rounded-xl bg-teal-500/20 text-teal-300 items-center justify-center shrink-0">
            <Scale className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {items.map((tour) => (
              <div
                key={tour.id}
                className="flex items-center gap-2 bg-slate-800/90 border border-slate-700 rounded-xl pl-1.5 pr-2 py-1 shrink-0 max-w-[170px]"
              >
                <img
                  src={tour.coverImageUrl || "/images/placeholder.jpg"}
                  alt={tour.title}
                  className="w-7 h-7 rounded-lg object-cover shrink-0"
                />
                <span className="text-xs font-semibold truncate">{tour.title}</span>
                <button
                  type="button"
                  onClick={() => removeFromCompare(tour.id)}
                  aria-label={`Remove ${tour.title} from compare`}
                  className="text-slate-400 hover:text-white transition shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {Array.from({ length: MAX_COMPARE_ITEMS - count }).map((_, idx) => (
              <div
                key={`slot-${idx}`}
                className="hidden md:flex items-center justify-center border border-dashed border-slate-700 rounded-xl px-3 py-1.5 text-[11px] text-slate-400 shrink-0"
              >
                + Add tour
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={clearCompare}
            className="text-xs text-slate-400 hover:text-white px-2.5 py-2 rounded-lg hover:bg-slate-800 transition flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear</span>
          </button>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs sm:text-sm font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
          >
            <Scale className="w-4 h-4" />
            Compare ({count}/{MAX_COMPARE_ITEMS})
          </button>
        </div>
      </div>

      {/* Side-by-Side Comparison Matrix Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[88vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center">
                  <Scale className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">
                    Side-by-Side Expedition Comparison
                  </h2>
                  <p className="text-xs text-slate-500">
                    Compare pricing, trip length, difficulty, and highlights across {count} selected tours.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Close comparison modal"
                className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-auto p-6">
              <table className="w-full min-w-[640px] text-left border-collapse">
                <thead>
                  <tr>
                    <th className="w-44 align-bottom pb-4 pr-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                      Feature
                    </th>
                    {items.map((tour) => {
                      const price = effectivePrice(tour);
                      const isBestPrice = count > 1 && price === lowestPrice;
                      return (
                        <th key={tour.id} className="pb-4 px-3 align-top">
                          <div className="relative rounded-2xl border border-slate-200 bg-slate-50 p-3">
                            <button
                              type="button"
                              onClick={() => removeFromCompare(tour.id)}
                              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/90 text-slate-500 hover:text-rose-600 flex items-center justify-center shadow-sm"
                              aria-label={`Remove ${tour.title}`}
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                            <img
                              src={tour.coverImageUrl || "/images/placeholder.jpg"}
                              alt={tour.title}
                              className="w-full h-32 object-cover rounded-xl mb-3"
                            />
                            <div className="flex items-center gap-1.5 mb-1">
                              {tour.category && (
                                <span className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 text-[10px] font-bold uppercase tracking-wider">
                                  {tour.category}
                                </span>
                              )}
                              {isBestPrice && (
                                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-[10px] font-bold flex items-center gap-1">
                                  <Sparkles className="w-2.5 h-2.5" /> Best Value
                                </span>
                              )}
                            </div>
                            <h3 className="text-sm font-bold text-slate-900 line-clamp-2 min-h-[2.5rem]">
                              {tour.title}
                            </h3>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  <tr>
                    <td className="py-3.5 pr-4 font-semibold text-slate-600">Price per Person</td>
                    {items.map((tour) => {
                      const price = effectivePrice(tour);
                      const hasDiscount = tour.discountPrice && tour.discountPrice > 0 && tour.discountPrice < tour.basePrice;
                      return (
                        <td key={tour.id} className="py-3.5 px-3">
                          <span className="text-base font-black text-slate-900">
                            {price.toLocaleString()} BDT
                          </span>
                          {hasDiscount && (
                            <span className="block text-xs line-through text-slate-400">
                              {tour.basePrice.toLocaleString()} BDT
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  <tr>
                    <td className="py-3.5 pr-4 font-semibold text-slate-600">Booking Deposit</td>
                    {items.map((tour) => (
                      <td key={tour.id} className="py-3.5 px-3 text-slate-700 font-medium">
                        {tour.depositAmount && tour.depositAmount > 0
                          ? `${tour.depositAmount.toLocaleString()} BDT / traveler`
                          : "Full payment"}
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="py-3.5 pr-4 font-semibold text-slate-600">Duration</td>
                    {items.map((tour) => (
                      <td key={tour.id} className="py-3.5 px-3 text-slate-700">
                        <span className="inline-flex items-center gap-1.5 font-medium">
                          <Clock className="w-4 h-4 text-teal-600" />
                          {tour.durationDays}D / {tour.durationNights ?? Math.max(0, tour.durationDays - 1)}N
                        </span>
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="py-3.5 pr-4 font-semibold text-slate-600">Traveler Rating</td>
                    {items.map((tour) => {
                      const rating = tour.averageRating || 0;
                      const isTop = count > 1 && rating > 0 && rating === highestRating;
                      return (
                        <td key={tour.id} className="py-3.5 px-3">
                          <span className="inline-flex items-center gap-1.5 font-bold text-slate-900">
                            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                            {rating > 0 ? rating.toFixed(1) : "New"}
                            <span className="text-xs font-normal text-slate-500">
                              ({tour.reviewCount || 0} reviews)
                            </span>
                            {isTop && (
                              <span className="ml-1 px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded text-[10px] font-bold">
                                Top
                              </span>
                            )}
                          </span>
                        </td>
                      );
                    })}
                  </tr>

                  <tr>
                    <td className="py-3.5 pr-4 font-semibold text-slate-600">Destination & Start</td>
                    {items.map((tour) => (
                      <td key={tour.id} className="py-3.5 px-3 text-slate-700">
                        <div className="flex items-start gap-1.5">
                          <MapPin className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                          <div>
                            <div className="font-semibold">{tour.destination}</div>
                            {tour.startCity && (
                              <div className="text-xs text-slate-500">Starts from {tour.startCity}</div>
                            )}
                          </div>
                        </div>
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="py-3.5 pr-4 font-semibold text-slate-600">Group Size & Difficulty</td>
                    {items.map((tour) => (
                      <td key={tour.id} className="py-3.5 px-3 text-slate-700">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-xs font-semibold">
                            <Users className="w-3.5 h-3.5 text-slate-500" />
                            Max {tour.maxGroupSize || 14}
                          </span>
                          {tour.difficulty && (
                            <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold">
                              {tour.difficulty}
                            </span>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="py-3.5 pr-4 font-semibold text-slate-600">Ideal Season</td>
                    {items.map((tour) => (
                      <td key={tour.id} className="py-3.5 px-3 text-slate-700">
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium">
                          <Calendar className="w-3.5 h-3.5 text-teal-600" />
                          {tour.idealSeason || "Year-round"}
                        </span>
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="py-3.5 pr-4 font-semibold text-slate-600 align-top">Top Highlights</td>
                    {items.map((tour) => (
                      <td key={tour.id} className="py-3.5 px-3 align-top">
                        <ul className="space-y-1.5">
                          {(tour.highlights || []).slice(0, 3).map((hl, i) => (
                            <li key={i} className="flex items-start gap-1.5 text-xs text-slate-600">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                              <span>{hl}</span>
                            </li>
                          ))}
                        </ul>
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="pt-5 pr-4" />
                    {items.map((tour) => (
                      <td key={tour.id} className="pt-5 px-3">
                        <Link
                          href={`/tours/${tour.slug}`}
                          onClick={() => setModalOpen(false)}
                          className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-sm"
                        >
                          Inspect & Book <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
