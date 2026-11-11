"use client";

import { useState, useEffect, useCallback } from "react";

export interface WishlistTourItem {
  id: string;
  slug: string;
  title: string;
  destination: string;
  country?: string;
  coverImageUrl: string;
  basePrice: number;
  discountPrice?: number | null;
  durationDays: number;
  durationNights?: number;
  averageRating?: number;
  reviewCount?: number;
  category?: string;
  difficulty?: string;
  savedAt: string;
}

const STORAGE_KEY = "tourflow_wishlist_v1";
const SYNC_EVENT = "tourflow:wishlist-updated";

function readWishlist(): WishlistTourItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeWishlist(items: WishlistTourItem[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent(SYNC_EVENT));
  } catch {
    // Ignore storage quota errors
  }
}

export function useWishlist() {
  const [items, setItems] = useState<WishlistTourItem[]>([]);

  useEffect(() => {
    setItems(readWishlist());

    const handleSync = () => setItems(readWishlist());
    window.addEventListener(SYNC_EVENT, handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener(SYNC_EVENT, handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  const isSaved = useCallback(
    (tourId: string) => items.some((item) => item.id === tourId),
    [items]
  );

  const toggleWishlist = useCallback((tour: Omit<WishlistTourItem, "savedAt">) => {
    const current = readWishlist();
    const exists = current.some((item) => item.id === tour.id);
    const updated = exists
      ? current.filter((item) => item.id !== tour.id)
      : [{ ...tour, savedAt: new Date().toISOString() }, ...current];

    writeWishlist(updated);
    setItems(updated);
    return !exists;
  }, []);

  const removeFromWishlist = useCallback((tourId: string) => {
    const updated = readWishlist().filter((item) => item.id !== tourId);
    writeWishlist(updated);
    setItems(updated);
  }, []);

  const clearWishlist = useCallback(() => {
    writeWishlist([]);
    setItems([]);
  }, []);

  return {
    items,
    count: items.length,
    isSaved,
    toggleWishlist,
    removeFromWishlist,
    clearWishlist,
  };
}
