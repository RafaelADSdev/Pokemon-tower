import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  CanvasTexture,
  Color,
  DynamicDrawUsage,
  InstancedBufferAttribute,
  InstancedMesh,
  LinearFilter,
  Object3D,
  SRGBColorSpace,
  Vector3,
  type MeshBasicMaterial,
} from "three";
import type { GameRuntime } from "@/game/runtime";
import { drawCapacity, prepareInstances, publishInstances } from "./instances";

const glyphCapacity = drawCapacity * 2;
const digitWidth = 0.205;
const digitHeight = 0.36;

function damageAtlas() {
  const canvas = document.createElement("canvas");
  canvas.width = 320;
  canvas.height = 40;
  const context = canvas.getContext("2d");
  if (context) {
    context.font = "800 30px system-ui";
    context.lineJoin = "round";
    context.lineWidth = 3.75;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.strokeStyle = "#241c15";
    context.fillStyle = "#ffffff";
    for (let digit = 0; digit < 10; digit += 1) {
      const text = String(digit);
      context.strokeText(text, digit * 32 + 16, 22);
      context.fillText(text, digit * 32 + 16, 22);
    }
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.minFilter = LinearFilter;
  texture.generateMipmaps = false;
  return texture;
}

const compileGlyphMaterial: MeshBasicMaterial["onBeforeCompile"] = (shader) => {
  shader.vertexShader = shader.vertexShader
    .replace("#include <common>", "#include <common>\nattribute float glyph; varying float glyphIndex;")
    .replace("#include <uv_vertex>", "#include <uv_vertex>\nglyphIndex = glyph;");
  shader.fragmentShader = shader.fragmentShader
    .replace("#include <common>", "#include <common>\nvarying float glyphIndex;")
    .replace("#include <map_fragment>", `
      #ifdef USE_MAP
        diffuseColor *= texture2D(map, vec2((vMapUv.x + glyphIndex) * 0.1, vMapUv.y));
      #endif
    `);
};

export function DamageNumbers({ runtime, reducedMotion }: { runtime: GameRuntime; reducedMotion: boolean }) {
  const meshRef = useRef<InstancedMesh>(null);
  const texture = useMemo(() => damageAtlas(), []);
  const glyphs = useMemo(() => new InstancedBufferAttribute(new Float32Array(glyphCapacity), 1).setUsage(DynamicDrawUsage), []);
  const transform = useMemo(() => new Object3D(), []);
  const offset = useMemo(() => new Vector3(), []);
  const tint = useMemo(() => new Color(), []);
  const highlight = useMemo(() => new Color("#fff2c9"), []);
  useEffect(() => () => texture.dispose(), [texture]);

  useFrame(({ camera }) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    let count = 0;
    transform.quaternion.copy(camera.quaternion);
    transform.scale.set(digitWidth, digitHeight, 1);
    for (const { position, effect } of runtime.queries.effects.entities) {
      if (effect.kind !== "damage") continue;
      const value = Math.min(9999, Math.max(1, Math.round(effect.value)));
      let divisor = 1;
      let digitCount = 1;
      while (value >= divisor * 10) {
        divisor *= 10;
        digitCount += 1;
      }
      if (count + digitCount > glyphCapacity) break;

      const rise = reducedMotion ? 0.17 : effect.age / effect.duration * 0.7;
      const drift = reducedMotion ? 0 : ((effect.serial % 5) - 2) * 0.067;
      tint.set(effect.color).lerp(highlight, 0.76);
      for (let index = 0; index < digitCount; index += 1) {
        const digit = Math.floor(value / divisor) % 10;
        const localX = drift + (index - (digitCount - 1) / 2) * digitWidth * 0.88;
        offset.set(localX, 0.76 + rise, 0.12).applyQuaternion(camera.quaternion);
        transform.position.set(position.x, position.y, position.z).add(offset);
        transform.updateMatrix();
        mesh.setMatrixAt(count, transform.matrix);
        mesh.setColorAt(count, tint);
        glyphs.setX(count, digit);
        divisor /= 10;
        count += 1;
      }
    }
    publishInstances(mesh, count);
    if (count > 0) {
      mesh.geometry.getAttribute("glyph").needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    }
  });

  return (
    <instancedMesh args={[undefined, undefined, glyphCapacity]} ref={meshRef} onUpdate={prepareInstances} count={0} frustumCulled={false} renderOrder={4}>
      <planeGeometry args={[1, 1]}>
        <primitive attach="attributes-glyph" object={glyphs} />
      </planeGeometry>
      <meshBasicMaterial map={texture} onBeforeCompile={compileGlyphMaterial} transparent alphaTest={0.09} depthWrite={false} toneMapped={false} />
    </instancedMesh>
  );
}
