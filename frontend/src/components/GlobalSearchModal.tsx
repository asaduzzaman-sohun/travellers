"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Search,
  X,
  Compass,
  Hotel,
  BookOpen,
  FileText,
  Bot,
  ArrowRight,
  Loader2,
  MapPin,
} from "lucide-react";
import { GlobalSearchResponse, searchGlobalCatalog } from "@/lib/api";

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GlobalSearchModal({
  isOpen,
  onClose,
}: GlobalSearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GlobalSearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      const id = setTimeout(() => inputRef.current?.focus(), 40);
      return () => clearTimeout(id);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const data = await searchGlobalCatalog(query.trim(), 4);
        if (!cancelled) setResults(data);
      } catch {
        if (!cancelled) setResults(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, query.trim() ? 220 : 0);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, isOpen]);

  if (!isOpen) return null;

  const hasResults =
    results &&
    (results.tours.length > 0 ||
      results.hotels.length > 0 ||
      results.tips.length > 0 ||
      results.stories.length > 0);

  return (
    <div
      className="fixed inset-0 z-[110] flex items-start justify-center bg-black/55 backdrop-blur-xs p-4 sm:pt-20 animate-in fade-in duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Global TourFlow Search"
    >
      <div
        className="w-full max-w-2xl rounded-2xl border border-[#E5DFD3] bg-[#FDFBF7] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3.5 bg-white border-b border-[#EFEAE0]">
          <Search className="h-4 w-4 text-stone-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tours, Sylhet resorts, Cox's Bazar, safety guides..."
            className="flex-1 bg-transparent text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none"
          />
          {loading && <Loader2 className="h-4 w-4 animate-spin text-stone-400" />}
          <kbd className="hidden sm:inline-flex items-center rounded border border-stone-200 bg-stone-50 px-1.5 py-0.5 text-[10px] font-mono text-stone-500">
            ESC
          </kbd>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="p-1 rounded-full text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[65vh] overflow-y-auto p-4 space-y-5">
          {!results && !loading && (
            <p className="text-xs text-stone-500 text-center py-6">
              Unable to reach catalog search right now.
            </p>
          )}

          {results && !hasResults && !loading && (
            <div className="text-center py-8 space-y-2">
              <p className="text-sm font-semibold text-stone-900">
                No direct catalog match for &ldquo;{results.query}&rdquo;
              </p>
              <p className="text-xs text-stone-500">
                Try asking our AI Concierge for custom recommendations, promos, or departure schedules.
              </p>
            </div>
          )}

          {results && results.tours.length > 0 && (
            <section className="space-y-2">
              <div className="flex items-center gap-1.5 px-1 text-[11px] font-bold uppercase tracking-wider text-stone-500">
                <Compass className="h-3.5 w-3.5 text-emerald-700" />
                <span>Curated Tours</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {results.tours.map((t) => (
                  <Link
                    key={t.id}
                    href={`/tours/${t.slug}`}
                    onClick={onClose}
                    className="flex items-center justify-between gap-3 rounded-xl border border-[#EBE6DC] bg-white px-3 py-2.5 hover:border-stone-400 hover:shadow-xs transition-all"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-stone-950 truncate">
                        {t.title}
                      </p>
                      <p className="text-[11px] text-stone-500 inline-flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span>
                          {t.destination} &middot; {t.durationDays}D/{t.durationNights}N
                        </span>
                      </p>
                    </div>
                    <span className="shrink-0 text-xs font-bold text-emerald-900">
                      BDT {t.effectivePrice.toLocaleString()}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {results && results.hotels.length > 0 && (
            <section className="space-y-2">
              <div className="flex items-center gap-1.5 px-1 text-[11px] font-bold uppercase tracking-wider text-stone-500">
                <Hotel className="h-3.5 w-3.5 text-amber-700" />
                <span>Partner Hotels &amp; Resorts</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {results.hotels.map((h) => (
                  <Link
                    key={h.id}
                    href={h.relatedTourSlug ? `/tours/${h.relatedTourSlug}` : "/hotels"}
                    onClick={onClose}
                    className="flex items-center justify-between gap-3 rounded-xl border border-[#EBE6DC] bg-white px-3 py-2.5 hover:border-stone-400 transition-all"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-stone-950 truncate">
                        {h.name}
                      </p>
                      <p className="text-[11px] text-stone-500 truncate mt-0.5">
                        {h.location} &middot; {h.tier} &middot; &#9733; {h.rating.toFixed(1)}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs font-bold text-stone-900">
                      BDT {h.priceNumeric.toLocaleString()}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {results && results.tips.length > 0 && (
            <section className="space-y-2">
              <div className="flex items-center gap-1.5 px-1 text-[11px] font-bold uppercase tracking-wider text-stone-500">
                <BookOpen className="h-3.5 w-3.5 text-sky-700" />
                <span>Travel Tips &amp; Checklists</span>
              </div>
              <div className="space-y-1.5">
                {results.tips.map((tip) => (
                  <Link
                    key={tip.id}
                    href={`/tips/${tip.slug}`}
                    onClick={onClose}
                    className="flex items-center justify-between gap-3 rounded-xl border border-[#EBE6DC] bg-white px-3 py-2 hover:border-stone-400 transition-all"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-stone-950 truncate">
                        {tip.title}
                      </p>
                      <p className="text-[11px] text-stone-500 truncate">
                        {tip.division} &middot; {tip.readingTime}
                      </p>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {results && results.stories.length > 0 && (
            <section className="space-y-2">
              <div className="flex items-center gap-1.5 px-1 text-[11px] font-bold uppercase tracking-wider text-stone-500">
                <FileText className="h-3.5 w-3.5 text-stone-700" />
                <span>Traveler Community Stories</span>
              </div>
              <div className="space-y-1.5">
                {results.stories.map((story) => (
                  <Link
                    key={story.id}
                    href="/blog"
                    onClick={onClose}
                    className="flex items-center justify-between gap-3 rounded-xl border border-[#EBE6DC] bg-white px-3 py-2 hover:border-stone-400 transition-all"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-stone-950 truncate">
                        {story.title}
                      </p>
                      <p className="text-[11px] text-stone-500 truncate">
                        {story.division} &middot; By {story.authorName}
                      </p>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="px-4 py-3 bg-white border-t border-[#EFEAE0] flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] text-stone-500">
            Instant cross-catalog search across Tours, Stays &amp; Field Guides
          </span>
          <Link
            href={
              query.trim()
                ? `/concierge?q=${encodeURIComponent(query.trim())}`
                : "/concierge"
            }
            onClick={onClose}
            className="inline-flex items-center gap-1.5 rounded-full bg-stone-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-stone-800 transition-colors"
          >
            <Bot className="h-3.5 w-3.5" />
            <span>
              {query.trim()
                ? `Ask AI Concierge about "${query.trim().slice(0, 24)}"`
                : "Ask AI Concierge"}
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
