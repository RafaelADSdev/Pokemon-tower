import { campaignExpeditions, campaignRegions } from '@/data/campaign';
import type { CampaignExpedition } from '@/data/campaign';
import { gameRules } from '@/data/rules';

export type ExpeditionResults = Readonly<Partial<Record<string, number>>>;
export const campaignGymTotal = campaignRegions.reduce((total, region) => total + region.gyms.length, 0);

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
    return total + region.gyms.filter(({ id }) => (results[id] ?? 0) > 0).length;
  }, 0);
}

export function isExpeditionUnlocked(expedition: CampaignExpedition, results: ExpeditionResults) {
  if (expedition.kind === 'tournament') return countBadges(results) === campaignGymTotal;
  const region = campaignRegions.find(({ id }) => id === expedition.regionId);
  if (!region) return false;
  return region.gyms.slice(0, expedition.order - 1).every(({ id }) => (results[id] ?? 0) > 0);
}

export function previousGym(expedition: CampaignExpedition) {
  if (expedition.kind === 'tournament' || expedition.order <= 1) return undefined;
  return campaignRegions.find(({ id }) => id === expedition.regionId)?.gyms[expedition.order - 2];
}

export function nextGym(expedition: CampaignExpedition) {
  if (expedition.kind === 'tournament') return undefined;
  return campaignRegions.find(({ id }) => id === expedition.regionId)?.gyms[expedition.order];
}
