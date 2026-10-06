"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Compass,
  CalendarCheck2,
  Calendar,
  Clock,
  ShieldCheck,
  Printer,
  Download,
  AlertCircle,
  CheckCircle2,
  Search,
  Users,
  MapPin,
  CreditCard,
  PhoneCall
} from "lucide-react";
import { BookingRecord, API_BASE } from "@/lib/api";

function ManageBookingContent() {
  const searchParams = useSearchParams();
  const initialRef = searchParams.get("ref") || "";
  const initialEmail = searchParams.get("email") || "";

  const [bookingRefInput, setBookingRefInput] = useState(initialRef);
  const [emailInput, setEmailInput] = useState(initialEmail);
  const [booking, setBooking] = useState<BookingRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchBooking = async (ref: string, email: string) => {
    if (!ref.trim()) return;
    setLoading(true);
    setErrorMessage(null);
    try {
      const url = `${API_BASE}/bookings/reference/${encodeURIComponent(ref.trim())}${
        email.trim() ? `?email=${encodeURIComponent(email.trim())}` : ""
      }`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setBooking(data);
      } else {
        const err = await res.json();
        setErrorMessage(err.message || "Reservation not found. Please double check reference number.");
        setBooking(null);
      }
    } catch {
      setErrorMessage("Could not connect to the reservation service. Please verify your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialRef) {
      fetchBooking(initialRef, initialEmail);
    }
  }, [initialRef, initialEmail]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBooking(bookingRefInput, emailInput);
  };

  return (
    <div className="space-y-10">
      {/* Lookup Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Booking Reference
            </label>
            <input
              type="text"
              placeholder="e.g. TF-202610-7295"
              value={bookingRefInput}
              onChange={(e) => setBookingRefInput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 uppercase font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Primary Passenger Email
            </label>
            <input
              type="email"
              placeholder="name@example.com"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/25 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Search className="h-4 w-4" />
              <span>{loading ? "Searching..." : "Retrieve Itinerary"}</span>
            </button>
          </div>
        </form>

        {errorMessage && (
          <div className="mt-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Booking Details View */}
      {booking && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl space-y-8 p-6 sm:p-10">
          {/* Header Strip */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                Official Expedition Manifest Record
              </span>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-black text-white font-mono">{booking.bookingReference}</h2>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {booking.status}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  {booking.paymentStatus}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 hover:bg-slate-800 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors"
              >
                <Printer className="h-4 w-4 text-indigo-400" />
                <span>Print Official Voucher</span>
              </button>
            </div>
          </div>

          {/* Expedition Summary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white uppercase tracking-wider text-xs">
                Itinerary Overview
              </h3>
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800/80 space-y-3 text-xs">
                <div className="text-lg font-bold text-white">{booking.tourTitle}</div>
                <div className="flex items-center gap-2 text-slate-400">
                  <MapPin className="h-4 w-4 text-indigo-400" />
                  <span>{booking.destination}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Calendar className="h-4 w-4 text-indigo-400" />
                  <span>
                    <strong>Departure:</strong>{" "}
                    {new Date(booking.departureDate).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "long",
                      day: "numeric",
                      year: "numeric"
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Users className="h-4 w-4 text-sky-400" />
                  <span>Reserved for {booking.numberOfTravelers} guest(s)</span>
                </div>
              </div>
            </div>

            {/* Financial Ledger */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white uppercase tracking-wider text-xs">
                Financial Breakdown
              </h3>
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800/80 space-y-3 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Unit Price per Guest</span>
                  <span className="text-white font-medium">${booking.unitPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Total Expedition Fare</span>
                  <span className="text-white font-bold">${booking.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Deposit Received</span>
                  <span className="text-emerald-400 font-bold">${booking.depositPaid.toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between text-sm">
                  <span className="font-bold text-white">Remaining Balance</span>
                  <span className="font-extrabold text-amber-400">
                    ${booking.balanceRemaining.toLocaleString()}
                  </span>
                </div>
                {booking.balanceRemaining > 0 && (
                  <div className="pt-2">
                    <button
                      onClick={() => alert("Payment gateway simulated: Balance payment recorded.")}
                      className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-2"
                    >
                      <CreditCard className="h-3.5 w-3.5" />
                      <span>Settle Balance Now (${booking.balanceRemaining.toLocaleString()})</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Passenger & Emergency Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-slate-800">
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Lead Passenger Record
              </h4>
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs space-y-1 text-slate-300">
                <div className="font-bold text-white">{booking.customerName}</div>
                <div>Email: {booking.customerEmail}</div>
                <div>Phone: {booking.customerPhone || "Not provided"}</div>
                {booking.dietaryRequirements && (
                  <div className="text-amber-400 pt-1">
                    Dietary: {booking.dietaryRequirements}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Emergency & Field Support
              </h4>
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs space-y-2 text-slate-300">
                <div>
                  <strong>Emergency Contact:</strong>{" "}
                  {booking.emergencyContactName || "On file with expedition lead"}
                </div>
                <div>
                  <strong>Emergency Phone:</strong>{" "}
                  {booking.emergencyContactPhone || "+1 (800) 582-7391"}
                </div>
                <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
                  <PhoneCall className="h-3.5 w-3.5 text-indigo-400" />
                  <span>24/7 Field Concierge Line: +1 (800) 582-7391</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ManageBookingPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="space-y-3 text-center sm:text-left">
        <div className="text-xs font-bold uppercase tracking-widest text-indigo-400">
          Traveler Portal
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Manage Your Reservation
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
          Access your confirmed expedition itinerary, review payment balances, update emergency contacts, and download your official travel voucher.
        </p>
      </div>

      <Suspense fallback={<div className="py-20 text-center text-slate-500">Loading reservation portal...</div>}>
        <ManageBookingContent />
      </Suspense>
    </div>
  );
}
