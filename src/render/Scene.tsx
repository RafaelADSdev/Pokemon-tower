"use client";

import { OrbitControls, OrthographicCamera, PerformanceMonitor } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { lazy, Suspense, useMemo, useRef, useState, type ComponentRef } from "react";
import { Color, MOUSE, TOUCH, Vector3 } from "three";
import { useStore } from "zustand";
import type { MapDefinition } from "@/data/maps/types";
import type { EnemyEntity } from "@/game/ecs/world";
import type { GameRuntime } from "@/game/runtime";
import { CanvasFallback } from "./CanvasFallback";
import { Map } from "./Map";
import { RenderBoundary } from "./RenderBoundary";
import { supportsWebGL2, useCompactGraphics, useReducedMotion } from "./devicePreferences";

const BattleActors = lazy(() => import("./BattleActors"));

interface SceneProps {
  map: MapDefinition;
  runtime?: GameRuntime;
  selectedSlot?: string | null;
  onSelectSlot?: (id: string) => void;
  onSelectEnemy?: (entity: EnemyEntity) => void;
  unavailableMessage?: string;
}

const dioramaTarget: [number, number, number] = [0, 0.17, 0];
const cameraPosition: [number, number, number] = [7.1, 25.8, 31.5];
const mouseButtons = { LEFT: MOUSE.PAN, MIDDLE: MOUSE.DOLLY, RIGHT: MOUSE.PAN };
const touches = { ONE: TOUCH.PAN, TWO: TOUCH.DOLLY_PAN };
const boardLighting = {
  forest: { sky: "#dde9df", earth: "#86715f", key: "#ffe8bc", fill: "#a3e0ce", fillPower: 0.78 },
  cave: { sky: "#cfe6ff", earth: "#80769f", key: "#e3f2ff", fill: "#8ecfe0", fillPower: 0.98 },
  volcano: { sky: "#e8c9c1", earth: "#a45239", key: "#ffe0b2", fill: "#fba67d", fillPower: 0.89 },
};

function DioramaCamera({ map, reducedMotion }: { map: MapDefinition; reducedMotion: boolean }) {
  const size = useThree((state) => state.size);
  const orbit = useRef<ComponentRef<typeof OrbitControls>>(null);
  const offset = useMemo(() => new Vector3(), []);
  const center = useMemo(() => new Vector3(...dioramaTarget), []);
  const { width, depth } = map.size;
  const fit = Math.max(1, Math.min(size.width / (width + depth * 0.25 + 1.9), size.height / (depth * 0.78 + 4.8)));
  const panRadius = Math.min(width, depth) * 0.41;

  return (
    <>
      <OrthographicCamera makeDefault position={cameraPosition} near={0.1} far={130} zoom={fit} />
      <OrbitControls
        ref={orbit}
        makeDefault
        enableRotate={false}
        enableDamping={!reducedMotion}
        screenSpacePanning
        enablePan
        minZoom={fit * 0.78}
        maxZoom={fit * 2.6}
        dampingFactor={0.13}
        target={dioramaTarget}
        mouseButtons={mouseButtons}
        touches={touches}
        onChange={() => {
          const controls = orbit.current;
          if (!controls) return;
          const length = offset.subVectors(controls.target, center).length();
          if (length <= panRadius) return;
          offset.multiplyScalar((length - panRadius) / length);
          controls.target.sub(offset);
          controls.object.position.sub(offset);
        }}
      />
    </>
  );
}

