// useIndividualAnalysisPolling.js
// Drop-in hook — call after successful form submission to poll for AI result

import { useEffect, useRef, useCallback } from "react";
import { useGetIndividualAnalysisQuery } from "@/redux/apis/individual.api";

const POLL_INTERVAL_MS = 5000;  // poll every 5 seconds
const MAX_WAIT_MS = 300000; // give up after 5 minutes

/**
 * Polls GET /api/individual/analysis until status = completed | failed.
 *
 * @param {boolean} enabled  — start polling only when true (set to true after form submit)
 * @param {function} onComplete  — called with full analysisResult when done
 * @param {function} onError     — called with error message string on failure
 */
export function useIndividualAnalysisPolling({ enabled, onComplete, onError }) {
    const startedAt = useRef(null);
    const intervalRef = useRef(null);

    const { data, refetch } = useGetIndividualAnalysisQuery(undefined, {
        skip: !enabled,
    });

    const status = data?.data?.analysisStatus;

    const stopPolling = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    useEffect(() => {
        if (!enabled) return;

        startedAt.current = Date.now();

        intervalRef.current = setInterval(async () => {
            // timeout guard
            if (Date.now() - startedAt.current > MAX_WAIT_MS) {
                stopPolling();
                onError?.("Analysis is taking too long. Please try again.");
                return;
            }

            try {
                const result = await refetch();
                const s = result?.data?.data?.analysisStatus;

                if (s === "completed") {
                    stopPolling();
                    onComplete?.(result.data.data);
                } else if (s === "failed") {
                    stopPolling();
                    onError?.(result?.data?.data?.analysisError || "Analysis failed. Please retry.");
                }
                // pending | processing → keep polling
            } catch {
                // network error — keep polling silently
            }
        }, POLL_INTERVAL_MS);

        return stopPolling;
    }, [enabled, refetch, onComplete, onError, stopPolling]);

    return { status };
}

/*
─── Usage in your parent component ─────────────────────────────────────────────

const [polling, setPolling] = useState(false)
const [result,  setResult]  = useState(null)

const { status } = useIndividualAnalysisPolling({
  enabled:    polling,
  onComplete: (data) => { setResult(data.analysisResult); setPolling(false) },
  onError:    (msg)  => { toast.error(msg);               setPolling(false) },
})

// after form submit succeeds:
onSubmitted = () => setPolling(true)

// show status:
// status === "pending"     → "Preparing your analysis…"
// status === "processing"  → "AI is building your brand report…"
// status === "completed"   → show result
// status === "failed"      → show retry button
─────────────────────────────────────────────────────────────────────────────────
*/