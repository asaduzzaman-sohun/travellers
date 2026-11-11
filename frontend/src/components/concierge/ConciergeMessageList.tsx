"use client";

import React from "react";
import Link from "next/link";
import {
  Bot,
  Calendar,
  Check,
  Copy,
  Hotel,
  MapPin,
  ShieldCheck,
  Sparkles,
  Tag,
  Ticket,
  UserCheck,
} from "lucide-react";
import { ChatMessageDto } from "@/lib/api";
import { useToast } from "@/lib/toast-context";

interface ConciergeMessageListProps {
  messages: ChatMessageDto[];
  botTyping: boolean;
  typingUser: string | null;
  compact?: boolean;
  onSelectFollowUp?: (prompt: string) => void;
}

function formatClockTime(isoString: string): string {
  const dt = new Date(isoString);
  return dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatShortDate(isoString?: string | null): string | null {
  if (!isoString) return null;
  return new Date(isoString).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function renderInlineFormatting(text: string): React.ReactNode[] {
  // Safely tokenize **bold** and `code` spans without HTML injection.
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={idx} className="font-semibold text-stone-950">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return (
        <code
          key={idx}
          className="px-1.5 py-0.5 rounded bg-stone-100 border border-stone-200 font-mono text-[11px] text-emerald-900"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}

function FormattedBotMessage({ content }: { content: string }) {
  const lines = content.split(/\r?\n/);

  return (
    <div className="space-y-1.5 text-[13px] leading-relaxed text-stone-800 wrap-anywhere">
      {lines.map((rawLine, idx) => {
        const line = rawLine.trim();
        if (!line) return <div key={idx} className="h-1" />;

        if (line.startsWith("- ") || line.startsWith("• ")) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-1">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-600" />
              <span className="min-w-0 flex-1">
                {renderInlineFormatting(line.slice(2))}
              </span>
            </div>
          );
        }

        return (
          <p key={idx} className="min-w-0">
            {renderInlineFormatting(line)}
          </p>
        );
      })}
    </div>
  );
}

export function ConciergeMessageList({
  messages,
  botTyping,
  typingUser,
  compact = false,
  onSelectFollowUp,
}: ConciergeMessageListProps) {
  const { toast } = useToast();
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null);

  const handleCopyPromo = (code: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(code);
    }
    setCopiedCode(code);
    toast.success("Promo Code Copied", `Use ${code} during booking checkout.`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-4">
      {messages.map((msg, index) => {
        const role = msg.senderRole?.toLowerCase();
        const isBot = role === "bot";
        const isAdmin = role === "admin" || role === "superadmin";
        const isTraveler = !isBot && !isAdmin;
        const isLatestMessage = index === messages.length - 1;
        const meta = msg.metadata;

        return (
          <div key={msg.id} className="space-y-2.5">
            <div
              className={`flex gap-2.5 ${
                isTraveler ? "justify-end" : "justify-start"
              }`}
            >
              {!isTraveler && (
                <div
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border shadow-2xs ${
                    isAdmin
                      ? "bg-amber-50 border-amber-200 text-amber-800"
                      : "bg-emerald-950 border-emerald-900 text-emerald-100"
                  }`}
                >
                  {isAdmin ? (
                    <ShieldCheck className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>
              )}

              <div
                className={`min-w-0 flex flex-col gap-1 ${
                  compact ? "max-w-[88%]" : "max-w-[85%] lg:max-w-[75%]"
                } ${isTraveler ? "items-end" : "items-start"}`}
              >
                <div className="flex items-center gap-2 text-[11px] text-stone-500 px-1">
                  <span className="font-semibold text-stone-700">
                    {isBot ? "TourFlow AI Concierge" : msg.senderName}
                  </span>
                  {isBot && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 border border-emerald-200">
                      <Sparkles className="h-2.5 w-2.5" />
                      {meta?.usedExternalLlm ? "AI + Live DB" : "Live DB Engine"}
                    </span>
                  )}
                  {isAdmin && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800 border border-amber-200">
                      <UserCheck className="h-2.5 w-2.5" />
                      Human Specialist
                    </span>
                  )}
                  <span>{formatClockTime(msg.createdAtUtc)}</span>
                </div>

                <div
                  className={`rounded-2xl px-4 py-3 shadow-2xs border ${
                    isTraveler
                      ? "bg-stone-900 text-white border-stone-900 rounded-br-sm"
                      : isAdmin
                        ? "bg-amber-50/70 text-stone-900 border-amber-200 rounded-bl-sm"
                        : "bg-white text-stone-800 border-[#E8E2D5] rounded-bl-sm"
                  }`}
                >
                  {isTraveler ? (
                    <p className="text-[13px] leading-relaxed whitespace-pre-wrap wrap-anywhere">
                      {msg.message}
                    </p>
                  ) : (
                    <FormattedBotMessage content={msg.message} />
                  )}
                </div>
              </div>
            </div>

            {/* Grounded interactive entity cards inside assistant replies */}
            {!isTraveler && meta && (
              <div className={`${compact ? "pl-0" : "pl-10"} space-y-2.5`}>
                {meta.bookings && meta.bookings.length > 0 && (
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {meta.bookings.map((bk) => (
                      <Link
                        key={bk.id}
                        href="/profile?tab=bookings"
                        className="min-w-0 flex flex-col justify-between rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 hover:bg-emerald-50 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-950 font-mono">
                            <Ticket className="h-3.5 w-3.5 text-emerald-700" />
                            {bk.bookingReference}
                          </span>
                          <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-emerald-800 border border-emerald-200">
                            {bk.paymentStatus}
                          </span>
                        </div>
                        <p className="mt-1.5 text-xs font-semibold text-stone-900 truncate">
                          {bk.tourTitle}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center justify-between gap-1 text-[11px] text-stone-600">
                          <span>Paid: BDT {bk.depositPaid.toLocaleString()}</span>
                          <span className="font-semibold text-stone-900">
                            Due: BDT {bk.balanceRemaining.toLocaleString()}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {meta.tours && meta.tours.length > 0 && (
                  <div
                    className={`grid grid-cols-1 gap-2 ${
                      compact ? "" : "sm:grid-cols-2 xl:grid-cols-3"
                    }`}
                  >
                    {meta.tours.map((t) => {
                      const nextDate = formatShortDate(t.nextStartDate);
                      return (
                        <Link
                          key={t.id}
                          href={`/tours/${t.slug}`}
                          className="group min-w-0 flex flex-col justify-between rounded-xl border border-[#EBE6DC] bg-white p-3 hover:border-stone-400 hover:shadow-sm transition-all"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center justify-between gap-2 text-[10px] font-semibold uppercase tracking-wider text-emerald-800">
                              <span className="inline-flex items-center gap-1 truncate">
                                <MapPin className="h-3 w-3 shrink-0" />
                                {t.destination}
                              </span>
                              <span className="shrink-0">
                                {t.durationDays}D/{t.durationNights}N
                              </span>
                            </div>
                            <h4 className="mt-1 text-xs font-semibold text-stone-950 group-hover:text-emerald-900 truncate">
                              {t.title}
                            </h4>
                          </div>
                          <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-stone-100 pt-2">
                            <span className="text-xs font-bold text-stone-950">
                              BDT {t.effectivePrice.toLocaleString()}
                            </span>
                            {nextDate ? (
                              <span className="inline-flex items-center gap-1 text-[10px] text-stone-500">
                                <Calendar className="h-3 w-3" />
                                {nextDate} ({t.nextAvailableSeats ?? 0} left)
                              </span>
                            ) : (
                              <span className="text-[10px] text-stone-500">
                                View Itinerary &rarr;
                              </span>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}

                {meta.hotels && meta.hotels.length > 0 && (
                  <div
                    className={`grid grid-cols-1 gap-2 ${
                      compact ? "" : "sm:grid-cols-2 xl:grid-cols-3"
                    }`}
                  >
                    {meta.hotels.map((h) => (
                      <Link
                        key={h.id}
                        href={
                          h.relatedTourSlug
                            ? `/tours/${h.relatedTourSlug}`
                            : "/hotels"
                        }
                        className="group min-w-0 flex flex-col justify-between rounded-xl border border-[#EBE6DC] bg-white p-3 hover:border-stone-400 hover:shadow-sm transition-all"
                      >
                        <div className="flex items-center justify-between gap-2 text-[10px] font-semibold text-stone-500">
                          <span className="inline-flex items-center gap-1 truncate">
                            <Hotel className="h-3 w-3 shrink-0 text-stone-700" />
                            {h.tier}
                          </span>
                          <span>&#9733; {h.rating.toFixed(1)}</span>
                        </div>
                        <p className="mt-1 text-xs font-semibold text-stone-950 truncate">
                          {h.name}
                        </p>
                        <div className="mt-1.5 flex items-center justify-between gap-2 text-[11px] text-stone-600">
                          <span className="truncate">{h.location}</span>
                          <span className="shrink-0 font-bold text-stone-900">
                            BDT {h.priceNumeric.toLocaleString()}/n
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {meta.promos && meta.promos.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {meta.promos.map((promo) => (
                      <button
                        key={promo.code}
                        type="button"
                        onClick={() => handleCopyPromo(promo.code)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50/70 px-2.5 py-1.5 text-[11px] font-medium text-emerald-950 hover:bg-emerald-100 transition-colors cursor-pointer"
                      >
                        <Tag className="h-3 w-3 text-emerald-700" />
                        <span className="font-mono font-bold">{promo.code}</span>
                        <span className="text-emerald-800">
                          &middot; {promo.discountLabel}
                        </span>
                        {copiedCode === promo.code ? (
                          <Check className="h-3 w-3 text-emerald-700" />
                        ) : (
                          <Copy className="h-3 w-3 text-emerald-600" />
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {isLatestMessage &&
                  meta.suggestedFollowUps &&
                  meta.suggestedFollowUps.length > 0 &&
                  onSelectFollowUp && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {meta.suggestedFollowUps.map((chip) => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => onSelectFollowUp(chip)}
                          className="rounded-full border border-[#E5DFD3] bg-[#FAF8F5] px-3 py-1 text-[11px] font-medium text-stone-700 hover:border-stone-400 hover:bg-white transition-colors cursor-pointer text-left"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  )}
              </div>
            )}
          </div>
        );
      })}

      {(botTyping || typingUser) && (
        <div className="flex items-center gap-2.5 text-xs text-stone-500 px-1 py-1">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-950 text-emerald-100">
            <Bot className="h-3.5 w-3.5 animate-pulse" />
          </div>
          <span className="italic">
            {botTyping
              ? "TourFlow AI Concierge is checking live tours, promos & schedules..."
              : `${typingUser} is typing...`}
          </span>
        </div>
      )}
    </div>
  );
}
