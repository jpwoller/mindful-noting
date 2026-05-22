import { useState, useRef, useCallback, useEffect } from "react";
import {
  Waypoint,
  getWaypointsForDuration,
  calculateWaypointSchedule,
} from "@/lib/meditation-data";

export type MeditationState = "idle" | "countdown" | "active" | "paused" | "complete";

interface MeditationTimerReturn {
  state: MeditationState;
  elapsedSeconds: number;
  totalDurationSeconds: number;
  currentWaypoint: Waypoint | null;
  currentWaypointIndex: number;
  totalWaypoints: number;
  progress: number; // 0 to 1
  countdownValue: number;
  start: (durationMinutes: number) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
}

export function useMeditationTimer(): MeditationTimerReturn {
  const [state, setState] = useState<MeditationState>("idle");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [totalDurationSeconds, setTotalDurationSeconds] = useState(0);
  const [currentWaypoint, setCurrentWaypoint] = useState<Waypoint | null>(null);
  const [currentWaypointIndex, setCurrentWaypointIndex] = useState(-1);
  const [countdownValue, setCountdownValue] = useState(3);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const waypointsRef = useRef<Waypoint[]>([]);
  const scheduleRef = useRef<number[]>([]);
  const nextWaypointIndexRef = useRef(0);
  const startTimeRef = useRef(0);
  const pausedElapsedRef = useRef(0);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const playWaypointAudio = useCallback((waypoint: Waypoint) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    const audio = new Audio(waypoint.audioUrl);
    audio.volume = 1.0;
    audio.play().catch(() => {
      // Audio play may fail if user hasn't interacted yet
    });
    audioRef.current = audio;
    setCurrentWaypoint(waypoint);
  }, []);

  const startSession = useCallback((durationMinutes: number) => {
    const totalSec = durationMinutes * 60;
    const sessionWaypoints = getWaypointsForDuration(durationMinutes);
    const schedule = calculateWaypointSchedule(sessionWaypoints, totalSec);

    waypointsRef.current = sessionWaypoints;
    scheduleRef.current = schedule;
    nextWaypointIndexRef.current = 0;
    setTotalDurationSeconds(totalSec);
    setElapsedSeconds(0);
    setCurrentWaypoint(null);
    setCurrentWaypointIndex(-1);
    pausedElapsedRef.current = 0;

    // Start countdown
    setState("countdown");
    setCountdownValue(3);

    let count = 3;
    const countdownInterval = setInterval(() => {
      count -= 1;
      if (count <= 0) {
        clearInterval(countdownInterval);
        // Start the actual meditation
        setState("active");
        startTimeRef.current = Date.now();

        // Play first waypoint immediately
        if (sessionWaypoints.length > 0) {
          playWaypointAudio(sessionWaypoints[0]);
          setCurrentWaypointIndex(0);
          nextWaypointIndexRef.current = 1;
        }

        // Start the timer
        intervalRef.current = setInterval(() => {
          const now = Date.now();
          const elapsed = pausedElapsedRef.current + (now - startTimeRef.current) / 1000;
          setElapsedSeconds(elapsed);

          // Check if session is complete
          if (elapsed >= totalSec) {
            clearTimer();
            setState("complete");
            if (audioRef.current) {
              audioRef.current.pause();
            }
            return;
          }

          // Check if next waypoint should play
          const nextIdx = nextWaypointIndexRef.current;
          if (nextIdx < schedule.length && elapsed >= schedule[nextIdx]) {
            playWaypointAudio(sessionWaypoints[nextIdx]);
            setCurrentWaypointIndex(nextIdx);
            nextWaypointIndexRef.current = nextIdx + 1;
          }
        }, 250); // Update 4 times per second for smooth progress
      } else {
        setCountdownValue(count);
      }
    }, 1000);
  }, [clearTimer, playWaypointAudio]);

  const pause = useCallback(() => {
    if (state !== "active") return;
    clearTimer();
    // Save elapsed time
    pausedElapsedRef.current += (Date.now() - startTimeRef.current) / 1000;
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setState("paused");
  }, [state, clearTimer]);

  const resume = useCallback(() => {
    if (state !== "paused") return;
    setState("active");
    startTimeRef.current = Date.now();

    if (audioRef.current) {
      audioRef.current.play().catch(() => {});
    }

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = pausedElapsedRef.current + (now - startTimeRef.current) / 1000;
      setElapsedSeconds(elapsed);

      if (elapsed >= totalDurationSeconds) {
        clearTimer();
        setState("complete");
        if (audioRef.current) {
          audioRef.current.pause();
        }
        return;
      }

      const nextIdx = nextWaypointIndexRef.current;
      if (nextIdx < scheduleRef.current.length && elapsed >= scheduleRef.current[nextIdx]) {
        playWaypointAudio(waypointsRef.current[nextIdx]);
        setCurrentWaypointIndex(nextIdx);
        nextWaypointIndexRef.current = nextIdx + 1;
      }
    }, 250);
  }, [state, totalDurationSeconds, clearTimer, playWaypointAudio]);

  const stop = useCallback(() => {
    clearTimer();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setState("idle");
    setElapsedSeconds(0);
    setCurrentWaypoint(null);
    setCurrentWaypointIndex(-1);
    pausedElapsedRef.current = 0;
  }, [clearTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimer();
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [clearTimer]);

  const progress = totalDurationSeconds > 0 ? Math.min(elapsedSeconds / totalDurationSeconds, 1) : 0;

  return {
    state,
    elapsedSeconds,
    totalDurationSeconds,
    currentWaypoint,
    currentWaypointIndex,
    totalWaypoints: waypointsRef.current.length,
    progress,
    countdownValue,
    start: startSession,
    pause,
    resume,
    stop,
  };
}
