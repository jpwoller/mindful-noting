import { useState, useRef, useCallback, useEffect } from "react";
import {
  Waypoint,
  getWaypointsForDuration,
  calculateWaypointSchedule,
  BINAURAL_MUSIC_URL,
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
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const waypointsRef = useRef<Waypoint[]>([]);
  const scheduleRef = useRef<number[]>([]);
  const nextWaypointIndexRef = useRef(0);
  const startTimeRef = useRef(0);
  const pausedElapsedRef = useRef(0);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startMusic = useCallback(() => {
    if (musicRef.current) {
      musicRef.current.pause();
      musicRef.current = null;
    }
    const music = new Audio(BINAURAL_MUSIC_URL);
    music.loop = true;
    music.volume = 0.35; // Keep it subtle behind the voice
    music.play().catch(() => {});
    musicRef.current = music;
  }, []);

  const stopMusic = useCallback(() => {
    if (musicRef.current) {
      // Fade out over 2 seconds
      const music = musicRef.current;
      const fadeInterval = setInterval(() => {
        if (music.volume > 0.02) {
          music.volume = Math.max(0, music.volume - 0.02);
        } else {
          clearInterval(fadeInterval);
          music.pause();
          music.currentTime = 0;
        }
      }, 100);
      musicRef.current = null;
    }
  }, []);

  const playWaypointAudio = useCallback((waypoint: Waypoint) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    // Duck the music volume while voice plays
    if (musicRef.current) {
      musicRef.current.volume = 0.15;
    }
    const audio = new Audio(waypoint.audioUrl);
    audio.volume = 1.0;
    audio.onended = () => {
      // Restore music volume after voice finishes
      if (musicRef.current) {
        musicRef.current.volume = 0.35;
      }
    };
    audio.play().catch(() => {});
    audioRef.current = audio;
    setCurrentWaypoint(waypoint);
    setCurrentWaypointIndex((prev) => prev); // don't trigger re-render here
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
    countdownIntervalRef.current = setInterval(() => {
      count -= 1;
      if (count <= 0) {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
        // Start the actual meditation
        setState("active");
        startTimeRef.current = Date.now();

        // Start background music
        startMusic();

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
            stopMusic();
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
        }, 250);
      } else {
        setCountdownValue(count);
      }
    }, 1000);
  }, [clearTimer, playWaypointAudio, startMusic, stopMusic]);

  const pause = useCallback(() => {
    if (state !== "active") return;
    clearTimer();
    pausedElapsedRef.current += (Date.now() - startTimeRef.current) / 1000;
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (musicRef.current) {
      musicRef.current.pause();
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
    if (musicRef.current) {
      musicRef.current.play().catch(() => {});
    }

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = pausedElapsedRef.current + (now - startTimeRef.current) / 1000;
      setElapsedSeconds(elapsed);

      if (elapsed >= totalDurationSeconds) {
        clearTimer();
        setState("complete");
        stopMusic();
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
  }, [state, totalDurationSeconds, clearTimer, playWaypointAudio, stopMusic]);

  const stop = useCallback(() => {
    clearTimer();
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    stopMusic();
    setState("idle");
    setElapsedSeconds(0);
    setCurrentWaypoint(null);
    setCurrentWaypointIndex(-1);
    pausedElapsedRef.current = 0;
  }, [clearTimer, stopMusic]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimer();
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (musicRef.current) {
        musicRef.current.pause();
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
