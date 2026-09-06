/*
 * Bridges window.claude.complete to this deployment's /api/complete route.
 *
 * The app calls window.claude.complete(...) to generate and grade case
 * studies. That object exists natively inside claude.ai and nowhere else,
 * which is why a plain static deployment falls back to the canned examples
 * in content.js.
 *
 * Three rules this file follows:
 *   1. If the native runtime is present, leave it completely alone.
 *   2. Only install the bridge once the route has confirmed it can serve —
 *      so a static host with no backend keeps the canned fallback instead
 *      of failing part-way through a case.
 *   3. Return a plain string, because that is what the caller parses.
 */
(function () {
  "use strict";

  if (window.claude && typeof window.claude.complete === "function") return;

  var ENDPOINT = "/api/complete";

  fetch(ENDPOINT, { method: "GET" })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (probe) {
      if (!probe || probe.ok !== true) return;

      window.claude = {
        complete: function (opts) {
          return fetch(ENDPOINT, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              system: opts.system,
              messages: opts.messages,
              max_tokens: opts.max_tokens
            })
          }).then(function (r) {
            return r.json().catch(function () { return {}; }).then(function (data) {
              if (!r.ok) throw new Error(data.error || "Request failed (" + r.status + ")");
              return data.text || "";
            });
          });
        }
      };
    })
    .catch(function () { /* no backend reachable — canned examples stand */ });
})();
