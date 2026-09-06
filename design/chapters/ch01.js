const D = (name, o) => ["dec", { name, ...o }];
export default {id:"what",num:"01",title:"What system design is",example:"a university library",
tagline:"What the phrase actually means, what a design is made of, and why the answer is never a single right one. Assumes nothing.",
terms:["System","Client","Server","Request","State","Component","Tradeoff","Requirement"],
objectives:["Say what system design is, and how it differs from writing code","Name the five parts almost every system is built from","Explain why a design question has no single correct answer","Say a decision out loud in the form the rest of this book uses"],
sections:[
{id:"the-phrase",title:"What the phrase actually means",blocks:[
["p","A university library lends books. Somebody searches the catalogue, finds a book, and borrows it. A librarian adds new books and chases overdue ones. Around forty thousand students might use it."],
["p","Now imagine you have been asked to build that, and nobody has told you anything else."],
["p","The questions that arrive first are not about code. Where do the book records live, so that they survive the machine being switched off? What happens when two students try to borrow the last copy in the same second? If the library's network fails at midnight, does the whole thing stop, or does some of it keep working? When the university triples in size, what breaks first?"],
["p","Answering those questions is system design. Writing the function that saves a loan record is programming. Both matter, and they are not the same activity."],
["p","Here is the difference stated plainly. Programming is about making one thing work. System design is about deciding what the things are, how they talk to each other, where the data lives, and what happens when one of them fails — before any of them exist."],
["h","The deliverable is a set of decisions"],
["p","A design is not a diagram. A diagram is how a design is usually drawn, but the diagram is not the thing."],
["p","The thing is a set of decisions, each with a reason and a cost. If somebody asks why the book records are in one kind of database rather than another, a design can answer. A diagram cannot."],
["p","This is why every chapter of this book is organised around decisions rather than technologies. Knowing what a database is has some value. Knowing which one to reach for, when not to, and what you give up by choosing it, is the entire job."],
["t","If you can draw the boxes but cannot say why each one is there, you have drawn a picture rather than made a design. The test is whether you can delete a box and explain what would go wrong."]
]},
{id:"five-parts",title:"The five parts almost everything is built from",blocks:[
["p","Systems look wildly different from the outside and are assembled from a very small number of parts. Once you can see the parts, unfamiliar systems stop being intimidating."],
["p","Here is the library, described in those parts."],
["ex","A student's browser or phone            the CLIENT\n        |\n        v\nsomething that receives the request      the ENTRY POINT\n        |\n        v\nsomething that works out the answer      the LOGIC\n        |\n        v\nsomething that remembers                 the STORE\n\nand alongside all of it, something that watches   OBSERVABILITY"],
["p","The client is whatever the person is actually holding. It is not under your control — you cannot make somebody update their phone, and you cannot trust anything it tells you."],
["p","The entry point is the single address the outside world knows. Everything arrives here first, which makes it the natural place to check who somebody is and to turn traffic away when there is too much of it."],
["p","The logic is the part that knows the rules. A book can be borrowed only if a copy is free. A student may hold at most ten books. Overdue after twenty-eight days. This is the part people usually think of as the program."],
["p","The store is the part that remembers. It is the most important part of the whole diagram, for a reason worth being blunt about: if the logic crashes you restart it, and if the entry point crashes you replace it, but if the store loses the loan records they are gone. Everything else is replaceable. The data is not."],
["p","And observability is how you find out that any of it is broken without a student telephoning to tell you. It is not an optional extra bolted on at the end; a system nobody can see inside is a system nobody can fix."],
["h","Two words used constantly"],
["p","A request is one thing somebody asks for: show me this book, borrow this copy. Systems are usually described in terms of how many requests arrive per second, because that number decides almost everything else."],
["p","State is anything the system has to remember between requests. Which books exist, who has borrowed what, who is logged in. The central difficulty of this entire subject is that state is hard to copy, hard to keep in agreement, and hard to recover — which is why so much of this book is about where state lives."],
["t","Client, entry point, logic, store, and something watching. Almost every system you will be asked to design is these five with different labels. When a new system looks bewildering, find the five parts first."]
]},
{id:"no-right-answer",title:"Why there is no single right answer",blocks:[
["p","People new to this often assume there is a correct design and that experience means knowing it. That is not how it works, and believing it makes you worse at the job rather than better."],
["p","Take one concrete question from the library. Should searching the catalogue show results that are completely up to date?"],
["p","Say yes, and every search must consult the one authoritative copy of the data. That is correct, and it is slower, and if that copy is unreachable then search stops working entirely."],
["p","Say no, and searches can be served from copies kept nearby, which is faster and keeps working when the main store is briefly unavailable. The cost is that a book added four seconds ago might not appear yet."],
["p","Neither answer is wrong. They are different trades, and which one is right depends on something outside the technology: does anybody actually get hurt if a newly added book takes a few seconds to show up? For a library, no. For the seat you just booked on a flight, absolutely."],
["p","So the skill is not knowing the answer. It is being able to say which trade you are making and why it is acceptable here."],
["h","The sentence this whole book is teaching"],
["ex","Because [requirement],\nI will use [mechanism];\nthe cost is [tradeoff],\nwhich is acceptable here because [reason].\nThe alternative was [other mechanism],\nwhich is better when [condition]."],
["p","That is the shape of every good answer in system design, in an interview and on the job. Notice how much of it is not about technology. Two of the five clauses are about what the situation requires, and one is about the case where you would have chosen differently."],
["p","An answer missing the cost is not a decision, it is a preference. An answer missing the alternative usually means only one option was ever considered."],
D("Naming the tradeoff out loud",{say:"Search reads from a nearby copy rather than the authoritative one. It is faster and it keeps working if the main store is briefly unreachable. The cost is that a book added seconds ago may not appear yet, which nobody in a library will notice.",
use:["Every decision you make, from the largest to the smallest."],
avoid:["Presenting a choice with no cost attached. Everything in this subject costs something, so a costless choice means the cost has not been found yet."],
consider:["If you genuinely cannot name a downside, you are probably comparing against something nobody proposed.","The alternative you rejected is as informative as the one you chose. It shows you looked."]}),
["t","There is no correct design, only designs whose costs you can defend. Two competent engineers can reach opposite answers from the same requirements and both be right, because they weighed something differently — and said so."]
]},
{id:"how-to-read",title:"How to use this book",blocks:[
["p","The chapters run in the order the questions actually arrive."],
["p","First, who is this for and what must it do — because you cannot choose a database for a system whose purpose is undecided. Then how big it is, in numbers, because a system for four hundred people and one for four million are not the same system. Then where the data lives, then how it is reached, then how it grows, then how it survives failure, then how it is run and kept secure."],
["p","Only after all of that do the famous patterns appear, and the interview technique after those. Read in order and each chapter uses only what came before it."],
["h","What is in a chapter"],
["p","Teaching prose that works through one concrete system, then decision cards summarising the same material for revision. The cards are dense on purpose — they are for the second and third read, not the first. If a card is hard going, the prose above it explains the same thing slowly."],
["p","Cards are laid out as: what to say, when to use this, when not to, what to watch out for, and how it fails. That last field is the one to read twice. Anyone can list what a mechanism does; knowing how it breaks is what tells you whether to use it."],
["h","And the case studies"],
["p","The case-studies tab generates a system and a brief, you write your answer, and it is graded against a model answer with a score per category. That is where this stops being reading and starts being practice, and the gap between recognising an idea and being able to produce it under time pressure is much wider than it feels."],
["t","Read the prose first and the cards second. Do not start with the case studies — they are much more useful once you have something to be tested on."]
]}
]};
