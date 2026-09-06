const D = (name, o) => ["dec", { name, ...o }];
export default {id:"replication",num:"14",part:"V · Growing",title:"Replication",example:"an e-commerce order system",
tagline:"Keeping more than one copy of the data. What copies buy, what they cost, and why a user can write something and then not see it.",
terms:["Leader","Follower","Replication lag","Synchronous vs asynchronous","Read-your-writes","Failover","Split brain","Quorum"],
objectives:["Say what replication buys and what it does not","Explain replication lag as a consequence rather than a fault","Route the one read that must see its own write","Name what failover can lose and why split brain happens"],
sections:[
{id:"replication",title:"Replication: leader-follower, multi-leader or leaderless",blocks:[
["p","The orders database now has followers. What did that buy, and what did it cost?"],
["p","It bought two things that get conflated constantly. Availability: if the leader dies, the data still exists somewhere. And read capacity: any follower can serve a read."],
["p","It did not buy write capacity. Every write still goes through one leader, and every follower then performs that same write itself. Replication copies data. It does not divide it, and no number of followers will make writes go faster."],
["p","The cost shows up immediately, and it is why this section exists. A customer places an order. The write goes to the leader. Their browser reloads the order list — which is a read, so it goes to a follower, which happens to be three hundred milliseconds behind. The order is not there. So they place it again."],
["p","Replication lag is not a malfunction. Asynchronous replication is lag, by definition. It is precisely what you traded away when you decided not to make every write wait for every follower."],
["p","The fix is not to make everything synchronous. It is to notice that this particular reader needs to see this particular write, and to route only that read differently. Send a user's reads to the leader for a few seconds after they write, or have them carry the log position of their write and wait for a follower to catch up to it. Everybody else can keep reading stale data from followers, because nobody else knows the order was placed."],
["p","That is the general shape of all consistency work, and Chapter 16 does it properly. The question is never is this system consistent. It is which reader needs to see which write, and by when."],
["p","One synchronous follower with the rest asynchronous is the usual compromise: no acknowledged write can be lost, and one slow follower cannot stall the leader."],
["p","And the failure worth naming out loud: if the leader dies and you promote a follower that was behind, the writes it never received are simply gone — acknowledged to customers, absent from the database. If the old leader then returns still believing it is the leader, you have two of them. That is split brain, and preventing it is what consensus is for, in the next chapter."],
D("One machine takes writes, copies serve reads",{say:"One copy kept perfectly in step for safety, and several kept slightly behind for reads. A customer's reads go to the primary for a few seconds after they write, so they always see their own order.",
use:["Almost every primary datastore. Reads scale out, a machine failure does not lose data, and there is exactly one place to reason about writes."],
avoid:["Cases where accepting writes during a network split matters more than being correct.","Cases where every region must accept writes locally."],
consider:["Copying asynchronously is fast, but copies lag, and a primary failure loses whatever had not been copied yet.","Copying synchronously loses nothing, but a slow copy slows every write. One synchronous copy plus several asynchronous ones is the usual compromise.","To let a user see their own writes, send their reads to the primary briefly, or have them carry a marker of their write and wait for a copy to catch up.","To stop a user seeing time run backwards, keep their session reading from the same copy."],
fails:"A failover promotes a copy that was behind, so writes already confirmed to customers are simply gone. If the old primary returns still believing it is in charge, you have two — which is why Chapter 16 exists.",
cases:["A customer places an order, refreshes, and the copy is three hundred milliseconds behind so the order is missing. They place it again."]}),
D("Several machines accept writes — and sometimes disagree",{say:"Each region accepts writes locally so writes are fast everywhere. I accept having to resolve conflicts for the catalogue, because two merchants rarely edit the same product and taking the later edit is acceptable there.",
use:["Several regions that all need fast local writes.","Clients that work offline, where each device is effectively accepting writes on its own."],
avoid:["Anything where a conflict costs money. Orders and balances need one place that decides."],
consider:["You must decide what happens when two writes conflict. Taking the later one silently discards the other. Merging them requires rules specific to the data. Some data types are designed to merge automatically without losing anything."]}),
D("No leader — write to several, read from several",{say:"With three copies, writing to two and reading from two guarantees any read overlaps any write, so we stay correct without a leader and keep accepting writes when one machine is down.",
use:["Systems that must keep accepting writes through failures. Cassandra and DynamoDB work this way."],
avoid:["Transactions, database-enforced rules, and secondary indexes with strong guarantees. These systems trade those away deliberately."],
consider:["The guarantee is that the number written plus the number read exceeds the total number of copies, which forces an overlap. Lower either and you gain speed and lose the guarantee.","Stale copies are repaired when a read notices the disagreement, and by background processes that compare copies."]}),
["t","Leader-follower: simple, one write point, followers lag. Multi-leader/leaderless: availability and locality, conflicts and repair are yours. Orders → one leader; a globally edited catalogue → maybe not."]
]}
]};
