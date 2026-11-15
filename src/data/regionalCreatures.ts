import { creatures, type CreatureDefinition, type CreatureRole } from './creatures';
import { pokemonAppearance, pokemonPortrait } from './pokemon';

export type RosterRegion = 'kanto' | 'johto' | 'hoenn';

type Species = readonly [dex: number, name: string];
type Family = readonly [base: Species, evolution: Species];
type Families = Partial<Record<CreatureRole, Family>>;

const families: Record<RosterRegion, Families> = {
  kanto: {
    support: [[63, 'Abra'], [65, 'Alakazam']],
  },
  johto: {
    rapid: [[155, 'Cyndaquil'], [157, 'Typhlosion']],
    splash: [[158, 'Totodile'], [159, 'Croconaw']],
    slow: [[152, 'Chikorita'], [154, 'Meganium']],
    dot: [[204, 'Pineco'], [205, 'Forretress']],
    sniper: [[246, 'Larvitar'], [248, 'Tyranitar']],
    support: [[175, 'Togepi'], [176, 'Togetic']],
    antiAir: [[179, 'Mareep'], [181, 'Ampharos']],
    income: [[191, 'Sunkern'], [192, 'Sunflora']],
  },
  hoenn: {
    rapid: [[255, 'Torchic'], [257, 'Blaziken']],
    splash: [[258, 'Mudkip'], [260, 'Swampert']],
    slow: [[252, 'Treecko'], [254, 'Sceptile']],
    dot: [[316, 'Gulpin'], [317, 'Swalot']],
    sniper: [[304, 'Aron'], [306, 'Aggron']],
    support: [[280, 'Ralts'], [282, 'Gardevoir']],
    antiAir: [[309, 'Electrike'], [310, 'Manectric']],
    income: [[263, 'Zigzagoon'], [264, 'Linoone']],
  },
};

function regionalize(creature: CreatureDefinition, family?: Family): CreatureDefinition {
  if (!family) return creature;
  const [base, evolution] = family;
  const income = creature.role === 'income';
  return {
    ...creature,
    ...pokemonAppearance(...base),
    portrait: pokemonPortrait(base[0]),
    idlePose: undefined,
    description: income ? 'Encontra moedas periodicamente enquanto uma onda está ativa.' : creature.description,
    descriptionEn: income ? 'Finds coins periodically while a wave is active.' : creature.descriptionEn,
    evolution: {
      ...creature.evolution,
      ...pokemonAppearance(...evolution),
      description: income ? 'Encontra mais moedas em intervalos menores.' : creature.evolution.description,
      descriptionEn: income ? 'Finds more coins at shorter intervals.' : creature.evolution.descriptionEn,
    },
  };
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
