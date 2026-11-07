import { useEffect, useRef, type RefObject } from "react";

import { createBrickHero, type BrickHero, type HeroPhase, type HeroTheme } from "./engine";

function readTheme(el: Element): HeroTheme {
  const cs = getComputedStyle(el);
  const v = (name: string, fallback: string) => cs.getPropertyValue(name).trim() || fallback;
  return {
    red: v("--red", "#d0342c"),
    redDeep: v("--red-deep", "#a8281f"),
    yellow: v("--yellow", "#ffb63d"),
    yellowDeep: v("--yellow-deep", "#e29615"),
    green: v("--green", "#7aa93c"),
    greenDeep: v("--green-deep", "#5d8a28"),
    blue: v("--blue", "#2f6fb8"),
    blueDeep: v("--blue-deep", "#24558c"),
    line: v("--line", "#20231e"),
    inkSoft: v("--ink-soft", "#4a4f45"),
    paperDeep: v("--paper-deep", "#ece4cc"),
  };
}

interface Props {
  hostRef: RefObject<HTMLElement | null>;
  stageRef: RefObject<HTMLElement | null>;
  night: boolean;
  engineRef?: RefObject<BrickHero | null>;
  onPhase?: (phase: HeroPhase) => void;
}

/** Canvas layer that covers the whole hero; the engine draws bricks, strings and signs into it. */
export function BrickHeroCanvas({ hostRef, stageRef, night, engineRef, onPhase }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engine = useRef<BrickHero | null>(null);
  const phaseCb = useRef(onPhase);
  phaseCb.current = onPhase;

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = hostRef.current;
    const stage = stageRef.current;
    if (!canvas || !host || !stage) return;
    const e = createBrickHero({
      canvas,
      host,
      stage,
      theme: readTheme(host),
      reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      onPhase: (p) => phaseCb.current?.(p),
    });
    engine.current = e;
    if (engineRef) engineRef.current = e;
    host.setAttribute("data-scene-ready", "true");
    return () => {
      e.destroy();
      engine.current = null;
      if (engineRef) engineRef.current = null;
    };
  }, [hostRef, stageRef, engineRef]);

  useEffect(() => {
    const host = hostRef.current;
    if (host) engine.current?.setTheme(readTheme(host));
  }, [night, hostRef]);

  return <canvas ref={canvasRef} className="brick-hero-canvas" aria-hidden="true" />;
}
