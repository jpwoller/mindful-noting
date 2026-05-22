/**
 * Home Page — Mindful Noting Meditation App
 * 
 * Design: Wabi-Sabi Minimalism
 * - Warm rice paper background with subtle texture
 * - Ink-wash enso circle as hero element
 * - Cormorant Garamond display + Karla body typography
 * - Asymmetric layout, generous negative space
 * - Deliberately slow animations (600-800ms transitions)
 * 
 * Images use CDN URLs that work on any hosting platform including GitHub Pages.
 */

import { DurationSelector } from "@/components/DurationSelector";
import { MeditationView } from "@/components/MeditationView";
import { CompletionView } from "@/components/CompletionView";
import { useMeditationTimer } from "@/hooks/useMeditationTimer";

// CDN-hosted images (work on any platform)
const PAPER_TEXTURE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663324464762/PWar4ukwNMcBM6qdEajYxi/paper-texture-8vtF6xfrVUBq4MemS6MXXC.webp";
const INK_WASH_MOUNTAIN = "https://d2xsxph8kpxj0f.cloudfront.net/310519663324464762/PWar4ukwNMcBM6qdEajYxi/ink-wash-mountain-jxCcjtSr49rav9vaGfUeuj.webp";
const ENSO_CIRCLE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663324464762/PWar4ukwNMcBM6qdEajYxi/enso-transparent-jVJB85U9G2Qh9G8fUFxRfr.png";

export default function Home() {
  const timer = useMeditationTimer();

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundImage: `url('${PAPER_TEXTURE}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Subtle ink wash mountain in background - only on idle */}
      {timer.state === "idle" && (
        <div
          className="absolute inset-0 opacity-25 pointer-events-none"
          style={{
            backgroundImage: `url('${INK_WASH_MOUNTAIN}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center bottom',
          }}
        />
      )}

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header - only on idle */}
        {timer.state === "idle" && (
          <header className="pt-16 pb-4 px-6 animate-fade-in-slow">
            <div className="max-w-2xl mx-auto text-center">
              {/* Enso circle image */}
              <div className="mb-6 flex justify-center">
                <img
                  src={ENSO_CIRCLE}
                  alt="Enso circle"
                  className="w-28 h-28 md:w-36 md:h-36 object-contain opacity-60"
                />
              </div>

              <h1
                className="text-4xl md:text-5xl font-light mb-2"
                style={{ fontFamily: '"Cormorant Garamond", serif', color: '#2C2A25' }}
              >
                Mindful Noting
              </h1>
              <p
                className="text-xs tracking-[0.3em] uppercase mb-6"
                style={{ fontFamily: '"Karla", sans-serif', color: '#6B6560' }}
              >
                Noting the Hindrances
              </p>
              <p
                className="text-base max-w-sm mx-auto leading-relaxed"
                style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', color: '#7A756F' }}
              >
                A guided practice of recognizing what arises in the mind, noting it with kindness, and returning to the breath.
              </p>
            </div>
          </header>
        )}

        {/* Main area */}
        <main className="flex-1 flex items-center justify-center px-6 pb-12">
          {timer.state === "idle" && (
            <DurationSelector onStart={timer.start} />
          )}

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
              onStop={timer.stop}
            />
          )}

          {timer.state === "complete" && (
            <CompletionView
              totalDurationSeconds={timer.totalDurationSeconds}
              onReset={timer.stop}
            />
          )}
        </main>

        {/* Footer - only on idle */}
        {timer.state === "idle" && (
          <footer className="pb-8 text-center">
            <p className="text-xs tracking-wide" style={{ color: '#9E9890' }}>
              Based on "One Breath at a Time"
            </p>
          </footer>
        )}
      </div>
    </div>
  );
}
