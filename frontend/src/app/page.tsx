"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Compass,
  MapPin,
  Calendar,
  Users,
  Clock,
  ArrowRight,
  ShieldCheck,
  Star,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  Award,
  Globe2,
  Search,
  Filter
} from "lucide-react";
import { TourSummary, API_BASE } from "@/lib/api";

export default function HomePage() {
  const [featuredTours, setFeaturedTours] = useState<TourSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchDestination, setSearchDestination] = useState("");
  const [selectedSeason, setSelectedSeason] = useState("All");

  useEffect(() => {
    async function fetchTours() {
      try {
        const res = await fetch(`${API_BASE}/tourpackages?featured=true`);
        if (res.ok) {
          const data = await res.json();
          setFeaturedTours(data);
        }
      } catch (err) {
        console.error("Failed to load featured tours:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTours();
  }, []);

  return (
    <div className="space-y-24 pb-20">
      {/* Editorial Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Background photo with subtle zoom and darkening overlays */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=2400&q=85"
            alt="Patagonia Torres del Paine"
            className="w-full h-full object-cover scale-105 filter brightness-75 contrast-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/60" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-slate-950/50 to-slate-950" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 pt-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-indigo-400/30 text-indigo-300 text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            2026 / 2027 Expeditions Now Booking
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.08]">
            The World’s Greatest Frontiers,{" "}
            <span className="bg-gradient-to-r from-indigo-200 via-sky-300 to-indigo-100 bg-clip-text text-transparent">
              Accessed Intimately.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-200 font-normal leading-relaxed text-shadow">
            Curated small-group journeys capped at 12 travelers. Led by certified UIAGM mountain guides, local cultural historians, and conservationists.
          </p>

          {/* Search & Discovery Bar */}
          <div className="max-w-4xl mx-auto bg-slate-950/90 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-3 sm:p-4 shadow-2xl shadow-black/80">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                window.location.href = `/tours?search=${encodeURIComponent(searchDestination)}`;
              }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-3"
            >
              <div className="flex items-center gap-3 px-4 py-3 bg-slate-900/90 rounded-2xl border border-slate-800 text-left">
                <MapPin className="h-5 w-5 text-indigo-400 shrink-0" />
                <div className="flex-1">
                  <label className="block text-[10px] uppercase font-bold text-slate-400">Destination</label>
                  <input
                    type="text"
                    placeholder="Where to? (e.g. Patagonia, Japan)"
                    value={searchDestination}
                    onChange={(e) => setSearchDestination(e.target.value)}
                    className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 px-4 py-3 bg-slate-900/90 rounded-2xl border border-slate-800 text-left">
                <Calendar className="h-5 w-5 text-indigo-400 shrink-0" />
                <div className="flex-1">
                  <label className="block text-[10px] uppercase font-bold text-slate-400">Season / Month</label>
                  <select
                    value={selectedSeason}
                    onChange={(e) => setSelectedSeason(e.target.value)}
                    className="w-full bg-transparent text-sm text-white focus:outline-none cursor-pointer"
                  >
                    <option value="All" className="bg-slate-900 text-white">All Seasons</option>
                    <option value="Spring" className="bg-slate-900 text-white">Spring (Mar – May)</option>
                    <option value="Summer" className="bg-slate-900 text-white">Summer (Jun – Aug)</option>
                    <option value="Autumn" className="bg-slate-900 text-white">Autumn (Sep – Nov)</option>
                    <option value="Winter" className="bg-slate-900 text-white">Winter (Dec – Feb)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="w-full h-full py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
                >
                  <Search className="h-4 w-4" />
                  <span>Explore Journeys</span>
                </button>
              </div>
            </form>
          </div>

          {/* Social Proof & Press */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1.5">
              <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
              <strong className="text-white">4.97 / 5.0</strong> from 840+ verified guests
            </span>
            <span className="hidden sm:inline text-slate-700">•</span>
            <span>Featured in <em>National Geographic Traveller</em></span>
            <span className="hidden sm:inline text-slate-700">•</span>
            <span><em>Condé Nast Traveler</em> Top Specialist 2026</span>
          </div>
        </div>
      </section>

      {/* Featured Expeditions */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-widest text-indigo-400">
              Signature Departures
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Curated Expeditions for 2026/27
            </h2>
            <p className="text-sm text-slate-400 max-w-xl">
              Each itinerary is carefully refined by regional experts to avoid mass-tourism corridors and deliver authentic, respectful immersion.
            </p>
          </div>

          <Link
            href="/tours"
            className="inline-flex items-center gap-2 text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <span>View All Expeditions</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="py-24 text-center text-slate-500">Loading signature itineraries...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredTours.map((tour) => (
              <Link
                key={tour.id}
                href={`/tours/${tour.slug}`}
                className="group bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden hover:border-slate-700 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col"
              >
                {/* Photo Header */}
                <div className="relative h-64 w-full overflow-hidden bg-slate-800">
                  <img
                    src={tour.coverImageUrl}
                    alt={tour.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />

                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-950/80 backdrop-blur-md text-white border border-slate-800 flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-indigo-400" />
                      {tour.destination}
                    </span>
                  </div>

                  <div className="absolute top-4 right-4">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-600/90 backdrop-blur-md text-white shadow">
                      {tour.difficulty}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-slate-300 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-indigo-400" />
                      {tour.durationDays} Days / {tour.durationNights} Nights
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-sky-400" />
                      Max {tour.maxGroupSize} Guests
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 text-xs">
                      <div className="flex items-center text-amber-400">
                        <Star className="h-3.5 w-3.5 fill-amber-400" />
                        <span className="ml-1 font-bold text-white">{tour.averageRating.toFixed(1)}</span>
                      </div>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-400">{tour.totalReviews} verified reviews</span>
                    </div>

                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-2">
                      {tour.title}
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {tour.summary}
                    </p>
                  </div>

                  {/* Highlights Bullet List */}
                  {tour.highlights && tour.highlights.length > 0 && (
                    <div className="space-y-1.5 border-t border-slate-800/80 pt-3">
                      {tour.highlights.slice(0, 2).map((hl, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{hl}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Pricing and Action */}
                  <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">From (per person)</div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-white">
                          ${(tour.discountPrice ?? tour.basePrice).toLocaleString()}
                        </span>
                        {tour.discountPrice && (
                          <span className="text-xs text-slate-500 line-through">
                            ${tour.basePrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <span className="px-4 py-2 rounded-xl bg-indigo-600 group-hover:bg-indigo-500 text-white text-xs font-bold transition-colors flex items-center gap-1 shadow-md shadow-indigo-600/20">
                      View Expedition
                      <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* The TourFlow Standard (Why Us) */}
      <section id="why-us" className="relative bg-slate-900/60 border-y border-slate-800/80 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="text-xs font-bold uppercase tracking-widest text-indigo-400">
              The TourFlow Philosophy
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Small-Group Travel Without Compromise
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              We reject high-volume mass touring. By restricting group size to just 8-12 guests, we preserve intimate wilderness encounters and support delicate heritage ecosystems.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-3xl p-8 space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Strict Max 12 Traveler Cap</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                No tour buses, no crowded check-ins. Travel in private 4x4s, chartered boats, and stay in boutique properties that cannot accommodate large crowds.
              </p>
            </div>

            <div className="bg-slate-950/70 border border-slate-800/80 rounded-3xl p-8 space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">100% Guaranteed Departures</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                When you book your flights and take time off work, your expedition is set in stone. We do not cancel trips because passenger minimums were not reached.
              </p>
            </div>

            <div className="bg-slate-950/70 border border-slate-800/80 rounded-3xl p-8 space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Legendary Field Directors</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                You are guided by certified UIAGM mountain guides, marine naturalists, and native cultural leaders with an average of 14 years of professional field leadership.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Verified Traveler Reviews */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-xl mx-auto space-y-3">
          <div className="text-xs font-bold uppercase tracking-widest text-indigo-400">
            Real Stories
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Loved by Independent Travelers
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-7 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400" />
                ))}
              </div>
              <h4 className="text-sm font-bold text-white">"Flawless logistics in the wildest part of South America"</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                "We completed the W-Trek with Lucas. The geodesic dome camp at EcoCamp was astounding. Everything was handled with precision and grace."
              </p>
            </div>
            <div className="pt-4 border-t border-slate-800 text-xs">
              <div className="font-bold text-white">Harrison Croft</div>
              <div className="text-slate-500 text-[11px]">Denver, Colorado • Traveled Patagonia W-Trek</div>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-7 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400" />
                ))}
              </div>
              <h4 className="text-sm font-bold text-white">"Waking up to lions roaring in the Serengeti"</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                "Our driver-guide Moses possessed an unbelievable eye for wildlife. Having a maximum of 8 people on safari meant everyone had a window seat and 360-degree views."
              </p>
            </div>
            <div className="pt-4 border-t border-slate-800 text-xs">
              <div className="font-bold text-white">Dr. Elena Rostova</div>
              <div className="text-slate-500 text-[11px]">Zurich, Switzerland • Traveled Serengeti Safari</div>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-7 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400" />
                ))}
              </div>
              <h4 className="text-sm font-bold text-white">"The private Riva yacht around Capri was pure magic"</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                "This wasn’t just a tour; it was like traveling with a close friend who happens to know every hotelier, boat captain, and chef on the Amalfi Coast."
              </p>
            </div>
            <div className="pt-4 border-t border-slate-800 text-xs">
              <div className="font-bold text-white">Victoria Sterling</div>
              <div className="text-slate-500 text-[11px]">London, UK • Traveled Amalfi & Capri</div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter / Custom Expedition CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900/80 via-slate-900 to-indigo-950 border border-indigo-500/30 p-8 sm:p-14">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
              Personalized Travel
            </span>
            <h3 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Looking for a Bespoke Private Journey?
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Our Senior Expedition Planners craft customized private itineraries for families, photography groups, and private parties. Receive a personalized itinerary proposal within 48 hours.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <Link
                href="/tours"
                className="px-6 py-3.5 rounded-xl bg-white text-slate-950 hover:bg-slate-100 text-xs font-bold transition-all text-center"
              >
                Explore Destinations
              </Link>
              <a
                href="mailto:concierge@tourflowexpeditions.com"
                className="px-6 py-3.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white hover:bg-slate-800 text-xs font-bold transition-all text-center"
              >
                Contact Expedition Concierge
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
