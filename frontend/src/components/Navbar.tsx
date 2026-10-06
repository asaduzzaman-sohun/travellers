"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
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
  CheckCircle2
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const { isLoggedIn, user, login, logout, toggleAuthState } = useAuth();

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModal, setAuthModal] = useState<"login" | "register" | null>(null);
  const [writePostModalOpen, setWritePostModalOpen] = useState(false);

  // Form states for login/register modal
  const [loginEmail, setLoginEmail] = useState("");
  const [loginName, setLoginName] = useState("");
  const [postTitle, setPostTitle] = useState("");
  const [postCategory, setPostCategory] = useState("Travel Tips");
  const [postContent, setPostContent] = useState("");
  const [postSuccess, setPostSuccess] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Destinations", href: "/destinations" },
    { label: "Travel Tips", href: "/tips" },
    { label: "Hotels Review", href: "/hotels" },
    { label: "Community / Forum", href: "/community" },
    { label: "About Us", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(loginName || "Tanvir Ahmed", loginEmail || "tanvir@example.com");
    setAuthModal(null);
  };

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPostSuccess(true);
    setTimeout(() => {
      setPostSuccess(false);
      setWritePostModalOpen(false);
      setPostTitle("");
      setPostContent("");
    }, 1500);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-[#080d1a]/95 backdrop-blur-md border-b border-slate-800/80 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-teal-600 via-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-teal-500/10">
                <Compass className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-extrabold tracking-tight text-white flex items-center gap-1.5">
                  TourFlow
                  <span className="text-[10px] font-bold text-teal-400 bg-teal-500/10 border border-teal-500/20 px-1.5 py-0.2 rounded">
                    BD
                  </span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Explore Bangladesh</span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden xl:flex items-center gap-6 text-[13px] font-medium text-slate-300">
              {navLinks.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`transition-colors py-1 ${
                      isActive
                        ? "text-teal-400 font-semibold border-b-2 border-teal-400"
                        : "hover:text-white hover:text-sky-300"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right Side: Auth / Profile Controls */}
            <div className="hidden sm:flex items-center gap-3">
              {/* Quick Preview Toggle (Demo helper) */}
              <button
                onClick={toggleAuthState}
                title="Click to toggle between Logged In and Logged Out navbar state"
                className="text-[11px] px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700/80 text-slate-400 hover:text-teal-300 hover:border-teal-500/50 transition-all"
              >
                State: <span className={isLoggedIn ? "text-teal-400 font-bold" : "text-slate-300"}>{isLoggedIn ? "Logged In" : "Logged Out"}</span>
              </button>

              {!isLoggedIn ? (
                /* Logged Out State Actions */
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <button
                    onClick={() => setAuthModal("login")}
                    className="px-3.5 py-1.5 text-slate-300 hover:text-white transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => setAuthModal("register")}
                    className="px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white shadow-sm transition-all"
                  >
                    Register
                  </button>
                </div>
              ) : (
                /* Logged In State Actions */
                <div className="flex items-center gap-3 text-xs">
                  {/* + Write a Post */}
                  <button
                    onClick={() => setWritePostModalOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-sky-600/90 hover:bg-sky-500 text-white font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <PenSquare className="h-3.5 w-3.5" />
                    <span>+ Write a Post</span>
                  </button>

                  {/* Profile Dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-white font-medium transition-colors"
                    >
                      <div className="h-6 w-6 rounded-full bg-teal-600 flex items-center justify-center text-[11px] font-bold text-white">
                        {user?.name ? user.name[0] : "U"}
                      </div>
                      <span className="text-xs font-semibold">{user?.name || "Profile"}</span>
                      <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                    </button>

                    {profileDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-1.5 z-50 divide-y divide-slate-800/80 text-xs">
                        <div className="px-4 py-2">
                          <div className="font-bold text-white truncate">{user?.name}</div>
                          <div className="text-[11px] text-slate-400 truncate">{user?.email}</div>
                        </div>

                        <div className="py-1">
                          <Link
                            href="/profile"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-slate-300 hover:bg-slate-800/60 hover:text-white"
                          >
                            <User className="h-3.5 w-3.5 text-sky-400" />
                            <span>My Profile</span>
                          </Link>

                          <Link
                            href="/profile?tab=saved"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-slate-300 hover:bg-slate-800/60 hover:text-white"
                          >
                            <Bookmark className="h-3.5 w-3.5 text-teal-400" />
                            <span>Bookmarks / Saved</span>
                          </Link>

                          <Link
                            href="/profile?tab=settings"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-slate-300 hover:bg-slate-800/60 hover:text-white"
                          >
                            <Settings className="h-3.5 w-3.5 text-indigo-400" />
                            <span>Account Settings</span>
                          </Link>
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
                className="p-2 text-slate-400 hover:text-white"
                aria-label="Toggle Navigation"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="xl:hidden bg-slate-950 border-b border-slate-800 px-6 py-5 space-y-4">
            <nav className="flex flex-col space-y-2.5 text-sm font-medium text-slate-300">
              {navLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-1 hover:text-teal-400"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="pt-4 border-t border-slate-800 flex flex-col gap-2.5 text-xs">
              <button
                onClick={() => {
                  toggleAuthState();
                  setMobileMenuOpen(false);
                }}
                className="py-2 text-center rounded-xl bg-slate-900 border border-slate-800 text-slate-300"
              >
                Switch Auth State ({isLoggedIn ? "Currently: Logged In" : "Currently: Logged Out"})
              </button>

              {!isLoggedIn ? (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => {
                      setAuthModal("login");
                      setMobileMenuOpen(false);
                    }}
                    className="py-2.5 text-center rounded-xl bg-slate-900 text-white font-semibold"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      setAuthModal("register");
                      setMobileMenuOpen(false);
                    }}
                    className="py-2.5 text-center rounded-xl bg-teal-600 text-white font-semibold"
                  >
                    Register
                  </button>
                </div>
              ) : (
                <div className="space-y-2 pt-1">
                  <button
                    onClick={() => {
                      setWritePostModalOpen(true);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2.5 rounded-xl bg-sky-600 text-white font-bold text-center"
                  >
                    + Write a Post
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2.5 rounded-xl bg-slate-900 text-rose-400 font-semibold text-center"
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Login / Register Modal */}
      {authModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0b1120] border border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setAuthModal(null)}
              className="absolute top-4 right-4 h-8 w-8 rounded-full bg-slate-900 text-slate-400 hover:text-white flex items-center justify-center"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="text-center space-y-1 mb-5">
              <h3 className="text-xl font-bold text-white">
                {authModal === "login" ? "Welcome Back" : "Join Bangladeshi Travelers"}
              </h3>
              <p className="text-xs text-slate-400">
                {authModal === "login"
                  ? "Sign in to save bookmarks and participate in forum"
                  : "Create an account to share travel tips and photos"}
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-3.5 text-xs">
              {authModal === "register" && (
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Tanvir Ahmed"
                    value={loginName}
                    onChange={(e) => setLoginName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Email Address</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md transition-all mt-2"
              >
                {authModal === "login" ? "Sign In" : "Create Account"}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setAuthModal(authModal === "login" ? "register" : "login")}
                  className="text-[11px] text-teal-400 hover:underline"
                >
                  {authModal === "login"
                    ? "Don't have an account? Register here"
                    : "Already registered? Login here"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* + Write a Post Modal */}
      {writePostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0b1120] border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative">
            <button
              onClick={() => setWritePostModalOpen(false)}
              className="absolute top-4 right-4 h-8 w-8 rounded-full bg-slate-900 text-slate-400 hover:text-white flex items-center justify-center"
            >
              <X className="h-4 w-4" />
            </button>

            {postSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="h-12 w-12 mx-auto rounded-full bg-teal-500/10 text-teal-400 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h4 className="text-lg font-bold text-white">Post Published!</h4>
                <p className="text-xs text-slate-400">Your travel tip has been shared with the community.</p>
              </div>
            ) : (
              <form onSubmit={handlePostSubmit} className="space-y-4 text-xs">
                <div>
                  <h3 className="text-lg font-bold text-white">Share a Travel Tip or Query</h3>
                  <p className="text-xs text-slate-400">Help fellow Bangladeshi travelers with tips, budgets, or road conditions.</p>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Category</label>
                  <select
                    value={postCategory}
                    onChange={(e) => setPostCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                  >
                    <option value="Travel Tips">Travel Tips & Packing</option>
                    <option value="Road Conditions">Road & Highway Updates</option>
                    <option value="Budget Breakdown">Cost & Budget Breakdown</option>
                    <option value="Hotel Review">Hotel & Resort Experience</option>
                    <option value="Question">Ask the Community</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Current Chander Gari rates and timings for Sajek (2026)"
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Content / Details</label>
                  <textarea
                    rows={4}
                    placeholder="Share specific guidance, prices, contacts, or your question..."
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                    required
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setWritePostModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-950 text-slate-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold"
                  >
                    Publish Post
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