function Background({ tint }: { tint: string }) {
  const uniforms = useMemo(() => ({
    color: { value: new Color(tint) },
    light: { value: new Color(tint).multiplyScalar(2.2) },
  }), [tint]);

  return (
    <mesh position-y={-2.28} rotation-x={-Math.PI / 2}>
      <planeGeometry args={[136, 136]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={`
          varying vec2 stage;
          void main() {
            stage = position.xy;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform vec3 color;
          uniform vec3 light;
          varying vec2 stage;
          void main() {
            float halo = exp(-0.005 * dot(stage * vec2(0.85, 1.3), stage));
            float shadow = exp(-0.027 * dot(stage * vec2(0.68, 1.0), stage));
            vec3 surface = mix(color * 0.39, light, halo);
            surface *= 1.0 - shadow * 0.57;
            gl_FragColor = vec4(surface, 1.0);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
          }
        `}
      />
    </mesh>
  );
}

function BattleDriver({ runtime, selectedSlot, onSelectEnemy, highEffects, reducedMotion }: {
  runtime: GameRuntime;
  selectedSlot?: string | null;
  onSelectEnemy?: SceneProps["onSelectEnemy"];
  highEffects: boolean;
  reducedMotion: boolean;
}) {
  const alpha = useRef(0);
  const inPlay = useStore(runtime.store, (state) => state.wave > 0 || state.towerRevision > 0);
  useFrame((_, delta) => {
    alpha.current = runtime.advance(delta);
  }, -2);
  if (!inPlay && !selectedSlot) return null;
  return (
    <Suspense fallback={null}>
      <BattleActors
        runtime={runtime}
        alpha={alpha}
        selectedSlot={selectedSlot}
        onSelectEnemy={onSelectEnemy}
        highEffects={highEffects}
        reducedMotion={reducedMotion}
      />
    </Suspense>
  );
}

export function Scene({
  map, runtime, selectedSlot, onSelectSlot, onSelectEnemy,
  unavailableMessage = "Exibição 3D indisponível. Use as posições e os comandos da partida.",
}: SceneProps) {
  const compact = useCompactGraphics();
  const reducedMotion = useReducedMotion();
  const [contextLost, setContextLost] = useState(false);
  const [quality, setQuality] = useState(0.85);
  const floor = compact ? 0.68 : 0.82;
  const ceiling = Math.min(typeof window === "undefined" ? 1 : window.devicePixelRatio, compact ? 1.2 : 1.65);
  const dpr = Math.round((Math.min(floor, ceiling) + (ceiling - Math.min(floor, ceiling)) * quality) * 100) / 100;
  const highEffects = !compact && quality >= 0.55;
  const light = boardLighting[map.theme.biome];
  const fallback = <CanvasFallback runtime={runtime} message={unavailableMessage} />;
  if (contextLost || !supportsWebGL2()) return fallback;

  return (
    <RenderBoundary fallback={fallback}>
      <Canvas
        orthographic
        camera={{ position: cameraPosition, near: 0.1, far: 130 }}
        shadows={highEffects ? "percentage" : false}
        dpr={dpr}
        gl={{ alpha: false, powerPreference: "high-performance" }}
        fallback={fallback}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener("webglcontextlost", () => setContextLost(true), { once: true });
        }}
      >
        <color attach="background" args={[map.theme.atmosphere]} />
        <hemisphereLight args={[light.sky, light.earth, 1.55]} />
        <directionalLight
          castShadow={highEffects}
          color={light.key}
          intensity={2.15}
          position={[-8, 14, 7]}
          shadow-mapSize={[1024, 1024]}
          shadow-camera-left={-14}
          shadow-camera-right={14}
          shadow-camera-top={13}
          shadow-camera-bottom={-13}
          shadow-camera-near={1}
          shadow-camera-far={36}
          shadow-normalBias={0.024}
        />
        <directionalLight color={light.fill} intensity={light.fillPower} position={[7, 9, -10]} />
        <Background tint={map.theme.atmosphere} />
        <Map map={map} selectedSlot={selectedSlot} onSelectSlot={onSelectSlot} />
        <DioramaCamera map={map} reducedMotion={reducedMotion} />
        <PerformanceMonitor
          factor={0.85}
          ms={500}
          iterations={4}
          flipflops={6}
          bounds={(refresh) => [Math.min(compact ? 32 : 47, refresh * 0.85), Math.min(90, refresh * 0.97)]}
          onChange={({ factor }) => setQuality(factor)}
          onFallback={() => setQuality(0.16)}
        />
        {runtime && <BattleDriver runtime={runtime} selectedSlot={selectedSlot} onSelectEnemy={onSelectEnemy} highEffects={highEffects} reducedMotion={reducedMotion} />}
      </Canvas>
    </RenderBoundary>
  );
}

export default Scene;
