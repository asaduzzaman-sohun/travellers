"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  Sparkles,
  CheckCircle2,
  Send,
  Bus,
  MapPin,
  Bot
} from "lucide-react";
import { apiRequest } from "@/lib/api";

interface PlanOption {
  id: string;
  name: string;
  baseDailyPerPerson: number;
  highlight: string;
}

const DESTINATIONS: PlanOption[] = [
  { id: "sajek", name: "Sajek Valley & Ruilui", baseDailyPerPerson: 2200, highlight: "Sea of clouds, Konglak Para trek, bamboo chicken dinner" },
  { id: "sylhet", name: "Sylhet & Tanguar Haor", baseDailyPerPerson: 2400, highlight: "Premium houseboat cruise, Ratargul swamp, Shimul garden" },
  { id: "bandarban", name: "Bandarban & Nilgiri", baseDailyPerPerson: 2500, highlight: "Cloud peaks, Boga lake, Nafakhum trail, tribal homestays" },
  { id: "saintmartin", name: "Saint Martin's Island", baseDailyPerPerson: 2800, highlight: "Coral beach cottages, Chera Dwip speedboat, live lobster BBQ" },
  { id: "sreemangal", name: "Sreemangal Tea Country", baseDailyPerPerson: 1900, highlight: "Lawachara rainforest, 7-layer tea, cycling tea gardens" },
  { id: "coxsbazar", name: "Cox's Bazar & Inani", baseDailyPerPerson: 2100, highlight: "Marine Drive drive, private speedboats, sunset surf" },
  { id: "sundarban", name: "Sundarbans Eco Vessel", baseDailyPerPerson: 3500, highlight: "Armed escort vessel cruise, mangrove canopy, wildlife safari" }
];

const TRANSPORT_TIERS = [
  { id: "bus_ac", label: "AC Scania / Volvo Coach", extraPerPerson: 1600, desc: "Highway executive reclining seats" },
  { id: "hiace", label: "Reserved Toyota HiAce", extraPerPerson: 2200, desc: "Private door-to-door group microbus" },
  { id: "chander_gari", label: "Reserved 4WD Chander Gari", extraPerPerson: 1800, desc: "Mountain jeep for Sajek & Bandarban trails" },
  { id: "air_local", label: "Domestic Flight + Private Car", extraPerPerson: 6500, desc: "Fastest travel with airport pickup" },
  { id: "bus_non_ac", label: "Non-AC Budget Coach", extraPerPerson: 900, desc: "Economical group travel" }
];

const STAY_TIERS = [
  { id: "eco_cottage", label: "Eco Wooden Cottage", extraDaily: 800, desc: "Hill-view traditional wooden balconies" },
  { id: "deluxe_3star", label: "3-Star Deluxe Hotel", extraDaily: 1400, desc: "Modern amenities, hot water, AC rooms" },
  { id: "luxury_resort", label: "5-Star Luxury Resort", extraDaily: 3200, desc: "Infinity pool, buffet breakfast, spa" }
];

