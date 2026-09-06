import Anthropic from "@anthropic-ai/sdk";

// Case generation and grading are reasoning-heavy and can run past the
// default serverless ceiling. Ask for the longer window explicitly.
export const maxDuration = 60;

const MODEL = "claude-opus-5";
const MAX_TOKENS_CAP = 8000;   // the app asks for 2500-6000; cap the rest
const MAX_PROMPT_CHARS = 24000;  // the search catalogue alone is ~7.5KB

// Best-effort rate limiting. This lives in one warm instance's memory, so
// it bounds a single instance rather than the deployment as a whole. It is
// a brake on accidents and casual abuse, not a security control — see the
// note in the README about putting a real limit in front of this.
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 12;
const hits = new Map();

function overLimit(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 500) {
    for (const [k, v] of hits) {
      if (!v.some((t) => now - t < WINDOW_MS)) hits.delete(k);
    }
  }
  return recent.length > MAX_PER_WINDOW;
}

let client;

export default async function handler(req, res) {
  // The browser probes with GET before installing the shim, so a deployment
  // without a key keeps falling back to the canned examples instead of
  // failing halfway through a case.
  if (req.method === "GET") {
    return res.status(200).json({ ok: Boolean(process.env.ANTHROPIC_API_KEY) });
  }
  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({ error: "ANTHROPIC_API_KEY is not set on this deployment." });
  }

  // Same-origin only. The page and the route share a host, so anything
  // carrying a foreign Origin is another site spending your key.
  const { origin, host } = req.headers;
  if (origin && host) {
    let originHost;
    try {
      originHost = new URL(origin).host;
    } catch {
      return res.status(403).json({ error: "Bad Origin header." });
    }
    if (originHost !== host) {
      return res.status(403).json({ error: "Cross-origin requests are not allowed." });
    }
  }

  const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "unknown";
  if (overLimit(ip)) {
    res.setHeader("Retry-After", "60");
    return res.status(429).json({ error: "Too many requests — wait a minute and try again." });
  }

  const { system, messages, max_tokens } = req.body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "messages must be a non-empty array" });
  }
  if (JSON.stringify(messages).length + String(system || "").length > MAX_PROMPT_CHARS) {
    return res.status(413).json({ error: "Prompt too large" });
  }

  try {
    client ??= new Anthropic();

    // Streaming keeps the connection active so a long reasoning turn does
    // not trip an idle timeout; the client still receives one JSON body.
    const stream = client.beta.messages.stream({
      model: MODEL,
      max_tokens: Math.min(Number(max_tokens) || 3000, MAX_TOKENS_CAP),
      system,
      messages,
      thinking: { type: "adaptive" },
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
    });

    const message = await stream.finalMessage();

    if (message.stop_reason === "refusal") {
      return res.status(422).json({ error: "The model declined to answer this one. Try generating a different case." });
    }

    const text = message.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("");

    return res.status(200).json({ text });
  } catch (err) {
    const status = Number(err?.status);
    console.error("complete failed:", err?.message || err);
    if (status === 429) {
      return res.status(429).json({ error: "Rate limited upstream — wait a moment and retry." });
    }
    if (status === 401 || status === 403) {
      return res.status(500).json({ error: "The API key was rejected. Check ANTHROPIC_API_KEY." });
    }
    return res.status(status >= 400 && status < 600 ? status : 500).json({
      error: err?.message || "Upstream request failed",
    });
  }
}
