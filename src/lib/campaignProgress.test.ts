import { describe, expect, it } from 'vitest';
import { campaignRegions, finalTournament } from '@/data/campaign';
import { campaignGymTotal, countBadges, isExpeditionUnlocked, nextGym, parseExpeditionResults, previousGym } from './campaignProgress';

describe('gym and tournament unlocks', () => {
  it('starts each region at its first gym and unlocks its next gym after victory', () => {
    for (const { gyms } of campaignRegions) {
      const [first, second, third] = gyms;
      expect(isExpeditionUnlocked(first, {})).toBe(true);
      expect(isExpeditionUnlocked(second, {})).toBe(false);
      expect(isExpeditionUnlocked(second, { [first.id]: 12 })).toBe(true);
      expect(isExpeditionUnlocked(third, { [second.id]: 12 })).toBe(false);
      expect(nextGym(first)).toBe(second);
      expect(previousGym(second)).toBe(first);
    }
  });

  it('requires all 24 gym badges for the final, including after replaying a gym', () => {
    const gyms = campaignRegions.flatMap(({ gyms }) => gyms);
    const results = Object.fromEntries(gyms.map(({ id }) => [id, 12]));
    expect(campaignGymTotal).toBe(24);
    expect(countBadges({ ...results, [finalTournament.id]: 15 })).toBe(24);
    expect(countBadges(results, 'hoenn')).toBe(8);
    expect(isExpeditionUnlocked(finalTournament, results)).toBe(true);
    expect(isExpeditionUnlocked(finalTournament, { ...results, [gyms[0].id]: 0 })).toBe(false);
  });

  it('accepts only known expedition IDs with a valid positive victory result', () => {
    const [first, second, third, fourth] = campaignRegions[0].gyms;
    expect(parseExpeditionResults({ [first.id]: 18, [second.id]: 0, [third.id]: 22, [fourth.id]: 3.2, wrong: 20 }))
      .toEqual({ [first.id]: 18 });
  });
});
