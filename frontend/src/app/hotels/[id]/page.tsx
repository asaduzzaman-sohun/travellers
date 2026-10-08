"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Star,
  MapPin,
  Check,
  X,
  PhoneCall,
  Mail,
  Clock,
  Compass,
  Share2,
  Bookmark,
  Calendar,
  Users,
  Building2,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Info,
  CheckCircle2
} from "lucide-react";
import { getHotelById } from "@/lib/hotels-data";
import ImageWithFallback from "@/components/ImageWithFallback";

export default function HotelDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const hotel = getHotelById(resolvedParams.id);

  const [bookmarked, setBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);
  const [inquiryName, setInquiryName] = useState("");
  const [inquiryPhone, setInquiryPhone] = useState("");
  const [inquiryGuests, setInquiryGuests] = useState("2");
  const [inquirySubmitted, setInquirySubmitted] = useState(false);

  if (!hotel) {
    return (
      <div className="w-full min-h-[60vh] bg-[#FAF8F5] flex items-center justify-center py-20 px-6">
        <div className="max-w-md w-full bg-white border border-[#EBE6DC] rounded-3xl p-8 text-center space-y-4 shadow-sm">
          <Info className="h-10 w-10 text-stone-400 mx-auto" />
          <h1 className="text-2xl font-serif font-bold text-stone-900">Property Not Found</h1>
          <p className="text-sm text-stone-600">
            The hotel or resort review you are looking for is unavailable or has been relocated.
          </p>
          <Link
            href="/hotels"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-stone-900 text-stone-50 text-sm font-semibold hover:bg-stone-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Hotels Directory</span>
          </Link>
        </div>
      </div>
    );
  }

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setInquirySubmitted(true);
  };

  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] pb-28">
      {/* Breadcrumb Navigation */}
      <section className="border-b border-[#EBE6DC] bg-[#FAF8F5]/60 py-4">
        <div className="w-full max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-14 2xl:px-20">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-stone-500">
            <Link href="/" className="hover:text-stone-900 transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/hotels" className="hover:text-stone-900 transition-colors">
              Hotels Review
            </Link>
            <span>/</span>
            <span className="text-stone-800 font-semibold truncate max-w-xs sm:max-w-md">
              {hotel.name}
            </span>
          </div>
        </div>
      </section>

      {/* Hero Header */}
      <header className="border-b border-[#EBE6DC] bg-[#FAF8F5] py-12 sm:py-16">
        <div className="w-full max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-14 2xl:px-20">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-4 max-w-4xl">
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-3.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200/80">
                  {hotel.tier} Property
                </span>
                <span className="px-3.5 py-1 rounded-full text-xs font-semibold bg-[#F5F2EB] text-stone-800 border border-stone-200">
                  {hotel.place}
                </span>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E5DFD5] text-xs font-bold text-stone-900 shadow-2xs">
                  <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                  <span>{hotel.rating.toFixed(1)}</span>
                  <span className="text-stone-400 font-normal">({hotel.reviewsCount} reviews)</span>
                </div>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-stone-900 tracking-tight leading-[1.12]">
                {hotel.name}
              </h1>

              <div className="flex items-center gap-2 text-sm sm:text-base text-stone-600">
                <MapPin className="h-4 w-4 text-amber-800 shrink-0" />
                <span>{hotel.location}</span>
              </div>
            </div>

            {/* Pricing & Booking Action */}
            <div className="space-y-3 shrink-0">
              <div className="text-left lg:text-right">
                <span className="text-xs text-stone-500 uppercase font-semibold tracking-wider">Typical Nightly Rate</span>
                <div className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">{hotel.pricePerNight}</div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setInquiryModalOpen(true)}
                  className="px-6 py-3 rounded-full bg-stone-900 hover:bg-stone-800 text-stone-50 text-sm font-semibold transition-all shadow-xs"
                >
                  Direct Booking Inquiry
                </button>

                <button
                  onClick={() => setBookmarked(!bookmarked)}
                  className={`p-3 rounded-full border transition-all ${
                    bookmarked
                      ? "bg-stone-900 text-stone-50 border-stone-900"
                      : "bg-white text-stone-800 border-[#E5DFD5] hover:bg-[#F5F2EB]"
                  }`}
                  title="Bookmark Resort"
                >
                  <Bookmark className="h-4 w-4" />
                </button>

                <button
                  onClick={handleShare}
                  className="p-3 rounded-full bg-white text-stone-800 border border-[#E5DFD5] hover:bg-[#F5F2EB] transition-all shadow-2xs"
                  title="Share Property"
                >
                  <Share2 className="h-4 w-4" />
                </button>
              </div>
              {copied && <p className="text-xs text-emerald-700 font-medium text-right">Link copied to clipboard!</p>}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="w-full max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-14 2xl:px-20 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Details (8 cols) */}
          <div className="lg:col-span-8 space-y-10">
            {/* Gallery */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-3xl overflow-hidden border border-[#EBE6DC] shadow-sm bg-stone-100">
              <div className="sm:col-span-2 h-72 sm:h-96 relative">
                <ImageWithFallback
                  src={hotel.coverImage}
                  alt={hotel.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col gap-4 h-72 sm:h-96">
                {hotel.galleryImages.slice(0, 2).map((img, i) => (
                  <div key={i} className="h-1/2 relative overflow-hidden bg-stone-100">
                    <ImageWithFallback
                      src={img}
                      alt={`${hotel.name} photo ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Overview */}
            <div className="bg-white border border-[#EBE6DC] rounded-3xl p-6 sm:p-10 space-y-4 shadow-sm">
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
                Property Overview &amp; Experience
              </h2>
              <p className="text-base sm:text-lg text-stone-600 leading-relaxed">
                {hotel.description}
              </p>
            </div>

            {/* Verified Pros & Cons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white border border-emerald-200/80 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
                <h3 className="text-lg font-serif font-bold text-emerald-900 flex items-center gap-2">
                  <Check className="h-5 w-5 text-emerald-700" />
                  <span>What Travelers Loved</span>
                </h3>
                <ul className="space-y-3 text-sm text-stone-700 leading-relaxed">
                  {hotel.pros.map((p, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="text-emerald-700 font-bold shrink-0 mt-0.5">•</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
                <h3 className="text-lg font-serif font-bold text-stone-900 flex items-center gap-2">
                  <X className="h-5 w-5 text-rose-500" />
                  <span>Things to Keep in Mind</span>
                </h3>
                <ul className="space-y-3 text-sm text-stone-700 leading-relaxed">
                  {hotel.cons.map((c, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="text-stone-400 font-bold shrink-0 mt-0.5">•</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Available Room Types & Tariffs */}
            <div className="bg-white border border-[#EBE6DC] rounded-3xl p-6 sm:p-10 space-y-6 shadow-sm">
              <div className="space-y-1 border-b border-[#F0EBE1] pb-4">
                <span className="text-xs font-semibold uppercase tracking-widest text-amber-800">
                  Accommodations
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
                  Available Room Types &amp; BDT Rates
                </h2>
              </div>

              <div className="space-y-4">
                {hotel.roomTypes.map((room, idx) => (
                  <div
                    key={idx}
                    className="p-5 sm:p-6 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5] space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h3 className="text-lg font-serif font-bold text-stone-900">{room.name}</h3>
                        <div className="text-xs text-stone-500 flex items-center gap-3 mt-0.5">
                          <span>Capacity: {room.capacity}</span>
                          <span>•</span>
                          <span>Bed: {room.bedType}</span>
                        </div>
                      </div>
                      <div className="text-lg font-bold text-stone-900 font-serif">
                        {room.priceBDT}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {room.highlights.map((h, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 rounded-full bg-white border border-[#EBE6DC] text-xs text-stone-700 font-medium"
                        >
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Amenities */}
            <div className="bg-white border border-[#EBE6DC] rounded-3xl p-6 sm:p-10 space-y-6 shadow-sm">
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
                Property Amenities &amp; Services
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {hotel.amenities.map((am, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5] flex items-center gap-2.5 text-xs sm:text-sm font-medium text-stone-800"
                  >
                    <CheckCircle2 className="h-4 w-4 text-amber-800 shrink-0" />
                    <span>{am}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* How to Reach */}
            <div className="bg-white border border-[#EBE6DC] rounded-3xl p-6 sm:p-10 space-y-4 shadow-sm">
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 flex items-center gap-2.5">
                <Compass className="h-6 w-6 text-amber-800" />
                <span>How to Reach This Property</span>
              </h2>
              <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
                {hotel.howToReach}
              </p>
            </div>
          </div>

          {/* Right Column: Contact & Booking Info (4 cols) */}
          <aside className="lg:col-span-4 space-y-8">
            <div className="bg-white border border-[#EBE6DC] rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm sticky top-28">
              <div className="space-y-1 border-b border-[#F0EBE1] pb-4">
                <span className="text-xs font-semibold uppercase tracking-widest text-amber-800">
                  Direct Front Desk
                </span>
                <h3 className="text-xl font-serif font-bold text-stone-900">
                  Reception Contact
                </h3>
              </div>

              <div className="space-y-3.5 text-sm">
                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5] space-y-1">
                  <span className="text-[11px] font-bold uppercase text-stone-500">Phone Hotline</span>
                  <div className="font-mono text-base font-bold text-stone-900 flex items-center gap-2">
                    <PhoneCall className="h-4 w-4 text-amber-800" />
                    <span>{hotel.receptionPhone}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5] space-y-1">
                  <span className="text-[11px] font-bold uppercase text-stone-500">Official Email</span>
                  <div className="text-sm font-semibold text-stone-900 flex items-center gap-2 truncate">
                    <Mail className="h-4 w-4 text-stone-500" />
                    <span className="truncate">{hotel.receptionEmail}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5]">
                    <span className="text-stone-400 block font-semibold">Check-in</span>
                    <strong className="text-stone-900">{hotel.checkInTime}</strong>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5]">
                    <span className="text-stone-400 block font-semibold">Check-out</span>
                    <strong className="text-stone-900">{hotel.checkOutTime}</strong>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setInquiryModalOpen(true)}
                className="w-full py-3.5 rounded-full bg-stone-900 hover:bg-stone-800 text-stone-50 text-sm font-semibold transition-all shadow-xs text-center"
              >
                Send Booking Inquiry
              </button>

              {/* Nearby Attractions */}
              <div className="pt-4 border-t border-[#F0EBE1] space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                  Nearby Excursions
                </h4>
                <div className="space-y-2 text-xs sm:text-sm">
                  {hotel.nearbyAttractions.map((att, i) => (
                    <div key={i} className="flex justify-between items-center py-1">
                      <span className="text-stone-700">{att.name}</span>
                      <span className="text-stone-400 font-mono text-xs">{att.distance}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Related Tour Package */}
              {hotel.relatedTourSlug && (
                <div className="pt-4 border-t border-[#F0EBE1] space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-800">
                    Featured Guided Tour
                  </span>
                  <Link
                    href={`/tours/${hotel.relatedTourSlug}`}
                    className="group block p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5] hover:border-stone-400 transition-all space-y-2"
                  >
                    <div className="text-sm font-serif font-bold text-stone-900 group-hover:text-amber-800 transition-colors line-clamp-2">
                      {hotel.relatedTourTitle}
                    </div>
                    <div className="text-xs text-stone-500 flex items-center justify-between">
                      <span>View Tour Details</span>
                      <ChevronRight className="h-4 w-4 text-stone-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* Inquiry Modal */}
      {inquiryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/50 backdrop-blur-xs">
          <div className="bg-white border border-[#EBE6DC] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => {
                setInquiryModalOpen(false);
                setInquirySubmitted(false);
              }}
              className="absolute top-5 right-5 h-8 w-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-700"
            >
              <X className="h-4 w-4" />
            </button>

            {inquirySubmitted ? (
              <div className="py-8 text-center space-y-4">
                <div className="h-14 w-14 mx-auto rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Check className="h-7 w-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-serif font-bold text-stone-900">Inquiry Transmitted</h3>
                  <p className="text-xs sm:text-sm text-stone-600 max-w-sm mx-auto leading-relaxed">
                    Your reservation inquiry has been forwarded directly to {hotel.name}&apos;s front desk desk. Their team will contact you via phone or WhatsApp.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setInquiryModalOpen(false);
                    setInquirySubmitted(false);
                  }}
                  className="px-6 py-2.5 rounded-full bg-stone-900 text-stone-50 text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            ) : (
              <div>
                <h3 className="text-2xl font-serif font-bold text-stone-900 mb-1">
                  Reservation Inquiry
                </h3>
                <p className="text-xs text-stone-500 mb-5">
                  Direct inquiry for <strong>{hotel.name}</strong> ({hotel.location})
                </p>

                <form onSubmit={handleInquirySubmit} className="space-y-4 text-xs sm:text-sm">
                  <div className="space-y-1.5">
                    <label className="block text-stone-800 font-semibold">Your Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tanvir Ahmed"
                      value={inquiryName}
                      onChange={(e) => setInquiryName(e.target.value)}
                      className="w-full bg-[#FAF8F5] border border-[#E5DFD5] rounded-2xl px-4 py-2.5 text-stone-900 focus:bg-white focus:outline-none focus:border-stone-900"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-stone-800 font-semibold">Phone (WhatsApp / bKash)</label>
                    <input
                      type="tel"
                      required
                      placeholder="+880 1711-234567"
                      value={inquiryPhone}
                      onChange={(e) => setInquiryPhone(e.target.value)}
                      className="w-full bg-[#FAF8F5] border border-[#E5DFD5] rounded-2xl px-4 py-2.5 text-stone-900 focus:bg-white focus:outline-none focus:border-stone-900"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-stone-800 font-semibold">Number of Guests</label>
                    <select
                      value={inquiryGuests}
                      onChange={(e) => setInquiryGuests(e.target.value)}
                      className="w-full bg-[#FAF8F5] border border-[#E5DFD5] rounded-2xl px-3 py-2.5 text-stone-900 focus:outline-none focus:border-stone-900 cursor-pointer"
                    >
                      <option value="1">1 Traveler</option>
                      <option value="2">2 Travelers (Couple)</option>
                      <option value="3">3 Travelers</option>
                      <option value="4">4 Travelers (Family)</option>
                      <option value="5+">5+ Travelers (Group)</option>
                    </select>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-full bg-stone-900 hover:bg-stone-800 text-stone-50 font-semibold shadow-xs"
                    >
                      Submit Reservation Request
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
