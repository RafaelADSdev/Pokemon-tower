import type { MapDefinition } from "./types";

export const caveMap: MapDefinition = {
  id: "cave",
  name: "Gruta do Eco",
  nameEn: "Echo Cavern",
  subtitle: "Dois caminhos entre cristais",
  subtitleEn: "Two paths through crystal",
  description: "Divida a defesa entre duas galerias que voltam a se encontrar na saída.",
  descriptionEn: "Divide your defenses between two galleries that meet again at the exit.",
  difficulty: "standard",
  size: { width: 20, depth: 12 },
  paths: [
    [
      [-9.75, 0], [-7.15, 0], [-5.75, -1.4], [-5.75, -2.45], [-4.55, -3.65],
      [-1.2, -3.65], [-0.05, -2.5], [1.35, -2.5], [2.7, -3.85], [4.85, -3.85],
      [6.35, -2.35], [6.35, -1.05], [7.4, 0], [9.75, 0],
    ],
    [
      [-9.75, 0], [-7.15, 0], [-5.75, 1.4], [-5.75, 2.4], [-4.45, 3.7],
      [-1.7, 3.7], [-0.4, 2.4], [1.45, 2.4], [2.85, 3.8], [5.15, 3.8],
      [6.7, 2.25], [6.7, 0.7], [7.4, 0], [9.75, 0],
    ],
  ],
  slots: [
    { id: "c1", position: [-7.7, -2.3] },
    { id: "c2", position: [-7.7, 2.3] },
    { id: "c3", position: [-3.95, -1.55] },
    { id: "c4", position: [-3.95, 1.55] },
    { id: "c5", position: [-0.8, 0] },
    { id: "c6", position: [2.55, -1.46] },
    { id: "c7", position: [2.55, 1.46] },
    { id: "c8", position: [5.12, 0] },
    { id: "c9", position: [7.9, -2] },
    { id: "c10", position: [8.15, 2] },
    { id: "c11", position: [0.35, -4.92] },
    { id: "c12", position: [0.35, 4.92] },
  ],
  theme: {
    biome: "cave",
    terrain: "#37434f",
    trail: "#aaa195",
    edge: "#292735",
    accent: "#8cd8df",
    atmosphere: "#141825",
  },
};
