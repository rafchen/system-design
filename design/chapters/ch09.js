const D = (name, o) => ["dec", { name, ...o }];
export default {id:"observability",num:"09",title:"Observability and production operations",example:"a ride-hailing dispatch service",
tagline:"Metrics detect, traces localise, logs explain. Each signal and each SRE practice as a decision: when to use it, when not, what it costs.",
terms:["Metrics vs traces vs logs","Request ID","SLI / SLO / SLA","Error budget","Golden signals","Burn rate","Postmortem"],
objectives:["Pick the signal by the question it answers during an incident","Propagate a request id across services and queues","Define an SLI, set an SLO, derive the error budget and use it to make decisions","Alert on symptoms at two burn rates and not on causes","Close a deep dive with how you'd know it broke"],
sections:[
{id:"signals",title:"Which signal for which question",blocks:[
["p","A rider waits eleven seconds at 3 a.m. Which of four services was slow, for whom, since when? Design in the ability to answer before you need it."],
D("Metrics",{say:"Dispatch p99, error rate, saturation and request rate are metrics — cheap aggregates that detect the problem and drive alerts.",
use:["Detection and alerting; dashboards; anything you graph over time"],
avoid:["Per-request detail; high-cardinality tags (a metric per user is a database, not a metric)"],
consider:["Tag with service, region, status — few, low-cardinality dimensions","Tells you pricing's p99 jumped at 03:10; can't tell you which requests"]}),
D("Distributed traces",{say:"Every hop carries the trace id — including queue message headers — and we sample 5% plus all errors, so the trace for r-8813 shows 1,840 ms in pricing and 40 ms everywhere else.",
use:["Any system with more than two services or a queue in the request path","Localising latency"],
avoid:["A monolith — a profiler does it","100% sampling — costs more than the system"],
consider:["Head-based sampling for volume; tail-based to keep every slow/error trace","Propagation through queues is the step everyone forgets"],
fails:"One service drops the header → the trace ends there and the problem is invisible."}),
D("Structured logs",{say:"Logs are JSON with the request id, sampled for routine requests and kept for every error — they explain what a metric detected and a trace localised.",
use:["Incident investigation; audit trails (separate stream, longer retention)"],
avoid:["Free-text logs you can only grep","Logging every request at full volume — expensive; sample"],
consider:["Correlation: X-Request-Id from the edge through every service and message"]}),
["ex","Edge      X-Request-Id: r-8813\nDispatch  {req: r-8813, svc: dispatch}\nPricing   {req: r-8813, svc: pricing, dur_ms: 1840}\nQueue msg headers carry req\nNotifier  {req: r-8813, svc: notifier}\nOne search on r-8813 reconstructs the story."],
["t","Only logs: you learn about problems from users. Only metrics: you know something's wrong, not where. All three, and accept traces are sampled and logs cost."]
]},
{id:"slo",title:"SLIs, SLOs, SLAs and the error budget",blocks:[
["ex","SLI  fraction of dispatch requests completing under 2 s\nSLO  99.5% over 30 days\nSLA  99% to enterprise customers, with credits (looser than the SLO)\nBudget 0.5% ≈ 3.6 h of failing requests per 30 days"],
D("Setting the SLO",{say:"99.5% under two seconds — the level a rider can perceive. Not 99.99%: their phone network isn't there, and each nine costs ten times more.",
use:["One or two user-facing SLIs per service"],
avoid:["Targets set by what impresses engineers rather than what users feel","Internal SLO looser than the external SLA"],
consider:["Latency at a percentile, success rate, freshness","Measure at the edge, where the user is"]}),
D("Spending the error budget",{say:"Budget remaining → ship the risky migration this week. Budget exhausted → launches freeze until reliability recovers. Product and engineering agreed to the number in advance, so 3 a.m. is about what to do, not whether it matters.",
use:["Every reliability-vs-velocity decision"],
consider:["Outages and risky deploys spend the same budget","Publish budget remaining on the dashboard"]}),
["tbl",{cols:["Nines","Downtime / year","Downtime / month"],rows:[["99%","3.65 days","7.3 h"],["99.9%","8.8 h","44 min"],["99.99%","53 min","4.4 min"],["99.999%","5.3 min","26 s"]]}]
]},
{id:"alerting",title:"Golden signals and alerting that gets read",blocks:[
["tbl",{cols:["Signal","Measure","Use"],rows:[["Latency","p99, split by success/failure","A fast error isn't good latency"],["Traffic","rps, rides/min","Context for everything else"],["Errors","5xx, wrong 200s, over-SLO responses","The symptom users feel"],["Saturation","CPU, memory, pool, queue depth","Predicts the other three"]]}],
D("Page on symptoms at two burn rates",{say:"A fast-burn page: the budget will be gone in hours. A slow-burn ticket: gone in weeks. Cause-level alerts (CPU 90%) go to dashboards, never pagers.",
use:["Every service with an SLO"],
avoid:["Paging on causes — on-call learns to silence the pager within a month","Only slow-burn — a sharp outage goes unnoticed for an hour"],
consider:["Review every page: was it actionable? If not, delete it","Dashboard answers 'us or a dependency?' in ten seconds: four signals, SLO, budget, dependencies below"]})
]},
{id:"operations",title:"Capacity, incidents, postmortems",blocks:[
D("Capacity planning",{say:"New Year's Eve is 6× a normal Friday for dispatch; we provision ahead with headroom for losing a zone, and the saturation signal tells us when the forecast was wrong.",
use:["Growth forecasts, launches, seasonal peaks; anything with weeks of lead time"],
consider:["Load tests validate the projection","Headroom = peak + loss of largest failure domain"]}),
D("Incident response",{say:"One incident commander decides; others investigate and communicate; mitigate first (roll back, fail over, shed), root-cause second; timeline kept as it happens.",
use:["Every page"],
avoid:["Heroics without roles; root-causing while users are down"]}),
D("Blameless postmortem",{say:"What happened minute by minute, impact in user terms, why the system allowed it, what changes — with owners and dates. Never who. An incident without a postmortem is one we've agreed to repeat.",
use:["Every incident that touched the budget"],
avoid:["Postmortems with no action items — a well-documented history of the same incidents"]}),
["ex","Closing a deep dive\n\"We trace every dispatch request end to end, page on a fast burn of\nthe 2-second SLI, watch saturation on the location index — it fails\nfirst under load — and plan New Year's Eve at 6× a normal Friday.\""]
]}
]};
