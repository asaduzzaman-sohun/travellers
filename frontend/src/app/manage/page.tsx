"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function ManageRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");

  useEffect(() => {
    if (ref) {
      router.replace(`/profile?tab=expeditions&ref=${encodeURIComponent(ref)}`);
    } else {
      router.replace("/profile?tab=expeditions");
    }
  }, [router, ref]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-[#FAF8F5]">
      <div className="text-center space-y-3">
        <div className="h-8 w-8 mx-auto animate-spin rounded-full border-2 border-stone-900 border-t-transparent" />
        <p className="text-xs text-stone-500 font-medium">Redirecting to Traveler Expeditions...</p>
      </div>
    </div>
  );
}

export default function ManagePage() {
  return (
    <Suspense fallback={null}>
      <ManageRedirect />
    </Suspense>
  );
}
