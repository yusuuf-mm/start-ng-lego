import { useEffect, useState } from "react";

import { dailyChallengeEnds, formatCountdown, formatLagosDate, nextTournamentStart } from "@/lib/schedule";

/** Live tournament / daily-challenge countdowns. Null until mounted to avoid hydration drift. */
export function useLagosClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 20_000);
    return () => window.clearInterval(id);
  }, []);

  if (!now) return { tournamentIn: "··h ··m", tournamentAt: "12:00 PM, Lagos time", challengeLeft: "··h ··m" };

  const start = nextTournamentStart(now);
  return {
    tournamentIn: formatCountdown(start.getTime() - now.getTime()),
    tournamentAt: formatLagosDate(start),
    challengeLeft: formatCountdown(dailyChallengeEnds(now).getTime() - now.getTime()),
  };
}
