'use client'

import { useState, type MouseEvent } from 'react'
import { ArrowUpRight, ChevronDown, Moon, Play, Share2, Sun } from 'lucide-react'
import { LegoMinifig } from '@/components/lego-minifig'
import { LegoRing, RingDefs } from '@/components/lego-ring'

const featuredGames = [
  { title: 'The Hangout', creator: 'start.ng', meta: 'social / chill', art: 'hangout', featured: true },
  { title: 'Lego Brick Hunt', creator: 'Kola Studio', meta: 'adventure', art: 'brick-hunt' },
  { title: 'Begu Begu', creator: 'Mazi Games', meta: 'puzzle', art: 'begu' },
  { title: 'Ninja Arcade', creator: 'Ola Plays', meta: 'arcade', art: 'ninja' },
  { title: 'Job Hunt', creator: 'start.ng', meta: 'daily game', art: 'job' },
  { title: 'Tetris Sprint', creator: 'Ade Makes', meta: 'puzzle', art: 'tetris' },
  { title: 'Zuma Rock Way', creator: 'Naija Nerds', meta: 'explore', art: 'zuma' },
  { title: 'Interlock', creator: 'Eko Lab', meta: 'strategy', art: 'interlock' },
]

const categories = ['All games', 'Arcade', 'Puzzle', 'Chill', 'Adventure', 'Daily']
const faqs = ['What is start.ng?', 'Is it free?', 'How do I publish my game?', 'Who is the community for?', 'What is the daily game?', 'How do I get my game featured?']

function GameCard({ game }: { game: typeof featuredGames[number] }) {
  return <article className={`real-game-card ${game.featured ? 'featured-game' : ''}`}>
    <div className={`thumbnail thumb-${game.art}`}><span className="thumb-label">{game.title}</span><span className="thumb-studs" aria-hidden="true" /></div>
    <div className="real-game-info"><div><h3>{game.title}</h3><p>{game.creator}</p></div><span className="game-arrow">↗</span></div>
    <span className="game-meta">{game.meta}</span>
  </article>
}

// Click-squash for the LEGO "oo" rings (re-adding the class restarts the
// animation, so repeated clicks keep bouncing the ring).
function squashBrick(event: MouseEvent<SVGElement>) {
  const ring = event.currentTarget
  ring.classList.remove('squash')
  void ring.getBoundingClientRect()
  ring.classList.add('squash')
}

