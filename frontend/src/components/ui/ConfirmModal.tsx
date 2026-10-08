"use client";

import React from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  loading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = false,
  loading = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div
        className="bg-white border border-[#E5E7EB] rounded-lg max-w-sm w-full p-5 shadow-xl space-y-4"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-md ${
                isDestructive
                  ? "bg-rose-50 text-rose-600 border border-rose-100"
                  : "bg-amber-50 text-amber-600 border border-amber-100"
              }`}
            >
              <AlertTriangle className="h-4 w-4" />
            </div>
            <h3 className="font-semibold text-sm text-[#111827]">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#9CA3AF] hover:text-[#111827] transition-colors p-1 rounded -mr-1 -mt-1"
            disabled={loading}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-xs text-[#6B7280] leading-relaxed">{message}</p>

        <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#E5E7EB]">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-3 py-1.5 border border-[#D1D5DB] rounded-md text-xs font-medium text-[#4B5563] hover:text-[#111827] hover:bg-stone-50 transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold text-white transition-colors ${
              isDestructive
                ? "bg-rose-600 hover:bg-rose-700"
                : "bg-[#111827] hover:bg-black"
            }`}
          >
            {loading ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
