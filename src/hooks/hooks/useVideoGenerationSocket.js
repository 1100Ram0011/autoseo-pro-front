// hooks/useVideoGenerationSocket.js
// Listens to all video/image generation socket events emitted by the worker.
//
// Usage:
//   useVideoGenerationSocket(websiteHash, {
//     onStarted, onVideoItem, onImageStarted, onImageItem,
//     onSaving, onVideoItemSaved, onImageItemSaved, onCompleted, onFailed
//   })
//
// Pass websiteHash=null from library pages (hash filter is skipped; socket
// rooms are already user-scoped server-side so only your own events arrive).

import { useEffect, useRef } from "react";
import { getSocket } from "../services/socket.service";

export function useVideoGenerationSocket(websiteHash, handlers = {}) {
    // Keep handlers in a ref so stale closures are never an issue
    const handlersRef = useRef(handlers);
    const websiteHashRef = useRef(websiteHash);

    // Sync on every render (same pattern as useAnalysisSocket)
    useEffect(() => {
        handlersRef.current = handlers;
    });

    useEffect(() => {
        websiteHashRef.current = websiteHash;
    }, [websiteHash]);

    useEffect(() => {
        let socket = null;
        let boundHandlers = null;

        const tryAttach = () => {
            socket = getSocket();
            if (!socket) return false;

            // ─── Event map ──────────────────────────────────────────────────────────
            const EVENTS = {
                // Phase: video generation begins
                "video:generation:started": (p) =>
                    handlersRef.current.onStarted?.(p),

                // Per-video progress BEFORE generation: { websiteHash, current, total, label }
                "video:item:generating": (p) =>
                    handlersRef.current.onVideoItem?.(p),

                // Phase: image generation begins
                "image:generation:started": (p) =>
                    handlersRef.current.onImageStarted?.(p),

                // Per-image progress BEFORE generation: { websiteHash, current, total, label }
                "image:item:generating": (p) =>
                    handlersRef.current.onImageItem?.(p),

                // Phase: saving to DB begins
                "video:saving:started": (p) =>
                    handlersRef.current.onSaving?.(p),

                // ADDED: emitted by worker AFTER each createMediaDocument (video)
                // → library pages call refetch() here so the video card appears live
                "video:item:saved": (p) =>
                    handlersRef.current.onVideoItemSaved?.(p),

                // ADDED: emitted by worker AFTER each createMediaDocument (image)
                // → library pages call refetch() here so the image card appears live
                "image:item:saved": (p) =>
                    handlersRef.current.onImageItemSaved?.(p),

                // All done: { websiteHash, videoCount, imageCount }
                "video:generation:completed": (p) =>
                    handlersRef.current.onCompleted?.(p),

                // Failed: { websiteHash, error }
                "video:generation:failed": (p) =>
                    handlersRef.current.onFailed?.(p),
            };
            // ────────────────────────────────────────────────────────────────────────

            boundHandlers = Object.entries(EVENTS).map(([event, handler]) => {
                const fn = (payload) => {
                    // Filter events for a different websiteHash.
                    // When websiteHash is null the filter is skipped intentionally —
                    // library pages don't know the hash; server already scopes by user.
                    const currentHash = websiteHashRef.current;
                    if (currentHash && payload?.websiteHash !== currentHash) return;
                    handler(payload);
                };

                socket.on(event, fn);
                return [event, fn];
            });

            console.log("✅ Video generation socket listeners attached");
            return true;
        };

        // Try immediately; retry every 300 ms if socket isn't ready yet
        if (!tryAttach()) {
            const interval = setInterval(() => {
                if (tryAttach()) clearInterval(interval);
            }, 300);
            return () => clearInterval(interval);
        }

        // Re-bind on reconnect
        const reconnectHandler = () => {
            console.log("🔄 Rebinding video generation socket listeners");
            boundHandlers?.forEach(([event, fn]) => socket.off(event, fn));
            tryAttach();
        };

        socket.on("connect", reconnectHandler);

        return () => {
            boundHandlers?.forEach(([event, fn]) => socket.off(event, fn));
            socket?.off("connect", reconnectHandler);
        };
    }, []); // empty deps — handlers are kept fresh via ref
}