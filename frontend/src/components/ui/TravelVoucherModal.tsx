"use client";

import { useEffect, useRef } from "react";
import { X, Printer, ShieldCheck, MapPin, Calendar, Users, Phone, AlertTriangle, CheckCircle2 } from "lucide-react";

export interface TravelVoucherData {
  voucherNumber: string;
  bookingRef: string;
  travelerName: string;
  phone?: string;
  tourTitle: string;
  destination: string;
  departureDate: string;
  duration: string;
  guestsCount: number;
  totalPrice: number;
  pickupPoint: string;
  status?: string;
  specialInstructions?: string;
}

interface TravelVoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  voucher: TravelVoucherData;
}

export default function TravelVoucherModal({
  isOpen,
  onClose,
  voucher,
}: TravelVoucherModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4 print:p-0 print:bg-white print:static">
      <div
        ref={modalRef}
        className="relative w-full max-w-2xl bg-white dark:bg-[#141720] rounded-3xl shadow-2xl border border-stone-200 dark:border-[#222836] overflow-hidden print:shadow-none print:border-none print:rounded-none animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Top Actions Bar (Hidden on Print) */}
        <div className="bg-stone-900 dark:bg-[#0c0f16] text-stone-100 px-6 py-4 flex items-center justify-between print:hidden border-b dark:border-[#222836]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="font-semibold text-sm tracking-wide">
              Verified Travel Pass &amp; Boarding Manifest
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-stone-800 dark:bg-[#1c2230] hover:bg-stone-700 dark:hover:bg-[#262f42] text-stone-100 rounded-full text-xs font-semibold border border-stone-700 dark:border-[#2f3b52] transition-colors shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Pass</span>
            </button>
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-white p-1 rounded-full transition-colors cursor-pointer"
              aria-label="Close voucher"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Voucher Content Container */}
        <div className="p-6 sm:p-8 space-y-6 bg-[#FCFBF9] dark:bg-[#0e1118]">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-5 border-b border-stone-200 dark:border-[#222836] gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-serif font-black tracking-tight text-stone-900 dark:text-stone-100">
                  TRAVELLER&apos;S
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5" /> CONFIRMED
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Government Tourism &amp; Police Manifest Approved
              </p>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-[11px] font-mono uppercase text-stone-500 dark:text-stone-400 block">
                PASS NUMBER
              </span>
              <span className="text-base sm:text-lg font-mono font-bold text-stone-900 dark:text-amber-400 tracking-wider">
                {voucher.voucherNumber}
              </span>
            </div>
          </div>

          {/* Main Info Grid */}
          <div className="bg-white dark:bg-[#141720] rounded-2xl p-5 border border-stone-200 dark:border-[#222836] shadow-xs space-y-4">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-400 block">
                Expedition Title
              </span>
              <h3 className="text-lg sm:text-xl font-serif font-bold text-stone-900 dark:text-stone-100">
                {voucher.tourTitle}
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-stone-100 dark:border-[#222836] text-xs sm:text-sm">
              <div>
                <span className="text-stone-400 dark:text-stone-500 text-xs block">Lead Passenger</span>
                <span className="font-semibold text-stone-900 dark:text-stone-200 truncate block">
                  {voucher.travelerName}
                </span>
              </div>
              <div>
                <span className="text-stone-400 dark:text-stone-500 text-xs block">Destination</span>
                <span className="font-semibold text-stone-900 dark:text-stone-200 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  {voucher.destination}
                </span>
              </div>
              <div>
                <span className="text-stone-400 dark:text-stone-500 text-xs block">Departure Date</span>
                <span className="font-semibold text-stone-900 dark:text-stone-200 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-stone-600 dark:text-stone-400" />
                  {voucher.departureDate}
                </span>
              </div>
              <div>
                <span className="text-stone-400 dark:text-stone-500 text-xs block">Party Size</span>
                <span className="font-semibold text-stone-900 dark:text-stone-200 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-stone-600 dark:text-stone-400" />
                  {voucher.guestsCount} Traveler(s)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-stone-100 dark:border-[#222836] text-xs">
              <div>
                <span className="text-stone-400 dark:text-stone-500 block">Boarding / Pickup Point</span>
                <span className="font-medium text-stone-800 dark:text-stone-200">{voucher.pickupPoint}</span>
              </div>
              <div>
                <span className="text-stone-400 dark:text-stone-500 block">Contact Phone</span>
                <span className="font-medium text-stone-800 dark:text-stone-200 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-stone-500 dark:text-stone-400" />
                  {voucher.phone || "+880 1711-000000"}
                </span>
              </div>
              <div>
                <span className="text-stone-400 dark:text-stone-500 block">Total Amount Paid</span>
                <span className="font-bold text-stone-900 dark:text-emerald-400">
                  BDT {voucher.totalPrice.toLocaleString()} (Full BDT)
                </span>
              </div>
            </div>
          </div>

          {/* Perforated Divider Simulation */}
          <div className="relative py-1">
            <div className="border-t-2 border-dashed border-stone-300 dark:border-stone-700 w-full" />
            <div className="absolute -left-8 -top-2.5 w-5 h-5 rounded-full bg-stone-950/70 print:hidden" />
            <div className="absolute -right-8 -top-2.5 w-5 h-5 rounded-full bg-stone-950/70 print:hidden" />
          </div>

          {/* Checkpost & Safety Advisory Note */}
          <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-950/30 border border-amber-500/30 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs text-stone-700 dark:text-amber-100/90 leading-relaxed">
              <span className="font-bold text-amber-800 dark:text-amber-300 block">
                Military Convoy &amp; Checkpost Advisory:
              </span>
              <p>
                {voucher.specialInstructions ||
                  "Carry at least 4 physical photocopies of your National ID / Passport. Sajek Valley and Thanchi routes require reporting to the Dighinala / security camp checkpoint strictly 45 minutes prior to convoy departure times (10:30 AM or 3:30 PM)."}
              </p>
            </div>
          </div>

          {/* Barcode & Security Stamp Simulation */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="space-y-1">
              {/* Barcode simulation */}
              <div
                className="h-10 flex items-stretch gap-[2px] bg-white dark:bg-[#141720] p-2 rounded border border-stone-200 dark:border-[#222836]"
                aria-label="Barcode simulation"
              >
                {[
                  2, 4, 1, 3, 2, 5, 1, 3, 4, 2, 1, 3, 5, 2, 1, 4, 2, 3, 1, 4, 2, 3,
                  1, 5, 2, 4, 1, 3, 2, 4, 1, 2, 4,
                ].map((w, i) => (
                  <span
                    key={i}
                    style={{ width: `${w}px` }}
                    className="bg-stone-900 dark:bg-stone-200 inline-block h-full"
                  />
                ))}
              </div>
              <div className="text-[10px] font-mono text-center sm:text-left text-stone-400 tracking-wider">
                REF: {voucher.bookingRef} • SECURE-AUTH-BD
              </div>
            </div>

            {/* Verification Seal */}
            <div className="flex items-center gap-3 border border-stone-200 dark:border-[#222836] rounded-xl px-4 py-2.5 bg-white dark:bg-[#141720] text-right">
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-400 dark:text-stone-500 block">
                  DIGITAL VERIFICATION
                </span>
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  VALIDATED BY TOURFLOW BD
                </span>
              </div>
              <div className="w-10 h-10 rounded-lg bg-stone-900 dark:bg-emerald-600 flex items-center justify-center text-white text-xs font-mono font-bold">
                QR
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
