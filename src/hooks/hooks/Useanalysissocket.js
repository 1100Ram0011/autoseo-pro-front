// import { useEffect, useRef } from "react";
// import { getSocket } from "../services/socket.service";

// export function useAnalysisSocket(websiteHash, handlers = {}) {
//     const handlersRef = useRef(handlers);
//     const websiteHashRef = useRef(websiteHash);

//     /* Keep latest handlers */
//     useEffect(() => {
//         handlersRef.current = handlers;
//     });

//     /* Keep latest websiteHash */
//     useEffect(() => {
//         websiteHashRef.current = websiteHash;
//     }, [websiteHash]);

//     useEffect(() => {
//         let socket = null;
//         let boundHandlers = null;

//         const tryAttach = () => {
//             socket = getSocket();
//             if (!socket) return false;

//             const EVENTS = {
//                 "analysis:progress:sync": (payload) =>
//                     handlersRef.current.onProgressSync?.(payload),

//                 "firecrawl:started": (payload) =>
//                     handlersRef.current.onFirecrawlStarted?.(payload),

//                 "firecrawl:completed": (payload) =>
//                     handlersRef.current.onFirecrawlCompleted?.(payload),

//                 "claude:started": (payload) =>
//                     handlersRef.current.onClaudeStarted?.(payload),

//                 "claude:completed": (payload) =>
//                     handlersRef.current.onClaudeCompleted?.(payload),

//                 "analysis:completed": (payload) =>
//                     handlersRef.current.onAnalysisCompleted?.(payload),

//                 "analysis:failed": (payload) =>
//                     handlersRef.current.onAnalysisFailed?.(payload),
//             };

//             boundHandlers = Object.entries(EVENTS).map(([event, handler]) => {
//                 const fn = (payload) => {
//                     // Normalize payload structure
//                     const normalized = payload?.data ?? payload;

//                     if (event !== "analysis:progress:sync") {
//                         const currentHash = websiteHashRef.current;

//                         if (currentHash && normalized?.websiteHash !== currentHash) {
//                             return;
//                         }
//                     }

//                     handler(normalized);
//                 };

//                 socket.on(event, fn);
//                 return [event, fn];
//             });

//             console.log("✅ Analysis socket listeners attached");

//             return true;
//         };

//         /* Try attach immediately */
//         if (!tryAttach()) {
//             const interval = setInterval(() => {
//                 if (tryAttach()) {
//                     clearInterval(interval);
//                 }
//             }, 300);

//             return () => clearInterval(interval);
//         }

//         /* Handle reconnect */
//         const reconnectHandler = () => {
//             console.log("🔄 Rebinding analysis socket listeners");

//             boundHandlers?.forEach(([event, fn]) => {
//                 socket.off(event, fn);
//             });

//             tryAttach();
//         };

//         socket.on("connect", reconnectHandler);

//         /* Debug socket events */
//         const debugFn = (event, payload) => {
//             console.log("📡 Raw Socket Event:", event, payload);
//         };

//         socket.onAny(debugFn);

//         /* Cleanup */
//         return () => {
//             boundHandlers?.forEach(([event, fn]) => {
//                 socket.off(event, fn);
//             });

//             socket?.off("connect", reconnectHandler);
//             socket?.offAny(debugFn);
//         };
//     }, []);
// }

import { useEffect, useRef, useCallback } from "react";
import toast from "react-hot-toast";
import { getSocket } from "../services/socket.service";

// ─────────────────────────────────────────────────────────────────────────────
// ERROR NORMALISER
// Converts every possible backend error shape into a consistent object:
//   { title: string, message: string, code?: string, recoverable: boolean }
//
// Backend shapes we handle:
//   { success: false, error: "...", details: "..." }   ← controller pattern
//   { success: false, message: "...", ... }             ← some 403 responses
//   { event: "analysis:failed", data: { error, stage, websiteHash } }
//   Plain string
// ─────────────────────────────────────────────────────────────────────────────
export function normaliseAnalysisError(payload) {
    if (!payload) {
        return {
            title: "Analysis failed",
            message: "An unknown error occurred. Please try again.",
            recoverable: true,
        };
    }

    // Already normalised (re-entry guard)
    if (payload.__normalised) return payload;

    const raw = payload?.data ?? payload;

    // Pull message from every known field
    const errorText =
        raw?.error ||
        raw?.details ||
        raw?.message ||
        (typeof raw === "string" ? raw : null);

    // Map known backend strings to friendly copy
    const message = friendlyMessage(errorText);

    // Decide if "Try again" makes sense
    const recoverable = isRecoverable(errorText);

    // Stage hint (e.g. "firecrawl", "claude", "scraper")
    const stage = raw?.stage ?? null;

    return {
        __normalised: true,
        title: stageTitle(stage),
        message,
        stage,
        code: raw?.code ?? null,
        recoverable,
    };
}

