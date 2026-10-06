"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  Compass,
  MapPin,
  Calendar,
  Users,
  Clock,
  Star,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Luggage,
  Sparkles,
  ChevronRight,
  ChevronDown,
  ArrowLeft,
  X,
  CreditCard,
  Check
} from "lucide-react";
import { TourDetail, API_BASE } from "@/lib/api";

export default function TourDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const [tour, setTour] = useState<TourDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"itinerary" | "dates" | "inclusions" | "reviews">("itinerary");

  // Booking Modal State
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>("");
  const [travelersCount, setTravelersCount] = useState<number>(1);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [dietaryRequirements, setDietaryRequirements] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");
  const [payDepositOnly, setPayDepositOnly] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmedBookingRef, setConfirmedBookingRef] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDetail() {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/tourpackages/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setTour(data);
          if (data.schedules && data.schedules.length > 0) {
            setSelectedScheduleId(data.schedules[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load tour details:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [slug]);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tour || !selectedScheduleId) return;

    setSubmitting(true);
    try {
      const payload = {
        tourPackageId: tour.id,
        tourScheduleId: selectedScheduleId,
        customerName,
        customerEmail,
        customerPhone,
        numberOfTravelers: travelersCount,
        dietaryRequirements,
        specialRequests,
        emergencyContactName,
        emergencyContactPhone,
        payDepositOnly
      };

      const res = await fetch(`${API_BASE}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const result = await res.json();
        setConfirmedBookingRef(result.bookingReference);
      } else {
        const errorData = await res.json();
        alert(errorData.message || "Failed to secure booking. Please check availability.");
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting reservation. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-500">
        Loading expedition details from live database...
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Expedition Not Found</h2>
        <p className="text-slate-400">The requested itinerary does not exist or has been archived.</p>
        <Link href="/tours" className="inline-block px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold">
          Browse All Expeditions
        </Link>
      </div>
    );
  }

  const selectedSchedule = tour.schedules?.find((s) => s.id === selectedScheduleId) || tour.schedules?.[0];
  const unitPrice = selectedSchedule?.pricePerPerson || (tour.discountPrice ?? tour.basePrice);
  const totalTripPrice = unitPrice * travelersCount;
  const totalDepositAmount = (tour.depositAmount || unitPrice * 0.20) * travelersCount;

  return (
    <div className="pb-24">
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link href="/" className="hover:text-white">Home</Link>
          <span>/</span>
          <Link href="/tours" className="hover:text-white">Expeditions</Link>
          <span>/</span>
          <span className="text-slate-200 truncate">{tour.title}</span>
        </div>
      </div>

      {/* Hero Header & Gallery */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-600/90 text-white">
              {tour.category}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300">
              {tour.region}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300">
              Physical Rating: {tour.difficulty}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            {tour.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-slate-200">
              <MapPin className="h-4 w-4 text-indigo-400" />
              {tour.destination}, {tour.country}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
              <strong className="text-white">{tour.averageRating.toFixed(1)}</strong> ({tour.totalReviews} verified reviews)
            </span>
            <span>•</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="h-4 w-4" />
              100% Guaranteed Departures
            </span>
          </div>
        </div>

        {/* Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[400px] sm:h-[480px] rounded-3xl overflow-hidden">
          <div className="md:col-span-2 relative h-full bg-slate-900">
            <img
              src={tour.coverImageUrl}
              alt={tour.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="hidden md:grid grid-rows-2 gap-4 h-full">
            {tour.galleryImages?.slice(0, 2).map((img, i) => (
              <div key={i} className="relative h-full overflow-hidden bg-slate-900">
                <img src={img} alt={`${tour.title} ${i + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Quick Facts Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-xs">
          <div>
            <span className="text-slate-500 uppercase font-semibold text-[10px]">Duration</span>
            <div className="font-bold text-white text-sm">{tour.durationDays} Days / {tour.durationNights} Nights</div>
          </div>
          <div>
            <span className="text-slate-500 uppercase font-semibold text-[10px]">Group Size</span>
            <div className="font-bold text-white text-sm">Max {tour.maxGroupSize} Guests</div>
          </div>
          <div>
            <span className="text-slate-500 uppercase font-semibold text-[10px]">Start & End</span>
            <div className="font-bold text-white text-sm truncate">{tour.startCity}</div>
          </div>
          <div>
            <span className="text-slate-500 uppercase font-semibold text-[10px]">Ideal Season</span>
            <div className="font-bold text-white text-sm">{tour.idealSeason}</div>
          </div>
          <div>
            <span className="text-slate-500 uppercase font-semibold text-[10px]">Deposit to Book</span>
            <div className="font-bold text-emerald-400 text-sm">${tour.depositAmount} / person</div>
          </div>
        </div>
      </div>

      {/* Main Content Layout with Sticky Booking Box */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Itinerary, Highlights, Inclusions */}
        <div className="lg:col-span-2 space-y-10">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs font-bold uppercase tracking-wider">
            <button
              onClick={() => setActiveTab("itinerary")}
              className={`px-4 py-2 rounded-xl transition-all ${
                activeTab === "itinerary" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Day-by-Day Itinerary
            </button>
            <button
              onClick={() => setActiveTab("dates")}
              className={`px-4 py-2 rounded-xl transition-all ${
                activeTab === "dates" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Dates & Pricing ({tour.schedules?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab("inclusions")}
              className={`px-4 py-2 rounded-xl transition-all ${
                activeTab === "inclusions" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Inclusions & Gear
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`px-4 py-2 rounded-xl transition-all ${
                activeTab === "reviews" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Verified Reviews ({tour.reviews?.length || 0})
            </button>
          </div>

          {/* Overview */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">Expedition Narrative</h3>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {tour.description}
            </p>

            {/* Highlights */}
            {tour.highlights && tour.highlights.length > 0 && (
              <div className="space-y-3 pt-4">
                <h4 className="text-xs uppercase tracking-wider font-bold text-indigo-400">Expedition Highlights</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {tour.highlights.map((hl, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-200 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{hl}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Tab 1: Itinerary */}
          {activeTab === "itinerary" && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white">Detailed Daily Schedule</h3>
              <div className="relative border-l-2 border-indigo-500/30 ml-4 space-y-8 pl-6">
                {tour.itineraryDays?.map((day) => (
                  <div key={day.id} className="relative space-y-2">
                    {/* Timeline Node */}
                    <div className="absolute -left-[33px] top-1 h-4 w-4 rounded-full bg-indigo-600 border-2 border-slate-950" />

                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                        Day {day.dayNumber} • {day.location || "En Route"}
                      </span>
                      {day.activityMetrics && (
                        <span className="text-[11px] text-slate-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                          {day.activityMetrics}
                        </span>
                      )}
                    </div>

                    <h4 className="text-base font-bold text-white">{day.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{day.description}</p>

                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-1">
                      {day.accommodation && (
                        <span>
                          <strong>Lodging:</strong> {day.accommodation}
                        </span>
                      )}
                      {day.mealsIncluded && (
                        <span>
                          <strong>Meals:</strong> {day.mealsIncluded}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 2: Dates & Pricing */}
          {activeTab === "dates" && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white">Upcoming Guaranteed Departures</h3>
              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Dates</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Seats Left</th>
                      <th className="py-3 px-4">Price / Person</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70">
                    {tour.schedules?.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-white">
                          {new Date(s.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} –{" "}
                          {new Date(s.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {s.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-300">
                          {s.totalSeats - s.bookedSeats} of {s.totalSeats} seats
                        </td>
                        <td className="py-3.5 px-4 font-bold text-white">${s.pricePerPerson.toLocaleString()}</td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedScheduleId(s.id);
                              setBookingModalOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
                          >
                            Select Date
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 3: Inclusions */}
          {activeTab === "inclusions" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    What Is Included
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {tour.inclusions?.map((inc, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{inc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-rose-400" />
                    What Is Excluded
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-400">
                    {tour.exclusions?.map((exc, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-rose-400 font-bold shrink-0">✕</span>
                        <span>{exc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {tour.packingTips && tour.packingTips.length > 0 && (
                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Luggage className="h-4 w-4 text-sky-400" />
                    Recommended Gear & Packing Tips
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                    {tour.packingTips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-indigo-400">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Reviews */}
          {activeTab === "reviews" && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white">Verified Traveler Testimonials</h3>
              <div className="space-y-4">
                {tour.reviews?.map((rev) => (
                  <div key={rev.id} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-amber-400">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-amber-400" />
                        ))}
                      </div>
                      <span className="text-[11px] text-slate-500">{rev.tripDateFormatted}</span>
                    </div>

                    <h4 className="text-sm font-bold text-white">{rev.title}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">{rev.comment}</p>

                    <div className="pt-2 text-xs font-semibold text-white">
                      {rev.reviewerName} • <span className="text-slate-400 font-normal">{rev.reviewerLocation}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Sticky Booking Widget */}
        <div className="lg:col-span-1">
          <div className="sticky top-28 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-2xl">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Per Traveler</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white">
                  ${unitPrice.toLocaleString()}
                </span>
                {tour.discountPrice && (
                  <span className="text-sm text-slate-500 line-through">
                    ${tour.basePrice.toLocaleString()}
                  </span>
                )}
              </div>
              <div className="text-xs text-emerald-400 font-semibold">
                Secure today with a ${tour.depositAmount} deposit
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Select Departure Date</label>
                <select
                  value={selectedScheduleId}
                  onChange={(e) => setSelectedScheduleId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  {tour.schedules?.map((s) => (
                    <option key={s.id} value={s.id}>
                      {new Date(s.startDate).toLocaleDateString()} – {new Date(s.endDate).toLocaleDateString()} ({s.totalSeats - s.bookedSeats} seats left)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Number of Guests</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setTravelersCount(Math.max(1, travelersCount - 1))}
                    className="h-10 w-10 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold hover:bg-slate-800"
                  >
                    -
                  </button>
                  <span className="text-base font-bold text-white px-2">{travelersCount}</span>
                  <button
                    type="button"
                    onClick={() => setTravelersCount(Math.min(tour.maxGroupSize, travelersCount + 1))}
                    className="h-10 w-10 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold hover:bg-slate-800"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Trip Subtotal</span>
                <span className="text-white font-semibold">${totalTripPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Deposit Due Now</span>
                <span className="text-emerald-400 font-bold">${totalDepositAmount.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={() => setBookingModalOpen(true)}
              className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
            >
              <span>Reserve This Expedition</span>
              <ChevronRight className="h-4 w-4" />
            </button>

            <div className="text-[11px] text-slate-500 text-center space-y-1">
              <div>✓ Instant Booking Confirmation</div>
              <div>✓ Flexible Cancellation up to 60 Days Prior</div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Booking Modal */}
      {bookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative my-8">
            <button
              onClick={() => {
                setBookingModalOpen(false);
                setConfirmedBookingRef(null);
              }}
              className="absolute top-5 right-5 h-8 w-8 rounded-full bg-slate-950 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            {confirmedBookingRef ? (
              <div className="py-8 text-center space-y-5">
                <div className="h-16 w-16 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-black text-white">Expedition Confirmed!</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Your official reservation reference code has been recorded in the TourFlow reservation manifest.
                </p>
                <div className="inline-block px-5 py-2.5 bg-slate-950 border border-indigo-500/30 rounded-2xl font-mono text-lg font-black text-indigo-400">
                  {confirmedBookingRef}
                </div>
                <div className="pt-4 flex flex-col sm:flex-row gap-3">
                  <Link
                    href={`/manage?ref=${confirmedBookingRef}&email=${encodeURIComponent(customerEmail)}`}
                    className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all text-center"
                  >
                    View In Manage Booking
                  </Link>
                  <button
                    onClick={() => {
                      setBookingModalOpen(false);
                      setConfirmedBookingRef(null);
                    }}
                    className="px-5 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-800"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div>
                  <span className="text-[10px] text-indigo-400 uppercase font-bold tracking-wider">
                    Step 1 of 1 • Reservation Form
                  </span>
                  <h3 className="text-lg font-bold text-white line-clamp-1">{tour.title}</h3>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Selected Departure</label>
                    <div className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-medium">
                      {selectedSchedule && (
                        <span>
                          {new Date(selectedSchedule.startDate).toLocaleDateString()} –{" "}
                          {new Date(selectedSchedule.endDate).toLocaleDateString()} (${unitPrice} / guest)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1 font-medium">Primary Traveler Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Eleanor Vance"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1 font-medium">Email Address</label>
                      <input
                        type="email"
                        placeholder="eleanor@example.com"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1 font-medium">Phone / WhatsApp</label>
                      <input
                        type="tel"
                        placeholder="+1 (555) 392-1082"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1 font-medium">Guests Count</label>
                      <input
                        type="number"
                        min={1}
                        max={tour.maxGroupSize}
                        value={travelersCount}
                        onChange={(e) => setTravelersCount(parseInt(e.target.value) || 1)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Dietary & Medical Requirements</label>
                    <input
                      type="text"
                      placeholder="e.g. Vegetarian, Gluten-free, Asthmatic"
                      value={dietaryRequirements}
                      onChange={(e) => setDietaryRequirements(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1 font-medium">Emergency Contact Name</label>
                      <input
                        type="text"
                        placeholder="Full contact name"
                        value={emergencyContactName}
                        onChange={(e) => setEmergencyContactName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1 font-medium">Emergency Contact Phone</label>
                      <input
                        type="tel"
                        placeholder="Emergency phone"
                        value={emergencyContactPhone}
                        onChange={(e) => setEmergencyContactPhone(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Payment Selection */}
                  <div className="pt-2">
                    <label className="block text-slate-400 mb-2 font-medium">Payment Option</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setPayDepositOnly(true)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          payDepositOnly
                            ? "bg-indigo-600/10 border-indigo-500 text-white"
                            : "bg-slate-950 border-slate-800 text-slate-400"
                        }`}
                      >
                        <div className="font-bold">Pay Deposit Only</div>
                        <div className="text-[11px] text-emerald-400 font-semibold">${totalDepositAmount.toLocaleString()} today</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPayDepositOnly(false)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          !payDepositOnly
                            ? "bg-indigo-600/10 border-indigo-500 text-white"
                            : "bg-slate-950 border-slate-800 text-slate-400"
                        }`}
                      >
                        <div className="font-bold">Pay In Full</div>
                        <div className="text-[11px] text-slate-300 font-semibold">${totalTripPrice.toLocaleString()} today</div>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Total to Charge</span>
                    <div className="text-xl font-black text-emerald-400">
                      ${(payDepositOnly ? totalDepositAmount : totalTripPrice).toLocaleString()}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
                  >
                    {submitting ? "Securing Reservation..." : "Confirm & Authorize"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
