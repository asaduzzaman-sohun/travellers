"use client";

import { useEffect, useCallback, useSyncExternalStore } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  WishlistApiItem,
  clearWishlistApi,
  syncWishlistApi,
  toggleWishlistApi,
} from "@/lib/api";

export interface WishlistTourItem {
  id: string;
  slug: string;
  title: string;
  destination: string;
  country: string;
  coverImageUrl: string;
  basePrice: number;
  discountPrice?: number | null;
  durationDays: number;
  durationNights: number;
  averageRating: number;
  reviewCount: number;
  category: string;
  difficulty: string;
  savedAt: string;
}

const STORAGE_KEY = "tourflow_wishlist_v1";
const SYNC_EVENT = "tourflow-wishlist-updated";
const EMPTY_LIST: WishlistTourItem[] = [];

let cachedRaw: string | null = null;
let cachedParsed: WishlistTourItem[] = EMPTY_LIST;
let lastSyncedUserKey: string | null = null;
let inFlightSyncPromise: Promise<void> | null = null;

function readStorage(): WishlistTourItem[] {
  if (typeof window === "undefined") return EMPTY_LIST;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === cachedRaw) return cachedParsed;
    cachedRaw = raw;
    if (!raw) {
      cachedParsed = EMPTY_LIST;
      return cachedParsed;
    }
    const parsed = JSON.parse(raw);
    cachedParsed = Array.isArray(parsed) ? parsed : EMPTY_LIST;
    return cachedParsed;
  } catch {
    return EMPTY_LIST;
  }
}

function getServerSnapshot(): WishlistTourItem[] {
  return EMPTY_LIST;
}

function subscribeWishlistStore(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(SYNC_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(SYNC_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function writeStorage(items: WishlistTourItem[]) {
  if (typeof window === "undefined") return;
  try {
    const raw = JSON.stringify(items);
    cachedRaw = raw;
    cachedParsed = items;
    localStorage.setItem(STORAGE_KEY, raw);
    window.dispatchEvent(new Event(SYNC_EVENT));
  } catch {
    // Ignore storage quota issues safely
  }
}

function mapApiToWishlistItem(
  dto: WishlistApiItem,
  existing?: WishlistTourItem
): WishlistTourItem {
  return {
    id: dto.id,
    slug: dto.slug,
    title: dto.title,
    destination: dto.destination,
    country: existing?.country || "Bangladesh",
    coverImageUrl: dto.coverImageUrl || existing?.coverImageUrl || "",
    basePrice: dto.basePrice,
    discountPrice: dto.discountPrice ?? null,
    durationDays: dto.durationDays,
    durationNights: dto.durationNights,
    averageRating: dto.averageRating || existing?.averageRating || 4.9,
    reviewCount: existing?.reviewCount ?? 0,
    category: existing?.category || "Curated Tour",
    difficulty: existing?.difficulty || "Easy",
    savedAt: dto.savedAtUtc || existing?.savedAt || new Date().toISOString(),
  };
}

export function useWishlist() {
  const { token, user } = useAuth();
  const items = useSyncExternalStore(
    subscribeWishlistStore,
    readStorage,
    getServerSnapshot
  );

  // Synchronize local wishlist with PostgreSQL once per authenticated user session
  useEffect(() => {
    if (!token || !user?.id) {
      lastSyncedUserKey = null;
      return;
    }

    const sessionKey = `${user.id}:${token.slice(-12)}`;
    if (lastSyncedUserKey === sessionKey || inFlightSyncPromise) {
      return;
    }

    const localItems = readStorage();
    const localIds = localItems.map((x) => x.id);

    inFlightSyncPromise = syncWishlistApi(localIds, token)
      .then((serverItems) => {
        const localById = new Map(localItems.map((x) => [x.id, x]));
        const merged = serverItems.map((srv) =>
          mapApiToWishlistItem(srv, localById.get(srv.id))
        );
        lastSyncedUserKey = sessionKey;
        writeStorage(merged);
      })
      .catch(() => {
        // Retain local cache cleanly if backend sync fails offline
      })
      .finally(() => {
        inFlightSyncPromise = null;
      });
  }, [token, user?.id]);

  const isSaved = useCallback(
    (tourId: string) => items.some((x) => x.id === tourId),
    [items]
  );

  const toggleWishlist = useCallback(
    (tour: Omit<WishlistTourItem, "savedAt">) => {
      const current = readStorage();
      const exists = current.some((x) => x.id === tour.id);
      const next = exists
        ? current.filter((x) => x.id !== tour.id)
        : [{ ...tour, savedAt: new Date().toISOString() }, ...current];

      writeStorage(next);

      if (token) {
        toggleWishlistApi(tour.id, token).catch(() => {});
      }

      return !exists;
    },
    [token]
  );

  const removeFromWishlist = useCallback(
    (tourId: string) => {
      const current = readStorage();
      const existed = current.some((x) => x.id === tourId);
      const next = current.filter((x) => x.id !== tourId);
      writeStorage(next);

      if (token && existed) {
        toggleWishlistApi(tourId, token).catch(() => {});
      }
    },
    [token]
  );

  const clearWishlist = useCallback(() => {
    writeStorage(EMPTY_LIST);
    if (token) {
      clearWishlistApi(token).catch(() => {});
    }
  }, [token]);

  return {
    items,
    isLoaded: true,
    count: items.length,
    isSaved,
    toggleWishlist,
    removeFromWishlist,
    clearWishlist,
  };
}
