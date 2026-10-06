"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  User,
  Bookmark,
  Settings,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Calendar,
  Compass,
  ArrowRight,
  Heart,
  Save,
  CheckCircle2,
  Trash2,
  ExternalLink,
  Bell,
  Lock,
  Smartphone,
  AlertCircle
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

function ProfileContent() {
  const { user, isLoggedIn, updateProfile, openAuthModal } = useAuth();
  const searchParams = useSearchParams();
  const queryTab = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState<"profile" | "saved" | "settings">(
    queryTab === "saved" || queryTab === "bookmarks"
      ? "saved"
      : queryTab === "settings"
      ? "settings"
      : "profile"
  );

  useEffect(() => {
    if (queryTab === "saved" || queryTab === "bookmarks") {
      setActiveTab("saved");
    } else if (queryTab === "settings") {
      setActiveTab("settings");
    } else if (queryTab === "profile") {
      setActiveTab("profile");
    }
  }, [queryTab]);

  // Form State for Profile
  const [fullName, setFullName] = useState(user?.fullName || "Tanvir Ahmed");
  const [email, setEmail] = useState(user?.email || "tanvir@tourflow.com.bd");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "+880 1711-234567");
  const [homeCity, setHomeCity] = useState(user?.homeCity || "Dhaka");
  const [nidNumber, setNidNumber] = useState(user?.nidOrPassport || "19952692810003412");
  const [bio, setBio] = useState(
    user?.bio ||
      "Frequent domestic traveler exploring the Chittagong Hill Tracts, Tanguar Haor wetlands, and coastal trails. Passionate about leave-no-trace ecotourism."
  );
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Sync state when user updates
  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setEmail(user.email);
      if (user.phoneNumber) setPhoneNumber(user.phoneNumber);
      if (user.homeCity) setHomeCity(user.homeCity);
      if (user.nidOrPassport) setNidNumber(user.nidOrPassport);
      if (user.bio) setBio(user.bio);
    }
  }, [user]);

  // Settings State
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);
  const [newsletter, setNewsletter] = useState(false);

  // Saved Bookmarks
  const [savedItems, setSavedItems] = useState([
    {
      id: "1",
      title: "Sajek Valley: Kingdom of Clouds & Hill Tracts",
      category: "Tour Package",
      location: "Rangamati / Baghaichhari",
      price: "৳7,500",
      slug: "sajek-valley-clouds-hill-tracts",
      image: "https://images.unsplash.com/photo-1628085971946-b673e4492bf9?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "2",
      title: "Tanguar Haor & Shimul Bagan: Premium Houseboat Bajra",
      category: "Tour Package",
      location: "Tahirpur, Sunamganj",
      price: "৳8,900",
      slug: "tanguar-haor-premium-houseboat",
      image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "3",
      title: "Army Escort Schedule & Timings at Dighinala for Sajek",
      category: "Travel Tip",
      location: "Khagrachhari – Sajek Route",
      price: "Travel Guidance",
      slug: "tips",
      image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "4",
      title: "Sayeman Beach Resort (Marine Drive, Cox's Bazar)",
      category: "Hotel Review",
      location: "Kolatoli / Marine Drive",
      price: "Reviewed (4.8/5)",
      slug: "hotels",
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80"
    }
  ]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    const res = await updateProfile({
      fullName,
      phoneNumber,
      homeCity,
      nidOrPassport: nidNumber,
      bio,
    });

    if (res.success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } else {
      setSaveError(res.error || "Failed to update profile.");
    }
  };

  const removeItem = (id: string) => {
    setSavedItems((prev) => prev.filter((item) => item.id !== id));
  };

  if (!isLoggedIn) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-6">
        <div className="h-16 w-16 mx-auto rounded-3xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center">
          <Lock className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white tracking-tight">Traveler Profile Access</h1>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Please sign in to view your profile, manage bookmarked tours, and review your verified travel details.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => openAuthModal("login")}
            className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-lg transition-all"
          >
            Sign In Now
          </button>
          <Link
            href="/register"
            className="px-6 py-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 text-xs font-semibold transition-all"
          >
            Register Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1536px] mx-auto px-4 sm:px-8 lg:px-12 2xl:px-16 py-12 space-y-8">
      {/* Traveler Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-teal-950/40 via-[#080d1d] to-sky-950/40 border border-white/[0.08] p-6 sm:p-10 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-tr from-teal-500 via-sky-500 to-indigo-600 flex items-center justify-center text-3xl font-extrabold text-white shadow-xl shadow-teal-500/20">
              {fullName ? fullName[0].toUpperCase() : "T"}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-white">{fullName}</h1>
                <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  NID Verified Traveler
                </span>
                {user?.role === "Admin" && (
                  <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    TourFlow Operator
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 mt-1.5 flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-sky-400" />
                  {homeCity}, Bangladesh
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5 text-teal-400" />
                  {email}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="px-3.5 py-2 rounded-xl bg-black/40 border border-white/[0.08] text-slate-300">
              Trips Logged: <strong className="text-white">4</strong>
            </span>
            <span className="px-3.5 py-2 rounded-xl bg-black/40 border border-white/[0.08] text-slate-300">
              Bookmarks: <strong className="text-white">{savedItems.length}</strong>
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-8 pt-6 border-t border-white/[0.08] text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
              activeTab === "profile"
                ? "bg-teal-600 text-white shadow-md shadow-teal-600/20"
                : "bg-white/[0.04] text-slate-300 hover:text-white hover:bg-white/[0.08]"
            }`}
          >
            <User className="h-4 w-4" />
            <span>My Profile</span>
          </button>

          <button
            onClick={() => setActiveTab("saved")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
              activeTab === "saved"
                ? "bg-teal-600 text-white shadow-md shadow-teal-600/20"
                : "bg-white/[0.04] text-slate-300 hover:text-white hover:bg-white/[0.08]"
            }`}
          >
            <Bookmark className="h-4 w-4" />
            <span>Bookmarks / Saved ({savedItems.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
              activeTab === "settings"
                ? "bg-teal-600 text-white shadow-md shadow-teal-600/20"
                : "bg-white/[0.04] text-slate-300 hover:text-white hover:bg-white/[0.08]"
            }`}
          >
            <Settings className="h-4 w-4" />
            <span>Account Settings</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Profile Details & Past Trips */}
      {activeTab === "profile" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Form (8 cols) */}
          <div className="lg:col-span-8 bg-[#080d1d] border border-white/[0.08] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div>
              <h2 className="text-xl font-bold text-white">Traveler Details &amp; Verification</h2>
              <p className="text-xs text-slate-400 mt-1">
                Keep your domestic emergency and checkpost credentials updated for smooth clearance.
              </p>
            </div>

            {saveSuccess && (
              <div className="p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>Profile successfully updated in database!</span>
              </div>
            )}

            {saveError && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{saveError}</span>
              </div>
            )}

            <form onSubmit={handleProfileSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 mb-1.5 font-medium">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-black/40 border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1.5 font-medium">Email Address (Read-only)</label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full bg-black/20 border border-white/[0.06] rounded-xl px-3.5 py-2.5 text-slate-400 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 mb-1.5 font-medium">Phone Number (bKash / WhatsApp)</label>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full bg-black/40 border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1.5 font-medium">Home City / Division</label>
                  <select
                    value={homeCity}
                    onChange={(e) => setHomeCity(e.target.value)}
                    className="w-full bg-black/40 border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
                  >
                    <option value="Dhaka">Dhaka</option>
                    <option value="Chittagong">Chittagong</option>
                    <option value="Sylhet">Sylhet</option>
                    <option value="Khulna">Khulna</option>
                    <option value="Rajshahi">Rajshahi</option>
                    <option value="Barisal">Barisal</option>
                    <option value="Rangpur">Rangpur</option>
                    <option value="Mymensingh">Mymensingh</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1.5 font-medium">National Identity (NID / Smart Card Number)</label>
                <input
                  type="text"
                  value={nidNumber}
                  onChange={(e) => setNidNumber(e.target.value)}
                  className="w-full bg-black/40 border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Required for official Army checkposts in Dighinala, Sajek, Ruma, and Sundarbans forest entry passes.
                </p>
              </div>

              <div>
                <label className="block text-slate-300 mb-1.5 font-medium">Travel Bio &amp; Interests</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-black/40 border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-teal-500 leading-relaxed"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-sky-600 hover:from-teal-400 hover:to-sky-500 text-white font-bold transition-all shadow-md shadow-teal-500/20"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Profile</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: History & Verifications (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#080d1d] border border-white/[0.08] rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Compass className="h-4 w-4 text-sky-400" />
                <span>Past Expeditions</span>
              </h3>
              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/[0.06] space-y-1">
                  <div className="flex justify-between items-center">
                    <strong className="text-white">Bandarban Trails &amp; Nafakhum</strong>
                    <span className="text-[10px] text-emerald-400">Completed</span>
                  </div>
                  <div className="text-[11px] text-slate-400">December 2025 • 3 Days</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/[0.06] space-y-1">
                  <div className="flex justify-between items-center">
                    <strong className="text-white">Sreemangal Tea Estates Walk</strong>
                    <span className="text-[10px] text-emerald-400">Completed</span>
                  </div>
                  <div className="text-[11px] text-slate-400">October 2025 • 2 Days</div>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/manage"
                  className="w-full py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <span>Retrieve Any Voucher Code</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            <div className="bg-[#080d1d] border border-white/[0.08] rounded-3xl p-6 sm:p-8 space-y-3 text-xs text-slate-300 shadow-xl">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-teal-400" />
                <span>Security Assurance</span>
              </h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Your NID details are strictly protected and only shared with verified licensed tour operators when Army checkpost clearances are required.
              </p>
              <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] text-[11px] text-slate-300">
                Tourist Police Helpline: <strong className="text-teal-400 font-mono">999 / +880 1320-222222</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Bookmarks / Saved */}
      {activeTab === "saved" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
            <div>
              <h2 className="text-xl font-bold text-white">Bookmarks &amp; Saved Itineraries</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Packages, travel guides, and hotel reviews you&apos;ve saved for future trips.
              </p>
            </div>
            <span className="text-xs text-slate-400">{savedItems.length} items saved</span>
          </div>

          {savedItems.length === 0 ? (
            <div className="py-20 text-center bg-[#080d1d] border border-white/[0.08] rounded-3xl p-8 space-y-3">
              <Bookmark className="h-8 w-8 text-slate-600 mx-auto" />
              <p className="text-sm text-slate-400">You haven&apos;t bookmarked any tours or tips yet.</p>
              <Link
                href="/destinations"
                className="inline-block px-5 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-bold"
              >
                Explore Bangladesh Destinations
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {savedItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#080d1d] border border-white/[0.08] rounded-3xl overflow-hidden flex flex-col sm:flex-row p-5 gap-4 items-start sm:items-center justify-between hover:border-teal-500/30 transition-all shadow-xl"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-20 w-24 rounded-2xl object-cover bg-slate-900 shrink-0"
                    />
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400">
                        {item.category}
                      </span>
                      <h3 className="text-sm font-bold text-white line-clamp-1">{item.title}</h3>
                      <div className="text-xs text-slate-400 flex items-center gap-1.5">
                        <MapPin className="h-3 w-3 text-sky-400" />
                        <span>{item.location}</span>
                      </div>
                      <div className="text-xs font-bold text-white">{item.price}</div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center gap-2 self-end sm:self-center shrink-0">
                    <Link
                      href={item.slug.startsWith("tips") ? "/tips" : item.slug.startsWith("hotels") ? "/hotels" : `/tours/${item.slug}`}
                      className="px-3.5 py-1.5 rounded-xl bg-teal-600/90 hover:bg-teal-500 text-white text-xs font-semibold flex items-center gap-1"
                    >
                      <span>View</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1.5 rounded-xl bg-black/40 border border-white/[0.08] text-slate-500 hover:text-rose-400 transition-colors"
                      title="Remove bookmark"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Account Settings */}
      {activeTab === "settings" && (
        <div className="max-w-3xl bg-[#080d1d] border border-white/[0.08] rounded-3xl p-6 sm:p-10 space-y-8 shadow-xl">
          <div>
            <h2 className="text-xl font-bold text-white">Account &amp; Notification Settings</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Customize how you receive travel alerts, weather warnings, and security updates.
            </p>
          </div>

          {/* Travel Alerts */}
          <div className="space-y-4 text-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span>Real-time Travel &amp; Weather Alerts</span>
            </h3>

            <div className="space-y-3 bg-black/40 p-4 rounded-2xl border border-white/[0.06]">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <div className="text-slate-200 font-semibold">SMS Road &amp; Escort Alerts</div>
                  <div className="text-[11px] text-slate-400">Get SMS updates on Sajek/Bandarban Army escort times or blockages.</div>
                </div>
                <input
                  type="checkbox"
                  checked={smsAlerts}
                  onChange={(e) => setSmsAlerts(e.target.checked)}
                  className="h-4 w-4 rounded accent-teal-600 cursor-pointer"
                />
              </label>

              <div className="border-t border-white/[0.06] pt-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <div className="text-slate-200 font-semibold">WhatsApp Weather &amp; Flash Flood Advisories</div>
                    <div className="text-[11px] text-slate-400">Receive flash flood warnings for Sunamganj haors and monsoon sea conditions.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={whatsappAlerts}
                    onChange={(e) => setWhatsappAlerts(e.target.checked)}
                    className="h-4 w-4 rounded accent-teal-600 cursor-pointer"
                  />
                </label>
              </div>

              <div className="border-t border-white/[0.06] pt-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <div className="text-slate-200 font-semibold">Community Forum Digest</div>
                    <div className="text-[11px] text-slate-400">Weekly digest of top travel tips and new homestay discoveries.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={newsletter}
                    onChange={(e) => setNewsletter(e.target.checked)}
                    className="h-4 w-4 rounded accent-teal-600 cursor-pointer"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Currency & Region */}
          <div className="space-y-3 text-xs border-t border-white/[0.08] pt-6">
            <div className="flex justify-between items-center text-slate-300">
              <div>
                <strong className="text-white">Display Currency:</strong> Bangladeshi Taka (৳ BDT)
              </div>
              <span className="text-[11px] text-teal-400 font-semibold">Active Default</span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <div>
                <strong className="text-white">Region:</strong> Bangladesh (+880)
              </div>
              <span className="text-[11px] text-teal-400 font-semibold">Verified</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="py-24 text-center text-slate-500 text-sm">Loading profile...</div>}>
      <ProfileContent />
    </Suspense>
  );
}
