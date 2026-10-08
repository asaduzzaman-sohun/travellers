"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextType {
  toast: {
    success: (title: string, description?: string, duration?: number) => void;
    error: (title: string, description?: string, duration?: number) => void;
    info: (title: string, description?: string, duration?: number) => void;
    warning: (title: string, description?: string, duration?: number) => void;
  };
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (type: ToastType, title: string, description?: string, duration = 4000) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastItem = { id, type, title, description, duration };

      setToasts((prev) => [...prev.slice(-4), newToast]);

      if (duration > 0) {
        setTimeout(() => {
          dismiss(id);
        }, duration);
      }
    },
    [dismiss]
  );

  const toast = {
    success: (title: string, description?: string, duration?: number) =>
      addToast("success", title, description, duration),
    error: (title: string, description?: string, duration?: number) =>
      addToast("error", title, description, duration),
    info: (title: string, description?: string, duration?: number) =>
      addToast("info", title, description, duration),
    warning: (title: string, description?: string, duration?: number) =>
      addToast("warning", title, description, duration),
  };

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}

      {/* Floating Toast Container */}
      <div
        aria-live="polite"
        className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      >
        {toasts.map((item) => {
          const typeStyles = {
            success: {
              border: "border-emerald-200 bg-white/95 text-stone-900 shadow-emerald-500/5",
              icon: <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />,
            },
            error: {
              border: "border-rose-200 bg-white/95 text-stone-900 shadow-rose-500/5",
              icon: <AlertCircle className="h-4 w-4 text-rose-600 mt-0.5 shrink-0" />,
            },
            warning: {
              border: "border-amber-200 bg-white/95 text-stone-900 shadow-amber-500/5",
              icon: <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />,
            },
            info: {
              border: "border-stone-200 bg-white/95 text-stone-900 shadow-stone-500/5",
              icon: <Info className="h-4 w-4 text-stone-600 mt-0.5 shrink-0" />,
            },
          }[item.type];

          return (
            <div
              key={item.id}
              role="alert"
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg border shadow-lg backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 ${typeStyles.border}`}
            >
              {typeStyles.icon}
              <div className="flex-1 min-w-0 pr-1">
                <p className="text-xs font-semibold text-stone-900 leading-tight">
                  {item.title}
                </p>
                {item.description && (
                  <p className="text-[11px] text-stone-600 mt-1 leading-normal break-words">
                    {item.description}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismiss(item.id)}
                className="text-stone-400 hover:text-stone-700 p-0.5 rounded transition-colors -mr-1 -mt-0.5"
                aria-label="Dismiss toast"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
