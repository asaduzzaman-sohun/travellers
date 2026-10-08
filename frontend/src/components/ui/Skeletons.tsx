"use client";

import React from "react";

export function TourCardSkeleton() {
  return (
    <div className="bg-white border border-[#EBE6DC] rounded-3xl overflow-hidden shadow-xs animate-pulse flex flex-col">
      {/* Image Skeleton */}
      <div className="h-72 w-full bg-stone-200" />

      {/* Body Skeleton */}
      <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-5">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-4 w-24 bg-stone-200 rounded-md" />
            <div className="h-4 w-16 bg-stone-200 rounded-md" />
          </div>
          <div className="h-6 w-3/4 bg-stone-200 rounded-md" />
          <div className="space-y-1.5 pt-1">
            <div className="h-3.5 w-full bg-stone-200 rounded" />
            <div className="h-3.5 w-5/6 bg-stone-200 rounded" />
          </div>
        </div>

        <div className="pt-4 border-t border-[#F0EBE1] flex items-center justify-between">
          <div className="space-y-1">
            <div className="h-3 w-16 bg-stone-200 rounded" />
            <div className="h-6 w-24 bg-stone-200 rounded-md" />
          </div>
          <div className="h-9 w-28 bg-stone-200 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function TourDetailSkeleton() {
  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] pb-24 animate-pulse">
      {/* Top Banner Skeleton */}
      <div className="w-full max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-14 2xl:px-20 py-8 space-y-6">
        <div className="h-4 w-48 bg-stone-200 rounded" />
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="h-6 w-20 bg-stone-200 rounded-full" />
            <div className="h-6 w-24 bg-stone-200 rounded-full" />
          </div>
          <div className="h-10 w-2/3 bg-stone-200 rounded-lg" />
          <div className="h-4 w-1/3 bg-stone-200 rounded" />
        </div>

        {/* Gallery Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[380px] sm:h-[480px] rounded-3xl overflow-hidden">
          <div className="md:col-span-2 h-full bg-stone-200" />
          <div className="hidden md:grid grid-rows-2 gap-4 h-full">
            <div className="bg-stone-200" />
            <div className="bg-stone-200" />
          </div>
        </div>

        {/* Quick Facts Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-white border border-[#EBE6DC] rounded-3xl p-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-3 w-16 bg-stone-200 rounded" />
              <div className="h-5 w-24 bg-stone-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function StoryCardSkeleton() {
  return (
    <div className="bg-white border border-[#EBE6DC] rounded-3xl p-6 sm:p-7 shadow-xs animate-pulse space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-6 w-20 bg-stone-200 rounded-full" />
        <div className="h-4 w-16 bg-stone-200 rounded" />
      </div>
      <div className="h-6 w-3/4 bg-stone-200 rounded-md" />
      <div className="space-y-1.5">
        <div className="h-3.5 w-full bg-stone-200 rounded" />
        <div className="h-3.5 w-4/5 bg-stone-200 rounded" />
      </div>
      <div className="pt-4 border-t border-[#F0EBE1] flex items-center justify-between">
        <div className="h-4 w-28 bg-stone-200 rounded" />
        <div className="h-4 w-16 bg-stone-200 rounded" />
      </div>
    </div>
  );
}
