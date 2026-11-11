"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";
import * as signalR from "@microsoft/signalr";
import {
  API_ROOT,
  ChatMessageDto,
  ChatSessionDto,
  RealtimeNotificationDto,
  askChatbot,
  createChatSession,
  deleteChatSession,
  escalateChatSession,
  fetchChatSessions,
  fetchNotifications,
  fetchSessionMessages,
  markAllNotificationsRead,
  markNotificationRead,
  replyAsHumanSpecialist,
} from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";

export type SignalRConnectionStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "reconnecting";

interface TypingState {
  sessionId: string;
  userName: string;
  isBot: boolean;
  expiresAt: number;
}

interface SignalRContextValue {
  status: SignalRConnectionStatus;
  notifications: RealtimeNotificationDto[];
  unreadCount: number;
  sessions: ChatSessionDto[];
  activeSessionId: string | null;
  activeSession: ChatSessionDto | null;
  messages: ChatMessageDto[];
  typingUser: string | null;
  botTyping: boolean;
  sendingMessage: boolean;
  chatOpen: boolean;
  unreadChatCount: number;
  setChatOpen: (open: boolean) => void;
  openChat: (sessionId?: string) => void;
  selectSession: (sessionId: string) => Promise<void>;
  refreshSessions: () => Promise<ChatSessionDto[]>;
  refreshNotifications: () => Promise<void>;
  createNewSession: (initialMessage?: string) => Promise<ChatSessionDto | null>;
  askConcierge: (message: string) => Promise<void>;
  escalateSession: (sessionId?: string) => Promise<void>;
  replyToEscalatedSession: (sessionId: string, message: string) => Promise<void>;
  removeSession: (sessionId: string) => Promise<void>;
  notifyTyping: (isTyping: boolean) => void;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
}

const SignalRContext = createContext<SignalRContextValue | undefined>(undefined);

function mergeUniqueMessages(
  existing: ChatMessageDto[],
  incoming: ChatMessageDto[]
): ChatMessageDto[] {
  const byId = new Map<string, ChatMessageDto>();
  for (const item of existing) byId.set(item.id, item);
  for (const item of incoming) byId.set(item.id, item);
  return Array.from(byId.values())
    .sort(
      (a, b) =>
        new Date(a.createdAtUtc).getTime() - new Date(b.createdAtUtc).getTime()
    )
    .slice(-150);
}

