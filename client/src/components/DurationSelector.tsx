/**
 * Duration Selector Component
 * Wabi-Sabi style: organic, minimal, deliberate interactions
 * Uses a horizontal slider with ink-wash aesthetic
 */

import { useState } from "react";
import { Slider } from "@/components/ui/slider";

interface DurationSelectorProps {
  onStart: (durationMinutes: number) => void;
}

const PRESET_DURATIONS = [3, 5, 10, 15, 20, 25, 30];

export function DurationSelector({ onStart }: DurationSelectorProps) {
  const [duration, setDuration] = useState(10);

  return (
    <div className="flex flex-col items-center gap-10 w-full max-w-sm mx-auto animate-fade-in-slow">
      {/* Duration display */}
      <div className="text-center">
        <span
          className="block text-7xl md:text-8xl font-light tracking-tight"
          style={{ fontFamily: '"Cormorant Garamond", serif', color: '#2C2A25' }}
        >
          {duration}
        </span>
        <span
          className="block text-xs tracking-[0.35em] uppercase mt-2"
          style={{ fontFamily: '"Karla", sans-serif', color: '#8A857F' }}
        >
          minutes
        </span>
      </div>

      {/* Slider */}
      <div className="w-full px-2">
        <Slider
          value={[duration]}
          onValueChange={(val) => setDuration(val[0])}
          min={3}
          max={30}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between mt-3 text-xs tracking-wide" style={{ color: '#9E9890' }}>
          <span>3 min</span>
          <span>30 min</span>
        </div>
      </div>

      {/* Preset buttons */}
      <div className="flex flex-wrap justify-center gap-1">
        {PRESET_DURATIONS.map((d) => (
          <button
            key={d}
            onClick={() => setDuration(d)}
            className="
              px-3.5 py-2 text-sm rounded-sm transition-all duration-300
            "
            style={{
              fontFamily: '"Karla", sans-serif',
              color: duration === d ? '#2C2A25' : '#8A857F',
              backgroundColor: duration === d ? 'rgba(44, 42, 37, 0.06)' : 'transparent',
            }}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Start button */}
      <button
        onClick={() => onStart(duration)}
        className="
          group relative px-14 py-4 mt-2
          transition-all duration-500 ease-out
          active:scale-[0.97]
        "
        style={{ fontFamily: '"Cormorant Garamond", serif' }}
      >
        <span className="relative z-10 text-xl tracking-[0.2em]" style={{ color: '#2C2A25' }}>
          Begin
        </span>
        <span
          className="absolute inset-0 rounded-sm transition-all duration-500"
          style={{ border: '1px solid rgba(44, 42, 37, 0.2)' }}
        />
      </button>
    </div>
  );
}
