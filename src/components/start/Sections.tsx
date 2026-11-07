import { useMemo, useState } from "react";

import {
  CATEGORIES,
  CATEGORY_COLOR,
  CATEGORY_LABEL,
  FAQ,
  GAMES,
  INDIE_GAMES,
  START_URL,
  TOURNAMENT_LINEUP,
  cover,
  type Category,
} from "./data";
import { useLagosClock } from "./useLagosClock";

export function TournamentSection() {
  const clock = useLagosClock();
  return (
    <section className="section-pad">
      <div className="tournament reveal" id="tournament">
        <span className="tournament-badge">Today's tournament · Live</span>
        <div>
          <span className="step-chip">
            <span className="num">01</span> Play together
          </span>
          <h2>
            5 games. 24 hours.
            <br />
            <em>One winner.</em>
          </h2>
          <p>
            Every day we snap five games onto the build plate and crown the player with the highest score. Share to
            enter, then play.
          </p>
          <span className="countdown" aria-live="off">
            Next tournament in <b>{clock.tournamentIn}</b> · {clock.tournamentAt}
          </span>
          <div className="creator-actions">
            <a className="brick-btn green" href={`${START_URL}/games`}>
              Play today's games
            </a>
          </div>
        </div>
        <div
          className="tournament-gallery"
          role="img"
          aria-label="A moving lineup of five real games in today's tournament."
        >
          <div className="tournament-gallery-track">
            {[0, 1].map((set) => (
              <div className="tournament-gallery-set" aria-hidden={set === 1} key={set}>
                {TOURNAMENT_LINEUP.map((g, n) => (
                  <span
                    className="tournament-game-tile"
                    style={{ "--tile-index": n } as React.CSSProperties}
                    key={`${set}-${g.slug}`}
                  >
                    <img src={cover(g.slug)} alt="" loading="lazy" />
                    <span>{g.name}</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
          <span className="gallery-caption mono-label">Today's lineup · 05 games</span>
        </div>
      </div>

      <a className="daily-strip reveal" href={`${START_URL}/games/rooftop-rush`} style={{ textDecoration: "none" }}>
        <div>
          <span className="tag">Daily challenge · {clock.challengeLeft} left</span>
          <h3>Reach 61 in Rooftop Rush</h3>
          <p>One minute. One leaderboard. How far can you go?</p>
        </div>
        <span className="daily-brick" aria-hidden="true">
          R
        </span>
      </a>
    </section>
  );
}

const PAGE = 8;

export function GamesSection() {
  const [filter, setFilter] = useState<Category | "all">("all");
  const [visible, setVisible] = useState(PAGE);

  const filtered = useMemo(() => (filter === "all" ? GAMES : GAMES.filter((g) => g.cat === filter)), [filter]);
  const shown = filtered.slice(0, visible);
  const counts = useMemo(() => {
    const m = new Map<Category, number>();
    for (const g of GAMES) m.set(g.cat, (m.get(g.cat) ?? 0) + 1);
    return m;
  }, []);

  const pick = (f: Category | "all") => {
    setFilter(f);
    setVisible(PAGE);
  };

  return (
    <section className="section-pad" id="games">
      <div className="games-head reveal">
        <div>
          <span className="step-chip">
            <span className="num">02</span> Find a game
          </span>
          <h2 className="section-title">
            Pick your <em>poison.</em>
          </h2>
          <p className="section-sub">
            Every card snaps onto the board. Filter by mood, click one, and you're playing in seconds.
          </p>
        </div>
        <span className="mono-label" style={{ color: "var(--ink-soft)" }}>
          {filtered.length} / {GAMES.length} games on the plate
        </span>
      </div>

      <div className="filter-row" role="group" aria-label="Filter games by category">
        <button
          type="button"
          className={"filter-chip" + (filter === "all" ? " active" : "")}
          aria-pressed={filter === "all"}
          onClick={() => pick("all")}
        >
          <i style={{ "--chip": "var(--green)" } as React.CSSProperties} /> All games{" "}
          <span className="count">{GAMES.length}</span>
        </button>
        {CATEGORIES.map((c) => (
          <button
            type="button"
            key={c}
            className={"filter-chip" + (filter === c ? " active" : "")}
            aria-pressed={filter === c}
            onClick={() => pick(c)}
          >
            <i style={{ "--chip": CATEGORY_COLOR[c] } as React.CSSProperties} />
            {CATEGORY_LABEL[c]} <span className="count">{counts.get(c) ?? 0}</span>
          </button>
        ))}
      </div>

      <div className="game-grid">
        {shown.map((g, i) => (
          <a
            className="game-card"
            href={`${START_URL}/games/${g.slug}`}
            key={g.slug}
            style={{ "--tilt": `${((i % 3) - 1) * 0.9}deg`, "--chip": CATEGORY_COLOR[g.cat] } as React.CSSProperties}
          >
            <span className="studs-top" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
            </span>
            <span className="cover">
              <img src={cover(g.slug)} alt={`${g.name} cover art`} loading="lazy" />
            </span>
            <span className="meta">
              <h4>{g.name}</h4>
              <span className="by">by {g.by}</span>
              <span className="cat">{CATEGORY_LABEL[g.cat]}</span>
            </span>
          </a>
        ))}
      </div>

      {visible < filtered.length ? (
        <div className="load-more-wrap">
          <button type="button" className="brick-btn yellow" onClick={() => setVisible((v) => v + 4)}>
            Load more games
          </button>
        </div>
      ) : (
        <div className="see-all">
          <a className="brick-btn yellow" href={`${START_URL}/games`}>
            See all games on start.ng
          </a>
        </div>
      )}
    </section>
  );
}

export function CreatorsSection() {
  return (
    <section className="section-pad" id="creators">
      <div className="creator-wrap">
        <div className="reveal">
          <span className="step-chip">
            <span className="num">03</span> Build something
          </span>
          <h2 className="section-title">
            Got a game?
            <br />
            <em>Put it on start.ng.</em>
          </h2>
          <p className="section-sub">
            Make something small, weird, and wonderful. Publish it and people play it right in their browser — no
            installs, no app stores, no permission slip.
          </p>
          <div className="creator-actions">
            <a className="brick-btn blue" href={`${START_URL}/docs`}>
              Read the docs
            </a>
            <a className="text-link" href={`${START_URL}/creators`}>
              Create your game ↗
            </a>
          </div>
        </div>
        <div className="indie-grid reveal">
          {INDIE_GAMES.map((g, i) => (
            <a
              className="indie-card"
              href={`${START_URL}/creators`}
              key={g.name}
              style={{ "--tilt": `${(i % 2 === 0 ? -1 : 1) * 1.1}deg` } as React.CSSProperties}
            >
              <span className="cover">
                <img src={cover(g.stem)} alt={`${g.name} cover`} loading="lazy" />
              </span>
              <span className="meta">
                <h4>
                  {g.name}
                  {"badge" in g && g.badge && (
                    <span className="cat" style={{ marginLeft: 8, background: "var(--yellow)" }}>
                      {g.badge}
                    </span>
                  )}
                </h4>
                <span>
                  {g.host}
                  {g.by ? ` · by ${g.by}` : ""}
                </span>
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export function AboutSection() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="section-pad" id="about">
      <div className="about-wrap">
        <div className="reveal">
          <span className="step-chip">
            <span className="num">04</span> About start.ng
          </span>
          <h2 className="section-title">
            For the curious, <em>by the builders.</em>
          </h2>
          <p className="section-sub">
            start.ng is a home for browser games built by the community. Every game is free to play with no download —
            and many are made in Naija: danfo rush hour, jollof catching, Lagos markets and more.
          </p>
          <p className="section-sub" style={{ marginTop: 14 }}>
            We're also building a home for web games from across Africa. If you make games anywhere on the continent,
            you can put yours here for free.
          </p>
          <div className="creator-actions">
            <a className="brick-btn yellow" href="#top">
              Back to the top
            </a>
          </div>
        </div>
        <div className="faq-list reveal">
          {FAQ.map((f, i) => (
            <div className={"faq-item" + (open === i ? " open" : "")} key={f.q}>
              <button
                type="button"
                className="faq-q"
                aria-expanded={open === i}
                aria-controls={`faq-${i}`}
                onClick={() => setOpen(open === i ? null : i)}
              >
                {f.q}
                <span className="toggle" aria-hidden="true">
                  +
                </span>
              </button>
              <div className="faq-a" id={`faq-${i}`} role="region">
                <p>{f.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
