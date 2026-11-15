import { Howl } from "howler";
import type { ElementId } from "@/data/elements";
import { attackSprites } from "./attackSprites";

export type AttackSoundPhase = "shot" | "impact";
type AttackKey = `${ElementId}-${AttackSoundPhase}`;

const sprites: Record<AttackKey, [number, number]> = attackSprites;
const settings = {
  shot: { repeat: 132, gain: 0.37 },
  impact: { repeat: 112, gain: 0.35 },
} satisfies Record<AttackSoundPhase, { repeat: number; gain: number }>;
const maxVoices = 5;
const rates = [1, 0.96, 1.04, 0.98, 1.02];
const active = new Set<number>();
const lastBySprite = new Map<AttackKey, number>();
let bank: Howl | undefined;
let nextRate = 0;

function release(id: number) {
  active.delete(id);
}

export function preloadAttackSounds() {
  bank ??= new Howl({
    src: ["/audio/attack-sfx.mp3"],
    sprite: sprites,
    volume: 0.35,
    pool: maxVoices,
    onend: release,
    onstop: release,
    onplayerror: release,
  });
}

export function stopAttackSounds() {
  bank?.stop();
  active.clear();
}

export function playAttackCue(element: ElementId, phase: AttackSoundPhase) {
  // A cold connection should never queue late attacks for playback after loading.
  if (bank?.state() !== "loaded" || active.size >= maxVoices) return;
  const key: AttackKey = `${element}-${phase}`;
  const now = performance.now();
  const { repeat, gain } = settings[phase];
  if (now - (lastBySprite.get(key) ?? -Infinity) < repeat) return;

  const id = bank.play(key);
  bank.volume(gain / (1 + active.size * 0.19), id);
  bank.rate(rates[nextRate], id);
  nextRate = (nextRate + 1) % rates.length;
  active.add(id);
  lastBySprite.set(key, now);
}
