type AssetPointer = { url: string };

const coverPointers = import.meta.glob<AssetPointer>("/src/assets/covers/*.asset.json", {
  eager: true,
  import: "default",
});

/** Cover image URL by file stem, e.g. cover("suwe"). */
export function cover(stem: string): string {
  const hit = coverPointers[`/src/assets/covers/${stem}.webp.asset.json`];
  return hit?.url ?? "";
}

export const START_URL = "https://start.ng";

export type Category = "arcade" | "puzzle" | "chill" | "adventure" | "naija" | "racing";

export const CATEGORIES: Category[] = ["arcade", "puzzle", "chill", "adventure", "naija", "racing"];

export const CATEGORY_LABEL: Record<Category, string> = {
  arcade: "Arcade",
  puzzle: "Brainy",
  chill: "Chill",
  adventure: "Adventure",
  naija: "Naija",
  racing: "Racing",
};

/** Brick color per category (CSS variable names from the brick palette). */
export const CATEGORY_COLOR: Record<Category, string> = {
  arcade: "var(--blue)",
  puzzle: "var(--red)",
  chill: "var(--yellow)",
  adventure: "var(--green)",
  naija: "var(--yellow-deep)",
  racing: "var(--ink)",
};

export type Game = { slug: string; name: string; by: string; cat: Category };

export const GAMES: Game[] = [
  { slug: "suwe", name: "Suwe", by: "The Product Girlie", cat: "naija" },
  { slug: "inkbreak", name: "Inkbreak", by: "henryuks", cat: "puzzle" },
  { slug: "lagos-bike-rush", name: "Lagos Bike Rush", by: "OBA", cat: "arcade" },
  { slug: "relic-rush-3d", name: "Relic Rush 3D", by: "Noble", cat: "adventure" },
  { slug: "danfo-make-way", name: "Danfo Make Way", by: "Okeke", cat: "naija" },
  { slug: "ghost-shift", name: "Ghost Shift", by: "Testing", cat: "puzzle" },
  { slug: "hangout", name: "The Hangout", by: "start.ng", cat: "chill" },
  { slug: "jollof-rush-3d", name: "Jollof Rush 3D", by: "Rebecca", cat: "chill" },
  { slug: "tesla-skyrun", name: "Tesla Skyrun", by: "Favour", cat: "racing" },
  { slug: "word-market", name: "Word Market", by: "Arnold", cat: "puzzle" },
  { slug: "alley-velocity", name: "Alley Velocity", by: "Monarch", cat: "racing" },
  { slug: "danfo-defense", name: "Danfo Defense", by: "emmyanz", cat: "naija" },
  { slug: "follow-follow", name: "Follow Follow", by: "kim", cat: "arcade" },
];

export const TOURNAMENT_LINEUP = ["tesla-skyrun", "word-market", "alley-velocity", "inkbreak", "follow-follow"]
  .map((slug) => GAMES.find((g) => g.slug === slug))
  .filter((g): g is Game => Boolean(g));

export const INDIE_GAMES = [
  { name: "Danfo Run", host: "indie arcade", by: "", stem: "indie-danfo-run", badge: "Most clicked" },
  { name: "KingdomPlots", host: "kingdomplotsgames.com", by: "Toluwase", stem: "indie-kingdomplots" },
  { name: "The Plot", host: "theplot.usevale.art", by: "AroicX", stem: "indie-the-plot" },
  { name: "Nairobi Stories", host: "nairobistories.xyz", by: "Zitrion", stem: "indie-nairobi-stories" },
] as const;

export const FAQ = [
  {
    q: "What is start.ng?",
    a: "A home for free browser games made by the community. Each game has its own address, like yourgame.start.ng, and you play it right in your browser.",
  },
  { q: "Is it free?", a: "Yes. Every game on start.ng is free to play in your browser, with nothing to download." },
  {
    q: "Are there Nigerian games here?",
    a: "Plenty. Danfo rush hour, jollof catching, Lagos markets — many games are Naija-themed, and we welcome games from across Africa too.",
  },
  {
    q: "Do I need an account to play?",
    a: "No. Sign in to get your start.ng character, keep your scores on the leaderboards and join the daily tournament.",
  },
  {
    q: "What is the daily tournament?",
    a: "Every day a few games are picked for 24 hours, and the best player wins. Points count towards the overall leaderboard.",
  },
  {
    q: "How do I put my game on start.ng?",
    a: "Push your browser game to a public repo, publish it with one call and approve it once. It goes live at yourgame.start.ng with its own leaderboard.",
  },
];

export const MARQUEE = GAMES.filter((g) => g.slug !== "danfo-defense").map((g) => g.name);

/** Steps shown beside the brick-builder reel; `at` is the second each beat starts. */
export const REEL_STEPS = [
  { at: 0, title: "Stroll onto the plate", body: "Every build starts with one builder and a big idea." },
  { at: 2.3, title: "Trip on a stray brick", body: "It happens to the best of us. Arms up, no shame." },
  { at: 3.3, title: "Let the pieces fly", body: "Red, black, yellow — everything scatters, nothing's lost." },
  { at: 4.6, title: "Snap. It's a game.", body: "The pieces land in place. That's how start.ng games get made." },
];
