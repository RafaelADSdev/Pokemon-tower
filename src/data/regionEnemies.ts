import { elementById, type ElementId } from './elements';
import type { EnemyDefinition } from './enemies';
import { pokemonAppearance } from './pokemon';

export const enemyRegions = ['kanto', 'johto', 'hoenn'] as const;
export type EnemyRegion = (typeof enemyRegions)[number];

type RoleProfile = Pick<EnemyDefinition,
  'description' | 'descriptionEn' | 'health' | 'speed' | 'reward' | 'leakDamage' | 'visual' | 'traits'
>;

const roleProfiles = {
  normal: {
    description: 'Avança em grupo pela trilha.',
    descriptionEn: 'Advances along the trail in groups.',
    health: 44, speed: 2.35, reward: 8, leakDamage: 1, visual: 'mossmite', traits: {},
  },
  fast: {
    description: 'É frágil, mas cruza o terreno em alta velocidade.',
    descriptionEn: 'Frailer than most, it races along the trail at high speed.',
    health: 34, speed: 3.55, reward: 9, leakDamage: 1, visual: 'reedrunner', traits: {},
  },
  tank: {
    description: 'Anda devagar e suporta vários golpes.',
    descriptionEn: 'Moves slowly and withstands repeated blows.',
    health: 138, speed: 1.52, reward: 19, leakDamage: 2, visual: 'flinthide', traits: {},
  },
  flying: {
    description: 'Voa até a saída e evita ataques terrestres.',
    descriptionEn: 'Flies toward the exit and avoids ground attacks.',
    health: 59, speed: 3.12, reward: 14, leakDamage: 1, visual: 'galefoal', traits: { flying: true },
  },
  regen: {
    description: 'Recupera vida continuamente enquanto avança.',
    descriptionEn: 'Continuously recovers health while advancing.',
    health: 87, speed: 2.12, reward: 12, leakDamage: 1, visual: 'springtail', traits: { regen: 5.8 },
  },
  shield: {
    description: 'Um escudo de Pedra absorve os primeiros golpes.',
    descriptionEn: 'A Stone shield absorbs the first hits.',
    health: 77, speed: 2.03, reward: 17, leakDamage: 1, visual: 'cindershield',
    traits: { shield: { element: 'pedra', health: 63 } },
  },
  split: {
    description: 'Dois Pokémon menores assumem seu lugar ao ser derrotado.',
    descriptionEn: 'Two smaller Pokémon take its place when it is defeated.',
    health: 68, speed: 2.2, reward: 10, leakDamage: 1, visual: 'hollowpod', traits: {},
  },
  stealth: {
    description: 'Fica invisível às torres até que um suporte o revele.',
    descriptionEn: 'Hides from towers until a support Pokémon reveals it.',
    health: 53, speed: 2.5, reward: 15, leakDamage: 1, visual: 'mistveil', traits: { stealth: true },
  },
  healBoss: {
    description: 'Chefe que cura os inimigos próximos a cada pulso.',
    descriptionEn: 'This boss heals nearby enemies with each pulse.',
    health: 586, speed: 1.24, reward: 110, leakDamage: 5, visual: 'marrowcrown',
    traits: { boss: { kind: 'heal', radius: 4.1, strength: 47, interval: 3 } },
  },
  hasteBoss: {
    description: 'Chefe que acelera os inimigos próximos a cada pulso.',
    descriptionEn: 'This boss speeds up nearby enemies with each pulse.',
    health: 692, speed: 1.42, reward: 130, leakDamage: 6, visual: 'ashdrummer',
    traits: { boss: { kind: 'haste', radius: 4.4, strength: 0.38, interval: 4.1, duration: 2.8 } },
  },
} satisfies Record<string, RoleProfile>;

type EnemyRole = keyof typeof roleProfiles;
type Species = readonly [dex: number, name: string, element: ElementId];
type GymAce = readonly [dex: number, name: string, element: ElementId, flight?: 'flying'];
type SupportingSpecies = EnemyRole | Species;

const regionalSpecies = {
  kanto: {
    normal: [60, 'Poliwag', 'mare'],
    fast: [128, 'Tauros', 'faisca'],
    tank: [50, 'Diglett', 'pedra'],
    flying: [42, 'Golbat', 'mare'],
    regen: [35, 'Clefairy', 'folha'],
    shield: [120, 'Staryu', 'mare'],
    split: [132, 'Ditto', 'pedra'],
    stealth: [137, 'Porygon', 'sombra'],
    healBoss: [143, 'Snorlax', 'folha'],
    hasteBoss: [147, 'Dratini', 'brasa'],
  },
  johto: {
    normal: [165, 'Ledyba', 'folha'],
    fast: [162, 'Furret', 'faisca'],
    tank: [205, 'Forretress', 'pedra'],
    flying: [207, 'Gligar', 'mare'],
    regen: [188, 'Skiploom', 'folha'],
    shield: [219, 'Magcargo', 'brasa'],
    split: [166, 'Ledian', 'pedra'],
    stealth: [198, 'Murkrow', 'sombra'],
    healBoss: [242, 'Blissey', 'folha'],
    hasteBoss: [248, 'Tyranitar', 'brasa'],
  },
  hoenn: {
    normal: [273, 'Seedot', 'folha'],
    fast: [300, 'Skitty', 'faisca'],
    tank: [304, 'Aron', 'pedra'],
    flying: [278, 'Wingull', 'mare'],
    regen: [285, 'Shroomish', 'folha'],
    shield: [322, 'Numel', 'brasa'],
    split: [266, 'Silcoon', 'pedra'],
    stealth: [352, 'Kecleon', 'sombra'],
    healBoss: [357, 'Tropius', 'folha'],
    hasteBoss: [373, 'Salamence', 'brasa'],
  },
} as const satisfies Record<EnemyRegion, Record<EnemyRole, Species>>;

