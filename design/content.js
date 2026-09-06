import c1 from './chapters/ch01.js';import c2 from './chapters/ch02.js';import c3 from './chapters/ch03.js';import c4 from './chapters/ch04.js';import c5 from './chapters/ch05.js';import c6 from './chapters/ch06.js';import c7 from './chapters/ch07.js';import c8 from './chapters/ch08.js';import c9 from './chapters/ch09.js';import c10 from './chapters/ch10.js';import c11 from './chapters/ch11.js';import c12 from './chapters/ch12.js';import c13 from './chapters/ch13.js';import c14 from './chapters/ch14.js';import c15 from './chapters/ch15.js';import c16 from './chapters/ch16.js';import c17 from './chapters/ch17.js';import c18 from './chapters/ch18.js';import { DECISIONS } from './decisions.js';
const RAW = [c1,c2,c3,c4,c5,c6,c7,c8,c9,c10,c11,c12,c13,c14,c15,c16,c17,c18];
export const CHAPTERS = RAW.map(c => DECISIONS[c.id] ? { ...c, sections: [{ id: 'decisions', title: 'Decisions: when to use what', blocks: DECISIONS[c.id] }, ...c.sections] } : c);

export const CATEGORIES = [
{key:"happy",label:"Happy path",hint:"The normal read and write flow, step by step."},
{key:"alternate",label:"Alternate paths",hint:"Other valid ways the operation happens."},
{key:"edge",label:"Edge cases",hint:"Empty input, huge object, deleted user, uncommon state."},
{key:"concurrency",label:"Concurrency",hint:"Two operations at once. Which invariant must survive?"},
{key:"scale",label:"Scale & hotspots",hint:"Viral spike, hot partition, hot key."},
{key:"failure",label:"Failure",hint:"Crash, lost response, timeout, dependency down."},
{key:"abuse",label:"Abuse & security",hint:"Malicious or unauthorised users."}
];

export const PRODUCT_CATEGORIES = [
{key:"scope",label:"Scope & invariants",hint:"Users, core flows, what's out, what must never happen."},
{key:"data",label:"Data model",hint:"Entities, keys, how history is kept, which constraint enforces the invariant."},
{key:"algorithm",label:"Algorithm / logic",hint:"How the core decision is made, when it runs, edge cases (odd counts, opt-outs)."},
{key:"api",label:"API",hint:"The handful of REST endpoints and who may call them."},
{key:"ui",label:"Interface",hint:"The two or three screens and why a user would come back."},
{key:"scale",label:"Scale & failure nod",hint:"One minute: what changes at 100×, and what happens if the job crashes halfway."}
];

export const DIMENSIONS = ["Product scope","Scale","Data semantics","System guarantees","Constraints & priorities"];

export const PHASES = [
{label:"Requirements",minutes:5},{label:"Estimation & API",minutes:5},{label:"High-level design",minutes:10},{label:"Deep dives",minutes:15},{label:"Bottlenecks & recap",minutes:5}
];

