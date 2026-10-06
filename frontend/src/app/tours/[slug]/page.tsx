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
  ChevronRight,
  ArrowLeft,
  X,
  CreditCard,
  Check,
  Phone,
  UserCheck,
  FileText
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
  const [nidOrPassport, setNidOrPassport] = useState("");
  const [dietaryRequirements, setDietaryRequirements] = useState("");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"bkash" | "nagad" | "bank" | "card">("bkash");
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
        dietaryRequirements: dietaryRequirements ? `${dietaryRequirements} (NID: ${nidOrPassport})` : `NID: ${nidOrPassport}`,
        specialRequests: `Payment Method: ${paymentMethod.toUpperCase()}`,
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
        alert(errorData.message || "Failed to secure booking. Please check available seats.");
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
      <div className="min-h-[60vh] flex items-center justify-center text-slate-500 text-sm">
        Loading tour details and departure dates...
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Tour Package Not Found</h2>
        <p className="text-slate-400 text-sm">The requested tour itinerary is either inactive or does not exist.</p>
        <Link href="/destinations" className="inline-block px-5 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-bold">
          Explore All Destinations
        </Link>
      </div>
    );
  }

  const selectedSchedule = tour.schedules?.find((s) => s.id === selectedScheduleId) || tour.schedules?.[0];
  const unitPrice = selectedSchedule?.pricePerPerson || (tour.discountPrice ?? tour.basePrice);
  const totalTripPrice = unitPrice * travelersCount;
  const depositPerPerson = tour.depositAmount || Math.round(unitPrice * 0.25);
  const totalDepositAmount = depositPerPerson * travelersCount;

  return (
    <div className="pb-24">
      {/* Breadcrumb Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <Link href="/destinations" className="hover:text-white transition-colors">Destinations</Link>
          <span>/</span>
          <span className="text-slate-200 truncate">{tour.title}</span>
        </div>
      </div>

      {/* Hero Header & Gallery */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-teal-600/90 text-white">
              {tour.category}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300">
              {tour.region}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300">
              Grade: {tour.difficulty}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            {tour.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-slate-200">
              <MapPin className="h-4 w-4 text-sky-400" />
              {tour.destination}, Bangladesh
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
              <strong className="text-white">{tour.averageRating.toFixed(1)}</strong> ({tour.totalReviews} traveler reviews)
            </span>
            <span>•</span>
            <span className="text-teal-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="h-4 w-4" />
              Verified Local Guide & Safety Protocol
            </span>
          </div>
        </div>

        {/* Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[360px] sm:h-[440px] rounded-3xl overflow-hidden">
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

        {/* Key Quick Facts */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-[#090f1d] border border-slate-800/80 rounded-2xl p-4 text-xs">
          <div>
            <span className="text-slate-500 uppercase font-semibold text-[10px]">Duration</span>
            <div className="font-bold text-white text-sm">{tour.durationDays} Days / {tour.durationNights} Nights</div>
          </div>
          <div>
            <span className="text-slate-500 uppercase font-semibold text-[10px]">Group Size</span>
            <div className="font-bold text-white text-sm">Max {tour.maxGroupSize} Travelers</div>
          </div>
          <div>
            <span className="text-slate-500 uppercase font-semibold text-[10px]">Departure Hub</span>
            <div className="font-bold text-white text-sm truncate">{tour.startCity}</div>
          </div>
          <div>
            <span className="text-slate-500 uppercase font-semibold text-[10px]">Best Season</span>
            <div className="font-bold text-white text-sm">{tour.idealSeason}</div>
          </div>
          <div>
            <span className="text-slate-500 uppercase font-semibold text-[10px]">Booking Deposit</span>
            <div className="font-bold text-teal-400 text-sm">৳{depositPerPerson.toLocaleString()} / person</div>
          </div>
        </div>
      </div>

      {/* Main Content & Sticky Booking Card */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Itinerary, Dates, Inclusions, Reviews */}
        <div className="lg:col-span-2 space-y-10">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs font-bold uppercase tracking-wider">
            <button
              onClick={() => setActiveTab("itinerary")}
              className={`px-4 py-2 rounded-xl transition-all ${
                activeTab === "itinerary" ? "bg-teal-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Tour Itinerary
            </button>
            <button
              onClick={() => setActiveTab("dates")}
              className={`px-4 py-2 rounded-xl transition-all ${
                activeTab === "dates" ? "bg-teal-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Dates & Seats ({tour.schedules?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab("inclusions")}
              className={`px-4 py-2 rounded-xl transition-all ${
                activeTab === "inclusions" ? "bg-teal-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Inclusions & Packing
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`px-4 py-2 rounded-xl transition-all ${
                activeTab === "reviews" ? "bg-teal-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Traveler Reviews ({tour.reviews?.length || 0})
            </button>
          </div>

          {/* Description Narrative */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">Tour Overview & Experience</h3>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {tour.description}
            </p>

            {/* Highlights */}
            {tour.highlights && tour.highlights.length > 0 && (
              <div className="space-y-3 pt-4">
                <h4 className="text-xs uppercase tracking-wider font-bold text-teal-400">Trip Highlights</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {tour.highlights.map((hl, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-200 bg-[#090f1d] p-3 rounded-xl border border-slate-800/80">
                      <CheckCircle2 className="h-4 w-4 text-teal-400 shrink-0 mt-0.5" />
                      <span>{hl}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Tab 1: Daily Itinerary */}
          {activeTab === "itinerary" && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-white">Day-by-Day Travel Schedule</h3>
              <div className="relative border-l-2 border-teal-500/30 ml-4 space-y-8 pl-6">
                {tour.itineraryDays?.map((day) => (
                  <div key={day.id} className="relative space-y-2">
                    <div className="absolute -left-[33px] top-1 h-4 w-4 rounded-full bg-teal-600 border-2 border-slate-950" />

                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
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
              <h3 className="text-lg font-bold text-white">Upcoming Guaranteed Batch Dates</h3>
              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#090f1d]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Departure Dates</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Available Seats</th>
                      <th className="py-3 px-4">Price / Person</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70">
                    {tour.schedules?.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-white">
                          {new Date(s.startDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} –{" "}
                          {new Date(s.endDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-teal-500/10 text-teal-400 border border-teal-500/20">
                            {s.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-300">
                          {s.totalSeats - s.bookedSeats} of {s.totalSeats} seats
                        </td>
                        <td className="py-3.5 px-4 font-bold text-white">৳{s.pricePerPerson.toLocaleString()}</td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedScheduleId(s.id);
                              setBookingModalOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs"
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
                <div className="bg-[#090f1d] border border-slate-800/80 rounded-2xl p-5 space-y-3">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-teal-400" />
                    What Is Included
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {tour.inclusions?.map((inc, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="h-3.5 w-3.5 text-teal-400 shrink-0 mt-0.5" />
                        <span>{inc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-[#090f1d] border border-slate-800/80 rounded-2xl p-5 space-y-3">
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
                <div className="bg-[#090f1d] border border-slate-800/80 rounded-2xl p-5 space-y-3">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Luggage className="h-4 w-4 text-sky-400" />
                    Recommended Gear & Packing Tips
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                    {tour.packingTips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-teal-400">•</span>
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
              <h3 className="text-lg font-bold text-white">Verified Traveler Testimonials</h3>
              <div className="space-y-4">
                {tour.reviews?.map((rev) => (
                  <div key={rev.id} className="bg-[#090f1d] border border-slate-800/80 rounded-2xl p-6 space-y-3">
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

        {/* Right Column: Sticky Reservation Box */}
        <div className="lg:col-span-1">
          <div className="sticky top-28 bg-[#090f1d] border border-slate-800 rounded-3xl p-6 space-y-6 shadow-2xl">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Per Person Fare</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white">
                  ৳{unitPrice.toLocaleString()}
                </span>
                {tour.discountPrice && (
                  <span className="text-sm text-slate-500 line-through">
                    ৳{tour.basePrice.toLocaleString()}
                  </span>
                )}
              </div>
              <div className="text-xs text-teal-400 font-semibold">
                Lock seats with ৳{depositPerPerson.toLocaleString()} deposit
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Select Departure Date</label>
                <select
                  value={selectedScheduleId}
                  onChange={(e) => setSelectedScheduleId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
                >
                  {tour.schedules?.map((s) => (
                    <option key={s.id} value={s.id}>
                      {new Date(s.startDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} – {new Date(s.endDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} ({s.totalSeats - s.bookedSeats} seats left)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Number of Travelers</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setTravelersCount(Math.max(1, travelersCount - 1))}
                    className="h-10 w-10 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold hover:bg-slate-800 transition-colors"
                  >
                    -
                  </button>
                  <span className="text-base font-bold text-white px-2">{travelersCount}</span>
                  <button
                    type="button"
                    onClick={() => setTravelersCount(Math.min(tour.maxGroupSize, travelersCount + 1))}
                    className="h-10 w-10 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold hover:bg-slate-800 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Total Fare ({travelersCount} guest{travelersCount > 1 ? "s" : ""})</span>
                <span className="text-white font-semibold">৳{totalTripPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Deposit Payable Now</span>
                <span className="text-teal-400 font-bold">৳{totalDepositAmount.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={() => setBookingModalOpen(true)}
              className="w-full py-3.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-lg shadow-teal-600/20 transition-all flex items-center justify-center gap-2"
            >
              <span>Book This Tour</span>
              <ChevronRight className="h-4 w-4" />
            </button>

            <div className="text-[11px] text-slate-400 text-center space-y-1">
              <div>✓ Instant booking confirmation & reference</div>
              <div>✓ Support via bKash, Nagad & Bank Transfer</div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Form Modal */}
      {bookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#0b1120] border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative my-8">
            <button
              onClick={() => {
                setBookingModalOpen(false);
                setConfirmedBookingRef(null);
              }}
              className="absolute top-5 right-5 h-8 w-8 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            {confirmedBookingRef ? (
              <div className="py-8 text-center space-y-5">
                <div className="h-16 w-16 mx-auto rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold text-white">Booking Confirmed!</h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  Your official reservation voucher has been created. Keep your booking reference handy for checkposts.
                </p>
                <div className="inline-block px-5 py-2.5 bg-slate-950 border border-teal-500/40 rounded-2xl font-mono text-xl font-bold text-teal-400">
                  {confirmedBookingRef}
                </div>
                <div className="pt-4 flex flex-col sm:flex-row gap-3">
                  <Link
                    href={`/manage?ref=${confirmedBookingRef}&email=${encodeURIComponent(customerEmail)}`}
                    className="flex-1 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all text-center"
                  >
                    View Official Voucher
                  </Link>
                  <button
                    onClick={() => {
                      setBookingModalOpen(false);
                      setConfirmedBookingRef(null);
                    }}
                    className="px-5 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-800"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div>
                  <span className="text-[10px] text-teal-400 uppercase font-bold tracking-wider">
                    Reservation Form
                  </span>
                  <h3 className="text-lg font-bold text-white line-clamp-1">{tour.title}</h3>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Selected Batch Schedule</label>
                    <div className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-medium">
                      {selectedSchedule && (
                        <span>
                          {new Date(selectedSchedule.startDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} –{" "}
                          {new Date(selectedSchedule.endDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} (৳{unitPrice.toLocaleString()} / person)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1 font-medium">Primary Traveler Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Tanvir Ahmed"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1 font-medium">Email Address</label>
                      <input
                        type="email"
                        placeholder="tanvir@example.com"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1 font-medium">Phone Number (bKash / WhatsApp)</label>
                      <input
                        type="tel"
                        placeholder="+880 1712-345678"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1 font-medium">Number of Guests</label>
                      <input
                        type="number"
                        min={1}
                        max={tour.maxGroupSize}
                        value={travelersCount}
                        onChange={(e) => setTravelersCount(parseInt(e.target.value) || 1)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">NID / Passport Number (for checkposts)</label>
                    <input
                      type="text"
                      placeholder="e.g. 19921234567890"
                      value={nidOrPassport}
                      onChange={(e) => setNidOrPassport(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:ring-1 focus:ring-teal-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1 font-medium">Emergency Contact Name</label>
                      <input
                        type="text"
                        placeholder="Family contact name"
                        value={emergencyContactName}
                        onChange={(e) => setEmergencyContactName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1 font-medium">Emergency Contact Phone</label>
                      <input
                        type="tel"
                        placeholder="+880 1819-001122"
                        value={emergencyContactPhone}
                        onChange={(e) => setEmergencyContactPhone(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Payment Method in Bangladesh */}
                  <div className="pt-2">
                    <label className="block text-slate-400 mb-2 font-medium">Select Payment Channel</label>
                    <div className="grid grid-cols-4 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("bkash")}
                        className={`p-2 rounded-xl border text-center transition-all ${
                          paymentMethod === "bkash"
                            ? "bg-pink-950/60 border-pink-500 text-white font-bold"
                            : "bg-slate-950 border-slate-800 text-slate-400"
                        }`}
                      >
                        bKash
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("nagad")}
                        className={`p-2 rounded-xl border text-center transition-all ${
                          paymentMethod === "nagad"
                            ? "bg-orange-950/60 border-orange-500 text-white font-bold"
                            : "bg-slate-950 border-slate-800 text-slate-400"
                        }`}
                      >
                        Nagad
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("bank")}
                        className={`p-2 rounded-xl border text-center transition-all ${
                          paymentMethod === "bank"
                            ? "bg-sky-950/60 border-sky-500 text-white font-bold"
                            : "bg-slate-950 border-slate-800 text-slate-400"
                        }`}
                      >
                        Bank
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("card")}
                        className={`p-2 rounded-xl border text-center transition-all ${
                          paymentMethod === "card"
                            ? "bg-teal-950/60 border-teal-500 text-white font-bold"
                            : "bg-slate-950 border-slate-800 text-slate-400"
                        }`}
                      >
                        Card
                      </button>
                    </div>
                  </div>

                  {/* Payment Amount Option */}
                  <div className="pt-2">
                    <label className="block text-slate-400 mb-2 font-medium">Payment Option</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setPayDepositOnly(true)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          payDepositOnly
                            ? "bg-teal-600/10 border-teal-500 text-white"
                            : "bg-slate-950 border-slate-800 text-slate-400"
                        }`}
                      >
                        <div className="font-bold">Pay Deposit Only</div>
                        <div className="text-[11px] text-teal-400 font-semibold">৳{totalDepositAmount.toLocaleString()} today</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPayDepositOnly(false)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          !payDepositOnly
                            ? "bg-teal-600/10 border-teal-500 text-white"
                            : "bg-slate-950 border-slate-800 text-slate-400"
                        }`}
                      >
                        <div className="font-bold">Pay Full Amount</div>
                        <div className="text-[11px] text-slate-300 font-semibold">৳{totalTripPrice.toLocaleString()} today</div>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Payable Now</span>
                    <div className="text-xl font-extrabold text-teal-400">
                      ৳{(payDepositOnly ? totalDepositAmount : totalTripPrice).toLocaleString()}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-lg shadow-teal-600/20 transition-all disabled:opacity-50"
                  >
                    {submitting ? "Processing..." : "Confirm Reservation"}
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
