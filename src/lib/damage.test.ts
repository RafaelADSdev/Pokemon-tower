import { describe, expect, it } from "vitest";
import { elements } from "../data/elements";
import { calculateDamage, elementMultiplier } from "./damage";

describe("elemental damage", () => {
  it("covers all six elements with neutral, strong and weak matchups", () => {
    expect(elements.map(({ id }) => id)).toEqual(["brasa", "mare", "folha", "faisca", "pedra", "sombra"]);
    for (const attacker of elements) {
      const results = elements.map((defender) => elementMultiplier(attacker.id, defender.id));
      expect(results.toSorted((left, right) => left - right)).toEqual([0.5, 0.5, 1, 1, 2, 2]);
      expect(elementMultiplier(attacker.id, attacker.id)).toBe(1);
      for (const defender of elements) {
        expect(elementMultiplier(attacker.id, defender.id) * elementMultiplier(defender.id, attacker.id)).toBe(1);
      }
    }
  });

  it("applies advantage, resistance and a fractional combat modifier without rounding", () => {
    expect(calculateDamage(17, "brasa", "folha")).toBe(34);
    expect(calculateDamage(17, "folha", "brasa")).toBe(8.5);
    expect(calculateDamage(17, "brasa", "pedra", 1.5)).toBe(25.5);
    expect(calculateDamage(17, "brasa", "folha", 1.5)).toBe(51);
  });

  it("clamps negative damage and preserves zero damage", () => {
    expect(calculateDamage(-10, "brasa", "folha")).toBe(0);
    expect(calculateDamage(0, "mare", "brasa")).toBe(0);
  });
});
