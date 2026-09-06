const D = (name, o) => ["dec", { name, ...o }];
export default {id:"reliability",num:"08",title:"Reliability and handling failure",example:"a checkout service on Black Friday",
tagline:"Every network call has four outcomes. Each reliability pattern as a decision: what it protects, when to use it, when not, what it costs, how it goes wrong.",
terms:["Four outcomes","Timeout","Backoff + jitter","Retry budget","Circuit breaker","Bulkhead","Load shedding","Degradation","RPO / RTO"],
objectives:["State the four outcomes and what the caller does in each","Write a retry policy with backoff, jitter, budget and idempotency","Place breakers, bulkheads and shedding in a request path and say whom each protects","Explain how a cascade starts and three ways to stop it","Set RPO/RTO per component and choose backup, replication or multi-zone from them"],
sections:[
{id:"four-outcomes",title:"The four outcomes of every call",blocks:[
["ex","1 Succeeds, response arrives      — happy path\n2 Fails, error arrives            — recoverable, you know\n3 Succeeds, response lost         — the card WAS charged; you got a timeout\n4 Still running when you give up  — may succeed a second later, or not"],
D("Designing for outcome 3",{say:"For every arrow in the diagram: if the response is lost, the caller retries with the same idempotency key, and a nightly reconciliation catches anything the retry didn't.",
use:["Every network call, especially anything with money or inventory"],
avoid:["Assuming calls succeed or fail cleanly — it's true in dev and false at scale a thousand times a day"],
consider:["Idempotency keys (Ch. 02) make the retry safe","Reconciliation against the provider's records catches the rest","The interviewer will ask 'and if that times out?' for every arrow — have the answer"],
cases:["Capture succeeded at the provider, we timed out → retry same key → provider returns the same result","Order written, event publish lost → outbox (Ch. 05)"]})
]},
{id:"timeouts-retries",title:"Timeouts, retries, backoff, jitter, budgets",blocks:[
D("Timeouts",{say:"Every outbound call has a timeout set from the dependency's p99 plus margin, per operation: 150 ms for fraud, 5 s for card capture. No global value.",
use:["Every call — a dependency without a timeout holds a thread until the user gives up"],
avoid:["One global timeout — wrong for both fast and slow dependencies"],
consider:["Aggressive: protects the caller, increases duplicate work. Generous: protects the callee, lets latency pile up","Propagate deadlines downstream"]}),
D("Retries with exponential backoff and jitter",{say:"3 attempts, 200 ms base doubling to a 2 s cap, full jitter, only on timeouts and 503s, only with an idempotency key, capped at 10% of traffic by a retry budget.",
use:["Transient failures on idempotent (or keyed) operations"],
avoid:["4xx errors, declined cards — a retry can't fix them","Non-idempotent operations without a key","Dependencies that are overloaded — retries make it worse"],
consider:["Backoff spreads retries; jitter breaks the synchronised waves a thousand clients would otherwise produce","Retry budget: retries ≤ ~10% of first attempts; when spent, fail fast","Retry at one layer only — nested retries multiply (3 × 3 × 3 = 27 attempts)"],
fails:"A dependency fails half its calls; every client retries 3× → its load triples at the moment it can least absorb it. Without jitter, retry storms arrive in waves.",
cases:["Payment capture: retry with key","Fraud score: no retry, use fallback — latency matters more","Email send: retry asynchronously from a queue, not inline"]}),
["ex","Payment capture retry policy\nattempts 3 · base 200 ms · ×2 · cap 2 s · full jitter\nretry on: timeout, connection reset, 503\nnever on: 4xx, declined\nrequires: Idempotency-Key\nbudget:   10% of first attempts"],
["t","Retries improve success under blips and worsen outages that are load-related. The budget is what lets you have the first without the second."]
]},
{id:"isolation",title:"Circuit breakers, bulkheads, load shedding, degradation",blocks:[
D("Circuit breaker",{say:"Recommendations get a breaker: after 20 consecutive failures we stop calling for 30 s, serve the page without them, then probe with one request.",
use:["Synchronous dependencies that fail as a unit and have a fallback"],
avoid:["Dependencies without a sensible fallback — you'd just fail differently","Async paths — use a DLQ instead"],
consider:["Closed → open (threshold) → half-open (probe) → closed","Per dependency, per instance","Protects the caller's threads and gives the callee room to recover"],
fails:"Threshold too sensitive flaps; no half-open probe means it never recovers; breaker per host when the failure is per service."}),
D("Bulkhead",{say:"Each dependency gets its own connection pool and concurrency limit, so a slow recommendation service fills its own compartment and payments keeps flowing.",
use:["Any service with several dependencies sharing resources"],
avoid:["Nothing — but note capacity may sit idle in an unused compartment"],
consider:["Pools per dependency; concurrency limits per endpoint","Watertight compartments on a ship"]}),
D("Load shedding",{say:"At 90% saturation the gateway rejects analytics and recommendation refreshes with a cheap 503 + Retry-After; checkout is never shed. A rejected request costs microseconds; a timed-out one costs a thread for 30 s.",
use:["Every service — all of them can be overloaded; especially the edge"],
avoid:["Shedding after the expensive work is done","Shedding without priority — browse before checkout"],
consider:["Trigger on queue depth or latency, not CPU alone","Adaptive concurrency limits","Protects the callee; autoscaling is too slow to do this job"]}),
D("Graceful degradation",{say:"If tax is down we show an estimate with a note; if recommendations are down the row is absent; if payments is down we're down. Each dependency has a stated fallback: cached, default, or absent.",
use:["Every non-essential dependency"],
avoid:["Falling back silently on essential ones — a wrong tax total is worse than an error"],
consider:["Decide essential vs optional per feature, in advance","Protects the user"]}),
["t","Breakers and bulkheads protect the caller; shedding protects the callee; degradation protects the user. A complete design has all three and says which features may vanish under stress."]
]},
{id:"cascades",title:"Cascading failures",blocks:[
["ex","Black Friday 09:00\nOne server GC-pauses, fails health check, evicted.\n9 servers at 85% → 95%. Two slow, fail checks, evicted.\n7 servers > 100%. Ninety seconds later: all evicted, all restored,\nall evicted again. Checkout down. No hardware failed. No bug."],
D("Stopping a cascade",{say:"Shed load early, cap retries with a budget, run with headroom for losing the largest failure domain at peak, slow-start recovered servers, and make health checks tell 'busy' from 'dead'.",
use:["Design these in before the event, not during"],
consider:["Feeders: retries, load-based health-check eviction, cold caches, lagging autoscaling, synchronous chains without timeouts, full traffic to a cold instance","Manual brakes: pause balancer eviction, block the retrying client, turn off the optional feature"],
fails:"Every mechanism that helps in a small failure — retry, reroute, restart — amplifies a large one."}),
["t","The goal isn't to eliminate failure; it's to make the system fail in a bounded, recoverable way rather than a self-amplifying one."]
]},
{id:"recovery",title:"Redundancy, RPO/RTO, zones and backups",blocks:[
D("RPO and RTO per component",{say:"Orders DB: RPO 0 with a synchronous replica, RTO 60 s with automatic failover. Session cache: RPO infinite (users re-login), RTO 5 min. Analytics: RPO 24 h from nightly snapshot.",
use:["State them per system; they choose the redundancy strategy"],
avoid:["One number for the whole company"],
consider:["RPO → replication frequency / sync vs async","RTO → automated vs manual failover"]}),
D("Multi-zone by default, multi-region by exception",{say:"Every stateless tier runs across two zones; the DB has a sync replica in another zone. Multi-region only if the business can't survive a regional outage — it's a large step in cost and consistency complexity.",
use:["Multi-zone: always","Multi-region: global latency or DR requirement, justified"],
consider:["Zones: independent power/network, close enough for sync replication","Regions: hundreds of miles, async only"]}),
D("Backups AND replication",{say:"Replication survives hardware failure instantly; it also replicates a bad DELETE perfectly. Backups survive corruption and mistakes slowly. We need both, and we restore from a backup monthly to prove it works.",
use:["Every primary datastore"],
avoid:["Treating replicas as backups"],
consider:["A standby never failed over to is a hope, not a plan","Walk the diagram: if this box dies, what happens? LB, leader, cache, broker, DNS, the cert expiring on Sunday"]}),
["t","Each nine costs roughly 10× the last. Spend redundancy on components whose failure stops revenue; write down lower targets, honestly, for the rest."]
]}
]};
