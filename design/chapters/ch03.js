const D = (name, o) => ["dec", { name, ...o }];
export default {id:"measuring",num:"03",part:"I · What you are being asked to do",title:"Measuring systems",example:"a URL shortener",
tagline:"The words used to say how well a system works — latency, throughput, availability, durability — each turned into a number with a consequence. Every later chapter is chosen against these.",
terms:["Latency","Throughput","Percentile","p50 / p99","Availability","Durability","Tail latency"],
objectives:["Say what a system must do in numbers rather than adjectives","Read a percentile and explain why the average is the wrong number","Explain why slow requests compound when one page waits on many services","Tell availability and durability apart, and say which a requirement means"],
sections:[
{id:"performance-vocabulary",title:"Performance vocabulary as requirements",blocks:[
["p","The examples below use a URL shortener: a service where somebody pastes a long link and gets a short code back, and anybody following that code is sent on to the original page. Two operations, nothing else. It is small enough that the numbers stay easy to follow, and it runs as the example through the next two chapters as well."],
["p","Every word in this section is one you have already heard. The purpose of the section is to stop using them as vocabulary and start using them as requirements, and a requirement is a number attached to a consequence."],
["h","The mean is the wrong number"],
["p","Measure your redirect endpoint for an hour and find an average response time of twelve milliseconds. That sounds healthy. It tells you almost nothing."],
["p","The average is dragged around by outliers and hides the shape of the distribution entirely. Worse, no user experiences the average. Users experience their own request, and the ones deciding whether to come back are the ones on the slow end of it."],
["p","So sort the responses and look at positions instead. The median, p50, is the request in the middle: half your users had a better time than that. The p99 is the request ninety-nine percent of the way up the sorted list: one request in a hundred was worse."],
["p","Set targets on those, and notice the uncomfortable part. The slow requests are rarely random. The account with the most links has the most rows to scan. The customer with the longest history has the largest response to assemble. Your p99 is disproportionately your best users, which is precisely the wrong group to be serving worst."],
["h","Tail latency amplifies"],
["p","Now the arithmetic that makes the tail worse than it first appears."],
["p","Suppose one page load makes fifty backend calls, and each backend has a perfectly respectable one-in-a-hundred chance of being slow. What fraction of page loads contain at least one slow call?"],
["p","Not one percent. It is one minus 0.99 to the fiftieth power — about forty percent."],
["p","Two page loads in five hit somebody\'s p99. This is why a product can feel sluggish while every individual service dashboard looks fine, and why the p99 of your slowest dependency quietly becomes the p50 of your product. It is also a concrete argument against fanning a request out to more services than it needs."],
["h","Availability and durability are different promises"],
["p","A shortener that accepts a link, returns a code, and then loses the row has been perfectly available and has failed completely."],
["p","Availability is whether the system answers. Durability is whether what it already told you stays true. They fail independently, they are bought with different mechanisms — redundancy for one, replication and a durable write for the other — and a requirement that does not say which it means is not yet a requirement."],
["tbl",{cols:["Term","State it as","Consequence for the shortener"],rows:[
["Latency","p99 redirect < 20 ms","Answers must come from copies kept near the reader, not from the database each time (Chapter 13)"],
["Throughput","50k redirects/s peak, 500 creates/s","Reads must spread across many machines; writes need not"],
["Availability","Redirects 99.99%, creates 99.9%","Read and write paths fail independently"],
["Durability","An issued code never changes or disappears","Ack after replication; codes immutable"],
["Scalability","10× traffic without redesign","Any machine must be able to serve any request (Chapter 12)"],
["Read/write ratio","100:1","Effort belongs in keeping answers close, not in splitting the data (Chapters 13 and 15)"],
["Percentiles","p50 5 ms, p99 20 ms","The slow requests come from missing copies and from pauses — measure those, not the mean"]]}],
D("Percentiles, not averages — measure the slow requests",{say:"I would set the target on the 99th percentile rather than the average, because a page that calls fifty services hits somebody's slowest case on roughly forty percent of loads.",
use:["Every latency requirement and every alert you write."],
avoid:["Quoting an average response time in an interview. It hides the shape of the distribution and describes nobody's actual experience."],
consider:["Sort every response by how long it took. The middle one is the median. The one ninety-nine percent of the way up is the 99th percentile, meaning one request in a hundred was worse than that.","With fifty backend calls each having a one-in-a-hundred chance of being slow, about forty percent of page loads contain at least one slow call. Slowness compounds whenever one page waits on many services at once.","The slow requests are rarely random. The user with the most data has the most to scan, so your worst experiences tend to belong to your most engaged users.","Common causes of a slow tail: a cache miss, a garbage collection pause, waiting on a lock, a connection being opened for the first time, or a slow disk.","Improving the average is easy. Improving the tail is the actual work."]}),
["t","Availability and durability are different promises: a shortener that acknowledges a link and then forgets it has failed durability while being perfectly available. Say which one each requirement is about."]
]}
]};
