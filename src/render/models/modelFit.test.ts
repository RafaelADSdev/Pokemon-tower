import { Bone, BoxGeometry, Group, Mesh, MeshBasicMaterial } from "three";
import { expect, test } from "vitest";
import type { CreatureLevel } from "@/data/creatures";
import { pokemonModel } from "@/data/pokemon";
import { prepareTowerModel, towerPadTop } from "./modelFit";

function measure(dex: number, stage: CreatureLevel, width: number, height: number, depth: number) {
  const scene = new Group();
  const geometry = new BoxGeometry(width, height, depth);
  const material = new MeshBasicMaterial();
  scene.add(new Mesh(geometry, material));
  const fit = prepareTowerModel(scene, pokemonModel(dex), stage);
  geometry.dispose();
  material.dispose();
  return { height: height * fit.scale, base: fit.offset[1] - height * fit.scale / 2 };
}

test("Charizard grows past both earlier forms even with its wider silhouette", () => {
  // Bounds representative of the three GLBs, without loading remote assets.
  const charmander = measure(4, 1, 1.35, 1.52, 2.03);
  const charmeleon = measure(5, 2, 2.81, 2.89, 3.42);
  const charizard = measure(6, 3, 6.28, 4.41, 8.28);

  expect(charmeleon.height).toBeGreaterThan(charmander.height);
  expect(charizard.height).toBeGreaterThan(charmeleon.height);
  expect(charizard.height).toBeGreaterThan(charmander.height * 1.5);
  for (const model of [charmander, charmeleon, charizard]) {
    expect(model.base).toBeCloseTo(towerPadTop);
  }
});

test.each([
  { dex: 26, hips: "Hips", tailLength: 5 },
  { dex: 6, hips: "Hips_62", tailLength: 7 },
])("keeps Pokémon $dex standing over the pad when its tail extends behind it", ({ dex, hips, tailLength }) => {
  const scene = new Group();
  const bone = new Bone();
  bone.name = hips;
  bone.position.set(0.1, 0.7, 0.2);
  scene.add(bone);

  const material = new MeshBasicMaterial();
  const body = new Mesh(new BoxGeometry(1, 1.4, 1), material);
  body.position.copy(bone.position);
  const tail = new Mesh(new BoxGeometry(0.2, 0.2, tailLength), material);
  tail.position.set(0.1, 0.45, 0.2 - tailLength / 2);
  scene.add(body, tail);
  const { offset, scale } = prepareTowerModel(scene, pokemonModel(dex), 3);

  body.geometry.dispose();
  tail.geometry.dispose();
  material.dispose();

  expect(offset[0] + bone.position.x * scale).toBeCloseTo(0);
  expect(offset[1]).toBeCloseTo(towerPadTop);
  expect(offset[2] + bone.position.z * scale).toBeCloseTo(0);
});