// Canned responses used when live generation is switched off.
export const MOCK = {
  sevenCase: {system:"Ticketmaster",brief:"Design the seat-reservation and purchase flow for a ticketing platform. Events go on sale at a fixed time; a popular show sells out in minutes. Users browse a seat map, hold a seat, then pay.",sections:["databases","distributed","reliability","ambiguity"],invariant:"One seat can never have two confirmed owners."},
  sevenGrade: {overall:2,categories:[
    {key:"happy",score:2,model:"User loads the seat map (read from a cache refreshed on every hold/release). User taps a seat → POST /holds creates a short-lived reservation row with a conditional write on (event, seat) = free. Payment is created with an idempotency key. On success the hold converts to a confirmed ticket in one transaction and the seat map cache is invalidated."},
    {key:"alternate",score:2,model:"Hold expires unpaid → seat released by a sweeper. User pays from a second device. Promoter releases a held block. Group purchase of adjacent seats as one atomic hold."},
    {key:"edge",score:1,model:"Event cancelled during checkout. Seat map updated by the venue after sale opens. User with an expired hold still on the payment page. Zero-price tickets skipping payment."},
    {key:"concurrency",score:3,model:"Two users hold the same seat in the same millisecond. The invariant is one owner per seat; enforce it with a unique constraint or conditional write at the database, never in application logic. Payment double-click is absorbed by the idempotency key."},
    {key:"scale",score:2,model:"Millions arrive at 10:00:00 for one event — a single hot partition. Put a virtual waiting room in front, admit users in batches, serve the seat map from a cache, and keep the write path (holds) on a small, strongly consistent store."},
    {key:"failure",score:2,model:"Payment provider confirms the charge but our service times out before recording it. Reconcile with the provider's webhook and records; a hold that expires after a successful charge must trigger a refund or a late confirm — never silently drop it."},
    {key:"abuse",score:1,model:"Bots buying inventory: rate limit per account and device, CAPTCHA on hold, cap holds per user, detect scripted seat-map polling. Never expose an endpoint that reveals inventory faster than the UI does."}
  ]},
  mc: {system:"WhatsApp-style messaging",scenario:"You are designing one-to-one and group messaging with offline delivery and read receipts for 500 million daily users.",sections:["queues","patterns","distributed"],questions:[
    {q:"Which transport should carry real-time messages to a connected phone?",options:["Plain HTTP polling every second","A persistent WebSocket per device","gRPC unary calls","Server-Sent Events only"],answer:1,why:"Chat needs low-latency delivery in both directions; a persistent WebSocket avoids a handshake per message and lets the server push."},
    {q:"How do you guarantee messages within one conversation appear in the same order on every device?",options:["Rely on wall-clock timestamps","A per-conversation sequence number assigned by the server","Sort by message ID on the client","Deliver over a single global queue"],answer:1,why:"Clock skew makes timestamps unreliable; a per-conversation sequencer gives a total order for exactly the scope that needs it without a global bottleneck."},
    {q:"A message is stored and the ack is lost; the sender retries. What prevents a duplicate?",options:["A client-generated message ID the server deduplicates on","Rejecting all retries","A shorter timeout","A stronger isolation level"],answer:0,why:"Lost responses are a normal outcome; an idempotent write keyed on a client ID makes the retry safe."},
    {q:"Which store fits the per-user message inbox with high write volume and range reads by time?",options:["A single relational table with joins","A wide-column store partitioned by user, sorted by sequence","A graph database","An inverted index"],answer:1,why:"Partition-by-user, sort-by-time is the textbook wide-column access pattern and scales writes horizontally."},
    {q:"A group has 50,000 members. What is the main design concern?",options:["TLS overhead","Fan-out cost on every message","Choosing REST vs GraphQL","Database normalisation"],answer:1,why:"Each message becomes 50,000 deliveries; you need asynchronous fan-out and probably a pull model for very large groups."}
  ]},
  mock: {system:"Uber-style ride matching",brief:"Design location tracking and rider–driver matching for a ride-hailing app in 50 cities. Drivers report location every 4 seconds; riders request a car and expect a match in under 10 seconds.",sections:["patterns","scaling","databases","framework"]},
  mockModel:[
    {phase:"Requirements",text:"Users: riders and drivers. Core: driver location updates, nearby-driver search, match a rider to exactly one driver. Out of scope: payments, pricing, ratings. Strong consistency on assignment; eventual on displayed locations."},
    {phase:"Estimation & API",text:"1M active drivers / 4 s ≈ 250k location writes per second — in-memory only. Requests ~5k/s. POST /drivers/{id}/location · POST /rides (idempotent) · GET /rides/{id}."},
    {phase:"High-level design",text:"Gateway → location service writing to an in-memory geo index partitioned by city and geohash cell → matching service querying nearby cells → ride store (relational, source of truth for assignments) → notification via WebSocket to the driver app."},
    {phase:"Deep dives",text:"(1) Geo index: geohash prefix as partition key, hot-cell splitting downtown. (2) Assignment contention: conditional write driver.status = available → assigned; a driver offered two rides accepts at most one. (3) Driver's phone goes offline mid-offer: offer has a lease; expiry re-offers to the next driver."},
    {phase:"Bottlenecks & recap",text:"Hot cells during events, partition rebalancing when a city grows, matching service as a single point → run per-city shards active-active. Recap: in-memory for location, strongly consistent store for the one invariant that matters."}
  ],
  ambiguity:{system:"YouTube",brief:"Design YouTube.",sections:["ambiguity","patterns","estimation"]},
  product:{system:"Meetup Service",brief:"Develop a system for a company's employees to make friends with other employees. Users 'match' with someone new every few weeks. Focus on database design, the matching algorithm, the APIs and the interface; gloss over scalability.",sections:["framework","databases","apis"],invariant:"Nobody is matched with the same person twice within a long window, and each round gives a person at most one match."},
  productGrade:{categories:[
    {key:"scope",score:2,model:"Users are employees who opt in via SSO. Core flows: profile and preferences; a match every two weeks; mark met or skipped. Out of scope: chat, calendar booking. Invariants: no repeat within N rounds, no match for opted-out or paused users, one match per person per round. Scale: ~10k users, one round per fortnight — trivial, and worth saying so.",note:"State the invariants explicitly; they drive the schema."},
    {key:"data",score:2,model:"users from the directory; profiles (interests, office, timezone, team, opted_in, paused_until); rounds; matches (round_id, user_a, user_b, status, feedback) with UNIQUE(round_id, user_a) and UNIQUE(round_id, user_b); match_history keyed on (user_lo, user_hi) so a pair is one row and the repeat check is one indexed read.",note:"The pair-ordering trick is what makes 'no repeats' cheap."},
    {key:"algorithm",score:2,model:"A scheduled job runs each round over eligible users. Score pairs: shared interests +, compatible timezone +, different team +, same manager −, history within N rounds = excluded. Greedy pairing over pairs sorted by score; name maximum-weight matching as the optimal upgrade. Odd count → a trio or carry over with a priority boost so nobody is skipped twice.",note:"Name the simple algorithm and the better one, then pick."},
    {key:"api",score:2,model:"GET/PUT /v1/me/profile · POST /v1/me/opt-in · POST /v1/me/pause · GET /v1/me/matches?cursor · POST /v1/matches/{id}/status {met|skipped, feedback} · admin: POST /v1/rounds, GET /v1/rounds/{id}. SSO auth; users only read their own matches.",note:"Keep it to the endpoints the three screens need."},
    {key:"ui",score:1,model:"Onboarding (opt in, interests, meeting preference, pause). The match card: who, why you were matched — the shared interests — a one-tap 'suggest a time', Met / Skip. History with a one-line note per match. The 'why' is the feature that gets people to actually meet.",note:"Show the reason for the match; it's the whole product."},
    {key:"scale",score:2,model:"One job on one database at this size. At a million users across companies, partition by company and run rounds in parallel — matching never crosses that boundary. The job is idempotent on round_id, so a crash mid-round is safe to rerun.",note:"One minute, then stop."}
  ]},
  ambiguityGrade:{score:3,covered:["Product scope","Scale"],missed:["Data semantics","System guarantees","Constraints & priorities"],model:[
    {q:"Should I focus on upload, processing and playback, or also search, recommendations, comments and live streaming?",dim:"Product scope"},
    {q:"What scale should I assume — daily viewers, uploads per second, average video size, global or single region?",dim:"Scale"},
    {q:"Can videos be edited or deleted after publishing, and how long must originals be retained?",dim:"Data semantics"},
    {q:"Is it acceptable for a new upload to take minutes to appear? Do view counts need to be exact?",dim:"System guarantees"},
    {q:"Are we optimising for playback latency, storage cost or time-to-publish, and which part should I go deepest on?",dim:"Constraints & priorities"}
  ]}
};
