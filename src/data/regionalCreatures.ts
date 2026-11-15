import { creatures, withIntermediateAppearance, type CreatureDefinition, type CreatureRole } from './creatures';
import { pokemonAppearance, pokemonPortrait } from './pokemon';

export type RosterRegion = 'kanto' | 'johto' | 'hoenn';

type Species = readonly [dex: number, name: string];
type Family = readonly [base: Species, evolution: Species] | readonly [base: Species, intermediate: Species, evolution: Species];
type Families = Partial<Record<CreatureRole, Family>>;

const families: Record<RosterRegion, Families> = {
  kanto: {
    support: [[63, 'Abra'], [64, 'Kadabra'], [65, 'Alakazam']],
  },
  johto: {
    rapid: [[155, 'Cyndaquil'], [156, 'Quilava'], [157, 'Typhlosion']],
    splash: [[158, 'Totodile'], [159, 'Croconaw'], [160, 'Feraligatr']],
    slow: [[152, 'Chikorita'], [153, 'Bayleef'], [154, 'Meganium']],
    dot: [[204, 'Pineco'], [205, 'Forretress']],
    sniper: [[246, 'Larvitar'], [247, 'Pupitar'], [248, 'Tyranitar']],
    support: [[175, 'Togepi'], [176, 'Togetic']],
    antiAir: [[179, 'Mareep'], [180, 'Flaaffy'], [181, 'Ampharos']],
    income: [[191, 'Sunkern'], [192, 'Sunflora']],
  },
  hoenn: {
    rapid: [[255, 'Torchic'], [256, 'Combusken'], [257, 'Blaziken']],
    splash: [[258, 'Mudkip'], [259, 'Marshtomp'], [260, 'Swampert']],
    slow: [[252, 'Treecko'], [253, 'Grovyle'], [254, 'Sceptile']],
    dot: [[316, 'Gulpin'], [317, 'Swalot']],
    sniper: [[304, 'Aron'], [305, 'Lairon'], [306, 'Aggron']],
    support: [[280, 'Ralts'], [281, 'Kirlia'], [282, 'Gardevoir']],
    antiAir: [[309, 'Electrike'], [310, 'Manectric']],
    income: [[263, 'Zigzagoon'], [264, 'Linoone']],
  },
};

function regionalize(creature: CreatureDefinition, family?: Family): CreatureDefinition {
  if (!family) return creature;
  const [base, next, final] = family;
  const income = creature.role === 'income';
  const definition: CreatureDefinition = {
    ...creature,
    ...pokemonAppearance(...base),
    portrait: pokemonPortrait(base[0]),
    idlePose: undefined,
    intermediate: undefined,
    description: income ? 'Encontra moedas periodicamente enquanto uma onda está ativa.' : creature.description,
    descriptionEn: income ? 'Finds coins periodically while a wave is active.' : creature.descriptionEn,
    evolution: {
      ...creature.evolution,
      ...pokemonAppearance(...(final ?? next)),
      description: income ? 'Encontra mais moedas em intervalos menores.' : creature.evolution.description,
      descriptionEn: income ? 'Finds more coins at shorter intervals.' : creature.evolution.descriptionEn,
    },
  };
  return final ? withIntermediateAppearance(definition, ...next) : definition;
}

export const regionalRosters: Readonly<Record<RosterRegion, readonly CreatureDefinition[]>> = {
  kanto: creatures.map((creature) => regionalize(creature, families.kanto[creature.role])),
  johto: creatures.map((creature) => regionalize(creature, families.johto[creature.role])),
  hoenn: creatures.map((creature) => regionalize(creature, families.hoenn[creature.role])),
};

const tournamentRegions: Record<CreatureRole, RosterRegion> = {
  rapid: 'kanto', splash: 'hoenn', slow: 'johto',
  dot: 'johto', sniper: 'hoenn', support: 'hoenn', antiAir: 'kanto', income: 'kanto',
};

export const tournamentRoster = creatures.map((creature) =>
  regionalize(creature, families[tournamentRegions[creature.role]][creature.role]));
