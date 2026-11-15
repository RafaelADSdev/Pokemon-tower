import type { ElementId } from "@/data/elements";

type AttackStyle = {
  core: string;
  accent: string;
  trail: string;
  span: number;
  scatter: number;
  lift: number;
  sharpness: number;
  echo: boolean;
};

export const attackStyles = {
  brasa: { core: "#ff762b", accent: "#fff0ac", trail: "#ec4d22", span: 0.79, scatter: 0.74, lift: 0.57, sharpness: 1.4, echo: false },
  mare: { core: "#36bff7", accent: "#d8faff", trail: "#38a6ea", span: 0.58, scatter: 1.1, lift: 0.37, sharpness: 0.85, echo: true },
  folha: { core: "#77c838", accent: "#ddf8a9", trail: "#42a55a", span: 0.57, scatter: 0.84, lift: 0.42, sharpness: 1.9, echo: false },
  faisca: { core: "#ffd43f", accent: "#ffffe4", trail: "#f2a92d", span: 1.02, scatter: 1.16, lift: 0.32, sharpness: 2.8, echo: false },
  pedra: { core: "#b78b62", accent: "#f0d3a8", trail: "#aa886d", span: 0.4, scatter: 0.9, lift: 0.31, sharpness: 0.87, echo: false },
  sombra: { core: "#9b60ef", accent: "#efd5ff", trail: "#6846c4", span: 0.69, scatter: 0.75, lift: 0.45, sharpness: 1.3, echo: true },
} as const satisfies Record<ElementId, AttackStyle>;

export const attackElements = Object.keys(attackStyles) as ElementId[];
