import { Heart, ShieldCheck, Trees, Compass, MapPin, Users } from "lucide-react";

export default function AboutUsPage() {
  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] pb-24">
      {/* Header Banner */}
      <section className="border-b border-[#EBE6DC] bg-[#FAF8F5] py-14 sm:py-16">
        <div className="w-full max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-14 2xl:px-20 space-y-4">
          <span className="text-xs sm:text-sm font-semibold tracking-widest uppercase text-amber-800">
            Our Purpose &amp; Heritage
          </span>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-stone-900 tracking-tight">
            About Traveller&apos;s
          </h1>
          <p className="text-base sm:text-lg text-stone-600 max-w-3xl leading-relaxed">
            Dedicated exclusively to showcasing the authentic beauty, natural quietude, and diverse indigenous cultures of Bangladesh—free from commercial clutter and high-volume exploitation.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="w-full max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-14 2xl:px-20 mt-12 space-y-12">
        {/* Story Card */}
        <div className="bg-white border border-[#EBE6DC] rounded-3xl p-8 sm:p-12 lg:p-14 space-y-6 text-sm sm:text-base text-stone-700 leading-relaxed shadow-sm">
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-widest text-stone-400 font-bold">The Vision</span>
            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-stone-900 tracking-tight">
              Why We Built A Dedicated Domestic Travel Space
            </h2>
          </div>

          <p>
            Bangladesh holds some of the most serene geographic landscapes in South Asia—from dawn mist drifting over the green ridges of Sajek Valley to the vast mirror-like waters of Tanguar Haor, the ancient terracotta sanctuaries of Dinajpur, and the tranquil tea estates of Sreemangal.
          </p>

          <p>
            Yet, domestic travelers frequently struggle with outdated road information, unclear security checkpost procedures, fluctuating jeep fares, and crowded commercial hubs.
          </p>

          <p>
            <strong className="text-stone-900">Traveller&apos;s</strong> was created to give travelers honest, verified, and peaceful guidance. We verify transport rates, highlight genuine eco-cottages, and foster a supportive community where fellow travelers share their honest experiences.
          </p>
        </div>

        {/* Core Principles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white border border-[#EBE6DC] rounded-3xl p-8 sm:p-10 space-y-4 shadow-xs hover:border-[#C4BAA9] hover:shadow-md transition-all">
            <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-900 border border-amber-200/80 flex items-center justify-center">
              <Heart className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-serif font-bold text-stone-900">Respect Local Communities</h3>
            <p className="text-sm text-stone-600 leading-relaxed">
              We actively support indigenous communities (Bawm, Marma, Chakma, Lusai, Khasia) and local boatmen families in Sunamganj and the Chittagong Hill Tracts by funneling tourism benefits directly to them.
            </p>
          </div>

          <div className="bg-white border border-[#EBE6DC] rounded-3xl p-8 sm:p-10 space-y-4 shadow-xs hover:border-[#C4BAA9] hover:shadow-md transition-all">
            <div className="h-12 w-12 rounded-2xl bg-[#F5F2EB] text-stone-800 border border-stone-200 flex items-center justify-center">
              <Trees className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-serif font-bold text-stone-900">Leave No Trace</h3>
            <p className="text-sm text-stone-600 leading-relaxed">
              We campaign vigorously against single-use plastic dumping in Tanguar Haor, Saint Martin&apos;s coral reefs, and pristine mountain rivers like Shomeshwari and Amiakhum.
            </p>
          </div>

          <div className="bg-white border border-[#EBE6DC] rounded-3xl p-8 sm:p-10 space-y-4 shadow-xs hover:border-[#C4BAA9] hover:shadow-md transition-all">
            <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-900 border border-amber-200/80 flex items-center justify-center">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-serif font-bold text-stone-900">Traveler Safety First</h3>
            <p className="text-sm text-stone-600 leading-relaxed">
              Every itinerary adheres to official travel guidelines, security convoy timings, and emergency communication standards in coordination with the Bangladesh Tourist Police.
            </p>
          </div>
        </div>

        {/* Coverage Highlights */}
        <div className="bg-[#F5F2EB] border border-[#E5DFD5] rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 max-w-xl">
            <h3 className="text-2xl font-serif font-bold text-stone-900">Covering All 8 Divisions</h3>
            <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
              From the coastal reefs of Chattogram and mangrove creeks of Khulna to the tea estates of Sylhet and northern terracotta heritage of Rajshahi &amp; Rangpur.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
              <div className="text-2xl font-serif font-bold text-stone-900">16+</div>
              <div className="text-xs text-stone-500 font-medium">Curated Tours</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
              <div className="text-2xl font-serif font-bold text-stone-900">16+</div>
              <div className="text-xs text-stone-500 font-medium">Verified Resorts</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
              <div className="text-2xl font-serif font-bold text-stone-900">100%</div>
              <div className="text-xs text-stone-500 font-medium">Domestic Focus</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
              <div className="text-2xl font-serif font-bold text-stone-900">24/7</div>
              <div className="text-xs text-stone-500 font-medium">Field Support</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
