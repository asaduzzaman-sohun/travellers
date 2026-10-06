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
  ChevronRight
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

  const divisions = ["All", "Chittagong Division", "Sylhet Division", "Khulna Division"];

  const filteredTours = tours.filter((t) => {
    const matchesSearch =
      !searchQuery ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.destination.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDiv = selectedDivision === "All" || t.region === selectedDivision;
    return matchesSearch && matchesDiv;
  });

  return (
    <div className="space-y-20 pb-20">
      {/* Peaceful Hero Section */}
      <section className="relative min-h-[75vh] flex items-center justify-center overflow-hidden">
        {/* Calming Nature Background */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1628085971946-b673e4492bf9?auto=format&fit=crop&w=2200&q=85"
            alt="Sajek Valley mist and clouds"
            className="w-full h-full object-cover filter brightness-[0.72] contrast-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070b14] via-[#070b14]/50 to-transparent" />
          <div className="absolute inset-0 bg-[#070b14]/35" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 pt-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-teal-500/30 text-teal-300 text-xs font-medium">
            <span className="h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
            Discover Peaceful Bangladesh
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Find Peace in the Green Hills & Calm Waters of Bangladesh
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-200 font-normal leading-relaxed">
            From the clouds of Sajek Valley to the serene houseboats of Tanguar Haor and misty tea gardens of Sreemangal. Honest advice and curated journeys for travelers.
          </p>

          {/* Simple Search Bar */}
          <div className="max-w-2xl mx-auto bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-2.5 shadow-xl">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                window.location.href = `/destinations?search=${encodeURIComponent(searchQuery)}`;
              }}
              className="flex flex-col sm:flex-row items-center gap-2"
            >
              <div className="flex-1 flex items-center gap-3 px-3 py-2 w-full text-left">
                <MapPin className="h-4 w-4 text-teal-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Where in Bangladesh? (e.g. Sajek, Sreemangal, Haor)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow transition-all flex items-center justify-center gap-2 shrink-0"
              >
                <Search className="h-3.5 w-3.5" />
                <span>Search</span>
              </button>
            </form>
          </div>

          {/* Quick tags */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs text-slate-300">
            <span className="text-slate-400">Popular:</span>
            {["Sajek Valley", "Tanguar Haor", "Sreemangal", "Inani Beach", "Sundarbans"].map((tag) => (
              <button
                key={tag}
                onClick={() => setSearchQuery(tag)}
                className="px-2.5 py-1 rounded-lg bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[11px] transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Destinations */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">
              Iconic Places
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Popular Destinations Across Bangladesh
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Authentic local itineraries with verified transport, stays, and honest budget estimates.
            </p>
          </div>

          <Link
            href="/destinations"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-400 hover:text-teal-300 transition-colors"
          >
            <span>View All Destinations</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Division Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs">
          {divisions.map((div) => (
            <button
              key={div}
              onClick={() => setSelectedDivision(div)}
              className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                selectedDivision === div
                  ? "bg-teal-600 text-white font-semibold"
                  : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
              }`}
            >
              {div === "All" ? "All Divisions" : div.replace(" Division", "")}
            </button>
          ))}
        </div>

        {/* Tours Grid */}
        {loading ? (
          <div className="py-20 text-center text-slate-500 text-xs">Loading destinations...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTours.map((t) => (
              <Link
                key={t.id}
                href={`/tours/${t.slug}`}
                className="group bg-[#0b1120] border border-slate-800/80 rounded-2xl overflow-hidden hover:border-teal-500/40 hover:shadow-xl hover:shadow-teal-950/20 transition-all flex flex-col"
              >
                {/* Photo */}
                <div className="relative h-52 w-full overflow-hidden bg-slate-900">
                  <img
                    src={t.coverImageUrl}
                    alt={t.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0b1120] via-transparent to-transparent opacity-80" />

                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-950/80 backdrop-blur-sm text-white border border-slate-800 flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-teal-400" />
                      {t.destination}
                    </span>
                  </div>

                  <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] text-slate-300 font-medium">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-sky-400" />
                      {t.durationDays} Days / {t.durationNights} Nights
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-teal-400" />
                      Max {t.maxGroupSize} People
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      <div className="flex items-center text-amber-400">
                        <Star className="h-3 w-3 fill-amber-400" />
                        <span className="ml-1 font-semibold text-white">{t.averageRating.toFixed(1)}</span>
                      </div>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-400">{t.totalReviews} reviews</span>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-teal-300 transition-colors line-clamp-1">
                      {t.title}
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {t.summary}
                    </p>
                  </div>

                  {/* Pricing and Action */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">Estimated Budget</span>
                      <div className="text-lg font-bold text-white">
                        ৳{(t.discountPrice ?? t.basePrice).toLocaleString()}
                        <span className="text-xs font-normal text-slate-400 ml-1">/ person</span>
                      </div>
                    </div>

                    <span className="px-3.5 py-1.5 rounded-xl bg-teal-600 group-hover:bg-teal-500 text-white text-xs font-semibold transition-colors flex items-center gap-1 shadow-sm">
                      Details
                      <ChevronRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Practical Travel Tips Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">Helpful Advice</span>
            <h2 className="text-2xl font-bold text-white mt-1">Essential Travel Tips for Bangladesh</h2>
          </div>
          <Link href="/tips" className="text-xs font-semibold text-sky-400 hover:text-sky-300">
            View All Tips →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-[#0b1120] border border-slate-800/80 rounded-2xl p-5 space-y-3">
            <span className="text-[10px] font-bold text-teal-400 uppercase bg-teal-500/10 px-2 py-0.5 rounded">
              Sajek Valley
            </span>
            <h3 className="text-sm font-bold text-white">Army Escort Timings & Checkposts</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Vehicles cannot travel independently between Khagrachhari and Sajek. There are two daily security escorts: 10:30 AM and 3:30 PM. Always arrive at Dighinala at least 30 minutes prior.
            </p>
          </div>

          <div className="bg-[#0b1120] border border-slate-800/80 rounded-2xl p-5 space-y-3">
            <span className="text-[10px] font-bold text-sky-400 uppercase bg-sky-500/10 px-2 py-0.5 rounded">
              Tanguar Haor
            </span>
            <h3 className="text-sm font-bold text-white">Houseboat Selection & Safe Swimming</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              During peak monsoon (July to September), always book houseboats with certified life jackets. For swimming in Niladri Lake, stick to shallow banks as limestone quarry bottoms drop steeply.
            </p>
          </div>

          <div className="bg-[#0b1120] border border-slate-800/80 rounded-2xl p-5 space-y-3">
            <span className="text-[10px] font-bold text-indigo-400 uppercase bg-indigo-500/10 px-2 py-0.5 rounded">
              Bandarban
            </span>
            <h3 className="text-sm font-bold text-white">NID Photocopies & Local Guide Rules</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              When traveling past Ruma Bazar or Thanchi towards Boga Lake or Nafakhum, carry at least 4-5 photocopies of your National ID card for security registration checkposts.
            </p>
          </div>
        </div>
      </section>

      {/* Top Hotel Reviews Highlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">Stay & Relax</span>
            <h2 className="text-2xl font-bold text-white mt-1">Recommended Hotels & Resorts</h2>
          </div>
          <Link href="/hotels" className="text-xs font-semibold text-teal-400 hover:text-teal-300">
            View All Hotel Reviews →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#0b1120] border border-slate-800/80 rounded-2xl p-5 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-sm font-bold text-white">Sayeman Beach Resort</h4>
                <div className="text-xs text-slate-400">Kolatoli, Cox's Bazar</div>
              </div>
              <div className="flex items-center text-amber-400 text-xs font-bold">
                <Star className="h-3.5 w-3.5 fill-amber-400 mr-1" />
                4.8
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Direct oceanfront infinity pool, clean private beach frontage, and great breakfast buffet. Best for peaceful family and couple vacations.
            </p>
            <div className="text-xs font-bold text-teal-400">From ৳৭,৫০০ / night</div>
          </div>

          <div className="bg-[#0b1120] border border-slate-800/80 rounded-2xl p-5 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-sm font-bold text-white">Grand Sultan Tea Resort</h4>
                <div className="text-xs text-slate-400">Sreemangal, Moulvibazar</div>
              </div>
              <div className="flex items-center text-amber-400 text-xs font-bold">
                <Star className="h-3.5 w-3.5 fill-amber-400 mr-1" />
                4.7
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Luxury five-star resort surrounded by serene greenery. Multiple swimming pools, golf course, and easy access to Lawachara rainforest.
            </p>
            <div className="text-xs font-bold text-teal-400">From ৳১০,৫০০ / night</div>
          </div>

          <div className="bg-[#0b1120] border border-slate-800/80 rounded-2xl p-5 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-sm font-bold text-white">Megh Kabbo Cottage</h4>
                <div className="text-xs text-slate-400">Ruilui Para, Sajek Valley</div>
              </div>
              <div className="flex items-center text-amber-400 text-xs font-bold">
                <Star className="h-3.5 w-3.5 fill-amber-400 mr-1" />
                4.9
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Rustic wooden eco-cottage with unobstructed view of the morning clouds from your private balcony. Pure peace with cool mountain breeze.
            </p>
            <div className="text-xs font-bold text-teal-400">From ৳৪,৫০০ / night</div>
          </div>
        </div>
      </section>

      {/* Community / Forum Highlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="bg-[#080e1c] border border-slate-800/80 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                Community Discussions
              </span>
              <h2 className="text-xl font-bold text-white mt-1">
                Recent Questions from Bangladeshi Travelers
              </h2>
            </div>

            <Link
              href="/community"
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-sm transition-all"
            >
              Join the Forum
            </Link>
          </div>

          <div className="space-y-3 text-xs">
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/60 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="font-semibold text-white">
                  "Is Non-AC or AC bus better for reaching Khagrachhari early in the morning?"
                </h4>
                <div className="text-[11px] text-slate-400">Asked by Nayeem • 14 replies • 2 hours ago</div>
              </div>
              <Link href="/community" className="text-sky-400 font-semibold hover:underline shrink-0">
                View Discussion →
              </Link>
            </div>

            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/60 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="font-semibold text-white">
                  "Can elderly parents comfortably stay on Tanguar Haor houseboats?"
                </h4>
                <div className="text-[11px] text-slate-400">Asked by Rumana S. • 9 replies • Yesterday</div>
              </div>
              <Link href="/community" className="text-sky-400 font-semibold hover:underline shrink-0">
                View Discussion →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
