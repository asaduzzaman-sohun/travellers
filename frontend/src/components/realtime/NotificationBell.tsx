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
        badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
        icon: <CalendarCheck2 className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />,
      };
    case "review":
      return {
        badge: "bg-amber-50 text-amber-700 border-amber-200",
        icon: <Star className="h-3.5 w-3.5 text-amber-600" aria-hidden="true" />,
      };
    case "chat":
      return {
        badge: "bg-sky-50 text-sky-700 border-sky-200",
        icon: <MessageSquare className="h-3.5 w-3.5 text-sky-600" aria-hidden="true" />,
      };
    case "announcement":
    default:
      return {
        badge: "bg-stone-100 text-stone-700 border-stone-200",
        icon: <Megaphone className="h-3.5 w-3.5 text-stone-700" aria-hidden="true" />,
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
      ? "relative inline-flex items-center justify-center min-w-[40px] min-h-[40px] p-2 rounded-lg border border-[#E5E7EB] bg-white text-[#4B5563] hover:text-[#111827] hover:bg-[#F9FAFB] transition-colors cursor-pointer"
      : "relative inline-flex items-center justify-center min-w-[40px] min-h-[40px] h-10 w-10 rounded-full border border-[#EBE6DC] bg-white text-stone-700 hover:text-stone-950 hover:bg-[#F5F2EB] transition-all cursor-pointer shadow-2xs";

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
          className="absolute right-0 mt-2.5 w-[min(calc(100vw-1.5rem),24rem)] bg-white border border-[#EBE6DC] rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-[#F0EBE1] bg-[#FAF8F5] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-semibold text-sm text-stone-900 truncate">
                Live Notifications
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white border border-[#E5DFD5] text-stone-600 shrink-0">
                <Radio
                  className={`h-2.5 w-2.5 ${status === "connected" ? "text-emerald-600" : "text-amber-500"}`}
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
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-700 hover:text-stone-950 px-2 py-1 rounded-lg hover:bg-white transition-colors cursor-pointer"
                >
                  <CheckCheck className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Mark all read</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close notifications"
                className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-white transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Admin Quick Broadcast Composer */}
          {canBroadcast && (
            <div className="px-4 py-2 border-b border-[#F0EBE1] bg-stone-50/70">
              {!composerOpen ? (
                <button
                  type="button"
                  onClick={() => setComposerOpen(true)}
                  className="w-full py-1.5 px-3 rounded-lg text-xs font-semibold text-stone-700 hover:text-stone-950 hover:bg-white border border-dashed border-[#DCD6CC] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Megaphone className="h-3.5 w-3.5 text-amber-600" aria-hidden="true" />
                  <span>Send Live SignalR Broadcast</span>
                </button>
              ) : (
                <form onSubmit={handleSendBroadcast} className="space-y-2 py-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-stone-700">
                      New Announcement
                    </span>
                    <div className="flex items-center gap-1">
                      <select
                        value={broadcastTarget}
                        onChange={(e) =>
                          setBroadcastTarget(e.target.value as "All" | "Admin")
                        }
                        aria-label="Broadcast audience"
                        className="text-[11px] px-2 py-1 rounded-md border border-[#E5DFD5] bg-white text-stone-800"
                      >
                        <option value="All">All Travelers</option>
                        <option value="Admin">Admins Only</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => setComposerOpen(false)}
                        aria-label="Cancel broadcast"
                        className="p-1 text-stone-500 hover:text-stone-800 cursor-pointer"
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
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#E5DFD5] bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-300"
                  />
                  <textarea
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    placeholder="Announcement details..."
                    rows={2}
                    maxLength={400}
                    required
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#E5DFD5] bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-300 resize-none"
                  />
                  <button
                    type="submit"
                    disabled={sendingBroadcast}
                    className="w-full py-1.5 px-3 rounded-lg bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{sendingBroadcast ? "Broadcasting..." : "Push Live Alert"}</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Notification Feed */}
          <div className="max-h-80 overflow-y-auto divide-y divide-[#F4EFE6]">
            {notifications.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <Bell
                  className="h-7 w-7 text-stone-300 mx-auto mb-2"
                  aria-hidden="true"
                />
                <p className="text-xs font-medium text-stone-600">
                  No notifications yet
                </p>
                <p className="text-[11px] text-stone-400 mt-1">
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
                    className={`w-full text-left px-4 py-3 hover:bg-[#FAF8F5] transition-colors flex items-start gap-3 cursor-pointer ${
                      !item.isRead ? "bg-amber-50/35" : "bg-white"
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
                              ? "font-bold text-stone-900"
                              : "font-semibold text-stone-700"
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
                      <p className="text-[11px] text-stone-600 mt-0.5 leading-relaxed [overflow-wrap:anywhere]">
                        {item.message}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-[10px] text-stone-400 font-medium">
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
