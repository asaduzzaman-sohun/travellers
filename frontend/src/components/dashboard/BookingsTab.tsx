"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  CreditCard,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Copy,
  Printer,
  Calendar,
  Users,
  MapPin,
  Ticket,
} from "lucide-react";
import { BookingRecord, initiatePayment, verifyPayment } from "@/lib/api";
import { useToast } from "@/lib/toast-context";
import TravelVoucherModal from "@/components/ui/TravelVoucherModal";

interface BookingsTabProps {
  bookingsList: BookingRecord[];
  isTraveller: boolean;
  handleBookingStatusChange: (bookingId: string, status: string, paymentStatus?: string) => void;
  voucherSearchRef: string;
  setVoucherSearchRef: (ref: string) => void;
  handleVoucherLookup: (e: React.FormEvent) => void;
  searchingVoucher: boolean;
  voucherError: string | null;
  voucherResult: BookingRecord | null;
  onRefresh?: () => void;
}

export function BookingsTab({
  bookingsList,
  isTraveller,
  handleBookingStatusChange,
  voucherSearchRef,
  setVoucherSearchRef,
  handleVoucherLookup,
  searchingVoucher,
  voucherError,
  voucherResult,
  onRefresh,
}: BookingsTabProps) {
  const { toast } = useToast();
  const [bookingSearch, setBookingSearch] = useState("");
  const [bookingStatusFilter, setBookingStatusFilter] = useState("all");
  const [payingBookingId, setPayingBookingId] = useState<string | null>(null);
  const [activeVoucherBooking, setActiveVoucherBooking] = useState<BookingRecord | null>(null);

  const filteredBookings = bookingsList.filter((b) => {
    const matchesSearch =
      b.bookingReference.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.customerName.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.tourTitle.toLowerCase().includes(bookingSearch.toLowerCase());
    const matchesFilter =
      bookingStatusFilter === "all" || b.status.toLowerCase() === bookingStatusFilter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const copyToClipboard = (text: string, label: string = "Reference") => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} Copied`, text);
  };

  const handlePayNow = async (booking: BookingRecord) => {
    try {
      setPayingBookingId(booking.id);
      const res = await initiatePayment(booking.id, "bkash");
      if (res && res.transactionId) {
        // Automatically verify for instant UX
        await verifyPayment(booking.id, res.transactionId, "bkash");
        toast.success(
          "Payment Successful via bKash!",
          `Transaction TrxID: ${res.transactionId}. Pass has been confirmed.`
        );
        if (onRefresh) onRefresh();
      }
    } catch (err: unknown) {
      toast.error(
        "Payment Failed",
        err instanceof Error ? err.message : "Payment gateway error. Please try again."
      );
    } finally {
      setPayingBookingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="h-3 w-3" />
            <span>Confirmed</span>
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="h-3 w-3" />
            <span>Pending</span>
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="h-3 w-3" />
            <span>Cancelled</span>
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
            <CheckCircle2 className="h-3 w-3" />
            <span>Completed</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-stone-100 text-stone-700 border border-stone-200">
            {status}
          </span>
        );
    }
  };

  const getPaymentBadge = (paymentStatus?: string) => {
    if (paymentStatus === "Paid") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="h-2.5 w-2.5" />
          Paid
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        <AlertCircle className="h-2.5 w-2.5" />
        Due
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* If Traveller: Official Voucher Lookup */}
      {isTraveller && (
        <div className="bg-white border border-[#E5E7EB] rounded-lg p-5 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-[#111827] flex items-center gap-2">
                <Ticket className="h-4 w-4 text-stone-700" />
                <span>Retrieve Travel Voucher & Boarding Pass</span>
              </h3>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Instant access to your verified booking credentials and e-ticket pass.
              </p>
            </div>
          </div>

          <form onSubmit={handleVoucherLookup} className="flex gap-2 max-w-md">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="e.g. TF-202610-XXXX"
                value={voucherSearchRef}
                onChange={(e) => setVoucherSearchRef(e.target.value)}
                className="w-full bg-[#FFFFFF] border border-[#D1D5DB] rounded-md px-3 py-2 text-xs font-mono text-[#111827] placeholder:font-sans focus:outline-none focus:border-[#111827]"
              />
            </div>
            <button
              type="submit"
              disabled={searchingVoucher || !voucherSearchRef.trim()}
              className="px-4 py-2 bg-[#111827] hover:bg-black disabled:bg-stone-300 text-white text-xs font-semibold rounded-md transition-colors"
            >
              {searchingVoucher ? "Verifying..." : "Verify Voucher"}
            </button>
          </form>

          {voucherError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-md flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{voucherError}</span>
            </div>
          )}

          {voucherResult && (
            <div className="mt-4 p-5 border border-stone-200 bg-stone-50/60 rounded-lg space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-200">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm text-[#111827] bg-white px-2 py-0.5 rounded border border-stone-200">
                    {voucherResult.bookingReference}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(voucherResult.bookingReference, "Voucher Ref")}
                    className="p-1 text-stone-500 hover:text-stone-900 rounded transition-colors"
                    title="Copy Reference"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(voucherResult.status)}
                  {getPaymentBadge(voucherResult.paymentStatus)}
                  <button
                    type="button"
                    onClick={() => setActiveVoucherBooking(voucherResult)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-[#111827] text-white rounded hover:bg-black transition-colors"
                  >
                    <Ticket className="h-3.5 w-3.5" />
                    <span>View Pass</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="p-1 text-stone-600 hover:text-stone-900 rounded transition-colors"
                    title="Print Voucher"
                  >
                    <Printer className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-stone-500 block text-[11px] mb-0.5">Expedition</span>
                  <span className="font-semibold text-stone-900 line-clamp-1">{voucherResult.tourTitle}</span>
                </div>
                <div>
                  <span className="text-stone-500 block text-[11px] mb-0.5">Departure Date</span>
                  <span className="font-medium text-stone-800 flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-stone-400" />
                    {new Date(voucherResult.departureDate).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-stone-500 block text-[11px] mb-0.5">Confirmed Seats</span>
                  <span className="font-medium text-stone-800 flex items-center gap-1">
                    <Users className="h-3 w-3 text-stone-400" />
                    {voucherResult.numberOfTravelers} Travelers
                  </span>
                </div>
                <div>
                  <span className="text-stone-500 block text-[11px] mb-0.5">Paid Total</span>
                  <span className="font-bold text-stone-900">
                    BDT {voucherResult.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bookings Table Container */}
      <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-lg overflow-hidden shadow-xs">
        {/* Table Filter & Search Header */}
        <div className="p-4 border-b border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAFAFA]">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Search reference, traveler, tour..."
              value={bookingSearch}
              onChange={(e) => setBookingSearch(e.target.value)}
              className="w-full bg-[#FFFFFF] border border-[#D1D5DB] rounded-md pl-9 pr-3 py-1.5 text-xs text-[#111827] focus:outline-none focus:border-[#111827]"
            />
            {bookingSearch && (
              <button
                type="button"
                onClick={() => setBookingSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 text-[10px]"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {["all", "Confirmed", "Pending", "Cancelled"].map((status) => {
              const count =
                status === "all"
                  ? bookingsList.length
                  : bookingsList.filter((b) => b.status.toLowerCase() === status.toLowerCase()).length;
              const isActive = bookingStatusFilter.toLowerCase() === status.toLowerCase();

              return (
                <button
                  key={status}
                  onClick={() => setBookingStatusFilter(status)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-[#111827] text-white"
                      : "bg-white text-stone-600 hover:text-stone-900 border border-stone-200"
                  }`}
                >
                  {status === "all" ? "All" : status} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#4B5563]">
            <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[#111827] font-semibold">
              <tr>
                <th className="py-3 px-5">Reference</th>
                <th className="py-3 px-5">Traveler</th>
                <th className="py-3 px-5">Tour Package</th>
                <th className="py-3 px-5">Seats</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5">Payment</th>
                <th className="py-3 px-5 text-right">Amount</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {filteredBookings.map((b) => (
                <tr key={b.id} className="hover:bg-[#F9FAFB] transition-colors">
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-1.5 font-mono text-[#111827] font-medium">
                      <span>{b.bookingReference}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(b.bookingReference, "Reference")}
                        className="text-stone-400 hover:text-stone-700 transition-colors"
                        title="Copy Reference"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                    </div>
                  </td>
                  <td className="py-3.5 px-5">
                    <div className="font-medium text-[#111827]">{b.customerName}</div>
                    <div className="text-[11px] text-[#6B7280]">{b.customerEmail}</div>
                  </td>
                  <td className="py-3.5 px-5 font-medium text-stone-900">{b.tourTitle}</td>
                  <td className="py-3.5 px-5 font-medium">{b.numberOfTravelers}</td>
                  <td className="py-3.5 px-5">{getStatusBadge(b.status)}</td>
                  <td className="py-3.5 px-5">{getPaymentBadge(b.paymentStatus)}</td>
                  <td className="py-3.5 px-5 text-right font-semibold text-[#111827]">
                    BDT {b.totalAmount.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setActiveVoucherBooking(b)}
                        className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded transition-colors"
                        title="View Official Travel Pass & Boarding Voucher"
                      >
                        <Ticket className="h-3.5 w-3.5" />
                      </button>

                      {!isTraveller ? (
                        <select
                          value={b.status}
                          onChange={(e) => {
                            const newStatus = e.target.value;
                            handleBookingStatusChange(b.id, newStatus);
                            toast.success("Status Updated", `Booking reference ${b.bookingReference} marked as ${newStatus}.`);
                          }}
                          className="bg-[#FFFFFF] border border-[#D1D5DB] rounded px-2 py-1 text-xs text-[#111827] focus:outline-none focus:border-[#111827]"
                        >
                          <option value="Confirmed">Confirmed</option>
                          <option value="Pending">Pending</option>
                          <option value="Cancelled">Cancelled</option>
                          <option value="Completed">Completed</option>
                        </select>
                      ) : (
                        b.paymentStatus !== "Paid" && (
                          <button
                            onClick={() => handlePayNow(b)}
                            disabled={payingBookingId === b.id}
                            className="px-2.5 py-1 bg-[#111827] hover:bg-black text-white text-[11px] font-medium rounded transition-colors inline-flex items-center gap-1 shadow-xs"
                          >
                            <CreditCard className="h-3 w-3" />
                            <span>{payingBookingId === b.id ? "Processing..." : "Pay bKash"}</span>
                          </button>
                        )
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredBookings.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <div className="max-w-xs mx-auto flex flex-col items-center justify-center text-center space-y-2">
                      <div className="h-10 w-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
                        <Ticket className="h-5 w-5" />
                      </div>
                      <p className="text-xs font-semibold text-stone-900">No bookings found</p>
                      <p className="text-[11px] text-stone-500">
                        {bookingSearch || bookingStatusFilter !== "all"
                          ? "No bookings match your current filter settings."
                          : "You have not made any tour reservations yet."}
                      </p>
                      {bookingSearch || bookingStatusFilter !== "all" ? (
                        <button
                          onClick={() => {
                            setBookingSearch("");
                            setBookingStatusFilter("all");
                          }}
                          className="mt-2 text-xs font-medium text-stone-800 underline hover:text-stone-950"
                        >
                          Reset Filters
                        </button>
                      ) : (
                        <Link
                          href="/destinations"
                          className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-[#111827] text-white text-xs font-medium hover:bg-black transition-colors"
                        >
                          <MapPin className="h-3 w-3" />
                          <span>Browse Available Tours</span>
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Travel Voucher Modal */}
      {activeVoucherBooking && (
        <TravelVoucherModal
          isOpen={!!activeVoucherBooking}
          onClose={() => setActiveVoucherBooking(null)}
          voucher={{
            voucherNumber: `PASS-${activeVoucherBooking.bookingReference}`,
            bookingRef: activeVoucherBooking.bookingReference,
            travelerName: activeVoucherBooking.customerName,
            phone: activeVoucherBooking.customerPhone,
            tourTitle: activeVoucherBooking.tourTitle,
            destination: "Bangladesh Scenic Expedition",
            departureDate: new Date(activeVoucherBooking.departureDate).toLocaleDateString("en-US", {
              dateStyle: "long",
            }),
            duration: "Curated Tour",
            guestsCount: activeVoucherBooking.numberOfTravelers,
            totalPrice: activeVoucherBooking.totalAmount,
            pickupPoint: "Central Point / Sayedabad / Tourist Police Camp",
            status: activeVoucherBooking.status,
          }}
        />
      )}
    </div>
  );
}
