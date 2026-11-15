import type { ElementId } from "./elements";

export interface CreatureDefinition {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly element: ElementId;
  readonly role: "rapid";
  readonly cost: number;
  readonly damage: number;
  readonly range: number;
  readonly cooldown: number;
  readonly projectileSpeed: number;
  readonly color: string;
  readonly model: string | null;
}

export const starterCreature: CreatureDefinition = {
  id: "emberling",
  name: "Braseco",
  description: "Dispara fagulhas rápidas contra um alvo por vez.",
  element: "brasa",
  role: "rapid",
  cost: 120,
  damage: 17,
  range: 3.6,
  cooldown: 0.6,
  projectileSpeed: 12,
  color: "#ff8658",
  model: null,
};

export const creatures: readonly CreatureDefinition[] = [starterCreature];

export const creatureById: Readonly<Partial<Record<string, CreatureDefinition>>> =
  Object.fromEntries(creatures.map((creature) => [creature.id, creature]));
