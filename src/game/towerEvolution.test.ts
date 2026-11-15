import { expect, test } from 'vitest';
import { getCreatureAppearance } from '@/data/creatures';
import { forestMap } from '@/data/maps/forest';
import { regionalRosters, tournamentRoster } from '@/data/regionalCreatures';
import { createGameRuntime } from './runtime';

test('Charmander becomes Charmeleon at level 2 and Charizard at level 3', () => {
  const runtime = createGameRuntime(forestMap);
  const slot = forestMap.slots[0].id;
  runtime.store.setState({ money: 500 });
  expect(runtime.placeTower(slot, 'emberling')).toBe(true);
  const tower = runtime.getTower(slot)!.tower;
  const appearance = () => getCreatureAppearance(tower.definition, tower.level);

  expect(appearance().name).toBe('Charmander');
  expect(runtime.upgradeTower(slot)).toBe(true);
  expect(appearance()).toMatchObject({ name: 'Charmeleon', model: expect.stringMatching(/\/5\.glb$/) });
  expect(tower.stats.status).toBeUndefined();
  expect(runtime.upgradeTower(slot)).toBe(true);
  expect(appearance()).toMatchObject({ name: 'Charizard', model: expect.stringMatching(/\/6\.glb$/) });
  expect(tower.stats.status?.id).toBe('burn');
});

test('the regional and tournament rosters follow their own evolution chains', () => {
  const examples = [
    [regionalRosters.kanto, 'runebell', ['Abra', 'Kadabra', 'Alakazam']],
    [regionalRosters.johto, 'rivermutt', ['Totodile', 'Croconaw', 'Feraligatr']],
    [regionalRosters.hoenn, 'emberling', ['Torchic', 'Combusken', 'Blaziken']],
    [tournamentRoster, 'rivermutt', ['Mudkip', 'Marshtomp', 'Swampert']],
  ] as const;

  for (const [roster, creatureId, names] of examples) {
    const definition = roster.find(({ id }) => id === creatureId)!;
    expect(([1, 2, 3] as const).map((level) => getCreatureAppearance(definition, level).name)).toEqual(names);
  }
});

test('a two-form tower evolves once and gains its final ability at level 3', () => {
  const runtime = createGameRuntime(forestMap, { roster: regionalRosters.kanto });
  const slot = forestMap.slots[0].id;
  runtime.store.setState({ money: 500 });
  expect(runtime.placeTower(slot, 'voltwing')).toBe(true);
  const tower = runtime.getTower(slot)!.tower;

  expect(runtime.upgradeTower(slot)).toBe(true);
  const levelTwo = getCreatureAppearance(tower.definition, tower.level);
  expect(levelTwo.name).toBe('Raichu');
  expect(levelTwo.description).toBe(tower.definition.description);
  expect(tower.stats.status).toBeUndefined();
  expect(runtime.upgradeTower(slot)).toBe(true);
  expect(getCreatureAppearance(tower.definition, tower.level).model).toBe(levelTwo.model);
  expect(tower.stats.status?.id).toBe('stun');
});