function friendlyMessage(raw) {
    if (!raw || typeof raw !== "string") {
        return "Something went wrong during analysis. Please try again.";
    }

    // Preserve predefined backend error messages with codes (e.g. Code: ANT-401)
    if (/Code:\s*[A-Z]+-\d+/i.test(raw) || /temporarily unavailable/i.test(raw)) {
        return raw;
    }

    // Auth / profile errors
    if (/unauthorized/i.test(raw)) return "Your session has expired. Please log in again.";
    if (/business profile/i.test(raw)) return "Please complete your business profile before running analysis.";
    if (/profile.*not found/i.test(raw)) return "Business profile not found. Please complete your profile first.";

    // Network / upstream
    if (/ECONNREFUSED|ENOTFOUND/i.test(raw)) return "Could not reach the analysis server. Please check your connection and try again.";
    if (/timeout|timed out/i.test(raw)) return "The analysis timed out. This usually means the website took too long to respond — please try again.";
    if (/rate.?limit|429|Too Many/i.test(raw)) return "The analysis service is temporarily rate-limited. Please wait a minute and try again.";
    if (/net::ERR_/i.test(raw)) return "A network error prevented the website from being crawled. Please try again.";

    // Crawl / content errors
    if (/could not crawl|failed to crawl|crawl.*failed/i.test(raw)) return "We couldn't crawl your website. Make sure it's publicly accessible and try again.";
    if (/no content|empty.*response|no.*text/i.test(raw)) return "Your website returned no readable content. Please check the URL and try again.";
    if (/invalid.*url|url.*invalid/i.test(raw)) return "The website URL appears to be invalid. Please double-check and try again.";

    // Claude / AI errors
    if (/claude.*failed|ai.*failed|analysis.*failed/i.test(raw)) return "The AI analysis step failed. Please try again — this is usually temporary.";
    if (/JSON.*parse|unexpected.*token/i.test(raw)) return "The analysis returned an unexpected response. Please try again.";

    // Quota / credits
    if (/insufficient.*credits|out of credits/i.test(raw)) return "You've run out of credits. Please purchase a plan to continue.";

    // Generic server error
    if (/500|internal server/i.test(raw)) return "A server error occurred during analysis. Please try again in a moment.";

    // Fallback: show raw but cap length
    return raw.length > 250 ? raw.slice(0, 247) + "…" : raw;
}

function stageTitle(stage) {
    const map = {
        firecrawl: "Website crawl failed",
        claude: "AI analysis failed",
        scraper: "Lead scan failed",
        saving: "Failed to save results",
    };
    return map[stage] ?? "Analysis failed";
}

function isRecoverable(raw) {
    if (!raw) return true;
    // Non-recoverable: auth / credits / permanent config issues
    if (/unauthorized|out of credits|insufficient.*credits|business profile/i.test(raw)) return false;
    return true;
}

