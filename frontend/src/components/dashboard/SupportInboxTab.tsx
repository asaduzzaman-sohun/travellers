"use client";

import React, { useEffect, useState } from "react";
import {
  Headset,
  Loader2,
  MessageSquareText,
  RefreshCw,
  Send,
  ShieldAlert,
  UserCheck,
} from "lucide-react";
import { useSignalR } from "@/lib/signalr-context";
import { useToast } from "@/lib/toast-context";

export function SupportInboxTab() {
  const {
    status,
    sessions,
    activeSessionId,
    activeSession,
    messages,
    selectSession,
    refreshSessions,
    replyToEscalatedSession,
  } = useSignalR();
  const { toast } = useToast();

  const [filterMode, setFilterMode] = useState<"escalated" | "all">("escalated");
  const [replyText, setReplyText] = useState("");
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  const handleRefresh = async () => {
    try {
      setLoadingSessions(true);
      await refreshSessions();
    } catch (err) {
      toast.error(
        "Failed to refresh inbox",
        err instanceof Error ? err.message : "Try again in a moment."
      );
    } finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    void refreshSessions().catch(() => {});
  }, [refreshSessions]);

  const displayedSessions =
    filterMode === "escalated"
      ? sessions.filter((s) => s.isEscalatedToHuman)
      : sessions;

  useEffect(() => {
    if (!activeSessionId && displayedSessions.length > 0) {
      void selectSession(displayedSessions[0].id).catch(() => {});
    }
  }, [activeSessionId, displayedSessions, selectSession]);

  const handleSelectThread = async (sessionId: string) => {
    try {
      setLoadingMessages(true);
      await selectSession(sessionId);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSessionId || !replyText.trim()) return;

    try {
      setSending(true);
      await replyToEscalatedSession(replyText.trim(), activeSessionId);
      setReplyText("");
      toast.success("Reply Sent", "Traveler notified in real time.");
    } catch (err) {
      toast.error(
        "Reply Failed",
        err instanceof Error ? err.message : "Could not send specialist reply."
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-stone-950 flex items-center gap-2">
            <Headset className="h-5 w-5 text-emerald-700" />
            <span>Escalated Support Inbox</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Live specialist desk for AI Concierge sessions handed off to human support ({status}).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-xl border border-[#E5DFD3] bg-white p-1">
            <button
              type="button"
              onClick={() => setFilterMode("escalated")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                filterMode === "escalated"
                  ? "bg-stone-900 text-white"
                  : "text-stone-600 hover:text-stone-950"
              }`}
            >
              Escalated ({sessions.filter((s) => s.isEscalatedToHuman).length})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                filterMode === "all"
                  ? "bg-stone-900 text-white"
                  : "text-stone-600 hover:text-stone-950"
              }`}
            >
              All ({sessions.length})
            </button>
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            className="p-2 rounded-xl border border-[#E5DFD3] bg-white text-stone-600 hover:text-stone-950 transition-colors cursor-pointer"
            title="Refresh inbox"
          >
            <RefreshCw className={`h-4 w-4 ${loadingSessions ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-[540px]">
        {/* Session Queue */}
        <div className="rounded-2xl border border-[#E5DFD3] bg-white overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-stone-100 bg-[#FAF8F5] text-xs font-semibold text-stone-700">
            Traveler Threads ({displayedSessions.length})
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-stone-100">
            {displayedSessions.map((s) => {
              const selected = s.id === activeSessionId;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleSelectThread(s.id)}
                  className={`w-full text-left px-4 py-3.5 transition-colors cursor-pointer ${
                    selected ? "bg-emerald-50/70" : "hover:bg-stone-50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-stone-950 truncate">
                      {s.ownerName}
                    </span>
                    {s.isEscalatedToHuman && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-semibold text-amber-800 shrink-0">
                        <ShieldAlert className="h-2.5 w-2.5" />
                        Escalated
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-stone-500 truncate mt-0.5">
                    {s.ownerEmail}
                  </p>
                  <p className="text-xs text-stone-700 truncate mt-1.5 font-medium">
                    {s.lastMessagePreview || s.title}
                  </p>
                </button>
              );
            })}

            {!loadingSessions && displayedSessions.length === 0 && (
              <div className="p-8 text-center space-y-2">
                <MessageSquareText className="h-7 w-7 text-stone-300 mx-auto" />
                <p className="text-xs font-semibold text-stone-900">Queue Clear</p>
                <p className="text-[11px] text-stone-500">
                  No escalated traveler chats waiting right now.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Active Conversation Pane */}
        <div className="lg:col-span-2 rounded-2xl border border-[#E5DFD3] bg-white overflow-hidden flex flex-col">
          {activeSession ? (
            <>
              <div className="px-5 py-3.5 border-b border-stone-100 bg-[#FAF8F5] flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-stone-950">{activeSession.title}</h3>
                  <p className="text-[11px] text-stone-500">
                    Traveler: {activeSession.ownerName} ({activeSession.ownerEmail})
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                  <UserCheck className="h-3 w-3" />
                  Live Specialist Room
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-3 max-h-[400px] bg-[#FDFBF7]">
                {loadingMessages ? (
                  <div className="py-12 flex justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-stone-400" />
                  </div>
                ) : (
                  messages.map((m) => {
                    const isSpecialist =
                      m.senderRole === "Admin" || m.senderRole === "SuperAdmin";
                    const isTraveler = m.senderRole === "Traveler";
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${
                          isSpecialist ? "items-end" : "items-start"
                        }`}
                      >
                        <span className="text-[10px] font-semibold text-stone-500 mb-1">
                          {m.senderName} ({m.senderRole})
                        </span>
                        <div
                          className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed border ${
                            isSpecialist
                              ? "bg-stone-900 text-white border-stone-900"
                              : isTraveler
                                ? "bg-amber-50 text-stone-900 border-amber-200"
                                : "bg-white text-stone-800 border-[#E5DFD3]"
                          }`}
                        >
                          {m.message}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <form
                onSubmit={handleSendReply}
                className="p-3.5 border-t border-stone-100 bg-white flex items-center gap-2"
              >
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write an official specialist reply to this traveler..."
                  className="flex-1 rounded-xl border border-[#DDD6C8] bg-[#FAF8F5] px-3.5 py-2 text-xs text-stone-950 focus:outline-none focus:border-stone-900"
                />
                <button
                  type="submit"
                  disabled={sending || !replyText.trim()}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-stone-900 px-4 py-2 text-xs font-semibold text-white hover:bg-black transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{sending ? "Sending..." : "Reply"}</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-10 text-center text-stone-500">
              <Headset className="h-8 w-8 text-stone-300 mb-2" />
              <p className="text-sm font-semibold text-stone-900">Select a Conversation</p>
              <p className="text-xs mt-1">
                Pick an escalated traveler session on the left to inspect transcripts and respond live.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
