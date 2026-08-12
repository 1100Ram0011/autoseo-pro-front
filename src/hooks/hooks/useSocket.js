import { useEffect, useRef, useState } from "react";
import { connectSocket, getSocket } from "../services/socket.service";

let socketSingleton = null;

/**
 * Create socket ONCE (singleton)
 */
export function useSocket() {
    const socketRef = useRef(null);

    useEffect(() => {
        const token =
            localStorage.getItem("accessToken") ||
            localStorage.getItem("token");

        if (!token) return;

        if (!socketSingleton) {
            socketSingleton = connectSocket(token);
        }

        socketRef.current = socketSingleton;
    }, []);

    return socketRef.current;
}

/**
 * ✅ Correct event-binding hook
 * - Binds immediately (even before connect)
 * - Cleans up properly
 */
export const useSocketEvents = (handlers = {}) => {
    const socket = getSocket();
    const handlersRef = useRef(handlers);

    useEffect(() => {
        handlersRef.current = handlers;
    }, [handlers]);

    useEffect(() => {
        if (!socket) return;

        Object.entries(handlersRef.current).forEach(([event, handler]) => {
            if (typeof handler === "function") {
                socket.on(event, handler);
            }
        });

        return () => {
            Object.entries(handlersRef.current).forEach(([event, handler]) => {
                if (typeof handler === "function") {
                    socket.off(event, handler);
                }
            });
        };
    }, [socket]);
};



export const useChatSocket = (chatId, callbacks = {}) => {
    const socket = getSocket();
    const callbacksRef = useRef(callbacks);

    /* Keep latest callbacks without re-binding */
    useEffect(() => {
        callbacksRef.current = callbacks;
    }, [callbacks]);

    useEffect(() => {
        if (!socket || !chatId) return;

        const joinRoom = () => {
            socket.emit("join:chat", chatId);
        };

        // Join room immediately if connected, otherwise on connect
        if (socket.connected) {
            joinRoom();
        }
        
        // Re-join on socket reconnect
        socket.on("connect", joinRoom);

        // Wrap handlers to ensure they always call the latest callbacks
        const handlers = {
            "message:new": (data) => callbacksRef.current.onNewMessage?.(data),
            "message:update": (data) => callbacksRef.current.onMessageUpdate?.(data),
            "generation:progress": (data) => callbacksRef.current.onGenerationProgress?.(data),
            // Backend emits "generation:complete" but frontend used "completed"
            "generation:complete": (data) => callbacksRef.current.onGenerationComplete?.(data),
            "generation:completed": (data) => callbacksRef.current.onGenerationComplete?.(data),
            // Backend emits "generation:error" but frontend used "failed"
            "generation:error": (data) => callbacksRef.current.onGenerationError?.(data),
            "generation:failed": (data) => callbacksRef.current.onGenerationError?.(data),
            "typing:start": (data) => callbacksRef.current.onUserTyping?.(data),
            "typing:stop": (data) => callbacksRef.current.onUserStoppedTyping?.(data),
        };

        // Register listeners
        Object.entries(handlers).forEach(([event, handler]) => {
            socket.on(event, handler);
        });

        return () => {
            // We intentionally do NOT emit "leave:chat" so background generation events
            // keep flowing to the global listener even if we switch chats.
            socket.off("connect", joinRoom);

            Object.entries(handlers).forEach(([event, handler]) => {
                socket.off(event, handler);
            });
        };
    }, [socket, chatId]);

    return socket;
};


// ─── Lead socket hook ─────────────────────────────────────────────────────────
/**
 * Binds all lead:* events.
 *
 * PAYLOAD NORMALISATION
 * ─────────────────────
 * The worker publishes to Redis as:
 *   { userId, event: "lead:started", data: { percent, label, jobId, … } }
 *
 * The socket server subscribes to "socket:user" and should emit:
 *   socket.to(userId).emit("lead:started", { percent, label, jobId, … })
 *                                           ↑ this is `data` only
 *
 * However socket servers sometimes forward the full Redis blob OR wrap it
 * differently. We handle all three shapes defensively here so the frontend
 * never breaks regardless of how the server emits:
 *
 *   Shape A (correct):  socket emits  "lead:started",  { percent, label, … }
 *   Shape B (wrapped):  socket emits  "lead:started",  { event:"lead:started", data:{…} }
 *   Shape C (full blob):socket emits  "lead:started",  { userId, event:"lead:started", data:{…} }
 *
 * After normalisation, callbacks always receive plain { percent, label, … }.
 */

/**
 * Normalise a raw socket payload into plain event data.
 * @param {string} eventName  - the socket event name (e.g. "lead:started")
 * @param {*}      raw        - whatever the socket emitted as the argument
 * @returns {{ event: string, data: object }}
 */
function normaliseLeadPayload(eventName, raw) {
    if (!raw || typeof raw !== "object") {
        return { event: eventName, data: {} };
    }

    // Shape B / C — server forwarded { event, data, [userId] }
    if (raw.event && raw.data && typeof raw.data === "object") {
        return { event: raw.event, data: raw.data };
    }

    // Shape A — server emitted data directly (correct case)
    return { event: eventName, data: raw };
}

export const useSocketStatus = () => {
    const socket = getSocket();
    const [connected, setConnected] = useState(() => socket?.connected ?? false);

    useEffect(() => {
        if (!socket) return;

        // Sync immediately in case the socket connected before this hook ran
        setConnected(socket.connected);

        const onConnect = () => setConnected(true);
        const onDisconnect = () => setConnected(false);

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);

        return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
        };
    }, [socket]);

    return { connected };
};

export const useLeadSocket = (callbacks = {}) => {
    const socket = getSocket();
    const cbRef = useRef(callbacks);

    // Always keep ref in sync — never stale closures
    useEffect(() => {
        cbRef.current = callbacks;
    });

    useEffect(() => {
        if (!socket) return;

        // Map: socket event name → callback key
        const EVENT_CB_MAP = {
            "lead:started": "onStarted",
            "lead:progress": "onProgress",
            "lead:saving": "onSaving",
            "lead:completed": "onCompleted",
            "lead:needs_expansion": "onNeedsExpansion",
            "lead:failed": "onFailed",
        };

        // Build one stable wrapper per event that normalises the payload
        // before forwarding to the callback held in cbRef
        const handlers = {};
        Object.entries(EVENT_CB_MAP).forEach(([eventName, cbKey]) => {
            handlers[eventName] = (raw) => {
                const { event, data } = normaliseLeadPayload(eventName, raw);

                if (import.meta.env.DEV) {
                    console.log(
                        `%c[LEAD SOCKET] ${event}`,
                        "color:#4f9cf9;font-weight:bold",
                        data
                    );
                }

                cbRef.current[cbKey]?.(data);
            };
            socket.on(eventName, handlers[eventName]);
        });

        // Dev: catch any unhandled socket events for debugging
        const devCatchAll = (event, payload) => {
            if (import.meta.env.DEV && !EVENT_CB_MAP[event]) {
                console.log("%c[SOCKET onAny]", "color:#aaa", event, payload);
            }
        };
        socket.onAny(devCatchAll);

        return () => {
            Object.entries(handlers).forEach(([event, handler]) => {
                socket.off(event, handler);
            });
            socket.offAny(devCatchAll);
        };
    }, [socket]); // only rebind when socket instance itself changes
};
