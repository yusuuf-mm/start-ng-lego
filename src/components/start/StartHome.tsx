import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { BrickHeroCanvas } from "./brickHero/BrickHeroCanvas";
import type { BrickHero, HeroPhase } from "./brickHero/engine";
import { BrickReel } from "./BrickReel";
import { MARQUEE, START_URL } from "./data";
import { AboutSection, CreatorsSection, GamesSection, TournamentSection } from "./Sections";

const NIGHT_KEY = "startng:night";

const NAV = [
  { href: "#games", label: "Games", color: "var(--blue)" },
  { href: "#tournament", label: "Tournament", color: "var(--red)" },
  { href: "#creators", label: "Creators", color: "var(--green)" },
  { href: `${START_URL}/docs`, label: "Docs", color: "var(--yellow)" },
];

function BrandMark() {
  return (
    <span className="brick-mark" aria-hidden="true">
      <i />
      <i />
      <i />
    </span>
  );
}

export function StartHome() {
  const [night, setNight] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const shellRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<BrickHero | null>(null);
  const [phase, setPhase] = useState<HeroPhase>("build");

  // Remember the chosen theme.
  useEffect(() => {
    if (window.localStorage.getItem(NIGHT_KEY) === "1") setNight(true);
  }, []);
  const toggleNight = () =>
    setNight((n) => {
      window.localStorage.setItem(NIGHT_KEY, n ? "0" : "1");
      return !n;
    });

  // Snap sections in as they scroll into view.
  useEffect(() => {
    const shell = shellRef.current;
    if (!shell || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    shell.classList.add("reveal-ready");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    shell.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Close the phone menu on Escape.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  async function share() {
    const url = window.location.origin;
    try {
      if (navigator.share) await navigator.share({ title: "start.ng — Good vibes. Good games.", url });
      else await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      /* user dismissed the share sheet */
    }
  }

  return (
    <main ref={shellRef} className={"wshell" + (night ? " night-mode" : "")} id="top">
      <nav className="wtopbar" aria-label="Main navigation">
        <a className="wbrand" href="#top" aria-label="start.ng home">
          <BrandMark />
          <strong>start</strong>
          <b>.ng</b>
        </a>
        <div className="wnavlinks">
          {NAV.map((n) => (
            <a key={n.label} href={n.href}>
              {n.label}
            </a>
          ))}
        </div>
        <div className="wnav-actions">
          <button
            type="button"
            className="round-action"
            aria-label={night ? "Use light mode" : "Use dark mode"}
            onClick={toggleNight}
          >
            {night ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
              </svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                <path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" />
              </svg>
            )}
          </button>
          <a className="wsignin" href={START_URL}>
            Sign in
          </a>
          <button
            type="button"
            className="round-action wmenu-btn"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? <X size={16} aria-hidden="true" /> : <Menu size={16} aria-hidden="true" />}
          </button>
        </div>
        {menuOpen && (
          <div className="wmobile-menu" id="mobile-menu">
            {NAV.map((n) => (
              <a key={n.label} href={n.href} onClick={() => setMenuOpen(false)}>
                {n.label}
                <i style={{ background: n.color }} aria-hidden="true" />
              </a>
            ))}
            <a href={START_URL} onClick={() => setMenuOpen(false)}>
              Sign in
              <i style={{ background: "var(--ink)" }} aria-hidden="true" />
            </a>
          </div>
        )}
      </nav>

      <section className="hero hero-smash" id="hero" ref={heroRef}>
        <BrickHeroCanvas hostRef={heroRef} stageRef={stageRef} night={night} engineRef={engineRef} onPhase={setPhase} />
        <div className="hero-copy-block">
          <span className="hero-eyebrow">
            <span className="dot" aria-hidden="true" /> Lagos, Nigeria · Set № 001
          </span>
          <p className="hero-kicker mono-label">Big imagination. Played everywhere.</p>
          <div className="hero-stage" ref={stageRef}>
            <h1 className="sr-only">start.ng — Good vibes. Good games.</h1>
          </div>
          <div className="hero-note-row">
            <span className="hero-note">
              <b>Set № 001</b> · Ages 0–99 · 100% playable, no assembly required
            </span>
            <button
              type="button"
              className="snap-back"
              onClick={() => engineRef.current?.rebuild()}
              disabled={phase !== "idle"}
              aria-label="Snap the bricks back into start.ng"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 12a9 9 0 1 0 3-6.7" />
                <path d="M3 4v5h5" />
              </svg>
              {phase === "idle" ? "Snap it back" : "Building…"}
            </button>
          </div>
          <p className="hero-copy">
            Games made by builders in the community. Each one lives at its own address, like{" "}
            <span className="addr">lagos-legends.start.ng</span>. Pick one and play right in your browser.
          </p>
          <div className="hero-ctas">
            <a className="brick-btn" href="#games">
              Play now
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M7 7h10v10" />
                <path d="M7 17 17 7" />
              </svg>
            </a>
            <a className="brick-btn ghost" href={START_URL}>
              Create free account
            </a>
          </div>
        </div>
      </section>

      <div className="baseplate" aria-hidden="true" />
      <div className="marquee-band" aria-hidden="true">
        <div className="marquee-track">
          {[0, 1].map((set) => (
            <span key={set}>
              {MARQUEE.map((name) => (
                <span key={`${set}-${name}`} style={{ display: "inline-flex", alignItems: "center", gap: 34 }}>
                  {name} <i />
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      <section className="section-pad reel-section" id="build" aria-label="Watch a game get built">
        <BrickReel />
      </section>

      <TournamentSection />
      <GamesSection />
      <CreatorsSection />
      <AboutSection />

      <footer className="wfooter">
        <div className="footer-grid">
          <div className="footer-brand">
            <a className="wbrand" href="#top">
              <BrandMark />
              <strong>start</strong>
              <b>.ng</b>
            </a>
            <p>
              A little corner of the internet
              <br />
              for good games — brick by brick.
            </p>
          </div>
          <div>
            <b>Play</b>
            <a href="#games">All games</a>
            <a href="#tournament">Daily challenge</a>
          </div>
          <div>
            <b>Make</b>
            <a href={`${START_URL}/creators`}>For creators</a>
            <a href={`${START_URL}/docs`}>Docs</a>
          </div>
          <div>
            <b>Say hello</b>
            <a href="mailto:hello@start.ng">hello@start.ng</a>
            <a href="#share">Share start.ng</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 start.ng</span>
          <button type="button" className="share-button" id="share" onClick={share}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            <span aria-live="polite">{copied ? "Link copied!" : "Share the good stuff"}</span>
          </button>
          <span>Made in Lagos / 01</span>
        </div>
      </footer>
    </main>
  );
}
