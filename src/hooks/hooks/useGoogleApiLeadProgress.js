/**
 * useLeadProgress.js
 *
 * Single source of truth for lead generation progress.
 * Extracted from BusinessLeads.jsx to keep the component clean.
 *
 * Responsibilities:
 *  1. Maintain jobProgress state (idle → started → progress → saving → completed/failed)
 *  2. Subscribe to lead:* socket events via useLeadSocket
 *  3. Fall back to polling (/api/leads/progress) when socket is disconnected
 *  4. On page refresh, restore an in-flight job from Redis via the progress endpoint
 *  5. Persist progress in a module-level variable so navigation doesn't reset the banner
 *
 * Exports:
 *  - jobProgress  — current progress state object
 *  - isJobActive  — true while job is running
 *  - socketConnected — live socket status
 *  - isPolling    — true while polling fallback is running
 *  - startJob(formData) — call when the API mutation succeeds
 *  - failJob(msg)       — call on API mutation error
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useLeadSocket, useSocketStatus } from "./useSocket";
import toast from "react-hot-toast";
import { useLazyGetLeadProgressQuery } from "@/redux/apis/googleLeads.api";

// ─── Module-level persistence (survives component re-mounts / navigation) ─────
let _savedProgress = null;

// ─── Initial state factory ────────────────────────────────────────────────────
const IDLE_STATE = () => ({
    status: "idle",   // idle | started | progress | saving | completed | failed
    percent: 0,
    label: "",
    error: null,
    form: null,     // { targetMarket, geographicFocus, NumberOfLeads }
});



// ─── Map event name → status string ──────────────────────────────────────────
function eventToStatus(event) {
    switch (event) {
        case "lead:started": return "started";
        case "lead:progress": return "progress";
        case "lead:saving": return "saving";
        case "lead:completed": return "completed";
        case "lead:needs_expansion": return "needs_expansion";
        case "lead:failed": return "failed";
        default: return "progress";
    }
}

// ─── Active statuses ──────────────────────────────────────────────────────────
const ACTIVE_STATUSES = new Set(["started", "progress", "saving", "needs_expansion"]);
const TERMINAL_EVENTS = new Set(["lead:completed", "lead:needs_expansion", "lead:failed"]);

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useLeadProgress({ userId, onComplete }) {
    const [getLeadProgress] = useLazyGetLeadProgressQuery();

    const fetchProgress = useCallback(async () => {
        try {
            const json = await getLeadProgress().unwrap();
            if (json?.data?.event && json?.data?.data) {
                return { event: json.data.event, data: json.data.data };
            }
            if (json?.event && json?.data) {
                return { event: json.event, data: json.data };
            }
            if (json?.data?.event) {
                const { event, ...rest } = json.data;
                return { event, data: rest };
            }
            return null;
        } catch {
            return null;
        }
    }, [getLeadProgress]);

    const [jobProgress, setJobProgress] = useState(
        () => _savedProgress ?? IDLE_STATE()
    );

    const { connected: socketConnected } = useSocketStatus();
    const [isPolling, setIsPolling] = useState(false);

    // Refs to avoid stale closures in intervals / timeouts
    const pollingRef = useRef(null);
    const lastPercentRef = useRef(0);
    const lastEventTimeRef = useRef(0);

    // ── Keep module-level cache in sync ──────────────────────────────────────
    useEffect(() => {
        _savedProgress = jobProgress.status !== "idle" ? jobProgress : null;
    }, [jobProgress]);

    const isJobActive = ACTIVE_STATUSES.has(jobProgress.status);

    // ── Core event applier ────────────────────────────────────────────────────
    const applyEvent = useCallback((event, data, source = "?") => {
        const now = Date.now();
        const newPct = data?.percent ?? 0;
        const timeDelta = now - lastEventTimeRef.current;

        // Debounce: skip if same event arrives within 400 ms AND percent barely moved
        if (timeDelta < 400 && Math.abs(newPct - lastPercentRef.current) < 2) {
            if (import.meta.env.DEV) {
                console.log(`[PROGRESS:${source}] Debounced:`, event, newPct);
            }
            return;
        }

        lastEventTimeRef.current = now;

        setJobProgress(prev => {
            // Never regress percent for non-terminal events
            if (
                newPct < prev.percent &&
                !TERMINAL_EVENTS.has(event)
            ) {
                return prev;
            }

            lastPercentRef.current = newPct;

            switch (event) {
                case "lead:started":
                    return {
                        ...prev,
                        status: "started",
                        percent: Math.max(newPct, prev.percent, 5),
                        label: data?.label ?? "Starting…",
                        error: null,
                    };

                case "lead:progress":
                    return {
                        ...prev,
                        status: "progress",
                        percent: Math.max(newPct, prev.percent),
                        label: data?.label ?? prev.label,
                    };

                case "lead:saving":
                    return {
                        ...prev,
                        status: "saving",
                        percent: Math.max(newPct, prev.percent, 80),
                        label: data?.label ?? "Saving leads…",
                    };

                case "lead:completed":
                    toast.success(`${data?.inserted} Lead generation completed`, { id: "generate-lead-success", duration: 5000 });
                    return {
                        ...prev,
                        status: "completed",
                        percent: 100,
                        label: data?.label ?? "Done",
                        error: null,
                    };

                case "lead:needs_expansion":
                    toast("Need to expand search radius", { id: "generate-lead-expansion", duration: 5000, icon: '📍' });
                    return {
                        ...prev,
                        status: "needs_expansion",
                        percent: 100,
                        label: data?.label ?? "Needs Expansion",
                        error: null,
                        foundCount: data?.foundCount,
                        neededCount: data?.neededCount,
                        form: {
                            ...prev.form,
                            targetMarket: data?.targetMarket || prev.form?.targetMarket,
                            geographicFocus: data?.geographicFocus || prev.form?.geographicFocus,
                            numberOfLeads: data?.numberOfLeads || prev.form?.numberOfLeads,
                        }
                    };

                case "lead:failed":
                    toast.error(data?.error ?? "Lead generation failed", { id: "generate-lead-error", duration: 5000 });
                    return {
                        ...prev,
                        status: "failed",
                        percent: prev.percent,
                        label: data?.label ?? "Lead generation failed",
                        error: data?.error ?? "Something went wrong",
                    };

                default:
                    return prev;
            }
        });

        // Side-effects for terminal events
        if (event === "lead:completed") {
            stopPolling();
            onComplete?.();          // caller triggers refetch
            setTimeout(() => {
                setJobProgress(IDLE_STATE());
                _savedProgress = null;
                lastPercentRef.current = 0;
            }, 3000);
        }

        if (event === "lead:failed") {
            stopPolling();
            setTimeout(() => {
                setJobProgress(IDLE_STATE());
                _savedProgress = null;
                lastPercentRef.current = 0;
            }, 6000);
        }

        if (event === "lead:needs_expansion") {
            stopPolling();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [onComplete]);   // stopPolling captured below — stable ref pattern

    // ── Polling ───────────────────────────────────────────────────────────────
    const stopPolling = useCallback(() => {
        if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
            setIsPolling(false);
        }
    }, []);

    const startPolling = useCallback(() => {
        if (pollingRef.current) return; // already running

        setIsPolling(true);

        pollingRef.current = setInterval(async () => {
            const result = await fetchProgress();
            if (result?.event) {
                applyEvent(result.event, result.data, "POLL");
            }
        }, 3000);
    }, [applyEvent]);

    // ── Socket event handlers (passed to useLeadSocket) ───────────────────────
    // These are declared as stable callbacks; useLeadSocket uses a ref internally.
    const handleStarted = useCallback((d) => applyEvent("lead:started", d, "SOCKET"), [applyEvent]);
    const handleProgress = useCallback((d) => applyEvent("lead:progress", d, "SOCKET"), [applyEvent]);
    const handleSaving = useCallback((d) => applyEvent("lead:saving", d, "SOCKET"), [applyEvent]);
    const handleCompleted = useCallback((d) => applyEvent("lead:completed", d, "SOCKET"), [applyEvent]);
    const handleNeedsExpansion = useCallback((d) => applyEvent("lead:needs_expansion", d, "SOCKET"), [applyEvent]);
    const handleFailed = useCallback((d) => applyEvent("lead:failed", d, "SOCKET"), [applyEvent]);

    useLeadSocket({
        onStarted: handleStarted,
        onProgress: handleProgress,
        onSaving: handleSaving,
        onCompleted: handleCompleted,
        onNeedsExpansion: handleNeedsExpansion,
        onFailed: handleFailed,
    });

    // ── Auto polling: start when job active + socket down; stop when reconnected ─
    useEffect(() => {
        if (isJobActive && !socketConnected && !pollingRef.current) {
            startPolling();
        } else if (socketConnected && pollingRef.current) {
            stopPolling();
        }
    }, [isJobActive, socketConnected, startPolling, stopPolling]);

    // ── Page-refresh restore: check Redis for an in-flight job ────────────────
    useEffect(() => {
        if (!userId) return;

        let cancelled = false;

        (async () => {
            const result = await fetchProgress();
            if (cancelled || !result?.event) return;

            const { event, data } = result;

            if (ACTIVE_STATUSES.has(eventToStatus(event))) {
                // Restore banner with whatever data Redis has
                setJobProgress(prev => ({
                    ...prev,
                    status: eventToStatus(event),
                    percent: data?.percent ?? 10,
                    label: data?.label ?? "Resuming…",
                    error: null,
                    foundCount: data?.foundCount,
                    neededCount: data?.neededCount,
                    form: prev.form ?? {
                        targetMarket: data?.targetMarket ?? "Lead Generation",
                        geographicFocus: data?.geographicFocus ?? "",
                        NumberOfLeads: data?.numberOfLeads ?? 10,
                    },
                }));
                startPolling();
            }
        })();

        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);  // run once on mount

    // ── Cleanup on unmount ────────────────────────────────────────────────────
    useEffect(() => () => stopPolling(), [stopPolling]);

    // ── Public API to start / fail a job from the component ──────────────────
    const startJob = useCallback((formData) => {
        lastPercentRef.current = 0;
        setJobProgress({
            status: "started",
            percent: 5,
            label: "Queuing lead generation…",
            error: null,
            form: formData,
        });
    }, []);

    const failJob = useCallback((errorMsg) => {
        setJobProgress(prev => ({
            ...prev,
            status: "failed",
            percent: 0,
            label: "Failed",
            error: errorMsg ?? "Error generating leads",
        }));
        stopPolling();
        setTimeout(() => {
            setJobProgress(IDLE_STATE());
            _savedProgress = null;
        }, 6000);
    }, [stopPolling]);

    const clearJob = useCallback(() => {
        setJobProgress(IDLE_STATE());
        _savedProgress = null;
        stopPolling();
    }, [stopPolling]);

    return {
        jobProgress,
        isJobActive,
        socketConnected,
        isPolling,
        startJob,
        failJob,
        clearJob,
    };
}