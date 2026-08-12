import { io } from "socket.io-client";

let socket = null;

/**
 * Map<event, Set<callbacks>>
 */
const listeners = new Map();

/* =======================================================
   CONNECT SOCKET
======================================================= */

export function connectSocket(token) {
    if (!token) {
        console.warn("⚠️ No token provided to connectSocket");
        return null;
    }

    // console.log('token', token)

    // If already exists, just update auth & reconnect if needed
    if (socket) {
        const oldToken = socket.auth?.token;
        socket.auth = { token };

        if (oldToken !== token || !socket.connected) {
            socket.disconnect().connect();
        }

        return socket;
    }

    const serverUrl = (process.env.NEXT_PUBLIC_API_URL.replace('/api', ''));

    socket = io(serverUrl, {
        auth: { token },
        transports: ["websocket"],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 10,
    });

    setupDefaultListeners();

    // console.log("🔌 Initializing Socket.IO connection...");

    return socket;
}



export const getSocket = () => {
    if (!socket) {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('accessToken')
            connectSocket(token)
        }
        return socket;
    }
    // console.log('socket in getSocket', socket)
    return socket;
};
/* =======================================================
   DEFAULT LIFECYCLE LISTENERS
======================================================= */

function setupDefaultListeners() {
    if (!socket) return;

    socket.on("connect", () => {
        // console.log("🟢 Socket connected:", socket.id);
    });

    socket.on("connected", (data) => {
        // console.log("📡 Server handshake:", data);
    });

    socket.on("disconnect", (reason) => {
        // console.log("🔴 Socket disconnected:", reason);
    });

    socket.on("connect_error", (error) => {
        console.error("❌ Connection error:", error.message);
    });

    socket.on("reconnect", (attempt) => {
        // console.log("🔄 Reconnected after", attempt, "attempts");
    });

    socket.on("reconnect_attempt", (attempt) => {
        // console.log("🔄 Reconnecting... Attempt", attempt);
    });

    socket.on("reconnect_error", (error) => {
        console.error("❌ Reconnection error:", error.message);
    });

    socket.on("reconnect_failed", () => {
        console.error("❌ Reconnection failed");
    });

    // Optional debug
    socket.onAny((event, payload) => {
        // console.log("📡 Raw Event:", event, payload);
        const data = { event, payload };
        return data;
    });
}

/* =======================================================
   DISCONNECT
======================================================= */

export function disconnectSocket() {
    if (!socket) return;

    removeAllListeners();
    socket.disconnect();
    socket = null;

    // console.log("👋 Socket disconnected and cleaned");
}

/* =======================================================
   CHAT ACTIONS
======================================================= */

export function joinChat(chatId) {
    if (!socket) return;

    const join = () => {
        socket.emit("join:chat", chatId);
        // console.log("📥 Joined chat:", chatId);
    };

    if (socket.connected) {
        join();
    } else {
        socket.once("connect", join);
    }
}

export function leaveChat(chatId) {
    if (!socket) return;

    const leave = () => {
        socket.emit("leave:chat", chatId);
        // console.log("📤 Left chat:", chatId);
    };

    if (socket.connected) {
        leave();
    } else {
        socket.once("connect", leave);
    }
}

export function startTyping(chatId) {
    socket?.emit("typing:start", { chatId });
}

export function stopTyping(chatId) {
    socket?.emit("typing:stop", { chatId });
}

/* =======================================================
   INTERNAL LISTENER SYSTEM (MULTI SAFE)
======================================================= */

function addListener(event, callback) {
    if (!socket) return;

    socket.on(event, callback);

    if (!listeners.has(event)) {
        listeners.set(event, new Set());
    }

    listeners.get(event).add(callback);
}

export function removeListener(event, callback) {
    if (!socket) return;

    socket.off(event, callback);

    const set = listeners.get(event);
    if (set) {
        set.delete(callback);
        if (set.size === 0) {
            listeners.delete(event);
        }
    }
}

export function removeAllListeners() {
    if (!socket) return;

    listeners.forEach((callbackSet, event) => {
        callbackSet.forEach((cb) => {
            socket.off(event, cb);
        });
    });

    listeners.clear();
    // console.log("🧹 All socket listeners removed");
}

/* =======================================================
   YOUR EXISTING API (UNCHANGED)
======================================================= */

export function onNewMessage(cb) {
    addListener("message:new", cb);
}

export function onMessageUpdate(cb) {
    addListener("message:update", cb);
}

export function onGenerationProgress(cb) {
    addListener("generation:progress", cb);
}

export function onGenerationComplete(cb) {
    addListener("generation:complete", cb);
}

export function onGenerationError(cb) {
    addListener("generation:error", cb);
}

export function onChatCreated(cb) {
    addListener("chat:created", cb);
}

export function onChatDeleted(cb) {
    addListener("chat:deleted", cb);
}

export function onUserTyping(cb) {
    addListener("user:typing", cb);
}

export function onUserStoppedTyping(cb) {
    addListener("user:stopped-typing", cb);
}

/* =======================================================
   UTILITIES
======================================================= */

export function isSocketConnected() {
    return !!socket?.connected;
}

export function getSocketId() {
    return socket?.id || null;
}

export function joinPostComments(
    postId
) {
    if (!socket) return;

    const join = () => {

        socket.emit(
            "join:post-comments",
            postId
        );

        // console.log(
        //     "📥 Joined post comments:",
        //     postId
        // );
    };

    if (socket.connected) {
        join();
    } else {
        socket.once("connect", join);
    }
}

export function leavePostComments(
    postId
) {
    if (!socket) return;

    const leave = () => {

        socket.emit(
            "leave:post-comments",
            postId
        );

        // console.log(
        //     "📤 Left post comments:",
        //     postId
        // );
    };

    if (socket.connected) {
        leave();
    } else {
        socket.once("connect", leave);
    }
}

export function onNewPostComment(
    cb
) {
    addListener(
        "post:comment:new",
        cb
    );
}

const joinedFeedPosts = new Set();

export function joinFeedPost(
    postId
) {

    if (!socket || !postId) return;

    const realPostId =
        String(postId).split("-inf-")[0];

    if (
        joinedFeedPosts.has(realPostId)
    ) {
        return;
    }

    const join = () => {

        socket.emit(
            "join:feed-post",
            realPostId
        );

        joinedFeedPosts.add(
            realPostId
        );

        // console.log(
        //     "📥 Joined feed post:",
        //     realPostId
        // );
    };

    if (socket.connected) {

        join();

    } else {

        socket.once(
            "connect",
            join
        );
    }
}

export function leaveFeedPost(
    postId
) {

    if (!socket || !postId) return;

    const realPostId =
        String(postId).split("-inf-")[0];

    if (
        !joinedFeedPosts.has(
            realPostId
        )
    ) {
        return;
    }

    const leave = () => {

        socket.emit(
            "leave:feed-post",
            realPostId
        );

        joinedFeedPosts.delete(
            realPostId
        );

        // console.log(
        //     "📤 Left feed post:",
        //     realPostId
        // );
    };

    if (socket.connected) {

        leave();

    } else {

        socket.once(
            "connect",
            leave
        );
    }
}

export function onPostLikeUpdate(
    cb
) {

    addListener(
        "post:like:update",
        cb
    );
}

export function onPostCommentsUpdate(
    cb
) {

    addListener(
        "post:comments:update",
        cb
    );
}

export function onWhatsAppStatus(
    cb
) {

    addListener(
        "whatsapp:status",
        cb
    );
}

