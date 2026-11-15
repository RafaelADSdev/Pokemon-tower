import { elementChart, type ElementId } from "../data/elements";

export function elementMultiplier(attacker: ElementId, defender: ElementId) {
  return elementChart[attacker][defender];
}

export function calculateDamage(baseDamage: number, attacker: ElementId, defender: ElementId, multiplier = 1): number {
  return Math.max(0, baseDamage * elementMultiplier(attacker, defender) * multiplier);
}
