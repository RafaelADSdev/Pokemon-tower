"use client";

import { OrbitControls, OrthographicCamera } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef, type ComponentRef } from "react";
import { Color, MOUSE, TOUCH, Vector3 } from "three";
import type { MapDefinition } from "@/data/maps/types";
import type { GameRuntime } from "@/game/runtime";
import { Enemies } from "./Enemies";
import { Map } from "./Map";
import { Projectiles } from "./Projectiles";
import { Towers } from "./Towers";

interface SceneProps {
  map: MapDefinition;
  runtime?: GameRuntime;
  selectedSlot?: string | null;
  onSelectSlot?: (id: string) => void;
}

const dioramaTarget: [number, number, number] = [0, 0.17, 0];
const cameraPosition: [number, number, number] = [7.1, 25.8, 31.5];
const mouseButtons = { LEFT: MOUSE.PAN, MIDDLE: MOUSE.DOLLY, RIGHT: MOUSE.PAN };
const touches = { ONE: TOUCH.PAN, TWO: TOUCH.DOLLY_PAN };

function DioramaCamera({ map }: { map: MapDefinition }) {
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
        enableDamping
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

function BattleEntities({ runtime, selectedSlot }: { runtime: GameRuntime; selectedSlot?: string | null }) {
  const alpha = useRef(0);
  useFrame((_, delta) => {
    alpha.current = runtime.advance(delta);
  }, -2);
  return (
    <>
      <Enemies runtime={runtime} alpha={alpha} />
      <Projectiles runtime={runtime} alpha={alpha} />
      <Towers runtime={runtime} selectedSlot={selectedSlot} />
    </>
  );
}

export function Scene({ map, runtime, selectedSlot, onSelectSlot }: SceneProps) {
  return (
    <Canvas
      orthographic
      camera={{ position: cameraPosition, near: 0.1, far: 130 }}
      shadows="percentage"
      dpr={[1, 1.65]}
      gl={{ alpha: false, powerPreference: "high-performance" }}
    >
      <color attach="background" args={[map.theme.atmosphere]} />
      <hemisphereLight args={["#dde9df", "#86715f", 1.55]} />
      <directionalLight
        castShadow
        color="#ffe8bc"
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
      <directionalLight color="#a3e0ce" intensity={0.78} position={[7, 9, -10]} />
      <Background tint={map.theme.atmosphere} />
      <Map map={map} selectedSlot={selectedSlot} onSelectSlot={onSelectSlot} />
      <DioramaCamera map={map} />
      {runtime && <BattleEntities runtime={runtime} selectedSlot={selectedSlot} />}
    </Canvas>
  );
}

export default Scene;
