/**
 * Completion View Component
 * Shown after meditation session ends.
 * Wabi-Sabi: gentle, minimal, celebratory in a quiet way.
 */

interface CompletionViewProps {
  totalDurationSeconds: number;
  onReset: () => void;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  if (mins < 1) return "less than a minute";
  if (mins === 1) return "1 minute";
  return `${mins} minutes`;
}

export function CompletionView({ totalDurationSeconds, onReset }: CompletionViewProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-10 animate-fade-in-slow">
      {/* Enso-inspired completion mark */}
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center"
        style={{ border: '1px solid rgba(44, 42, 37, 0.15)' }}
      >
        <div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: 'rgba(44, 42, 37, 0.35)' }}
        />
      </div>

      {/* Message */}
      <div className="text-center space-y-3">
        <h2
          className="text-3xl font-light"
          style={{ fontFamily: '"Cormorant Garamond", serif', color: '#2C2A25' }}
        >
          Session Complete
        </h2>
        <p
          className="text-sm tracking-wide"
          style={{ fontFamily: '"Karla", sans-serif', color: '#8A857F' }}
        >
          You sat for {formatDuration(totalDurationSeconds)}
        </p>
      </div>

      {/* Quote */}
      <p
        className="text-center text-lg max-w-sm leading-relaxed px-4"
        style={{
          fontFamily: '"Cormorant Garamond", serif',
          fontStyle: 'italic',
          color: 'rgba(44, 42, 37, 0.45)',
        }}
      >
        "The moment of noticing a thought is actually a moment to enjoy — waking up."
      </p>

      {/* Return button */}
      <button
        onClick={onReset}
        className="
          group relative px-10 py-3 mt-4
          transition-all duration-500 ease-out
          active:scale-[0.97]
        "
        style={{ fontFamily: '"Karla", sans-serif' }}
      >
        <span className="relative z-10 text-sm tracking-[0.2em]" style={{ color: '#4A4540' }}>
          Return
        </span>
        <span
          className="absolute inset-0 rounded-sm transition-all duration-500"
          style={{ border: '1px solid rgba(44, 42, 37, 0.15)' }}
        />
      </button>
    </div>
  );
}
