"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';
import { API_BASE } from '@/lib/apiConfig';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';
const USER_ID = '1'; // Simple userId — no auth in auto-seo-pro for now

export interface LeadProgressState {
  active: boolean;
  event: string;
  percent: number;
  label: string;
  error: string | null;
  inserted?: number;
  totalInDb?: number;
  targetMarket?: string;
  geographicFocus?: string;
}

const IDLE: LeadProgressState = {
  active: false,
  event: 'idle',
  percent: 0,
  label: '',
  error: null,
};

const TERMINAL_EVENTS = ['lead:completed', 'lead:failed', 'lead:needs_expansion'];

// Module-level so navigation doesn't reset banner
let moduleProgress: LeadProgressState = IDLE;
let moduleListeners: Array<(p: LeadProgressState) => void> = [];

function broadcastProgress(p: LeadProgressState) {
  moduleProgress = p;
  moduleListeners.forEach((fn) => fn(p));
}

export function useLeadProgress(onComplete?: () => void) {
  const [progress, setProgress] = useState<LeadProgressState>(moduleProgress);
  const socketRef = useRef<Socket | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isPollingRef = useRef(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [isPolling, setIsPolling] = useState(false);

  // Subscribe to module-level progress updates
  useEffect(() => {
    const listener = (p: LeadProgressState) => setProgress(p);
    moduleListeners.push(listener);
    return () => {
      moduleListeners = moduleListeners.filter((l) => l !== listener);
    };
  }, []);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    isPollingRef.current = false;
    setIsPolling(false);
  }, []);

  const startPolling = useCallback(() => {
    if (isPollingRef.current) return;
    isPollingRef.current = true;
    setIsPolling(true);

    pollingRef.current = setInterval(async () => {
      try {
        const res = await axios.get(`${API_BASE}/leads/map/progress?userId=${USER_ID}`);
        const data = res.data?.data;
        if (!data) return;

        const p: LeadProgressState = {
          active: !TERMINAL_EVENTS.includes(data.event),
          event: data.event,
          percent: data.data?.percent ?? 0,
          label: data.data?.label ?? '',
          error: data.data?.error ?? null,
          inserted: data.data?.inserted,
          totalInDb: data.data?.totalInDb,
          targetMarket: data.data?.targetMarket,
          geographicFocus: data.data?.geographicFocus,
        };

        broadcastProgress(p);

        if (TERMINAL_EVENTS.includes(data.event)) {
          stopPolling();
          if (data.event === 'lead:completed' && onComplete) onComplete();
        }
      } catch {
        // Ignore poll errors
      }
    }, 2500);
  }, [onComplete, stopPolling]);

  // Handle a lead event from socket or poll
  const handleLeadEvent = useCallback(
    (event: string, data: any) => {
      const p: LeadProgressState = {
        active: !TERMINAL_EVENTS.includes(event),
        event,
        percent: data?.percent ?? 0,
        label: data?.label ?? '',
        error: data?.error ?? null,
        inserted: data?.inserted,
        totalInDb: data?.totalInDb,
        targetMarket: data?.targetMarket,
        geographicFocus: data?.geographicFocus,
      };
      broadcastProgress(p);

      if (event === 'lead:completed' && onComplete) {
        onComplete();
      }
    },
    [onComplete]
  );

  // Connect socket
  useEffect(() => {
    const socket = io(SOCKET_URL, {
      query: { userId: USER_ID },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setSocketConnected(true);
      stopPolling();
    });

    socket.on('disconnect', () => {
      setSocketConnected(false);
      // If a job was active, fall back to polling
      if (moduleProgress.active) {
        startPolling();
      }
    });

    const LEAD_EVENTS = [
      'lead:started',
      'lead:progress',
      'lead:saving',
      'lead:completed',
      'lead:failed',
      'lead:needs_expansion',
    ];

    LEAD_EVENTS.forEach((event) => {
      socket.on(event, (data: any) => {
        stopPolling();
        handleLeadEvent(event, data);
      });
    });

    // On mount, check Redis for any in-flight job
    (async () => {
      try {
        const res = await axios.get(`${API_BASE}/leads/map/progress?userId=${USER_ID}`);
        const data = res.data?.data;
        if (data && data.event && data.event !== 'idle') {
          const isTerminal = TERMINAL_EVENTS.includes(data.event);
          const p: LeadProgressState = {
            active: !isTerminal,
            event: data.event,
            percent: data.data?.percent ?? 0,
            label: data.data?.label ?? '',
            error: data.data?.error ?? null,
            inserted: data.data?.inserted,
            totalInDb: data.data?.totalInDb,
          };
          broadcastProgress(p);
          if (!isTerminal) startPolling();
        }
      } catch {
        // No in-flight job
      }
    })();

    return () => {
      socket.disconnect();
      stopPolling();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dismissProgress = useCallback(() => {
    broadcastProgress(IDLE);
  }, []);

  return { progress, socketConnected, isPolling, startPolling, dismissProgress };
}
