import { mkdir, writeFile } from "node:fs/promises";
import { NodeIO } from "@gltf-transform/core";
import { EXTMeshoptCompression, KHRMeshQuantization } from "@gltf-transform/extensions";
import { dedup, meshopt, prune, weld } from "@gltf-transform/functions";
import { MeshoptDecoder, MeshoptEncoder } from "meshoptimizer";
import { Mesh, MeshStandardMaterial } from "three";
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";
import { creatures } from "../src/data/creatures.ts";
import { enemies } from "../src/data/enemies.ts";
import { enemyPieces } from "../src/render/models/enemySculptures.ts";
import { sculpture } from "../src/render/models/sculpture.ts";
import { towerPieces } from "../src/render/models/towerSculptures.ts";
import { writeModelSchema } from "./model-schema.mjs";

// GLTFExporter reads a Blob through the browser FileReader interface.
globalThis.FileReader = class {
  async readAsArrayBuffer(blob) {
    this.result = await blob.arrayBuffer();
    this.onloadend?.();
  }
};

const output = new URL("../public/models/", import.meta.url);
await mkdir(output, { recursive: true });
await Promise.all([MeshoptEncoder.ready, MeshoptDecoder.ready]);
const io = new NodeIO()
  .registerExtensions([EXTMeshoptCompression, KHRMeshQuantization])
  .registerDependencies({
    "meshopt.encoder": MeshoptEncoder,
    "meshopt.decoder": MeshoptDecoder,
  });
const exporter = new GLTFExporter();
const definitions = [
  ...creatures.flatMap(({ visual, evolution, color }) => [
    { visual, color, pieces: towerPieces, triangleLimit: 8_000 },
    { visual: evolution.visual, color, pieces: towerPieces, triangleLimit: 8_000 },
  ]),
  ...enemies.map(({ visual, color }) => ({ visual, color, pieces: enemyPieces, triangleLimit: 3_000 })),
];

let totalBytes = 0;
for (const { visual, color, pieces, triangleLimit } of definitions) {
  const geometry = sculpture(pieces(visual), color);
  const material = new MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.79 });
  const mesh = new Mesh(geometry, material);
  mesh.name = visual;
  const triangleCount = geometry.attributes.position.count / 3;
  if (triangleCount > triangleLimit) throw new Error(`${visual} exceeds ${triangleLimit} triangles.`);

  const source = await exporter.parseAsync(mesh, { binary: true });
  const document = await io.readBinary(new Uint8Array(source));
  document.getRoot().getAsset().copyright = "Critter Defense original sculpture, CC0 1.0";
  await document.transform(
    weld(),
    dedup(),
    prune(),
    meshopt({ encoder: MeshoptEncoder, level: "medium" }),
  );
  const bytes = await io.writeBinary(document);
  await writeFile(new URL(`${visual}.glb`, output), bytes);
  totalBytes += bytes.byteLength;
  geometry.dispose();
  material.dispose();
  console.log(`${visual}: ${triangleCount} triangles, ${bytes.byteLength} bytes`);
}

console.log(`${definitions.length} models, ${totalBytes} bytes total`);
await writeModelSchema(definitions);
