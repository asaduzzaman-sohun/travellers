"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Compass,
  User,
  Bookmark,
  Settings,
  LogOut,
  PenSquare,
  Menu,
  X,
  ChevronDown,
  ShieldCheck,
  MapPin,
  Lock,
  Mail,
  AlertCircle
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    user,
    isLoggedIn,
    isAdmin,
    login,
    register,
    logout,
    authModalOpen,
    openAuthModal,
    closeAuthModal,
    authModalMode,
  } = useAuth();

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Form states for login/register inside modal
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authFullName, setAuthFullName] = useState("");
  const [authPhone, setAuthPhone] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    try {
      if (authModalMode === "login") {
        const result = await login(authEmail, authPassword);
        if (!result.success) {
          setAuthError(result.error || "Login failed");
        } else {
          closeAuthModal();
          setAuthEmail("");
          setAuthPassword("");
        }
      } else {
        const result = await register(authFullName, authEmail, authPassword, authPhone, "Dhaka");
        if (!result.success) {
          setAuthError(result.error || "Registration failed");
        } else {
          closeAuthModal();
          setAuthEmail("");
          setAuthPassword("");
          setAuthFullName("");
          setAuthPhone("");
        }
      }
    } catch {
      setAuthError("An unexpected error occurred.");
    } finally {
      setAuthLoading(false);
    }
  };

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Destinations", href: "/destinations" },
    { label: "Travel Tips", href: "/tips" },
    { label: "Hotels Review", href: "/hotels" },
    { label: "Community / Forum", href: "/community" },
    { label: "About Us", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#050814]/90 backdrop-blur-xl transition-all">
        {/* Full-width container */}
        <div className="w-full px-4 sm:px-8 lg:px-12 2xl:px-16">
          <div className="flex h-18 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 shrink-0 group">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-teal-500 via-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform duration-300">
                <Compass className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                  TourFlow <span className="text-teal-400 font-extrabold text-sm tracking-wider uppercase">BD</span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium tracking-wide">
                  Explore Serene Bangladesh
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden xl:flex items-center gap-1 2xl:gap-2 text-[13px] font-medium text-slate-300">
              {navLinks.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`px-3 py-1.5 rounded-xl transition-colors duration-200 ${
                      isActive
                        ? "text-teal-300 bg-white/[0.06] font-semibold"
                        : "hover:text-white hover:bg-white/[0.03]"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop Action Area */}
            <div className="hidden xl:flex items-center gap-3">
              {!isLoggedIn ? (
                /* Logged Out State: Login | Register */
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <button
                    onClick={() => openAuthModal("login")}
                    className="px-4 py-2 rounded-xl text-slate-200 hover:text-white hover:bg-white/[0.05] transition-all"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => openAuthModal("register")}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-sky-600 hover:from-teal-400 hover:to-sky-500 text-white font-bold transition-all shadow-md shadow-teal-500/15"
                  >
                    Register
                  </button>
                </div>
              ) : (
                /* Logged In State: + Write a Post | Profile Dropdown */
                <div className="flex items-center gap-3">
                  <Link
                    href="/write-post"
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-500 hover:to-teal-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-sky-600/15"
                  >
                    <PenSquare className="h-3.5 w-3.5" />
                    <span>+ Write a Post</span>
                  </Link>

                  {/* Profile Dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                      className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white transition-colors"
                    >
                      <div className="h-7 w-7 rounded-xl bg-gradient-to-tr from-teal-500 to-indigo-500 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                        {user?.fullName ? user.fullName[0].toUpperCase() : "U"}
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-xs font-semibold max-w-[120px] truncate leading-tight">
                          {user?.fullName || "Traveler"}
                        </span>
                        <span className="text-[10px] text-teal-400 font-medium leading-none">
                          {user?.role === "Admin" ? "Operator" : "Traveler"}
                        </span>
                      </div>
                      <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                    </button>

                    {profileDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-52 bg-[#0a0f1d] border border-white/[0.1] rounded-2xl shadow-2xl py-2 z-50 divide-y divide-white/[0.06] text-xs">
                        <div className="px-4 py-2">
                          <div className="font-bold text-white truncate">{user?.fullName}</div>
                          <div className="text-[11px] text-slate-400 truncate">{user?.email}</div>
                        </div>

                        <div className="py-1">
                          <Link
                            href="/profile"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-slate-300 hover:bg-white/[0.05] hover:text-white"
                          >
                            <User className="h-3.5 w-3.5 text-sky-400" />
                            <span>My Profile</span>
                          </Link>

                          <Link
                            href="/profile?tab=saved"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-slate-300 hover:bg-white/[0.05] hover:text-white"
                          >
                            <Bookmark className="h-3.5 w-3.5 text-teal-400" />
                            <span>Bookmarks / Saved</span>
                          </Link>

                          <Link
                            href="/profile?tab=settings"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-slate-300 hover:bg-white/[0.05] hover:text-white"
                          >
                            <Settings className="h-3.5 w-3.5 text-indigo-400" />
                            <span>Account Settings</span>
                          </Link>

                          {isAdmin && (
                            <Link
                              href="/admin"
                              onClick={() => setProfileDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-amber-300 hover:bg-white/[0.05] font-semibold"
                            >
                              <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
                              <span>Operator Dashboard</span>
                            </Link>
                          )}
                        </div>

                        <div className="py-1">
                          <button
                            onClick={() => {
                              logout();
                              setProfileDropdownOpen(false);
                            }}
                            className="w-full flex items-center gap-2.5 px-4 py-2 text-rose-400 hover:bg-rose-500/10 transition-colors text-left font-medium"
                          >
                            <LogOut className="h-3.5 w-3.5" />
                            <span>Log Out</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <div className="flex items-center gap-2 xl:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-300 hover:text-white"
                aria-label="Toggle Navigation"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Flyout Menu */}
        {mobileMenuOpen && (
          <div className="xl:hidden bg-[#070b16] border-b border-white/[0.08] px-6 py-5 space-y-4">
            <nav className="flex flex-col space-y-2 text-sm font-medium text-slate-300">
              {navLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-1.5 hover:text-teal-400"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="pt-4 border-t border-white/[0.08] flex flex-col gap-2.5 text-xs">
              {!isLoggedIn ? (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      openAuthModal("login");
                      setMobileMenuOpen(false);
                    }}
                    className="py-2.5 text-center rounded-xl bg-white/[0.06] text-white font-semibold"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      openAuthModal("register");
                      setMobileMenuOpen(false);
                    }}
                    className="py-2.5 text-center rounded-xl bg-teal-600 text-white font-semibold"
                  >
                    Register
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    href="/write-post"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 rounded-xl bg-sky-600 text-white font-bold text-center block"
                  >
                    + Write a Post
                  </Link>
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2 rounded-xl bg-white/[0.05] text-slate-200 font-medium text-center block"
                  >
                    My Profile ({user?.fullName})
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2 rounded-xl bg-rose-500/10 text-rose-400 font-semibold text-center"
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Global Authentication Modal */}
      {authModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0b1222] border border-white/[0.1] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={closeAuthModal}
              className="absolute top-5 right-5 h-8 w-8 rounded-full bg-white/[0.05] text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="text-center space-y-1 mb-6">
              <h3 className="text-2xl font-bold text-white tracking-tight">
                {authModalMode === "login" ? "Welcome Back" : "Join Bangladeshi Explorers"}
              </h3>
              <p className="text-xs text-slate-400">
                {authModalMode === "login"
                  ? "Sign in to save tour bookmarks, view vouchers, and post in community."
                  : "Create your free traveler account to share local insights and reviews."}
              </p>
            </div>

            {authError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-3.5 text-xs">
              {authModalMode === "register" && (
                <>
                  <div>
                    <label className="block text-slate-300 mb-1 font-medium">Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Tanvir Ahmed"
                      value={authFullName}
                      onChange={(e) => setAuthFullName(e.target.value)}
                      className="w-full bg-black/40 border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1 font-medium">Phone Number (bKash / WhatsApp)</label>
                    <input
                      type="tel"
                      placeholder="+880 1711-234567"
                      value={authPhone}
                      onChange={(e) => setAuthPhone(e.target.value)}
                      className="w-full bg-black/40 border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Email Address</label>
                <input
                  type="email"
                  placeholder="tanvir@example.com"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full bg-black/40 border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full bg-black/40 border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-sky-600 hover:from-teal-400 hover:to-sky-500 text-white font-bold text-xs shadow-lg shadow-teal-500/20 transition-all mt-2 disabled:opacity-50"
              >
                {authLoading
                  ? "Processing..."
                  : authModalMode === "login"
                  ? "Sign In"
                  : "Create Traveler Account"}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setAuthError(null);
                    openAuthModal(authModalMode === "login" ? "register" : "login");
                  }}
                  className="text-[11px] text-teal-400 hover:underline"
                >
                  {authModalMode === "login"
                    ? "New traveler? Create an account here"
                    : "Already registered? Sign in here"}
                </button>
              </div>

              {authModalMode === "login" && (
                <div className="pt-2 text-[11px] text-slate-500 border-t border-white/[0.06] text-center">
                  Quick demo: <code className="text-slate-300">tanvir@tourflow.com.bd</code> / <code className="text-slate-300">Tanvir@123456</code>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </>
  );
}
