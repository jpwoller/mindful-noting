/**
 * Meditation View Component
 * Shows during active meditation: timer circle, current instruction, controls
 * Wabi-Sabi: organic timer, slow fades, generous space
 */

import { useState, useEffect } from "react";
import { MeditationState } from "@/hooks/useMeditationTimer";
import { Waypoint } from "@/lib/meditation-data";
import { Pause, Play, X } from "lucide-react";

interface MeditationViewProps {
  state: MeditationState;
  elapsedSeconds: number;
  totalDurationSeconds: number;
  currentWaypoint: Waypoint | null;
  currentWaypointIndex: number;
  totalWaypoints: number;
  progress: number;
  countdownValue: number;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function MeditationView({
  state,
  elapsedSeconds,
  totalDurationSeconds,
  currentWaypoint,
  progress,
  countdownValue,
  onPause,
  onResume,
  onStop,
}: MeditationViewProps) {
  const [showWaypoint, setShowWaypoint] = useState(false);
  const [displayedWaypoint, setDisplayedWaypoint] = useState<Waypoint | null>(null);

  // Animate waypoint text in/out
  useEffect(() => {
    if (currentWaypoint) {
      setDisplayedWaypoint(currentWaypoint);
      setShowWaypoint(true);

      // Hide after audio duration + 3 seconds
      const hideTimeout = setTimeout(() => {
        setShowWaypoint(false);
      }, (currentWaypoint.audioDuration + 3) * 1000);

      return () => clearTimeout(hideTimeout);
    }
  }, [currentWaypoint]);

  // Countdown view
  if (state === "countdown") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in-slow">
        <span
          className="text-8xl md:text-9xl font-light"
          style={{ fontFamily: '"Cormorant Garamond", serif', color: 'rgba(44, 42, 37, 0.5)' }}
        >
          {countdownValue}
        </span>
      </div>
    );
  }

  // SVG timer circle
  const size = 260;
  const strokeWidth = 1.5;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  const remainingSeconds = Math.max(0, totalDurationSeconds - elapsedSeconds);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 animate-fade-in-slow">
      {/* Timer circle */}
      <div className="relative">
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          {/* Background circle - very faint */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(44, 42, 37, 0.08)"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(44, 42, 37, 0.35)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-linear"
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {/* Breathing dot */}
          <div
            className="w-3 h-3 rounded-full animate-breathe mb-5"
            style={{ backgroundColor: 'rgba(44, 42, 37, 0.3)' }}
          />

          {/* Time remaining */}
          <span
            className="text-3xl md:text-4xl font-light tabular-nums"
            style={{ fontFamily: '"Cormorant Garamond", serif', color: 'rgba(44, 42, 37, 0.65)' }}
          >
            {formatTime(remainingSeconds)}
          </span>

          {/* Elapsed label */}
          <span
            className="text-xs mt-2 tracking-[0.25em]"
            style={{ color: '#9E9890' }}
          >
            remaining
          </span>
        </div>
      </div>

      {/* Waypoint instruction text */}
      <div className="h-28 flex items-center justify-center px-6 max-w-md">
        {showWaypoint && displayedWaypoint && (
          <p
            key={displayedWaypoint.id + "-" + Date.now()}
            className="text-center text-lg leading-relaxed animate-fade-in-slow"
            style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontStyle: 'italic',
              color: 'rgba(44, 42, 37, 0.6)',
            }}
          >
            {displayedWaypoint.text}
          </p>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-8 mt-2">
        {/* Stop button */}
        <button
          onClick={onStop}
          className="p-3 rounded-full transition-all duration-300 active:scale-95"
          style={{ color: 'rgba(44, 42, 37, 0.35)' }}
          aria-label="End meditation"
        >
          <X size={18} />
        </button>

        {/* Pause/Resume button */}
        {state === "active" ? (
          <button
            onClick={onPause}
            className="p-4 rounded-full transition-all duration-300 active:scale-95"
            style={{
              color: 'rgba(44, 42, 37, 0.55)',
              border: '1px solid rgba(44, 42, 37, 0.15)',
            }}
            aria-label="Pause"
          >
            <Pause size={22} />
          </button>
        ) : state === "paused" ? (
          <button
            onClick={onResume}
            className="p-4 rounded-full transition-all duration-300 active:scale-95"
            style={{
              color: 'rgba(44, 42, 37, 0.55)',
              border: '1px solid rgba(44, 42, 37, 0.15)',
            }}
            aria-label="Resume"
          >
            <Play size={22} />
          </button>
        ) : null}
      </div>

      {/* Paused indicator */}
      {state === "paused" && (
        <span
          className="text-xs tracking-[0.35em] uppercase animate-timer-pulse"
          style={{ color: '#9E9890' }}
        >
          paused
        </span>
      )}
    </div>
  );
}
