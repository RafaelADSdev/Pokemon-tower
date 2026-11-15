import { describe, expect, it } from "vitest";
import { caveMap } from "../data/maps/cave";
import { compilePath, samplePath } from "./pathing";

describe("pathing", () => {
  it("preserves constant travel distance on segments of unequal length", () => {
    const path = compilePath([[0, 0], [3, 0], [3, 4]]);
    const position = { x: 0, z: 0 };

    expect(path.length).toBe(7);
    samplePath(path, 0.25, position);
    expect(position).toEqual({ x: 1.75, z: 0 });
    samplePath(path, 3 / 7, position);
    expect(position).toEqual({ x: 3, z: 0 });
    samplePath(path, 0.5, position);
    expect(position).toEqual({ x: 3, z: 0.5 });
  });

  it("clamps progress to the path endpoints", () => {
    const path = compilePath([[-1, 2], [3, 4]]);
    const position = { x: 0, z: 0 };

    samplePath(path, -0.5, position);
    expect(position).toEqual({ x: -1, z: 2 });
    samplePath(path, 2, position);
    expect(position).toEqual({ x: 3, z: 4 });
  });

  it("samples past a repeated waypoint with zero segment length", () => {
    const path = compilePath([[0, 0], [0, 0], [3, 0], [3, 0], [3, 4], [3, 4]]);
    const position = { x: 0, z: 0 };

    expect(path.length).toBe(7);
    samplePath(path, 3 / 7, position);
    expect(position).toEqual({ x: 3, z: 0 });
    samplePath(path, 0.5, position);
    expect(position).toEqual({ x: 3, z: 0.5 });
    samplePath(path, 1, position);
    expect(position).toEqual({ x: 3, z: 4 });
  });

  it("keeps zero-length paths stationary and rejects an empty path", () => {
    const position = { x: 0, z: 0 };
    for (const path of [compilePath([[2, -3]]), compilePath([[2, -3], [2, -3]])]) {
      expect(path.length).toBe(0);
      samplePath(path, 0.5, position);
      expect(position).toEqual({ x: 2, z: -3 });
    }
    expect(() => compilePath([])).toThrow("at least one waypoint");
  });

  it("samples both cave branches independently between shared endpoints", () => {
    const [upper, lower] = caveMap.paths.map(compilePath);
    const upperPosition = { x: 0, z: 0 };
    const lowerPosition = { x: 0, z: 0 };

    samplePath(upper, 0, upperPosition);
    samplePath(lower, 0, lowerPosition);
    expect(upperPosition).toEqual(lowerPosition);
    samplePath(upper, 0.5, upperPosition);
    samplePath(lower, 0.5, lowerPosition);
    expect(upperPosition.z).toBeLessThan(0);
    expect(lowerPosition.z).toBeGreaterThan(0);
    samplePath(upper, 1, upperPosition);
    samplePath(lower, 1, lowerPosition);
    expect(upperPosition).toEqual(lowerPosition);
  });
});
