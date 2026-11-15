import type { ElementId } from "./elements";

export interface EnemyTraits {
  readonly flying?: boolean;
  readonly regen?: number;
  readonly shield?: { readonly element: ElementId; readonly health: number };
  readonly split?: { readonly enemyId: string; readonly count: number };
  readonly stealth?: boolean;
  readonly boss?: {
    readonly kind: "heal" | "haste";
    readonly radius: number;
    /** Health restored per pulse or fractional speed increase. */
    readonly strength: number;
    readonly interval: number;
    readonly duration?: number;
  };
}

export interface EnemyDefinition {
  readonly id: string;
  readonly name: string;
  readonly nameEn: string;
  readonly description: string;
  readonly descriptionEn: string;
  readonly element: ElementId;
  readonly health: number;
  readonly speed: number;
  readonly reward: number;
  readonly leakDamage: number;
  readonly color: string;
  readonly visual: string;
  readonly model: string | null;
  readonly traits: EnemyTraits;
}

export const starterEnemy: EnemyDefinition = {
  id: "mossmite",
  name: "Musguim",
  nameEn: "Mossmite",
  description: "Uma criatura comum que avança pelas trilhas em grupos.",
  descriptionEn: "A common critter that follows the trail in groups.",
  element: "folha",
  health: 44,
  speed: 2.35,
  reward: 8,
  leakDamage: 1,
  color: "#91cf8f",
  visual: "mossmite",
  model: "/models/mossmite.glb",
  traits: {},
};

export const enemies: readonly EnemyDefinition[] = [
  starterEnemy,
  {
    id: "reedrunner",
    name: "Junquisco",
    nameEn: "Reedrunner",
    description: "É frágil, mas cruza o terreno em alta velocidade.",
    descriptionEn: "Frailer than most, it races along the trail at high speed.",
    element: "faisca",
    health: 34,
    speed: 3.55,
    reward: 9,
    leakDamage: 1,
    color: "#dfc665",
    visual: "reedrunner",
    model: "/models/reedrunner.glb",
    traits: {},
  },
  {
    id: "flinthide",
    name: "Sílex-Casco",
    nameEn: "Flinthide",
    description: "Tem um casco maciço que aguenta vários golpes.",
    descriptionEn: "Its massive shell withstands repeated blows.",
    element: "pedra",
    health: 138,
    speed: 1.52,
    reward: 19,
    leakDamage: 2,
    color: "#ac9078",
    visual: "flinthide",
    model: "/models/flinthide.glb",
    traits: {},
  },
  {
    id: "galefoal",
    name: "Ventisco",
    nameEn: "Galefoal",
    description: "Voa direto até a saída e evita ataques terrestres.",
    descriptionEn: "Flies straight to the end and evades ground attacks.",
    element: "mare",
    health: 59,
    speed: 3.12,
    reward: 14,
    leakDamage: 1,
    color: "#8bcee4",
    visual: "galefoal",
    model: "/models/galefoal.glb",
    traits: { flying: true },
  },
  {
    id: "springtail",
    name: "Brotarrabo",
    nameEn: "Springtail",
    description: "Regenera vida continuamente enquanto avança.",
    descriptionEn: "Continuously regenerates health as it advances.",
    element: "folha",
    health: 87,
    speed: 2.12,
    reward: 12,
    leakDamage: 1,
    color: "#b1ca79",
    visual: "springtail",
    model: "/models/springtail.glb",
    traits: { regen: 5.8 },
  },
  {
    id: "cindershield",
    name: "Escudouro",
    nameEn: "Cindershield",
    description: "Carrega um escudo de Pedra que absorve dano antes da vida.",
    descriptionEn: "A Stone shield absorbs damage before its health is touched.",
    element: "brasa",
    health: 77,
    speed: 2.03,
    reward: 17,
    leakDamage: 1,
    color: "#e89566",
    visual: "cindershield",
    model: "/models/cindershield.glb",
    traits: { shield: { element: "pedra", health: 63 } },
  },
  {
    id: "hollowpod",
    name: "Vagem Oca",
    nameEn: "Hollowpod",
    description: "Libera dois Musguins quando sua casca se parte.",
    descriptionEn: "Releases two Mossmites when its shell breaks.",
    element: "pedra",
    health: 68,
    speed: 2.2,
    reward: 10,
    leakDamage: 1,
    color: "#d8ae74",
    visual: "hollowpod",
    model: "/models/hollowpod.glb",
    traits: { split: { enemyId: starterEnemy.id, count: 2 } },
  },
  {
    id: "mistveil",
    name: "Brumulto",
    nameEn: "Mistveil",
    description: "Fica invisível para as torres até que um suporte o revele.",
    descriptionEn: "Hides from towers until a support creature reveals it.",
    element: "sombra",
    health: 53,
    speed: 2.5,
    reward: 15,
    leakDamage: 1,
    color: "#b4a8da",
    visual: "mistveil",
    model: "/models/mistveil.glb",
    traits: { stealth: true },
  },
  {
    id: "marrowcrown",
    name: "Coroa-Raiz",
    nameEn: "Marrowcrown",
    description: "Chefe que restaura a vida dos inimigos próximos a cada pulso.",
    descriptionEn: "This boss heals nearby enemies with each pulse.",
    element: "folha",
    health: 586,
    speed: 1.24,
    reward: 110,
    leakDamage: 5,
    color: "#84ad6a",
    visual: "marrowcrown",
    model: "/models/marrowcrown.glb",
    traits: { boss: { kind: "heal", radius: 4.1, strength: 47, interval: 3 } },
  },
  {
    id: "ashdrummer",
    name: "Rufador de Cinza",
    nameEn: "Ashdrummer",
    description: "Chefe que acelera os inimigos próximos com seu tambor.",
    descriptionEn: "This boss speeds up nearby enemies with its drum.",
    element: "brasa",
    health: 692,
    speed: 1.42,
    reward: 130,
    leakDamage: 6,
    color: "#f29665",
    visual: "ashdrummer",
    model: "/models/ashdrummer.glb",
    traits: { boss: { kind: "haste", radius: 4.4, strength: 0.38, interval: 4.1, duration: 2.8 } },
  },
];

export const enemyById: Readonly<Partial<Record<string, EnemyDefinition>>> =
  Object.fromEntries(enemies.map((enemy) => [enemy.id, enemy]));
