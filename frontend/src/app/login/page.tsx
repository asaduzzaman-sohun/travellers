"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, AlertCircle, ArrowRight, Compass, Crown, ShieldCheck, Sparkles, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoggedIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeRoleLoggingIn, setActiveRoleLoggingIn] = useState<string | null>(null);

  useEffect(() => {
    if (isLoggedIn) {
      router.push("/profile");
    }
  }, [isLoggedIn, router]);

  if (isLoggedIn) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await login(email, password);
      if (!res.success) {
        setError(res.error || "Invalid email or password.");
      } else {
        router.push("/profile");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleQuickLogin = async (roleType: "superadmin" | "admin" | "user") => {
    setError(null);
    setLoading(true);
    setActiveRoleLoggingIn(roleType);

    // Secure preset resolution - credentials are not exposed on screen
    let targetEmail = "";
    let targetPass = "";

    if (roleType === "superadmin") {
      targetEmail = "super.admin@traveller.com";
      targetPass = "Traveller@2026";
    } else if (roleType === "admin") {
      targetEmail = "admin@traveller.com";
      targetPass = "Admin@2026";
    } else {
      targetEmail = "asad@gmail.com";
      targetPass = "Asad@2026";
    }

    try {
      const res = await login(targetEmail, targetPass);
      if (!res.success) {
        setError(res.error || "Authentication failed for selected role.");
      } else {
        router.push("/profile");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
      setActiveRoleLoggingIn(null);
    }
  };

  return (
    <div className="min-h-[88vh] flex items-center justify-center py-16 px-6 sm:px-10 bg-[#FAF8F5]">
      <div className="max-w-xl w-full space-y-7 bg-white border border-[#EBE6DC] p-8 sm:p-12 rounded-3xl shadow-sm relative overflow-hidden">
        {/* Brand Header */}
        <div className="text-center space-y-2.5">
          <Link href="/" className="inline-block group">
            <span className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-stone-900 group-hover:text-stone-700 transition-colors">
              Traveller&apos;s
            </span>
          </Link>

          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
            Sign In to Platform
          </h1>
          <p className="text-sm text-stone-600 leading-relaxed max-w-sm mx-auto">
            Choose your dedicated role portal for instant authorized access, or sign in manually.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2.5">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Simple Text Role Access */}
        <div className="flex items-center justify-between gap-2 p-1.5 rounded-2xl bg-[#FAF8F5] border border-[#EBE6DC]">
          <button
            type="button"
            disabled={loading}
            onClick={() => handleRoleQuickLogin("superadmin")}
            className="flex-1 py-2.5 px-2 rounded-xl bg-white border border-[#EBE6DC] hover:border-stone-400 hover:bg-stone-50 text-xs sm:text-sm font-semibold text-stone-900 transition-all disabled:opacity-50 text-center cursor-pointer shadow-2xs"
          >
            {activeRoleLoggingIn === "superadmin" ? "Signing In..." : "Super Admin"}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => handleRoleQuickLogin("admin")}
            className="flex-1 py-2.5 px-2 rounded-xl bg-white border border-[#EBE6DC] hover:border-stone-400 hover:bg-stone-50 text-xs sm:text-sm font-semibold text-stone-900 transition-all disabled:opacity-50 text-center cursor-pointer shadow-2xs"
          >
            {activeRoleLoggingIn === "admin" ? "Signing In..." : "Admin"}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => handleRoleQuickLogin("user")}
            className="flex-1 py-2.5 px-2 rounded-xl bg-white border border-[#EBE6DC] hover:border-stone-400 hover:bg-stone-50 text-xs sm:text-sm font-semibold text-stone-900 transition-all disabled:opacity-50 text-center cursor-pointer shadow-2xs"
          >
            {activeRoleLoggingIn === "user" ? "Signing In..." : "User (Traveler)"}
          </button>
        </div>

        {/* Separator */}
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#EBE6DC]" />
          </div>
          <span className="relative bg-white px-3 text-xs uppercase tracking-wider text-stone-500 font-medium">
            Or Sign In With Custom Email
          </span>
        </div>

        {/* Manual Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div className="space-y-1.5">
            <label className="block text-stone-800 font-semibold">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
              <input
                type="email"
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#E5DFD5] rounded-2xl pl-12 pr-4 py-3.5 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 transition-colors"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-stone-800 font-semibold">Password</label>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#E5DFD5] rounded-2xl pl-12 pr-4 py-3.5 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 transition-colors"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-full bg-stone-900 hover:bg-stone-800 text-stone-50 font-semibold text-sm sm:text-base shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <span>{loading ? "Authenticating..." : "Sign In to Account"}</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          <div className="text-center pt-2">
            <p className="text-sm text-stone-600">
              New to Traveller&apos;s?{" "}
              <Link href="/register" className="font-semibold text-stone-900 hover:text-amber-800 underline">
                Create an account
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
