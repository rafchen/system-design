// Decision layer: tables ("tbl") and decision cards ("card") prepended to every chapter as its first section.
const T = (rows) => ["tbl", { cols: ["Choice", "Use when", "Main tradeoff"], rows }];
const C = (name, problem, use, avoid, alt, tradeoff, fails, scale, real, justify) => ["card", { name, problem, use, avoid, alt, tradeoff, fails, scale, real, justify }];

export const DECISIONS = {
boundaries: [
["p","A split always costs the same four things. Against that, name the one benefit you are buying."],
T([["Monolith","Small team, early product, one transaction boundary","Simple and fast to build, but one deploy unit and one blast radius"],["Modular monolith","Want boundaries without the network","Most of the org benefit, none of the distributed-data cost"],["Microservices","Independent deploy/scale/compliance boundary needed","Independent, but network failures, distributed data, ops overhead"],["Synchronous call","Caller needs the answer to proceed","Simple, but couples availability and latency"],["Event / async","Caller only needs 'accepted'","Decoupled and burst-tolerant, but eventual and harder to debug"]]),
],
realtime: [
["p","Two questions decide it: who needs to initiate, and how often? If only the server sends, you do not need a two-way connection."],
T([["WebSockets","Both sides send frequent real-time updates","True bidirectional, but connections are stateful and must be managed"],["SSE","Server sends one-way updates","Simpler than WebSockets, but not bidirectional"],["Long polling","Compatibility or fallback is required","Works everywhere, but inefficient"]]),
],
network: [
["p","Below the application, one question settles the transport: if this data arrives late, is it still worth having?"],
T([["TCP","Data must arrive complete and in order","Reliable, but handshake latency and head-of-line blocking"],["UDP","Late data is worthless (voice, video, DNS)","No waiting, but no delivery guarantee"]]),
],
apis: [
["p","Two decisions dominate this chapter: how the contract behaves under retry, and where the service boundary sits. Both are one-way doors."],
T([["Offset pagination","Humans clicking page numbers on small tables","Simple, but slow deep in the table and drifts under inserts"],["Cursor pagination","Machines walking feeds, logs, exports","Stable and O(1) per page, but no jump-to-page"],["Idempotency key","Any POST that creates or charges and might be retried","Safe retries, but needs a key store with a TTL and atomic insert"],["Path versioning /v1/","Breaking changes with a deprecation window","Clear, but two versions to run"],["Monolith","Small team, early product, one transaction boundary","Simple and fast to build, but one deploy unit and one blast radius"],["Modular monolith","Want boundaries without the network","Most of the org benefit, none of the distributed-data cost"],["Microservices","Independent deploy/scale/compliance boundary needed","Independent, but network failures, distributed data, ops overhead"],["Synchronous call","Caller needs the answer to proceed","Simple, but couples availability and latency"],["Event / async","Caller only needs 'accepted'","Decoupled and burst-tolerant, but eventual and harder to debug"]]),
],
scaling: [
["p","Scaling questions are really 'where does state live and what happens when a node vanishes'. The tables settle the first; the cards handle the second."],
T([["Vertical scaling","Early-stage or moderate load","Simple, but hardware ceiling and one point of failure"],["Horizontal scaling","Load exceeds one machine or HA is needed","Scalable, but state must be shared and coordinated"],["Stateless servers","Any request can go to any server","Trivial scaling, but state lives in a store"],["Sticky sessions","Connection or session state must stay on one machine","Convenient, but imbalance and failover loss"],["L4 balancer","Raw TCP, databases, non-HTTP","Fast, but blind to content"],["L7 balancer","Route by path/header, per-endpoint limits, retries","Smart, but CPU per request and protocol-aware"],["Round robin","Uniform requests","Even, but ignores load"],["Least connections","Requests vary in duration","Adapts, but needs state per backend"],["Consistent hashing","Nodes join/leave; cache or shard locality","Minimal key movement, but skew unless virtual nodes"],["Active-passive","Simple failover for stateful systems","Cheap to reason about, but idle standby and failover risk"],["Active-active","Every replica serves; failure = less capacity","Proven daily, but writes need reconciliation"],["Multi-region","Global latency or regional DR","Fast/robust, but doubles cost and hardens consistency"],["Autoscaling","Predictable daily curves","Saves capacity, but minutes to react — useless for spikes"]]),
],
stores: [
["p","Choose the store from the access pattern, the consistency the operation needs and the axis the data grows along — never from the word 'scale'."],
T([["Relational SQL","Changes that must succeed or fail together, rules the database enforces, and joins (Chapter 08)","Strong guarantees, but horizontal partitioning is harder"],["Key-value","Lookup by key at huge scale","Fast and partitionable, but no queries beyond the key"],["Document","Flexible objects, evolving schemas, read whole","Convenient, but weak relationships and constraints"],["Wide-column","Massive write volume, partition-then-range reads","Highly scalable, but queries must match the data model"],["Graph","Relationships and traversals are the query","Great traversals, but poor general storage"],["Search engine","Full-text and ranking","Fast search, but never the source of truth"],["Time-series","Timestamped metrics and events","Efficient time queries, but specialised"],["Object storage","Large files, images, video","Cheap and durable, but not for record updates"]]),
],
replication: [
["p","Replication copies data; sharding divides it. Replication buys availability and read capacity; sharding buys write capacity and storage. They answer different problems and are often needed together."],
T([["Replication","Need availability or more read capacity","Copies data but does not grow total capacity"],["Read replicas","Read traffic dominates","Reads scale, but replicas lag"],["Multi-region replication","Global latency and DR matter","Available, but conflict resolution"]]),
],
partitioning: [
["p","Once the data or the write rate exceeds one machine, the only question left is which key to split on — and which query that makes expensive."],
T([["Sharding","One machine cannot hold the data or the write load","Scales capacity, but cross-shard queries and transactions get hard"],["Hash partitioning","Even distribution wanted","Range scans become scatter-gather"],["Range partitioning","Range queries common","Sequential or popular ranges go hot"],["Geographic partitioning","Traffic is region-local (data residency)","Cross-region users and moves are hard"]]),
],
distributed: [
["p","Consistency is a per-operation choice. Name the weakest model each operation tolerates, then the mechanism that provides it."],
T([["Strong consistency / linearizable","Stale or wrong data is unacceptable","Correct reads, but higher latency, lower availability"],["Eventual consistency","Temporary staleness is fine","Available and scalable, but clients see stale data"],["Read-your-writes","Users must see their own change immediately","Better UX, but routing or version tracking"],["Causal consistency","Related operations must appear in order","More intuitive than eventual, but more metadata"],["Transactions (local)","Changes in one database must succeed together","Strong invariants, but bounded to one DB"],["Two-phase commit","Multiple participants need atomicity","Atomic, but blocking and coordinator-dependent"],["Saga","Long-running cross-service workflow","Scalable, but compensation logic and visible intermediate states"],["Transactional outbox","DB write and event publish must agree","Reliable, but a relay process and at-least-once"],["Change data capture","Other systems need every DB change","Decoupled, but couples consumers to schema"],["Event sourcing","Full history is the source of truth","Audit and replay, but much more complex"]]),
["ex","Bank balance → strong. Like count → eventual. Profile edit → read-your-writes. Seat reservation → transactional / conditional write."],
],
caching: [
["p","A cache is a bet that the answer hasn't changed. Choose the pattern by how wrong you can afford to be and for how long."],
T([["Cache-aside","General read-heavy data","Simple; misses and staleness handled in code"],["Read-through","Cache should load missing data itself","Cleaner callers, but tighter cache integration"],["Write-through","Cache must stay in sync with storage","Always warm, but slower writes"],["Write-behind","Very high write throughput","Fast writes, but loss if the cache dies pre-flush"],["CDN","Static or media content read globally","Low global latency, but purge is slow and coarse"],["Local (in-process) cache","Microsecond latency needed","Fastest, but every server can hold a different value"],["TTL only","Nobody edits urgently","Simplest, stale up to TTL"],["Delete on write","Writes go through known paths","Precise, but one forgotten path leaks stale data"],["Event-driven invalidation","Writes from many places","Robust, but milliseconds of lag"]]),
["ex","For every cache: key? stored what? TTL? invalidated how? unavailable → then what? stale OK?"],
],
queues: [
["p","Pick the shape of asynchrony from three questions: does the caller need the answer now, how many consumers, and does history matter?"],
T([["Synchronous call","Caller needs the result to proceed","Simple, but couples availability and latency"],["Task queue","Work can finish later, one consumer","Absorbs spikes, but results are asynchronous"],["Pub/sub","Multiple consumers react to one event","Decoupled, but delivery and debugging get harder"],["Event stream (Kafka)","Events need retention, ordering, replay, many independent readers","Powerful, but operationally heavy and eventual"],["At-most-once","Losing beats duplicating (metrics samples)","Some messages vanish"],["At-least-once","Must eventually be processed","Consumers must handle duplicates"],["Effectively once","Duplicates must not change the result","Idempotency + dedup required"]]),
],
reliability: [
["p","Each pattern protects a different party: the caller, the callee or the user. A complete design uses one of each."],
T([["Timeout","A dependency might hang","No indefinite waits, but may abandon work that would have succeeded"],["Retry","Failure is temporary and the operation is safe","Higher success rate, but amplifies overload"],["Exponential backoff + jitter","Retries could overwhelm a dependency","Fewer retry storms, but slower recovery"],["Retry budget","Partial outage must not become total","Caps amplification, but some users see fast failures"],["Circuit breaker","A failing dependency should be avoided for a while","Prevents cascades, but rejects some requests that would succeed"],["Bulkhead","One workload must not starve the others","Isolation, but capacity may sit idle"],["Load shedding","System is over capacity","Protects critical traffic by rejecting low-priority work"],["Graceful degradation","Partial is better than nothing","Availability, but reduced experience"],["Dead-letter queue","Some messages fail every time","Preserves them for inspection, but needs reprocessing"]]),
],
observability: [
["p","Choose the signal by the question it answers: metrics detect, traces localise, logs explain."],
T([["Metrics","Detect and alert on symptoms","Cheap and fast, but no per-request detail"],["Traces","Find which hop is slow","Pinpoints, but sampled and needs propagation"],["Structured logs","Explain one request in an incident","Rich, but expensive at volume"],["SLO burn-rate alerts","Page on what users feel","Actionable, but needs SLIs defined first"],["Cause-level alerts (CPU, disk)","Explain during an incident","Useful context, but noisy if they page"]]),
["ex","SLI = what you measure. SLO = the target. SLA = the contract. Error budget = 100% − SLO — spend it on launches or on outages, not both."],
],
security: [
["p","Decide where identity is checked, where permission is checked, and how tenants are kept apart — those three decisions shape the data model."],
T([["Server-side sessions","Instant revocation needed; single app","Revoke instantly, but a lookup per request"],["Short JWT + refresh token","Many services must verify without a lookup","Stateless and fast, but no revocation until expiry"],["OAuth 2.0 / OIDC","Delegated access; enterprise SSO","Standard, but complex flows"],["RBAC","Few roles cover the needs","Simple to audit, but over-grants"],["ABAC","Rules like 'owner or shared-with'","Precise, but harder to reason about"],["Shared tables + tenant_id","Many small tenants","Cheap, but one missed WHERE leaks"],["Row-level security","Isolation enforced by the DB","Robust, but DB-specific"],["Database per tenant","Few large or regulated tenants","Strongest, but cost per tenant"],["Rate limiting","Any public endpoint","Stops abuse and bugs, but tuning and 429 handling"]]),
],
patterns: [
["p","Product patterns are fundamentals in costume. Each table names the costume and the fundamental underneath."],
["h","Feed generation"],
T([["Fan-out on write","Most users follow a manageable number of accounts","Fast reads, but expensive writes"],["Fan-out on read","Accounts with enormous follower counts","Cheap writes, but slow reads"],["Hybrid fan-out","Normal and celebrity accounts coexist","Handles both, but more logic"]]),
["h","Media delivery"],
T([["Database storage","Tiny, transactional files only","Convenient, but expensive and unscalable"],["Object storage","Images, video, large files","Cheap and durable, but metadata lives elsewhere"],["CDN","Media read globally","Fast, but purge and egress cost"],["Direct (presigned) upload","Large files should bypass app servers","Scales, but signed URLs and validation"],["Async transcoding","Multiple formats needed","Fast upload, but eventual availability"]]),
["h","Counters and analytics"],
T([["Exact counter row","Billing, inventory","Correct, but the hottest row in the DB"],["Sharded / buffered counter","High-rate displayed counts","Cheap, but approximate for seconds"],["HyperLogLog / sketches","Distinct counts, frequencies at scale","Kilobytes, but ~1% error"],["Stream processing","Results in seconds","Fast, but approximate/complex"],["Batch processing","Exact, complete results","Correct, but hours late"]]),
],
estimation: [
["p","Estimates exist to choose between designs. Each row is a threshold where the design changes."],
["tbl",{cols:["Estimate","Below → design","Above → design"],rows:[["Writes per second","< ~5k: one leader + replicas","> ~10k: partition by dominant key"],["Reads per second","< ~10k: DB + replicas","> ~50k: cache tier + CDN mandatory"],["Read/write ratio","< 10:1: optimise writes, batch","> 100:1: caches carry the product"],["Object size","< 100 KB: database","> 1 MB: object storage + CDN"],["Storage per year","< 10 TB: single store","> 1 PB: tiering, expiry, cost is a design input"],["Egress","< 1 GB/s: origin can serve","> 10 GB/s: CDN, no origin serves this"],["Working set","fits RAM of one node: local cache","> 100 GB: distributed cache, partitioned"]]}]
],
framework: [
["p","The framework is a time-allocation decision. Choose the split by the question's shape."],
["tbl",{cols:["Question shape","Spend time on","Spend little on"],rows:[["Scale-shaped (Twitter, YouTube)","Fan-out, partitioning, caching, failure deep dives","UI, algorithm detail"],["Product-shaped (meetup matcher, approvals)","Data model, algorithm, API, interface","Infrastructure; one-minute scale nod"],["Infra-shaped (rate limiter, KV store, queue)","Algorithm, consistency, failure semantics","Product scope, UI"],["Ambiguous ('design X')","Five dimensions, then whichever shape emerges","Drawing before scoping"]]}]
],
ambiguity: [
["p","Ask only questions whose answers change the architecture. This table is the test."],
["tbl",{cols:["Question","Changes","If unanswered, assume"],rows:[["Who is the primary user?","Which flows are core; auth model","Consumer, mobile-first"],["Read- or write-heavy?","Caches vs partitioning","Read-heavy, 100:1"],["What consistency for the critical op?","Store choice, sync vs async","Strong for money/inventory, eventual otherwise"],["Scale in DAU and objects?","Whether to shard at all","10 M DAU; state the 10× breakpoint"],["Can data be edited/deleted? Retained how long?","Immutability, expiry, storage tiering","Editable, retained indefinitely"],["Single region or global?","Multi-region, conflict resolution","Single region with CDN"],["Which part should I go deepest on?","Where the 15 deep-dive minutes go","The contention or fan-out point"]]}]
],
plan: [
["p","Pick practice systems by the shape you need to train, not by fame."],
["tbl",{cols:["Shape","Practice systems","Chapters"],rows:[["Contention","Ticketmaster, inventory, ride assignment","08, 16"],["Fan-out","Twitter feed, group chat, notifications","17, 22"],["Large objects","YouTube, Dropbox, Pastebin","06, 22"],["Ordering","WhatsApp, ledgers, logs","16, 17"],["Search","Autocomplete, Google Search","22"],["Async processing","Video pipeline, job scheduler, crawler","17, 18"],["Product-shaped","Meetup matcher, approvals, desk booking","23 §7"]]}]
]
};
