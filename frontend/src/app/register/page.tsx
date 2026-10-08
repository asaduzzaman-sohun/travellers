"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, Phone, MapPin, AlertCircle, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoggedIn } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [homeCity, setHomeCity] = useState("Dhaka");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
      const res = await register(fullName, email, password, phoneNumber, homeCity);
      if (!res.success) {
        setError(res.error || "Registration failed.");
      } else {
        router.push("/profile");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-16 px-6 sm:px-10 bg-[#FAF8F5]">
      <div className="max-w-lg w-full space-y-8 bg-white border border-[#EBE6DC] p-8 sm:p-12 rounded-3xl shadow-sm relative overflow-hidden">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <Link href="/" className="inline-block group">
            <span className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-stone-900 group-hover:text-stone-700 transition-colors">
              Traveller&apos;s
            </span>
          </Link>

          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
            Create Traveler Account
          </h1>
          <p className="text-sm text-stone-600 leading-relaxed max-w-sm mx-auto">
            Join thousands of domestic explorers sharing authentic routes and insights across Bangladesh.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2.5">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div className="space-y-1.5">
            <label className="block text-stone-800 font-semibold">Full Name *</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
              <input
                type="text"
                placeholder="e.g. Tanvir Ahmed"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#E5DFD5] rounded-2xl pl-12 pr-4 py-3.5 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 transition-colors"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-stone-800 font-semibold">Email Address *</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
              <input
                type="email"
                placeholder="tanvir@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#E5DFD5] rounded-2xl pl-12 pr-4 py-3.5 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 transition-colors"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-stone-800 font-semibold">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
                <input
                  type="tel"
                  placeholder="+880 1711-234567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#E5DFD5] rounded-2xl pl-12 pr-4 py-3.5 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-stone-800 font-semibold">Home City</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
                <select
                  value={homeCity}
                  onChange={(e) => setHomeCity(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#E5DFD5] rounded-2xl pl-12 pr-4 py-3.5 text-stone-900 focus:outline-none focus:border-stone-900 transition-colors cursor-pointer"
                >
                  <option value="Dhaka">Dhaka</option>
                  <option value="Chittagong">Chittagong</option>
                  <option value="Sylhet">Sylhet</option>
                  <option value="Khulna">Khulna</option>
                  <option value="Barishal">Barishal</option>
                  <option value="Rajshahi">Rajshahi</option>
                  <option value="Rangpur">Rangpur</option>
                  <option value="Mymensingh">Mymensingh</option>
                  <option value="Cox's Bazar">Cox&apos;s Bazar</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-stone-800 font-semibold">Password *</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
              <input
                type="password"
                placeholder="Minimum 6 characters"
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
            className="w-full py-4 rounded-full bg-stone-900 hover:bg-stone-800 text-stone-50 font-semibold text-sm sm:text-base shadow-xs transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            <span>{loading ? "Creating Account..." : "Register Account"}</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          <div className="text-center pt-2">
            <p className="text-sm text-stone-600">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-stone-900 hover:text-amber-800 underline">
                Sign in here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
