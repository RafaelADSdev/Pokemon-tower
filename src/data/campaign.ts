import { mapById } from './maps';
import type { MapDefinition, MapId, Waypoint } from './maps/types';
import { regionalEnemyIds, regionalFlavorIds, regionalGymAceIds } from './regionEnemies';
import type { WaveDefinition } from './waves/types';
import { gymThemes, regionDefinitions, type CampaignRegionId, type GymDefinition, type GymSpecialty } from './campaign/gyms';
import { makeGymWaves, makeTournamentWaves } from './campaign/waves';

export type { CampaignRegionId, GymSpecialty } from './campaign/gyms';

interface ExpeditionBase {
  readonly id: string;
  readonly map: MapDefinition;
  readonly waves: readonly WaveDefinition[];
  readonly featuredEnemies: readonly string[];
}

export interface GymExpedition extends ExpeditionBase {
  readonly kind: 'gym';
  readonly regionId: CampaignRegionId;
  readonly city: string;
  readonly leader: string;
  readonly badge: string;
  readonly specialty: GymSpecialty;
  readonly type: string;
  readonly typeEn: string;
  readonly order: number;
}

export interface TournamentExpedition extends ExpeditionBase {
  readonly id: 'final-tournament';
  readonly kind: 'tournament';
}

export type CampaignExpedition = GymExpedition | TournamentExpedition;

export interface CampaignRegion {
  readonly id: CampaignRegionId;
  readonly name: string;
  readonly nameEn: string;
  readonly description: string;
  readonly descriptionEn: string;
  readonly cover: MapId;
  readonly gyms: readonly GymExpedition[];
}

function varyBoard(board: MapDefinition, variant: number) {
  const xSign = variant % 2 === 0 ? 1 : -1;
  const zSign = Math.floor(variant / 2) % 2 === 0 ? 1 : -1;
  const bend = Math.floor(variant / 4) * 0.06;
  const halfWidth = board.size.width / 2;
  const transform = ([x, z]: Waypoint): Waypoint => [
    x * xSign,
    z * zSign + (1 - (x / halfWidth) ** 2) * bend,
  ];

  return {
    paths: board.paths.map((path) => path.map(transform)),
    slots: board.slots.map(({ id, position }) => ({ id, position: transform(position) })),
  };
}

function makeGym(regionId: CampaignRegionId, gym: GymDefinition, regionIndex: number, gymIndex: number): GymExpedition {
  const theme = gymThemes[gym.specialty];
  const board = mapById[theme.board];
  const variant = regionIndex * 8 + gymIndex;
  const map: MapDefinition = {
    ...board,
    ...varyBoard(board, variant),
    name: `Ginásio de ${gym.city}`,
    nameEn: `${gym.city} Gym`,
    subtitle: `${gym.leader} · ${theme.name}`,
    subtitleEn: `${gym.leader} · ${theme.nameEn}`,
    description: `Defenda a arena contra a equipe de ${gym.leader} e conquiste a insígnia ${gym.badge}.`,
    descriptionEn: `Defend the arena against ${gym.leader} and earn the ${gym.badge} Badge.`,
    difficulty: variant < 3 ? 'intro' : variant < 16 ? 'standard' : 'expert',
    theme: {
      ...board.theme,
      terrain: theme.terrain,
      trail: theme.trail,
      accent: theme.accent,
      atmosphere: theme.atmosphere,
    },
  };
  const roster = regionalEnemyIds[regionId];
  const signature = gym.specialty === 'flying'
    ? roster.flying
    : regionalFlavorIds[regionId][theme.element];
  const ace = regionalGymAceIds[regionId][gymIndex];

  return {
    id: `${regionId}-${gym.slug}`,
    kind: 'gym',
    regionId,
    city: gym.city,
    leader: gym.leader,
    badge: gym.badge,
    specialty: gym.specialty,
    type: theme.name,
    typeEn: theme.nameEn,
    order: gymIndex + 1,
    map,
    waves: makeGymWaves(roster, signature, ace, regionIndex, gymIndex, map.paths.length),
    featuredEnemies: [...new Set([ace, signature, roster.normal])],
  };
}

export const campaignRegions: readonly CampaignRegion[] = regionDefinitions.map(({ gyms, ...region }, regionIndex) => ({
  ...region,
  gyms: gyms.map((gym, gymIndex) => makeGym(region.id, gym, regionIndex, gymIndex)),
}));

const tournamentMap: MapDefinition = {
  ...mapById.cave,
  ...varyBoard(mapById.cave, 24),
  name: 'Torneio Final',
  nameEn: 'Final Tournament',
  subtitle: 'Liga das três regiões',
  subtitleEn: 'League of the three regions',
  description: 'Defenda duas rotas contra as equipes de Kanto, Johto e Hoenn e vença a final da Liga.',
  descriptionEn: 'Hold two routes against teams from Kanto, Johto and Hoenn to win the League final.',
  difficulty: 'expert',
  theme: { biome: 'cave', terrain: '#403f53', trail: '#caad89', edge: '#34283a', accent: '#ffce83', atmosphere: '#211626' },
};

export const finalTournament: TournamentExpedition = {
  id: 'final-tournament',
  kind: 'tournament',
  map: tournamentMap,
  waves: makeTournamentWaves(tournamentMap.paths.length),
  featuredEnemies: [regionalEnemyIds.kanto.healBoss, regionalEnemyIds.johto.hasteBoss, regionalEnemyIds.hoenn.hasteBoss],
};

export const campaignExpeditions: readonly CampaignExpedition[] = [
  ...campaignRegions.flatMap(({ gyms }) => gyms),
  finalTournament,
];

const expeditionById = new Map(campaignExpeditions.map((expedition) => [expedition.id, expedition]));

export function getCampaignExpedition(id: string): CampaignExpedition | undefined {
  return expeditionById.get(id);
}
