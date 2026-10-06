import { Compass, Heart, ShieldCheck, Users, MapPin, Trees } from "lucide-react";

export default function AboutUsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Title */}
      <div className="space-y-3 text-center sm:text-left">
        <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">
          Our Purpose
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          About TourFlow Bangladesh
        </h1>
        <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
          We are dedicated to showcasing the authentic beauty, natural quietude, and diverse cultures of Bangladesh—without commercial noise or high-volume exploitation.
        </p>
      </div>

      {/* Story Card */}
      <div className="bg-[#0b1120] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 text-xs sm:text-sm text-slate-300 leading-relaxed">
        <h2 className="text-xl font-bold text-white">
          Why We Built This Platform
        </h2>
        <p>
          Bangladesh holds some of the most serene geographic landscapes in South Asia—from the early-morning mist rising above the green hills of Sajek Valley to the vast mirror-like waters of Tanguar Haor, and the quiet tea estates of Sreemangal.
        </p>
        <p>
          Yet, domestic travelers frequently struggle with outdated road information, unclear security checkpost procedures, fluctuating jeep prices, and crowded commercial hubs.
        </p>
        <p>
          <strong>TourFlow Bangladesh</strong> was created to give travelers honest, verified, and peaceful guidance. We verify transport rates, highlight genuine eco-cottages, and foster a supportive community where fellow travelers share their honest experiences.
        </p>
      </div>

      {/* Core Principles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-[#0b1120] border border-slate-800 rounded-2xl p-6 space-y-3">
          <div className="h-10 w-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
            <Heart className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-bold text-white">Respect Local Communities</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            We actively support indigenous communities (Bawm, Marma, Chakma, Lusai, Khasia) and local boatmen families in Sunamganj and the Chittagong Hill Tracts.
          </p>
        </div>

        <div className="bg-[#0b1120] border border-slate-800 rounded-2xl p-6 space-y-3">
          <div className="h-10 w-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
            <Trees className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-bold text-white">Leave No Trace</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            We campaign vigorously against plastic dumping in Tanguar Haor, Saint Martin’s coral reefs, and pristine mountain rivers.
          </p>
        </div>

        <div className="bg-[#0b1120] border border-slate-800 rounded-2xl p-6 space-y-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-bold text-white">Verified Travel Advice</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Every route update, bus timing, and hotel review is grounded in verified, real traveler journeys with no sponsored distortions.
          </p>
        </div>
      </div>
    </div>
  );
}
