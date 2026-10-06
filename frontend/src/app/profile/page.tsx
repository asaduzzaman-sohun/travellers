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
  Smartphone
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

function ProfileContent() {
  const { user, isLoggedIn, login } = useAuth();
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
  const [name, setName] = useState(user?.name || "Tanvir Ahmed");
  const [email, setEmail] = useState(user?.email || "tanvir.ahmed@example.com");
  const [phone, setPhone] = useState("+880 1711-234567");
  const [homeCity, setHomeCity] = useState("Dhaka");
  const [nidNumber, setNidNumber] = useState("19952692810003412");
  const [emergencyContact, setEmergencyContact] = useState("Rahim Ahmed (+880 1819-998877)");
  const [bio, setBio] = useState(
    "Frequent domestic traveler exploring the Chittagong Hill Tracts, Tanguar Haor wetlands, and coastal trails. Passionate about leave-no-trace ecotourism."
  );
  const [saveSuccess, setSaveSuccess] = useState(false);

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
      slug: "sajek-valley-cloud-expedition",
      image: "https://images.unsplash.com/photo-1628172906059-839088ff7b6c?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "2",
      title: "Tanguar Haor & Shimul Bagan: Premium Houseboat Bajra",
      category: "Tour Package",
      location: "Tahirpur, Sunamganj",
      price: "৳8,900",
      slug: "tanguar-haor-houseboat-expedition",
      image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80"
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

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    login(name, email);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const removeItem = (id: string) => {
    setSavedItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Traveler Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-indigo-950 via-slate-900 to-teal-950 border border-slate-800 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-tr from-teal-500 to-sky-500 flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-teal-500/20">
              {name ? name[0] : "T"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white">{name}</h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal-500/10 text-teal-300 border border-teal-500/20">
                  <ShieldCheck className="h-3 w-3" />
                  NID Verified Traveler
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-sky-400" />
                  {homeCity}, Bangladesh
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5 text-indigo-400" />
                  {email}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-slate-300">
              Trips Completed: <strong className="text-white">4</strong>
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-slate-300">
              Bookmarks: <strong className="text-white">{savedItems.length}</strong>
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-8 pt-6 border-t border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
              activeTab === "profile"
                ? "bg-teal-600 text-white shadow-sm"
                : "bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <User className="h-4 w-4" />
            <span>My Profile</span>
          </button>

          <button
            onClick={() => setActiveTab("saved")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
              activeTab === "saved"
                ? "bg-teal-600 text-white shadow-sm"
                : "bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <Bookmark className="h-4 w-4" />
            <span>Bookmarks / Saved ({savedItems.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
              activeTab === "settings"
                ? "bg-teal-600 text-white shadow-sm"
                : "bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <Settings className="h-4 w-4" />
            <span>Account Settings</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Profile Details & Past Trips */}
      {activeTab === "profile" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Editable Information */}
          <div className="lg:col-span-2 bg-[#090f1d] border border-slate-800/80 rounded-3xl p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white">Traveler Details</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Keep your domestic travel and emergency info up to date for checkpost clearance.
              </p>
            </div>

            {saveSuccess && (
              <div className="p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>Profile successfully updated!</span>
              </div>
            )}

            <form onSubmit={handleProfileSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Full Legal Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Phone Number (WhatsApp)</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Home City / Division</label>
                  <select
                    value={homeCity}
                    onChange={(e) => setHomeCity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">NID or Smart Card Number</label>
                  <input
                    type="text"
                    value={nidNumber}
                    onChange={(e) => setNidNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Needed for Sajek & Sundarbans tourist entries.</p>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Emergency Contact</label>
                  <input
                    type="text"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Name & phone of kin or guardian.</p>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Travel Bio & Interests</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold transition-all shadow-md"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Travel History & Checklist */}
          <div className="space-y-6">
            <div className="bg-[#090f1d] border border-slate-800/80 rounded-3xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Compass className="h-4 w-4 text-sky-400" />
                <span>Past Expeditions</span>
              </h3>
              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
                  <div className="flex justify-between items-center">
                    <strong className="text-white">Bandarban Trails & Nafakhum</strong>
                    <span className="text-[10px] text-emerald-400">Completed</span>
                  </div>
                  <div className="text-[11px] text-slate-400">December 2025 • 3 Days</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
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
                  className="w-full py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <span>Lookup Any Booking Voucher</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            <div className="bg-[#090f1d] border border-slate-800/80 rounded-3xl p-6 space-y-3 text-xs">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-teal-400" />
                <span>Traveler Verification</span>
              </h4>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Your NID details are safely encrypted and only shared with verified licensed tour operators when Army checkpost clearances are required.
              </p>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-300">
                Tourist Police Helpline: <strong className="text-teal-400">999 / +880 1320-222222</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Bookmarks / Saved */}
      {activeTab === "saved" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Bookmarks & Saved Itineraries</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Packages, travel guides, and hotel reviews you've saved for future trips.
              </p>
            </div>
            <span className="text-xs text-slate-400">{savedItems.length} items saved</span>
          </div>

          {savedItems.length === 0 ? (
            <div className="py-20 text-center bg-[#090f1d] border border-slate-800/80 rounded-3xl p-8 space-y-3">
              <Bookmark className="h-8 w-8 text-slate-600 mx-auto" />
              <p className="text-sm text-slate-400">You haven't bookmarked any tours or tips yet.</p>
              <Link
                href="/destinations"
                className="inline-block px-5 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-bold"
              >
                Explore Bangladesh Destinations
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
              {savedItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#090f1d] border border-slate-800/80 rounded-3xl overflow-hidden flex flex-col sm:flex-row p-4 gap-4 items-start sm:items-center justify-between hover:border-slate-700 transition-colors"
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
                      className="p-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-500 hover:text-rose-400 transition-colors"
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
        <div className="max-w-3xl bg-[#090f1d] border border-slate-800/80 rounded-3xl p-6 sm:p-8 space-y-8">
          <div>
            <h2 className="text-lg font-bold text-white">Account & Notification Settings</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Customize how you receive travel alerts, weather warnings, and security updates.
            </p>
          </div>

          {/* Travel Alerts */}
          <div className="space-y-4 text-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span>Real-time Travel & Weather Alerts</span>
            </h3>

            <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800/80">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <div className="text-slate-200 font-semibold">SMS Road & Escort Alerts</div>
                  <div className="text-[11px] text-slate-400">Get SMS updates on Sajek/Bandarban Army escort times or blockages.</div>
                </div>
                <input
                  type="checkbox"
                  checked={smsAlerts}
                  onChange={(e) => setSmsAlerts(e.target.checked)}
                  className="h-4 w-4 rounded accent-teal-600 cursor-pointer"
                />
              </label>

              <div className="border-t border-slate-800/60 pt-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <div className="text-slate-200 font-semibold">WhatsApp Weather & Flash Flood Advisories</div>
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

              <div className="border-t border-slate-800/60 pt-3">
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

          {/* Security & Password */}
          <div className="space-y-4 text-xs border-t border-slate-800 pt-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-2">
              <Lock className="h-4 w-4" />
              <span>Security & Password</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">New Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Confirm Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => alert("Password settings updated.")}
                className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 hover:text-white font-semibold"
              >
                Update Password
              </button>
            </div>
          </div>

          {/* Currency & Region */}
          <div className="space-y-3 text-xs border-t border-slate-800 pt-6">
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
    <Suspense fallback={<div className="py-24 text-center text-slate-500">Loading profile...</div>}>
      <ProfileContent />
    </Suspense>
  );
}
