"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  Bookmark,
  Settings,
  LogOut,
  PenSquare,
  Menu,
  X,
  ChevronDown,
  ShieldCheck,
  AlertCircle,
  Mail,
  Lock,
  Crown,
  Compass,
  BookOpen,
  LayoutDashboard
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function Navbar() {
  const pathname = usePathname();
  const isDashboardRoute = pathname.startsWith("/profile") || pathname.startsWith("/admin") || pathname.startsWith("/manage");

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
  const [avatarError, setAvatarError] = useState(false);
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

  // If on dashboard, do not render public marketing navbar
  if (isDashboardRoute) {
    return null;
  }

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    try {
      if (authModalMode === "login") {
        const result = await login(authEmail, authPassword);
        if (!result.success) {
          setAuthError(result.error || "Invalid email or password.");
        } else {
          closeAuthModal();
          setAuthEmail("");
          setAuthPassword("");
        }
      } else {
        const result = await register(authFullName, authEmail, authPassword, authPhone, "Dhaka");
        if (!result.success) {
          setAuthError(result.error || "Registration failed.");
        } else {
          closeAuthModal();
          setAuthEmail("");
          setAuthPassword("");
          setAuthFullName("");
          setAuthPhone("");
        }
      }
    } catch {
      setAuthError("An unexpected error occurred. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRoleQuickLogin = async (roleType: "superadmin" | "admin" | "user") => {
    setAuthError(null);
    setAuthLoading(true);

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
      const result = await login(targetEmail, targetPass);
      if (!result.success) {
        setAuthError(result.error || "Authentication failed.");
      } else {
        closeAuthModal();
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

  const isRouteActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href === "/destinations") return pathname.startsWith("/destinations") || pathname.startsWith("/tours");
    if (href === "/tips") return pathname.startsWith("/tips");
    if (href === "/hotels") return pathname.startsWith("/hotels");
    if (href === "/community") return pathname.startsWith("/community") || pathname.startsWith("/write-post");
    if (href === "/about") return pathname.startsWith("/about");
    if (href === "/contact") return pathname.startsWith("/contact");
    return pathname === href;
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-[#EBE6DC] bg-[#FAF8F5]/95 backdrop-blur-md transition-all shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        {/* Full-width container consistent with page content */}
        <div className="w-full max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-14 2xl:px-20">
          <div className="flex h-20 items-center justify-between">
            {/* Text Logo: Traveller's */}
            <Link href="/" className="flex items-center gap-2 shrink-0 group">
              <span className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 group-hover:text-stone-700 transition-colors">
                Traveller&apos;s
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-xs lg:text-xs xl:text-sm font-medium text-stone-600">
              {navLinks.map((item) => {
                const isActive = isRouteActive(item.href);
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`px-3 xl:px-4 py-2 rounded-full transition-all duration-150 border ${
                      isActive
                        ? "text-stone-900 font-semibold bg-[#F5F2EB] border-[#E5DFD5] shadow-2xs"
                        : "border-transparent text-stone-600 hover:text-stone-900 hover:bg-[#F5F2EB]/60 hover:border-[#E5DFD5]/40"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop Action Area */}
            <div className="hidden lg:flex items-center gap-3">
              {!isLoggedIn ? (
                /* Logged Out State: Login | Register */
                <div className="flex items-center gap-2 text-xs xl:text-sm font-semibold">
                  <Link
                    href="/login"
                    className="px-3.5 xl:px-4 py-2 rounded-full text-stone-700 hover:text-stone-900 hover:bg-[#F5F2EB] border border-transparent hover:border-[#E5DFD5] transition-all font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 xl:px-5 py-2.5 rounded-full bg-stone-900 hover:bg-stone-800 text-stone-50 font-semibold transition-all shadow-xs"
                  >
                    Register
                  </Link>
                </div>
              ) : (
                /* Logged In State: Write a Story | Clean Circular Avatar Dropdown */
                <div className="flex items-center gap-3">
                  <Link
                    href="/write-post"
                    className="px-3.5 xl:px-4 py-2 rounded-full bg-stone-900 hover:bg-stone-800 text-stone-50 text-xs xl:text-sm font-semibold flex items-center gap-2 transition-all shadow-xs shrink-0"
                  >
                    <PenSquare className="h-4 w-4" />
                    <span>Write a Story</span>
                  </Link>

                  {/* Clean Circular Avatar Trigger */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      type="button"
                      onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                      className="h-9 w-9 sm:h-10 sm:w-10 rounded-full border border-[#EBE6DC] bg-white overflow-hidden flex items-center justify-center hover:ring-2 hover:ring-stone-400 transition-all cursor-pointer shadow-2xs"
                      aria-label="User Account Menu"
                    >
                      {user?.avatarUrl && !avatarError ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.fullName || "User"}
                          className="h-full w-full object-cover"
                          onError={() => setAvatarError(true)}
                        />
                      ) : (
                        <div className="h-full w-full bg-stone-900 text-stone-50 flex items-center justify-center text-xs sm:text-sm font-bold">
                          {user?.fullName ? user.fullName[0].toUpperCase() : "U"}
                        </div>
                      )}
                    </button>

                    {/* Simple Dropdown: Dashboard & Log Out */}
                    {profileDropdownOpen && (
                      <div className="absolute right-0 mt-2.5 w-56 bg-white border border-[#EBE6DC] rounded-2xl shadow-xl py-1.5 z-50 divide-y divide-[#F0EBE1] text-xs sm:text-sm animate-in fade-in slide-in-from-top-2 duration-150">
                        {/* User Identity Mini-Header */}
                        <div className="px-4 py-2.5">
                          <div className="font-bold text-stone-900 truncate">
                            {user?.fullName || "User"}
                          </div>
                          <div className="text-xs text-stone-500 truncate mt-0.5">
                            {user?.email}
                          </div>
                        </div>

                        {/* Primary Dashboard Link */}
                        <div className="py-1">
                          <Link
                            href="/profile"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-stone-700 hover:bg-[#FAF8F5] hover:text-stone-950 font-medium transition-colors"
                          >
                            <LayoutDashboard className="h-4 w-4 text-stone-500" />
                            <span>Dashboard</span>
                          </Link>
                        </div>

                        {/* Log Out Button */}
                        <div className="py-1">
                          <button
                            type="button"
                            onClick={() => {
                              logout();
                              setProfileDropdownOpen(false);
                            }}
                            className="w-full flex items-center gap-2.5 px-4 py-2 text-rose-600 hover:bg-rose-50 text-left font-medium transition-colors cursor-pointer"
                          >
                            <LogOut className="h-4 w-4 text-rose-500" />
                            <span>Log Out</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-stone-700 hover:bg-stone-100 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#EBE6DC] bg-[#FAF8F5] px-6 py-6 space-y-4 shadow-lg animate-in slide-in-from-top-2">
            <nav className="flex flex-col space-y-2 text-sm font-medium text-stone-700">
              {navLinks.map((item) => {
                const isActive = isRouteActive(item.href);
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-2.5 rounded-xl transition-all border ${
                      isActive
                        ? "bg-[#F5F2EB] text-stone-900 font-semibold border-[#E5DFD5]"
                        : "border-transparent hover:bg-white text-stone-700"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-[#EBE6DC] space-y-3">
              {!isLoggedIn ? (
                <div className="grid grid-cols-2 gap-3 text-sm font-semibold">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 rounded-full border border-[#E5DFD5] bg-white text-stone-800 text-center hover:bg-stone-50 block"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 rounded-full bg-stone-900 text-stone-50 text-center hover:bg-stone-800 block"
                  >
                    Register
                  </Link>
                </div>
              ) : (
                <div className="space-y-2 text-sm">
                  <Link
                    href="/write-post"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 rounded-full bg-stone-900 text-stone-50 font-semibold text-center block hover:bg-stone-800 transition-colors flex items-center justify-center gap-2"
                  >
                    <PenSquare className="h-4 w-4" />
                    <span>Write a Story</span>
                  </Link>
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 rounded-full bg-white border border-[#EBE6DC] text-stone-800 font-semibold text-center block"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2.5 rounded-full bg-rose-50 text-rose-700 font-semibold text-center hover:bg-rose-100 block cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs">
          <div className="bg-white border border-[#EBE6DC] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={closeAuthModal}
              className="absolute top-5 right-5 h-8 w-8 rounded-full bg-stone-100 text-stone-400 hover:text-stone-800 flex items-center justify-center transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="text-center space-y-1 mb-6">
              <span className="font-serif text-2xl font-bold tracking-tight text-stone-900 block">
                Traveller&apos;s
              </span>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
                {authModalMode === "login" ? "Traveler Sign In" : "Join Bangladeshi Explorers"}
              </h3>
              <p className="text-xs sm:text-sm text-stone-500">
                {authModalMode === "login"
                  ? "Sign in to access your saved itineraries, vouchers, and stories."
                  : "Create your free traveler account to share field stories and reviews."}
              </p>
            </div>

            {authError && (
              <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-center gap-2.5">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4 text-xs sm:text-sm">
              {authModalMode === "register" && (
                <>
                  <div className="space-y-1">
                    <label className="block text-stone-700 font-semibold">Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Tanvir Ahmed"
                      value={authFullName}
                      onChange={(e) => setAuthFullName(e.target.value)}
                      className="w-full bg-[#FAF8F5] border border-[#E5DFD5] rounded-2xl px-4 py-3 text-stone-900 focus:outline-none focus:border-stone-900 transition-colors"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-stone-700 font-semibold">Phone Number (bKash / WhatsApp)</label>
                    <input
                      type="tel"
                      placeholder="+880 1711-234567"
                      value={authPhone}
                      onChange={(e) => setAuthPhone(e.target.value)}
                      className="w-full bg-[#FAF8F5] border border-[#E5DFD5] rounded-2xl px-4 py-3 text-stone-900 focus:outline-none focus:border-stone-900 transition-colors"
                    />
                  </div>
                </>
              )}

              <div className="space-y-1">
                <label className="block text-stone-700 font-semibold">Email Address</label>
                <input
                  type="email"
                  placeholder="tanvir@example.com"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#E5DFD5] rounded-2xl px-4 py-3 text-stone-900 focus:outline-none focus:border-stone-900 transition-colors"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-stone-700 font-semibold">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#E5DFD5] rounded-2xl px-4 py-3 text-stone-900 focus:outline-none focus:border-stone-900 transition-colors"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3.5 rounded-full bg-stone-900 hover:bg-stone-800 text-stone-50 font-semibold text-sm shadow-xs transition-all mt-2 disabled:opacity-50"
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
                  className="text-xs sm:text-sm text-stone-600 hover:text-stone-950 font-medium"
                >
                  {authModalMode === "login"
                    ? "New traveler? Create an account here"
                    : "Already registered? Sign in here"}
                </button>
              </div>

              {authModalMode === "login" && (
                <div className="pt-3 border-t border-[#F0EBE1] space-y-2.5">
                  <span className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider text-center">
                    Instant Role Access
                  </span>
                  <div className="flex items-center justify-between gap-2 p-1.5 rounded-2xl bg-[#FAF8F5] border border-[#EBE6DC]">
                    <button
                      type="button"
                      disabled={authLoading}
                      onClick={() => handleRoleQuickLogin("superadmin")}
                      className="flex-1 py-2 px-1.5 rounded-xl bg-white border border-[#EBE6DC] hover:border-stone-400 hover:bg-stone-50 text-xs font-semibold text-stone-900 transition-all disabled:opacity-50 text-center cursor-pointer shadow-2xs"
                    >
                      Super Admin
                    </button>
                    <button
                      type="button"
                      disabled={authLoading}
                      onClick={() => handleRoleQuickLogin("admin")}
                      className="flex-1 py-2 px-1.5 rounded-xl bg-white border border-[#EBE6DC] hover:border-stone-400 hover:bg-stone-50 text-xs font-semibold text-stone-900 transition-all disabled:opacity-50 text-center cursor-pointer shadow-2xs"
                    >
                      Admin
                    </button>
                    <button
                      type="button"
                      disabled={authLoading}
                      onClick={() => handleRoleQuickLogin("user")}
                      className="flex-1 py-2 px-1.5 rounded-xl bg-white border border-[#EBE6DC] hover:border-stone-400 hover:bg-stone-50 text-xs font-semibold text-stone-900 transition-all disabled:opacity-50 text-center cursor-pointer shadow-2xs"
                    >
                      User (Traveler)
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </>
  );
}
