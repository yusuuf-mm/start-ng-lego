import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import reelPoster from "@/assets/brick-builder-reel-poster.webp.asset.json";
import reelVideo from "@/assets/brick-builder-reel.mp4.asset.json";

import { REEL_STEPS } from "./data";

const STEP_COLORS = ["var(--yellow)", "var(--red)", "var(--blue)", "var(--green)"];
const FALLBACK_DURATION = 6.75;

function stepAt(time: number) {
  let idx = 0;
  REEL_STEPS.forEach((s, i) => {
    if (time >= s.at) idx = i;
  });
  return idx;
}

/** A brick-framed "TV" that plays the builder reel, synced to an instruction booklet. */
export function BrickReel() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const fillRefs = useRef<(HTMLElement | null)[]>([]);
  const timeRef = useRef<HTMLSpanElement>(null);
  const userPaused = useRef(false);

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [active, setActive] = useState(0);
  const [showBigPlay, setShowBigPlay] = useState(false);

  const paint = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    const duration = Number.isFinite(v.duration) && v.duration > 0 ? v.duration : FALLBACK_DURATION;
    const t = v.currentTime;
    REEL_STEPS.forEach((s, i) => {
      const start = s.at;
      const end = REEL_STEPS[i + 1]?.at ?? duration;
      const fill = Math.min(1, Math.max(0, (t - start) / (end - start)));
      fillRefs.current[i]?.style.setProperty("--fill", String(fill));
    });
    if (timeRef.current) timeRef.current.textContent = `0:0${Math.floor(t)} / 0:0${Math.floor(duration)}`;
    setActive((prev) => {
      const next = stepAt(t);
      return prev === next ? prev : next;
    });
  }, []);

  // Smooth progress while playing.
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    const loop = () => {
      paint();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [playing, paint]);

  // Autoplay only when on screen and motion is welcome.
  useEffect(() => {
    const v = videoRef.current;
    const wrap = wrapRef.current;
    if (!v || !wrap) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) {
      setShowBigPlay(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          if (!userPaused.current) v.play().catch(() => setShowBigPlay(true));
        } else {
          v.pause();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(wrap);
    return () => io.disconnect();
  }, []);

  const play = () => {
    const v = videoRef.current;
    if (!v) return;
    userPaused.current = false;
    setShowBigPlay(false);
    v.play().catch(() => setShowBigPlay(true));
  };

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) play();
    else {
      userPaused.current = true;
      v.pause();
    }
  };

  const seekTo = (i: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = (REEL_STEPS[i]?.at ?? 0) + 0.05;
    paint();
    play();
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
    if (!v.muted && v.paused) play();
  };

  return (
    <div className="hero-reel reveal" ref={wrapRef}>
      <div className="reel-caption mono-label">
        <span>Build № 001 · Watch it snap</span>
        <span className="rule" aria-hidden="true" />
        <span>6 seconds · 1 builder</span>
      </div>

      <figure className="brick-tv" style={{ margin: 0 }}>
        <span className="tv-studs" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </span>
        <div className="tv-screen">
          <span className="tv-chip">
            <span className="live" aria-hidden="true" />
            {playing ? "Now building" : "Paused"}
          </span>
          <video
            ref={videoRef}
            loop
            muted
            playsInline
            preload="metadata"
            poster={reelPoster.url}
            aria-label="A builder strolls onto a construction site, trips on a stray brick, and the flying pieces snap together into a logo."
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onTimeUpdate={paint}
            onLoadedMetadata={paint}
          >
            <source src={reelVideo.url} type="video/mp4" />
          </video>
          {showBigPlay && !playing && (
            <button type="button" className="tv-bigplay" onClick={play} aria-label="Play the builder reel">
              <span>
                <Play size={32} fill="currentColor" aria-hidden="true" />
              </span>
            </button>
          )}
        </div>
        <figcaption className="tv-bar">
          <button
            type="button"
            className="tv-btn"
            onClick={toggle}
            aria-label={playing ? "Pause the builder reel" : "Play the builder reel"}
          >
            {playing ? (
              <Pause size={18} fill="currentColor" aria-hidden="true" />
            ) : (
              <Play size={18} fill="currentColor" aria-hidden="true" />
            )}
          </button>
          <div className="tv-progress" role="group" aria-label="Jump to a build step">
            {REEL_STEPS.map((s, i) => (
              <button
                key={s.title}
                type="button"
                onClick={() => seekTo(i)}
                aria-label={`Step ${i + 1}: ${s.title}`}
                style={{ "--seg": STEP_COLORS[i] } as React.CSSProperties}
              >
                <i
                  ref={(el) => {
                    fillRefs.current[i] = el;
                  }}
                />
              </button>
            ))}
          </div>
          <span className="tv-time" ref={timeRef} aria-hidden="true">
            0:00 / 0:06
          </span>
          <button
            type="button"
            className="tv-btn alt"
            onClick={toggleMute}
            aria-label={muted ? "Turn sound on" : "Turn sound off"}
            aria-pressed={!muted}
          >
            {muted ? <VolumeX size={18} aria-hidden="true" /> : <Volume2 size={18} aria-hidden="true" />}
          </button>
        </figcaption>
      </figure>

      <aside className="reel-booklet" aria-label="Build instructions">
        <div className="booklet-top">
          <span className="mono-label">Instructions</span>
          <span className="booklet-set">№ 001</span>
        </div>
        <h3>How a good game gets built.</h3>
        <ol className="reel-steps">
          {REEL_STEPS.map((s, i) => (
            <li key={s.title}>
              <button
                type="button"
                className={"reel-step" + (active === i ? " active" : "")}
                aria-current={active === i ? "step" : undefined}
                onClick={() => seekTo(i)}
                style={{ "--step": STEP_COLORS[i] } as React.CSSProperties}
              >
                <span className={"n" + (i === 0 ? " dark-text" : "")}>{i + 1}</span>
                <span>
                  <strong>{s.title}</strong>
                  <span className="body">{s.body}</span>
                </span>
              </button>
            </li>
          ))}
        </ol>
        <div className="booklet-foot mono-label">
          <span>Ages 0–99</span>
          <span>0 glue required</span>
        </div>
      </aside>
    </div>
  );
}
