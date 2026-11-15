export type ElementId = "brasa" | "mare" | "folha" | "faisca" | "pedra" | "sombra";
export type ElementMultiplier = 0.5 | 1 | 2;

export interface ElementDefinition {
  readonly id: ElementId;
  readonly name: string;
  readonly nameEn: string;
  readonly color: string;
}

export const elementById: Readonly<Record<ElementId, ElementDefinition>> = {
  brasa: { id: "brasa", name: "Brasa", nameEn: "Ember", color: "#f89260" },
  mare: { id: "mare", name: "Maré", nameEn: "Tide", color: "#78cad9" },
  folha: { id: "folha", name: "Folha", nameEn: "Leaf", color: "#adc778" },
  faisca: { id: "faisca", name: "Faísca", nameEn: "Spark", color: "#f2d170" },
  pedra: { id: "pedra", name: "Pedra", nameEn: "Stone", color: "#c4ac91" },
  sombra: { id: "sombra", name: "Sombra", nameEn: "Shade", color: "#c1a1ec" },
};

export const elements = Object.values(elementById);

// Rows are attackers and columns are defenders.
export const elementChart: Readonly<Record<ElementId, Readonly<Record<ElementId, ElementMultiplier>>>> = {
  brasa:  { brasa: 1,   mare: 0.5, folha: 2,   faisca: 0.5, pedra: 1,   sombra: 2 },
  mare:   { brasa: 2,   mare: 1,   folha: 0.5, faisca: 0.5, pedra: 2,   sombra: 1 },
  folha:  { brasa: 0.5, mare: 2,   folha: 1,   faisca: 1,   pedra: 0.5, sombra: 2 },
  faisca: { brasa: 2,   mare: 2,   folha: 1,   faisca: 1,   pedra: 0.5, sombra: 0.5 },
  pedra:  { brasa: 1,   mare: 0.5, folha: 2,   faisca: 2,   pedra: 1,   sombra: 0.5 },
  sombra: { brasa: 0.5, mare: 1,   folha: 0.5, faisca: 2,   pedra: 2,   sombra: 1 },
};
