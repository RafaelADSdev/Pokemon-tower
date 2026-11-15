import { useSyncExternalStore } from "react";

const compactQuery = "(pointer: coarse), (max-width: 760px)";
const reducedMotionQuery = "(prefers-reduced-motion: reduce)";
const defaultPreference = () => false;

function watchPreference(query: string, change: () => void) {
  const media = window.matchMedia(query);
  media.addEventListener("change", change);
  return () => media.removeEventListener("change", change);
}

const subscribeCompact = (change: () => void) => watchPreference(compactQuery, change);
const subscribeMotion = (change: () => void) => watchPreference(reducedMotionQuery, change);
const readCompact = () => window.matchMedia(compactQuery).matches;
const readMotion = () => window.matchMedia(reducedMotionQuery).matches;
let webGLAvailable: boolean | undefined;

export function supportsWebGL2() {
  if (typeof document === "undefined") return false;
  if (webGLAvailable !== undefined) return webGLAvailable;
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("webgl2");
  webGLAvailable = Boolean(context);
  context?.getExtension("WEBGL_lose_context")?.loseContext();
  return webGLAvailable;
}

export function useCompactGraphics() {
  return useSyncExternalStore(subscribeCompact, readCompact, defaultPreference);
}

export function useReducedMotion() {
  return useSyncExternalStore(subscribeMotion, readMotion, defaultPreference);
}
