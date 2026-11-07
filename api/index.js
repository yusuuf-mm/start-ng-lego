// Vercel Node.js Serverless Function
// Bridges TanStack Start's Web Fetch API handler to Vercel's Node.js runtime
// server.fetch() confirmed working locally — returns 200 SSR HTML

export default async function handler(req, res) {
  const { default: server } = await import("../dist/server/server.js");

  const protocol = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers["host"] || "localhost";
  const url = `${protocol}://${host}${req.url}`;

  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value != null) {
      headers.set(key, Array.isArray(value) ? value.join(", ") : String(value));
    }
  }

  const request = new Request(url, {
    method: req.method,
    headers,
  });

  const response = await server.fetch(request, {}, {});

  res.statusCode = response.status;
  for (const [key, value] of response.headers.entries()) {
    if (key.toLowerCase() !== "transfer-encoding") {
      res.setHeader(key, value);
    }
  }

  res.end(await response.text());
}
