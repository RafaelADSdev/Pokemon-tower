import {
  Bug, CircleDot, Crown, Droplet, Feather, Flame, Gem, Ghost, Leaf, Mountain,
  Orbit, Shield, Skull, Snowflake, Swords, Zap, type LucideIcon,
} from 'lucide-react';
import type { CSSProperties } from 'react';
import type { GymSpecialty } from '@/data/campaign/gyms';

type GymVisual = { icon: LucideIcon; accent: string; ink: string; tint: string };

const gymVisuals = {
  rock: { icon: Gem, accent: '#b57842', ink: '#704521', tint: '#faeedc' },
  water: { icon: Droplet, accent: '#4188e4', ink: '#194f8e', tint: '#e8f4ff' },
  electric: { icon: Zap, accent: '#ecb223', ink: '#704d02', tint: '#fff4c9' },
  grass: { icon: Leaf, accent: '#46aa64', ink: '#236a3d', tint: '#e8f7e9' },
  poison: { icon: Skull, accent: '#a165c7', ink: '#603683', tint: '#f4eafd' },
  psychic: { icon: Orbit, accent: '#e06d9e', ink: '#8e3159', tint: '#ffebf3' },
  fire: { icon: Flame, accent: '#ef6247', ink: '#9e3524', tint: '#fff0e9' },
  ground: { icon: Mountain, accent: '#bd8e52', ink: '#704b2d', tint: '#f9eddc' },
  flying: { icon: Feather, accent: '#839fe6', ink: '#3f5595', tint: '#edf2ff' },
  bug: { icon: Bug, accent: '#8bad42', ink: '#4d671c', tint: '#f1f7de' },
  normal: { icon: CircleDot, accent: '#8a99ae', ink: '#49576b', tint: '#eef2f6' },
  ghost: { icon: Ghost, accent: '#8067d5', ink: '#48378d', tint: '#f1ebff' },
  fighting: { icon: Swords, accent: '#d8775f', ink: '#883c29', tint: '#fcedea' },
  steel: { icon: Shield, accent: '#7795b1', ink: '#3c576d', tint: '#eaf2f8' },
  ice: { icon: Snowflake, accent: '#47aeb9', ink: '#185f69', tint: '#e7f8fa' },
  dragon: { icon: Crown, accent: '#656ae1', ink: '#424790', tint: '#edeeff' },
} as const satisfies Record<GymSpecialty, GymVisual>;

type GymPalette = CSSProperties & Record<'--gym-accent' | '--gym-ink' | '--gym-tint', string>;

export function gymPalette(specialty: GymSpecialty): GymPalette {
  const { accent, ink, tint } = gymVisuals[specialty];
  return { '--gym-accent': accent, '--gym-ink': ink, '--gym-tint': tint };
}

export function GymEmblem({ specialty, size = 24, className }: {
  specialty: GymSpecialty;
  size?: number;
  className?: string;
}) {
  const Icon = gymVisuals[specialty].icon;
  return (
    <span className={className ? `gym-emblem ${className}` : 'gym-emblem'} data-specialty={specialty} style={gymPalette(specialty)} aria-hidden="true">
      <Icon size={size} strokeWidth={2.25} focusable="false" />
    </span>
  );
}
