"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/profile");
  }, [router]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-[#FAF8F5]">
      <div className="text-center space-y-3">
        <div className="h-8 w-8 mx-auto animate-spin rounded-full border-2 border-stone-900 border-t-transparent" />
        <p className="text-xs text-stone-500 font-medium">Redirecting to Unified Admin Console...</p>
      </div>
    </div>
  );
}
