import type { ElementId } from "./elements";
import { pokemonAppearance, pokemonPortrait } from "./pokemon";
import type { StatusApplication } from "./status";

export const creatureRoles = {
  rapid: { name: "Ataque rápido", nameEn: "Rapid fire" },
  splash: { name: "Dano em área", nameEn: "Splash" },
  slow: { name: "Lentidão", nameEn: "Slow" },
  dot: { name: "Veneno", nameEn: "Poison" },
  sniper: { name: "Longo alcance", nameEn: "Long range" },
  support: { name: "Suporte", nameEn: "Support" },
  antiAir: { name: "Antiaéreo", nameEn: "Anti-air" },
  income: { name: "Gera moedas", nameEn: "Income" },
} as const;

export const targetPriorities = ["first", "last", "strongest", "nearest"] as const;
export type TargetPriority = (typeof targetPriorities)[number];
export type CreatureRole = keyof typeof creatureRoles;
export type CreatureLevel = 1 | 2 | 3;

export interface CreatureStats {
  readonly cost: number;
  readonly damage: number;
  readonly range: number;
  readonly cooldown: number;
}

interface SupportAbility {
  readonly radius: number;
  readonly damage: number;
  readonly range: number;
  readonly reveal: boolean;
}

interface IncomeAbility {
  readonly amount: number;
  readonly interval: number;
}

export interface CreatureAbilities {
  readonly targets?: "ground" | "air" | "any" | "none";
  readonly splash?: number;
  readonly status?: StatusApplication;
  readonly support?: SupportAbility;
  readonly income?: IncomeAbility;
  readonly airMultiplier?: number;
}

export interface CreatureAppearance {
  readonly name: string;
  readonly nameEn: string;
  readonly description: string;
  readonly descriptionEn: string;
  readonly visual: string;
  readonly model: string | null;
  readonly idlePose?: string;
}

export type CreatureEvolution = CreatureAppearance & CreatureAbilities;
export type CreatureLevelDefinition = CreatureStats & CreatureAbilities;

export interface CreatureDefinition extends CreatureAppearance, CreatureAbilities, CreatureStats {
  readonly id: string;
  readonly portrait?: string;
  readonly element: ElementId;
  readonly role: CreatureRole;
  readonly projectileSpeed: number;
  readonly color: string;
  readonly targets: NonNullable<CreatureAbilities["targets"]>;
  readonly levels: readonly [CreatureLevelDefinition, CreatureLevelDefinition];
  readonly intermediate?: CreatureAppearance;
  readonly evolution: CreatureEvolution;
}

export function withIntermediateAppearance(definition: CreatureDefinition, dex: number, name: string): CreatureDefinition {
  return {
    ...definition,
    intermediate: {
      ...pokemonAppearance(dex, name),
      description: definition.description,
      descriptionEn: definition.descriptionEn,
      visual: definition.visual,
    },
  };
}

export const starterCreature = withIntermediateAppearance({
  id: "emberling",
  ...pokemonAppearance(4, "Charmander"),
  portrait: pokemonPortrait(4),
  description: "Dispara fagulhas rápidas contra um alvo por vez.",
  descriptionEn: "Fires a rapid volley of sparks at one target.",
  element: "brasa",
  role: "rapid",
  cost: 120,
  damage: 17,
  range: 3.85,
  cooldown: 0.6,
  projectileSpeed: 12,
  color: "#ff8658",
  visual: "emberling",
  targets: "any",
  levels: [
    { cost: 110, damage: 29, range: 4.18, cooldown: 0.53 },
    { cost: 200, damage: 46, range: 4.5, cooldown: 0.46 },
  ],
  evolution: {
    ...pokemonAppearance(6, "Charizard"),
    description: "Cada fagulha deixa o alvo em chamas.",
    descriptionEn: "Each spark leaves its target burning.",
    visual: "emberling-evolved",
    status: { id: "burn", strength: 20, duration: 2.4 },
  },
}, 5, "Charmeleon");

