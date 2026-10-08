"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  MapPin,
  Star,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Luggage,
  ChevronRight,
  X,
  CreditCard,
  Check,
  Clock,
  Users,
  Compass,
  Calendar,
  PenSquare,
  Ticket
} from "lucide-react";
import { TourDetail, API_BASE } from "@/lib/api";
import ImageWithFallback from "@/components/ImageWithFallback";
import { useToast } from "@/lib/toast-context";
import { TourDetailSkeleton } from "@/components/ui/Skeletons";
import TravelVoucherModal from "@/components/ui/TravelVoucherModal";
import PackingChecklist from "@/components/tours/PackingChecklist";
import ReviewSubmissionModal, { SubmittedReview } from "@/components/tours/ReviewSubmissionModal";

export default function TourDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const { toast } = useToast();

  const [tour, setTour] = useState<TourDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"itinerary" | "dates" | "inclusions" | "reviews">("itinerary");
  const [customReviews, setCustomReviews] = useState<SubmittedReview[]>([]);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [voucherModalOpen, setVoucherModalOpen] = useState(false);

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
        specialRequests: `Payment Channel: ${paymentMethod.toUpperCase()}`,
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
        toast.success("Reservation Confirmed!", `Reference: ${result.bookingReference}`);
      } else {
        const errorData = await res.json().catch(() => ({}));
        const msg = errorData.message || "Failed to secure booking. Please check available seats.";
        toast.error("Reservation Error", msg);
      }
    } catch (err) {
      console.error(err);
      toast.error("Submission Error", "Error submitting reservation. Please check your connection.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <TourDetailSkeleton />;
  }

  if (!tour) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-24 text-center space-y-4">
        <h2 className="text-3xl font-serif font-bold text-stone-900">Tour Package Not Found</h2>
        <p className="text-stone-600 text-base">The requested tour itinerary is either inactive or does not exist.</p>
        <Link href="/destinations" className="inline-block px-6 py-3 rounded-full bg-stone-900 text-stone-50 text-sm font-semibold hover:bg-stone-800 transition-colors">
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

  // Safe rating and reviews calculation
  const reviewsCount = tour.totalReviews ?? tour.reviews?.length ?? 16;
  const avgRating =
    typeof tour.averageRating === "number" && !isNaN(tour.averageRating)
      ? tour.averageRating
      : tour.reviews && tour.reviews.length > 0
      ? tour.reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / tour.reviews.length
      : 4.8;

  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] pb-24">
      {/* Breadcrumb Navigation */}
      <div className="w-full max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-14 2xl:px-20 py-5">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-stone-500">
          <Link href="/" className="hover:text-stone-900 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/destinations" className="hover:text-stone-900 transition-colors">Destinations</Link>
          <span>/</span>
          <span className="text-stone-800 truncate font-semibold">{tour.title}</span>
        </div>
      </div>

      {/* Hero Header & Gallery */}
      <div className="w-full max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-14 2xl:px-20 space-y-6">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200/80">
              {tour.category}
            </span>
            <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#F5F2EB] text-stone-700 border border-stone-200">
              {tour.region}
            </span>
            <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#F5F2EB] text-stone-700 border border-stone-200">
              Difficulty: {tour.difficulty}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-stone-900 tracking-tight">
            {tour.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-stone-600">
            <span className="flex items-center gap-1.5 font-medium text-stone-800">
              <MapPin className="h-4 w-4 text-amber-800" />
              {tour.destination}, Bangladesh
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
              <strong className="text-stone-900 font-bold">{avgRating.toFixed(1)}</strong> ({reviewsCount} verified traveler reviews)
            </span>
            <span>•</span>
            <span className="text-stone-800 font-semibold flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-700" />
              Verified Local Guides &amp; Safety Protocol
            </span>
          </div>
        </div>

        {/* Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[380px] sm:h-[480px] rounded-3xl overflow-hidden border border-[#EBE6DC] shadow-sm">
          <div className="md:col-span-2 relative h-full bg-stone-100">
            <ImageWithFallback
              src={tour.coverImageUrl}
              fallbackSrc="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80"
              alt={tour.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="hidden md:grid grid-rows-2 gap-4 h-full">
            {tour.galleryImages?.slice(0, 2).map((img, i) => (
              <div key={i} className="relative h-full overflow-hidden bg-stone-100">
                <ImageWithFallback
                  src={img}
                  fallbackSrc="https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?auto=format&fit=crop&w=1200&q=80"
                  alt={`${tour.title} ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Key Quick Facts Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-white border border-[#EBE6DC] rounded-3xl p-5 sm:p-6 text-xs sm:text-sm shadow-xs">
          <div>
            <span className="text-stone-400 uppercase font-bold text-[11px] tracking-wider block">Duration</span>
            <div className="font-serif font-bold text-stone-900 text-base sm:text-lg pt-0.5">{tour.durationDays} Days / {tour.durationNights} Nights</div>
          </div>
          <div>
            <span className="text-stone-400 uppercase font-bold text-[11px] tracking-wider block">Group Size</span>
            <div className="font-serif font-bold text-stone-900 text-base sm:text-lg pt-0.5">Max {tour.maxGroupSize} Guests</div>
          </div>
          <div>
            <span className="text-stone-400 uppercase font-bold text-[11px] tracking-wider block">Departure Hub</span>
            <div className="font-serif font-bold text-stone-900 text-base sm:text-lg pt-0.5 truncate">{tour.startCity}</div>
          </div>
          <div>
            <span className="text-stone-400 uppercase font-bold text-[11px] tracking-wider block">Best Season</span>
            <div className="font-serif font-bold text-stone-900 text-base sm:text-lg pt-0.5 truncate">{tour.idealSeason}</div>
          </div>
          <div>
            <span className="text-stone-400 uppercase font-bold text-[11px] tracking-wider block">Booking Deposit</span>
            <div className="font-serif font-bold text-amber-900 text-base sm:text-lg pt-0.5">BDT {depositPerPerson.toLocaleString()} / seat</div>
          </div>
        </div>
      </div>

      {/* Main Content & Sticky Booking Card */}
      <div className="w-full max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-14 2xl:px-20 pt-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Itinerary, Dates, Inclusions, Reviews */}
        <div className="lg:col-span-2 space-y-10">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-[#EBE6DC] pb-2 text-xs sm:text-sm font-semibold overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab("itinerary")}
              className={`px-5 py-2.5 rounded-full transition-all whitespace-nowrap ${
                activeTab === "itinerary" ? "bg-stone-900 text-stone-50 shadow-xs" : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
              }`}
            >
              Tour Itinerary
            </button>
            <button
              onClick={() => setActiveTab("dates")}
              className={`px-5 py-2.5 rounded-full transition-all whitespace-nowrap ${
                activeTab === "dates" ? "bg-stone-900 text-stone-50 shadow-xs" : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
              }`}
            >
              Dates &amp; Seats ({tour.schedules?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab("inclusions")}
              className={`px-5 py-2.5 rounded-full transition-all whitespace-nowrap ${
                activeTab === "inclusions" ? "bg-stone-900 text-stone-50 shadow-xs" : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
              }`}
            >
              Inclusions &amp; Packing
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`px-5 py-2.5 rounded-full transition-all whitespace-nowrap ${
                activeTab === "reviews" ? "bg-stone-900 text-stone-50 shadow-xs" : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
              }`}
            >
              Traveler Reviews ({tour.reviews?.length || 0})
            </button>
          </div>

          {/* Description Narrative */}
          <div className="space-y-4 bg-white border border-[#EBE6DC] rounded-3xl p-6 sm:p-8 shadow-xs">
            <h3 className="text-2xl font-serif font-bold text-stone-900">Tour Overview &amp; Experience</h3>
            <p className="text-sm sm:text-base text-stone-600 leading-relaxed whitespace-pre-line">
              {tour.description}
            </p>

            {/* Highlights */}
            {tour.highlights && tour.highlights.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-[#F0EBE1]">
                <h4 className="text-xs uppercase tracking-wider font-bold text-amber-800">Trip Highlights</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {tour.highlights.map((hl, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-stone-700 bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#E5DFD5]">
                      <CheckCircle2 className="h-4 w-4 text-amber-800 shrink-0 mt-0.5" />
                      <span>{hl}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Tab 1: Daily Itinerary */}
          {activeTab === "itinerary" && (
            <div className="space-y-6 bg-white border border-[#EBE6DC] rounded-3xl p-6 sm:p-8 shadow-xs">
              <h3 className="text-2xl font-serif font-bold text-stone-900">Day-by-Day Travel Schedule</h3>
              <div className="relative border-l-2 border-stone-200 ml-4 space-y-8 pl-6 pt-2">
                {tour.itineraryDays?.map((day) => (
                  <div key={day.id} className="relative space-y-2">
                    <div className="absolute -left-[31px] top-1.5 h-3.5 w-3.5 rounded-full bg-stone-900 border-2 border-white shadow-xs" />

                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                        Day {day.dayNumber} • {day.location || "En Route"}
                      </span>
                      {day.activityMetrics && (
                        <span className="text-xs text-stone-600 px-2.5 py-0.5 rounded-full bg-[#FAF8F5] border border-stone-200">
                          {day.activityMetrics}
                        </span>
                      )}
                    </div>

                    <h4 className="text-lg sm:text-xl font-serif font-bold text-stone-900">{day.title}</h4>
                    <p className="text-sm text-stone-600 leading-relaxed">{day.description}</p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500 pt-1">
                      {day.accommodation && (
                        <span>
                          <strong className="text-stone-800">Lodging:</strong> {day.accommodation}
                        </span>
                      )}
                      {day.mealsIncluded && (
                        <span>
                          <strong className="text-stone-800">Meals:</strong> {day.mealsIncluded}
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
            <div className="space-y-4 bg-white border border-[#EBE6DC] rounded-3xl p-6 sm:p-8 shadow-xs">
              <h3 className="text-2xl font-serif font-bold text-stone-900">Upcoming Guaranteed Batch Dates</h3>
              <div className="overflow-x-auto rounded-2xl border border-[#E5DFD5]">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-[#FAF8F5] text-stone-500 uppercase font-semibold border-b border-[#E5DFD5]">
                    <tr>
                      <th className="py-3.5 px-4">Departure Dates</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Available Seats</th>
                      <th className="py-3.5 px-4">Price / Person</th>
                      <th className="py-3.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0EBE1]">
                    {tour.schedules?.map((s) => (
                      <tr key={s.id} className="hover:bg-stone-50/70 transition-colors">
                        <td className="py-4 px-4 font-bold text-stone-900">
                          {new Date(s.startDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} –{" "}
                          {new Date(s.endDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </td>
                        <td className="py-4 px-4">
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {s.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-medium text-stone-600">
                          {s.totalSeats - s.bookedSeats} of {s.totalSeats} seats left
                        </td>
                        <td className="py-4 px-4 font-bold text-stone-900">BDT {s.pricePerPerson.toLocaleString()}</td>
                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedScheduleId(s.id);
                              setBookingModalOpen(true);
                            }}
                            className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-50 font-semibold text-xs shadow-xs transition-colors"
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
                <div className="bg-white border border-[#EBE6DC] rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
                  <h4 className="text-lg font-serif font-bold text-stone-900 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-700" />
                    What Is Included
                  </h4>
                  <ul className="space-y-2.5 text-xs sm:text-sm text-stone-600">
                    {tour.inclusions?.map((inc, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
                        <span>{inc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white border border-[#EBE6DC] rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
                  <h4 className="text-lg font-serif font-bold text-stone-900 flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-rose-500" />
                    What Is Excluded
                  </h4>
                  <ul className="space-y-2.5 text-xs sm:text-sm text-stone-500">
                    {tour.exclusions?.map((exc, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-rose-500 font-bold shrink-0">✕</span>
                        <span>{exc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Interactive Packing Checklist */}
              <PackingChecklist
                tourTitle={tour.title}
                tourSlug={tour.slug}
                packingTips={tour.packingTips}
              />
            </div>
          )}

          {/* Tab 4: Reviews */}
          {activeTab === "reviews" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#EBE6DC]">
                <div>
                  <h3 className="text-2xl font-serif font-bold text-stone-900">
                    Verified Traveler Testimonials
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Real feedback from travelers who explored {tour.destination}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-stone-900 hover:bg-stone-800 text-stone-50 font-semibold text-xs transition-colors shadow-xs self-start sm:self-auto"
                >
                  <PenSquare className="w-4 h-4" />
                  <span>Write a Review</span>
                </button>
              </div>

              <div className="space-y-4">
                {[...customReviews, ...(tour.reviews || [])].map((rev) => (
                  <div key={rev.id} className="bg-white border border-[#EBE6DC] rounded-3xl p-6 sm:p-8 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-amber-500">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-amber-500" />
                        ))}
                      </div>
                      <span className="text-xs text-stone-400">{rev.tripDateFormatted}</span>
                    </div>

                    <h4 className="text-base sm:text-lg font-serif font-bold text-stone-900">{rev.title}</h4>
                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">{rev.comment}</p>

                    <div className="pt-2 text-xs font-semibold text-stone-900">
                      {rev.reviewerName} • <span className="text-stone-500 font-normal">{rev.reviewerLocation}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Sticky Reservation Box */}
        <div className="lg:col-span-1">
          <div className="sticky top-28 bg-white border border-[#EBE6DC] rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="space-y-1">
              <span className="text-[11px] text-stone-400 uppercase font-bold tracking-wider">Per Person Fare</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-serif font-bold text-stone-900">
                  BDT {unitPrice.toLocaleString()}
                </span>
                {tour.discountPrice && (
                  <span className="text-sm text-stone-400 line-through">
                    BDT {tour.basePrice.toLocaleString()}
                  </span>
                )}
              </div>
              <div className="text-xs sm:text-sm text-amber-800 font-medium">
                Reserve seats with BDT {depositPerPerson.toLocaleString()} deposit
              </div>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block text-stone-700 mb-1 font-semibold">Select Departure Date</label>
                <select
                  value={selectedScheduleId}
                  onChange={(e) => setSelectedScheduleId(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#E5DFD5] rounded-2xl px-3.5 py-3 text-stone-900 focus:outline-none focus:border-stone-900 cursor-pointer"
                >
                  {tour.schedules?.map((s) => (
                    <option key={s.id} value={s.id}>
                      {new Date(s.startDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} – {new Date(s.endDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} ({s.totalSeats - s.bookedSeats} seats left)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-stone-700 mb-1 font-semibold">Number of Travelers</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setTravelersCount(Math.max(1, travelersCount - 1))}
                    className="h-10 w-10 rounded-xl bg-[#FAF8F5] border border-[#E5DFD5] text-stone-800 font-bold hover:bg-stone-200 transition-colors"
                  >
                    -
                  </button>
                  <span className="text-base font-bold text-stone-900 px-2">{travelersCount}</span>
                  <button
                    type="button"
                    onClick={() => setTravelersCount(Math.min(tour.maxGroupSize, travelersCount + 1))}
                    className="h-10 w-10 rounded-xl bg-[#FAF8F5] border border-[#E5DFD5] text-stone-800 font-bold hover:bg-stone-200 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="border-t border-[#F0EBE1] pt-4 space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between text-stone-600">
                <span>Total Fare ({travelersCount} guest{travelersCount > 1 ? "s" : ""})</span>
                <span className="text-stone-900 font-semibold">BDT {totalTripPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Deposit Payable Now</span>
                <span className="text-amber-900 font-bold">BDT {totalDepositAmount.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={() => setBookingModalOpen(true)}
              className="w-full py-3.5 rounded-2xl bg-stone-900 hover:bg-stone-800 text-stone-50 text-sm font-semibold shadow-xs transition-all flex items-center justify-center gap-2"
            >
              <span>Book This Tour</span>
              <ChevronRight className="h-4 w-4" />
            </button>

            <div className="text-xs text-stone-500 text-center space-y-1">
              <div>✓ Instant booking confirmation voucher</div>
              <div>✓ Support via bKash, Nagad &amp; Bank Transfer</div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Form Modal */}
      {bookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white border border-[#EBE6DC] rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative my-8">
            <button
              onClick={() => {
                setBookingModalOpen(false);
                setConfirmedBookingRef(null);
              }}
              className="absolute top-5 right-5 h-8 w-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 hover:text-stone-900 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            {confirmedBookingRef ? (
              <div className="py-8 text-center space-y-5">
                <div className="h-16 w-16 mx-auto rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-stone-900">Booking Confirmed!</h3>
                <p className="text-sm text-stone-600 max-w-md mx-auto">
                  Your official reservation voucher has been created. Keep your booking reference handy for checkposts.
                </p>
                <div className="inline-block px-6 py-3 bg-[#FAF8F5] border border-amber-300 rounded-2xl font-mono text-xl font-bold text-amber-900">
                  {confirmedBookingRef}
                </div>
                <div className="pt-4 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => setVoucherModalOpen(true)}
                    className="flex-1 py-3 rounded-full bg-stone-900 hover:bg-stone-800 text-stone-50 text-sm font-semibold transition-all text-center shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <Ticket className="w-4 h-4" />
                    <span>View Boarding Pass</span>
                  </button>
                  <Link
                    href={`/manage?ref=${confirmedBookingRef}&email=${encodeURIComponent(customerEmail)}`}
                    className="flex-1 py-3 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-900 text-sm font-semibold transition-all text-center"
                  >
                    Manage Reservation
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div>
                  <span className="text-xs text-amber-800 uppercase font-bold tracking-wider">
                    Reservation Form
                  </span>
                  <h3 className="text-xl font-serif font-bold text-stone-900 line-clamp-1">{tour.title}</h3>
                </div>

                <div className="space-y-3 text-xs sm:text-sm">
                  <div>
                    <label className="block text-stone-700 mb-1 font-semibold">Selected Batch Schedule</label>
                    <div className="bg-[#FAF8F5] border border-[#E5DFD5] rounded-2xl px-4 py-2.5 text-stone-900 font-medium">
                      {selectedSchedule && (
                        <span>
                          {new Date(selectedSchedule.startDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} –{" "}
                          {new Date(selectedSchedule.endDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} (BDT {unitPrice.toLocaleString()} / seat)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-stone-700 mb-1 font-semibold">Primary Traveler Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Tanvir Ahmed"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full bg-[#FAF8F5] border border-[#E5DFD5] rounded-2xl px-4 py-2.5 text-stone-900 focus:outline-none focus:border-stone-900"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-stone-700 mb-1 font-semibold">Email Address</label>
                      <input
                        type="email"
                        placeholder="tanvir@example.com"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className="w-full bg-[#FAF8F5] border border-[#E5DFD5] rounded-2xl px-4 py-2.5 text-stone-900 focus:outline-none focus:border-stone-900"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-stone-700 mb-1 font-semibold">Phone Number (bKash / WhatsApp)</label>
                      <input
                        type="tel"
                        placeholder="+880 1712-345678"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full bg-[#FAF8F5] border border-[#E5DFD5] rounded-2xl px-4 py-2.5 text-stone-900 focus:outline-none focus:border-stone-900"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-stone-700 mb-1 font-semibold">Number of Guests</label>
                      <input
                        type="number"
                        min={1}
                        max={tour.maxGroupSize}
                        value={travelersCount}
                        onChange={(e) => setTravelersCount(parseInt(e.target.value) || 1)}
                        className="w-full bg-[#FAF8F5] border border-[#E5DFD5] rounded-2xl px-4 py-2.5 text-stone-900 focus:outline-none focus:border-stone-900"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-stone-700 mb-1 font-semibold">NID / Passport Number (for checkposts)</label>
                    <input
                      type="text"
                      placeholder="e.g. 19921234567890"
                      value={nidOrPassport}
                      onChange={(e) => setNidOrPassport(e.target.value)}
                      className="w-full bg-[#FAF8F5] border border-[#E5DFD5] rounded-2xl px-4 py-2.5 text-stone-900 font-mono focus:outline-none focus:border-stone-900"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-stone-700 mb-1 font-semibold">Emergency Contact Name</label>
                      <input
                        type="text"
                        placeholder="Family member name"
                        value={emergencyContactName}
                        onChange={(e) => setEmergencyContactName(e.target.value)}
                        className="w-full bg-[#FAF8F5] border border-[#E5DFD5] rounded-2xl px-4 py-2.5 text-stone-900 focus:outline-none focus:border-stone-900"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-stone-700 mb-1 font-semibold">Emergency Contact Phone</label>
                      <input
                        type="tel"
                        placeholder="+880 1819-001122"
                        value={emergencyContactPhone}
                        onChange={(e) => setEmergencyContactPhone(e.target.value)}
                        className="w-full bg-[#FAF8F5] border border-[#E5DFD5] rounded-2xl px-4 py-2.5 text-stone-900 focus:outline-none focus:border-stone-900"
                        required
                      />
                    </div>
                  </div>

                  {/* Payment Channel in Bangladesh */}
                  <div className="pt-2">
                    <label className="block text-stone-700 mb-2 font-semibold">Select Payment Channel</label>
                    <div className="grid grid-cols-4 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("bkash")}
                        className={`p-2.5 rounded-2xl border text-center transition-all ${
                          paymentMethod === "bkash"
                            ? "bg-pink-50 border-pink-500 text-pink-700 font-bold"
                            : "bg-[#FAF8F5] border-[#E5DFD5] text-stone-600 hover:bg-stone-100"
                        }`}
                      >
                        bKash
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("nagad")}
                        className={`p-2.5 rounded-2xl border text-center transition-all ${
                          paymentMethod === "nagad"
                            ? "bg-orange-50 border-orange-500 text-orange-700 font-bold"
                            : "bg-[#FAF8F5] border-[#E5DFD5] text-stone-600 hover:bg-stone-100"
                        }`}
                      >
                        Nagad
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("bank")}
                        className={`p-2.5 rounded-2xl border text-center transition-all ${
                          paymentMethod === "bank"
                            ? "bg-sky-50 border-sky-500 text-sky-700 font-bold"
                            : "bg-[#FAF8F5] border-[#E5DFD5] text-stone-600 hover:bg-stone-100"
                        }`}
                      >
                        Bank
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("card")}
                        className={`p-2.5 rounded-2xl border text-center transition-all ${
                          paymentMethod === "card"
                            ? "bg-amber-50 border-amber-500 text-amber-900 font-bold"
                            : "bg-[#FAF8F5] border-[#E5DFD5] text-stone-600 hover:bg-stone-100"
                        }`}
                      >
                        Card
                      </button>
                    </div>
                  </div>

                  {/* Payment Amount Option */}
                  <div className="pt-2">
                    <label className="block text-stone-700 mb-2 font-semibold">Payment Option</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setPayDepositOnly(true)}
                        className={`p-3.5 rounded-2xl border text-left transition-all ${
                          payDepositOnly
                            ? "bg-amber-50 border-amber-600 text-amber-950 font-medium"
                            : "bg-[#FAF8F5] border-[#E5DFD5] text-stone-600 hover:bg-stone-100"
                        }`}
                      >
                        <div className="font-bold text-sm">Pay Deposit Only</div>
                        <div className="text-xs text-amber-900 font-semibold">BDT {totalDepositAmount.toLocaleString()} today</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPayDepositOnly(false)}
                        className={`p-3.5 rounded-2xl border text-left transition-all ${
                          !payDepositOnly
                            ? "bg-amber-50 border-amber-600 text-amber-950 font-medium"
                            : "bg-[#FAF8F5] border-[#E5DFD5] text-stone-600 hover:bg-stone-100"
                        }`}
                      >
                        <div className="font-bold text-sm">Pay Full Amount</div>
                        <div className="text-xs text-stone-600 font-semibold">BDT {totalTripPrice.toLocaleString()} today</div>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#F0EBE1] flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-stone-500 uppercase font-semibold">Payable Now</span>
                    <div className="text-2xl font-serif font-bold text-stone-900">
                      BDT {(payDepositOnly ? totalDepositAmount : totalTripPrice).toLocaleString()}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-3 rounded-full bg-stone-900 hover:bg-stone-800 text-stone-50 text-sm font-semibold shadow-xs transition-all disabled:opacity-50"
                  >
                    {submitting ? "Processing..." : "Confirm Reservation"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Review Submission Modal */}
      {reviewModalOpen && tour && (
        <ReviewSubmissionModal
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          tourTitle={tour.title}
          tourPackageId={tour.id}
          onSuccess={(newRev) => {
            setCustomReviews((prev) => [newRev, ...prev]);
          }}
        />
      )}

      {/* Travel Voucher Modal */}
      {voucherModalOpen && tour && confirmedBookingRef && (
        <TravelVoucherModal
          isOpen={voucherModalOpen}
          onClose={() => setVoucherModalOpen(false)}
          voucher={{
            voucherNumber: `PASS-${confirmedBookingRef}`,
            bookingRef: confirmedBookingRef,
            travelerName: customerName,
            phone: customerPhone,
            tourTitle: tour.title,
            destination: tour.destination,
            departureDate: selectedSchedule
              ? new Date(selectedSchedule.startDate).toLocaleDateString("en-GB", { dateStyle: "long" })
              : "Upcoming Departure",
            duration: `${tour.durationDays} Days / ${tour.durationNights} Nights`,
            guestsCount: travelersCount,
            totalPrice: payDepositOnly ? totalDepositAmount : totalTripPrice,
            pickupPoint: "Sayedabad / Central Bus Terminal / Police Camp",
            status: "Confirmed",
          }}
        />
      )}
    </div>
  );
}
