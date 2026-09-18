import { serve } from "bun";
import index from "./index.html";

const server = serve({
  port: Number(process.env.PORT) || 3003,
  routes: {
    // Proxy backend API requests (e.g. for external devices, localtunnel, and LAN visitors)
    "/api/*": async (req) => {
      const url = new URL(req.url);
      const backendBase = process.env.BACKEND_URL || "http://localhost:3000";
      const targetUrl = `${backendBase}${url.pathname}${url.search}`;

      const headers = new Headers(req.headers);
      headers.delete("host");

      try {
        const backendRes = await fetch(targetUrl, {
          method: req.method,
          headers,
          body: ["GET", "HEAD"].includes(req.method) ? undefined : req.body,
        });

        const resHeaders = new Headers(backendRes.headers);
        resHeaders.set("access-control-allow-origin", "*");
        resHeaders.set("access-control-allow-credentials", "true");

        return new Response(backendRes.body, {
          status: backendRes.status,
          headers: resHeaders,
        });
      } catch (err: any) {
        return Response.json(
          { error: "Backend proxy error: " + (err?.message || "Service unavailable") },
          { status: 502 }
        );
      }
    },

    // Serve index.html for all unmatched routes.
    "/*": index,
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
