import { mapById } from './maps';
import type { MapDefinition, MapId, Waypoint } from './maps/types';
import { regionalEnemyIds, regionalFlavorIds, regionalGymAceIds } from './regionEnemies';
import type { WaveDefinition } from './waves/types';
import { gymThemes, regionDefinitions, type CampaignRegionId, type GymDefinition, type GymSpecialty } from './campaign/gyms';
import { makeGymQualifierWaves, makeGymWaves, makeRouteWaves, makeTournamentWaves } from './campaign/waves';

export type { CampaignRegionId, GymSpecialty } from './campaign/gyms';

interface ExpeditionBase {
  readonly id: string;
  readonly map: MapDefinition;
  readonly waves: readonly WaveDefinition[];
  readonly featuredEnemies: readonly string[];
}

interface RegionalExpedition extends ExpeditionBase {
  readonly regionId: CampaignRegionId;
  readonly order: number;
}

export interface RouteExpedition extends RegionalExpedition {
  readonly kind: 'route';
  readonly gymId: string;
  readonly routeNumber: 1 | 2 | 3;
}

export interface GymQualifierExpedition extends RegionalExpedition {
  readonly kind: 'gym-qualifier';
  readonly gymId: string;
}

export interface GymExpedition extends RegionalExpedition {
  readonly kind: 'gym';
  readonly city: string;
  readonly leader: string;
  readonly badge: string;
  readonly specialty: GymSpecialty;
  readonly type: string;
  readonly typeEn: string;
  readonly routes: readonly RouteExpedition[];
  readonly qualifier: GymQualifierExpedition;
}

export interface TournamentExpedition extends ExpeditionBase {
  readonly id: 'final-tournament';
  readonly kind: 'tournament';
}

export type CampaignExpedition = RouteExpedition | GymQualifierExpedition | GymExpedition | TournamentExpedition;

export interface CampaignRegion {
  readonly id: CampaignRegionId;
  readonly name: string;
  readonly nameEn: string;
  readonly description: string;
  readonly descriptionEn: string;
  readonly cover: MapId;
  readonly gyms: readonly GymExpedition[];
}

function varyBoard(board: MapDefinition, variant: number, bendStep = 0.06) {
  const xSign = variant % 2 === 0 ? 1 : -1;
  const zSign = Math.floor(variant / 2) % 2 === 0 ? 1 : -1;
  const bend = Math.floor(variant / 4) * bendStep;
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

const routeBoards = ['forest', 'cave', 'volcano'] as const;
const routeTitles = {
  forest: ['Trilha do Bosque', 'Woodland Trail'],
  cave: ['Passagem da Gruta', 'Cavern Pass'],
  volcano: ['Travessia da Caldeira', 'Caldera Crossing'],
} as const satisfies Record<MapId, readonly [string, string]>;

function featuredOpponents(waves: readonly WaveDefinition[]) {
  const groups = [...(waves.at(-1)?.groups ?? []), ...waves[0].groups];
  return [...new Set(groups.map(({ enemyId }) => enemyId))].slice(0, 3);
}

function makeGym(regionId: CampaignRegionId, gym: GymDefinition, regionIndex: number, gymIndex: number): GymExpedition {
  const id = `${regionId}-${gym.slug}`;
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
  const order = gymIndex + 1;
  const routes = ([1, 2, 3] as const).map((routeNumber): RouteExpedition => {
    const stage = routeNumber - 1;
    const routeBoard = mapById[routeBoards[(regionIndex + gymIndex + stage) % routeBoards.length]];
    const [title, titleEn] = routeTitles[routeBoard.id];
    const ordinal = gymIndex * 3 + routeNumber;
    const routeMap: MapDefinition = {
      ...routeBoard,
      ...varyBoard(routeBoard, variant * 3 + stage, 0.03),
      name: `Rota ${ordinal} · ${title}`,
      nameEn: `Route ${ordinal} · ${titleEn}`,
      subtitle: `A caminho de ${gym.city}`,
      subtitleEn: `On the way to ${gym.city}`,
      description: `Defenda a rota para avançar até o Ginásio de ${gym.city}.`,
      descriptionEn: `Defend the route to advance toward ${gym.city} Gym.`,
      difficulty: routeNumber === 1 && gymIndex < 2 ? 'intro' : 'standard',
    };
    const waves = makeRouteWaves(roster, signature, regionIndex, gymIndex, routeNumber, routeMap.paths.length);
    return {
      id: `${id}-route-${routeNumber}`,
      kind: 'route',
      regionId,
      gymId: id,
      order,
      routeNumber,
      map: routeMap,
      waves,
      featuredEnemies: featuredOpponents(waves),
    };
  });
  const qualifierMap: MapDefinition = {
    ...map,
    ...varyBoard(board, (variant + 2) % 24),
    name: `Classificação de ${gym.city}`,
    nameEn: `${gym.city} Qualifier`,
    description: `Vença os treinadores do ginásio para desafiar ${gym.leader}.`,
    descriptionEn: `Defeat the Gym Trainers to challenge ${gym.leader}.`,
  };
  const qualifierWaves = makeGymQualifierWaves(roster, signature, regionIndex, gymIndex, qualifierMap.paths.length);

  return {
    id,
    kind: 'gym',
    regionId,
    city: gym.city,
    leader: gym.leader,
    badge: gym.badge,
    specialty: gym.specialty,
    type: theme.name,
    typeEn: theme.nameEn,
    order,
    map,
    waves: makeGymWaves(roster, signature, ace, regionIndex, gymIndex, map.paths.length),
    featuredEnemies: [...new Set([ace, signature, roster.normal])],
    routes,
    qualifier: {
      id: `${id}-qualifier`,
      kind: 'gym-qualifier',
      regionId,
      gymId: id,
      order,
      map: qualifierMap,
      waves: qualifierWaves,
      featuredEnemies: featuredOpponents(qualifierWaves),
    },
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
  ...campaignRegions.flatMap(({ gyms }) => gyms.flatMap((gym) => [...gym.routes, gym.qualifier, gym])),
  finalTournament,
];

const expeditionById = new Map(campaignExpeditions.map((expedition) => [expedition.id, expedition]));

export function getCampaignExpedition(id: string): CampaignExpedition | undefined {
  return expeditionById.get(id);
}
