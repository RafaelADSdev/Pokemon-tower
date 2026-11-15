import type { ElementId } from '../elements';
import type { MapId } from '../maps/types';

type GymTheme = {
  readonly name: string;
  readonly nameEn: string;
  readonly element: ElementId;
  readonly board: MapId;
  readonly terrain: string;
  readonly trail: string;
  readonly accent: string;
  readonly atmosphere: string;
};

export const gymThemes = {
  rock: { name: 'Pedra', nameEn: 'Rock', element: 'pedra', board: 'cave', terrain: '#514c45', trail: '#bfa88d', accent: '#ffd28c', atmosphere: '#211d1b' },
  water: { name: 'Água', nameEn: 'Water', element: 'mare', board: 'cave', terrain: '#345064', trail: '#a0b6bb', accent: '#80dbf9', atmosphere: '#102331' },
  electric: { name: 'Elétrico', nameEn: 'Electric', element: 'faisca', board: 'cave', terrain: '#53533d', trail: '#bdb483', accent: '#ffe065', atmosphere: '#242219' },
  grass: { name: 'Planta', nameEn: 'Grass', element: 'folha', board: 'forest', terrain: '#305638', trail: '#bba075', accent: '#b8e77d', atmosphere: '#0f2217' },
  poison: { name: 'Venenoso', nameEn: 'Poison', element: 'sombra', board: 'forest', terrain: '#3e4451', trail: '#b3a482', accent: '#e0a9ee', atmosphere: '#202134' },
  psychic: { name: 'Psíquico', nameEn: 'Psychic', element: 'sombra', board: 'cave', terrain: '#504863', trail: '#bca0bb', accent: '#f7a8dc', atmosphere: '#261c36' },
  fire: { name: 'Fogo', nameEn: 'Fire', element: 'brasa', board: 'volcano', terrain: '#5b3932', trail: '#c29573', accent: '#ff9f5f', atmosphere: '#301b18' },
  ground: { name: 'Terrestre', nameEn: 'Ground', element: 'pedra', board: 'volcano', terrain: '#655147', trail: '#c9a782', accent: '#dfbc7d', atmosphere: '#2a241a' },
  flying: { name: 'Voador', nameEn: 'Flying', element: 'mare', board: 'forest', terrain: '#395650', trail: '#b7b99a', accent: '#abd8fe', atmosphere: '#142a31' },
  bug: { name: 'Inseto', nameEn: 'Bug', element: 'folha', board: 'forest', terrain: '#465739', trail: '#c2a673', accent: '#d7e788', atmosphere: '#1b2412' },
  normal: { name: 'Normal', nameEn: 'Normal', element: 'pedra', board: 'forest', terrain: '#4c5647', trail: '#c3a992', accent: '#ffe0ca', atmosphere: '#232526' },
  ghost: { name: 'Fantasma', nameEn: 'Ghost', element: 'sombra', board: 'cave', terrain: '#423d54', trail: '#a499b9', accent: '#c8a6ff', atmosphere: '#17172a' },
  fighting: { name: 'Lutador', nameEn: 'Fighting', element: 'brasa', board: 'volcano', terrain: '#563d39', trail: '#bd9a7c', accent: '#ed9c83', atmosphere: '#2c1b1a' },
  steel: { name: 'Aço', nameEn: 'Steel', element: 'pedra', board: 'cave', terrain: '#414e55', trail: '#a6adb0', accent: '#c7e9ec', atmosphere: '#1c2329' },
  ice: { name: 'Gelo', nameEn: 'Ice', element: 'mare', board: 'cave', terrain: '#416171', trail: '#c5d9d8', accent: '#aff2fa', atmosphere: '#17303b' },
  dragon: { name: 'Dragão', nameEn: 'Dragon', element: 'brasa', board: 'volcano', terrain: '#4f4356', trail: '#bba298', accent: '#eba2a5', atmosphere: '#241c30' },
} as const satisfies Record<string, GymTheme>;

export type GymSpecialty = keyof typeof gymThemes;

export interface GymDefinition {
  readonly slug: string;
  readonly city: string;
  readonly leader: string;
  readonly badge: string;
  readonly specialty: GymSpecialty;
  readonly arenaColor: string;
}

type RegionDefinition = {
  readonly id: string;
  readonly name: string;
  readonly nameEn: string;
  readonly description: string;
  readonly descriptionEn: string;
  readonly cover: MapId;
  readonly gyms: readonly GymDefinition[];
};

