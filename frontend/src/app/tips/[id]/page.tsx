"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldCheck,
  Compass,
  Printer,
  Share2,
  Bookmark,
  AlertTriangle,
  Bus,
  Calendar,
  PhoneCall,
  ChevronRight,
  ExternalLink,
  Heart,
  Luggage,
  Info
} from "lucide-react";
import { getTravelTipById, TRAVEL_TIPS_DATA } from "@/lib/tips-data";
import ImageWithFallback from "@/components/ImageWithFallback";

export default function TravelTipDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const tip = getTravelTipById(resolvedParams.id);
  const [bookmarked, setBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!tip) {
    return (
      <div className="w-full min-h-[60vh] bg-[#FAF8F5] flex items-center justify-center py-20 px-6">
        <div className="max-w-md w-full bg-white border border-[#EBE6DC] rounded-3xl p-8 text-center space-y-4 shadow-sm">
          <Info className="h-10 w-10 text-stone-400 mx-auto" />
          <h1 className="text-2xl font-serif font-bold text-stone-900">Field Guide Not Found</h1>
          <p className="text-sm text-stone-600">
            The travel guidance chapter you are looking for does not exist or has been relocated.
          </p>
          <Link
            href="/tips"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-stone-900 text-stone-50 text-sm font-semibold hover:bg-stone-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Travel Tips Directory</span>
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
            <Link href="/tips" className="hover:text-stone-900 transition-colors">
              Travel Tips
            </Link>
            <span>/</span>
            <span className="text-stone-800 font-semibold truncate max-w-xs sm:max-w-md">
              {tip.title}
            </span>
          </div>
        </div>
      </section>

      {/* Editorial Header Banner */}
      <header className="border-b border-[#EBE6DC] bg-[#FAF8F5] py-12 sm:py-16">
        <div className="w-full max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-14 2xl:px-20">
          <div className="max-w-4xl space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <span className={`px-3.5 py-1 rounded-full text-xs font-semibold border ${tip.badgeColor}`}>
                {tip.category}
              </span>
              <span className="px-3.5 py-1 rounded-full text-xs font-semibold bg-[#F5F2EB] text-stone-800 border border-stone-200">
                {tip.division}
              </span>
              <span className="flex items-center gap-1 text-xs text-stone-500 font-medium">
                <Clock className="h-3.5 w-3.5" />
                {tip.readingTime}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-stone-900 tracking-tight leading-[1.14]">
              {tip.title}
            </h1>

            <p className="text-base sm:text-xl text-stone-600 leading-relaxed font-normal">
              {tip.summary}
            </p>

            {/* Action Bar */}
            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs sm:text-sm font-semibold">
              <button
                onClick={() => setBookmarked(!bookmarked)}
                className={`px-5 py-2.5 rounded-full border transition-all flex items-center gap-2 shadow-2xs ${
                  bookmarked
                    ? "bg-stone-900 text-stone-50 border-stone-900"
                    : "bg-white text-stone-800 border-[#E5DFD5] hover:bg-[#F5F2EB]"
                }`}
              >
                <Bookmark className="h-4 w-4" />
                <span>{bookmarked ? "Saved to Bookmarks" : "Bookmark Guide"}</span>
              </button>

              <button
                onClick={handleShare}
                className="px-5 py-2.5 rounded-full bg-white text-stone-800 border border-[#E5DFD5] hover:bg-[#F5F2EB] transition-all flex items-center gap-2 shadow-2xs"
              >
                <Share2 className="h-4 w-4" />
                <span>{copied ? "Link Copied!" : "Share Advice"}</span>
              </button>

              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 rounded-full bg-white text-stone-800 border border-[#E5DFD5] hover:bg-[#F5F2EB] transition-all flex items-center gap-2 shadow-2xs"
              >
                <Printer className="h-4 w-4" />
                <span>Print Checklist</span>
              </button>

              <Link
                href="/tips"
                className="ml-auto inline-flex items-center gap-1.5 text-stone-600 hover:text-stone-900 transition-colors font-medium"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>All Field Chapters</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="w-full max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-14 2xl:px-20 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Full Guide (8 cols) */}
          <article className="lg:col-span-8 space-y-10">
            {/* Cover Image */}
            <div className="h-72 sm:h-96 w-full rounded-3xl overflow-hidden border border-[#EBE6DC] shadow-sm bg-stone-100">
              <ImageWithFallback
                src={tip.coverImage}
                alt={tip.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Key Field Takeaways */}
            <div className="bg-amber-50/60 border border-amber-200/80 rounded-3xl p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-2 text-amber-900 font-serif font-bold text-lg sm:text-xl">
                <CheckCircle2 className="h-5 w-5 text-amber-800" />
                <span>Essential Field Rules at a Glance</span>
              </div>
              <ul className="space-y-3 text-sm sm:text-base text-stone-700 leading-relaxed">
                {tip.keyHighlights.map((hl, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-amber-800 font-bold shrink-0 mt-0.5">•</span>
                    <span>{hl}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Comprehensive Overview */}
            <div className="bg-white border border-[#EBE6DC] rounded-3xl p-6 sm:p-10 space-y-4 shadow-sm">
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
                Chapter Overview &amp; Context
              </h2>
              <p className="text-base sm:text-lg text-stone-600 leading-relaxed">
                {tip.overview}
              </p>
            </div>

            {/* Checkpost & Permissions Box (if applicable) */}
            {tip.checkpostProcedures && (
              <div className="bg-white border border-[#EBE6DC] rounded-3xl p-6 sm:p-10 space-y-6 shadow-sm">
                <div className="space-y-1 border-b border-[#F0EBE1] pb-4">
                  <span className="text-xs font-semibold uppercase tracking-widest text-amber-800">
                    Security Protocols
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
                    Official Checkpost Procedures &amp; Passes
                  </h2>
                  <p className="text-sm text-stone-500">
                    Location: <strong>{tip.checkpostProcedures.location}</strong>
                  </p>
                </div>

                {tip.checkpostProcedures.timings && (
                  <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5] text-sm text-stone-800 flex items-center gap-3">
                    <Clock className="h-5 w-5 text-amber-800 shrink-0" />
                    <div>
                      <strong className="block text-stone-900 font-bold">Standard Convoy Schedules:</strong>
                      <span>{tip.checkpostProcedures.timings}</span>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-stone-800">
                    Mandatory Documentation
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-stone-700">
                    {tip.checkpostProcedures.documentsRequired.map((doc, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5] flex items-start gap-2.5"
                      >
                        <ShieldCheck className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
                        <span>{doc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {tip.checkpostProcedures.fees && (
                  <div className="text-xs sm:text-sm text-stone-600 bg-[#F5F2EB] p-4 rounded-2xl border border-stone-200">
                    <strong>Official Fees / Entry Dues:</strong> {tip.checkpostProcedures.fees}
                  </div>
                )}

                <div className="space-y-2.5">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-stone-800">
                    Checkpost Guidelines
                  </h3>
                  <ul className="space-y-2 text-sm text-stone-600">
                    {tip.checkpostProcedures.guidelines.map((g, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span className="text-amber-800 font-bold">•</span>
                        <span>{g}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Transport Options & Rates in BDT */}
            <div className="bg-white border border-[#EBE6DC] rounded-3xl p-6 sm:p-10 space-y-6 shadow-sm">
              <div className="space-y-1 border-b border-[#F0EBE1] pb-4">
                <span className="text-xs font-semibold uppercase tracking-widest text-amber-800">
                  Ground Navigation
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
                  Transportation Options &amp; Realistic Fares (BDT)
                </h2>
                <p className="text-sm text-stone-600">
                  Verified routes, public transport counters, and typical reserve vehicle pricing.
                </p>
              </div>

              <div className="space-y-4">
                {tip.transportation.map((trans, i) => (
                  <div
                    key={i}
                    className="p-5 sm:p-6 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5] space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <Bus className="h-5 w-5 text-amber-800 shrink-0" />
                        <h3 className="text-base sm:text-lg font-serif font-bold text-stone-900">
                          {trans.mode}
                        </h3>
                      </div>
                      <span className="px-3.5 py-1 rounded-full bg-white border border-[#E5DFD5] text-xs sm:text-sm font-extrabold text-stone-900">
                        {trans.approxCostBDT}
                      </span>
                    </div>

                    <div className="text-xs sm:text-sm text-stone-600">
                      <strong>Route:</strong> {trans.route}
                    </div>

                    <div className="text-xs sm:text-sm text-stone-600">
                      <strong>Recommended Operators:</strong> {trans.operators}
                    </div>

                    <div className="text-xs sm:text-sm text-stone-700 bg-white p-3 rounded-xl border border-[#EBE6DC] italic">
                      Advice: {trans.advice}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Field Schedule / Daily Phases */}
            <div className="bg-white border border-[#EBE6DC] rounded-3xl p-6 sm:p-10 space-y-6 shadow-sm">
              <div className="space-y-1 border-b border-[#F0EBE1] pb-4">
                <span className="text-xs font-semibold uppercase tracking-widest text-amber-800">
                  Timing &amp; Progression
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
                  Recommended Field Schedule
                </h2>
              </div>

              <div className="space-y-4">
                {tip.fieldSchedule.map((sch, i) => (
                  <div
                    key={i}
                    className="flex flex-col sm:flex-row gap-4 p-5 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5]"
                  >
                    <div className="sm:w-36 shrink-0">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#F5F2EB] text-stone-800 border border-stone-200">
                        {sch.phase}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-serif font-bold text-stone-900">{sch.title}</h3>
                      <p className="text-sm text-stone-600 leading-relaxed">{sch.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Safety & Medical Directives */}
            <div className="bg-white border border-[#EBE6DC] rounded-3xl p-6 sm:p-10 space-y-4 shadow-sm">
              <div className="flex items-center gap-2.5 text-rose-800 font-serif font-bold text-xl">
                <AlertTriangle className="h-5 w-5 text-rose-700" />
                <span>Field Safety &amp; Cautionary Warnings</span>
              </div>
              <ul className="space-y-2.5 text-sm sm:text-base text-stone-700 leading-relaxed">
                {tip.safetyDirectives.map((sd, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-rose-600 font-bold shrink-0 mt-0.5">•</span>
                    <span>{sd}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Community & Ecotourism Ethics */}
            <div className="bg-[#F5F2EB] border border-[#E5DFD5] rounded-3xl p-6 sm:p-10 space-y-4 shadow-xs">
              <div className="flex items-center gap-2.5 text-stone-900 font-serif font-bold text-xl">
                <Heart className="h-5 w-5 text-amber-800" />
                <span>Local Community Etiquette &amp; Leave-No-Trace</span>
              </div>
              <ul className="space-y-2.5 text-sm sm:text-base text-stone-700 leading-relaxed">
                {tip.communityEtiquette.map((ce, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-amber-800 font-bold shrink-0 mt-0.5">•</span>
                    <span>{ce}</span>
                  </li>
                ))}
              </ul>
            </div>
          </article>

          {/* Right Column: Sidebar (4 cols) */}
          <aside className="lg:col-span-4 space-y-8">
            {/* Gear & Packing Checklist */}
            <div className="bg-white border border-[#EBE6DC] rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm sticky top-28">
              <h3 className="text-xl font-serif font-bold text-stone-900 flex items-center gap-2.5">
                <Luggage className="h-5 w-5 text-amber-800" />
                <span>Recommended Gear for this Route</span>
              </h3>
              <ul className="space-y-3 text-sm text-stone-700">
                {tip.packingList.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              {/* Emergency Contacts Directory */}
              <div className="pt-5 border-t border-[#F0EBE1] space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                  Regional Emergency Help
                </h4>
                <div className="space-y-3 text-xs sm:text-sm">
                  {tip.emergencyContacts.map((c, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5] space-y-1"
                    >
                      <strong className="block text-stone-900 font-bold">{c.title}</strong>
                      <div className="font-mono font-bold text-amber-900 flex items-center gap-1.5 text-sm">
                        <PhoneCall className="h-3.5 w-3.5" />
                        <span>{c.contact}</span>
                      </div>
                      <span className="text-stone-500 text-xs block">{c.details}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Related Tour Package Card */}
              {tip.relatedTourSlug && (
                <div className="pt-5 border-t border-[#F0EBE1] space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-800">
                    Recommended Guided Itinerary
                  </span>
                  <Link
                    href={`/tours/${tip.relatedTourSlug}`}
                    className="group block p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5] hover:border-stone-400 transition-all space-y-2"
                  >
                    <div className="text-sm font-serif font-bold text-stone-900 group-hover:text-amber-800 transition-colors line-clamp-2">
                      {tip.relatedTourTitle}
                    </div>
                    <div className="text-xs text-stone-500 flex items-center justify-between">
                      <span>View Verified Tour</span>
                      <ChevronRight className="h-4 w-4 text-stone-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                </div>
              )}

              {/* Related Resort Card */}
              {tip.relatedHotelId && (
                <div className="pt-2 space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                    Verified Stay Nearby
                  </span>
                  <Link
                    href={`/hotels/${tip.relatedHotelId}`}
                    className="group block p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5] hover:border-stone-400 transition-all space-y-2"
                  >
                    <div className="text-sm font-serif font-bold text-stone-900 group-hover:text-amber-800 transition-colors line-clamp-2">
                      {tip.relatedHotelName}
                    </div>
                    <div className="text-xs text-stone-500 flex items-center justify-between">
                      <span>View Resort Assessment</span>
                      <ChevronRight className="h-4 w-4 text-stone-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
