import type { CSSProperties } from 'react';
import type { GymSpecialty } from '@/data/campaign/gyms';

type GymVisual = { accent: string; ink: string; tint: string };

const gymVisuals = {
  rock: { accent: '#b57842', ink: '#704521', tint: '#faeedc' },
  water: { accent: '#4188e4', ink: '#194f8e', tint: '#e8f4ff' },
  electric: { accent: '#ecb223', ink: '#704d02', tint: '#fff4c9' },
  grass: { accent: '#46aa64', ink: '#236a3d', tint: '#e8f7e9' },
  poison: { accent: '#a165c7', ink: '#603683', tint: '#f4eafd' },
  psychic: { accent: '#e06d9e', ink: '#8e3159', tint: '#ffebf3' },
  fire: { accent: '#ef6247', ink: '#9e3524', tint: '#fff0e9' },
  ground: { accent: '#bd8e52', ink: '#704b2d', tint: '#f9eddc' },
  flying: { accent: '#839fe6', ink: '#3f5595', tint: '#edf2ff' },
  bug: { accent: '#8bad42', ink: '#4d671c', tint: '#f1f7de' },
  normal: { accent: '#8a99ae', ink: '#49576b', tint: '#eef2f6' },
  ghost: { accent: '#8067d5', ink: '#48378d', tint: '#f1ebff' },
  fighting: { accent: '#d8775f', ink: '#883c29', tint: '#fcedea' },
  steel: { accent: '#7795b1', ink: '#3c576d', tint: '#eaf2f8' },
  ice: { accent: '#47aeb9', ink: '#185f69', tint: '#e7f8fa' },
  dragon: { accent: '#656ae1', ink: '#424790', tint: '#edeeff' },
} as const satisfies Record<GymSpecialty, GymVisual>;

type GymPalette = CSSProperties & Record<'--gym-accent' | '--gym-ink' | '--gym-tint', string>;

export function gymPalette(specialty: GymSpecialty): GymPalette {
  const { accent, ink, tint } = gymVisuals[specialty];
  return { '--gym-accent': accent, '--gym-ink': ink, '--gym-tint': tint };
}
