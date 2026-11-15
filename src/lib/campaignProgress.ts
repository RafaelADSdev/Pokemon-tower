import { campaignExpeditions, campaignRegions, type CampaignExpedition, type GymExpedition } from '@/data/campaign';
import { gameRules } from '@/data/rules';

export type ExpeditionResults = Readonly<Partial<Record<string, number>>>;
export const campaignGymTotal = campaignRegions.reduce((total, region) => total + region.gyms.length, 0);

function gymLeg(gym: GymExpedition) {
  return [...gym.routes, gym.qualifier, gym];
}

const regionalJourneys = new Map(campaignRegions.map(({ id, gyms }) => [id, gyms.flatMap(gymLeg)]));

function hasVictory(expedition: CampaignExpedition, results: ExpeditionResults) {
  return (results[expedition.id] ?? 0) > 0;
}

export function parseExpeditionResults(value: unknown): ExpeditionResults {
  if (!value || typeof value !== 'object') return {};
  const results: Record<string, number> = {};
  for (const { id } of campaignExpeditions) {
    if (!Object.hasOwn(value, id)) continue;
    const lives = (value as Record<string, unknown>)[id];
    if (typeof lives === 'number' && Number.isInteger(lives) && lives > 0 && lives <= gameRules.startingLives) {
      results[id] = lives;
    }
  }
  return results;
}

export function countBadges(results: ExpeditionResults, regionId?: string) {
  return campaignRegions.reduce((total, region) => {
    if (regionId && region.id !== regionId) return total;
    return total + region.gyms.filter((gym) => hasVictory(gym, results)).length;
  }, 0);
}

export function expeditionPrerequisite(expedition: CampaignExpedition, results: ExpeditionResults) {
  if (expedition.kind === 'tournament') return undefined;
  const region = campaignRegions.find(({ id }) => id === expedition.regionId);
  const gym = region?.gyms[expedition.order - 1];
  if (!region || !gym) return undefined;

  const firstMissingGym = region.gyms.slice(0, expedition.order - 1).find((earlier) => !hasVictory(earlier, results));
  if (firstMissingGym) return gymLeg(firstMissingGym).find((step) => !hasVictory(step, results));

  // Older saves already contain the leader victory. The earlier battles in this leg can be replayed.
  if (hasVictory(gym, results)) return undefined;
  const leg = gymLeg(gym);
  const index = leg.findIndex(({ id }) => id === expedition.id);
  return leg.slice(0, index).find((step) => !hasVictory(step, results));
}

export function isExpeditionUnlocked(expedition: CampaignExpedition, results: ExpeditionResults) {
  if (expedition.kind === 'tournament') return countBadges(results) === campaignGymTotal;
  return regionalJourneys.get(expedition.regionId)?.some(({ id }) => id === expedition.id) === true &&
    !expeditionPrerequisite(expedition, results);
}

export function nextExpedition(expedition: CampaignExpedition) {
  if (expedition.kind === 'tournament') return undefined;
  const journey = regionalJourneys.get(expedition.regionId);
  const index = journey?.findIndex(({ id }) => id === expedition.id) ?? -1;
  return index >= 0 ? journey?.[index + 1] : undefined;
}
