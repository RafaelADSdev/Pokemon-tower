import { Howl, Howler } from "howler";
import type { ElementId } from "@/data/elements";
import type { MapId } from "@/data/maps/types";
import { playAttackCue, preloadAttackSounds, stopAttackSounds, type AttackSoundPhase } from "./attackSounds";

const cues = {
  ui: { volume: 0.32, interval: 65 },
  place: { volume: 0.46, interval: 90 },
  upgrade: { volume: 0.47, interval: 110 },
  sell: { volume: 0.39, interval: 110 },
  wave: { volume: 0.46, interval: 220 },
  shot: { volume: 0.18, interval: 130 },
  impact: { volume: 0.25, interval: 115 },
  death: { volume: 0.23, interval: 160 },
  leak: { volume: 0.36, interval: 240 },
  pause: { volume: 0.32, interval: 200 },
  boss: { volume: 0.43, interval: 550 },
  victory: { volume: 0.49, interval: 550 },
  defeat: { volume: 0.47, interval: 550 },
} as const;

type SoundName = keyof typeof cues;
export type AudioCue = SoundName | "hit";

const sounds = new Map<SoundName, Howl>();
const lastPlayed = new Map<SoundName, number>();
let unlocked = false;
let muted = false;
let requestedMap: MapId | null = null;
let music: { mapId: MapId; howl: Howl } | null = null;

function updateMusic() {
  if (music && music.mapId !== requestedMap) {
    music.howl.unload();
    music = null;
  }
  if (!unlocked || muted || !requestedMap || music) return;

  const howl = new Howl({ src: [`/audio/${requestedMap}.mp3`], loop: true, volume: 0.28 });
  music = { mapId: requestedMap, howl };
  howl.play();
}

export function unlockAudio() {
  if (unlocked || typeof window === "undefined") return;
  unlocked = true;
  Howler.mute(muted);
  void Howler.ctx?.resume().catch(() => {});
  if (!muted) preloadAttackSounds();
  updateMusic();
}

export function setAudioMuted(nextMuted: boolean) {
  muted = nextMuted;
  if (!unlocked) return;
  Howler.mute(muted);
  if (muted) stopAttackSounds();
  else preloadAttackSounds();
  updateMusic();
}

export function playMapMusic(mapId: MapId | null) {
  requestedMap = mapId;
  updateMusic();
}

export function playAttackSound(element: ElementId, phase: AttackSoundPhase) {
  if (!unlocked || muted) return;
  playAttackCue(element, phase);
}

export function playSound(cue: AudioCue) {
  if (!unlocked || muted) return;

  const name = cue === "hit" ? "impact" : cue;
  const { interval, volume } = cues[name];
  const now = performance.now();
  const previous = lastPlayed.get(name);
  if (previous !== undefined && now - previous < interval) return;
  lastPlayed.set(name, now);

  let sound = sounds.get(name);
  if (!sound) {
    sound = new Howl({ src: [`/audio/${name}.mp3`], volume, pool: 3 });
    sounds.set(name, sound);
  }
  sound.play();
}
