"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  CreditCard,
  Loader2,
  Lock,
  Printer,
  ShieldCheck,
  Smartphone,
  Wallet,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TravelVoucherModal from "@/components/ui/TravelVoucherModal";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import {
  BookingRecord,
  fetchAllBookings,
  fetchPaymentMethods,
  initiatePayment,
  verifyPayment,
} from "@/lib/api";

interface PaymentMethodOption {
  id: string;
  name: string;
  type: string;
  currency: string;
  description: string;
  badge?: string;
}

interface PaymentReceipt {
  transactionId: string;
  paymentStatus: string;
  bookingStatus: string;
  amountPaid: number;
}

function PaymentCheckoutInner() {
  const searchParams = useSearchParams();
  const initialBookingId = searchParams.get("bookingId") || "";
  const initialTrx = searchParams.get("trx") || "";
  const initialMethod = (searchParams.get("method") || "bkash").toLowerCase();
  const initialSig = searchParams.get("sig") || "";

  const { user, token, isLoading: authLoading, openAuthModal } = useAuth();
  const { toast } = useToast();

  const [booking, setBooking] = useState<BookingRecord | null>(null);
  const [methods, setMethods] = useState<PaymentMethodOption[]>([]);
  const [selectedMethod, setSelectedMethod] = useState(initialMethod);
  const [trxId, setTrxId] = useState(initialTrx);
  const [signature, setSignature] = useState(initialSig);
  const [walletAccount, setWalletAccount] = useState("01711-000000");
  const [sandboxOtp, setSandboxOtp] = useState("123456");
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [receipt, setReceipt] = useState<PaymentReceipt | null>(null);
  const [voucherOpen, setVoucherOpen] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(20 * 60);

  const requestKey = token ? `${token}:${initialBookingId}` : null;
  const loading = authLoading || Boolean(requestKey && loadedKey !== requestKey);

  useEffect(() => {
    fetchPaymentMethods()
      .then((list) => setMethods(Array.isArray(list) ? list : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (authLoading || !token || !requestKey) {
      return;
    }

    let cancelled = false;
    fetchAllBookings(token)
      .then((list) => {
        if (cancelled) return;
        const found = initialBookingId
          ? list.find((b) => b.id.toLowerCase() === initialBookingId.toLowerCase())
          : list.find((b) => b.paymentStatus !== "Paid") || list[0];
        setBooking(found || null);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          toast.error(
            "Unable to load booking",
            err instanceof Error ? err.message : "Please try again."
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoadedKey(requestKey);
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, token, requestKey, initialBookingId, toast]);

  useEffect(() => {
    if (receipt || !booking) return;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [receipt, booking]);

  const formattedTimer = useMemo(() => {
    const mins = Math.floor(secondsLeft / 60);
    const secs = secondsLeft % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }, [secondsLeft]);

  const handleMethodSelect = async (methodId: string) => {
    setSelectedMethod(methodId);
    if (!booking || !token || booking.paymentStatus === "Paid") return;
    try {
      setProcessing(true);
      const session = await initiatePayment(booking.id, methodId, token);
      setTrxId(session.transactionId || "");
      setSignature(session.gatewaySignature || "");
      setSecondsLeft(20 * 60);
    } catch (err: unknown) {
      toast.error(
        "Gateway Error",
        err instanceof Error ? err.message : "Unable to switch payment method."
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleCompletePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking || !token) return;

    if (sandboxOtp.trim().length < 4) {
      toast.error("Verification Code Required", "Enter the 6-digit sandbox OTP (e.g., 123456).");
      return;
    }

    try {
      setProcessing(true);
      let activeTrx = trxId;
      let activeSig = signature;

      if (!activeTrx || !activeSig) {
        const initRes = await initiatePayment(booking.id, selectedMethod, token);
        activeTrx = initRes.transactionId;
        activeSig = initRes.gatewaySignature || "";
        setTrxId(activeTrx);
        setSignature(activeSig);
      }

      const verified: PaymentReceipt = await verifyPayment(
        booking.id,
        activeTrx,
        selectedMethod,
        token,
        activeSig
      );
      setReceipt(verified);
      setBooking({
        ...booking,
        paymentStatus: verified.paymentStatus || "Paid",
        status: verified.bookingStatus || "Confirmed",
        depositPaid: verified.amountPaid ?? booking.totalAmount,
        balanceRemaining: 0,
      });
      toast.success(
        "Payment Confirmed",
        `Receipt ${verified.transactionId} settled for ${booking.bookingReference}.`
      );
    } catch (err: unknown) {
      toast.error(
        "Payment Failed",
        err instanceof Error ? err.message : "Unable to verify payment."
      );
    } finally {
      setProcessing(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-stone-600">
        <Loader2 className="h-7 w-7 animate-spin text-stone-900" />
        <p className="text-sm font-medium">Loading secure TourFlow payment session...</p>
      </div>
    );
  }

  if (!user || !token) {
    return (
      <div className="max-w-lg mx-auto my-12 rounded-2xl border border-[#E5DFD3] bg-white p-8 text-center space-y-4 shadow-sm">
        <div className="mx-auto h-12 w-12 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-900">
          <Lock className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-bold text-stone-950">Sign in to complete checkout</h1>
        <p className="text-sm text-stone-600">
          For your financial protection, payment sessions require authenticated account ownership.
        </p>
        <button
          type="button"
          onClick={() => openAuthModal("login")}
          className="inline-flex items-center justify-center rounded-full bg-stone-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-stone-800 transition-colors cursor-pointer"
        >
          Sign In / Verify Session
        </button>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-lg mx-auto my-12 rounded-2xl border border-[#E5DFD3] bg-white p-8 text-center space-y-4">
        <h1 className="text-xl font-bold text-stone-950">No Pending Booking Found</h1>
        <p className="text-sm text-stone-600">
          Reserve a tour or choose an active booking from your traveler dashboard to launch checkout.
        </p>
        <Link
          href="/profile?tab=bookings"
          className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-stone-800"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Go to My Bookings</span>
        </Link>
      </div>
    );
  }

  const amountDue = booking.balanceRemaining > 0 ? booking.balanceRemaining : booking.totalAmount;
  const isAlreadySettled = booking.paymentStatus === "Paid" && booking.balanceRemaining <= 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/profile?tab=bookings"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-950"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Bookings Dashboard</span>
        </Link>

        {!isAlreadySettled && !receipt && (
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900">
            <Clock className="h-3.5 w-3.5" />
            <span>Session Hold Expires: {formattedTimer}</span>
          </div>
        )}
      </div>

      {receipt || isAlreadySettled ? (
        <div className="rounded-3xl border border-emerald-200 bg-white p-8 shadow-sm space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-stone-100 pb-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <span className="inline-block rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                  HMAC-SHA256 Verified Settlement
                </span>
                <h1 className="mt-2 text-2xl font-bold text-stone-950">
                  Payment Confirmed for {booking.bookingReference}
                </h1>
                <p className="text-sm text-stone-600 mt-1">
                  {booking.tourTitle} &middot; {booking.numberOfTravelers} Traveler(s)
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-stone-500 uppercase tracking-wider">Settled Amount</p>
              <p className="text-2xl font-extrabold text-stone-950">
                BDT {(receipt?.amountPaid ?? booking.totalAmount).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="rounded-xl bg-[#FAF8F5] border border-[#EBE6DC] p-4">
              <p className="text-xs text-stone-500">Transaction ID</p>
              <p className="mt-1 font-mono font-semibold text-stone-950 break-all">
                {receipt?.transactionId || trxId || "VERIFIED-TRX"}
              </p>
            </div>
            <div className="rounded-xl bg-[#FAF8F5] border border-[#EBE6DC] p-4">
              <p className="text-xs text-stone-500">Booking Status</p>
              <p className="mt-1 font-semibold text-emerald-800">Confirmed &amp; Paid</p>
            </div>
            <div className="rounded-xl bg-[#FAF8F5] border border-[#EBE6DC] p-4">
              <p className="text-xs text-stone-500">Traveler</p>
              <p className="mt-1 font-semibold text-stone-950">{booking.customerName}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setVoucherOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-stone-800 transition-colors cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>View / Print Official E-Voucher</span>
            </button>
            <Link
              href="/profile?tab=bookings"
              className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-5 py-2.5 text-sm font-semibold text-stone-800 hover:bg-stone-50 transition-colors"
            >
              <span>Return to Dashboard</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Method Selector & Gateway Authorization */}
          <form
            onSubmit={handleCompletePayment}
            className="lg:col-span-2 rounded-3xl border border-[#E5DFD3] bg-white p-6 sm:p-8 shadow-sm space-y-6"
          >
            <div>
              <h1 className="text-2xl font-bold text-stone-950">Secure Gateway Checkout</h1>
              <p className="text-sm text-stone-600 mt-1">
                Select a Bangladesh payment channel and verify using our HMAC-signed checkout session.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(methods.length > 0
                ? methods
                : [
                    { id: "bkash", name: "bKash Direct Gateway", type: "MFS", currency: "BDT", description: "Instant mobile checkout", badge: "Popular" },
                    { id: "nagad", name: "Nagad Online Pay", type: "MFS", currency: "BDT", description: "Fast postal MFS", badge: "Verified" },
                    { id: "sslcommerz", name: "SSLCommerz", type: "Gateway", currency: "BDT", description: "30+ banks & MFS", badge: "Aggregator" },
                    { id: "card", name: "Visa / Mastercard", type: "Card", currency: "BDT / USD", description: "3D Secure cards", badge: "Global" },
                  ]
              ).map((m) => {
                const active = selectedMethod === m.id.toLowerCase();
                return (
                  <button
                    key={m.id}
                    type="button"
                    disabled={processing}
                    onClick={() => handleMethodSelect(m.id.toLowerCase())}
                    className={`text-left rounded-2xl border p-4 transition-all cursor-pointer ${
                      active
                        ? "border-stone-900 bg-stone-900/5 ring-1 ring-stone-900"
                        : "border-[#E5DFD3] bg-[#FAF8F5] hover:border-stone-400"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 text-sm font-bold text-stone-950">
                        <Wallet className="h-4 w-4 text-emerald-700" />
                        {m.name}
                      </span>
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white border border-stone-200 text-stone-600">
                        {m.type}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs text-stone-600">{m.description}</p>
                  </button>
                );
              })}
            </div>

            <div className="rounded-2xl border border-[#E5DFD3] bg-[#FAF8F5] p-5 space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-stone-700">Sandbox Authorization Details</span>
                <span className="inline-flex items-center gap-1 text-emerald-800 font-medium">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  HMAC Signed Session
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-stone-700">
                    {selectedMethod === "card" ? "Card / Account Reference" : "Mobile Wallet Number"}
                  </label>
                  <div className="relative">
                    <Smartphone className="h-4 w-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={walletAccount}
                      onChange={(e) => setWalletAccount(e.target.value)}
                      className="w-full rounded-xl border border-[#DDD6C8] bg-white pl-9 pr-3 py-2 text-sm text-stone-950 focus:outline-none focus:border-stone-900"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-stone-700">
                    Sandbox Verification OTP
                  </label>
                  <input
                    type="password"
                    required
                    maxLength={8}
                    value={sandboxOtp}
                    onChange={(e) => setSandboxOtp(e.target.value)}
                    placeholder="123456"
                    className="w-full rounded-xl border border-[#DDD6C8] bg-white px-3 py-2 text-sm text-stone-950 focus:outline-none focus:border-stone-900"
                  />
                </div>
              </div>

              {trxId && (
                <div className="text-[11px] font-mono text-stone-500 flex flex-wrap items-center justify-between gap-2 pt-1">
                  <span>Session TrxID: {trxId}</span>
                  {signature && <span>Sig: {signature.slice(0, 14)}...</span>}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={processing}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-stone-900 py-3.5 px-6 text-sm font-semibold text-white hover:bg-black transition-all disabled:opacity-60 cursor-pointer"
            >
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Verifying Cryptographic Signature...</span>
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4" />
                  <span>Confirm &amp; Pay BDT {amountDue.toLocaleString()}</span>
                </>
              )}
            </button>
          </form>

          {/* Invoice Breakdown */}
          <aside className="rounded-3xl border border-[#E5DFD3] bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-stone-950 border-b border-stone-100 pb-3">
              Order Summary
            </h2>
            <div className="space-y-2.5 text-sm">
              <div>
                <p className="text-xs text-stone-500">Tour Package</p>
                <p className="font-semibold text-stone-950">{booking.tourTitle}</p>
              </div>
              <div className="flex justify-between text-xs text-stone-600">
                <span>Reference</span>
                <span className="font-mono font-semibold text-stone-900">
                  {booking.bookingReference}
                </span>
              </div>
              <div className="flex justify-between text-xs text-stone-600">
                <span>Travelers</span>
                <span className="font-semibold text-stone-900">
                  {booking.numberOfTravelers} Guest(s)
                </span>
              </div>
              <div className="flex justify-between text-xs text-stone-600">
                <span>Departure</span>
                <span className="font-semibold text-stone-900">
                  {new Date(booking.departureDate).toLocaleDateString("en-US", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="border-t border-stone-100 pt-3 flex justify-between text-xs text-stone-600">
                <span>Total Package Amount</span>
                <span>BDT {booking.totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs text-stone-600">
                <span>Already Paid</span>
                <span>BDT {booking.depositPaid.toLocaleString()}</span>
              </div>
              <div className="border-t border-stone-100 pt-3 flex justify-between text-base font-bold text-stone-950">
                <span>Payable Now</span>
                <span>BDT {amountDue.toLocaleString()}</span>
              </div>
            </div>
          </aside>
        </div>
      )}

      <TravelVoucherModal
        isOpen={voucherOpen}
        onClose={() => setVoucherOpen(false)}
        voucher={{
          voucherNumber: `PASS-${booking.bookingReference}`,
          bookingRef: booking.bookingReference,
          travelerName: booking.customerName,
          phone: booking.customerPhone,
          tourTitle: booking.tourTitle,
          destination: booking.destination || "Bangladesh Expedition",
          departureDate: new Date(booking.departureDate).toLocaleDateString("en-US", {
            dateStyle: "long",
          }),
          duration: "Curated Tour",
          guestsCount: booking.numberOfTravelers,
          totalPrice: booking.totalAmount,
          pickupPoint: "Central Boarding Point / Tourist Police Camp",
          status: booking.status,
        }}
      />
    </div>
  );
}

export default function BookingPaymentPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <Suspense
          fallback={
            <div className="min-h-[50vh] flex items-center justify-center">
              <Loader2 className="h-7 w-7 animate-spin text-stone-900" />
            </div>
          }
        >
          <PaymentCheckoutInner />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
