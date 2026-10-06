"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Compass,
  Phone,
  ShieldCheck,
  Menu,
  X,
  ExternalLink,
  Search,
  CalendarCheck2
} from "lucide-react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 transition-all">
      {/* Top Advisory Utility Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border-b border-slate-800/50 py-1.5 px-4 text-[11px] text-slate-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <ShieldCheck className="h-3.5 w-3.5" />
              100% Guaranteed Departures
            </span>
            <span className="hidden sm:inline text-slate-600">•</span>
            <span className="hidden sm:inline text-slate-400">
              B-Corp Certified • Max 12 Travelers Per Expedition
            </span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="tel:+18005827391"
              className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors"
            >
              <Phone className="h-3 w-3 text-indigo-400" />
              <span className="font-semibold">+1 (800) 582-7391</span>
            </a>
            <span className="text-slate-700">|</span>
            <Link
              href="/admin"
              className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
            >
              Operator Portal
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-18 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-sky-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
              <Compass className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
                <span>TOURFLOW</span>
                <span className="text-xs uppercase font-bold tracking-widest text-indigo-400 px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                  EXPEDITIONS
                </span>
              </div>
              <div className="text-[10px] tracking-wider text-slate-400 uppercase font-medium">
                Bespoke Wilderness & Cultural Travel
              </div>
            </div>
          </Link>

          {/* Desktop Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-300">
            <Link
              href="/tours"
              className="hover:text-white hover:text-indigo-400 transition-colors flex items-center gap-1"
            >
              Expeditions & Tours
            </Link>
            <Link
              href="/tours?region=Americas"
              className="hover:text-white transition-colors"
            >
              Americas
            </Link>
            <Link
              href="/tours?region=Europe"
              className="hover:text-white transition-colors"
            >
              Europe
            </Link>
            <Link
              href="/tours?region=Asia"
              className="hover:text-white transition-colors"
            >
              Asia
            </Link>
            <Link
              href="/tours?region=Africa"
              className="hover:text-white transition-colors"
            >
              Africa
            </Link>
            <Link
              href="/manage"
              className="hover:text-indigo-400 transition-colors flex items-center gap-1.5 text-slate-300"
            >
              <CalendarCheck2 className="h-4 w-4 text-indigo-400" />
              Manage Booking
            </Link>
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="http://localhost:5000/scalar/v1"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all flex items-center gap-1"
            >
              <span>API Reference</span>
              <ExternalLink className="h-3 w-3" />
            </a>

            <Link
              href="/tours"
              className="px-5 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-1.5"
            >
              <Search className="h-3.5 w-3.5" />
              <span>Browse 2026/27 Trips</span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950 border-b border-slate-800 p-6 space-y-4">
          <nav className="flex flex-col space-y-3 text-base font-semibold text-slate-300">
            <Link
              href="/tours"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-white py-1"
            >
              All Expeditions
            </Link>
            <Link
              href="/manage"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-white py-1 flex items-center gap-2"
            >
              <CalendarCheck2 className="h-4 w-4 text-indigo-400" />
              Manage My Booking
            </Link>
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="text-indigo-400 py-1"
            >
              Tour Operator Dashboard
            </Link>
          </nav>
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <Link
              href="/tours"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3 rounded-xl bg-indigo-600 text-white text-center text-sm font-bold block"
            >
              Explore All Journeys
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