export default function PlannerPage() {
  const [selectedDest, setSelectedDest] = useState(DESTINATIONS[0].id);
  const [groupSize, setGroupSize] = useState(8);
  const [groupType, setGroupType] = useState("Friends / University Batch");
  const [days, setDays] = useState(3);
  const [selectedTransport, setSelectedTransport] = useState("hiace");
  const [selectedStay, setSelectedStay] = useState("eco_cottage");
  const [includeBbq, setIncludeBbq] = useState(true);
  const [includeGuide, setIncludeGuide] = useState(true);

  // Quote Submission State
  const [leadName, setLeadName] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);

  const destObj = DESTINATIONS.find((d) => d.id === selectedDest) || DESTINATIONS[0];
  const transObj = TRANSPORT_TIERS.find((t) => t.id === selectedTransport) || TRANSPORT_TIERS[0];
  const stayObj = STAY_TIERS.find((s) => s.id === selectedStay) || STAY_TIERS[0];

  const { totalCost, perPersonCost } = useMemo(() => {
    const baseDaily = (destObj.baseDailyPerPerson + stayObj.extraDaily) * days;
    const transportTotal = transObj.extraPerPerson;
    const addonsPerPerson = (includeBbq ? 600 : 0) + (includeGuide ? Math.round(3000 / groupSize) : 0);

    const singlePerPerson = baseDaily + transportTotal + addonsPerPerson;
    // Volume discount for larger groups (10+ gets 5%, 20+ gets 8%)
    const discountMultiplier = groupSize >= 20 ? 0.92 : groupSize >= 10 ? 0.95 : 1.0;
    const finalPerPerson = Math.round(singlePerPerson * discountMultiplier);
    const finalTotal = finalPerPerson * groupSize;

    return { totalCost: finalTotal, perPersonCost: finalPerPerson };
  }, [destObj, stayObj, transObj, days, groupSize, includeBbq, includeGuide]);

  const handleRequestQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName.trim() || !leadPhone.trim()) return;

    setSubmitting(true);
    try {
      const summaryMsg = `Custom Group Tour Request: ${groupSize} travelers (${groupType}) to ${destObj.name} for ${days} days (${days - 1} nights). Transport: ${transObj.label}, Stay: ${stayObj.label}. Est. budget BDT ${perPersonCost.toLocaleString()}/person (Total BDT ${totalCost.toLocaleString()}). Lead: ${leadName}, Phone: ${leadPhone}.`;

      const res = await apiRequest<{ ticketNumber: string }>("/api/contact", {
        method: "POST",
        body: JSON.stringify({
          name: leadName.trim(),
          phone: leadPhone.trim(),
          email: leadEmail.trim() || `${leadPhone.replace(/\D/g, "") || "quote"}@group.tourflow.bd`,
          division: destObj.name,
          subject: `Custom Group Quote: ${groupSize}p to ${destObj.name}`,
          message: summaryMsg,
        }),
      });

      if (res && res.ticketNumber) {
        setSubmittedTicket(res.ticketNumber);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const conciergePrompt = encodeURIComponent(
    `Plan a custom group tour for ${groupSize} travelers (${groupType}) to ${destObj.name} for ${days} days with ${transObj.label} and ${stayObj.label}. Estimated budget BDT ${perPersonCost} per person.`
  );

  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] dark:bg-[#090b0e] pb-24">
      {/* Banner */}
      <section className="border-b border-[#EBE6DC] dark:border-[#1e2434] bg-[#FAF8F5] dark:bg-[#090b0e] py-12 sm:py-16">
        <div className="w-full max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-14 2xl:px-20 space-y-4">
          <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold tracking-widest uppercase text-amber-800 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 px-3 py-1 rounded-full">
            <Sparkles className="h-4 w-4" />
            Group Tour Cost-Splitter &amp; Custom Quote Builder
          </span>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-stone-900 dark:text-stone-100 tracking-tight">
            Plan Your Group Journey
          </h1>
          <p className="text-base sm:text-lg text-stone-600 dark:text-stone-300 max-w-3xl leading-relaxed">
            Customize dates, transport, stay tiers, and special activities for university batches, corporate getaways, or family trips across Bangladesh. Get live per-person cost breakdowns.
          </p>
        </div>
      </section>

      {/* Main Interactive Grid */}
      <div className="w-full max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-14 2xl:px-20 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form Controls (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            {/* 1. Destination Picker */}
            <div className="bg-white dark:bg-[#141720] border border-[#EBE6DC] dark:border-[#1e2434] rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
              <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-amber-800 dark:text-amber-400" />
                1. Select Destination
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {DESTINATIONS.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setSelectedDest(d.id)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      selectedDest === d.id
                        ? "border-emerald-600 dark:border-emerald-500 bg-emerald-600 text-white shadow-sm"
                        : "border-[#E5DFD5] dark:border-[#262d3d] bg-[#FAF8F5] dark:bg-[#10131c] text-stone-900 dark:text-stone-100 hover:border-emerald-400"
                    }`}
                  >
                    <div className="font-bold text-sm">{d.name}</div>
                    <div className={`text-xs mt-1 line-clamp-1 ${selectedDest === d.id ? "text-emerald-100" : "text-stone-500 dark:text-stone-400"}`}>
                      {d.highlight}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Group Size & Type */}
            <div className="bg-white dark:bg-[#141720] border border-[#EBE6DC] dark:border-[#1e2434] rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm">
              <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Users className="h-5 w-5 text-amber-800 dark:text-amber-400" />
                2. Group Size &amp; Duration
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-stone-800 dark:text-stone-200">Travelers Count:</span>
                  <span className="font-mono text-base font-bold text-stone-900 dark:text-stone-100 bg-[#FAF8F5] dark:bg-[#10131c] px-3.5 py-1 rounded-xl border border-[#E5DFD5] dark:border-[#262d3d]">
                    {groupSize} Persons
                  </span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={40}
                  value={groupSize}
                  onChange={(e) => setGroupSize(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-stone-400">
                  <span>Couple (2)</span>
                  <span>Small Squad (6-12)</span>
                  <span>Batch (20)</span>
                  <span>Max Bus (40)</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">Group Category</label>
                  <select
                    value={groupType}
                    onChange={(e) => setGroupType(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-[#FAF8F5] dark:bg-[#10131c] border border-[#E5DFD5] dark:border-[#262d3d] text-sm font-medium text-stone-900 dark:text-stone-100 focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="Friends / University Batch">Friends / University Batch</option>
                    <option value="Corporate Retreat / Team Offsite">Corporate Retreat / Team Offsite</option>
                    <option value="Extended Family Vacation">Extended Family Vacation</option>
                    <option value="Photography & Trekking Squad">Photography &amp; Trekking Squad</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">Trip Duration</label>
                  <select
                    value={days}
                    onChange={(e) => setDays(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-2xl bg-[#FAF8F5] dark:bg-[#10131c] border border-[#E5DFD5] dark:border-[#262d3d] text-sm font-medium text-stone-900 dark:text-stone-100 focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value={2}>2 Days / 1 Night (Quick Weekend)</option>
                    <option value={3}>3 Days / 2 Nights (Recommended)</option>
                    <option value={4}>4 Days / 3 Nights (Extended Holiday)</option>
                    <option value={5}>5 Days / 4 Nights (Deep Exploration)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 3. Transport & Stay */}
            <div className="bg-white dark:bg-[#141720] border border-[#EBE6DC] dark:border-[#1e2434] rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
              <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Bus className="h-5 w-5 text-amber-800 dark:text-amber-400" />
                3. Transport &amp; Accommodation
              </h3>

              <div className="space-y-3">
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block">Transport Fleet Preference</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {TRANSPORT_TIERS.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedTransport(t.id)}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        selectedTransport === t.id
                          ? "border-emerald-600 dark:border-emerald-500 bg-emerald-600 text-white shadow-xs"
                          : "border-[#E5DFD5] dark:border-[#262d3d] bg-[#FAF8F5] dark:bg-[#10131c] text-stone-900 dark:text-stone-100 hover:border-emerald-400"
                      }`}
                    >
                      <div className="font-semibold text-xs sm:text-sm">{t.label}</div>
                      <div className={`text-[11px] mt-0.5 ${selectedTransport === t.id ? "text-emerald-100" : "text-stone-500 dark:text-stone-400"}`}>
                        {t.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block">Hotel / Resort Tier</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {STAY_TIERS.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSelectedStay(s.id)}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        selectedStay === s.id
                          ? "border-emerald-600 dark:border-emerald-500 bg-emerald-600 text-white shadow-xs"
                          : "border-[#E5DFD5] dark:border-[#262d3d] bg-[#FAF8F5] dark:bg-[#10131c] text-stone-900 dark:text-stone-100 hover:border-emerald-400"
                      }`}
                    >
                      <div className="font-semibold text-xs sm:text-sm">{s.label}</div>
                      <div className={`text-[11px] mt-0.5 ${selectedStay === s.id ? "text-emerald-100" : "text-stone-500 dark:text-stone-400"}`}>
                        {s.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Add-on toggles */}
              <div className="pt-4 border-t border-[#F0EBE1] dark:border-[#1e2434] flex flex-wrap gap-4 text-xs font-semibold text-stone-800 dark:text-stone-200">
                <label className="flex items-center gap-2 cursor-pointer bg-[#FAF8F5] dark:bg-[#10131c] border border-[#E5DFD5] dark:border-[#262d3d] px-3.5 py-2.5 rounded-xl">
                  <input
                    type="checkbox"
                    checked={includeBbq}
                    onChange={(e) => setIncludeBbq(e.target.checked)}
                    className="accent-emerald-600"
                  />
                  <span>BBQ Night / Campfire Feast</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer bg-[#FAF8F5] dark:bg-[#10131c] border border-[#E5DFD5] dark:border-[#262d3d] px-3.5 py-2.5 rounded-xl">
                  <input
                    type="checkbox"
                    checked={includeGuide}
                    onChange={(e) => setIncludeGuide(e.target.checked)}
                    className="accent-emerald-600"
                  />
                  <span>Dedicated Certified Field Guide</span>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Live Estimate & Quote Request (5 cols) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
            {/* Live Pricing Breakdown Card */}
            <div className="bg-white dark:bg-[#141720] border border-[#EBE6DC] dark:border-[#1e2434] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 block">
                Live Group Cost Splitter
              </span>

              <div className="p-5 rounded-2xl bg-[#FAF8F5] dark:bg-[#10131c] border border-[#E5DFD5] dark:border-[#262d3d] space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-stone-500 dark:text-stone-400">Per Person Fare (Split):</span>
                  <span className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-stone-100">
                    BDT {perPersonCost.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-baseline justify-between border-t border-[#EAE4D9] dark:border-[#1e2434] pt-2 text-xs">
                  <span className="text-stone-500 dark:text-stone-400">Total Group Estimate ({groupSize} guests):</span>
                  <span className="font-semibold text-stone-800 dark:text-stone-200">BDT {totalCost.toLocaleString()}</span>
                </div>
                {groupSize >= 10 && (
                  <div className="text-[11px] text-emerald-800 dark:text-emerald-300 font-bold bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 px-2.5 py-1 rounded-lg inline-block">
                    ✓ {groupSize >= 20 ? "8% Large Group Discount Applied" : "5% Group Discount Applied"}
                  </div>
                )}
              </div>

              {/* Summary bullets */}
              <div className="space-y-2 text-xs text-stone-600 dark:text-stone-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span><strong className="text-stone-900 dark:text-stone-100">{destObj.name}</strong> • {days} Days / {days - 1} Nights</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{transObj.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{stayObj.label}</span>
                </div>
                {includeBbq && (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Traditional Night BBQ &amp; Campfire setup</span>
                  </div>
                )}
              </div>

              {/* AI Concierge Preload Link */}
              <Link
                href={`/concierge?q=${conciergePrompt}`}
                className="w-full py-3 px-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40 text-xs font-semibold transition-all flex items-center justify-center gap-2"
              >
                <Bot className="h-4 w-4 text-amber-700 dark:text-amber-400" />
                <span>Discuss This Plan with AI Concierge</span>
              </Link>

              {/* Request Official Quote Form */}
              <div className="pt-4 border-t border-[#F0EBE1] dark:border-[#1e2434]">
                <h4 className="text-sm font-serif font-bold text-stone-900 dark:text-stone-100 mb-1">
                  Request Official Custom Quote
                </h4>
                <p className="text-xs text-stone-500 dark:text-stone-400 mb-4">
                  Our group coordinator will review your exact dates and provide tailored invoicing and payment terms.
                </p>

                {submittedTicket ? (
                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-900 dark:text-emerald-200 text-xs text-center space-y-2">
                    <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400 mx-auto" />
                    <div className="font-bold text-sm">Quote Request Registered!</div>
                    <p>Ticket Reference ID: <strong className="font-mono text-emerald-700 dark:text-emerald-300">{submittedTicket}</strong></p>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400">A coordinator will call you within 4 hours.</p>
                  </div>
                ) : (
                  <form onSubmit={handleRequestQuote} className="space-y-3">
                    <input
                      type="text"
                      required
                      placeholder="Your Full Name *"
                      value={leadName}
                      onChange={(e) => setLeadName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#10131c] border border-[#E5DFD5] dark:border-[#262d3d] text-xs text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:border-emerald-500"
                    />
                    <input
                      type="tel"
                      required
                      placeholder="Contact Phone Number *"
                      value={leadPhone}
                      onChange={(e) => setLeadPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#10131c] border border-[#E5DFD5] dark:border-[#262d3d] text-xs text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:border-emerald-500"
                    />
                    <input
                      type="email"
                      placeholder="Email Address (Optional)"
                      value={leadEmail}
                      onChange={(e) => setLeadEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#10131c] border border-[#E5DFD5] dark:border-[#262d3d] text-xs text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>{submitting ? "Submitting Request..." : "Submit Quote Request"}</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
