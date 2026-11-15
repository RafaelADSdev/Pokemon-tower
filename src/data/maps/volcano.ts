import type { MapDefinition } from "./types";

export const volcanoMap: MapDefinition = {
  id: "volcano",
  name: "Caldeira Rubra",
  nameEn: "Red Caldera",
  subtitle: "Travessia da cratera",
  subtitleEn: "Crater crossing",
  description: "Cubra a rota junto à borda da caldeira e o atalho dos voadores sobre a cratera.",
  descriptionEn: "Cover the trail along the caldera's rim and the shortcut flying enemies take across the crater.",
  difficulty: "expert",
  size: { width: 20, depth: 12 },
  paths: [
    [
      [-9.75, -3.65], [-7.5, -3.65], [-5.95, -2.1], [-5.95, 1.83], [-4.5, 3.28],
      [-1.75, 3.28], [-0.65, 2.18], [1.38, 2.18], [2.45, 3.25], [5.65, 3.25],
      [7.1, 1.8], [7.1, -0.9], [8.38, -2.18], [9.75, -2.18],
    ],
  ],
  slots: [
    { id: "v1", position: [-8.12, 0] },
    { id: "v2", position: [-7.55, 3.52] },
    { id: "v3", position: [-3.59, -2.9] },
    { id: "v4", position: [-3.45, 0.72] },
    { id: "v5", position: [-3.39, 5.04] },
    { id: "v6", position: [0.73, -0.23] },
    { id: "v7", position: [0.28, 4.69] },
    { id: "v8", position: [4.39, 0.94] },
    { id: "v9", position: [4.55, -2.75] },
    { id: "v10", position: [7.61, 4.45] },
    { id: "v11", position: [8.87, 0.62] },
  ],
  theme: {
    biome: "volcano",
    terrain: "#503b38",
    trail: "#b98b6a",
    edge: "#3a2426",
    accent: "#ff9a55",
    atmosphere: "#221719",
  },
};