export const creatures: readonly CreatureDefinition[] = [
  starterCreature,
  withIntermediateAppearance({
    id: "rivermutt",
    ...pokemonAppearance(7, "Squirtle"),
    portrait: pokemonPortrait(7),
    description: "Lança bolhas que estouram e atingem inimigos próximos.",
    descriptionEn: "Lobs bubbles that burst and damage nearby enemies.",
    element: "mare",
    role: "splash",
    cost: 150,
    damage: 32,
    range: 4.1,
    cooldown: 1.35,
    projectileSpeed: 9,
    color: "#72c8dc",
    visual: "rivermutt",
    targets: "ground",
    splash: 1.25,
    levels: [
      { cost: 128, damage: 59, range: 4.45, cooldown: 1.23 },
      { cost: 235, damage: 99, range: 4.9, cooldown: 1.11 },
    ],
    evolution: {
      ...pokemonAppearance(9, "Blastoise"),
      description: "Uma onda maior abranda tudo que atinge.",
      descriptionEn: "A larger burst slows every enemy it hits.",
      visual: "rivermutt-evolved",
      splash: 2.05,
      status: { id: "slow", strength: 0.3, duration: 1.5 },
    },
  }, 8, "Wartortle"),
  withIntermediateAppearance({
    id: "glimleaf",
    ...pokemonAppearance(1, "Bulbasaur"),
    portrait: pokemonPortrait(1),
    description: "Espalha sementes que reduzem a velocidade dos alvos.",
    descriptionEn: "Scatters seeds that slow the enemies they hit.",
    element: "folha",
    role: "slow",
    cost: 105,
    damage: 13,
    range: 3.8,
    cooldown: 0.78,
    projectileSpeed: 10,
    color: "#a9c872",
    visual: "glimleaf",
    targets: "any",
    status: { id: "slow", strength: 0.36, duration: 1.8 },
    levels: [
      { cost: 91, damage: 22, range: 4.28, cooldown: 0.7 },
      { cost: 184, damage: 42, range: 4.75, cooldown: 0.62 },
    ],
    evolution: {
      ...pokemonAppearance(3, "Venusaur"),
      description: "Espalha sementes em área e imobiliza brevemente os alvos.",
      descriptionEn: "Scatters seeds in an area and briefly stuns its targets.",
      visual: "glimleaf-evolved",
      splash: 1.35,
      status: { id: "stun", strength: 1, duration: 0.42 },
    },
  }, 2, "Ivysaur"),
  {
    id: "duskspore",
    ...pokemonAppearance(46, "Paras"),
    portrait: pokemonPortrait(46),
    description: "Aplica veneno cumulativo que corrói inimigos resistentes.",
    descriptionEn: "Applies stacking poison to wear down resilient enemies.",
    element: "sombra",
    role: "dot",
    cost: 130,
    damage: 12,
    range: 4.05,
    cooldown: 0.76,
    projectileSpeed: 10,
    color: "#c49de8",
    visual: "duskspore",
    targets: "ground",
    status: { id: "poison", strength: 13, duration: 3.1 },
    levels: [
      { cost: 119, damage: 29, range: 4.4, cooldown: 0.69 },
      { cost: 209, damage: 49, range: 4.8, cooldown: 0.62 },
    ],
    evolution: {
      ...pokemonAppearance(47, "Parasect"),
      description: "Espalha veneno forte em uma área ao redor do impacto.",
      descriptionEn: "Spreads a potent toxin around each point of impact.",
      visual: "duskspore-evolved",
      splash: 1.2,
      status: { id: "poison", strength: 22, duration: 4.25 },
    },
  },
  withIntermediateAppearance({
    id: "cragbeak",
    ...pokemonAppearance(74, "Geodude"),
    portrait: pokemonPortrait(74),
    description: "Dispara projéteis pesados de longe com uma cadência lenta.",
    descriptionEn: "Fires slow, powerful shots from a long distance.",
    element: "pedra",
    role: "sniper",
    cost: 162,
    damage: 72,
    range: 6.35,
    cooldown: 2.03,
    projectileSpeed: 22,
    color: "#c7a47c",
    visual: "cragbeak",
    targets: "any",
    levels: [
      { cost: 148, damage: 114, range: 7.0, cooldown: 1.86 },
      { cost: 252, damage: 179, range: 7.85, cooldown: 1.62 },
    ],
    evolution: {
      ...pokemonAppearance(76, "Golem"),
      description: "Marca os alvos para que recebam mais dano de todas as fontes.",
      descriptionEn: "Marks targets to take more damage from every source.",
      visual: "cragbeak-evolved",
      status: { id: "mark", strength: 0.33, duration: 3.5 },
    },
  }, 75, "Graveler"),
  {
    id: "runebell",
    ...pokemonAppearance(436, "Bronzor"),
    portrait: pokemonPortrait(436),
    description: "Amplia o dano e alcance de aliados próximos e revela furtivos.",
    descriptionEn: "Boosts damage and range of nearby allies and reveals hidden enemies.",
    element: "sombra",
    role: "support",
    cost: 125,
    damage: 0,
    range: 4.45,
    cooldown: 0,
    projectileSpeed: 0,
    color: "#baadf4",
    visual: "runebell",
    targets: "none",
    support: { radius: 4.45, damage: 0.22, range: 0.16, reveal: true },
    levels: [
      {
        cost: 100,
        damage: 0,
        range: 5.1,
        cooldown: 0,
        support: { radius: 5.1, damage: 0.32, range: 0.21, reveal: true },
      },
      { cost: 198, damage: 0, range: 5.7, cooldown: 0 },
    ],
    evolution: {
      ...pokemonAppearance(437, "Bronzong"),
      description: "Sua ressonância fortalece mais aliados em uma área maior.",
      descriptionEn: "Its resonance adds stronger bonuses across a larger area.",
      visual: "runebell-evolved",
      support: { radius: 5.7, damage: 0.49, range: 0.27, reveal: true },
    },
  },
  {
    id: "voltwing",
    ...pokemonAppearance(25, "Pikachu"),
    portrait: pokemonPortrait(25),
    idlePose: "Impactrueno",
    description: "Caça voadores com descargas de dano ampliado.",
    descriptionEn: "Hunts flying enemies with high-powered discharges.",
    element: "faisca",
    role: "antiAir",
    cost: 143,
    damage: 22,
    range: 5.15,
    cooldown: 0.83,
    projectileSpeed: 18,
    color: "#f1d071",
    visual: "voltwing",
    targets: "any",
    airMultiplier: 2.3,
    levels: [
      { cost: 120, damage: 35, range: 5.65, cooldown: 0.72 },
      { cost: 212, damage: 55, range: 6.15, cooldown: 0.63 },
    ],
    evolution: {
      ...pokemonAppearance(26, "Raichu"),
      description: "Descargas mais fortes interrompem o movimento dos alvos.",
      descriptionEn: "Stronger discharges interrupt enemy movement.",
      visual: "voltwing-evolved",
      airMultiplier: 2.9,
      status: { id: "stun", strength: 1, duration: 0.25 },
    },
  },
  {
    id: "gildmole",
    ...pokemonAppearance(52, "Meowth"),
    portrait: pokemonPortrait(52),
    description: "Gera moedas periodicamente com Dia de Pagamento enquanto uma onda está ativa.",
    descriptionEn: "Generates coins with Pay Day while a wave is active.",
    element: "pedra",
    role: "income",
    cost: 135,
    damage: 0,
    range: 0,
    cooldown: 0,
    projectileSpeed: 0,
    color: "#e2b154",
    visual: "gildmole",
    targets: "none",
    income: { amount: 15, interval: 5.5 },
    levels: [
      { cost: 96, damage: 0, range: 0, cooldown: 0, income: { amount: 24, interval: 5 } },
      { cost: 185, damage: 0, range: 0, cooldown: 0 },
    ],
    evolution: {
      ...pokemonAppearance(53, "Persian"),
      description: "Dia de Pagamento passa a gerar mais moedas em intervalos menores.",
      descriptionEn: "Pay Day generates more coins at shorter intervals.",
      visual: "gildmole-evolved",
      income: { amount: 42, interval: 4.5 },
    },
  },
];

export const creatureById: Readonly<Partial<Record<string, CreatureDefinition>>> =
  Object.fromEntries(creatures.map((creature) => [creature.id, creature]));

export function getCreatureStats(definition: CreatureDefinition, level: CreatureLevel): CreatureLevelDefinition {
  return level === 1 ? definition : definition.levels[level - 2];
}

export function getCreatureAppearance(definition: CreatureDefinition, level: CreatureLevel): CreatureAppearance {
  if (level === 1) return definition;
  if (level === 3) return definition.evolution;
  return definition.intermediate ?? {
    ...definition.evolution,
    description: definition.description,
    descriptionEn: definition.descriptionEn,
  };
}
