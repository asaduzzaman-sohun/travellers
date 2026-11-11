"use client";

import { useState, useEffect, useCallback } from "react";

export interface CompareTourItem {
  id: string;
  slug: string;
  title: string;
  destination: string;
  coverImageUrl: string;
  basePrice: number;
  discountPrice?: number | null;
  depositAmount?: number;
  durationDays: number;
  durationNights?: number;
  maxGroupSize?: number;
  difficulty?: string;
  category?: string;
  idealSeason?: string;
  startCity?: string;
  averageRating?: number;
  reviewCount?: number;
  highlights?: string[];
}

export const MAX_COMPARE_ITEMS = 3;
const STORAGE_KEY = "tourflow_compare_v1";
const SYNC_EVENT = "tourflow:compare-updated";

function readCompareList(): CompareTourItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, MAX_COMPARE_ITEMS) : [];
  } catch {
    return [];
  }
}

function writeCompareList(items: CompareTourItem[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent(SYNC_EVENT));
  } catch {
    // Ignore storage quota errors
  }
}

export function useTourCompare() {
  const [items, setItems] = useState<CompareTourItem[]>([]);

  useEffect(() => {
    setItems(readCompareList());

    const handleSync = () => setItems(readCompareList());
    window.addEventListener(SYNC_EVENT, handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener(SYNC_EVENT, handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  const isInCompare = useCallback(
    (tourId: string) => items.some((item) => item.id === tourId),
    [items]
  );

  const toggleCompare = useCallback(
    (tour: CompareTourItem): { added: boolean; limitReached?: boolean } => {
      const current = readCompareList();
      if (current.some((item) => item.id === tour.id)) {
        const updated = current.filter((item) => item.id !== tour.id);
        writeCompareList(updated);
        setItems(updated);
        return { added: false };
      }

      if (current.length >= MAX_COMPARE_ITEMS) {
        return { added: false, limitReached: true };
      }

      const updated = [...current, tour];
      writeCompareList(updated);
      setItems(updated);
      return { added: true };
    },
    []
  );

  const removeFromCompare = useCallback((tourId: string) => {
    const updated = readCompareList().filter((item) => item.id !== tourId);
    writeCompareList(updated);
    setItems(updated);
  }, []);

  const clearCompare = useCallback(() => {
    writeCompareList([]);
    setItems([]);
  }, []);

  return {
    items,
    count: items.length,
    maxItems: MAX_COMPARE_ITEMS,
    isInCompare,
    toggleCompare,
    removeFromCompare,
    clearCompare,
  };
}
