import { Compass, Heart, ShieldCheck, Users, MapPin, Trees, Mountain, Sparkles } from "lucide-react";

export default function AboutUsPage() {
  return (
    <div className="w-full max-w-[1536px] mx-auto px-4 sm:px-8 lg:px-12 2xl:px-16 py-12 space-y-12">
      {/* Title */}
      <div className="space-y-3">
        <span className="text-xs font-bold text-teal-400 uppercase tracking-widest">
          Our Purpose &amp; Heritage
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          About TourFlow Bangladesh
        </h1>
        <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
          We are dedicated to showcasing the authentic beauty, natural quietude, and diverse cultures of Bangladesh—without commercial noise, high-volume exploitation, or environmental degradation.
        </p>
      </div>

      {/* Story Card */}
      <div className="bg-[#080d1d] border border-white/[0.08] rounded-3xl p-8 sm:p-12 space-y-6 text-xs sm:text-sm text-slate-300 leading-relaxed shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-semibold">
          <Sparkles className="h-3.5 w-3.5" />
          <span>The TourFlow Bangladesh Story</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Why We Built A Dedicated Domestic Tourism Platform
        </h2>

        <p>
          Bangladesh holds some of the most serene geographic landscapes in South Asia—from the early-morning mist rising above the green hills of Sajek Valley to the vast mirror-like waters of Tanguar Haor, and the quiet tea estates of Sreemangal.
        </p>

        <p>
          Yet, domestic travelers frequently struggle with outdated road information, unclear security checkpost procedures, fluctuating jeep prices, and crowded commercial hubs.
        </p>

        <p>
          <strong className="text-white">TourFlow Bangladesh</strong> was created to give travelers honest, verified, and peaceful guidance. We verify transport rates, highlight genuine eco-cottages, and foster a supportive community where fellow travelers share their honest experiences.
        </p>
      </div>

      {/* Core Principles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#080d1d] border border-white/[0.08] rounded-3xl p-8 space-y-4 shadow-lg hover:border-teal-500/30 transition-all">
          <div className="h-12 w-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
            <Heart className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Respect Local Communities</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            We actively support indigenous communities (Bawm, Marma, Chakma, Lusai, Khasia) and local boatmen families in Sunamganj and the Chittagong Hill Tracts.
          </p>
        </div>

        <div className="bg-[#080d1d] border border-white/[0.08] rounded-3xl p-8 space-y-4 shadow-lg hover:border-sky-500/30 transition-all">
          <div className="h-12 w-12 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
            <Trees className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Leave No Trace</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            We campaign vigorously against plastic dumping in Tanguar Haor, Saint Martin&apos;s coral reefs, and pristine mountain rivers.
          </p>
        </div>

        <div className="bg-[#080d1d] border border-white/[0.08] rounded-3xl p-8 space-y-4 shadow-lg hover:border-indigo-500/30 transition-all">
          <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Traveler Safety First</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Every itinerary adheres to official travel guidelines, security convoy timings, and emergency communication standards with Bangladesh Tourist Police.
          </p>
        </div>
      </div>
    </div>
  );
}
