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
    <div className="fixed inset-0 z-[999] bg-black/60 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div
        className="bg-white dark:bg-[#141720] border border-[#E5E7EB] dark:border-[#222836] rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-xl ${
                isDestructive
                  ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-500/30"
                  : "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-500/30"
              }`}
            >
              <AlertTriangle className="h-4 w-4" />
            </div>
            <h3 className="font-semibold text-sm text-[#111827] dark:text-stone-100">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#9CA3AF] dark:text-stone-400 hover:text-[#111827] dark:hover:text-white transition-colors p-1 rounded -mr-1 -mt-1 cursor-pointer"
            disabled={loading}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-xs text-[#6B7280] dark:text-stone-300 leading-relaxed">{message}</p>

        <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#E5E7EB] dark:border-[#222836]">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-3.5 py-1.5 border border-[#D1D5DB] dark:border-[#2a3142] rounded-xl text-xs font-medium text-[#4B5563] dark:text-stone-300 hover:text-[#111827] dark:hover:text-white hover:bg-stone-50 dark:hover:bg-[#1c2232] transition-colors cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white transition-colors cursor-pointer ${
              isDestructive
                ? "bg-rose-600 hover:bg-rose-700"
                : "bg-[#111827] dark:bg-emerald-600 hover:bg-black dark:hover:bg-emerald-500"
            }`}
          >
            {loading ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