// ─────────────────────────────────────────────────────────────────────────────
// HOOK
// ─────────────────────────────────────────────────────────────────────────────
export function useAnalysisSocket(websiteHash, handlers = {}) {
    const handlersRef = useRef(handlers);
    const websiteHashRef = useRef(websiteHash);
    const socketRef = useRef(null);
    const boundHandlersRef = useRef(null);

    console.log("websiteHash", websiteHash)
    // console.log("handlers", handlers)


    // Keep latest handlers and hash in refs (no re-binding on every render)
    useEffect(() => { handlersRef.current = handlers; });
    useEffect(() => { websiteHashRef.current = websiteHash; }, [websiteHash]);

    // Exposed helper so callers can manually report an error into the same channel
    const reportError = useCallback((rawPayload) => {
        const normalised = normaliseAnalysisError(rawPayload);
        handlersRef.current.onError?.(normalised);
    }, []);

    useEffect(() => {
        let retryInterval = null;

        // ── event → handler map ──────────────────────────────────────────────────
        const EVENTS = {
            "analysis:progress:sync": (payload) =>
                handlersRef.current.onProgressSync?.(payload),

            "firecrawl:started": (payload) =>
                handlersRef.current.onFirecrawlStarted?.(payload),

            "firecrawl:completed": (payload) =>
                handlersRef.current.onFirecrawlCompleted?.(payload),

            "claude:started": (payload) =>
                handlersRef.current.onClaudeStarted?.(payload),

            "claude:completed": (payload) =>
                handlersRef.current.onClaudeCompleted?.(payload),

            "analysis:completed": (payload) => {
                // Clear any stale error when a new completion arrives
                handlersRef.current.onError?.(null);
                handlersRef.current.onAnalysisCompleted?.(payload);
            },

            // ── error events — all normalised before reaching the component ────────
            "analysis:failed": (payload) => {
                const normalised = normaliseAnalysisError(payload);
                console.error("[useAnalysisSocket] analysis:failed →", normalised);
                if (normalised?.message) {
                    toast.error(normalised.message, { id: "analysis-error-toast" });
                }
                handlersRef.current.onError?.(normalised);
                handlersRef.current.onAnalysisFailed?.(normalised); // backward compat
            },

            // Firecrawl-level failure (if the backend emits this separately)
            "firecrawl:failed": (payload) => {
                const normalised = normaliseAnalysisError({ ...payload, stage: "firecrawl" });
                console.error("[useAnalysisSocket] firecrawl:failed →", normalised);
                if (normalised?.message) {
                    toast.error(normalised.message, { id: "analysis-error-toast" });
                }
                handlersRef.current.onError?.(normalised);
            },

            // Claude-level failure
            "claude:failed": (payload) => {
                const normalised = normaliseAnalysisError({ ...payload, stage: "claude" });
                console.error("[useAnalysisSocket] claude:failed →", normalised);
                if (normalised?.message) {
                    toast.error(normalised.message, { id: "analysis-error-toast" });
                }
                handlersRef.current.onError?.(normalised);
            },
        };

        // ── bind all listeners to socket ─────────────────────────────────────────
        const tryAttach = () => {
            const socket = getSocket();
            if (!socket) return false;

            socketRef.current = socket;

            // Tear down any previous listeners before rebinding
            if (boundHandlersRef.current) {
                boundHandlersRef.current.forEach(([event, fn]) => socket.off(event, fn));
            }

            boundHandlersRef.current = Object.entries(EVENTS).map(([event, handler]) => {
                const fn = (payload) => {
                    const normalized = payload?.data ?? payload;

                    // Hash filter — skip events that belong to a different analysis run.
                    // Skip for progress:sync because it carries no hash.
                    // if (event !== "analysis:progress:sync") {
                    // Skip for progress:sync because it carries no hash.
                    let currentHash = websiteHashRef.current;
                    const isErrorEvent = event.endsWith(":failed");
                    if (!isErrorEvent && currentHash && normalized?.websiteHash && normalized.websiteHash !== currentHash) {
                        return;
                    }

                    handler(normalized);
                };

                socket.on(event, fn);
                return [event, fn];
            });

            console.log("✅ Analysis socket listeners attached");
            return true;
        };

        // Retry until socket is ready
        if (!tryAttach()) {
            retryInterval = setInterval(() => {
                if (tryAttach()) clearInterval(retryInterval);
            }, 300);
        }

        // Rebind on reconnect
        const reconnectHandler = () => {
            console.log("🔄 Rebinding analysis socket listeners after reconnect");
            tryAttach();
            handlersRef.current.onReconnect?.();
        };

        const socket = getSocket();
        socket?.on("connect", reconnectHandler);

        // Detect silent disconnect and surface an error after 30 s if still offline
        const disconnectHandler = () => {
            console.warn("[useAnalysisSocket] Socket disconnected");
            handlersRef.current.onDisconnect?.();
        };
        socket?.on("disconnect", disconnectHandler);

        // Debug — remove in production
        const debugFn = (event, payload) => {
            if (process.env.NODE_ENV !== "production") {
                console.log("📡 Raw Socket Event:", event, payload);
            }
        };
        socket?.onAny(debugFn);

        return () => {
            clearInterval(retryInterval);
            const s = socketRef.current;
            if (!s) return;

            boundHandlersRef.current?.forEach(([event, fn]) => s.off(event, fn));
            s.off("connect", reconnectHandler);
            s.off("disconnect", disconnectHandler);
            s.offAny(debugFn);
        };
    }, []);

    return { reportError };
}