export function SignalRProvider({ children }: { children: ReactNode }) {
  const { user, token, isLoggedIn, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const [status, setStatus] = useState<SignalRConnectionStatus>("disconnected");
  const [notifications, setNotifications] = useState<RealtimeNotificationDto[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [sessions, setSessions] = useState<ChatSessionDto[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messagesBySession, setMessagesBySession] = useState<Record<string, ChatMessageDto[]>>({});
  const [typingBySession, setTypingBySession] = useState<Record<string, TypingState | undefined>>({});
  const [sendingMessage, setSendingMessage] = useState(false);
  const [chatOpen, setChatOpenState] = useState(false);
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const tokenRef = useRef<string | null>(token);
  const userRef = useRef(user);
  const chatOpenRef = useRef(chatOpen);
  const activeSessionRef = useRef<string | null>(activeSessionId);
  const toastRef = useRef(toast);

  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    chatOpenRef.current = chatOpen;
  }, [chatOpen]);

  useEffect(() => {
    activeSessionRef.current = activeSessionId;
  }, [activeSessionId]);

  useEffect(() => {
    toastRef.current = toast;
  }, [toast]);

  const refreshNotifications = useCallback(async () => {
    if (!tokenRef.current) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      const feed = await fetchNotifications(tokenRef.current, 30);
      setNotifications(feed.notifications);
      setUnreadCount(feed.unreadCount);
    } catch {
      // Quietly handle transient network reload
    }
  }, []);

  const joinHubSession = useCallback(async (sessionId: string) => {
    const conn = connectionRef.current;
    if (conn && conn.state === signalR.HubConnectionState.Connected) {
      await conn.invoke("JoinSession", sessionId).catch(() => {});
    }
  }, []);

  const loadSessionHistory = useCallback(async (sessionId: string) => {
    if (!tokenRef.current) return;
    try {
      const history = await fetchSessionMessages(sessionId, tokenRef.current, 100);
      setMessagesBySession((prev) => ({
        ...prev,
        [sessionId]: mergeUniqueMessages([], history),
      }));
    } catch {
      // Retain existing cached turns on transient errors
    }
  }, []);

  const selectSession = useCallback(
    async (sessionId: string) => {
      if (!sessionId || !tokenRef.current) return;
      setActiveSessionId(sessionId);
      activeSessionRef.current = sessionId;
      await joinHubSession(sessionId);
      await loadSessionHistory(sessionId);
    },
    [joinHubSession, loadSessionHistory]
  );

  const refreshSessions = useCallback(async (): Promise<ChatSessionDto[]> => {
    if (!tokenRef.current) {
      setSessions([]);
      setActiveSessionId(null);
      return [];
    }

    try {
      const loaded = await fetchChatSessions(tokenRef.current);
      setSessions(loaded);

      const currentId = activeSessionRef.current;
      if (currentId && loaded.some((s) => s.id === currentId)) {
        return loaded;
      }

      if (loaded.length > 0) {
        await selectSession(loaded[0].id);
      } else {
        setActiveSessionId(null);
      }
      return loaded;
    } catch {
      return [];
    }
  }, [selectSession]);

  const createNewSession = useCallback(
    async (initialMessage?: string): Promise<ChatSessionDto | null> => {
      if (!tokenRef.current) return null;
      setSendingMessage(Boolean(initialMessage));
      try {
        const created = await createChatSession(
          tokenRef.current,
          initialMessage ? { initialMessage } : undefined
        );
        setSessions((prev) => [
          created,
          ...prev.filter((s) => s.id !== created.id),
        ]);
        await selectSession(created.id);
        return created;
      } finally {
        setSendingMessage(false);
      }
    },
    [selectSession]
  );

  const askConcierge = useCallback(
    async (message: string) => {
      const trimmed = message.trim();
      const currentToken = tokenRef.current;
      if (!trimmed || !currentToken) return;

      setSendingMessage(true);
      try {
        let targetSessionId = activeSessionRef.current;
        if (!targetSessionId) {
          const created = await createChatSession(currentToken, {
            initialMessage: trimmed,
          });
          setSessions((prev) => [
            created,
            ...prev.filter((s) => s.id !== created.id),
          ]);
          await selectSession(created.id);
          return;
        }

        const result = await askChatbot(targetSessionId, trimmed, currentToken);
        setSessions((prev) => {
          const others = prev.filter((s) => s.id !== result.session.id);
          return [result.session, ...others];
        });
        setMessagesBySession((prev) => ({
          ...prev,
          [targetSessionId!]: mergeUniqueMessages(
            prev[targetSessionId!] ?? [],
            [result.userMessage, result.assistantMessage]
          ),
        }));
      } finally {
        setSendingMessage(false);
      }
    },
    [selectSession]
  );

  const escalateSession = useCallback(async (sessionId?: string) => {
    const currentToken = tokenRef.current;
    const targetId = sessionId || activeSessionRef.current;
    if (!currentToken || !targetId) return;

    const updated = await escalateChatSession(targetId, currentToken);
    setSessions((prev) =>
      prev.map((s) => (s.id === updated.id ? updated : s))
    );
    await loadSessionHistory(targetId);
  }, [loadSessionHistory]);

  const replyToEscalatedSession = useCallback(
    async (sessionId: string, message: string) => {
      const currentToken = tokenRef.current;
      const trimmed = message.trim();
      if (!currentToken || !trimmed) return;

      setSendingMessage(true);
      try {
        const updated = await replyAsHumanSpecialist(
          sessionId,
          trimmed,
          currentToken
        );
        setSessions((prev) =>
          prev.map((s) => (s.id === updated.id ? updated : s))
        );
        await loadSessionHistory(sessionId);
      } finally {
        setSendingMessage(false);
      }
    },
    [loadSessionHistory]
  );

  const removeSession = useCallback(
    async (sessionId: string) => {
      const currentToken = tokenRef.current;
      if (!currentToken) return;

      await deleteChatSession(sessionId, currentToken);
      let nextSelected: string | null = null;
      setSessions((prev) => {
        const remaining = prev.filter((s) => s.id !== sessionId);
        nextSelected = remaining[0]?.id ?? null;
        return remaining;
      });
      setMessagesBySession((prev) => {
        const next = { ...prev };
        delete next[sessionId];
        return next;
      });
      if (activeSessionRef.current === sessionId) {
        if (nextSelected) {
          await selectSession(nextSelected);
        } else {
          setActiveSessionId(null);
        }
      }
    },
    [selectSession]
  );

  const setChatOpen = useCallback((open: boolean) => {
    setChatOpenState(open);
    if (open) setUnreadChatCount(0);
  }, []);

  const openChat = useCallback(
    (sessionId?: string) => {
      setChatOpenState(true);
      setUnreadChatCount(0);
      if (sessionId) {
        void selectSession(sessionId);
      }
    },
    [selectSession]
  );

  // Maintain SignalR hub ONLY when authenticated with a valid JWT token.
  useEffect(() => {
    if (authLoading) return;

    if (!isLoggedIn || !token) {
      setStatus("disconnected");
      setNotifications([]);
      setUnreadCount(0);
      setSessions([]);
      setActiveSessionId(null);
      setMessagesBySession({});
      return;
    }

    let disposed = false;
    let hub: signalR.HubConnection | null = null;
    let startPromise: Promise<void> | null = null;

    // Brief defer allows React Strict Mode's initial mount/unmount cycle to settle before negotiate.
    const connectTimer = setTimeout(() => {
      if (disposed) return;

      const hubLogger: signalR.ILogger = {
        log(logLevel, message) {
          if (disposed) return;
          if (logLevel >= signalR.LogLevel.Error) {
            console.warn(`[SignalR] ${message}`);
          }
        },
      };

      const conn = new signalR.HubConnectionBuilder()
        .withUrl(`${API_ROOT}/hubs/tourflow`, {
          accessTokenFactory: () => tokenRef.current ?? "",
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000, 20000])
        .configureLogging(hubLogger)
        .build();

      hub = conn;
      connectionRef.current = conn;

      conn.onreconnecting(() => {
        if (!disposed) setStatus("reconnecting");
      });

      conn.onreconnected(async () => {
        if (disposed) return;
        setStatus("connected");
        const activeId = activeSessionRef.current;
        if (activeId) {
          await conn.invoke("JoinSession", activeId).catch(() => {});
          await loadSessionHistory(activeId);
        }
        void refreshNotifications();
        void refreshSessions();
      });

      conn.onclose(() => {
        if (!disposed) setStatus("disconnected");
      });

      conn.on("ReceiveNotification", (incoming: RealtimeNotificationDto) => {
        if (disposed) return;
        setNotifications((prev) => {
          if (prev.some((n) => n.id === incoming.id)) return prev;
          return [incoming, ...prev].slice(0, 40);
        });
        setUnreadCount((c) => c + 1);

        const category = incoming.category?.toLowerCase();
        if (category === "booking" || category === "payment") {
          toastRef.current.success(incoming.title, incoming.message, 5500);
        } else if (category === "announcement") {
          toastRef.current.warning(incoming.title, incoming.message, 6000);
        } else {
          toastRef.current.info(incoming.title, incoming.message, 5000);
        }
      });

      conn.on("ReceiveChatMessage", (incoming: ChatMessageDto) => {
        if (disposed || !incoming.sessionId) return;
        const sId = incoming.sessionId;

        setMessagesBySession((prev) => ({
          ...prev,
          [sId]: mergeUniqueMessages(prev[sId] ?? [], [incoming]),
        }));

        setSessions((prev) =>
          prev.map((s) =>
            s.id === sId
              ? {
                  ...s,
                  lastMessageAtUtc: incoming.createdAtUtc,
                  lastMessagePreview: incoming.message.slice(0, 88),
                  messageCount: s.messageCount + 1,
                }
              : s
          )
        );

        const myEmail = userRef.current?.email?.trim().toLowerCase();
        const fromSelf =
          Boolean(myEmail) &&
          incoming.senderEmail?.trim().toLowerCase() === myEmail;
        if (!fromSelf && !chatOpenRef.current && activeSessionRef.current !== sId) {
          setUnreadChatCount((c) => c + 1);
        }
      });

      conn.on(
        "UserTyping",
        (payload: {
          sessionId?: string | null;
          roomId: string;
          userName: string;
          isTyping: boolean;
          isBot?: boolean;
        }) => {
          if (disposed) return;
          const sid =
            payload.sessionId ||
            (payload.roomId?.startsWith("session:")
              ? payload.roomId.slice(8)
              : "");
          if (!sid) return;

          setTypingBySession((prev) => ({
            ...prev,
            [sid]: payload.isTyping
              ? {
                  sessionId: sid,
                  userName: payload.userName,
                  isBot: Boolean(payload.isBot),
                  expiresAt: Date.now() + 8000,
                }
              : undefined,
          }));
        }
      );

      setStatus("connecting");
      startPromise = conn
        .start()
        .then(async () => {
          if (disposed) return;
          setStatus("connected");
          if (activeSessionRef.current) {
            await conn.invoke("JoinSession", activeSessionRef.current).catch(() => {});
          }
        })
        .catch(() => {
          if (!disposed) setStatus("disconnected");
        });

      void refreshNotifications();
      void refreshSessions();
    }, 60);

    return () => {
      disposed = true;
      clearTimeout(connectTimer);
      const activeConn = hub;
      if (connectionRef.current === activeConn) {
        connectionRef.current = null;
      }
      if (!activeConn) return;

      // Wait for negotiating start() to settle cleanly before calling stop().
      if (startPromise) {
        void startPromise.finally(() => {
          void activeConn.stop().catch(() => {});
        });
      } else {
        void activeConn.stop().catch(() => {});
      }
    };
  }, [
    authLoading,
    isLoggedIn,
    token,
    loadSessionHistory,
    refreshNotifications,
    refreshSessions,
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setTypingBySession((prev) => {
        let changed = false;
        const next: Record<string, TypingState | undefined> = {};
        for (const [sid, state] of Object.entries(prev)) {
          if (state && state.expiresAt > now) {
            next[sid] = state;
          } else if (state) {
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const notifyTyping = useCallback((isTyping: boolean) => {
    const conn = connectionRef.current;
    const sessionId = activeSessionRef.current;
    if (!conn || !sessionId || conn.state !== signalR.HubConnectionState.Connected) {
      return;
    }
    void conn.invoke("SendTyping", sessionId, isTyping).catch(() => {});
  }, []);

  const markRead = useCallback(async (id: string) => {
    if (!tokenRef.current) return;
    const res = await markNotificationRead(id, tokenRef.current);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount(res.unreadCount);
  }, []);

  const markAllRead = useCallback(async () => {
    if (!tokenRef.current) return;
    await markAllNotificationsRead(tokenRef.current);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  }, []);

  const activeSession =
    sessions.find((s) => s.id === activeSessionId) ?? null;
  const activeMessages = activeSessionId
    ? messagesBySession[activeSessionId] ?? []
    : [];
  const activeTypingState = activeSessionId
    ? typingBySession[activeSessionId]
    : undefined;
  const isTypingActive = Boolean(
    activeTypingState && activeTypingState.expiresAt > Date.now()
  );
  const botTyping =
    sendingMessage || (isTypingActive && Boolean(activeTypingState?.isBot));
  const typingUser =
    isTypingActive && !activeTypingState?.isBot
      ? activeTypingState?.userName ?? null
      : null;

  return (
    <SignalRContext.Provider
      value={{
        status,
        notifications,
        unreadCount,
        sessions,
        activeSessionId,
        activeSession,
        messages: activeMessages,
        typingUser,
        botTyping,
        sendingMessage,
        chatOpen,
        unreadChatCount,
        setChatOpen,
        openChat,
        selectSession,
        refreshSessions,
        refreshNotifications,
        createNewSession,
        askConcierge,
        escalateSession,
        replyToEscalatedSession,
        removeSession,
        notifyTyping,
        markRead,
        markAllRead,
      }}
    >
      {children}
    </SignalRContext.Provider>
  );
}

export function useSignalR() {
  const ctx = useContext(SignalRContext);
  if (!ctx) {
    throw new Error("useSignalR must be used within a SignalRProvider");
  }
  return ctx;
}
