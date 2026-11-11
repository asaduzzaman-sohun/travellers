"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot,
  ExternalLink,
  Headphones,
  Lock,
  MessageSquarePlus,
  Send,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useSignalR } from "@/lib/signalr-context";
import { useToast } from "@/lib/toast-context";
import { ConciergeMessageList } from "@/components/concierge/ConciergeMessageList";

const QUICK_PROMPTS = [
  "Tours under 15,000 BDT",
  "Promo codes for 4 travelers",
  "Check my booking status",
];

export function LiveChatWidget() {
  const pathname = usePathname();
  const { user, isLoggedIn, openAuthModal } = useAuth();
  const {
    status,
    activeSession,
    messages,
    botTyping,
    typingUser,
    sendingMessage,
    chatOpen,
    unreadChatCount,
    setChatOpen,
    createNewSession,
    askConcierge,
    escalateSession,
    notifyTyping,
  } = useSignalR();
  const { toast } = useToast();

  const [draft, setDraft] = useState("");
  const [escalating, setEscalating] = useState(false);
  const listEndRef = useRef<HTMLDivElement>(null);
  const lastTypingSentRef = useRef<number>(0);

  // Hide compact drawer on the full-screen /concierge workspace to avoid duplicate UI.
  const isConciergePage = pathname?.startsWith("/concierge");

  useEffect(() => {
    if (chatOpen && !isConciergePage) {
      listEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length, chatOpen, botTyping, typingUser, isConciergePage]);

  if (isConciergePage) {
    return null;
  }

  async function handleSend(textOverride?: string) {
    const content = (textOverride ?? draft).trim();
    if (!content || sendingMessage || !isLoggedIn) return;

    if (!textOverride) setDraft("");
    notifyTyping(false);

    try {
      await askConcierge(content);
    } catch (err) {
      toast.error(
        "AI Concierge",
        err instanceof Error ? err.message : "Could not process message."
      );
    }
  }

  async function handleEscalate() {
    if (!activeSession || escalating) return;
    setEscalating(true);
    try {
      await escalateSession(activeSession.id);
      toast.success(
        "Human Specialist Alerted",
        "An administrator can now join your thread in real time."
      );
    } catch {
      toast.error("Escalation failed", "Please try again shortly.");
    } finally {
      setEscalating(false);
    }
  }

  const connectionBadgeColor =
    status === "connected"
      ? "bg-emerald-500"
      : status === "reconnecting" || status === "connecting"
        ? "bg-amber-400 animate-pulse"
        : "bg-stone-400";

  return (
    <>
      {!chatOpen && (
        <button
          type="button"
          onClick={() => setChatOpen(true)}
          aria-label="Open TourFlow AI Concierge"
          className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-40 inline-flex items-center gap-2.5 rounded-full bg-stone-900 px-4 py-3 text-xs font-semibold text-white shadow-xl hover:bg-stone-800 transition-all cursor-pointer border border-stone-700/80"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${connectionBadgeColor}`} />
          </span>
          <Bot className="h-4 w-4 text-emerald-300" />
          <span>AI Concierge</span>
          {unreadChatCount > 0 && (
            <span className="ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-500 px-1.5 text-[10px] font-bold text-stone-950">
              {unreadChatCount > 9 ? "9+" : unreadChatCount}
            </span>
          )}
        </button>
      )}

      {chatOpen && (
        <div
          role="dialog"
          aria-label="TourFlow AI Concierge Drawer"
          className="fixed bottom-16 right-3 left-3 sm:left-auto sm:right-6 sm:bottom-6 z-50 sm:w-[410px] h-[540px] max-h-[calc(100dvh-5rem)] rounded-2xl border border-[#DFD8CA] bg-white shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Drawer Header */}
          <div className="bg-stone-900 px-4 py-3 text-white flex items-center justify-between gap-2">
            <div className="min-w-0 flex items-center gap-2.5">
              <div className="h-8 w-8 shrink-0 rounded-xl bg-emerald-950 border border-emerald-700/60 flex items-center justify-center text-emerald-300">
                <Bot className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold tracking-tight truncate">
                    TourFlow AI Concierge
                  </span>
                  <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-stone-300">
                  <span className={`h-1.5 w-1.5 rounded-full ${connectionBadgeColor}`} />
                  <span>{isLoggedIn ? `Authorized · ${user?.email}` : "Sign-in required"}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Link
                href="/concierge"
                onClick={() => setChatOpen(false)}
                title="Open Full Workspace"
                className="rounded-lg p-1.5 text-stone-300 hover:bg-stone-800 hover:text-white transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
              {isLoggedIn && (
                <button
                  type="button"
                  onClick={() => void createNewSession()}
                  title="New Conversation"
                  className="rounded-lg p-1.5 text-stone-300 hover:bg-stone-800 hover:text-white transition-colors cursor-pointer"
                >
                  <MessageSquarePlus className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setChatOpen(false)}
                aria-label="Close concierge drawer"
                className="rounded-lg p-1.5 text-stone-300 hover:bg-stone-800 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {!isLoggedIn ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-[#FAF8F5] space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-white border border-[#EBE6DC] flex items-center justify-center text-stone-800 shadow-xs">
                <Lock className="h-5 w-5 text-emerald-800" />
              </div>
              <div className="space-y-1.5 max-w-xs">
                <h3 className="text-sm font-bold text-stone-950">
                  Authorized Travel Assistant
                </h3>
                <p className="text-xs leading-relaxed text-stone-600">
                  Sign in to unlock private AI conversations with live tour pricing,
                  promo calculation, and your own booking balances.
                </p>
              </div>
              <div className="flex flex-col w-full gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setChatOpen(false);
                    openAuthModal("login");
                  }}
                  className="w-full rounded-xl bg-stone-900 py-2.5 text-xs font-semibold text-white hover:bg-stone-800 transition-colors cursor-pointer"
                >
                  Sign In to Chat
                </button>
                <Link
                  href="/concierge"
                  onClick={() => setChatOpen(false)}
                  className="w-full rounded-xl border border-[#DFD8CA] bg-white py-2.5 text-xs font-semibold text-stone-800 hover:bg-stone-50 transition-colors"
                >
                  Learn About AI Concierge
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Action Sub-bar */}
              <div className="px-3.5 py-2 border-b border-[#EBE6DC] bg-[#FAF8F5] flex items-center justify-between gap-2 text-[11px]">
                <span className="truncate font-medium text-stone-700">
                  {activeSession?.title || "Active Thread"}
                </span>
                {activeSession && !activeSession.isEscalatedToHuman ? (
                  <button
                    type="button"
                    onClick={handleEscalate}
                    disabled={escalating}
                    className="shrink-0 inline-flex items-center gap-1 font-semibold text-emerald-900 hover:text-emerald-700 cursor-pointer"
                  >
                    <Headphones className="h-3 w-3" />
                    {escalating ? "Alerting..." : "Human Help"}
                  </button>
                ) : activeSession?.isEscalatedToHuman ? (
                  <span className="shrink-0 inline-flex items-center gap-1 font-semibold text-amber-700">
                    <Headphones className="h-3 w-3" /> Specialist Escalated
                  </span>
                ) : null}
              </div>

              {/* Message Feed */}
              <div className="flex-1 overflow-y-auto overscroll-contain [scrollbar-gutter:stable] p-3.5 bg-[#FAF8F5]">
                {messages.length === 0 ? (
                  <div className="space-y-3 py-4">
                    <div className="rounded-xl bg-white border border-[#EBE6DC] p-3.5 text-xs text-stone-700 space-y-1.5">
                      <p className="font-semibold text-stone-900 inline-flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-emerald-700" />
                        How can I help plan your journey?
                      </p>
                      <p className="text-stone-500">
                        Try a quick prompt or open the{" "}
                        <Link
                          href="/concierge"
                          onClick={() => setChatOpen(false)}
                          className="font-semibold text-emerald-900 underline"
                        >
                          Full AI Workspace
                        </Link>
                        .
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {QUICK_PROMPTS.map((q) => (
                        <button
                          key={q}
                          type="button"
                          onClick={() => void handleSend(q)}
                          className="rounded-full border border-[#DFD8CA] bg-white px-3 py-1.5 text-[11px] font-medium text-stone-800 hover:bg-stone-50 cursor-pointer"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <ConciergeMessageList
                    messages={messages}
                    botTyping={botTyping}
                    typingUser={typingUser}
                    compact
                    onSelectFollowUp={(chip) => void handleSend(chip)}
                  />
                )}
                <div ref={listEndRef} />
              </div>

              {/* Composer */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void handleSend();
                }}
                className="p-3 border-t border-[#EBE6DC] bg-white flex items-center gap-2"
              >
                <input
                  type="text"
                  value={draft}
                  onChange={(e) => {
                    setDraft(e.target.value);
                    const now = Date.now();
                    if (now - lastTypingSentRef.current > 1800) {
                      lastTypingSentRef.current = now;
                      notifyTyping(e.target.value.trim().length > 0);
                    }
                  }}
                  placeholder="Ask about tours, promos, hotels, bookings..."
                  maxLength={2000}
                  className="min-w-0 flex-1 rounded-xl border border-[#EBE6DC] bg-[#FAF8F5] px-3 py-2 text-xs text-stone-900 placeholder:text-stone-400 focus:border-stone-500 focus:bg-white focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={sendingMessage || !draft.trim()}
                  aria-label="Send message"
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-stone-900 text-white hover:bg-stone-800 disabled:opacity-40 transition-colors cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
}
