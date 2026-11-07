// start.ng runs on Lagos time (WAT, UTC+1, no daylight saving).
const LAGOS_OFFSET_MS = 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Daily tournament starts at 12:00 noon, Lagos time. */
export const TOURNAMENT_HOUR_LAGOS = 12;

function lagosMidnightUtc(now: Date): number {
  const lagosNow = now.getTime() + LAGOS_OFFSET_MS;
  const lagosDayStart = Math.floor(lagosNow / DAY_MS) * DAY_MS;
  return lagosDayStart - LAGOS_OFFSET_MS;
}

/** The next daily tournament start (today at noon Lagos, or tomorrow if passed). */
export function nextTournamentStart(now: Date): Date {
  const todayNoon = lagosMidnightUtc(now) + TOURNAMENT_HOUR_LAGOS * 60 * 60 * 1000;
  return new Date(now.getTime() < todayNoon ? todayNoon : todayNoon + DAY_MS);
}

/** The daily challenge resets at midnight, Lagos time. */
export function dailyChallengeEnds(now: Date): Date {
  return new Date(lagosMidnightUtc(now) + DAY_MS);
}

/** "17h 31m" style countdown, rounded down to the minute. */
export function formatCountdown(ms: number): string {
  const totalMinutes = Math.max(0, Math.floor(ms / 60000));
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}h ${String(m).padStart(2, "0")}m`;
}

export function formatLagosDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Africa/Lagos",
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}
