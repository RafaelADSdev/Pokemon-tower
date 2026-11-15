import type { MapDefinition } from "@/data/maps/types";

export function randomFor(seed: number) {
  return () => {
    seed = (Math.imul(seed, 1_664_525) + 1_013_904_223) >>> 0;
    return seed / 4_294_967_296;
  };
}

export function sceneryPlacement(map: MapDefinition) {
  const segments = map.paths.flatMap((path) => path.slice(1).map(([nextX, nextZ], index) => {
    const [startX, startZ] = path[index];
    const dx = nextX - startX;
    const dz = nextZ - startZ;
    return { startX, startZ, dx, dz, lengthSquared: dx * dx + dz * dz };
  })).filter(({ lengthSquared }) => lengthSquared > 0);

  function open(x: number, z: number, distance: number) {
    for (const { startX, startZ, dx, dz, lengthSquared } of segments) {
      const t = Math.min(1, Math.max(0, ((x - startX) * dx + (z - startZ) * dz) / lengthSquared));
      if (Math.hypot(x - startX - dx * t, z - startZ - dz * t) < distance) return false;
    }
    return map.slots.every(({ position: [slotX, slotZ] }) => Math.hypot(slotX - x, slotZ - z) >= distance + 0.18);
  }

  function clearSightline(x: number, z: number) {
    return map.slots.every(({ position: [slotX, slotZ] }) => {
      const dz = z - slotZ;
      return dz < -0.2 || dz > 2.55 || Math.abs(x - slotX - 0.22 * dz) > 0.76;
    });
  }

  return { open, clearSightline };
}
