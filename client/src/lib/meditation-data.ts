/**
 * Meditation waypoint data for "Noting the Hindrances" practice.
 * Based on the guided meditation from "One Breath at a Time."
 * 
 * Design: Wabi-Sabi Minimalism — ink wash, rice paper, organic forms
 * 
 * Audio paths use relative URLs from public/audio/ for GitHub Pages compatibility.
 * All audio is MP3 format for broad browser support and smaller file sizes.
 */

export interface Waypoint {
  id: number;
  title: string;
  text: string;
  audioUrl: string;
  audioDuration: number; // seconds
}

/** Background binaural meditation music URL (loops during session) */
export const BINAURAL_MUSIC_URL = "/manus-storage/binaural-loop_3fd49d91.mp3";

export const waypoints: Waypoint[] = [
  {
    id: 0,
    title: "The Five Hindrances",
    text: "In this practice, we work with the Five Hindrances — desire, aversion, sleepiness, restlessness, and doubt. These are not personal failings. They are shared by all people. Our task is to notice when they arise, name them gently, and return to the breath.",
    audioUrl: "/audio/waypoint_00_hindrances_intro.mp3",
    audioDuration: 42.0,
  },
  {
    id: 1,
    title: "Settling",
    text: "Begin by relaxing with the breath, settling into the body. With each breath, make a soft mental note: in-breath, out-breath.",
    audioUrl: "/audio/waypoint_01_opening.mp3",
    audioDuration: 15.5,
  },
  {
    id: 2,
    title: "Anchoring",
    text: "Feel the sensations of breath at the nostrils or the belly. Don't try to control the breath. Just breathe, and know you are breathing.",
    audioUrl: "/audio/waypoint_02_anchoring.mp3",
    audioDuration: 13.8,
  },
  {
    id: 3,
    title: "Noting Thoughts",
    text: "When the mind wanders, make a mental note: thinking, thinking. And gently return to the breath.",
    audioUrl: "/audio/waypoint_03_noting_thoughts.mp3",
    audioDuration: 23.0,
  },
  {
    id: 4,
    title: "Refining",
    text: "Try to refine your attention: is it a thought of wanting, or not-wanting? Note wanting, or aversion. Then return to the breath.",
    audioUrl: "/audio/waypoint_04_refining.mp3",
    audioDuration: 16.7,
  },
  {
    id: 5,
    title: "Judgments",
    text: "The moment of noticing a thought is actually a moment to enjoy. Enjoy the relief of coming back to wakefulness.",
    audioUrl: "/audio/waypoint_05_judgments.mp3",
    audioDuration: 17.1,
  },
  {
    id: 6,
    title: "Sensations",
    text: "As you let go and return to the breath, soften the belly, relax the shoulders, breathe into the tension and let go.",
    audioUrl: "/audio/waypoint_06_sensations.mp3",
    audioDuration: 24.95,
  },
  {
    id: 7,
    title: "Hindrances",
    text: "Notice sleepiness, restlessness, doubt. If they appear, experience them with mindfulness. Note them, then let go.",
    audioUrl: "/audio/waypoint_07_hindrances.mp3",
    audioDuration: 12.85,
  },
  {
    id: 8,
    title: "Moods",
    text: "Notice moods. Are you sad, angry, bored, anxious? Happy, loving, calm? Note these feelings as well.",
    audioUrl: "/audio/waypoint_08_moods.mp3",
    audioDuration: 13.95,
  },
  {
    id: 9,
    title: "Letting Go",
    text: "A thought is a thought. Just let go.",
    audioUrl: "/audio/waypoint_09_letting_go.mp3",
    audioDuration: 11.9,
  },
  {
    id: 10,
    title: "Closing",
    text: "Gently bring your awareness back to the room. When you're ready, slowly open your eyes.",
    audioUrl: "/audio/waypoint_10_closing.mp3",
    audioDuration: 9.7,
  },
];

/**
 * Get the waypoints to use for a given session duration.
 * Shorter sessions use fewer waypoints; longer sessions use all of them.
 * The Five Hindrances intro (id:0) is always included as the first waypoint.
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
