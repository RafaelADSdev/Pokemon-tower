import { _roots } from "@react-three/fiber";
import { createRoot } from "react-dom/client";
import { creatures } from "@/data/creatures";
import { enemies } from "@/data/enemies";
import { caveMap } from "@/data/maps/cave";
import type { WaveDefinition } from "@/data/waves/types";
import { snapshotPosition } from "@/game/ecs/world";
import { createGameRuntime } from "@/game/runtime";
import { FIXED_STEP } from "@/game/time";
import { samplePath } from "@/lib/pathing";
import { Scene } from "@/render/Scene";

const count = 300;
const wave: WaveDefinition = {
  bonus: 0,
  healthScale: 10_000,
  speedScale: 0.015,
  groups: enemies.flatMap((enemy, index) => {
    const total = Math.floor(count / enemies.length) + (index < count % enemies.length ? 1 : 0);
    return [0, 1].map((pathIndex) => ({
      enemyId: enemy.id,
      count: Math.floor(total / 2) + (pathIndex === 0 ? total % 2 : 0),
      interval: 0,
      delay: 0,
      pathIndex,
    }));
  }),
};

const runtime = createGameRuntime(caveMap, { waves: [wave] });
runtime.store.setState({ money: 10_000 });
creatures.forEach(({ id }, index) => runtime.placeTower(caveMap.slots[index].id, id));
runtime.startWave();
runtime.advance(FIXED_STEP);
for (const [index, { enemy, position }] of Array.from(runtime.queries.enemies.entities).entries()) {
  // Keep the production simulation running while distributing the stress sample over both lanes.
  enemy.progress = 0.08 + (index * 0.6180339887498949 % 1) * 0.76;
  samplePath(enemy.path, enemy.progress, position);
  snapshotPosition(position);
}
runtime.store.getState().selectSlot(caveMap.slots[0].id);

const stage = document.getElementById("stage");
if (!stage) throw new Error("Benchmark stage not created.");
createRoot(stage).render(<Scene map={caveMap} runtime={runtime} selectedSlot={caveMap.slots[0].id} />);

function percentile(values: number[], quantile: number) {
  const sorted = values.slice().sort((a, b) => a - b);
  return sorted[Math.floor((sorted.length - 1) * quantile)] ?? 0;
}

function renderer() {
  const canvas = document.querySelector("canvas");
  const gl = canvas && _roots.get(canvas)?.store.getState().gl;
  if (!canvas || !gl) throw new Error("WebGL renderer not available.");
  return { canvas, gl };
}

async function measureScene(milliseconds: number) {
  const { canvas, gl } = renderer();
  const context = gl.getContext();
  const debug = context.getExtension("WEBGL_debug_renderer_info");
  const gpu = String(context.getParameter(debug ? debug.UNMASKED_RENDERER_WEBGL : context.RENDERER));
  const info = gl.info;
  const intervals: number[] = [];
  const calls: number[] = [];
  const triangles: number[] = [];
  let minimumEnemies = Infinity;
  let maximumEnemies = 0;
  let previous = 0;

  const autoReset = info.autoReset;
  info.autoReset = false;
  info.reset();
  try {
    await new Promise<void>((resolve) => {
      const end = performance.now() + milliseconds;
      function sample(now: number) {
        const active = runtime.queries.enemies.entities.length;
        minimumEnemies = Math.min(minimumEnemies, active);
        maximumEnemies = Math.max(maximumEnemies, active);
        if (previous > 0) {
          intervals.push(now - previous);
          calls.push(info.render.calls);
          triangles.push(info.render.triangles);
        }
        previous = now;
        info.reset();
        if (now < end) requestAnimationFrame(sample);
        else resolve();
      }
      requestAnimationFrame(sample);
    });
  } finally {
    info.autoReset = autoReset;
  }

  const round = (value: number) => Math.round(value * 100) / 100;
  const average = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
  return {
    gpu,
    minimumEnemies,
    maximumEnemies,
    frames: intervals.length,
    averageFPS: round(1000 / average),
    medianFPS: round(1000 / percentile(intervals, 0.5)),
    p99FrameMs: round(percentile(intervals, 0.99)),
    onePercentFPS: round(1000 / percentile(intervals, 0.99)),
    drawCallsMedian: percentile(calls, 0.5),
    drawCallsMax: Math.max(...calls),
    trianglesMedian: percentile(triangles, 0.5),
    trianglesMax: Math.max(...triangles),
    canvas: {
      css: [canvas.clientWidth, canvas.clientHeight],
      physical: [canvas.width, canvas.height],
      deviceDPR: devicePixelRatio,
    },
  };
}

Object.assign(window, { measureCritterScene: measureScene });
