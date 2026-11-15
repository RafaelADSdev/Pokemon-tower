import type { ElementId } from "./elements";
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

interface CreatureAppearance {
  readonly name: string;
  readonly nameEn: string;
  readonly description: string;
  readonly descriptionEn: string;
  readonly visual: string;
  readonly model: string | null;
}

export type CreatureEvolution = CreatureAppearance & CreatureAbilities;
export type CreatureLevelDefinition = CreatureStats & CreatureAbilities;

export interface CreatureDefinition extends CreatureAppearance, CreatureAbilities, CreatureStats {
  readonly id: string;
  readonly element: ElementId;
  readonly role: CreatureRole;
  readonly projectileSpeed: number;
  readonly color: string;
  readonly targets: NonNullable<CreatureAbilities["targets"]>;
  readonly levels: readonly [CreatureLevelDefinition, CreatureLevelDefinition];
  readonly evolution: CreatureEvolution;
}

export const starterCreature: CreatureDefinition = {
  id: "emberling",
  name: "Braseco",
  nameEn: "Emberling",
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
  model: null,
  targets: "any",
  levels: [
    { cost: 110, damage: 29, range: 4.18, cooldown: 0.53 },
    { cost: 200, damage: 46, range: 4.5, cooldown: 0.46 },
  ],
  evolution: {
    name: "Coroabrasa",
    nameEn: "Embercrown",
    description: "Cada fagulha deixa o alvo em chamas.",
    descriptionEn: "Each spark leaves its target burning.",
    visual: "emberling-evolved",
    model: null,
    status: { id: "burn", strength: 20, duration: 2.4 },
  },
};

export const creatures: readonly CreatureDefinition[] = [
  starterCreature,
  {
    id: "rivermutt",
    name: "Marulgo",
    nameEn: "Rivermutt",
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
    model: null,
    targets: "ground",
    splash: 1.25,
    levels: [
      { cost: 128, damage: 59, range: 4.45, cooldown: 1.23 },
      { cost: 235, damage: 99, range: 4.9, cooldown: 1.11 },
    ],
    evolution: {
      name: "Marulgo Torrente",
      nameEn: "Torrent Rivermutt",
      description: "Uma onda maior abranda tudo que atinge.",
      descriptionEn: "A larger burst slows every enemy it hits.",
      visual: "rivermutt-evolved",
      model: null,
      splash: 2.05,
      status: { id: "slow", strength: 0.3, duration: 1.5 },
    },
  },
  {
    id: "glimleaf",
    name: "Verdevéu",
    nameEn: "Glimleaf",
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
    model: null,
    targets: "any",
    status: { id: "slow", strength: 0.36, duration: 1.8 },
    levels: [
      { cost: 91, damage: 22, range: 4.28, cooldown: 0.7 },
      { cost: 184, damage: 42, range: 4.75, cooldown: 0.62 },
    ],
    evolution: {
      name: "Véu-Ancião",
      nameEn: "Elder Glimleaf",
      description: "Espalha sementes em área e imobiliza brevemente os alvos.",
      descriptionEn: "Scatters seeds in an area and briefly stuns its targets.",
      visual: "glimleaf-evolved",
      model: null,
      splash: 1.35,
      status: { id: "stun", strength: 1, duration: 0.42 },
    },
  },
  {
    id: "duskspore",
    name: "Esporim",
    nameEn: "Duskspore",
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
    model: null,
    targets: "ground",
    status: { id: "poison", strength: 13, duration: 3.1 },
    levels: [
      { cost: 119, damage: 29, range: 4.4, cooldown: 0.69 },
      { cost: 209, damage: 49, range: 4.8, cooldown: 0.62 },
    ],
    evolution: {
      name: "Nuvem-Esporo",
      nameEn: "Sporecloud",
      description: "Espalha veneno forte em uma área ao redor do impacto.",
      descriptionEn: "Spreads a potent toxin around each point of impact.",
      visual: "duskspore-evolved",
      model: null,
      splash: 1.2,
      status: { id: "poison", strength: 22, duration: 4.25 },
    },
  },
  {
    id: "cragbeak",
    name: "Pedrabico",
    nameEn: "Cragbeak",
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
    model: null,
    targets: "any",
    levels: [
      { cost: 148, damage: 114, range: 7.0, cooldown: 1.86 },
      { cost: 252, damage: 179, range: 7.85, cooldown: 1.62 },
    ],
    evolution: {
      name: "Bico-Monólito",
      nameEn: "Monolith Beak",
      description: "Marca os alvos para que recebam mais dano de todas as fontes.",
      descriptionEn: "Marks targets to take more damage from every source.",
      visual: "cragbeak-evolved",
      model: null,
      status: { id: "mark", strength: 0.33, duration: 3.5 },
    },
  },
  {
    id: "runebell",
    name: "Sino-Runa",
    nameEn: "Runebell",
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
    model: null,
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
      name: "Runa Maior",
      nameEn: "Grand Runebell",
      description: "Sua ressonância fortalece mais aliados em uma área maior.",
      descriptionEn: "Its resonance adds stronger bonuses across a larger area.",
      visual: "runebell-evolved",
      model: null,
      support: { radius: 5.7, damage: 0.49, range: 0.27, reveal: true },
    },
  },
  {
    id: "voltwing",
    name: "Voltasa",
    nameEn: "Voltwing",
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
    model: null,
    targets: "any",
    airMultiplier: 2.3,
    levels: [
      { cost: 120, damage: 35, range: 5.65, cooldown: 0.72 },
      { cost: 212, damage: 55, range: 6.15, cooldown: 0.63 },
    ],
    evolution: {
      name: "Asa-Trovão",
      nameEn: "Thunderwing",
      description: "Descargas mais fortes interrompem o movimento dos alvos.",
      descriptionEn: "Stronger discharges interrupt enemy movement.",
      visual: "voltwing-evolved",
      model: null,
      airMultiplier: 2.9,
      status: { id: "stun", strength: 1, duration: 0.25 },
    },
  },
  {
    id: "gildmole",
    name: "Ourofuça",
    nameEn: "Gildmole",
    description: "Escava moedas periodicamente enquanto uma onda está ativa.",
    descriptionEn: "Digs up coins periodically while a wave is active.",
    element: "pedra",
    role: "income",
    cost: 135,
    damage: 0,
    range: 0,
    cooldown: 0,
    projectileSpeed: 0,
    color: "#e2b154",
    visual: "gildmole",
    model: null,
    targets: "none",
    income: { amount: 15, interval: 5.5 },
    levels: [
      { cost: 96, damage: 0, range: 0, cooldown: 0, income: { amount: 24, interval: 5 } },
      { cost: 185, damage: 0, range: 0, cooldown: 0 },
    ],
    evolution: {
      name: "Garimpaur",
      nameEn: "Goldburrow",
      description: "Encontra filões ricos de moedas com maior frequência.",
      descriptionEn: "Finds richer veins of coins at shorter intervals.",
      visual: "gildmole-evolved",
      model: null,
      income: { amount: 42, interval: 4.5 },
    },
  },
];

export const creatureById: Readonly<Partial<Record<string, CreatureDefinition>>> =
  Object.fromEntries(creatures.map((creature) => [creature.id, creature]));

export function getCreatureStats(definition: CreatureDefinition, level: CreatureLevel): CreatureLevelDefinition {
  return level === 1 ? definition : definition.levels[level - 2];
}
