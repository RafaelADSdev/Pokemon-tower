import type { ElementId } from "./elements";
import { pokemonAppearance } from "./pokemon";
import { regionalEnemies } from "./regionEnemies";

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
  ...pokemonAppearance(824, "Blipbug"),
  description: "Uma criatura comum que avança pelas trilhas em grupos.",
  descriptionEn: "A common critter that follows the trail in groups.",
  element: "folha",
  health: 44,
  speed: 2.35,
  reward: 8,
  leakDamage: 1,
  color: "#91cf8f",
  visual: "mossmite",
  traits: {},
};

export const enemies: readonly EnemyDefinition[] = [
  starterEnemy,
  {
    id: "reedrunner",
    ...pokemonAppearance(162, "Furret"),
    description: "É frágil, mas cruza o terreno em alta velocidade.",
    descriptionEn: "Frailer than most, it races along the trail at high speed.",
    element: "faisca",
    health: 34,
    speed: 3.55,
    reward: 9,
    leakDamage: 1,
    color: "#dfc665",
    visual: "reedrunner",
    traits: {},
  },
  {
    id: "flinthide",
    ...pokemonAppearance(208, "Steelix"),
    description: "O corpo de aço resiste a vários golpes.",
    descriptionEn: "Its steel body withstands repeated blows.",
    element: "pedra",
    health: 138,
    speed: 1.52,
    reward: 19,
    leakDamage: 2,
    color: "#ac9078",
    visual: "flinthide",
    traits: {},
  },
  {
    id: "galefoal",
    ...pokemonAppearance(426, "Drifblim"),
    description: "Voa direto até a saída e evita ataques terrestres.",
    descriptionEn: "Flies straight to the end and evades ground attacks.",
    element: "mare",
    health: 59,
    speed: 3.12,
    reward: 14,
    leakDamage: 1,
    color: "#8bcee4",
    visual: "galefoal",
    traits: { flying: true },
  },
  {
    id: "springtail",
    ...pokemonAppearance(285, "Shroomish"),
    description: "Regenera vida continuamente enquanto avança.",
    descriptionEn: "Continuously regenerates health as it advances.",
    element: "folha",
    health: 87,
    speed: 2.12,
    reward: 12,
    leakDamage: 1,
    color: "#b1ca79",
    visual: "springtail",
    traits: { regen: 5.8 },
  },
  {
    id: "cindershield",
    ...pokemonAppearance(322, "Numel"),
    description: "Carrega um escudo de Pedra que absorve dano antes da vida.",
    descriptionEn: "A Stone shield absorbs damage before its health is touched.",
    element: "brasa",
    health: 77,
    speed: 2.03,
    reward: 17,
    leakDamage: 1,
    color: "#e89566",
    visual: "cindershield",
    traits: { shield: { element: "pedra", health: 63 } },
  },
  {
    id: "hollowpod",
    ...pokemonAppearance(825, "Dottler"),
    description: "Libera dois Blipbug quando seu escudo se rompe.",
    descriptionEn: "Releases two Blipbug when its shell breaks.",
    element: "pedra",
    health: 68,
    speed: 2.2,
    reward: 10,
    leakDamage: 1,
    color: "#d8ae74",
    visual: "hollowpod",
    traits: { split: { enemyId: starterEnemy.id, count: 2 } },
  },
  {
    id: "mistveil",
    ...pokemonAppearance(352, "Kecleon"),
    description: "Fica invisível para as torres até que um suporte o revele.",
    descriptionEn: "Hides from towers until a support creature reveals it.",
    element: "sombra",
    health: 53,
    speed: 2.5,
    reward: 15,
    leakDamage: 1,
    color: "#b4a8da",
    visual: "mistveil",
    traits: { stealth: true },
  },
  {
    id: "marrowcrown",
    ...pokemonAppearance(143, "Snorlax"),
    description: "Chefe que restaura a vida dos inimigos próximos a cada pulso.",
    descriptionEn: "This boss heals nearby enemies with each pulse.",
    element: "folha",
    health: 586,
    speed: 1.24,
    reward: 110,
    leakDamage: 5,
    color: "#84ad6a",
    visual: "marrowcrown",
    traits: { boss: { kind: "heal", radius: 4.1, strength: 47, interval: 3 } },
  },
  {
    id: "ashdrummer",
    ...pokemonAppearance(219, "Magcargo"),
    description: "Chefe que acelera os inimigos próximos a cada rugido.",
    descriptionEn: "This boss speeds up nearby enemies with each roar.",
    element: "brasa",
    health: 692,
    speed: 1.42,
    reward: 130,
    leakDamage: 6,
    color: "#f29665",
    visual: "ashdrummer",
    traits: { boss: { kind: "haste", radius: 4.4, strength: 0.38, interval: 4.1, duration: 2.8 } },
  },
  ...regionalEnemies,
];

export const enemyById: Readonly<Partial<Record<string, EnemyDefinition>>> =
  Object.fromEntries(enemies.map((enemy) => [enemy.id, enemy]));