export const regionDefinitions = [
  {
    id: 'kanto',
    name: 'Kanto',
    nameEn: 'Kanto',
    description: 'Comece em Pewter e siga pelos oito ginásios da primeira região.',
    descriptionEn: 'Start in Pewter and take on the eight gyms of the first region.',
    cover: 'forest',
    gyms: [
      { slug: 'pewter', city: 'Pewter', leader: 'Brock', badge: 'Boulder', specialty: 'rock', arenaColor: '#aa7954' },
      { slug: 'cerulean', city: 'Cerulean', leader: 'Misty', badge: 'Cascade', specialty: 'water', arenaColor: '#218cc5' },
      { slug: 'vermilion', city: 'Vermilion', leader: 'Lt. Surge', badge: 'Thunder', specialty: 'electric', arenaColor: '#cd8b24' },
      { slug: 'celadon', city: 'Celadon', leader: 'Erika', badge: 'Rainbow', specialty: 'grass', arenaColor: '#548e48' },
      { slug: 'fuchsia', city: 'Fuchsia', leader: 'Koga', badge: 'Soul', specialty: 'poison', arenaColor: '#934791' },
      { slug: 'saffron', city: 'Saffron', leader: 'Sabrina', badge: 'Marsh', specialty: 'psychic', arenaColor: '#a95389' },
      { slug: 'cinnabar', city: 'Cinnabar', leader: 'Blaine', badge: 'Volcano', specialty: 'fire', arenaColor: '#be4c3a' },
      { slug: 'viridian', city: 'Viridian', leader: 'Giovanni', badge: 'Earth', specialty: 'ground', arenaColor: '#a37a45' },
    ],
  },
  {
    id: 'johto',
    name: 'Johto',
    nameEn: 'Johto',
    description: 'Passe pelas cidades históricas de Johto até o ginásio de Blackthorn.',
    descriptionEn: 'Travel through Johto’s historic towns to the Blackthorn Gym.',
    cover: 'cave',
    gyms: [
      { slug: 'violet', city: 'Violet', leader: 'Falkner', badge: 'Zephyr', specialty: 'flying', arenaColor: '#677cc2' },
      { slug: 'azalea', city: 'Azalea', leader: 'Bugsy', badge: 'Hive', specialty: 'bug', arenaColor: '#9c9740' },
      { slug: 'goldenrod', city: 'Goldenrod', leader: 'Whitney', badge: 'Plain', specialty: 'normal', arenaColor: '#ca7f94' },
      { slug: 'ecruteak', city: 'Ecruteak', leader: 'Morty', badge: 'Fog', specialty: 'ghost', arenaColor: '#705bb3' },
      { slug: 'cianwood', city: 'Cianwood', leader: 'Chuck', badge: 'Storm', specialty: 'fighting', arenaColor: '#a9563f' },
      { slug: 'olivine', city: 'Olivine', leader: 'Jasmine', badge: 'Mineral', specialty: 'steel', arenaColor: '#638998' },
      { slug: 'mahogany', city: 'Mahogany', leader: 'Pryce', badge: 'Glacier', specialty: 'ice', arenaColor: '#65a9c0' },
      { slug: 'blackthorn', city: 'Blackthorn', leader: 'Clair', badge: 'Rising', specialty: 'dragon', arenaColor: '#735392' },
    ],
  },
  {
    id: 'hoenn',
    name: 'Hoenn',
    nameEn: 'Hoenn',
    description: 'Atravesse as rotas costeiras e vulcânicas de Hoenn até Sootopolis.',
    descriptionEn: 'Cross Hoenn’s coastal and volcanic routes on the way to Sootopolis.',
    cover: 'volcano',
    gyms: [
      { slug: 'rustboro', city: 'Rustboro', leader: 'Roxanne', badge: 'Stone', specialty: 'rock', arenaColor: '#a6633d' },
      { slug: 'dewford', city: 'Dewford', leader: 'Brawly', badge: 'Knuckle', specialty: 'fighting', arenaColor: '#497a7a' },
      { slug: 'mauville', city: 'Mauville', leader: 'Wattson', badge: 'Dynamo', specialty: 'electric', arenaColor: '#92a53f' },
      { slug: 'lavaridge', city: 'Lavaridge', leader: 'Flannery', badge: 'Heat', specialty: 'fire', arenaColor: '#d16c3f' },
      { slug: 'petalburg', city: 'Petalburg', leader: 'Norman', badge: 'Balance', specialty: 'normal', arenaColor: '#8c725d' },
      { slug: 'fortree', city: 'Fortree', leader: 'Winona', badge: 'Feather', specialty: 'flying', arenaColor: '#598a70' },
      { slug: 'mossdeep', city: 'Mossdeep', leader: 'Tate & Liza', badge: 'Mind', specialty: 'psychic', arenaColor: '#675bb0' },
      { slug: 'sootopolis', city: 'Sootopolis', leader: 'Wallace', badge: 'Rain', specialty: 'water', arenaColor: '#288c86' },
    ],
  },
] as const satisfies readonly RegionDefinition[];

export type CampaignRegionId = (typeof regionDefinitions)[number]['id'];
