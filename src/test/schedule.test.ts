import { describe, expect, it } from "vitest";

import { dailyChallengeEnds, formatCountdown, nextTournamentStart } from "@/lib/schedule";

describe("tournament schedule (Lagos time)", () => {
  it("starts today at 12:00 Lagos (11:00 UTC) when it's still morning in Lagos", () => {
    const now = new Date("2026-11-07T02:58:00Z"); // 03:58 in Lagos
    expect(nextTournamentStart(now).toISOString()).toBe("2026-11-07T11:00:00.000Z");
  });

  it("rolls to tomorrow's noon once today's has started", () => {
    const now = new Date("2026-11-07T11:00:00Z"); // exactly 12:00 Lagos
    expect(nextTournamentStart(now).toISOString()).toBe("2026-11-08T11:00:00.000Z");
  });

  it("uses the Lagos date, not the UTC date, late at night", () => {
    const now = new Date("2026-11-07T23:30:00Z"); // 00:30 Nov 8 in Lagos
    expect(nextTournamentStart(now).toISOString()).toBe("2026-11-08T11:00:00.000Z");
  });

  it("daily challenge ends at Lagos midnight (23:00 UTC)", () => {
    const now = new Date("2026-11-07T02:58:00Z");
    expect(dailyChallengeEnds(now).toISOString()).toBe("2026-11-07T23:00:00.000Z");
  });

  it("formats a countdown in hours and minutes", () => {
    expect(formatCountdown((17 * 60 + 31) * 60000 + 59000)).toBe("17h 31m");
    expect(formatCountdown(5 * 60000)).toBe("0h 05m");
  });
});
