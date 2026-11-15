import { describe, expect, it } from 'vitest';
import { campaignRegions, finalTournament } from '@/data/campaign';
import { campaignGymTotal, countBadges, expeditionPrerequisite, isExpeditionUnlocked, nextExpedition, parseExpeditionResults } from './campaignProgress';

describe('campaign battle unlocks', () => {
  it('opens each region at its first route and requires the whole leg in order', () => {
    for (const { gyms, id } of campaignRegions) {
      const [first, second] = gyms;
      const steps = [...first.routes, first.qualifier, first, second.routes[0]];
      const results: Record<string, number> = {};
      for (const [index, battle] of steps.entries()) {
        expect(isExpeditionUnlocked(battle, results)).toBe(true);
        const next = steps[index + 1];
        if (!next) break;
        expect(isExpeditionUnlocked(next, results)).toBe(false);
        expect(expeditionPrerequisite(next, results)).toBe(battle);
        expect(nextExpedition(battle)).toBe(next);
        results[battle.id] = 18;
        expect(countBadges(results, id)).toBe(battle === first ? 1 : 0);
      }
    }
  });

  it('preserves earned gym badges and replays when loading a save without routes', () => {
    const [original, next, later] = campaignRegions[0].gyms;
    const legacy = parseExpeditionResults({ [original.id]: 18 });
    expect(legacy).toEqual({ [original.id]: 18 });
    expect(countBadges(legacy, 'kanto')).toBe(1);
    expect(isExpeditionUnlocked(original, legacy)).toBe(true);
    expect(isExpeditionUnlocked(original.qualifier, legacy)).toBe(true);
    expect(isExpeditionUnlocked(original.routes[2], legacy)).toBe(true);
    expect(isExpeditionUnlocked(next.routes[0], legacy)).toBe(true);
    expect(expeditionPrerequisite(next, legacy)).toBe(next.routes[0]);
    expect(isExpeditionUnlocked(later.routes[0], { [next.id]: 18 })).toBe(false);
  });

  it('requires all 24 leader badges for the final regardless of the other battles', () => {
    const gyms = campaignRegions.flatMap(({ gyms }) => gyms);
    const results = Object.fromEntries(gyms.map(({ id }) => [id, 12]));
    const [first] = gyms;
    const qualifying = Object.fromEntries([...first.routes, first.qualifier].map(({ id }) => [id, 18]));
    expect(campaignGymTotal).toBe(24);
    expect(countBadges({ ...results, ...qualifying, [finalTournament.id]: 15 })).toBe(24);
    expect(countBadges(results, 'hoenn')).toBe(8);
    expect(isExpeditionUnlocked(finalTournament, results)).toBe(true);
    expect(isExpeditionUnlocked(finalTournament, { ...results, ...qualifying, [first.id]: 0 })).toBe(false);
  });

  it('accepts only known expedition IDs with a valid positive victory result', () => {
    const [first, second, third] = campaignRegions[0].gyms;
    const [route, next] = second.routes;
    expect(parseExpeditionResults({
      [first.id]: 18, [second.id]: 0, [third.id]: 22,
      [route.id]: 15, [next.id]: 3.2, wrong: 20,
    })).toEqual({ [first.id]: 18, [route.id]: 15 });
  });
});
