"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  Luggage,
  Search,
  Compass,
  CheckSquare,
  Square,
  AlertTriangle,
  FileText,
  PhoneCall,
  Clock,
  ArrowRight,
  ChevronRight,
  X
} from "lucide-react";
import { TRAVEL_TIPS_DATA } from "@/lib/tips-data";
import ImageWithFallback from "@/components/ImageWithFallback";

export default function TravelTipsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>({});

  const categories = [
    "All",
    "Hill Tracts",
    "Wetlands & Haors",
    "Tea & Forests",
    "Mangroves",
    "Islands & Coastal",
    "Rivers & Heritage",
    "Heritage & North",
    "Essentials & Cash"
  ];

  const packingChecklist = [
    { id: "p1", item: "National ID (NID) or Passport + 4 photocopies", tag: "Security Essential" },
    { id: "p2", item: "20,000mAh Power Bank (essential for remote hills and haor)", tag: "Electronics" },
    { id: "p3", item: "High-grip anti-skid water sandals or trekking shoes", tag: "Footwear" },
    { id: "p4", item: "Light rain poncho & waterproof phone pouch", tag: "Weather" },
    { id: "p5", item: "Mosquito repellent cream (Odomos) & personal medicine kit", tag: "Health" },
    { id: "p6", item: "Cash in small denominations (BDT 100, BDT 500) for local boatmen", tag: "Finance" },
    { id: "p7", item: "Reusable water bottle to minimize plastic waste", tag: "Eco Essential" },
    { id: "p8", item: "Earthy/subdued colored clothing for Sundarbans & Lawachara", tag: "Wildlife" },
    { id: "p9", item: "Offline downloaded navigation maps & emergency contacts", tag: "Digital" }
  ];

  const toggleCheck = (id: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const filteredTips = useMemo(() => {
    return TRAVEL_TIPS_DATA.filter((t) => {
      const matchCat = selectedCategory === "All" || t.category === selectedCategory;
      const matchSearch =
        !searchQuery ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.keyHighlights.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  const checkedCount = Object.values(checkedItems).filter(Boolean).length;

  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] pb-24">
      {/* Header Banner */}
      <section className="border-b border-[#EBE6DC] bg-[#FAF8F5] py-14 sm:py-16">
        <div className="w-full max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-14 2xl:px-20 space-y-4">
          <span className="text-xs sm:text-sm font-semibold tracking-widest uppercase text-amber-800">
            Field Manual &amp; Practical Domestic Guidance
          </span>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-stone-900 tracking-tight">
            Practical Travel Tips for Bangladesh
          </h1>
          <p className="text-base sm:text-lg text-stone-600 max-w-3xl leading-relaxed">
            Ground-truth advice verified by domestic travelers, licensed guides, and local boatmen. Click on any chapter to read full route maps, convoy schedules, BDT transport costs, and emergency protocols.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="w-full max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-14 2xl:px-20 mt-10 space-y-12">
        {/* Search & Category Filter */}
        <div className="bg-white border border-[#EBE6DC] rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
            <input
              type="text"
              placeholder="Search guidance (e.g. NID, Teletalk, life jacket, convoy, train, cash, coral)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-[#E5DFD5] rounded-2xl pl-12 pr-10 py-3.5 text-sm sm:text-base text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:border-stone-900 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="pt-2 border-t border-[#F0EBE1] flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                    active
                      ? "bg-stone-900 text-stone-50 shadow-xs"
                      : "bg-[#FAF8F5] text-stone-700 border border-[#E5DFD5] hover:bg-stone-100 hover:text-stone-900"
                  }`}
                >
                  {cat === "All" ? "All Field Guides" : cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Interactive Checklists & Safety Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Packing Checklist (8 cols) */}
          <div className="lg:col-span-8 bg-white border border-[#EBE6DC] rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#F0EBE1] gap-2">
              <div className="flex items-center gap-2.5">
                <Luggage className="h-5 w-5 text-amber-800" />
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
                  Essential Trip Packing Checklist
                </h2>
              </div>
              <span className="text-xs sm:text-sm font-semibold text-stone-500">
                {checkedCount} of {packingChecklist.length} packed
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              {packingChecklist.map((item) => {
                const isChecked = !!checkedItems[item.id];
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleCheck(item.id)}
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all ${
                      isChecked
                        ? "bg-[#FAF8F5] border-stone-300 text-stone-400 line-through"
                        : "bg-white border-[#E5DFD5] text-stone-800 hover:border-stone-400"
                    }`}
                  >
                    <div className="shrink-0 mt-0.5 text-stone-700">
                      {isChecked ? (
                        <CheckSquare className="h-4 w-4 text-amber-800" />
                      ) : (
                        <Square className="h-4 w-4 text-stone-400" />
                      )}
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-xs sm:text-sm font-medium leading-snug">{item.item}</div>
                      <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                        {item.tag}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Emergency Helplines (4 cols) */}
          <div className="lg:col-span-4 bg-white border border-[#EBE6DC] rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm">
            <h3 className="text-xl font-serif font-bold text-stone-900 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-amber-800" />
              <span>Tourist Police Hotlines</span>
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Save these official emergency numbers on your phone before embarking on your trip:
            </p>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5] space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                  Tourist Police 24/7 Control
                </span>
                <div className="text-base font-bold font-mono text-stone-900">+880 1320-222222</div>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5] space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                  National Emergency
                </span>
                <div className="text-base font-bold font-mono text-stone-900">999</div>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5] space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                  Tourist Police App
                </span>
                <div className="font-semibold text-stone-800">&quot;Hello Tourist Police&quot; on Play Store</div>
              </div>
            </div>
          </div>
        </div>

        {/* Guides Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between text-sm text-stone-600 px-1">
            <span>
              Showing <strong className="text-stone-900 font-bold">{filteredTips.length}</strong> field guidance chapters
            </span>
            <span className="text-xs sm:text-sm text-stone-500">
              Click any chapter to view full route directions &amp; permits
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredTips.map((item) => (
              <div
                key={item.id}
                className="group bg-white border border-[#EBE6DC] rounded-3xl overflow-hidden hover:border-[#C4BAA9] hover-lift transition-smooth flex flex-col justify-between shadow-xs"
              >
                <div>
                  {/* Photo Header */}
                  <Link href={`/tips/${item.id}`} className="block relative h-56 w-full overflow-hidden bg-stone-100">
                    <ImageWithFallback
                      src={item.coverImage}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent opacity-90" />

                    <div className="absolute top-4 left-4 flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md bg-white/95 text-stone-900 shadow-xs border border-white/40`}>
                        {item.category}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md bg-stone-900/80 text-stone-100 shadow-xs">
                        {item.division}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-white font-medium">
                      <span className="flex items-center gap-1.5 drop-shadow">
                        <Clock className="h-3.5 w-3.5 text-amber-300" />
                        {item.readingTime}
                      </span>
                      <span className="flex items-center gap-1 drop-shadow font-semibold text-amber-200">
                        Field Verified
                      </span>
                    </div>
                  </Link>

                  {/* Body Content */}
                  <div className="p-6 sm:p-8 space-y-4">
                    <Link href={`/tips/${item.id}`}>
                      <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 group-hover:text-amber-800 transition-colors leading-snug">
                        {item.title}
                      </h2>
                    </Link>

                    <p className="text-sm text-stone-600 leading-relaxed line-clamp-2">
                      {item.summary}
                    </p>

                    {/* Bullet Highlights */}
                    <ul className="space-y-2.5 text-xs sm:text-sm text-stone-600 pt-2 border-t border-[#F0EBE1]">
                      {item.keyHighlights.slice(0, 3).map((point, i) => (
                        <li key={i} className="flex items-start gap-2.5 leading-relaxed">
                          <CheckCircle2 className="h-4 w-4 text-amber-800 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-6 sm:p-8 pt-0">
                  <div className="pt-4 border-t border-[#F0EBE1] flex items-center justify-between gap-4">
                    <span className="text-xs text-stone-500 font-medium flex items-center gap-1">
                      <Compass className="h-3.5 w-3.5 text-stone-400" />
                      Free Field Guide
                    </span>

                    <Link
                      href={`/tips/${item.id}`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-stone-900 hover:bg-stone-800 text-stone-50 text-xs sm:text-sm font-semibold transition-all shadow-xs"
                    >
                      <span>Read Field Guide &amp; Routes</span>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