const regionalSupportingSpecies = {
  kanto: {
    brasa: [4, 'Charmander', 'brasa'], mare: 'normal', folha: [43, 'Oddish', 'folha'],
    faisca: [100, 'Voltorb', 'faisca'], pedra: 'tank', sombra: [23, 'Ekans', 'sombra'],
  },
  johto: {
    brasa: [218, 'Slugma', 'brasa'], mare: [194, 'Wooper', 'mare'], folha: 'regen',
    faisca: [179, 'Mareep', 'faisca'], pedra: 'tank', sombra: [228, 'Houndour', 'sombra'],
  },
  hoenn: {
    brasa: 'shield', mare: [339, 'Barboach', 'mare'], folha: 'normal',
    faisca: [309, 'Electrike', 'faisca'], pedra: 'tank', sombra: [355, 'Duskull', 'sombra'],
  },
} as const satisfies Record<EnemyRegion, Record<ElementId, SupportingSpecies>>;

const gymAces = {
  kanto: [
    [95, 'Onix', 'pedra'], [121, 'Starmie', 'mare'], [26, 'Raichu', 'faisca'], [45, 'Vileplume', 'folha'],
    [49, 'Venomoth', 'sombra'], [65, 'Alakazam', 'sombra'], [59, 'Arcanine', 'brasa'], [112, 'Rhydon', 'pedra'],
  ],
  johto: [
    [164, 'Noctowl', 'mare', 'flying'], [212, 'Scizor', 'folha'], [241, 'Miltank', 'folha'], [200, 'Misdreavus', 'sombra'],
    [237, 'Hitmontop', 'pedra'], [208, 'Steelix', 'pedra'], [221, 'Piloswine', 'mare'], [230, 'Kingdra', 'mare'],
  ],
  hoenn: [
    [299, 'Nosepass', 'pedra'], [297, 'Hariyama', 'pedra'], [310, 'Manectric', 'faisca'], [324, 'Torkoal', 'brasa'],
    [289, 'Slaking', 'folha'], [334, 'Altaria', 'mare', 'flying'], [337, 'Solrock', 'sombra'], [350, 'Milotic', 'mare'],
  ],
} as const satisfies Record<EnemyRegion, readonly GymAce[]>;

function regionalId(dex: number) {
  return `pk-${dex}`;
}

function regionalRecord<T>(get: (region: EnemyRegion) => T): Readonly<Record<EnemyRegion, T>> {
  return Object.fromEntries(enemyRegions.map((region) => [region, get(region)])) as Readonly<Record<EnemyRegion, T>>;
}

export const regionalEnemyIds = regionalRecord((region) =>
  Object.fromEntries(Object.entries(regionalSpecies[region]).map(([role, [dex]]) => [role, regionalId(dex)])) as Readonly<Record<EnemyRole, string>>,
);

export const regionalFlavorIds = regionalRecord((region) => {
  const supportingSpecies: Record<ElementId, SupportingSpecies> = regionalSupportingSpecies[region];
  return Object.fromEntries(Object.entries(supportingSpecies).map(([element, supporting]) => [
    element,
    typeof supporting === 'string' ? regionalEnemyIds[region][supporting] : regionalId(supporting[0]),
  ])) as Readonly<Record<ElementId, string>>;
});

export const regionalGymAceIds = regionalRecord((region): readonly string[] =>
  gymAces[region].map(([dex]) => regionalId(dex)),
);

function createEnemy(species: Species, role: EnemyRole, region: EnemyRegion): EnemyDefinition {
  const [dex, name, element] = species;
  const profile = roleProfiles[role];
  return {
    ...profile,
    id: regionalId(dex),
    ...pokemonAppearance(dex, name),
    element,
    color: elementById[element].color,
    traits: role === 'split' ? { split: { count: 2, enemyId: regionalEnemyIds[region].normal } } : profile.traits,
  };
}

function createGymAce(ace: GymAce, region: EnemyRegion, index: number): EnemyDefinition {
  const [dex, name, element, flight] = ace;
  const boss = createEnemy([dex, name, element], index % 2 === 0 ? 'healBoss' : 'hasteBoss', region);
  return {
    ...boss,
    health: 430 + index * 28,
    speed: 1.25,
    reward: 90 + index * 5,
    leakDamage: 4,
    traits: flight === 'flying' ? { ...boss.traits, flying: true } : boss.traits,
  };
}

export const regionalEnemies: readonly EnemyDefinition[] = enemyRegions.flatMap((region) => [
  ...Object.entries(regionalSpecies[region]).map(([role, species]) => createEnemy(species, role as EnemyRole, region)),
  ...Object.values(regionalSupportingSpecies[region]).flatMap((species) =>
    typeof species === 'string' ? [] : [createEnemy(species, 'normal', region)],
  ),
  ...gymAces[region].map((ace, index) => createGymAce(ace, region, index)),
]);
