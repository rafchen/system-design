const D = (name, o) => ["dec", { name, ...o }];
export default {id:"modelling",num:"07",part:"III · Storing data",title:"Data modelling and indexes",example:"an e-commerce order system",
tagline:"Deciding what a row actually is, which facts belong together, which are frozen copies rather than duplicates, and which questions deserve an index.",
terms:["Normalisation","Denormalisation","Frozen value","Primary key","Foreign key","Composite index","Covering index"],
objectives:["Separate facts that change from facts that were true at a moment","Explain why an order line stores its own price","Design an index from the query rather than the table","Say why column order in a composite index is not cosmetic"],
sections:[
{id:"schema-indexes",title:"Schema shape and indexes",blocks:[
["p","Here is one row from the order history, written out one fact per line: the customer's name, the customer's email, the product's name, the product's price, the quantity ordered, and the time the order was placed."],
["p","Six facts sitting side by side. They look like facts of the same kind because they are on the same line. They are not."],
["p","Ask which of them change if that customer orders that product again next year. The customer's name: no. Their email: possibly, and if it does change it should change everywhere at once. The product's name: possibly. The product's price: almost certainly."],
["p","Now the harder question. When the price changes, what should happen to last year's order?"],
["p","Nothing at all. The receipt has to keep saying what was actually paid. Which means the price on the order line and the price on the product are not the same fact — they were equal at one instant, and they were never the same thing."],
["p","That is why order_lines carries its own price_cents. It looks like duplication and it is not. Normalising says every fact should live in exactly one place; this is a different fact that happened to start life with the same value. Freezing it is not denormalisation for speed. It is denormalisation for truth."],
["p","Get this wrong and you produce one of the most quietly destructive bugs there is: changing a product's price silently rewrites every historical invoice, and nobody notices until an auditor does."],
D("One fact in one place — except when it is a different fact",{say:"Products are stored once, so changing a name changes it everywhere. But the order line keeps its own copy of the price, because a receipt must always say what was actually paid. That is a deliberate duplication for correctness, not for speed.",
use:["Store a fact once when it is genuinely one fact that changes over time.","Copy it when you are recording what was true at a moment, such as a price on a receipt."],
avoid:["Copying data for performance without writing down which copies now exist and what keeps them in step. That is how copies quietly diverge."],
consider:["Reporting systems copy aggressively on purpose. They are written once by a pipeline and read constantly, so duplication costs little and saves a great deal."]}),
["p","Indexes follow from queries, and the direction of that sentence matters. You do not index a table. You index a question."],
["p","The order-history page asks one: this customer's orders, newest first, twenty at a time. An index on customer_id alone will find the right rows and then have to sort them — every time, for every page. An index on customer_id and created_at together finds them already in order, so the database walks a contiguous run of entries and stops after twenty."],
["p","Column order inside a composite index is not cosmetic. An index on (customer_id, created_at) is useless for a query about created_at on its own, because the entries are sorted by customer first. A phone book sorted by surname is not much help for finding everyone whose first name is James."],
["p","And every index is paid for on every write. Indexing everything is not thoroughness — it is a permanent tax on inserts, collected in exchange for queries nobody runs."],
D("Indexes — build one per question, not per table",{say:"The order history page asks for one customer's orders, newest first. An index on customer and date together answers that by walking a contiguous stretch and stopping after twenty rows. I index what queries filter and sort on, and nothing else.",
use:["Every column your queries filter or sort by — and no others."],
avoid:["Indexing everything. Each index is paid for on every insert and update, forever, in exchange for queries that may never run.","Indexing a column with only a few possible values, or adding indexes to a write-heavy table that nobody reads."],
consider:["In a multi-column index, the order of the columns must match the query. An index on customer then date cannot help a query about dates alone, because the entries are sorted by customer first.","If the index contains every column the query needs, the database never reads the table at all. That is the fastest possible read and the most expensive write.","Even at a billion rows, reaching any single row is only a handful of reads. Depth is almost never the problem; the wrong index is."],
fails:"The column order does not match the query, so the index exists and is not used. Statistics go stale and the planner chooses a scan. Or one customer has a million orders while everyone else has ten, and the plan chosen for the average case is wrong for them.",
cases:["Adding a new filter to the API is an index review, not just a new WHERE clause."]}),
["ex","customers  (id, email UNIQUE, name)\nproducts   (id, sku UNIQUE, name, price_cents)\ninventory  (product_id → products, quantity CHECK (quantity >= 0))\norders     (id, customer_id → customers, status, created_at)\norder_lines(order_id, product_id, qty, price_cents)  -- price frozen\nINDEX orders (customer_id, created_at DESC)"]
]}
]};
