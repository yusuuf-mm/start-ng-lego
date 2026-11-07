import { createFileRoute } from "@tanstack/react-router";

import { StartHome } from "@/components/start/StartHome";

const TITLE = "start.ng — Good vibes. Good games.";
const DESCRIPTION =
  "Free browser games built brick by brick by the community in Lagos and across Africa. Pick a game, join the daily tournament, or put your own on start.ng.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
  }),
  component: StartHome,
});
