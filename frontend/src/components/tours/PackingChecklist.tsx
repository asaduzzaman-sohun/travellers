"use client";

import { useState, useEffect } from "react";
import { CheckSquare, Square, Luggage, RotateCcw, CheckCircle2 } from "lucide-react";

interface PackingChecklistProps {
  tourTitle: string;
  tourSlug: string;
  packingTips?: string[];
}

interface ChecklistItem {
  id: string;
  label: string;
  required?: boolean;
}

const DEFAULT_BANGLADESH_ITEMS: ChecklistItem[] = [
  { id: "nid", label: "4-6 Physical Photocopies of NID / Passport (Mandatory for Army/Police Checkposts)", required: true },
  { id: "powerbank", label: "High-capacity Power Bank (20,000mAh - electricity may be intermittent)", required: true },
  { id: "cash", label: "Physical Cash in BDT (Remote ATMs frequently offline in hill & haor areas)", required: true },
  { id: "shoes", label: "Trekking shoes or grip sandals with heel straps (slippery rocks/trails)" },
  { id: "raincoat", label: "Waterproof dry bag or poncho (essential for boat cruises & haor splashes)" },
  { id: "repellent", label: "Odomos mosquito repellent & basic first aid kit (Orsaline, Paracetamol)" },
  { id: "leech", label: "Leech socks or salt/tobacco mix (crucial for trekking to Nafakhum / Amiakhum)" },
  { id: "sunscreen", label: "Sunscreen, sunglasses & breathable wide-brim hat" },
];

export default function PackingChecklist({
  tourTitle,
  tourSlug,
  packingTips = [],
}: PackingChecklistProps) {
  // Combine custom tour packing tips with core checklist
  const initialItems: ChecklistItem[] = [
    ...DEFAULT_BANGLADESH_ITEMS,
    ...packingTips.map((tip, idx) => ({
      id: `custom-${idx}`,
      label: tip,
    })),
  ];

  const storageKey = `tourflow_packing_${tourSlug}`;
  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setCheckedIds(JSON.parse(saved));
      }
    } catch {
      // fallback in case of localStorage restrictions
    } finally {
      setIsLoaded(true);
    }
  }, [storageKey]);

  const toggleItem = (id: string) => {
    setCheckedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id];
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const resetAll = () => {
    setCheckedIds([]);
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
  };

  const total = initialItems.length;
  const completed = checkedIds.length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="bg-white border border-[#EBE6DC] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-amber-50 text-amber-800 border border-amber-200">
            <Luggage className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-lg font-serif font-bold text-stone-900">
              Interactive Packing Checklist
            </h4>
            <p className="text-xs text-stone-500">
              Tailored preparation for {tourTitle}
            </p>
          </div>
        </div>

        {completed > 0 && (
          <button
            onClick={resetAll}
            type="button"
            className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-800 transition-colors self-start sm:self-center"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset List</span>
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-semibold">
          <span className="text-stone-600">
            {completed} of {total} items packed
          </span>
          <span
            className={`${
              percent === 100 ? "text-emerald-700" : "text-amber-800"
            }`}
          >
            {percent}% Ready
          </span>
        </div>
        <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden border border-stone-200/50">
          <div
            className={`h-full transition-all duration-300 rounded-full ${
              percent === 100 ? "bg-emerald-600" : "bg-amber-600"
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Checklist Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
        {initialItems.map((item) => {
          const isChecked = isLoaded && checkedIds.includes(item.id);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => toggleItem(item.id)}
              className={`flex items-start gap-3 p-3 rounded-2xl text-left border transition-all ${
                isChecked
                  ? "bg-emerald-50/50 border-emerald-200 text-stone-500 line-through"
                  : "bg-[#FAF8F5] border-[#EBE6DC] text-stone-800 hover:border-stone-400"
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {isChecked ? (
                  <CheckSquare className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Square className="w-4 h-4 text-stone-400" />
                )}
              </div>
              <div className="text-xs sm:text-sm leading-snug">
                <span>{item.label}</span>
                {item.required && !isChecked && (
                  <span className="block text-[10px] font-bold text-amber-800 uppercase tracking-wider mt-0.5 no-underline">
                    Essential
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {percent === 100 && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span className="font-medium">
            You&apos;re completely geared up for your expedition! Safe travels across Bangladesh.
          </span>
        </div>
      )}
    </div>
  );
}