export default function Page() {
  const [isDark, setIsDark] = useState(false)
  const [activeCategory, setActiveCategory] = useState('All games')
  return <main className={`site-shell ${isDark ? 'night-mode' : ''}`}>
    <RingDefs />
    <div className="paper-grain" aria-hidden="true" />
    <nav className="topbar" aria-label="Main navigation">
      <a className="brand" href="#top" aria-label="start.ng home"><span className="brand-mark"><i /><i /><i /></span><strong>start</strong><b>.ng</b></a>
      <div className="navlinks"><a href="#games">Games</a><a href="#tournament">Tournament</a><a href="#creators">Creators</a><a href="#about">Docs</a></div>
      <div className="nav-actions"><button className="round-action" onClick={() => setIsDark(!isDark)} aria-label={isDark ? 'Use light mode' : 'Use dark mode'}>{isDark ? <Sun /> : <Moon />}</button><button className="signin">Sign in</button></div>
    </nav>

    <section className="hero" id="top">
      <div className="eyebrow"><span className="eyebrow-dot" /> Lagos, Nigeria <span className="eyebrow-rule" /> No. 001</div>
      <div className="hero-copy"><p className="kicker">BIG IMAGINATION. PLAYED EVERYWHERE.</p><div className="hero-title-wrap"><h1 aria-label="Good vibes. Good games."><span className="word-good">Good vibes.</span><br /><span className="word-games"><span className="lego-edition" aria-hidden="true"><span className="lego-wordmark">LEGO</span></span>G<LegoRing k={0} onClick={squashBrick} /><LegoRing k={1} onClick={squashBrick} />d games.<span className="lego-caption" aria-hidden="true">play edition / 01</span></span></h1><span className="hero-minifig hero-minifig-left" aria-hidden="true"><LegoMinifig /></span><span className="hero-minifig hero-minifig-right" aria-hidden="true"><LegoMinifig /></span></div><p className="lede">Games made by builders in the community.<br />Each one lives at its own start.ng address.<br />Pick one and play right in your browser.</p><a className="play-link lego-button dark-button" href="#games"><span className="play-icon"><Play fill="currentColor" /></span> Play now <ArrowUpRight /></a><a className="secondary-link" href="#creators">Create free account</a></div>
    </section>

    <section className="feature-banner" id="tournament"><div><span className="section-number">01 / PLAY TOGETHER</span><h2>5 games. 24 hours.<br /><em>One winner.</em></h2><p>Every day, we pick a handful of games and crown the player with the highest score.</p><a className="lego-button dark-button" href="#games">Play the daily games <ArrowUpRight /></a></div><div className="banner-bricks" aria-hidden="true"><i /><i /><i /><i /><i /></div></section>

    <section className="daily-strip"><div><span className="section-number">DAILY CHALLENGE</span><h2>Reach 59 in Rooftop Rush</h2><p>One minute. One leaderboard. How far can you go?</p></div><span className="daily-mark">R</span></section>

    <section className="category-section" id="games"><div className="section-head"><div><span className="section-number">02 / FIND A GAME</span><h2>Pick your poison</h2></div><span className="section-note">No downloads. No pressure.</span></div><div className="category-tabs" role="tablist">{categories.map((category) => <button key={category} className={activeCategory === category ? 'active' : ''} onClick={() => setActiveCategory(category)}>{category}</button>)}</div><div className="game-grid">{featuredGames.map((game) => <GameCard key={game.title} game={game} />)}</div><button className="load-more">Load more games <ArrowUpRight /></button></section>

    <section className="creator-section" id="creators"><div><span className="section-number">03 / BUILD SOMETHING</span><h2>Got a game?<br /><em>Put it on start.ng.</em></h2><p>Make something small, weird, and wonderful. Publish it for people to play right in their browser.</p><div className="creator-actions"><a className="lego-button dark-button" href="#about">Read the docs <ArrowUpRight /></a><a className="text-link" href="#about">Create your game ↗</a></div></div><div className="creator-cards"><div><b>Build</b><p>Any stack. Any idea. Your playground.</p></div><div><b>Push to GitHub</b><p>A simple path from code to game.</p></div><div><b>Publish</b><p>Get a start.ng address in seconds.</p></div><div><b>Approve twice</b><p>We keep the good stuff good.</p></div></div></section>

    <section className="about-section" id="about"><span className="section-number">04 / ABOUT START.NG</span><h2>For the curious,<br /><em>by the curious.</em></h2><p>start.ng is Nigeria’s home for small games, big imagination, and people who like to make things. We’re building a place where anyone can play, publish, and find their next favourite thing.</p><div className="faq-list">{faqs.map((faq) => <button key={faq}><span>{faq}</span><ChevronDown /></button>)}</div></section>

    <footer><div className="footer-brand"><a className="brand" href="#top"><span className="brand-mark"><i /><i /><i /></span><strong>start</strong><b>.ng</b></a><p>A little corner of the internet<br />for good games.</p></div><div><b>Play</b><a href="#games">All games</a><a href="#tournament">Daily challenge</a></div><div><b>Make</b><a href="#creators">For creators</a><a href="#about">Docs</a></div><div><b>Say hello</b><a href="#about">hello@start.ng</a><a href="#share">Share start.ng</a></div><div className="footer-bottom"><span>© 2026 start.ng</span><button className="share-button" id="share" onClick={() => navigator.clipboard?.writeText('https://start.ng')}><Share2 /> Share the good stuff</button><span>Made in Lagos / 01</span></div></footer>
  </main>
}
