"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Bot,
  Headphones,
  Lock,
  Menu,
  MessageSquarePlus,
  Send,
  ShieldCheck,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useSignalR } from "@/lib/signalr-context";
import { useToast } from "@/lib/toast-context";
import { ConciergeMessageList } from "@/components/concierge/ConciergeMessageList";

const QUICK_STARTER_PROMPTS = [
  "Show curated Bangladesh tours under 15,000 BDT",
  "Calculate promo savings for 4 travelers in Sylhet",
  "Recommend verified eco resorts in Bandarban or Sajek",
  "Check my active bookings and remaining balance",
];

function formatRelativeDate(iso: string): string {
  const dt = new Date(iso);
  return dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function ConciergePage() {
  const { user, isLoggedIn, isLoading: authLoading, isAdmin, isSuperAdmin, openAuthModal } =
    useAuth();
  const {
    status,
    sessions,
    activeSessionId,
    activeSession,
    messages,
    botTyping,
    typingUser,
    sendingMessage,
    selectSession,
    createNewSession,
    askConcierge,
    escalateSession,
    replyToEscalatedSession,
    removeSession,
    notifyTyping,
  } = useSignalR();
  const { toast } = useToast();

  const [prompt, setPrompt] = useState("");
  const [creatingThread, setCreatingThread] = useState(false);
  const [escalating, setEscalating] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [specialistReplyMode, setSpecialistReplyMode] = useState(false);

  const listEndRef = useRef<HTMLDivElement>(null);
  const typingLastSentRef = useRef(0);

  const isStaff = isAdmin || isSuperAdmin;
  const isViewingCustomerEscalation =
    Boolean(
      isStaff &&
        activeSession &&
        user?.email &&
        activeSession.ownerEmail.toLowerCase() !== user.email.toLowerCase() &&
        activeSession.isEscalatedToHuman
    );

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, botTyping, typingUser]);

  const handleNewChat = async () => {
    if (creatingThread) return;
    setCreatingThread(true);
    try {
      await createNewSession();
      setMobileSidebarOpen(false);
    } catch (err) {
      toast.error(
        "Unable to start thread",
        err instanceof Error ? err.message : "Please try again."
      );
    } finally {
      setCreatingThread(false);
    }
  };

  const handleSend = async (textOverride?: string) => {
    const content = (textOverride ?? prompt).trim();
    if (!content || sendingMessage) return;

    if (!textOverride) setPrompt("");
    notifyTyping(false);

    try {
      if (isViewingCustomerEscalation && specialistReplyMode && activeSessionId) {
        await replyToEscalatedSession(activeSessionId, content);
      } else {
        await askConcierge(content);
      }
    } catch (err) {
      toast.error(
        "Concierge Error",
        err instanceof Error ? err.message : "Failed to process your request."
      );
    }
  };

  const handleEscalate = async () => {
    if (!activeSessionId || escalating) return;
    setEscalating(true);
    try {
      await escalateSession(activeSessionId);
      toast.success(
        "Specialist Notified",
        "An administrator has received a real-time alert for this conversation."
      );
    } catch (err) {
      toast.error(
        "Escalation Failed",
        err instanceof Error ? err.message : "Could not connect a specialist."
      );
    } finally {
      setEscalating(false);
    }
  };

  const handleDeleteThread = async (
    e: React.MouseEvent,
    sessionId: string
  ) => {
    e.stopPropagation();
    try {
      await removeSession(sessionId);
      toast.info("Conversation removed");
    } catch {
      toast.error("Delete failed", "Unable to delete conversation.");
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-[calc(100dvh-5rem)] flex items-center justify-center bg-[#FAF8F5]">
        <div className="flex items-center gap-3 text-sm text-stone-600">
          <Bot className="h-5 w-5 animate-pulse text-emerald-800" />
          Verifying authenticated concierge workspace...
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-[calc(100dvh-5rem)] bg-[#FAF8F5] flex items-center justify-center px-4 py-12">
        <div className="max-w-xl w-full rounded-3xl border border-[#E6DFD1] bg-white p-8 sm:p-10 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-emerald-950 text-emerald-100 flex items-center justify-center shadow-xs">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-emerald-800">
                <Lock className="h-3 w-3" /> Authorized Travel Assistant
              </span>
              <h1 className="font-serif text-2xl font-bold text-stone-950">
                TourFlow AI Concierge
              </h1>
            </div>
          </div>

          <p className="text-sm leading-relaxed text-stone-600">
            Sign in to launch private, persistent conversations grounded directly in
            live TourFlow schedules, verified Bangladesh resorts, group promo savings,
            and your own personal booking records.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-stone-700">
            <div className="rounded-xl bg-[#FAF8F5] border border-[#EBE6DC] p-3.5 space-y-1">
              <p className="font-semibold text-stone-900">Live Inventory Grounded</p>
              <p className="text-stone-600">
                Real departures, seat counts, promo math &amp; BDT rates.
              </p>
            </div>
            <div className="rounded-xl bg-[#FAF8F5] border border-[#EBE6DC] p-3.5 space-y-1">
              <p className="font-semibold text-stone-900">Strict Account Privacy</p>
              <p className="text-stone-600">
                JWT-secured threads &amp; isolated booking balance lookups.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              onClick={() => openAuthModal("login")}
              className="flex-1 min-w-[160px] rounded-full bg-stone-900 px-6 py-3 text-sm font-semibold text-white hover:bg-stone-800 transition-colors cursor-pointer"
            >
              Sign In to Continue
            </button>
            <button
              type="button"
              onClick={() => openAuthModal("register")}
              className="flex-1 min-w-[160px] rounded-full border border-[#DFD8CA] bg-white px-6 py-3 text-sm font-semibold text-stone-800 hover:bg-[#FAF8F5] transition-colors cursor-pointer"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  const sidebarContent = (
    <div className="flex h-full flex-col bg-white">
      <div className="p-4 border-b border-[#EBE6DC] flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={handleNewChat}
          disabled={creatingThread}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-stone-900 px-3.5 py-2.5 text-xs font-semibold text-white hover:bg-stone-800 disabled:opacity-60 transition-colors cursor-pointer"
        >
          <MessageSquarePlus className="h-4 w-4" />
          New AI Thread
        </button>
        <button
          type="button"
          onClick={() => setMobileSidebarOpen(false)}
          className="lg:hidden rounded-lg p-2 text-stone-500 hover:bg-stone-100 cursor-pointer"
          aria-label="Close sidebar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="px-4 py-2.5 border-b border-[#F2EDE2] flex items-center justify-between text-[11px] text-stone-600 bg-[#FAF8F5]">
        <span className="inline-flex items-center gap-1.5 font-medium">
          <span
            className={`h-2 w-2 rounded-full ${
              status === "connected"
                ? "bg-emerald-500"
                : status === "reconnecting" || status === "connecting"
                  ? "bg-amber-400 animate-pulse"
                  : "bg-stone-300"
            }`}
          />
          SignalR {status === "connected" ? "Live" : status}
        </span>
        <span className="font-semibold text-stone-800">{sessions.length} threads</span>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain [scrollbar-gutter:stable] p-2.5 space-y-1.5">
        {sessions.length === 0 ? (
          <div className="px-3 py-8 text-center text-xs text-stone-500">
            Start a new conversation to plan your next trip with live catalog pricing.
          </div>
        ) : (
          sessions.map((s) => {
            const isActive = s.id === activeSessionId;
            return (
              <div
                key={s.id}
                onClick={() => {
                  void selectSession(s.id);
                  setMobileSidebarOpen(false);
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    void selectSession(s.id);
                    setMobileSidebarOpen(false);
                  }
                }}
                className={`group flex items-start justify-between gap-2 rounded-xl px-3 py-2.5 text-left transition-all cursor-pointer border ${
                  isActive
                    ? "bg-[#FAF8F5] border-stone-300 shadow-2xs"
                    : "bg-white border-transparent hover:bg-stone-50"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-semibold text-stone-900 truncate">
                      {s.title}
                    </p>
                    {s.isEscalatedToHuman && (
                      <span className="shrink-0 rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-800">
                        Human
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[11px] text-stone-500 truncate">
                    {s.lastMessagePreview || "Click to open thread"}
                  </p>
                  <p className="mt-1 text-[10px] text-stone-400">
                    {formatRelativeDate(s.lastMessageAtUtc)} &middot;{" "}
                    {s.messageCount} msgs
                  </p>
                </div>

                <button
                  type="button"
                  onClick={(e) => handleDeleteThread(e, s.id)}
                  className="opacity-0 group-hover:opacity-100 rounded-md p-1 text-stone-400 hover:bg-stone-200 hover:text-rose-600 transition-all cursor-pointer"
                  aria-label="Delete thread"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <div className="h-[calc(100dvh-4.5rem)] bg-[#FAF8F5] flex overflow-hidden border-t border-[#EBE6DC]">
      {/* Desktop Conversation Sidebar */}
      <aside className="hidden lg:block w-72 shrink-0 border-r border-[#EBE6DC] h-full">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Sidebar */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative z-10 w-72 max-w-[85dvw] h-full shadow-xl">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Main Conversational Stage */}
      <section className="flex-1 min-w-0 flex flex-col h-full">
        {/* Workspace Header */}
        <header className="shrink-0 bg-white border-b border-[#EBE6DC] px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden inline-flex items-center justify-center rounded-lg border border-[#E5DFD3] p-2 text-stone-700 hover:bg-stone-50 cursor-pointer"
              aria-label="Open conversations"
            >
              <Menu className="h-4 w-4" />
            </button>

            <div className="h-9 w-9 shrink-0 rounded-xl bg-emerald-950 text-emerald-100 flex items-center justify-center">
              <Bot className="h-4.5 w-4.5" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-stone-950 truncate">
                  {activeSession?.title || "TourFlow AI Travel Concierge"}
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 border border-emerald-200">
                  <ShieldCheck className="h-3 w-3" /> Private Session
                </span>
              </div>
              <p className="text-[11px] text-stone-500 truncate">
                Signed in as {user?.email} &middot; Grounded in PostgreSQL tours, resorts &amp; promos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isViewingCustomerEscalation && (
              <button
                type="button"
                onClick={() => setSpecialistReplyMode((v) => !v)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold border transition-colors cursor-pointer ${
                  specialistReplyMode
                    ? "bg-amber-600 text-white border-amber-600"
                    : "bg-amber-50 text-amber-900 border-amber-200"
                }`}
              >
                <Headphones className="h-3.5 w-3.5" />
                {specialistReplyMode ? "Replying as Specialist" : "Reply as Admin"}
              </button>
            )}

            {activeSessionId && !activeSession?.isEscalatedToHuman && !isViewingCustomerEscalation && (
              <button
                type="button"
                onClick={handleEscalate}
                disabled={escalating}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#DFD8CA] bg-white px-3.5 py-1.5 text-xs font-semibold text-stone-800 hover:bg-[#FAF8F5] disabled:opacity-50 transition-colors cursor-pointer"
              >
                <Headphones className="h-3.5 w-3.5 text-emerald-800" />
                {escalating ? "Notifying Specialist..." : "Connect Human Specialist"}
              </button>
            )}

            {activeSession?.isEscalatedToHuman && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-semibold text-amber-800">
                <Headphones className="h-3.5 w-3.5" /> Specialist Joined
              </span>
            )}
          </div>
        </header>

        {/* Message History Container */}
        <div className="flex-1 overflow-y-auto overscroll-contain [scrollbar-gutter:stable] px-4 sm:px-6 py-5">
          <div className="mx-auto max-w-4xl">
            {messages.length === 0 ? (
              <div className="rounded-3xl border border-[#EBE6DC] bg-white p-6 sm:p-8 shadow-2xs space-y-5 my-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 shrink-0 rounded-2xl bg-emerald-950 text-emerald-100 flex items-center justify-center">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h2 className="font-serif text-xl font-bold text-stone-950">
                      Ask TourFlow AI Concierge
                    </h2>
                    <p className="text-xs leading-relaxed text-stone-600">
                      Ask about Bangladesh destinations, budget matching, active group promo codes,
                      verified hotels, packing checklists, or your own account bookings.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {QUICK_STARTER_PROMPTS.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => void handleSend(item)}
                      className="rounded-xl border border-[#EBE6DC] bg-[#FAF8F5] px-4 py-3 text-left text-xs font-medium text-stone-800 hover:border-stone-400 hover:bg-white transition-all cursor-pointer"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <ConciergeMessageList
                messages={messages}
                botTyping={botTyping}
                typingUser={typingUser}
                onSelectFollowUp={(chip) => void handleSend(chip)}
              />
            )}
            <div ref={listEndRef} />
          </div>
        </div>

        {/* Sticky Prompt Composer */}
        <footer className="shrink-0 bg-white border-t border-[#EBE6DC] px-4 sm:px-6 py-3.5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleSend();
            }}
            className="mx-auto max-w-4xl flex items-end gap-2.5"
          >
            <textarea
              rows={1}
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
                const now = Date.now();
                if (now - typingLastSentRef.current > 1800) {
                  typingLastSentRef.current = now;
                  notifyTyping(e.target.value.trim().length > 0);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void handleSend();
                }
              }}
              placeholder={
                isViewingCustomerEscalation && specialistReplyMode
                  ? `Reply directly as TourFlow Specialist to ${activeSession?.ownerName}...`
                  : "Ask about tours, budgets in BDT, promo discounts, hotels, or your bookings..."
              }
              maxLength={2000}
              className="min-w-0 flex-1 resize-none rounded-2xl border border-[#DFD8CA] bg-[#FAF8F5] px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-500 focus:bg-white focus:outline-none max-h-32"
            />
            <button
              type="submit"
              disabled={sendingMessage || !prompt.trim()}
              aria-label="Send prompt"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-stone-900 text-white hover:bg-stone-800 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </footer>
      </section>
    </div>
  );
}
