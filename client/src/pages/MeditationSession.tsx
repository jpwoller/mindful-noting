/**
 * Meditation Session Page
 * Full-screen immersive meditation experience.
 * Redirects back to home when session ends or is stopped.
 */

import { useEffect } from "react";
import { useLocation } from "wouter";
import { MeditationView } from "@/components/MeditationView";
import { CompletionView } from "@/components/CompletionView";
import { useMeditationTimer } from "@/hooks/useMeditationTimer";

const PAPER_TEXTURE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663324464762/PWar4ukwNMcBM6qdEajYxi/paper-texture-8vtF6xfrVUBq4MemS6MXXC.webp";

export default function MeditationSession() {
  const [, setLocation] = useLocation();
  const timer = useMeditationTimer();

  // Start a 10-minute session by default if navigated here directly
  useEffect(() => {
    if (timer.state === "idle") {
      timer.start(10);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStop = () => {
    timer.stop();
    setLocation("/");
  };

  const handleReset = () => {
    timer.stop();
    setLocation("/");
  };

  return (
    <div
      className="min-h-screen relative"
      style={{
        backgroundImage: `url('${PAPER_TEXTURE}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
        {(timer.state === "countdown" || timer.state === "active" || timer.state === "paused") && (
          <MeditationView
            state={timer.state}
            elapsedSeconds={timer.elapsedSeconds}
            totalDurationSeconds={timer.totalDurationSeconds}
            currentWaypoint={timer.currentWaypoint}
            currentWaypointIndex={timer.currentWaypointIndex}
            totalWaypoints={timer.totalWaypoints}
            progress={timer.progress}
            countdownValue={timer.countdownValue}
            onPause={timer.pause}
            onResume={timer.resume}
            onStop={handleStop}
          />
        )}

        {timer.state === "complete" && (
          <CompletionView
            totalDurationSeconds={timer.totalDurationSeconds}
            onReset={handleReset}
          />
        )}
      </div>
    </div>
  );
}
