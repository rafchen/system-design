# Systems — a field guide

A sixteen-chapter system-design guide with interactive case-study practice.
Static site, plus one serverless route that powers live generation and grading.

## Layout

```
index.html          redirect into the app
design/             the app
  Field Guide.dc.html   entry point
  content.js            assembles chapters, holds the canned fallback cases
  chapters/ch01..16.js  chapter content
  decisions.js          the decision tables prepended to each chapter
  claude-proxy.js       bridges window.claude.complete to /api/complete
  _ds/                  design system (tokens, stylesheet)
api/complete.js     serverless proxy to the Claude API
```

## Running locally

```bash
cd design
python3 -m http.server 8765
# http://127.0.0.1:8765/Field%20Guide.dc.html
```

There is no `/api` route in front of a plain static server, so case studies
fall back to the canned examples in `content.js`. That is expected — the app
labels itself "Canned examples · live generation off" when this happens.

To run the serverless route locally you need the Vercel CLI and a key:

```bash
npm install
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env.local
npx vercel dev
```

## Live case studies

`window.claude.complete` exists inside claude.ai and nowhere else. Without it
the five canned scenarios repeat forever and grading never reads what you
wrote. `api/complete.js` restores real generation and grading anywhere the
site is deployed.

**Setup:** add `ANTHROPIC_API_KEY` in Vercel under Settings → Environment
Variables, then redeploy. Nothing else is required — `design/claude-proxy.js`
probes the route on load and only installs itself once the route reports it
has a key. If the key is missing the site silently keeps the canned examples
rather than failing mid-case.

**Model:** `claude-opus-5` with adaptive thinking, at the default effort.
Grading someone's design is the whole point of the feature, so it is not
tuned down for latency; expect generation to take a while. Lower
`output_config.effort` in `api/complete.js` if you would rather trade some
quality for speed.

## Cost and abuse

The route is unauthenticated and spends a metered API key, on a public URL.
It ships with three brakes:

- same-origin requests only, so another site cannot spend your key
- `max_tokens` capped at 8000 and prompt size capped at 12000 characters
- roughly 12 requests per minute per IP address

The rate limit lives in one warm instance's memory, so it bounds a single
instance rather than the deployment. **It is a brake on accidents, not a
security control.** If the URL is going to be shared, put something real in
front of it — Vercel's password protection is the least work, a shared
passcode checked in the handler is the next least.

## Deploying

Framework preset **Other**, no build command. Vercel serves the repository
root as static files and `api/` as functions.
