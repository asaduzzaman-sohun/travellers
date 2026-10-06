"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Compass,
  MapPin,
  Clock,
  Users,
  Search,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Star,
  CheckCircle2,
  Calendar,
  MessageSquare,
  Hotel,
  BookOpen,
  ChevronRight,
  TrendingUp,
  Heart
} from "lucide-react";
import { TourSummary, API_BASE } from "@/lib/api";

export default function HomePage() {
  const [tours, setTours] = useState<TourSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDivision, setSelectedDivision] = useState("All");

  useEffect(() => {
    async function loadTours() {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/tourpackages`);
        if (res.ok) {
          const data = await res.json();
          setTours(data);
        }
      } catch (err) {
        console.error("Failed to fetch tours:", err);
      } finally {
        setLoading(false);
      }
    }
    loadTours();
  }, []);

  const divisions = [
    { label: "All Regions", value: "All" },
    { label: "Chittagong Hill Tracts", value: "Chittagong Division" },
    { label: "Sylhet Haor & Wetlands", value: "Sylhet Division" },
    { label: "Khulna Sundarbans", value: "Khulna Division" },
  ];

  const filteredTours = tours.filter((t) => {
    const matchesSearch =
      !searchQuery ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.destination.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDiv = selectedDivision === "All" || t.region === selectedDivision;
    return matchesSearch && matchesDiv;
  });

  return (
    <div className="space-y-20 pb-24">
      {/* 1. Full-Width Panoramic Hero Section */}
      <section className="relative w-full pt-16 pb-24 px-4 sm:px-8 lg:px-12 2xl:px-16 overflow-hidden">
        {/* Subtle background ambient lighting */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[350px] bg-teal-500/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-10 right-1/4 w-[500px] h-[300px] bg-sky-500/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="w-full max-w-[1536px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Hero Copy */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Dedicated Exclusively to Bangladesh Tourism</span>
            </div>

            <h1 className="text-4xl sm:text-6xl 2xl:text-7xl font-extrabold text-white tracking-tight leading-[1.1]">
              Journey Through the <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-sky-300 to-indigo-300">
                Peaceful Wonders
              </span>{" "}
              of Bangladesh
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Wake up above the clouds in Sajek, drift along calm waters in Tanguar Haor, pedal through emerald tea gardens in Sreemangal, and stroll along the world&apos;s longest uninterrupted sea beach.
            </p>

            {/* Live Search & Filter Box */}
            <div className="pt-2 max-w-xl mx-auto lg:mx-0">
              <div className="bg-[#0b1224]/90 border border-white/[0.1] rounded-2xl p-2.5 shadow-2xl flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search Sajek, Tanguar Haor, Sreemangal, Sundarbans..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none"
                  />
                </div>
                <Link
                  href={searchQuery ? `/destinations?search=${encodeURIComponent(searchQuery)}` : "/destinations"}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-sky-600 hover:from-teal-400 hover:to-sky-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <span>Explore</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Trust Markers */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-teal-400" />
                <span>Tourist Police 24/7 Security</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-sky-400" />
                <span>Verified Indigenous Local Guides</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-rose-400" />
                <span>100% Domestic Bangladeshi Travelers</span>
              </div>
            </div>
          </div>

          {/* Right Column: Panoramic Visual */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden border border-white/[0.1] shadow-2xl h-[380px] sm:h-[460px] group bg-slate-900">
              <img
                src="https://images.unsplash.com/photo-1628085971946-b673e4492bf9?auto=format&fit=crop&w=1200&q=85"
                alt="Sajek Valley Sea of Clouds"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050814] via-black/20 to-transparent" />

              <div className="absolute bottom-6 left-6 right-6 p-5 rounded-2xl bg-black/60 backdrop-blur-md border border-white/[0.1]">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-semibold border border-teal-500/30">
                    Featured Destination
                  </span>
                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-amber-400" /> 4.9 / 5.0
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mt-1">Sajek Valley, Rangamati</h3>
                <p className="text-xs text-slate-300 mt-0.5 line-clamp-1">
                  Rolling hills above the clouds with morning military convoy security.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Key Division Navigation Pills */}
      <section className="w-full max-w-[1536px] mx-auto px-4 sm:px-8 lg:px-12 2xl:px-16">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-widest text-teal-400">
              Handpicked Regions
            </span>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Featured Tour Packages
            </h2>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
            {divisions.map((div) => (
              <button
                key={div.value}
                onClick={() => setSelectedDivision(div.value)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  selectedDivision === div.value
                    ? "bg-teal-600 text-white shadow-md shadow-teal-600/20"
                    : "bg-white/[0.04] text-slate-300 hover:text-white hover:bg-white/[0.08]"
                }`}
              >
                {div.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Tour Packages Grid (Wider Container) */}
      <section className="w-full max-w-[1536px] mx-auto px-4 sm:px-8 lg:px-12 2xl:px-16">
        {loading ? (
          <div className="py-24 text-center text-slate-500 text-sm">
            Retrieving tour itineraries from database...
          </div>
        ) : filteredTours.length === 0 ? (
          <div className="py-20 text-center bg-[#090f1e] rounded-3xl border border-white/[0.08] p-8 space-y-3">
            <p className="text-sm text-slate-400">No tour packages match this division.</p>
            <button
              onClick={() => {
                setSelectedDivision("All");
                setSearchQuery("");
              }}
              className="px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTours.map((tour) => (
              <Link
                key={tour.id}
                href={`/tours/${tour.slug}`}
                className="group bg-[#080d1d] border border-white/[0.08] rounded-3xl overflow-hidden hover:border-teal-500/40 hover:-translate-y-1 transition-all duration-300 flex flex-col shadow-lg"
              >
                <div className="relative h-64 w-full overflow-hidden bg-slate-900">
                  <img
                    src={tour.coverImageUrl}
                    alt={tour.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080d1d] via-transparent to-transparent opacity-90" />

                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-black/60 backdrop-blur-md text-white border border-white/[0.1] flex items-center gap-1.5">
                      <MapPin className="h-3 w-3 text-sky-400" />
                      {tour.destination}
                    </span>
                  </div>

                  <div className="absolute top-4 right-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-600/90 backdrop-blur-md text-white shadow">
                      {tour.difficulty}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-slate-300 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-teal-400" />
                      {tour.durationDays} Days / {tour.durationNights} Nights
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-sky-400" />
                      Max {tour.maxGroupSize} Guests
                    </span>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      <div className="flex items-center text-amber-400">
                        <Star className="h-3.5 w-3.5 fill-amber-400" />
                        <span className="ml-1 font-bold text-white">{tour.averageRating.toFixed(1)}</span>
                      </div>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-400">{tour.totalReviews} verified reviews</span>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-teal-400 transition-colors line-clamp-2">
                      {tour.title}
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {tour.summary}
                    </p>
                  </div>

                  {tour.highlights && tour.highlights.length > 0 && (
                    <div className="space-y-1.5 border-t border-white/[0.06] pt-3">
                      {tour.highlights.slice(0, 2).map((hl, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-xs text-slate-300">
                          <CheckCircle2 className="h-3.5 w-3.5 text-teal-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{hl}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Fare / Person</div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-white">
                          ৳{(tour.discountPrice ?? tour.basePrice).toLocaleString()}
                        </span>
                        {tour.discountPrice && (
                          <span className="text-xs text-slate-500 line-through">
                            ৳{tour.basePrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <span className="px-4 py-2 rounded-xl bg-teal-600 group-hover:bg-teal-500 text-white text-xs font-bold transition-colors flex items-center gap-1 shadow-md shadow-teal-600/20">
                      View Details
                      <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 4. Travel Tips & Advisory Section */}
      <section className="w-full max-w-[1536px] mx-auto px-4 sm:px-8 lg:px-12 2xl:px-16">
        <div className="bg-[#080d1d] border border-white/[0.08] rounded-3xl p-8 sm:p-12 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-teal-400">
                Ground Reality & Practical Knowledge
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
                Essential Advice for Domestic Travel
              </h2>
            </div>
            <Link
              href="/tips"
              className="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1"
            >
              <span>View Full Handbook</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div className="p-5 rounded-2xl bg-black/40 border border-white/[0.06] space-y-2">
              <span className="text-[10px] font-bold uppercase text-sky-400">Hill Tracts Security</span>
              <h4 className="text-sm font-bold text-white">Army Convoy Escort at Dighinala</h4>
              <p className="text-slate-400 leading-relaxed">
                Vehicles to Sajek Valley are escorted twice daily (10:00 AM and 03:00 PM). Arriving late means waiting overnight in Dighinala.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-black/40 border border-white/[0.06] space-y-2">
              <span className="text-[10px] font-bold uppercase text-teal-400">Sunamganj Haors</span>
              <h4 className="text-sm font-bold text-white">Monsoon Waves & Lifejacket Mandatory</h4>
              <p className="text-slate-400 leading-relaxed">
                Afal (monsoon waves) in Tanguar Haor can create deep swells. Always choose houseboats with certified lifejackets for each traveler.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-black/40 border border-white/[0.06] space-y-2">
              <span className="text-[10px] font-bold uppercase text-indigo-400">Identity Clearance</span>
              <h4 className="text-sm font-bold text-white">Keep NID / Smart Card Photocopies</h4>
              <p className="text-slate-400 leading-relaxed">
                Carry 3-4 physical photocopies of your National Identity Card or Passport for entry checkposts in Bandarban, Ruma, and Thanchi.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Honest Resort Reviews Preview */}
      <section className="w-full max-w-[1536px] mx-auto px-4 sm:px-8 lg:px-12 2xl:px-16 space-y-6">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-teal-400">
              Verified Stays
            </span>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Honest Resort &amp; Cottage Reviews
            </h2>
          </div>
          <Link
            href="/hotels"
            className="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1"
          >
            <span>All Reviews</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#080d1d] border border-white/[0.08] rounded-3xl p-6 space-y-4 text-xs">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-sm font-bold text-white">Sayeman Beach Resort</h4>
                <div className="text-slate-400 text-[11px]">Marine Drive, Cox&apos;s Bazar</div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 font-bold border border-amber-500/20">
                4.8 / 5
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Prime oceanfront views, outstanding rooftop infinity pool, and excellent seafood buffet. High peak-season pricing.
            </p>
            <div className="pt-2 border-t border-white/[0.06] text-slate-400 text-[11px] flex justify-between">
              <span>Avg: ৳8,500 – ৳16,000 / night</span>
              <span className="text-teal-400 font-semibold">Luxury Coastal</span>
            </div>
          </div>

          <div className="bg-[#080d1d] border border-white/[0.08] rounded-3xl p-6 space-y-4 text-xs">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-sm font-bold text-white">Sairu Hill Resort</h4>
                <div className="text-slate-400 text-[11px]">Chimbuk Road, Bandarban</div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 font-bold border border-amber-500/20">
                4.7 / 5
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Serene hilltop views perched 1,800 feet high. Surrounded by pure green valleys. Requires private transport to reach town.
            </p>
            <div className="pt-2 border-t border-white/[0.06] text-slate-400 text-[11px] flex justify-between">
              <span>Avg: ৳9,000 – ৳15,000 / night</span>
              <span className="text-teal-400 font-semibold">Hilltop Retreat</span>
            </div>
          </div>

          <div className="bg-[#080d1d] border border-white/[0.08] rounded-3xl p-6 space-y-4 text-xs">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-sm font-bold text-white">Megh Kabbo Cottage</h4>
                <div className="text-slate-400 text-[11px]">Ruilui Para, Sajek Valley</div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 font-bold border border-amber-500/20">
                4.6 / 5
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Balconies look straight into the morning sea of clouds. Authentic wooden cottage vibe with friendly local service.
            </p>
            <div className="pt-2 border-t border-white/[0.06] text-slate-400 text-[11px] flex justify-between">
              <span>Avg: ৳4,000 – ৳6,500 / night</span>
              <span className="text-teal-400 font-semibold">Cloud Vista</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Community Forum Highlights */}
      <section className="w-full max-w-[1536px] mx-auto px-4 sm:px-8 lg:px-12 2xl:px-16">
        <div className="bg-gradient-to-r from-teal-950/40 via-[#080d1d] to-sky-950/40 border border-white/[0.08] rounded-3xl p-8 sm:p-12 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-teal-400">
                Traveler Community
              </span>
              <h2 className="text-2xl font-bold text-white tracking-tight mt-1">
                Recent Queries &amp; Discussions
              </h2>
            </div>
            <Link
              href="/write-post"
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md transition-all self-start sm:self-auto"
            >
              + Share Your Tip / Query
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.06] space-y-2">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-teal-400 font-semibold">Chander Gari Guidance</span>
                <span className="text-slate-400">Yesterday</span>
              </div>
              <h4 className="text-sm font-bold text-white">Current Chander Gari fare for Sajek (2026)?</h4>
              <p className="text-slate-300">
                Regular round trip 2-day rate is now ৳9,500 – ৳10,500 from Khagrachhari including driver allowance.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.06] space-y-2">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-sky-400 font-semibold">Bandarban Trail Status</span>
                <span className="text-slate-400">2 days ago</span>
              </div>
              <h4 className="text-sm font-bold text-white">Is Boga Lake to Keokradong open for tourists now?</h4>
              <p className="text-slate-300">
                Yes, trail clearance is currently granted by Ruma Army camp with registered local guide escort.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
