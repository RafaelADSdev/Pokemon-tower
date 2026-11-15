import { Pause, Play } from 'lucide-react';
import { type RefObject, useEffect, useRef, useState } from 'react';
import { drawHeroAmbience } from './heroAmbienceScene';
import { useLocale } from './locale';

const frameInterval = 32;
const pixelBudget = 2_000_000;

export function HeroAmbience({ art }: { art: RefObject<HTMLImageElement | null> }) {
  const { t } = useLocale();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const elapsed = useRef(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const image = art.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !image || !ctx) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let projection: DOMMatrix2DInit | undefined;
    let variant: 'desktop' | 'mobile' = 'desktop';
    let visible = false;
    let frame: number | undefined;
    let lastPaint: number | undefined;

    const paint = () => {
      ctx.resetTransform();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (!projection) return;
      ctx.setTransform(projection);
      drawHeroAmbience(ctx, elapsed.current, variant);
    };

    const animate = (now: number) => {
      if (lastPaint === undefined || now - lastPaint >= frameInterval) {
        if (lastPaint !== undefined) elapsed.current += Math.min(now - lastPaint, frameInterval * 2) / 1000;
        lastPaint = now;
        paint();
      }
      frame = requestAnimationFrame(animate);
    };

    const stop = () => {
      if (frame !== undefined) cancelAnimationFrame(frame);
      frame = undefined;
      lastPaint = undefined;
    };

    const syncPlayback = () => {
      if (paused || !projection || !visible || document.hidden || reducedMotion.matches) stop();
      else if (frame === undefined) frame = requestAnimationFrame(animate);
    };

    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      const { naturalWidth, naturalHeight, currentSrc } = image;
      if (width === 0 || height === 0 || naturalWidth === 0 || naturalHeight === 0) {
        projection = undefined;
        syncPlayback();
        return;
      }

      const ratio = Math.min(window.devicePixelRatio, 1.5, Math.sqrt(pixelBudget / (width * height)));
      const pixelWidth = Math.max(1, Math.round(width * ratio));
      const pixelHeight = Math.max(1, Math.round(height * ratio));
      if (canvas.width !== pixelWidth) canvas.width = pixelWidth;
      if (canvas.height !== pixelHeight) canvas.height = pixelHeight;

      // Share the cover crop of the illustration behind the canvas.
      const [x, y] = getComputedStyle(image).objectPosition.split(' ').map((value) => parseFloat(value) / 100);
      const scale = Math.max(width / naturalWidth, height / naturalHeight);
      const scaleX = pixelWidth / width;
      const scaleY = pixelHeight / height;
      projection = {
        a: scale * scaleX,
        d: scale * scaleY,
        e: (width - naturalWidth * scale) * x * scaleX,
        f: (height - naturalHeight * scale) * y * scaleY,
      };
      variant = currentSrc.endsWith('/amber-trail-mobile.webp') ? 'mobile' : 'desktop';

      if (paused && !reducedMotion.matches) paint();
      syncPlayback();
    };

    const viewport = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      syncPlayback();
    });
    const size = new ResizeObserver(resize);
    viewport.observe(canvas);
    size.observe(canvas);
    image.addEventListener('load', resize);
    document.addEventListener('visibilitychange', syncPlayback);
    reducedMotion.addEventListener('change', resize);

    return () => {
      stop();
      viewport.disconnect();
      size.disconnect();
      image.removeEventListener('load', resize);
      document.removeEventListener('visibilitychange', syncPlayback);
      reducedMotion.removeEventListener('change', resize);
    };
  }, [art, paused]);

  const label = paused ? t.resumeScenery : t.pauseScenery;
  return (
    <>
      <canvas ref={canvasRef} className="entry-ambience" width={1} height={1} aria-hidden="true" />
      <button type="button" className="entry-ambience-control" aria-label={label} title={label} onClick={() => setPaused((value) => !value)}>
        {paused ? <Play size={17} aria-hidden="true" /> : <Pause size={17} aria-hidden="true" />}
      </button>
    </>
  );
}
