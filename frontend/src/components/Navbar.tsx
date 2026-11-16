"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LogOut,
  PenSquare,
  Menu,
  X,
  AlertCircle,
  LayoutDashboard,
  Search
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { forgotPasswordRequest, resetPasswordRequest } from "@/lib/api";
import { NotificationBell } from "@/components/realtime/NotificationBell";
import GlobalSearchModal from "@/components/GlobalSearchModal";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Navbar() {
  const pathname = usePathname();
  const isDashboardRoute = pathname.startsWith("/profile") || pathname.startsWith("/admin") || pathname.startsWith("/manage");

  const {
    user,
    isLoggedIn,
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

  // Form states for login/register/recovery inside modal
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authFullName, setAuthFullName] = useState("");
  const [authPhone, setAuthPhone] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authInfo, setAuthInfo] = useState<string | null>(null);
  const [recoveryStep, setRecoveryStep] = useState<"none" | "forgot" | "reset">("none");
  const [resetToken, setResetToken] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

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

  // Global Cmd+K / Ctrl+K shortcut for instant cross-catalog search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleCloseModal = () => {
    setRecoveryStep("none");
    setAuthError(null);
    setAuthInfo(null);
    setResetToken("");
    closeAuthModal();
  };

  // If on dashboard, do not render public marketing navbar (keep Cmd+K modal active)
  if (isDashboardRoute) {
    return <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />;
  }

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthInfo(null);
    setAuthLoading(true);

    try {
      if (recoveryStep === "forgot") {
        const res = await forgotPasswordRequest(authEmail);
        setAuthInfo(
          res.resetTokenPreview
            ? `${res.message} Sandbox Reset Code: ${res.resetTokenPreview}`
            : res.message
        );
        if (res.resetTokenPreview) {
          setResetToken(res.resetTokenPreview);
        }
        setRecoveryStep("reset");
      } else if (recoveryStep === "reset") {
        const res = await resetPasswordRequest({
          email: authEmail,
          token: resetToken,
          newPassword: authPassword,
        });
        setAuthInfo(res.message);
        setAuthPassword("");
        setResetToken("");
        setRecoveryStep("none");
        openAuthModal("login");
      } else if (authModalMode === "login") {
        const result = await login(authEmail, authPassword);
        if (!result.success) {
          setAuthError(result.error || "Invalid email or password.");
        } else {
          handleCloseModal();
          setAuthEmail("");
          setAuthPassword("");
        }
      } else {
        const result = await register(authFullName, authEmail, authPassword, authPhone, "Dhaka");
        if (!result.success) {
          setAuthError(result.error || "Registration failed.");
        } else {
          handleCloseModal();
          setAuthEmail("");
          setAuthPassword("");
          setAuthFullName("");
          setAuthPhone("");
        }
      }
    } catch (err: unknown) {
      setAuthError(
        err instanceof Error ? err.message : "An unexpected error occurred. Please try again."
      );
    } finally {
      setAuthLoading(false);
    }
  };

  const isDevEnvironment = process.env.NODE_ENV !== "production";

  const handleRoleQuickLogin = async (roleType: "superadmin" | "admin" | "user") => {
    if (!isDevEnvironment) return;
    setAuthError(null);
    setAuthLoading(true);

    let targetEmail = "";
    let targetPass = "";

    if (roleType === "superadmin") {
      targetEmail = "superadmin@example.com";
      targetPass = "Traveller@2026";
    } else if (roleType === "admin") {
      targetEmail = "admin@example.com";
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
        handleCloseModal();
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
    { label: "Group Planner", href: "/planner" },
    { label: "Travel Tips", href: "/tips" },
    { label: "Hotels", fullLabel: "Hotels Review", href: "/hotels" },
    { label: "Community", fullLabel: "Community / Forum", href: "/community" },
    { label: "About Us", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  const isRouteActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href === "/destinations") return pathname.startsWith("/destinations") || pathname.startsWith("/tours");
    if (href === "/planner") return pathname.startsWith("/planner");
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
        <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-6 xl:px-10 2xl:px-14">
          <div className="flex h-20 items-center justify-between gap-1.5 lg:gap-2 xl:gap-4">
            {/* Text Logo: Traveller's */}
            <Link href="/" className="flex items-center gap-2 shrink-0 group">
              <span className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 group-hover:text-stone-700 transition-colors whitespace-nowrap">
                Traveller&apos;s
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1.5 2xl:gap-2 text-xs xl:text-sm font-medium text-stone-600 shrink-0">
              {navLinks.map((item) => {
                const isActive = isRouteActive(item.href);
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`px-2 xl:px-3 2xl:px-3.5 py-1.5 xl:py-2 rounded-full transition-all duration-150 border whitespace-nowrap shrink-0 ${
                      isActive
                        ? "text-stone-900 font-semibold bg-[#F5F2EB] border-[#E5DFD5] shadow-2xs"
                        : "border-transparent text-stone-600 hover:text-stone-900 hover:bg-[#F5F2EB]/60 hover:border-[#E5DFD5]/40"
                    }`}
                  >
                    {item.fullLabel ? (
                      <>
                        <span className="inline 2xl:hidden">{item.label}</span>
                        <span className="hidden 2xl:inline">{item.fullLabel}</span>
                      </>
                    ) : (
                      item.label
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop Action Area */}
            <div className="hidden lg:flex items-center gap-1.5 xl:gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="inline-flex items-center gap-1.5 xl:gap-2 rounded-full border border-[#E5DFD3] dark:border-[#2a3142] bg-[#FAF8F5] dark:bg-[#12151d] hover:border-stone-400 dark:hover:border-stone-600 p-2 xl:px-3 xl:py-1.5 text-xs font-medium text-stone-600 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
                aria-label="Open global search"
                title="Global Search (Ctrl+K)"
              >
                <Search className="h-3.5 w-3.5 text-stone-500 dark:text-stone-400 shrink-0" />
                <span className="hidden xl:inline-block">Search</span>
                <kbd className="hidden xl:inline-block rounded border border-stone-200 dark:border-[#2a3142] bg-white dark:bg-[#1a202c] px-1.5 py-0.5 text-[10px] font-mono text-stone-500 dark:text-stone-400">
                  Ctrl+K
                </kbd>
              </button>
              <ThemeToggle />
              {!isLoggedIn ? (
                /* Logged Out State: Login | Register */
                <div className="flex items-center gap-1.5 xl:gap-2 text-xs xl:text-sm font-semibold shrink-0">
                  <Link
                    href="/login"
                    className="px-3 xl:px-4 py-1.5 xl:py-2 rounded-full text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-[#F5F2EB] dark:hover:bg-[#1c2230] border border-transparent hover:border-[#E5DFD5] dark:hover:border-[#2a3142] transition-all font-medium whitespace-nowrap"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="px-3.5 xl:px-5 py-2 xl:py-2.5 rounded-full bg-stone-900 dark:bg-emerald-600 hover:bg-stone-800 dark:hover:bg-emerald-500 text-stone-50 font-semibold transition-all shadow-xs whitespace-nowrap"
                  >
                    Register
                  </Link>
                </div>
              ) : (
                /* Logged In State: Write a Story | Live Notifications | Avatar Dropdown */
                <div className="flex items-center gap-2.5">
                  <Link
                    href="/write-post"
                    className="px-3.5 xl:px-4 py-2 rounded-full bg-stone-900 dark:bg-emerald-600 hover:bg-stone-800 dark:hover:bg-emerald-500 text-stone-50 text-xs xl:text-sm font-semibold flex items-center gap-2 transition-all shadow-xs shrink-0"
                  >
                    <PenSquare className="h-4 w-4" />
                    <span>Write a Story</span>
                  </Link>

                  <NotificationBell />

                  {/* Clean Circular Avatar Trigger */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      type="button"
                      onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                      className="h-9 w-9 sm:h-10 sm:w-10 rounded-full border border-[#EBE6DC] dark:border-[#2a3142] bg-white dark:bg-[#141720] overflow-hidden flex items-center justify-center hover:ring-2 hover:ring-stone-400 dark:hover:ring-stone-600 transition-all cursor-pointer shadow-2xs"
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
                      <div className="absolute right-0 mt-2.5 w-56 bg-white dark:bg-[#141720] border border-[#EBE6DC] dark:border-[#222836] rounded-2xl shadow-xl py-1.5 z-50 divide-y divide-[#F0EBE1] dark:divide-[#222836] text-xs sm:text-sm animate-in fade-in slide-in-from-top-2 duration-150">
                        {/* User Identity Mini-Header */}
                        <div className="px-4 py-2.5">
                          <div className="font-bold text-stone-900 dark:text-stone-100 truncate">
                            {user?.fullName || "User"}
                          </div>
                          <div className="text-xs text-stone-500 dark:text-stone-400 truncate mt-0.5">
                            {user?.email}
                          </div>
                        </div>

                        {/* Primary Dashboard Link */}
                        <div className="py-1">
                          <Link
                            href="/profile"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-stone-700 dark:text-stone-200 hover:bg-[#FAF8F5] dark:hover:bg-[#181d28] hover:text-stone-950 dark:hover:text-white font-medium transition-colors"
                          >
                            <LayoutDashboard className="h-4 w-4 text-stone-500 dark:text-stone-400" />
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
                            className="w-full flex items-center gap-2.5 px-4 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-left font-medium transition-colors cursor-pointer"
                          >
                            <LogOut className="h-4 w-4 text-rose-500 dark:text-rose-400" />
                            <span>Log Out</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Bell + Theme + Menu Toggle Button */}
            <div className="flex items-center gap-1.5 lg:hidden">
              <ThemeToggle />
              <NotificationBell />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-stone-700 hover:bg-stone-100 transition-colors"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#EBE6DC] dark:border-[#222836] bg-[#FAF8F5] dark:bg-[#0c0f16] px-6 py-6 space-y-4 shadow-lg animate-in slide-in-from-top-2">
            <nav className="flex flex-col space-y-2 text-sm font-medium text-stone-700 dark:text-stone-300">
              {navLinks.map((item) => {
                const isActive = isRouteActive(item.href);
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-2.5 rounded-xl transition-all border ${
                      isActive
                        ? "bg-[#F5F2EB] dark:bg-[#1a202c] text-stone-900 dark:text-stone-100 font-semibold border-[#E5DFD5] dark:border-[#2a3142]"
                        : "border-transparent hover:bg-white dark:hover:bg-[#141720] text-stone-700 dark:text-stone-300"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-[#EBE6DC] dark:border-[#222836] space-y-3">
              {!isLoggedIn ? (
                <div className="grid grid-cols-2 gap-3 text-sm font-semibold">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 rounded-full border border-[#E5DFD5] dark:border-[#2a3142] bg-white dark:bg-[#141720] text-stone-800 dark:text-stone-200 text-center hover:bg-stone-50 dark:hover:bg-[#1c2232] block"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 rounded-full bg-stone-900 dark:bg-emerald-600 text-stone-50 text-center hover:bg-stone-800 dark:hover:bg-emerald-500 block"
                  >
                    Register
                  </Link>
                </div>
              ) : (
                <div className="space-y-2 text-sm">
                  <Link
                    href="/write-post"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 rounded-full bg-stone-900 dark:bg-emerald-600 text-stone-50 font-semibold text-center block hover:bg-stone-800 dark:hover:bg-emerald-500 transition-colors flex items-center justify-center gap-2"
                  >
                    <PenSquare className="h-4 w-4" />
                    <span>Write a Story</span>
                  </Link>
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 rounded-full bg-white dark:bg-[#141720] border border-[#EBE6DC] dark:border-[#222836] text-stone-800 dark:text-stone-200 font-semibold text-center block"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2.5 rounded-full bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 font-semibold text-center hover:bg-rose-100 dark:hover:bg-rose-950/50 block cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 dark:bg-black/80 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#141720] border border-[#EBE6DC] dark:border-[#222836] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={handleCloseModal}
              className="absolute top-5 right-5 h-8 w-8 rounded-full bg-stone-100 dark:bg-[#1c2230] text-stone-400 dark:text-stone-300 hover:text-stone-800 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="text-center space-y-1 mb-6">
              <span className="font-serif text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100 block">
                Traveller&apos;s
              </span>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">
                {recoveryStep === "forgot"
                  ? "Recover Account Access"
                  : recoveryStep === "reset"
                  ? "Set a New Password"
                  : authModalMode === "login"
                  ? "Traveler Sign In"
                  : "Join Bangladeshi Explorers"}
              </h3>
              <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
                {recoveryStep === "forgot"
                  ? "Enter your account email to generate a 15-minute cryptographic reset token."
                  : recoveryStep === "reset"
                  ? "Enter your reset token and choose a strong password (min 8 chars + number)."
                  : authModalMode === "login"
                  ? "Sign in to access your saved itineraries, vouchers, and stories."
                  : "Create your free traveler account to share field stories and reviews."}
              </p>
            </div>

            {authInfo && (
              <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm break-all">
                {authInfo}
              </div>
            )}

            {authError && (
              <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs sm:text-sm flex items-center gap-2.5">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4 text-xs sm:text-sm">
              {recoveryStep === "none" && authModalMode === "register" && (
                <>
                  <div className="space-y-1">
                    <label className="block text-stone-700 dark:text-stone-300 font-semibold">Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Tanvir Ahmed"
                      value={authFullName}
                      onChange={(e) => setAuthFullName(e.target.value)}
                      className="w-full bg-[#FAF8F5] dark:bg-[#0c0f16] border border-[#E5DFD5] dark:border-[#2a3142] rounded-2xl px-4 py-3 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-stone-900 dark:focus:border-amber-400 transition-colors"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-stone-700 dark:text-stone-300 font-semibold">Phone Number (bKash / WhatsApp)</label>
                    <input
                      type="tel"
                      placeholder="+880 1711-234567"
                      value={authPhone}
                      onChange={(e) => setAuthPhone(e.target.value)}
                      className="w-full bg-[#FAF8F5] dark:bg-[#0c0f16] border border-[#E5DFD5] dark:border-[#2a3142] rounded-2xl px-4 py-3 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-stone-900 dark:focus:border-amber-400 transition-colors"
                    />
                  </div>
                </>
              )}

              <div className="space-y-1">
                <label className="block text-stone-700 dark:text-stone-300 font-semibold">Email Address</label>
                <input
                  type="email"
                  placeholder="tanvir@example.com"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full bg-[#FAF8F5] dark:bg-[#0c0f16] border border-[#E5DFD5] dark:border-[#2a3142] rounded-2xl px-4 py-3 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-stone-900 dark:focus:border-amber-400 transition-colors"
                  required
                />
              </div>

              {recoveryStep === "reset" && (
                <div className="space-y-1">
                  <label className="block text-stone-700 dark:text-stone-300 font-semibold">Reset Token</label>
                  <input
                    type="text"
                    placeholder="Paste your hex reset token"
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    className="w-full font-mono bg-[#FAF8F5] dark:bg-[#0c0f16] border border-[#E5DFD5] dark:border-[#2a3142] rounded-2xl px-4 py-3 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-stone-900 dark:focus:border-amber-400 transition-colors"
                    required
                  />
                </div>
              )}

              {recoveryStep !== "forgot" && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-stone-700 dark:text-stone-300 font-semibold">
                      {recoveryStep === "reset" ? "New Password" : "Password"}
                    </label>
                    {recoveryStep === "none" && authModalMode === "login" && (
                      <button
                        type="button"
                        onClick={() => {
                          setAuthError(null);
                          setAuthInfo(null);
                          setRecoveryStep("forgot");
                        }}
                        className="text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-white underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="w-full bg-[#FAF8F5] dark:bg-[#0c0f16] border border-[#E5DFD5] dark:border-[#2a3142] rounded-2xl px-4 py-3 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-stone-900 dark:focus:border-amber-400 transition-colors"
                    required
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3.5 rounded-full bg-stone-900 dark:bg-emerald-600 hover:bg-stone-800 dark:hover:bg-emerald-500 text-stone-50 font-semibold text-sm shadow-xs transition-all mt-2 disabled:opacity-50 cursor-pointer"
              >
                {authLoading
                  ? "Processing..."
                  : recoveryStep === "forgot"
                  ? "Send Reset Token"
                  : recoveryStep === "reset"
                  ? "Reset Password"
                  : authModalMode === "login"
                  ? "Sign In"
                  : "Create Traveler Account"}
              </button>

              <div className="text-center pt-2 space-x-3">
                {recoveryStep !== "none" ? (
                  <button
                    type="button"
                    onClick={() => {
                      setAuthError(null);
                      setAuthInfo(null);
                      setRecoveryStep("none");
                    }}
                    className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-white font-medium cursor-pointer"
                  >
                    Back to Sign In
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setAuthError(null);
                      setAuthInfo(null);
                      openAuthModal(authModalMode === "login" ? "register" : "login");
                    }}
                    className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-white font-medium cursor-pointer"
                  >
                    {authModalMode === "login"
                      ? "New traveler? Create an account here"
                      : "Already registered? Sign in here"}
                  </button>
                )}
              </div>

              {isDevEnvironment && recoveryStep === "none" && authModalMode === "login" && (
                <div className="pt-3 border-t border-[#F0EBE1] dark:border-[#222836] space-y-2.5">
                  <span className="block text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider text-center">
                    Developer Quick Access
                  </span>
                  <div className="flex items-center justify-between gap-2 p-1.5 rounded-2xl bg-[#FAF8F5] dark:bg-[#0c0f16] border border-[#EBE6DC] dark:border-[#222836]">
                    <button
                      type="button"
                      disabled={authLoading}
                      onClick={() => handleRoleQuickLogin("superadmin")}
                      className="flex-1 py-2 px-1.5 rounded-xl bg-white dark:bg-[#141720] border border-[#EBE6DC] dark:border-[#222836] hover:border-stone-400 dark:hover:border-stone-600 text-xs font-semibold text-stone-900 dark:text-stone-100 transition-all disabled:opacity-50 text-center cursor-pointer shadow-2xs"
                    >
                      Super Admin
                    </button>
                    <button
                      type="button"
                      disabled={authLoading}
                      onClick={() => handleRoleQuickLogin("admin")}
                      className="flex-1 py-2 px-1.5 rounded-xl bg-white dark:bg-[#141720] border border-[#EBE6DC] dark:border-[#222836] hover:border-stone-400 dark:hover:border-stone-600 text-xs font-semibold text-stone-900 dark:text-stone-100 transition-all disabled:opacity-50 text-center cursor-pointer shadow-2xs"
                    >
                      Admin
                    </button>
                    <button
                      type="button"
                      disabled={authLoading}
                      onClick={() => handleRoleQuickLogin("user")}
                      className="flex-1 py-2 px-1.5 rounded-xl bg-white dark:bg-[#141720] border border-[#EBE6DC] dark:border-[#222836] hover:border-stone-400 dark:hover:border-stone-600 text-xs font-semibold text-stone-900 dark:text-stone-100 transition-all disabled:opacity-50 text-center cursor-pointer shadow-2xs"
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

      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
