import { useEffect } from "react";
import type { GameRuntime } from "@/game/runtime";

export function CanvasFallback({ runtime, message }: { runtime?: GameRuntime; message: string }) {
  useEffect(() => {
    if (!runtime) return;
    let previous = performance.now();
    let frame = window.requestAnimationFrame(advance);

    function advance(now: number) {
      runtime?.advance((now - previous) / 1_000);
      previous = now;
      frame = window.requestAnimationFrame(advance);
    }

    return () => window.cancelAnimationFrame(frame);
  }, [runtime]);

  return <p className="board-loading" role="status">{message}</p>;
}
