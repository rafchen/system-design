const D = (name, o) => ["dec", { name, ...o }];
export default {id:"security",num:"10",title:"Security and privacy",example:"a multi-tenant SaaS document platform",
tagline:"Where identity is checked, where permission is checked, how tenants are kept apart — each as a decision that shapes the data model, not a closing ritual.",
terms:["AuthN vs AuthZ","Session vs JWT","OAuth / OIDC","RBAC vs ABAC","Row-level security","Rate limiting","PII & deletion"],
objectives:["Place authentication at the edge and object-level authorization in the service","Choose sessions or JWTs from the revocation requirement","Pick a tenant-isolation model from tenant count and risk","Name the standard vulnerabilities and the one decision that removes each","Treat abuse as a scale problem with an adversary"],
sections:[
{id:"authn-authz",title:"Authentication at the edge, authorization on the object",blocks:[
D("Object-level authorization in the service",{say:"The gateway proves who you are; the document service checks on every read that this document belongs to your tenant and is shared with you — otherwise a valid token reads any document by changing the id.",
use:["Every resource read or write"],
avoid:["Trusting a valid token as permission (broken object-level authz — the most common API audit finding)","Role checks alone ('is editor?') without the object ('may edit THIS?')"],
consider:["Authentication = who; authorization = what, on which object","Enforce below the app where possible (row-level security)"],
cases:["Editor in tenant A requests doc in tenant B → 404, not 403 (don't confirm existence)","Shared link revoked while a viewer has the doc open → re-check on next fetch"]}),
D("RBAC vs ABAC",{say:"Three roles per tenant — viewer, editor, admin — plus one attribute rule: editors may edit documents they own or that are shared with them.",
use:["RBAC: a few roles cover the needs; easy to audit","ABAC: rules on ownership/sharing where roles over-grant"],
avoid:["Dozens of roles — a maintenance burden nobody can reason about","Attribute rules everywhere — nobody can audit them"],
consider:["Least privilege for services too: the indexer reads documents; it holds no write credential"]})
]},
{id:"tokens",title:"Sessions or JWTs; OAuth and OIDC",blocks:[
D("Server-side sessions",{say:"Revocation must be instant here (a removed employee loses access now), so an opaque session id looked up per request — the session store becomes a hot dependency I'll replicate.",
use:["Instant revocation is a hard requirement","One application, one store"],
avoid:["Many services each needing a lookup per request"],
consider:["A lookup per request; the store must be fast and available"]}),
D("Short JWT + refresh token",{say:"15-minute JWTs any service verifies with the public key, a server-side refresh token that can be revoked, and a revocation-list check only on sensitive actions.",
use:["Multi-service systems; verification without a lookup"],
avoid:["Long-lived JWTs — a leaked token works until expiry","Storing PII in claims"],
consider:["Rotate signing keys with a kid; verify issuer and audience; reject 'alg: none'"],
fails:"Log out, change password, remove from tenant — the old token still works until expiry unless you check a list."}),
D("OAuth 2.0 and OpenID Connect",{say:"Each tenant plugs in its own identity provider via OIDC — a security feature and the enterprise-sales requirement that unlocks the biggest customers.",
use:["Delegated access to another service's data (OAuth)","Sign-in with an identity provider / enterprise SSO (OIDC)"],
avoid:["Rolling your own token exchange"],
consider:["Scoped, revocable tokens; PKCE for public clients"]}),
D("Secrets",{say:"Signing keys and DB passwords come from a secrets manager at runtime, rotate on schedule, and never appear in code, images, logs or error messages.",
use:["Every credential"],
avoid:["A signing key that can't rotate without logging everyone out — it will never be rotated"]})
]},
{id:"data",title:"Protecting data and closing the classic holes",blocks:[
["tbl",{cols:["Vulnerability","The one decision that removes it","Where"],rows:[["SQL injection","Parameterised queries — no other acceptable answer","Every query"],["XSS","Output encoding by context + CSP; strict allow-list sanitiser for rich text","Every render of user content"],["CSRF","SameSite cookies + per-request token","Every state-changing form/API from a browser"],["Broken object authz","Check ownership/sharing on the object, every request","Every service"],["SSRF / path traversal","Validate and allow-list at the boundary; reject, don't sanitise","Any user-supplied URL or path"]]}],
D("Encryption in transit and at rest",{say:"TLS on every hop including inside the datacenter; disks, databases and backups encrypted with KMS keys; per-tenant keys so an offboarded tenant's data becomes unrecoverable everywhere at once.",
use:["Always; per-tenant keys for regulated or large tenants"],
consider:["The network you don't control isn't only the public one","Crypto-shredding: destroy the key, the backups are gone too"]}),
D("PII, retention and deletion",{say:"We classify what we store, minimise it, set retention, and make deletion actually delete — across replicas, caches, search indexes, backups and the warehouse. A deletion that leaves the search index is a compliance failure.",
use:["Any personal data"],
consider:["Audit log of who accessed personal data, kept longer than the data","Deletion as an asynchronous workflow with a completion record"],
cases:["Delete user → 7 places; a job tracks each","Backups: crypto-shred or expire; document the window"]})
]},
{id:"tenants-abuse",title:"Tenant isolation and abuse",blocks:[
["tbl",{cols:["Isolation model","Use when","Tradeoff"],rows:[["Shared tables + tenant_id in app","Many tiny tenants, low risk","Cheapest; one missed WHERE leaks"],["Shared tables + row-level security","Default for most SaaS","Filter enforced by the DB; DB-specific"],["Schema per tenant","Hundreds of mid-size tenants","Stronger; migrations × tenants"],["Database per tenant","Few large or regulated tenants","Strongest; cost scales per tenant"]]}],
D("Row-level security as the default",{say:"Every table has tenant_id; the database adds the tenant filter from the connection's context so ten thousand queries can't forget it; the biggest customers get their own database and key.",
use:["Most multi-tenant SaaS"],
avoid:["Relying on every developer remembering the WHERE clause"],
consider:["Test isolation with automated cross-tenant access attempts on every deploy","Tenant-scoped API keys and encryption keys complete the boundary"]}),
D("Abuse as a scale problem with an adversary",{say:"Bots scraping, credential stuffing, account enumeration, a user requesting a 50,000-page export every minute — rate limits per user/IP/endpoint, cost-based throttling, identical timing and wording on auth failures, CAPTCHAs at the limit, and an audit log so we can see what was taken.",
use:["Every public surface"],
consider:["Same tools as Chapters 03 and 08, with intent added","Never a 'no such user' message"]}),
["t","Raise security when it changes the design: the tenant boundary decides the data model; revocation decides the token strategy; moderation adds a pipeline stage. 'And we'd encrypt everything' at the end signals it wasn't part of the design."]
]}
]};
