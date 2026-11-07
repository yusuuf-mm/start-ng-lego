// Vercel Node.js Serverless Function
// Adapts TanStack Start's Web Fetch API handler to Vercel's Node.js runtime

import { createReadableStream } from "node:stream/web";

export default async function handler(req, res) {
  const { default: server } = await import("../dist/server/server.js");

  const protocol = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const url = `${protocol}://${host}${req.url}`;

  // Build a Web API Request from the Node.js IncomingMessage
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value) headers.set(key, Array.isArray(value) ? value.join(", ") : value);
  }

  const hasBody = req.method !== "GET" && req.method !== "HEAD";
  const body = hasBody
    ? new ReadableStream({
        start(controller) {
          req.on("data", (chunk) => controller.enqueue(chunk));
          req.on("end", () => controller.close());
          req.on("error", (err) => controller.error(err));
        },
      })
    : undefined;

  const request = new Request(url, {
    method: req.method,
    headers,
    body,
    duplex: "half",
  });

  const response = await server.fetch(request, {}, {});

  res.status(response.status);
  response.headers.forEach((value, key) => {
    if (key.toLowerCase() !== "transfer-encoding") {
      res.setHeader(key, value);
    }
  });

  const text = await response.text();
  res.end(text);
}
