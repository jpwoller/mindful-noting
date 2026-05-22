/**
 * Meditation waypoint data for "Noting the Hindrances" practice.
 * Based on the guided meditation from "One Breath at a Time."
 * 
 * Design: Wabi-Sabi Minimalism — ink wash, rice paper, organic forms
 */

export interface Waypoint {
  id: number;
  title: string;
  text: string;
  audioUrl: string;
  audioDuration: number; // seconds
}

export const waypoints: Waypoint[] = [
  {
    id: 0,
    title: "Welcome",
    text: "Find a comfortable position. Close your eyes if you'd like. Take a moment to arrive here, letting go of whatever came before.",
    audioUrl: "/manus-storage/waypoint_00_intro_26d99407.wav",
    audioDuration: 13.8,
  },
  {
    id: 1,
    title: "Settling",
    text: "Begin by relaxing with the breath, settling into the body. With each breath, make a soft mental note: in-breath, out-breath.",
    audioUrl: "/manus-storage/waypoint_01_opening_9345a143.wav",
    audioDuration: 15.5,
  },
  {
    id: 2,
    title: "Anchoring",
    text: "Feel the sensations of breath at the nostrils or the belly. Don't try to control the breath. Just breathe, and know you are breathing.",
    audioUrl: "/manus-storage/waypoint_02_anchoring_8696d980.wav",
    audioDuration: 13.8,
  },
  {
    id: 3,
    title: "Noting Thoughts",
    text: "When the mind wanders, make a mental note: thinking, thinking. And gently return to the breath.",
    audioUrl: "/manus-storage/waypoint_03_noting_thoughts_6206a2a5.wav",
    audioDuration: 23.0,
  },
  {
    id: 4,
    title: "Refining",
    text: "Try to refine your attention: is it a thought of wanting, or not-wanting? Note wanting, or aversion. Then return to the breath.",
    audioUrl: "/manus-storage/waypoint_04_refining_c3efcead.wav",
    audioDuration: 16.7,
  },
  {
    id: 5,
    title: "Judgments",
    text: "The moment of noticing a thought is actually a moment to enjoy. Enjoy the relief of coming back to wakefulness.",
    audioUrl: "/manus-storage/waypoint_05_judgments_6d1d01f3.wav",
    audioDuration: 17.1,
  },
  {
    id: 6,
    title: "Sensations",
    text: "As you let go and return to the breath, soften the belly, relax the shoulders, breathe into the tension and let go.",
    audioUrl: "/manus-storage/waypoint_06_sensations_b6443ad9.wav",
    audioDuration: 24.95,
  },
  {
    id: 7,
    title: "Hindrances",
    text: "Notice sleepiness, restlessness, doubt. If they appear, experience them with mindfulness. Note them, then let go.",
    audioUrl: "/manus-storage/waypoint_07_hindrances_6fab8317.wav",
    audioDuration: 12.85,
  },
  {
    id: 8,
    title: "Moods",
    text: "Notice moods. Are you sad, angry, bored, anxious? Happy, loving, calm? Note these feelings as well.",
    audioUrl: "/manus-storage/waypoint_08_moods_4e3af5bf.wav",
    audioDuration: 13.95,
  },
  {
    id: 9,
    title: "Letting Go",
    text: "A thought is a thought. Just let go.",
    audioUrl: "/manus-storage/waypoint_09_letting_go_314740f2.wav",
    audioDuration: 11.9,
  },
  {
    id: 10,
    title: "Closing",
    text: "Gently bring your awareness back to the room. When you're ready, slowly open your eyes.",
    audioUrl: "/manus-storage/waypoint_10_closing_2820da64.wav",
    audioDuration: 9.7,
  },
];

/**
 * Get the waypoints to use for a given session duration.
 * Shorter sessions use fewer waypoints; longer sessions use all of them.
 */
export function getWaypointsForDuration(durationMinutes: number): Waypoint[] {
  if (durationMinutes <= 3) {
    return [waypoints[0], waypoints[1], waypoints[2], waypoints[10]];
  } else if (durationMinutes <= 5) {
    return [waypoints[0], waypoints[1], waypoints[2], waypoints[3], waypoints[10]];
  } else if (durationMinutes <= 10) {
    return [waypoints[0], waypoints[1], waypoints[2], waypoints[3], waypoints[4], waypoints[5], waypoints[10]];
  } else if (durationMinutes <= 15) {
    return [waypoints[0], waypoints[1], waypoints[2], waypoints[3], waypoints[4], waypoints[5], waypoints[6], waypoints[7], waypoints[10]];
  } else if (durationMinutes <= 20) {
    return [waypoints[0], waypoints[1], waypoints[2], waypoints[3], waypoints[4], waypoints[5], waypoints[6], waypoints[7], waypoints[8], waypoints[10]];
  } else {
    // 21-30 minutes: all waypoints
    return [...waypoints];
  }
}

/**
 * Calculate the timing schedule for waypoints within a session.
 * Returns an array of timestamps (in seconds) for when each waypoint should play.
 * The first waypoint always starts at 0, the last one plays near the end.
 */
export function calculateWaypointSchedule(
  sessionWaypoints: Waypoint[],
  totalDurationSeconds: number
): number[] {
  const count = sessionWaypoints.length;
  if (count === 0) return [];
  if (count === 1) return [0];

  // First waypoint at 0, last waypoint leaves enough time for its audio + a brief pause
  const lastWaypointAudioDuration = sessionWaypoints[count - 1].audioDuration;
  const endBuffer = lastWaypointAudioDuration + 3; // 3s grace after last audio
  const availableTime = totalDurationSeconds - endBuffer;

  // Distribute waypoints evenly across available time
  const schedule: number[] = [];
  for (let i = 0; i < count; i++) {
    if (i === 0) {
      schedule.push(0);
    } else if (i === count - 1) {
      // Last waypoint: place it so audio finishes ~3s before session end
      schedule.push(totalDurationSeconds - endBuffer);
    } else {
      // Evenly space the middle waypoints
      const fraction = i / (count - 1);
      schedule.push(Math.round(fraction * availableTime));
    }
  }

  return schedule;
}
