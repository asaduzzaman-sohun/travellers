"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  CalendarCheck2,
  CheckCheck,
  Megaphone,
  MessageSquare,
  Radio,
  Send,
  Star,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useSignalR } from "@/lib/signalr-context";
import { useToast } from "@/lib/toast-context";
import { sendAdminBroadcast } from "@/lib/api";

function formatRelativeTime(isoString: string): string {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const minutes = Math.max(0, Math.floor(diffMs / 60000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function getCategoryMeta(category: string) {
  switch (category.toLowerCase()) {
    case "booking":
      return {
        badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
        icon: <CalendarCheck2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />,
      };
    case "review":
      return {
        badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
        icon: <Star className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" aria-hidden="true" />,
      };
    case "chat":
      return {
        badge: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30",
        icon: <MessageSquare className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" aria-hidden="true" />,
      };
    case "announcement":
    default:
      return {
        badge: "bg-stone-500/10 text-stone-700 dark:text-stone-300 border-stone-500/30",
        icon: <Megaphone className="h-3.5 w-3.5 text-stone-700 dark:text-stone-300" aria-hidden="true" />,
      };
  }
}

export function NotificationBell({
  variant = "light",
}: {
  variant?: "light" | "dashboard";
}) {
  const router = useRouter();
  const panelId = useId();
  const containerRef = useRef<HTMLDivElement>(null);

  const { isLoggedIn, isAdmin, isSuperAdmin, token } = useAuth();
  const {
    status,
    notifications,
    unreadCount,
    markRead,
    markAllRead,
    openChat,
  } = useSignalR();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastTarget, setBroadcastTarget] = useState<"All" | "Admin">("All");
  const [sendingBroadcast, setSendingBroadcast] = useState(false);

  const canBroadcast = isAdmin || isSuperAdmin;

  useEffect(() => {
    if (!open) return;
    function handleOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  if (!isLoggedIn) return null;

  const statusColor =
    status === "connected"
      ? "bg-emerald-500"
      : status === "reconnecting" || status === "connecting"
        ? "bg-amber-400 animate-pulse"
        : "bg-stone-300";

  const triggerClasses =
    variant === "dashboard"
      ? "relative inline-flex items-center justify-center min-w-[40px] min-h-[40px] p-2 rounded-lg border border-[#E5E7EB] dark:border-[#2a3142] bg-white dark:bg-[#141720] text-[#4B5563] dark:text-stone-300 hover:text-[#111827] dark:hover:text-white hover:bg-[#F9FAFB] dark:hover:bg-[#1c2230] transition-colors cursor-pointer"
      : "relative inline-flex items-center justify-center min-w-[40px] min-h-[40px] h-10 w-10 rounded-full border border-[#EBE6DC] dark:border-[#262d3d] bg-white dark:bg-[#141720] text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white hover:bg-[#F5F2EB] dark:hover:bg-[#1c2230] transition-all cursor-pointer shadow-2xs";

  async function handleNotificationClick(
    id: string,
    isRead: boolean,
    actionUrl?: string | null
  ) {
    if (!isRead) {
      await markRead(id).catch(() => {});
    }
    setOpen(false);

    if (!actionUrl) return;
    if (actionUrl.startsWith("/concierge?session=")) {
      const targetSession = actionUrl.split("session=")[1]?.split("&")[0];
      if (targetSession) {
        openChat(targetSession);
        return;
      }
    }
    router.push(actionUrl);
  }

  async function handleSendBroadcast(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !broadcastTitle.trim() || !broadcastMessage.trim()) return;
    setSendingBroadcast(true);
    try {
      await sendAdminBroadcast(
        {
          title: broadcastTitle.trim(),
          message: broadcastMessage.trim(),
          category: "announcement",
          targetRole: broadcastTarget,
        },
        token
      );
      setBroadcastTitle("");
      setBroadcastMessage("");
      setComposerOpen(false);
      toast.success("Broadcast dispatched", "Real-time alert delivered via SignalR.");
    } catch (err) {
      toast.error(
        "Broadcast failed",
        err instanceof Error ? err.message : "Could not deliver announcement."
      );
    } finally {
      setSendingBroadcast(false);
    }
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={
          unreadCount > 0
            ? `Notifications (${unreadCount} unread)`
            : "Notifications"
        }
        aria-expanded={open}
        aria-controls={panelId}
        className={triggerClasses}
      >
        <Bell className="h-4 w-4 sm:h-[18px] sm:w-[18px]" aria-hidden="true" />
        <span
          className={`absolute top-1.5 right-1.5 h-2 w-2 rounded-full ring-2 ring-white ${statusColor}`}
          title={`SignalR status: ${status}`}
        />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          id={panelId}
          className="absolute right-0 mt-2.5 w-[min(calc(100vw-1.5rem),26rem)] sm:w-[420px] bg-white dark:bg-[#141720] border border-[#EBE6DC] dark:border-[#222836] rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-[#F0EBE1] dark:border-[#222836] bg-[#FAF8F5] dark:bg-[#0c0f16] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-bold text-sm text-stone-900 dark:text-stone-100 whitespace-nowrap">
                Live Notifications
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white dark:bg-[#141720] border border-[#E5DFD5] dark:border-[#262d3d] text-stone-600 dark:text-stone-300 shrink-0">
                <Radio
                  className={`h-2.5 w-2.5 ${status === "connected" ? "text-emerald-600 dark:text-emerald-400" : "text-amber-500"}`}
                  aria-hidden="true"
                />
                {status === "connected" ? "SignalR Live" : status}
              </span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => void markAllRead()}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white px-2 py-1 rounded-lg hover:bg-white dark:hover:bg-[#1a202c] transition-colors cursor-pointer"
                >
                  <CheckCheck className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Mark all read</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close notifications"
                className="p-1.5 rounded-lg text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-white dark:hover:bg-[#1a202c] transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Admin Quick Broadcast Composer */}
          {canBroadcast && (
            <div className="px-4 py-2.5 border-b border-[#F0EBE1] dark:border-[#222836] bg-stone-50/70 dark:bg-[#0f121a]">
              {!composerOpen ? (
                <button
                  type="button"
                  onClick={() => setComposerOpen(true)}
                  className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-stone-800 dark:text-stone-200 hover:text-stone-950 dark:hover:text-white bg-white/80 dark:bg-[#161a25] hover:bg-white dark:hover:bg-[#1c2232] border border-dashed border-[#DCD6CC] dark:border-[#2e3748] flex items-center justify-center gap-2 shadow-2xs transition-colors cursor-pointer"
                >
                  <Megaphone className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                  <span>Send Live SignalR Broadcast</span>
                </button>
              ) : (
                <form onSubmit={handleSendBroadcast} className="space-y-2 py-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-stone-700 dark:text-stone-300">
                      New Announcement
                    </span>
                    <div className="flex items-center gap-1">
                      <select
                        value={broadcastTarget}
                        onChange={(e) =>
                          setBroadcastTarget(e.target.value as "All" | "Admin")
                        }
                        aria-label="Broadcast audience"
                        className="text-[11px] px-2 py-1 rounded-md border border-[#E5DFD5] dark:border-[#2a3142] bg-white dark:bg-[#141720] text-stone-800 dark:text-stone-200"
                      >
                        <option value="All">All Travelers</option>
                        <option value="Admin">Admins Only</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => setComposerOpen(false)}
                        aria-label="Cancel broadcast"
                        className="p-1 text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={broadcastTitle}
                    onChange={(e) => setBroadcastTitle(e.target.value)}
                    placeholder="Headline (e.g. Flash Deal Live)"
                    maxLength={120}
                    required
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#E5DFD5] dark:border-[#2a3142] bg-white dark:bg-[#141720] text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                  <textarea
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    placeholder="Announcement details..."
                    rows={2}
                    maxLength={400}
                    required
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#E5DFD5] dark:border-[#2a3142] bg-white dark:bg-[#141720] text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 resize-none"
                  />
                  <button
                    type="submit"
                    disabled={sendingBroadcast}
                    className="w-full py-1.5 px-3 rounded-lg bg-stone-900 dark:bg-emerald-600 hover:bg-stone-800 dark:hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <Send className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{sendingBroadcast ? "Broadcasting..." : "Push Live Alert"}</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Notification Feed */}
          <div className="max-h-80 overflow-y-auto divide-y divide-[#F4EFE6] dark:divide-[#1e2434] bg-white dark:bg-[#141720]">
            {notifications.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <Bell
                  className="h-7 w-7 text-stone-300 dark:text-stone-600 mx-auto mb-2"
                  aria-hidden="true"
                />
                <p className="text-xs font-medium text-stone-600 dark:text-stone-400">
                  No notifications yet
                </p>
                <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-1">
                  Booking updates, concierge replies, and announcements appear here instantly.
                </p>
              </div>
            ) : (
              notifications.map((item) => {
                const meta = getCategoryMeta(item.category);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      void handleNotificationClick(
                        item.id,
                        item.isRead,
                        item.actionUrl
                      )
                    }
                    className={`w-full text-left px-4 py-3 transition-colors flex items-start gap-3 cursor-pointer ${
                      !item.isRead
                        ? "bg-amber-500/10 dark:bg-amber-500/15 hover:bg-amber-500/15 dark:hover:bg-amber-500/25"
                        : "bg-white dark:bg-[#141720] hover:bg-[#FAF8F5] dark:hover:bg-[#191e2b]"
                    }`}
                  >
                    <div
                      className={`h-8 w-8 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${meta.badge}`}
                    >
                      {meta.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={`text-xs leading-snug [overflow-wrap:anywhere] ${
                            !item.isRead
                              ? "font-bold text-stone-900 dark:text-amber-200"
                              : "font-semibold text-stone-700 dark:text-stone-200"
                          }`}
                        >
                          {item.title}
                        </p>
                        {!item.isRead && (
                          <span
                            className="h-2 w-2 rounded-full bg-rose-500 shrink-0 mt-1"
                            title="Unread"
                          />
                        )}
                      </div>
                      <p className="text-[11px] text-stone-600 dark:text-stone-300 mt-0.5 leading-relaxed [overflow-wrap:anywhere]">
                        {item.message}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-[10px] text-stone-400 dark:text-stone-500 font-medium">
                        <span className="capitalize">{item.category}</span>
                        <span>•</span>
                        <span>{formatRelativeTime(item.createdAtUtc)}</span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
