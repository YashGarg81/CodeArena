// CodeArena — System Design Step-by-Step Curriculum
// A guided learning path for absolute beginners → staff-level architects.

export type SDCurriculumLevel = "Beginner" | "Intermediate" | "Advanced" | "Staff";

export interface SDCurriculumQuizQuestion {
  question: string;
  options: string[];
  correct: number; // index into options
  explanation: string;
}

export interface SDCurriculumLesson {
  slug: string;
  title: string;
  summary: string;
  durationMin: number;
  content: string;
  keyConcepts: string[];
  checklist: string[];
  quiz: SDCurriculumQuizQuestion[];
  resources: string[];
}

export interface SDCurriculumSection {
  slug: string;
  title: string;
  level: SDCurriculumLevel;
  icon: string;
  description: string;
  order: number;
  lessons: SDCurriculumLesson[];
}

export const CURRICULUM: SDCurriculumSection[] = [
  // ─────────────────────────────────────────────────────────────────────────────
  // SECTION 1 — FOUNDATIONS (Beginner)
  // ─────────────────────────────────────────────────────────────────────────────
  {
    slug: "foundations",
    title: "System Design Foundations",
    level: "Beginner",
    icon: "🧱",
    description:
      "Zero-to-one introduction: what system design is, the non-functional requirements that drive every architecture, and how to think about scale before writing a single line of code.",
    order: 1,
    lessons: [
      {
        slug: "what-is-system-design",
        title: "What is System Design & Why It Matters",
        summary:
          "Understand the discipline, the interview context, and the three pillars every design must satisfy.",
        durationMin: 12,
        content: `**System design** is the process of defining the architecture, components, modules, interfaces, and data flow of a system to satisfy specified requirements.

Unlike algorithms (micro level), system design lives at the **macro level** — how thousands of machines, databases, and services cooperate to serve millions of users.

## Why companies test it
- Junior engineers write code that works on one machine.
- Senior+ engineers build systems that survive a datacenter failing.
- System design interviews reveal how you handle **trade-offs, ambiguity, and scale** — the reality of production engineering.

## The three pillars
1. **Scalability** — can the system grow (users, data, traffic) without a rewrite?
2. **Availability** — is the service up when users need it (99.9% = ~8.7h downtime/yr)?
3. **Latency** — how fast does a user perceive the system responding?

## Key mindset
There is no single "right" answer. Interviewers score your **reasoning process**: 
requirements → estimation → high-level diagram → deep dive → trade-off analysis.`,
        keyConcepts: [
          "Scalability vs availability vs latency",
          "Trade-off driven design",
          "The system design interview structure",
          "Macro-level vs micro-level thinking",
          "Non-functional requirements",
        ],
        checklist: [
          "Write down the 3 pillars from memory",
          "Explain 99.9% availability in downtime per year",
          "List 3 systems you use daily and one scaling problem each might have",
        ],
        quiz: [
          {
            question: "99.99% availability permits roughly how much downtime per year?",
            options: ["~8.7 hours", "~52 minutes", "~5 minutes", "~1 hour"],
            correct: 1,
            explanation:
              "99.99% ≈ 0.0001 × 365 × 24 × 60 ≈ 52.6 minutes of downtime per year.",
          },
          {
            question: "What does an interviewer primarily evaluate in a system design interview?",
            options: [
              "The exact technologies you memorized",
              "Your reasoning process and trade-off analysis",
              "How fast you can code the system",
              "The number of components in your diagram",
            ],
            correct: 1,
            explanation:
              "There is no single correct answer — the reasoning process, requirements gathering, and trade-off analysis win the interview.",
          },
        ],
        resources: [
          "System Design Primer (GitHub)",
          "Grokking the System Design Interview",
          "ByteByteGo System Design Newsletter",
        ],
      },
      {
        slug: "requirements-clarification",
        title: "Requirements: Clarify Before You Design",
        summary:
          "Learn the 6-question framework to extract functional and non-functional requirements from a vague prompt.",
        durationMin: 15,
        content: `Every great design starts with **requirement clarification**. A vague prompt like "design a URL shortener" hides dozens of decisions.

## The 6-question framework
1. **Who are the users?** Consumers, businesses, or internal teams?
2. **What are the core features?** Must-have vs nice-to-have (write a feature list).
3. **Scale?** Daily Active Users (DAU), requests/second, data size.
4. **Latency target?** e.g. chat < 100ms, analytics > 10s is fine.
5. **Read/write ratio?** Drives caching and storage decisions.
6. **Constraints?** Cost budget, compliance (GDPR/PCI), existing stack.

## Functional vs Non-functional
- **Functional:** what the system does (shorten URL, redirect, analytics).
- **Non-functional:** how well (latency, availability, consistency, security, cost).

## The pay-off
A 5-minute clarification phase converts a 45-minute design from "guessing" into "informed decision making" — and signals senior-level communication.

## Exercise
Take the prompt "design WhatsApp". Before sketching anything, write down answers to all 6 questions.`,
        keyConcepts: [
          "The 6-question requirements framework",
          "Functional vs non-functional requirements",
          "Defining DAU, QPS, read:write ratio",
          "Explicit latency & availability targets",
          "Scope control (what NOT to build)",
        ],
        checklist: [
          "Memorize the 6 questions",
          "Practice clarifying 'design a news feed' with the framework",
          "Write 3 functional and 3 non-functional requirements for a chat app",
        ],
        quiz: [
          {
            question: "Which is a NON-functional requirement?",
            options: [
              "A user can share a post",
              "P99 latency under 150ms",
              "Users can follow each other",
              "The system shortens URLs",
            ],
            correct: 1,
            explanation:
              "Latency, availability, consistency, and cost are non-functional (how well). Features are functional (what it does).",
          },
          {
            question: "Why clarify scale before designing?",
            options: [
              "To show you're thorough",
              "Because the scale determines the architecture (single DB vs sharded cluster)",
              "To fill interview time",
              "Because the interviewer expects memorized numbers",
            ],
            correct: 1,
            explanation:
              "A 100-user app needs a monolith + SQLite; a 100M-user app needs sharding, caching, queues, and CDNs. Scale dictates architecture.",
          },
        ],
        resources: [
          "Alex Xu — System Design Interview Volume 1",
          "Donne Martin — System Design Primer",
          "Pramp system design interview prep guides",
        ],
      },
      {
        slug: "back-of-envelope-estimation",
        title: "Back-of-Envelope Estimation (QPS, Storage, Bandwidth)",
        summary:
          "The math that impresses interviewers: compute traffic, data growth, and bandwidth from DAU and usage numbers in under 60 seconds.",
        durationMin: 18,
        content: `Interviewers love candidates who translate "50M DAU" into concrete **QPS, storage, and bandwidth** numbers without a calculator.

## Golden conversion constants
- 1 day = **86,400 seconds** ≈ 10^5 (use 10^5 for rapid mental math)
- 1 month = 2.5 × 10^6 s
- 1 GB = 2^30 ≈ 10^9 bytes
- 1 TB = 2^40 ≈ 10^12 bytes

## The recipe
1. **DAU → total daily requests**: DAU × requests per user per day.
2. **QPS**: total daily requests ÷ 86,400.
3. **Peak QPS**: QPS × 2–3 (traffic is bursty; assume 2× average).
4. **Storage**: writes/day × payload bytes × retention days.

## Worked example — URL shortener
- 100M URLs created/month → 1B total short URLs (10 months retention).
- 1B URLs ÷ (2.5M s/month) ≈ **40 URL-writes/s** (trivial!).
- Reads: 100:1 → 4,000 reads/s, peaks ~12,000/s.
- Storage: 100M rows × 500 bytes ≈ 50 GB/month → **0.6 TB/year** (small!).
- Conclusion: caching + replication matter more than exotic storage.

## Common pitfall
Doubling numbers mid-conversation. Round to convenient numbers first, then compute, then sanity-check: "500 writes/s feels too high for a URL shortener — let me recompute."

## Practice
Compute QPS for: (a) 10M users posting 1 tweet/day; (b) 1B users watching 10 videos/day, 50% video bytes.`,
        keyConcepts: [
          "QPS = daily requests ÷ 86,400",
          "Peak ≈ 2–3× average QPS",
          "Storage = writes × payload × retention",
          "Rounded mental math (10^5 s/day)",
          "Sanity-checking your own numbers",
        ],
        checklist: [
          "Memorize 86,400 s/day and 2.5×10^6 s/month",
          "Recompute the URL shortener example from scratch",
          "Estimate Twitter's tweet-write QPS",
        ],
        quiz: [
          {
            question: "Approximately how many seconds are in a day?",
            options: ["36,000", "86,400", "100,000,000", "10^4"],
            correct: 1,
            explanation: "86,400 = 24 × 60 × 60. Use ~10^5 for rapid estimation.",
          },
          {
            question: "10M users send 5 messages/day. Average message QPS is:",
            options: ["~580", "~5,800", "~58", "~58,000"],
            correct: 0,
            explanation: "10M × 5 = 50M messages ÷ 86,400 ≈ 579 messages/s.",
          },
        ],
        resources: [
          "System Design Interview — Chapter on Back of Envelope",
          "Jeff Dean's Stanford talk on latency numbers",
          "Cloudflare latency numbers reference",
        ],
      },
      {
        slug: "client-server-apis",
        title: "Client–Server, REST & gRPC APIs",
        summary:
          "The most basic topology and the interaction contracts that glue every distributed system together.",
        durationMin: 12,
        content: `Every distributed system is ultimately **clients talking to servers** over an API contract.

## Client–Server topology
- **Client**: browsers, mobile apps, IoT devices — initiates requests.
- **Server**: hosts business logic + data; scales independently (horizontal).
- Stateless servers (no session data) allow any server to handle any request → trivial load balancing.

## REST (most common)
- Resources as URIs: \`GET /users/42\`, \`POST /users\`.
- Modes: GET, POST, PUT/PATCH, DELETE.
- Stateless per request; JSON payloads; HTTP caching verbs already built in.
- Best for: public APIs, CRUD-heavy products, wide client compatibility.

## gRPC (modern internal choice)
- HTTP/2 binary (protobuf) framing — faster, smaller, typed contracts.
- Streaming (bidirectional) support.
- Best for: internal microservice-to-microservice calls, low latency, polyglot teams.

## GraphQL (when flexible queries matter)
- Client asks for exactly the fields it needs.
- Best for: mobile feeds, BFF (Backend for Frontend), avoiding over-fetching.

## Choosing
> Public external API → REST. Internal real-time services → gRPC. Mobile-first flexible data → GraphQL.

## Why it matters in system design
The API layer is where **rate limiting, authentication, versioning, and pagination** live. Nail these at the boundary and downstream components stay simple.`,
        keyConcepts: [
          "Stateless servers enable horizontal scaling",
          "REST for public APIs",
          "gRPC (HTTP/2 + protobuf) for internal services",
          "GraphQL for flexible client queries",
          "API gateway as the security boundary",
        ],
        checklist: [
          "Draw a client→LB→server→DB topology",
          "Explain why statelessness enables auto-scaling",
          "Pick a protocol for (a) a public API, (b) internal chat service",
        ],
        quiz: [
          {
            question: "Why do stateless servers simplify scaling?",
            options: [
              "They use less RAM",
              "Any server can handle any request, so load balancers can distribute freely",
              "They don't need a database",
              "They can't crash",
            ],
            correct: 1,
            explanation:
              "No pinned session data means requests can route to any replica — enabling round-robin and auto-scaling.",
          },
          {
            question: "Which protocol is typically best for internal microservice communication?",
            options: ["REST", "gRPC", "GraphQL", "SOAP"],
            correct: 1,
            explanation:
              "gRPC's HTTP/2 multiplexing, binary protobuf encoding, and streaming make it ideal for internal service-to-service calls.",
          },
        ],
        resources: [
          "MDN — HTTP overview",
          "gRPC official docs",
          "GraphQL official docs",
        ],
      },
      {
        slug: "dns-cdn-lb-intro",
        title: "The Traffic Trifecta: DNS, CDN & Load Balancers",
        summary:
          "How a request flows from a user's browser to your servers — and the three systems that keep it fast and resilient.",
        durationMin: 15,
        content: `Before your backend ever sees a request, three systems shape the traffic journey. This is the **first diagram level** you draw in every interview.

## 1. DNS (Domain Name System)
- Translates \`api.example.com\` → an IP address.
- **Anycast / GeoDNS** routes a user to the nearest regional POP.
- Cached aggressively (TTL) at OS + ISP level → requests rarely hit your origin.

## 2. CDN (Content Delivery Network)
- Caches **static assets** (images, JS, video) at 300+ edge locations globally.
- Users fetch from the nearest edge instead of your origin → huge latency win.
- **Miss** (uncached) → edge fetches from origin, then serves + caches.
- Saves origin bandwidth and absorbs traffic spikes (e.g., viral content).

## 3. Load Balancer
- Distributes incoming requests across a pool of servers.
- Algorithms: **round-robin, least-connections, IP hash**.
- **Health checks** remove dead servers from rotation automatically.
- L4 (transport, faster) vs L7 (application, HTTP-aware e.g. path routing).

## The request journey
\`User → DNS → (optional CDN) → Load Balancer → Application Servers → DB/Cache\`

## Interview tip
Start every diagram with these three: DNS/CDN at the edge, a load balancer, and a stateless app tier. It instantly communicates production awareness.`,
        keyConcepts: [
          "DNS resolves + caches, routes to nearest region",
          "CDN caches static content at the edge",
          "L4 vs L7 load balancing",
          "Health checks & auto-removal",
          "The canonical first-level diagram",
        ],
        checklist: [
          "Draw the full request journey for loading an image",
          "Explain what happens on a CDN cache MISS",
          "Name 3 load balancing algorithms",
        ],
        quiz: [
          {
            question: "What happens on a CDN cache miss?",
            options: [
              "The user gets an error",
              "The edge fetches the asset from origin, serves it, and caches it",
              "DNS re-resolves the domain",
              "The load balancer retries",
            ],
            correct: 1,
            explanation:
              "The edge POP fetches from origin on first request, serves the user, and stores it for subsequent requests.",
          },
          {
            question: "An L7 load balancer is aware of which layer?",
            options: [
              "Network addresses only",
              "Application/HTTP-level details like paths and headers",
              "Physical hardware",
              "Database queries",
            ],
            correct: 1,
            explanation:
              "L7 (application layer) can route on URL paths, headers, and cookies; L4 (transport) only sees TCP/UDP.",
          },
        ],
        resources: [
          "Cloudflare Learning Center — how DNS works",
          "AWS — CDN fundamentals",
          "NGINX — load balancing methods",
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // SECTION 2 — CORE BUILDING BLOCKS (Beginner)
  // ─────────────────────────────────────────────────────────────────────────────
  {
    slug: "building-blocks",
    title: "Core Building Blocks",
    level: "Beginner",
    icon: "🧩",
    description:
      "The app-tier toolbox every architect reaches for: caching, databases, message queues, and the trade-offs behind each choice.",
    order: 2,
    lessons: [
      {
        slug: "caching-fundamentals",
        title: "Caching: The Cheapest Performance Win",
        summary:
          "Cache-aside, cache invalidation, TTLs, and which data belongs in memory — with real-world hit-ratio targets.",
        durationMin: 20,
        content: `Caching is the single highest-ROI technique in system design. A 95% cache hit ratio removes 95% of database load.

## What to cache
- **Read-heavy** data (99% of reads hit the same 5% of content: the Pareto rule).
- **Expensive** to compute (aggregations, recommendations, rendered HTML).
- Frequent queries with **lower consistency** tolerance.

## Cache-Aside (most common pattern)
1. Read: check cache → hit? return. Miss → read DB → write cache → return.
2. Write: write DB → **invalidate** cache (delete key).
3. Why delete not update? Writes race with reads; deleting avoids stale-data windows.

## Read-Through / Write-Through / Write-Behind
- **Read-through**: cache loads DB data automatically on miss (backend owns logic).
- **Write-through**: write cache + DB synchronously (always consistent, higher latency).
- **Write-behind / write-back**: write cache only, flush to DB async (very fast, risk of loss).

## Invalidation strategies
- TTL (time-based expiry) — simplest.
- Event-based invalidation (delete on DB write).
- Versioned keys (\`user:42:v3\`) — immutable snapshots, no races.

## The danger: cache stampede
Popular key expires → thousands of requests all miss → DB collapses.
**Fix:** per-key mutex (single-flight) + jittered TTLs (stale-while-revalidate).

## Targets
- Hot-product read caches: **95–99% hit ratio**.
- Ceic: aim for p99 reads under 10ms from Redis.`,
        keyConcepts: [
          "Cache-aside (read: check, miss→DB, fill; write: invalidate)",
          "Pareto 80/20 → why few keys dominate",
          "TTL & event-based invalidation",
          "Cache stampede & single-flight/mutex",
          "Write-through vs write-back",
        ],
        checklist: [
          "Implement the cache-aside read flow in pseudocode",
          "Explain how to prevent a stampede on a viral key",
          "Decide: cache user profiles (write-heavy) or trending feed (eventual ok)?",
        ],
        quiz: [
          {
            question: "In cache-aside, what do you do on a WRITE?",
            options: [
              "Update the cache immediately",
              "Write DB then invalidate the cache key",
              "Write to cache only",
              "Nothing — caches self-manage",
            ],
            correct: 1,
            explanation:
              "Write to DB then delete the cache key. Update-below races with concurrent reads create stale data; invalidation avoids it.",
          },
          {
            question: "What causes a cache stampede?",
            options: [
              "Too much data in Redis",
              "A popular key expires and thousands of concurrent misses hit the DB",
              "Slow network",
              "Using LRU instead of LFU",
            ],
            correct: 1,
            explanation:
              "A hot key expiring triggers simultaneous misses → DB overwhelmed. Single-flight locks + jittered TTL fix it.",
          },
        ],
        resources: [
          "Martin Fowler — caching patterns",
          "Redis docs — caching patterns",
          "MongoDB University — when to use caching",
        ],
      },
      {
        slug: "sql-vs-nosql",
        title: "SQL vs NoSQL: Choosing Your Data Store",
        summary:
          "Relational, document, key-value, wide-column, and graph stores — and the decision tree that picks the right one.",
        durationMin: 20,
        content: `Choosing the wrong database is the most expensive mistake in a career. Master the decision tree.

## SQL / Relational (Postgres, MySQL)
- Schema enforced, ACID transactions, joins, rich queries.
- Perfect when: data is **relational**, needs **transactions (money!)**, complex ad-hoc queries.
- Scales: read replicas → sharding (harder but doable).

## Document (MongoDB, Firestore)
- JSON-ish flexible schemas, powerful partial indexes.
- Perfect when: product iterates fast, data fits in single documents, no complex joins.
- Caveat: multi-document transactions are limited.

## Key-Value (Redis, Memcached, DynamoDB)
- Blazing lookups by key; no queries/joins.
- Perfect for: sessions, caches, counters, feature flags.
- Perfect read pattern: one-document-per-key.

## Wide-Column (Cassandra, ScyllaDB, Bigtable)
- Schema-flexible rows keyed by partition+clustering keys; writes scale linearly.
- Perfect for: **write-heavy** time-series, messaging history, telemetry.
- Cost: queries must include partition key; eventual/consistent settings needed.

## Graph (Neo4j)
- Perfect for: social graphs, fraud detection, recommendation hops.

## The cheat sheet
- Money/transactions → **SQL** (ACID).
- Product sessions/cache → **Redis**.
- Massive write ingestion → **Cassandra**.
- Fast product growth, document-shaped data → **MongoDB**.
- Relations become files → **graph**.

## Migration cost
Getting out of SQL joins into wide-columns is a rewrite. Choose early, own the trade-off.`,
        keyConcepts: [
          "ACID transactions vs eventual consistency",
          "Read vs write-optimized stores",
          "Document vs key-value vs wide-column vs relational",
          "The 'money → SQL' heuristic",
          "Migration cost of a poor early choice",
        ],
        checklist: [
          "Build the SQL-vs-NoSQL decision tree from memory",
          "Pick stores for: cart+orders, chat history, session cache",
          "Explain why Cassandra suits write-heavy workloads",
        ],
        quiz: [
          {
            question: "Which store for a transactional payment ledger?",
            options: ["Cassandra", "PostgreSQL", "Redis", "MongoDB"],
            correct: 1,
            explanation:
              "Money demands ACID transactions and SQL's strong guarantees — PostgreSQL (or CockroachDB for distributed) is the right category.",
          },
          {
            question: "Why does Cassandra scale writes linearly?",
            options: [
              "It optimizes for JOIN queries",
              "Every node accepts writes (peer-to-peer, no single leader)",
              "It caches everything in memory",
              "It uses a single primary",
            ],
            correct: 1,
            explanation:
              "Wide-column stores route each write to the owning partition data — all nodes take writes, so throughput grows with cluster size.",
          },
        ],
        resources: [
          "AWS — choosing a database service",
          "MongoDB vs PostgreSQL comparisons",
          "Cassandra architecture docs",
        ],
      },
      {
        slug: "database-replication",
        title: "Database Replication: Reads, Redundancy & Failover",
        summary:
          "Single-leader, multi-leader, and leaderless replication — the backbone of availability and read scaling.",
        durationMin: 18,
        content: `Replication keeps **copies** of your data on multiple machines. It buys availability (survive node loss) and read scaling (parallel reads).

## Single-Leader (most common — SQL default)
- One **leader** accepts writes; replicas stream changes (WAL/binlog) and serve reads.
- Promotes a replica if the leader dies (failover).
- **Trade-off:** read replicas may lag (stale reads) — acceptable for most read paths.

## Multi-Leader
- Several leaders accept writes (each region has one).
- **Trade-off:** write-write conflicts need resolution (LWW, merge). Used for active-active multi-region or offline editing.

## Leaderless (Dynamo/Cassandra style)
- Any node accepts reads/writes; **quorum** (R+W > N) guarantees consistency.
- Read-repair and hinted handoff heal stale copies.

## The replication lag problem
Read-your-writes (immediately read your own write) is broken under laggy replicas.
Fixes: route the reader's reads to the leader for a short window; use monotonic reads (stick to one replica per session).

## Failover: the tricky part
- Automatic failover can cause **split-brain** (two leaders) → avoid auto-promote without a quorum/lease.
- Prefer: health check → quorum consensus → promote replica → update app config.

## Takeaway diagram
\`App → Leader (write) → [replica, replica, replica] (reads)\` with the app aware replicas only serve reads.`,
        keyConcepts: [
          "Single-leader: writes to one, reads from any",
          "Replication lag → stale reads",
          "Multi-leader for active-active multi-region",
          "Leaderless with quorum (R+W > N)",
          "Split-brain danger in naive failover",
        ],
        checklist: [
          "Draw single-leader replication and arrows for write vs read paths",
          "Explain read-your-writes violation",
          "Describe why auto-failover needs a quorum",
        ],
        quiz: [
          {
            question: "Read replicas may serve slightly stale data. This is:",
            options: [
              "A fatal bug",
              "Replication lag — acceptable where eventual consistency works",
              "A hardware failure",
              "Only a problem for analytics",
            ],
            correct: 1,
            explanation:
              "Replicas apply the write stream asynchronously, so they lag briefly. Design read paths to tolerate slight staleness.",
          },
          {
            question: "Quorum-based reads in a leaderless store guarantee...",
            options: [
              "Zero latency",
              "Reads reflect the latest write when R + W > N",
              "No replication",
              "ACID transactions",
            ],
            correct: 1,
            explanation:
              "With R + W > N, any read quorum overlaps any write quorum, guaranteeing at least one node has the latest write.",
          },
        ],
        resources: [
          "Designing Data-Intensive Applications — Chapter 5",
          "PostgreSQL streaming replication docs",
          "DynamoDB internals (Dynamo paper)",
        ],
      },
      {
        slug: "database-sharding",
        title: "Sharding: When One Database Isn't Enough",
        summary:
          "Horizontal partitioning, hash vs range sharding, and the rebalancing problem every growing system eventually faces.",
        durationMin: 18,
        content: `Replication scales **reads**, but **writes and dataset size** eventually need \`sharding\` — splitting data across machines.

## What sharding is
Partition each row to exactly one node by a **shard key**.
- \`shard = hash(key) % N\`
- All reads/writes for a key go to one node → no cross-node coordination for single-key ops.

## Shard key choice (the most important decision)
- **user_id** — great for user-centric apps (feed, posts, settings) since every user's data collocates.
- **event_id / moment** — great for time-series (append-heavy, partition by time).
- Avoid keys that make one shard hot (e.g., a celebrity's account).

## Hash vs Range sharding
- **Hash** \`% N\`: even distribution, but range queries need scatter (query every shard).
- **Range**: natural time ranges, but cold/hot shard skew.
- Hybrid: hash the key but cluster by time within a shard (Cassandra pattern).

## The rebalancing pain
When you add a node, \`key % N\` changes for most keys → massive migration.
**Consistent hashing** solves this: only ~1/N of keys move when N changes. This is why Redis Cluster & Cassandra love it.

## Cross-shard problems
- Joins: no longer possible → denormalize or fan-out query to all shards.
- Transactions across shards: use 2PC/Saga (expensive) OR design the shard key so transactions stay local.

## Rule of thumb
Only shard when you MUST (write throughput or dataset exceeds ~single-node capacity). Premature sharding adds enormous complexity.`,
        keyConcepts: [
          "Sharding = horizontal partitioning by shard key",
          "Hash vs range sharding trade-offs",
          "Hot shard / skew problem",
          "Consistent hashing for cheap rebalancing",
          "No joins across shards → denormalize",
        ],
        checklist: [
          "Pick a shard key for a messaging app (user_id vs chat_id)",
          "Explain why rehash migration is expensive",
          "Name 2 cross-shard problems",
        ],
        quiz: [
          {
            question: "Why use consistent hashing in a sharded cluster?",
            options: [
              "It makes queries faster",
              "Adding/removing a node moves only ~1/N of keys",
              "It compresses data",
              "It removes the need for a shard key",
            ],
            correct: 1,
            explanation:
              "Consistent hashing minimizes key migration during scaling — only neighboring keys move rather than a full rehash.",
          },
          {
            question: "A hot shard (one celebrity's data) is a symptom of:",
            options: [
              "Too many shards",
              "A poor shard key / skewed load",
              "Slow network",
              "Replication lag",
            ],
            correct: 1,
            explanation:
              "If traffic concentrates on one key, that shard becomes a bottleneck. Choose keys that spread load, and re-shard/rebuild when skew emerges.",
          },
        ],
        resources: [
          "Designing Data-Intensive Applications — Chapter 6",
          "Redis Cluster spec on consistent hashing",
          "Facebook TAO / sharding stories",
        ],
      },
      {
        slug: "consistency-models",
        title: "Consistency Models: Strong, Eventual & Everything Between",
        summary:
          "What 'I can read my own write' really means in a distributed system — and how to pick the right guarantee per feature.",
        durationMin: 18,
        content: `Consistency is the contract a system makes about **what readers will see** given writes. It's the heart of distributed-systems trade-offs.

## The spectrum
1. **Strong (Linearizable)** — after a write ACKs, every read returns it. Single-node DB; synchronous replication across region (Spanner, etcd).
2. **Causal** — if A caused B, everyone sees A before B (conversation threads).
3. **Read-your-writes** — a user always sees their own writes.
4. **Monotonic reads** — reads never go backwards in time.
5. **Eventual** — replicas converge eventually, in the absence of new writes (Cassandra, Dynamo defaults, DNS).

## What it costs
- Strong consistency = **latency** (you must coordinate, often across regions).
- Eventual = **fast + available**, but reads may be stale.

## How to decide (per feature, not per system!)
- Payments, inventory, auth → **strong** (or at least read-your-writes for the actor).
- Likes/views/notifications → **eventual**.
- Comments → causal (threads must preserve order).
- Feed → read-your-writes for the author, eventual for others.

## PACELC recap
- During **P**artition: choose **A**vailability or **C**onsistency.
- **E**lse (normal operation): choose **L**atency or **C**onsistency.

## Interview move
> "This feature needs read-your-writes (so the POSTer sees their comment immediately); everyone else can be eventual — so I'll route that path through the leader for ~2s."

Mixing guarantees per-path is literally what senior engineers do.`,
        keyConcepts: [
          "Strong → causal → read-your-writes → eventual",
          "PACELC: partition → A/C; normal → L/C",
          "Cost of strong = latency/coordination",
          "Per-feature consistency, not per-system",
          "Read-your-writes as the pragmatic default",
        ],
        checklist: [
          "Place these on the consistency spectrum: Spanner, Cassandra, DNS, Redis leader",
          "Assign guarantees to: cart, likes count, a user's own comment",
          "Explain PACELC in one sentence",
        ],
        quiz: [
          {
            question: "Which guarantee lets a user always see their own just-posted comment?",
            options: [
              "Eventual consistency",
              "Read-your-writes consistency",
              "Linearizability",
              "Monotonic writes",
            ],
            correct: 1,
            explanation:
              "Read-your-writes routes the author's subsequent reads to a node that has their write — everyone else may be eventual.",
          },
          {
            question: "PACELC says: during a partition, an AP system chooses ______; normally it prefers ______.",
            options: [
              "Consistency; latency",
              "Availability; latency",
              "Availability; consistency",
              "Consistency; availability",
            ],
            correct: 1,
            explanation:
              "AP = Available during Partition, and EL = Else Latency — it sacrifices consistency for availability and low latency.",
          },
        ],
        resources: [
          "CAP Theorem explained — Kleppmann",
          "Jepsen — consistency models & verification",
          "Google Spanner paper (true time & strong consistency)",
        ],
      },
      {
        slug: "message-queues",
        title: "Message Queues & Event Streaming (Kafka, RabbitMQ)",
        summary:
          "Decouple producers from consumers, smooth traffic spikes, and enable event-driven architectures — with exactly-once gotchas.",
        durationMin: 20,
        content: `A **message queue** inserts a decoupling buffer between producers and consumers. It is the backbone of scalable, resilient architectures.

## Why queue
- **Decoupling**: producer doesn't wait on consumer speed.
- **Spike absorption**: sudden 10× traffic → buffered harmlessly.
- **Reliability**: failures don't drop data — consumers retry later.
- **Fan-out**: one event → many consumers (analytics, notifications, search index).

## Queue vs Stream (the two kinds)
### Classic queue (RabbitMQ, SQS)
- Messages are **consumed and removed** (work queues; competing consumers).
- Good for: tasks, jobs, notifications.

### Log-based stream (Kafka)
- Messages are **appended to a log**, retained for N days; consumers read with their own offset.
- Funny detail: multiple consumer groups read the same stream independently (fan-out).
- Good for: event sourcing, CDC, analytics pipelines, real-time features.

## Delivery semantics (the classic interview trap)
- **At-most-once**: send, forget — may lose on crash.
- **At-least-once**: consumer ACKs after processing; producer retries on timeout → **duplicates** possible.
- **Exactly-once**: needs idempotency keys + message dedup (your consumer must be idempotent anyway!).

## Best practice
Design consumers **idempotent** (retry-safe). Then at-least-once + idempotency ≈ exactly-once, without the coordination cost.

## Backpressure & dead-letter
- If consumers lag: scale consumers, add partitions, or apply backpressure.
- Poison messages (always fail) → **dead-letter queue** (DLQ) for inspection.

## Diagram
\`Producer → Kafka Topic (retained log) → Consumer Group A / Consumer Group B\``,
        keyConcepts: [
          "Queues decouple producers & consumers",
          "Kafka = retained log with replays",
          "At-most-once / at-least-once / exactly-once",
          "Idempotent consumers ≈ exactly-once",
          "Dead-letter queues for poison messages",
        ],
        checklist: [
          "Explain the difference between SQS-style and Kafka-style systems",
          "Design a payment event flow with at-least-once + idempotency",
          "Describe what a DLQ is for",
        ],
        quiz: [
          {
            question: "How do you achieve behavior equivalent to 'exactly-once' message processing?",
            options: [
              "Use only RabbitMQ",
              "At-least-once delivery + idempotent consumers",
              "Disable retries",
              "Use synchronous REST calls",
            ],
            correct: 1,
            explanation:
              "Make consumers idempotent (dedupe by ID) so retries/duplicates are harmless — the simplest robust guarantee.",
          },
          {
            question: "A Kafka-style log differs from an SQS queue because...",
            options: [
              "It's slower",
              "Messages are retained and consumers replay independently; multiple groups read one stream",
              "It can't fan out",
              "It loses data",
            ],
            correct: 1,
            explanation:
              "Kafka appends to a retained log; consumers track offsets, so multiple consumer groups can independently process the same stream.",
          },
        ],
        resources: [
          "Kafka documentation — design",
          "RabbitMQ vs Kafka comparisons (Confluent)",
          "Microsoft — asynchronous messaging patterns",
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // SECTION 3 — DISTRIBUTED SYSTEMS CONCEPTS (Intermediate)
  // ─────────────────────────────────────────────────────────────────────────────
  {
    slug: "distributed-concepts",
    title: "Distributed Systems Concepts",
    level: "Intermediate",
    icon: "🌐",
    description:
      "CAP, consistent hashing, consensus, and distributed coordination — the theory that separates copy-paste architectures from real ones.",
    order: 3,
    lessons: [
      {
        slug: "cap-pacelc-deep",
        title: "CAP, PACELC & Partitioning Deep Dive",
        summary:
          "Move past flashcards: understand what a partition actually is, why CP is rare in practice, and how to apply PACELC per path.",
        durationMin: 16,
        content: `Everyone quotes CAP; few can apply it. This lesson gets practical.

## What a partition actually is
A **network partition** = nodes can't reach each other (switch failure, datacenter outage, GC pause). With 3 nodes, 1 down means the other 2 are partitioned from it.

## CAP is about PARTITIONS ONLY
- Partition happens → you must pick: keep serving (A) or refuse to guarantee consistency (C).
- No partition → no choice needed (systems are both C and A).
- **CP vs AP is therefore about behavior DURING failure.**

## The painful truth
- Most production systems are **AP in practice** — Spanner/etcd are the CP exceptions.
- Why? Because "unavailable" also violates UX. Leaders promote, replicas lag, eventual wins.

## PACELC is the useful extension
- **During Partition:** A or C.
- **Else (normal):** Latency or Consistency?
- e.g. DynamoDB (PA/EL), Spanner (PC/EC), Cassandra (PA/EL), CockroachDB (PC/EC with tunable... actually CockroachDB is PC/EC by default).

## Applying per path
> Payments path: **PC/EC** (strong). Feed path: **PA/EL** (fast, eventual). Same cluster can serve both with careful routing.

## Anti-patterns to name in interviews
- Claiming "I chose CP" when your system is a leader+replicas with async replication (that's AP with last-writer-wins).
- Ignoring that **quorum + read-repair is tunable**: Cassandra R=1 (AP) vs R=QUORUM (almost CP per-partition).`,
        keyConcepts: [
          "Partition = node unreachability; CAP applies only then",
          "CP vs AP = behavior during failure",
          "PACELC adds the normal-operation dimension",
          "Most systems are AP in practice; Spanner/etcd are CP",
          "Tunable consistency (quorum) per path",
        ],
        checklist: [
          "Trace what happens to reads vs writes during a 3-node partition",
          "Label your last project's paths with PACELC",
          "Explain why async-replication systems aren't 'CP'",
        ],
        quiz: [
          {
            question: "CAP's C and A are only in tension when...",
            options: [
              "The system is loaded",
              "A network partition occurs",
              "The database is slow",
              "Always",
            ],
            correct: 1,
            explanation:
              "CAP only forces the A/C choice during a partition. In normal operation a system can be both consistent and available.",
          },
          {
            question: "A system with async leader→replica replication is best described as:",
            options: [
              "CP",
              "AP with eventual consistency",
              "CA",
              "Zero consistency",
            ],
            correct: 1,
            explanation:
              "Replicas fall behind → available reads, stale data → that's availability + eventual consistency (AP-style).",
          },
        ],
        resources: [
          "Julian Browne — CAP FAQ",
          "PACELC explained (Abadi's paper)",
          "Jepsen analyses for real systems",
        ],
      },
      {
        slug: "consistent-hashing",
        title: "Consistent Hashing, from First Principles",
        summary:
          "Why naive hash % N breaks, how a ring solves it, and how virtual nodes fix distribution skew — with the math to prove it.",
        durationMin: 18,
        content: `Consistent hashing answers: **"how do we distribute keys across machines that will grow/shrink?"**

## Why not hash(key) % N
The moment N changes (add a server), nearly **every key** maps to a new node → mass data migration + cache invalidation storm.

## The ring
1. Hash nodes and keys onto a ring of 0 → 2^32.
2. A key maps to the **first node clockwise** from its hash.
3. Add a node → only keys between new node and its predecessor move.
4. Remove → keys move to the next node.

## Why it fixes rebalancing
Adding node changes mappings for only **~1/N** of keys instead of (N-1)/N.

## The skew problem
Nodes hash unevenly → some own more ring range (hotspot). 
**Virtual nodes:** each physical server registers ~100–200 virtual points → rings become uniform → even load.

## Real-world heroes
- **DynamoDB/Cassandra**: consistent hashing + virtual nodes.
- **Redis Cluster**: hash slots (16384) — a cousin of consistent hashing.
- **CDNs & LB sticky sessions** use variants too.

## Interview-ready explanation
> "I'd place nodes on a hash ring with ~150 virtual nodes each, so adding a server re-distributes only the keys between it and its neighbors — no global rehash, no cache thundering herd."

## Numeric proof
3 nodes, 120 keys, consistent hashing: add 4th node → only ~30 keys move (~25%).
\`hash % 3\` → **all 120** keys move. Need I say more?`,
        keyConcepts: [
          "hash % N fails on node count change",
          "Ring routing = first clockwise node",
          "Only ~1/N keys move on resize",
          "Virtual nodes fix hotspots",
          "Used by DynamoDB, Cassandra, Redis Cluster",
        ],
        checklist: [
          "Draw a 4-node ring and place 3 keys",
          "Simulate adding a 5th node — which keys move?",
          "Explain why a node with an unlucky hash causes skew",
        ],
        quiz: [
          {
            question: "Adding a node to a consistent-hash ring moves roughly:",
            options: [
              "All keys",
              "~1/N of keys",
              "No keys",
              "Half the keys",
            ],
            correct: 1,
            explanation:
              "Only keys between the new node and its clockwise predecessor re-map — roughly 1/N where N is node count.",
          },
          {
            question: "Virtual nodes exist to...",
            options: [
              "Speed up hashing",
              "Reduce load skew from uneven node hashes",
              "Encrypt keys",
              "Reduce latency",
            ],
            correct: 1,
            explanation:
              "Registering many hashes per physical node spreads each server evenly around the ring, preventing hotspots.",
          },
        ],
        resources: [
          "Tom White — Consistent Hashing (original blog)",
          "Cassandra architecture — virtual nodes",
          "Redis Cluster hash slots spec",
        ],
      },
      {
        slug: "consensus-raft-paxos",
        title: "Consensus & Coordination: Raft, Paxos, ZooKeeper, etcd",
        summary:
          "How systems agree on a single source of truth across machines — leases for leaders, and where coordination services shine.",
        durationMin: 18,
        content: `Consensus = multiple machines **agreeing on a single value/order** despite failures. It's how you get "one leader", "one lock", "one committed offset".

## The use cases
- **Leader election**: exactly one replica is leader.
- **Replicated log**: all nodes apply the same ops in the same order.
- **Locks / metadata / service discovery**: config, quotas, cluster state.

## Raft (the readable consensus)
- Log replication → log index = total order.
- Majority (quorum = N/2+1) must commit.
- Term numbers + randomized election timeouts → exactly one leader emerges.
- **Leader lease**: leader heartbeats renew a lease; if it dies, a new election begins (old leader must not write after lease expiry).

## Paxos (the classic proof)
Same guarantees, harder to implement. Raft is the industry answer ("Raft is to Paxos what C++ is to machine code" — pragmatic).

## Coordination services
- **ZooKeeper / etcd / Consul**: distributed KV with Raft under the hood.
- Patterns: distributed locks, leader election via ephemeral nodes, config watch.

## SPOF warning
> "The coordination service itself must be a 3–5 node Raft cluster. Running etcd as a single node recreates the SPOF you were trying to eliminate."

## When you DON'T need it
- A single leader DB already gives ordering (I just commit to it).
- Choose simplicity: use your DB's leader + a lease, or an existing etcd, before building homegrown consensus.

## Interview answer skeleton
"To elect a leader with no split-brain, I'd use a 3-node Raft clique (etcd). Replicas bid with epochs; the elected leader holds a lease that it renews with heartbeats; if heartbeats stop, a new election starts automatically."`,
        keyConcepts: [
          "Consensus = ordered, agreed values across nodes",
          "Raft: majority quorum, terms, single leader",
          "Leader leases prevent split-brain",
          "etcd/ZooKeeper ship Raft/consensus for you",
          "Leader election + distributed locks",
        ],
        checklist: [
          "Explain why a majority (N/2+1) is required",
          "Describe a leader lease in 2 sentences",
          "Re-deploy: when is running etcd NOT needed?",
        ],
        quiz: [
          {
            question: "A Raft cluster of 5 nodes tolerates how many failures?",
            options: ["5", "3", "2", "1"],
            correct: 2,
            explanation:
              "Quorum = 3 of 5. You lose writes only if ≥3 are down, so 2 failures are safe.",
          },
          {
            question: "What prevents two nodes from both acting as leader (split-brain)?",
            options: [
              "Long timeouts",
              "A leader lease that only the elected node holds and renews",
              "Encryption",
              "Replication lag",
            ],
            correct: 1,
            explanation:
              "The leader holds a renewable lease; a candidate can't become leader while a valid lease exists, and a dead leader loses its lease → no two writers.",
          },
        ],
        resources: [
          "The Secret Lives of Data — Raft visualized",
          "etcd Raft implementation docs",
          "ZooKeeper recipes — leader election & locks",
        ],
      },
      {
        slug: "idempotency-exactly-once",
        title: "Idempotency, Duplicates & Exactly-Once Dreams",
        summary:
          "Retries are inevitable; duplicates are the consequence. Learn idempotency keys, dedup, and the pragmatic path to exactly-once.",
        durationMin: 15,
        content: `Any network can retry, and retries produce **duplicates**. Payments charge a card twice. Notifications alert twice. This lesson prevents production nightmares.

## The core idea: idempotency
An operation is **idempotent** if executing it N times = executing it once.
- HTTP: \`PUT/PATCH\` (set state) are naturally idempotent; \`POST\` (create) is not.
- Make it idempotent: \`PUT /orders/42/cancel\`, or include a client-generated **Idempotency-Key**.

## The idempotency-key pattern (Stripe-style)
1. Client generates a unique key per logical operation (\`UUID\`).
2. Server stores \`key → response\` (Redis with TTL) before processing.
3. Duplicate request with same key → return stored response, don't reprocess.
4. First-time only → process + store result atomically (single-flight lock).

## Dedup in pipelines
- Kafka consumers: store processed message IDs (DynamoDB/Redis set with TTL). Skip if seen.
- Windowed dedup (5-min window) covers nearly all practical duplicates.

## Why "exactly-once" is an illusion
True cross-system exactly-once requires **distributed transactions + agreement on what "processed" means** — coordination is expensive. 
The pragmatic engine: **at-least-once delivery + idempotent consumers ≈ exactly-once**, at a fraction of the cost.

## The interview payoff
"Payments: every charge carries an idempotency key checked in a Redis lock that expires in 24h. Consumers are idempotent, so upstream dedup and retries are harmless."

## Golden rule
> Design your **consumers and endpoints** to be idempotent FIRST. Dedup is a safety net, not a substitute.`,
        keyConcepts: [
          "Idempotency: N executions = 1 execution",
          "Idempotency-Key header + stored response",
          "Single-flight to avoid double-processing",
          "Consumer dedup by processed-ID set",
          "At-least-once + idempotent ≈ exactly-once",
        ],
        checklist: [
          "Design an idempotent payment endpoint in pseudocode",
          "Describe how to dedupe a Kafka consumer",
          "Explain why EXACTLY-once is impractical cross-system",
        ],
        quiz: [
          {
            question: "How does the Idempotency-Key pattern avoid double-charging on retry?",
            options: [
              "It blocks all retries",
              "The key→response is stored; duplicates return the stored result without reprocessing",
              "It encrypts the card",
              "It disables the API",
            ],
            correct: 1,
            explanation:
              "Store key→response (Redis, TTL). A retry with the same key returns the memoized result instead of re-charging.",
          },
          {
            question: "The pragmatic path to 'exactly-once' behavior is:",
            options: [
              "Two-phase commit everywhere",
              "At-least-once delivery + idempotent consumers",
              "Disable retries",
              "Synchronous writes only",
            ],
            correct: 1,
            explanation:
              "Dedupe at the consumer + idempotent endpoints give exactly-once behavior without distributed transaction cost.",
          },
        ],
        resources: [
          "Stripe idempotency docs",
          "AWS — idempotent API design",
          "Kafka — transactional vs idempotent producers",
        ],
      },
      {
        slug: "microservices-vs-monolith",
        title: "Microservices vs Monolith: Honest Trade-offs",
        summary:
          "Modular monoliths, service boundaries, API gateways, and the org-chart reality (Conway's Law) behind service decomposition.",
        durationMin: 16,
        content: `Microservices are a **fashionable liability**. Know exactly when they earn their keep.

## Monolith (start here)
- One deployable; shared memory, one DB, easy transactionality.
- Great until team size & codebase demand isolation.
- **Modular monolith**: internal modules with strict interfaces, one deployable — captures 80% of microservice benefits without ops pain.

## Microservices
- Each service: independent deploy, scale, team ownership, tech stack.
- **Costs**: network failures, distributed transactions (sagas), observability, contract versioning, DevOps per service.
- Worth it when: > ~2–3 teams on one deployment, wildly different scale/isolation needs, or strict compliance per domain.

## Finding boundaries (bounded contexts)
- By business capability + ownership (Conway's Law: architecture mirrors org).
- Events/data ownership over shared "utility" every service needs.
- Split by rate of change & failure isolation (payments isolated from analytics).

## API Gateway
A single entry that: routes, authenticates, rate-limits, and aggregates.
Why: services stay internal; contract is centralized; edge concerns centralized.

## Saga pattern (distributed transactions)
Choreography (each service listens & acts) vs Orchestration (a coordinator drives).
Either way: each step commits locally + compensating actions roll back.

## Interview position
> "I'd design a modular monolith with a clean domain-layer split. If scale demands it, the payments and feed domains become services — driven by team structure and the rate-of-change difference, not by fashion."

## Red flags
- Microservices sharing a single DB model (that's just a monolith with extra steps).
- Splitting to make deployment "easier" when orchestrating is hard.`,
        keyConcepts: [
          "Modular monolith as the pragmatic default",
          "Bounded contexts & Conway's Law",
          "API gateway pattern",
          "Saga vs 2PC for cross-service transactions",
          "Microservices = operational tax, pay only when earned",
        ],
        checklist: [
          "Argue for a modular monolith for a 3-team product",
          "Draw 3 bounded contexts and their data ownership",
          "Design an orchestrated saga for checkout",
        ],
        quiz: [
          {
            question: "Two services sharing one database schema is...",
            options: [
              "Good engineering",
              "A monolith with extra network calls",
              "Event sourcing",
              "Edge computing",
            ],
            correct: 1,
            explanation:
              "Shared-state coupling defeats service autonomy — you get monolith coupling plus microservice latency.",
          },
          {
            question: "When do microservices genuinely pay off?",
            options: [
              "Any project over 10k LOC",
              "Multiple teams needing independent deploy/scale + differing isolation needs",
              "Whenever the CTO wants them",
              "To avoid writing SQL joins",
            ],
            correct: 1,
            explanation:
              "Independent deploy/scale and team ownership matter when the org and load justify it — not before.",
          },
        ],
        resources: [
          "Martin Fowler — Microservices / Modular Monolith",
          "Amazon's NowCreate (API gateway) essays",
          "Chris Richardson — microservices.io sagas",
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // SECTION 4 — SCALING & REAL-WORLD PATTERNS (Intermediate)
  // ─────────────────────────────────────────────────────────────────────────────
  {
    slug: "scaling",
    title: "Scaling & Real-World Patterns",
    level: "Intermediate",
    icon: "📈",
    description:
      "Rate limiting, CDN & edge, observability, and the operational patterns that make systems fast, safe, and runnable in production.",
    order: 4,
    lessons: [
      {
        slug: "rate-limiting",
        title: "Rate Limiting, from Token Buckets to Distributed Counters",
        summary:
          "Fixed window, sliding window, token bucket, and how to rate-limit across regions without killing latency.",
        durationMin: 18,
        content: `Rate limiting protects your service from abuse, runaway clients, and cascading overload.

## Algorithms (know all four + trade-offs)
1. **Fixed window counter** — count per minute; resets at boundary. Cheap, but burst at the seam allows 2× traffic.
2. **Sliding window log** — keep timestamps; sum over last N sec. Precise, memory-heavy.
3. **Sliding window counter** (Redis) — weighted blend of previous+current windows. ≈ sliding log at tiny memory. **Industry sweet spot.**
4. **Token bucket** — bucket refills at r tokens/s, capacity b. Allows controlled bursts up to b; the classic for traffic shaping (also Leaky bucket for smoothing).

## Where to enforce
- **Edge/WAF (Cloudflare)** — first line, per IP globally.
- **API gateway / sidecar (Envoy gRPC-RLS)** — per API key/user.
- **Application layer** — business rules.

## Distributed rate limiting (the hard part)
Naive: every request hits shared Redis → 1–4ms added latency + Redis pressure.
**Two-tier:**
- Local token cache per node (e.g. 90% of requests served locally).
- Periodically sync counts to Redis; on burst, check remote.
- Fail-open vs fail-closed policy (rate limiter must not kill traffic).

## The interview flow
> "Per-user token bucket (refill 1/s, burst 5) enforced in an Envoy sidecar with a local cache tier synced to Redis every 200ms. Edge layer adds a coarser per-IP cap. If Redis fails → fail-open with a local circuit breaker."

## Numbers
Redis Lua EVALSHA for atomic ops is the standard trick for correctness.`,
        keyConcepts: [
          "Fixed window / sliding window / token bucket",
          "Sliding window counter = precision + memory win",
          "Two-tier local+remote enforcement",
          "Fail-open vs fail-closed",
          "Redis Lua for atomic counters",
        ],
        checklist: [
          "Implement token bucket math by hand (rate 5/s, burst 10)",
          "Design distributed rate limiting for 1M RPS",
          "Decide fail-open vs fail-closed for: payments API, metrics API",
        ],
        quiz: [
          {
            question: "Which algorithm allows smooth short bursts up to a cap?",
            options: [
              "Fixed window counter",
              "Token bucket",
              "Sliding window log",
              "Leaky bucket",
            ],
            correct: 1,
            explanation:
              "Token bucket refills at a steady rate and allows bursts up to bucket capacity — ideal for traffic shaping.",
          },
          {
            question: "Why a local cache tier in distributed rate limiting?",
            options: [
              "To bypass all limits",
              "To avoid a Redis round-trip on ~90% of requests, syncing counts in batches",
              "To increase memory",
              "To eliminate latencies completely",
            ],
            correct: 1,
            explanation:
              "Per-node local counting + periodic Redis sync gives accurate-enough global limits at a fraction of the Redis traffic.",
          },
        ],
        resources: [
          "Envoy gRPC rate-limit docs",
          "Cloudflare — how we rate limit at the edge",
          "AWS — API Gateway throttling semantics",
        ],
      },
      {
        slug: "cdn-edge-computing",
        title: "CDN, Edge & Cache Hierarchies at Scale",
        summary:
          "Origin shields, stale-while-revalidate, cache eviction, and edge computing — the layers that keep p99 latencies under 50ms.",
        durationMin: 16,
        content: `Your CDN is more than "cache static files". A well-tuned edge is the difference between 300ms and 30ms global latency.

## Cache hierarchy
\`Client → Edge PoP → Origin Shield → Origin → (DB/cache)\`
- **Edge**: 300+ PoPs nearest users.
- **Origin shield**: a single high-capacity layer between edges and origin; collapses edge misses into ONE origin fetch (thundering-herd guard).

## Cache-control engineering
- Long TTL + **stale-while-revalidate**: serve stale instantly, refresh in background.
- **stale-if-error**: serve stale when origin errors (keeps the site up).
- Purge on deploy; versioned URLs (\`/v1/app.js\`) for permanent caching.

## Cache invalidation reality
There are two hard problems: naming things and invalidating caches. 
Prefer: **versioned/immutable keys** (content-addressed) + short TTLs for mutable content.

## Eviction & admission
- LRU for "recently hot"; LFU for stable popularity. Most CDNs: LRU tuned.
- Admission control on large objects (huge files evict everything).

## Edge compute (Cloudflare Workers / CloudFront Functions)
- Move **traffic-shaping logic to the edge**: auth-check, A/B flag, geo-rewrite, request coalescing.
- Low-latency, vendor-locked, limited compute — use for request-path logic only.

## Interview numbers
- Static assets via CDN: **p99 < 50ms** globally.
- Dynamic API via edge caches + stale-while-revalidate: p99 < 100ms.`,
        keyConcepts: [
          "Edge → origin shield → origin cache hierarchy",
          "stale-while-revalidate & stale-if-error",
          "Immutable/versioned cache keys",
          "LRU vs LFU eviction; admission control",
          "Edge compute for request-path logic",
        ],
        checklist: [
          "Draw the full cache hierarchy",
          "Describe what an origin shield protects against",
          "Explain stale-while-revalidate with an example",
        ],
        quiz: [
          {
            question: "What is an origin shield's main job?",
            options: [
              "Encrypting traffic",
              "Collapsing many edge misses into a single origin fetch",
              "Serving video streams",
              "Running business logic",
            ],
            correct: 1,
            explanation:
              "When many edges miss simultaneously, the shield makes one origin request instead of hundreds — protecting origin from stampedes.",
          },
          {
            question: "Which header pattern serves stale content while refreshing in the background?",
            options: [
              "Cache-Control: no-store",
              "Cache-Control: max-age=60, stale-while-revalidate=86400",
              "ETag: *",
              "Connection: keep-alive",
            ],
            correct: 1,
            explanation:
              "stale-while-revalidate lets the CDN serve the cached copy for up to 86,400s while it revalidates asynchronously.",
          },
        ],
        resources: [
          "Cloudflare — origin shield & cache hierarchy",
          "Fastly — stale-while-revalidate",
          "Google — HTTP caching guide",
        ],
      },
      {
        slug: "observability",
        title: "Observability: Logs, Metrics & Distributed Tracing",
        summary:
          "The three pillars, cardinality traps, sampling, and why you cannot debug a distributed system without tracing.",
        durationMin: 16,
        content: `In a monolith you log and debug. In a distributed system you need **structured, correlatable telemetry** — observability.

## The three pillars
1. **Metrics** — numeric time-series (RPS, latency histogram, error rate, saturation). Prometheus + Grafana; RED method (Rate, Errors, Duration) or USE (Utilization, Saturation, Errors).
2. **Logs** — event records with context (request ID, service, timestamp). Centralized (ELK/Loki) + structured JSON.
3. **Traces** — a request's journey across services: spans, parent/child IDs, latency per hop. OpenTelemetry + Jaeger/DataDog.

## The money metric: percentiles
- **p99** reveals tail latency users actually feel.
- Average hides 90% of the story: "avg 5ms" while p99 is 800ms.
- Track p50, p95, p99, max.

## Cardinality trap
> Tagging a metric by user_id → millions of series → Prometheus dies.
Keep cardinality bounded: tag by service, instance, status; **not** per-user/per-request.

## Sampling
- Head-based sampling (decide at entry): <1% of all traffic.
- **Tail-based sampling**: keep the important 1% (errors, slow spans) regardless of where they start — use for high-traffic production.

## Correlation ID
Every request gets a \`trace_id\`/\`request_id passed via header; every log line includes it → searching one ID across all services reconstructs the whole story.

## SLO & error budget
- SLO: "p99 latency < 250ms for 99.9% of requests".
- Error budget: allowed failures = 0.1%; burning through it → freeze risky releases.
- Link SLOs to on-call dashboards.

## Interview line
> "Every request carries a correlation ID; spans export via OpenTelemetry; dashboards track p50/p95/p99 and error rate per service; sampling keeps cost bounded."`,
        keyConcepts: [
          "Metrics / logs / traces = three pillars",
          "RED & USE methods",
          "p99 tail latency awareness",
          "Bounded cardinality in tags",
          "Tail-based sampling + correlation IDs",
        ],
        checklist: [
          "Define an SLO and its error budget",
          "Explain why per-user metric tags are dangerous",
          "Trace a checkout across 4 services in your head",
        ],
        quiz: [
          {
            question: "Why track p99 instead of average latency?",
            options: [
              "It's simpler",
              "Averages hide the tail latency users actually feel",
              "p99 is always lower",
              "Metrics tools only support p99",
            ],
            correct: 1,
            explanation:
              "Most requests are fast; the average hides painful outliers. p99 shows what the worst-case user experiences.",
          },
          {
            question: "What does tail-based sampling preserve?",
            options: [
              "Random request traces",
              "The most informative traces (errors & slow) regardless of start point",
              "All traces",
              "Only the first span",
            ],
            correct: 1,
            explanation:
              "Decision happens after the trace completes, keeping error/slow traces — high-value at low cost.",
          },
        ],
        resources: [
          "OpenTelemetry concepts",
          "Google SRE book — monitoring",
          "Prometheus docs — cardinality",
        ],
      },
      {
        slug: "bloom-filters-counters",
        title: "Probabilistic Data Structures: Bloom Filters, HyperLogLog",
        summary:
          "Answer 'have I seen this before?' and 'how many unique things?' across billions of items using almost no memory.",
        durationMin: 14,
        content: `Sometimes you don't need exact answers — you need **cheap and small** answers. Probability + clever hashing = enormous memory savings.

## Bloom filter — "maybe seen" with 0% false negatives
- Purpose: is item X in set S? (false "yes" possible, false "no" impossible).
- How: k hash functions set k bits in a m-bit array. Check all k bits.
- Trade-off: false-positive rate p drops as bits/hash count grow.
- Capacity ~10 bits per item for p≈1%.

### Uses
- **Cache stampede guard**: 'check bloom filter before DB hit' — skip DB if definitely unseen.
- **Disallow lists**: blocked usernames/emails.
- **Deduplication**: seen-message-IDs in Cassandra (Cassandra uses bloom filters internally!).
- **SQLite indexing**, **Google BigTable** row lookups.

## HyperLogLog — cardinality in ~1.5KB
- "How many **unique** visitors?" over billions — exact counting is too heavy.
- Error ≈ 1.04/√m (m=2^14 registers). ~1.5KB for 0.8% error.
- Used by Redis (PFADD/PFCOUNT), BigQuery, Postgres (maybe you know \`HLL\` extension).

## Count-Min Sketch — heavy hitters
- "Which keys are the biggest / how often does X appear" with bounded error.
- Used for: top-N queries, event counting without per-key counters.

## Ruler of thumb
Estimated structures are **one-directional reductions**: Bloom = tiny but maybe-FP; HLL = tiny but ±% error. Always tune with target error rates and document the trade-off.

## Interview nugget
> "Dedupe inbound webhook IDs with a 10-bit-per-item bloom filter; if it says 'miss' (they're new) we insert; if 'maybe seen', we check the exact ID index. Cuts lookups 40×."
`,
        keyConcepts: [
          "Bloom: false positives yes, false negatives no",
          "10 bits/item → ~1% false positive",
          "HyperLogLog ≈ 1.5KB for unique counting",
          "Count-Min sketch for heavy hitters",
          "Tune error rates explicitly",
        ],
        checklist: [
          "Design an anti-scrape dedup with a bloom filter",
          "Count unique visitors over a year with HLL",
          "Explain when exact counting is still required",
        ],
        quiz: [
          {
            question: "A bloom filter can return...",
            options: [
              "false negatives, never false positives",
              "false positives, never false negatives",
              "both false positives and negatives",
              "exact membership for all items",
            ],
            correct: 1,
            explanation:
              "Hash collisions set shared bits → 'maybe seen' (FP) is possible; a miss proves absence (no FN).",
          },
          {
            question: "Best structure to count UNIQUE visitors over massive streams?",
            options: ["Exact per-user counters", "HyperLogLog", "Bloom filter", "Count-Min sketch"],
            correct: 1,
            explanation:
              "HLL estimates cardinality using ~1.5KB total regardless of input size — exact counting is infeasible at stream scale.",
          },
        ],
        resources: [
          "Bloom filter visualizer",
          "Redis — HLL PFCOUNT docs",
          "Cormode et al. — Count-Min Sketch paper",
        ],
      },
      {
        slug: "api-gateway-auth",
        title: "API Gateway, AuthN/AuthZ & Zero-Trust Design",
        summary:
          "Centralize edge concerns: routing, authn (JWT/session), authz (RBAC), and how tokens flow end-to-end securely.",
        durationMin: 15,
        content: `The **API gateway** is your system's front door. Getting it right centralizes 80% of security and routing concerns.

## Gateway responsibilities
- Routing / versioning strategies
- **Authentication**: who is calling?
- **Authorization**: what can they do?
- Rate limiting & quotas, request validation, response aggregation, TLS termination.

## Authentication basics
- **Session cookie + session store**: server-side state; easy revocation.
- **JWT**: stateless; verified offline with signature; **hard to revoke** → short expiry + refresh tokens.
- OAuth2/OIDC for third-party (Google/GitHub login).

## Token flow (JWT)
1. Client logs in → gets \`access_token\` (15 min) + \`refresh_token\` (30 days).
2. Every request carries \`Authorization: Bearer <token>\`.
3. Gateway verifies signature + expiry → forwards identity/claims.
4. Refresh flow: access expired → post refresh token → new access token; refresh token rotates + revoked on reuse (reuse detection).

## Zero-trust mindset
- Each service re-verifies caller claims (no implicit trust hop-to-hop).
- **mTLS** between services for transport auth.
- Tokens contain **scope**, not "is admin" boolean.

## AuthZ: RBAC / ABAC
- **RBAC**: role → permissions (ADMIN/DEVELOPER/STUDENT) — simple, coarse.
- **ABAC**: policies over attributes (resource owner, region, time) — flexible, for enterprise.

## Common mistakes to name
- JWT holding sensitive PII (it's base64-readable!) — keep it to identity + claims.
- No revocation path for leaked tokens.
- Global secret rotation for all services when one service is compromised (key-per-service).

## Interview one-liner
> "Gateway terminates TLS, verifies JWT signature, injects identity claims into headers; services enforce RBAC scopes from those claims; mTLS for service-to-service."`,
        keyConcepts: [
          "API gateway as edge security boundary",
          "JWT (stateless) vs session (revocable)",
          "Short access + rotating refresh tokens",
          "RBAC vs ABAC",
          "Zero-trust & mTLS between services",
        ],
        checklist: [
          "Draw the token lifecycle end-to-end",
          "Explain why JWTs can't be instantly revoked",
          "Design RBAC for a coding platform (student/dev/admin)",
        ],
        quiz: [
          {
            question: "A main disadvantage of stateless JWTs is...",
            options: [
              "They are slow to verify",
              "They can't be instantly revoked",
              "They can't store identity",
              "They only work with sessions",
            ],
            correct: 1,
            explanation:
              "Signature verification is fast, but a leaked token stays valid until expiry — use short TTLs + refresh rotation.",
          },
          {
            question: "Zero-trust means...",
            options: [
              "Blocking all users",
              "Every request is verified regardless of the network hop it arrived from",
              "Encrypting the database",
              "Logging in once per day",
            ],
            correct: 1,
            explanation:
              "No implicit trust between services — fore to gating: authenticate/authorize every call, with mTLS transport security.",
          },
        ],
        resources: [
          "OAuth 2.0 security best practices (IETF)",
          "Kong / Envoy gateway docs",
          "Auth0 — common JWT pitfalls",
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // SECTION 5 — RELIABILITY, RESILIENCE & OBSERVABILITY (Advanced)
  // ─────────────────────────────────────────────────────────────────────────────
  {
    slug: "reliability",
    title: "Reliability & Resilience Engineering",
    level: "Advanced",
    icon: "🛡️",
    description:
      "Chaos engineering, circuit breakers, retries, backpressure, and designing for failure — because production WILL fail.",
    order: 5,
    lessons: [
      {
        slug: "fault-tolerance-patterns",
        title: "Fault Tolerance Toolkit: Retries, Backoff, Circuit Breakers",
        summary:
          "The three-layer defense (retry → backoff → circuit breaker) and the cascade of pain each one prevents.",
        durationMin: 18,
        content: `Failures are **expected**. The toolkit below turns "one dead service takes down the app" into "one dead service is invisible to users".

## 1. Retries (with limits)
- Transient failures (timeout, 503) → retry.
- 3 attempts max; **exponential backoff** (1s, 2s, 4s).
- **Jitter** (random ±) so retries don't sync up and storm the service.

## 2. Timeouts first!
A call without a timeout hangs forever → thread pool exhaustion → whole app degraded. Always: connect timeout + total timeout.
- **Fined grained**: seek help — separate per-dependent-timeout.

## 3. Circuit breaker
- After N failures in a window → **open**: fail fast, don't call the dead service.
- After cooldown → **half-open**: allow a test request; success closes, failure reopens.
- States: CLOSED (normal) → OPEN (fail fast) → HALF-OPEN (probing).

## 4. Bulkhead (isolation)
Partition resources per dependency: "payments calls get 20 threads; analytics calls get 5". One slow dependency can't starve the other.

## 5. Fallbacks
- Cache fallback: serve last-good response.
- Degrade: show read-only mode.
- Null/mock response for non-critical enrichment.

## The failure cascade you're preventing
Service A retries hard → B overwhelmed → B's timeouts grow → C (calling B) also hangs → pool exhaustion → regional outage. **Retries + breaker + bulkhead break the loop.**

## Interview skeleton
> "Every outbound call has a connect+total timeout, exponential backoff with jitter, max 3 attempts, a circuit breaker (5 failures/30s window → open 60s), bulkhead thread pools per dependency, and a stale-cache fallback."`,
        keyConcepts: [
          "Timeouts before retries",
          "Exponential backoff + jitter",
          "Circuit breaker states (closed/open/half-open)",
          "Bulkheads prevent cascade starvation",
          "Fallback: stale cache / degrade",
        ],
        checklist: [
          "Write retry+backoff+jitter pseudocode",
          "State breaker thresholds for a 95th-percentile-dependent service",
          "Design a bulkhead split for checkout vs catalog calls",
        ],
        quiz: [
          {
            question: "What is jitter used for in retry/backoff?",
            options: [
              "Making retries faster",
              "Randomizing backoff so retries don't synchronize and storm a service",
              "Increasing reliability",
              "Signaling HTTP 429",
            ],
            correct: 1,
            explanation:
              "Without jitter, N clients back off in lockstep and hit the service simultaneously. Randomize to desynchronize.",
          },
          {
            question: "In HALF-OPEN, the breaker...",
            options: [
              "blocks all traffic",
              "allows a probe request to test recovery",
              "accepts all traffic",
              "resets counters",
            ],
            correct: 1,
            explanation:
              "Half-open sends limited test traffic; success closes the breaker, failure reopens it.",
          },
        ],
        resources: [
          "Netflix — Hystrix patterns",
          "Martin Fowler — CircuitBreaker",
          "AWS — error handling & retries guide",
        ],
      },
      {
        slug: "backpressure-and-load-shedding",
        title: "Backpressure, Load Shedding & Overload Control",
        summary:
          "What happens when demand exceeds capacity — and the graceful degradation techniques that keep core features alive.",
        durationMin: 15,
        content: `Every system eventually receives more requests than it can serve. The winners **degraded gracefully**; the losers collapse entirely.

## The failure mode without control
Queues grow unbounded → memory blows → latency explodes → threads exhaust → ALL requests fail (not just the excess).

## Backpressure
Propagate "I'm full, slow down" upstream instead of buffering forever:
- **Bounded queues** with rejection (TCP-style: accept, but if full → reject early).
- Producer slows when consumer ACKs (e.g., windowed flow control in gRPC).

## Load shedding (drop the least valuable)
When at capacity, **fail cheaply and early** before work is done:
- Return 503 with **Retry-After** instead of queueing.
- Drop non-critical traffic (analytics, recommendations, mobile-sync) first.
- **Priority traffic**: payments/auth must survive; nice-to-have can die.

## Concurrency limiting
- Semaphore/bulkhead per operation (we saw this).
- **Utilization-based limiting** (like Netflix Concurrency Limits): if latency-controller says inflight > threshold → reject fast.

## The classic: queue depth → capacity math
Keep-alive servers: queue = arrival rate × wait time budget. At 95% utilization, tiny arrival spikes explode latency (Little's Law).

## Interview nugget
> "I'd put a small bounded queue between the LB and app; when the queue is full we return 503 + Retry-After immediately. Critical path (checkout) has priority lanes; analytics traffic is shed first."`,
        keyConcepts: [
          "Unbounded queues = collapse amplifier",
          "Bounded queues + early rejection",
          "Priority lanes for critical traffic",
          "Load shedding the non-critical",
          "Little's Law: queue ∝ arrival × service time (budget walls)",
        ],
        checklist: [
          "Compute max queue depth for 5s wait budget at 1000 rps",
          "Prioritize: what gets shed during Kafka back-pressure?",
          "Explain why unbounded buffers are dangerous",
        ],
        quiz: [
          {
            question: "What happens with an unbounded queue under sustained overload?",
            options: [
              "Only excess requests fail",
              "Memory/latency grows until the whole service collapses",
              "Requests auto-drop",
              "Nothing — queues are safe",
            ],
            correct: 1,
            explanation:
              "Unbounded buffering burns memory and latency until all requests — including processed ones — fail.",
          },
          {
            question: "Best response when at capacity?",
            options: [
              "Queue all excess requests",
              "Reject quickly with 503 + Retry-After, shedding low-priority traffic",
              "Increase timeouts",
              "Retry in a loop",
            ],
            correct: 1,
            explanation:
              "Fail fast and preserve capacity for high-priority traffic; retries amplify the disaster.",
          },
        ],
        resources: [
          "Netflix technology blog — concurrency limits",
          "The Tail at Scale (Dean & Barroso)",
          "Little's Law intuition articles",
        ],
      },
      {
        slug: "chaos-engineering",
        title: "Chaos Engineering: Breaking Things On Purpose",
        summary:
          "Test your assumptions before production tests them for you — game days, fault injection, and the blast-radius principle.",
        durationMin: 14,
        content: `Chaos engineering = **deliberately** introducing failure in a controlled way to prove (or disprove) that your system survives it.

## The principle: our faith in reliability is often unearned
Restarts, region outages, DNS failures, degraded disks — production finds them all eventually. Chaos lets you find them first, safely.

## Core practices
1. **Game days**: rehearse responses to disasters (runbook drills) with teams.
2. **Fault injection**: kill a node, pause a process, delay network, saturate a disk, expire all cache.
3. **Blast radius**: start small (1 node) → observe → expand. Never fire into prod unannounced.
4. **Probe-driven**: verify the *observability* and *automated remediation* actually work, not just "the app survived".

## Golden signals to watch during an experiment
- Error rate (should stay bounded)
- p99 latency (should stay within SLO)
- Saturation (should reclaim)

## Famous origin: Netflix Chaos Monkey (2011)
Randomly terminated EC2 instances in prod to force auto-scaling + resilience. Follow-ups: Chaos Kong (region failover), Latency Monkey (EC2/EBS latency).

## Maturity ladder
1. Ad-hoc restart drills
2. Scheduled basic fault injection (1 node)
3. Automated, weekly, CD-integrated experiments
4. Proactive testing of every SLO-critical path

## Interview framing
> "I'd run weekly game days with graded experiments — day 1 impose a db_primary failover and observe error budget burn; each experiment has rollback triggers and alerting pre-armed."\`
        keyConcepts: [
          "Chaos = controlled, deliberate failure",
          "Blast radius discipline (small → large)",
          "Game days & runbook rehearsal",
          "Golden signals during experiments",
          "Chaos Monkey → Chaos Kong lineage",
        ],
        checklist: [
          "Design a safe experiment for cache stress in 3 steps",
          "List 5 ways a single service can fail",
          "Rewrite your disaster runbook for one scenario",
        ],
        quiz: [
          {
            question: "The first rule of chaos engineering experiments is...",
            options: [
              "Shut down a whole region",
              "Control the blast radius (start small, monitor, expand)",
              "Do it without notice",
              "Use production creds",
            ],
            correct: 1,
            explanation:
              "Start with one node, verify your observability detects it and remediation triggers, then scale carefully.",
          },
          {
            question: "Chaos experiments mainly validate...",
            options: [
              "Code style",
              "Reliability assumptions, observability, and automated failover",
              "Database indexes",
              "UI design",
            ],
            correct: 1,
            explanation:
              "You're testing that your assumptions about failure survival hold and that monitoring + automation actually respond.",
          },
        ],
        resources: [
          "Principles of Chaos Engineering (CNCF)",
          "Netflix TechBlog — Chaos Monkey history",
          "Gremlin education center",
        ],
      },
      {
        slug: "event-driven-architectures",
        title: "Event-Driven Architectures & Streaming Pipelines",
        summary:
          "Event sourcing, outbox pattern, CQRS, and stream processing — the modern backbone for real-time products.",
        durationMin: 18,
        content: \`Event-driven = state changes are published as **events**; other parts of the system react. This decouples producers from consumers and powers real-time features.

## Core patterns
### Event sourcing
- Store facts (events), not mutable state. Reconstruct state by replaying.
- Benefit: perfect audit trail, time-travel, replayable pipelines.
- Cost: maybe-overkill for simple CRUD; snapshotting + read models needed.

### Transactional Outbox
- Write DB row + event to an **outbox table in the SAME transaction**.
- A relay (Debezium CDC or poller) publishes outbox rows to Kafka.
- **Result:** DB commit and event publish are atomic — no "DB updated but event lost" bug. This is THE pattern for reliable event-driven writes.

### CQRS
- Separate write model (commands) from read model (projections).
- Write model: normalized/core; read model: denormalized for queries.
- Connect via events; read model can be a different store (search index), eventually consistent.

## Stream processing
- Kafka Streams / Flink: windowed aggregations (count/heatmap/rolling), exactly-once stateful flows.
- Use for: anomaly/fraud, live metrics, ML feature computation.

## Fan-out & consumers
One event → notifications service, search indexer, analytics, ML — independent consumer groups.

## Pitfalls
- **Schlep blindness**: events are schemas too — version them (\`v1\`/\`v2\`) and evolve with a registry.
- Removing gapless ordering needs partitions by key (per-key ordering only).
- Event size bloat → keep events references (IDs), not payload dumps.

## Interview answer
> "Writes: single DB transaction inserts order + outbox row. CDC relay publishes to Kafka. Downstream (notification, search, ledger) consume the retained log and maintain their own projections."`,
        keyConcepts: [
          "Transactional outbox = atomic DB + event",
          "CQRS: separate read/write models connected by events",
          "Event sourcing with replay & snapshots",
          "Stream processing (Kafka Streams/Flink)",
          "Event schema versioning",
        ],
        checklist: [
          "Draw the outbox pattern for an order system",
          "Explain CQRS benefits for a reporting-heavy feature",
          "Describe per-key ordering guarantees in Kafka",
        ],
        quiz: [
          {
            question: "The outbox pattern guarantees...",
            options: [
              "Faster reads",
              "The DB write and event publish are atomic (no lost events)",
              "No replication lag",
              "Strong consistency for all",
            ],
            correct: 1,
            explanation:
              "Row + outbox row commit together; a relay publishes events — so a committed change always yields an event exactly once.",
          },
          {
            question: "Why use CQRS for a search-heavy feature?",
            options: [
              "It removes the need for a database",
              "Read model (denormalized/search) is optimized independently of write model",
              "It's required for Kafka",
              "It prevents all bugs",
            ],
            correct: 1,
            explanation:
              "CQRS lets you maintain a purpose-built read model (e.g. Elasticsearch) that the write side updates via events.",
          },
        ],
        resources: [
          "Microservices.io — transactional outbox",
          "Martin Fowler — CQRS",
          "Confluent — event sourcing + outbox",
        ],
      },
      {
        slug: "distributed-transactions-saga",
        title: "Distributed Transactions: Sagas vs 2PC"
,        summary:
          "When a single transaction crosses services, how do you keep atomicity? Saga vs 2PC, with the failure-recovery mechanics.",
        durationMin: 16,
        content: `ACID transactions assume one database. Distributed systems need **distributed atomicity**. Two main tools:

## 2PC (Two-Phase Commit)
- Coordinator: "prepare?" → all participants lock + ready → "commit!".
- Guarantee: all-or-nothing; strong.
- Cost: **blocking** on failures (participants hold locks while waiting), coordinator = SPOF, poor availability.
- Modern: Google Spanner (Paxos-backed 2PC with leases). Practical only where you control the stack.

## Saga (the pragmatic standard)
- A long-lived transaction as a sequence of **local transactions** with compensating actions.
- **Choreography**: each service, after its step, publishes an event the next listens to. No central brain. Simple, but hard to track/monitor.
- **Orchestration**: a coordinator invokes steps and compensations explicitly. Easier to trace and test. Recommended default.

Example (checkout):
- Reserve inventory → Charge payment → ... failure at charge → compensate: release inventory → notify user of retry.

## Compensation examples
- Reserve inventory → **release** inventory.
- Charge payment → **refund**.
- Create shipment → **cancel**.
- Compensations must be idempotent + retryable themselves.

## When you don't need a saga
Keep the **transaction local**: put closely-coupled state in the same service/DB. Splitting money & inventory and paying saga cost — when a single-table transaction suffices — is an anti-pattern you should call out in interviews.

## Interview answer
> "Order flow: I use an orchestrated saga in Temporal — each step is a local transaction with an idempotent compensating action, driven by a coordinator with retries and audit log. I keep states that must be strongly consistent in one service/Db." `,
        keyConcepts: [
          "2PC: strong but blocking, availability-costly",
          "Saga = local transactions + compensations",
          "Choreography vs orchestration",
          "Idempotent, retryable compensations",
          "Prefer LOCAL transactions where possible",
        ],
        checklist: [
          "Design an orchestrated saga for 'order with payment + fulfillment'",
          "List compensating actions for each step",
          "Explain when to reject a saga for a local transaction",
        ],
        quiz: [
          {
            question: "2PC's biggest weakness is...",
            options: [
              "Speed of prepared statements",
              "Blocking on failures + coordinator SPOF",
              "Lack of indexes",
              "No encryption",
            ],
            correct: 1,
            explanation:
              "Participants block while waiting for commit; if the coordinator fails mid-transaction, locks hold → availability suffers.",
          },
          {
            question: "In a saga, a failure's recovery mechanism is...",
            options: [
              "Rollback via undoing uncommitted logs",
              "Running compensating transactions for completed steps",
              "Restarting the whole flow",
              "Ignoring previous steps",
            ],
            correct: 1,
            explanation:
              "Completed steps are undone with compensating actions (release inventory, refund) — there is no global rollback.",
          },
        ],
        resources: [
          "microservices.io — saga pattern",
          "Temporal.io — saga workflow docs",
          "Google Spanner — 2PC in production",
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // SECTION 6 — DEEP-DIVE CASE STUDIES (Advanced)
  // ─────────────────────────────────────────────────────────────────────────────
  {
    slug: "case-studies",
    title: "Deep-Dive Case Studies",
    level: "Advanced",
    icon: "📚",
    description:
      "Six classic interview problems dissected end-to-end: requirements → estimation → blueprint → deep-dive → trade-offs.",
    order: 6,
    lessons: [
      {
        slug: "url-shortener-casestudy",
        title: "Case Study: URL Shortener (TinyURL)",
        summary:
          "Read-heavy, cache-friendly, and the classic first platform question — fully worked.",
        durationMin: 25,
        content: `**Requirement snapshot:** 100M new links/month, 100:1 read:write, redirect p99 < 20ms.

## Estimation
- Writes: 100M/month ÷ 2.5M s/month ≈ **40 writes/s**.
- Reads: ×100 → **4,000 reads/s**, peak ~12,000/s.
- Storage: 100M rows × ~500B ≈ 50GB/month → **0.6 TB/year**.

## Blueprint
\`Client → CDN/DNS → LB → Redirect(read) | Shorten(write) → Redis cache → Postgres (leader + replicas) → Kafka → Analytics\`

## Key decisions & trade-offs
1. **Short code**: Base62 of a distributed 64-bit ID (Snowflake) → 7 chars ≈ 3.5T combos, no collision, no sequential leak.
2. **301 vs 302**: 301 caches in browser (zero server hits, no analytics) | 302 routes every click through server (analytics). Production: 302 for tracking, or 301 + JS counter.
3. **Cache**: Redis **cache-aside**, top 20% of links = 80% of clicks. Eviction LRU. TTL with stale-while-revalidate.
4. **Write path**: pre-generate ID ranges per instance (Kafka-style counter or ZK lease) so writes never serialize on one insert sequence.

## Deep-dive: redirect service
- Check Redis → miss → check Postgres replica → populate cache → return 302.
- Bloom filter on short codes to avoid pointless DB lookups for nonexistent codes.
- Idempotent creation with **retry on collision** (BASE62 unlikely but handle it).

## Failure & scale notes
- Cache stampede on viral link → single-flight + jittered TTL.
- DB write bottleneck → pre-generated ranges + async reconciliation.
- Analytics: Kafka → ClickHouse for click-stream (never in transaction path).

## Trade-offs to discuss
- 301/302, ID-method, LRU vs LFU (LRU wins for recency-driven links), single vs multi-region (eventual for redirects is fine — stale link is acceptable).

## Template
Switch to the **URL Shortener** template in the Studio and reconstruct this from memory. It's the #1 warmup.`,
        keyConcepts: [
          "40 w/s, 4k r/s, 0.6TB/yr — do the math",
          "Base62 + distributed ID generator",
          "301 vs 302 analytics trade-off",
          "Cache-aside + LRU + bloom filter",
          "Pre-generated write ID ranges",
        ],
        checklist: [
          "Rebuild the full diagram from memory",
          "Explain bloom filter usage in redirect",
          "Argue the 302-over-301 decision",
        ],
        quiz: [
          {
            question: "Why 302 redirects in production URL shorteners (for most links)?",
            options: [
              "Always faster",
              "It routes every click through the server for analytics/caching decisions",
              "Browsers require it",
              "It's easier to implement",
            ],
            correct: 1,
            explanation:
              "302 ensures every click hits your service — enabling click analytics and cache control. 301 bakes the redirect into the browser.",
          },
          {
            question: "How do you avoid write serialization on the short-code sequence?",
            options: [
              "Use MAX(id)+1",
              "Pre-generate ranges of IDs per instance (distributed counter/lease)",
              "Use a UUID for short code",
              "Disable writes",
            ],
            correct: 1,
            explanation:
              "Each instance draws a batch of IDs from a shared counter → parallel, no single-sequence bottleneck.",
          },
        ],
        resources: [
          "Alex Xu — URL shortener design",
          "Grokking — URL shortener section",
          "System Design Primer — TinyURL",
        ],
      },
      {
        slug: "news-feed-casestudy",
        title: "Case Study: News Feed (Instagram/Twitter)",
        summary:
          "The fan-out problem: push vs pull, celebrity users, and feed ranking at 500M daily logins.",
        durationMin: 28,
        content: `**Requirements:** 500M MAU, 200M daily; feed composed of follows' posts, chronologically or ranked; sub-second load.

## Estimation
- 200M DAU × ~10 feed loads/day = 2B feed requests/day ≈ **23K rps** peak ~70K.
- Each feed renders ~20–50 posts w/ media.

## The core problem: fan-out
When user X posts, who gets it? Two extremes:

### Push (fan-out on write)
- On post, write the post reference into every follower's feed list.
- Fast reads (feed = precomputed list read), great for normal users.
- **Celebrity problem:** 100M followers → writing 100M rows per post = unacceptable.

### Pull (fan-out on read)
- On load, query all followed users' recent posts, merge, rank.
- No write explosion; but reads of high-fan-out accounts scan huge lists.

### Hybrid (industry standard)
- **Normal users: PUSH** — precompute feed.
- **Celebrity/super-users: PULL at read time** — merge their posts into the pushed feed.
- Feed core: \`post_id + author_id + timestamp (+ ranking features)\`.

## Storage: the feed store
- **Redis** precomputed per-user feed lists (post IDs) → Pull merge → render.
- Post metadata in object cache (Postgres → cache) 
- Timeline service reads IDs from Redis, hydrates metadata (batched multi-get).

## Ranking & caching
- Chronological = append to list.
- Ranked = score = f(recency, affinity, engagement). Features computed async via ML workers.

## Numbers
- Write path (push): 200 new posts/follower-average → a user with 500 followers causes 500 list-appends. Acceptable.
- Celebrity threshold ~ >50K followers → switch to pull-merge.

## Deep-dive: celebrity read
Load celeb posts (pull) → merge sorted with timeline → rank → paginate. To keep reads fast: cache celeb timelines aggressively (they change less often than views).

## Trade-offs to name
- Push storage cost vs read latency.
- Chronological vs ranked (ranking needs more compute but better engagement).
- Fan-out on write storms → use async workers + Kafka for push.`,
        keyConcepts: [
          "Fan-out on write (push) vs on read (pull)",
          "Hybrid: push normal, pull celebrities",
          "Precomputed feed lists in Redis",
          "Hydrate metadata in batch",
          "Async workers for push fan-out",
        ],
        checklist: [
          "Draw hybrid fan-out for a 60M-follower celebrity",
          "Compute push cost per post for 500-followers user",
          "Explain caching the celebrity timeline",
        ],
        quiz: [
          {
            question: "Why not push to EVERY follower, including celebrities' 100M followers?",
            options: [
              "It's slower for the readers",
              "100M writes per post is impractical — pull/merge those accounts at read time",
              "Celebrities don't post",
              "Pushing is banned",
            ],
            correct: 1,
            explanation:
              "Write amplification scales with follower count; hybrid switches huge accounts to pull so no write storm occurs.",
          },
          {
            question: "Feed hydration reads post metadata for 50 post IDs. Best approach?",
            options: [
              "50 sequential cache gets",
              "One batched multi-get (mget) + fallback to DB",
              "Query DB per post",
              "Embed all metadata in the feed list",
            ],
            correct: 1,
            explanation:
              "Batch reads minimize round-trips; single mget of 50 keys is one network latency instead of 50.",
          },
        ],
        resources: [
          "Huang et al. — Facebook Feed architecture",
          "Twitter Engineering — timeline engineering",
          "Instagram engineering blog",
        ],
      },
      {
        slug: "chat-system-casestudy",
        title: "Case Study: Chat System (WhatsApp-style)",
        summary:
          "WebSockets, presence, message ordering, media, and offline delivery for 2B users.",
        durationMin: 28,
        content: `**Requirements:** 2B users, 65B messages/day, < 100ms delivery, offline queueing, end-to-end encryption.

## Estimation
- 65B messages/day ÷ 86,400 ≈ **750K msg/s** peak ~2M.
- Storage: 65B × 300B ≈ 20TB/day ≈ **7 PB/year** (before media!)

## Blueprint
\`Client → WebSocket gateway cluster → Message service → [Cassandra/Scylla history] | [Redis presence] | [Kafka offline queue] | [S3+CDN media]\`

## Key decisions
1. **Transport**: WebSocket (low latency, persistent) vs long-polling (fallback). Keep persistent connections on **gateways** (stateful pins).
2. **Presence**: Redis hash ring keyed by user_id → last heartbeat + IP shard for routing. Online flag is ephemeral — don't put in the durable DB.
3. **Message ordering**: **per-chat ordering via single partition per chat** in Kafka/Mongo sharded by chat_id. Global ordering is neither needed nor possible.
4. **History store**: wide-column (Cassandra) partitioning by chat_id + time → horizontal writes, fast range reads, LSM-friendly.
5. **Offline delivery**: each connection queue in Kafka; when user reconnects, drain & deliver (idempotent dedup by message_id via redis set).

## Encryption note
End-to-end encrypted means the server never sees plaintext — ordering & delivery still work because you route ciphertext + headers. Mention that server stores only ciphertext (metadata-only visibility).

## Deep-dive: delivery path
1. Sender → WS gateway → message service.
2. Service: write history (Cassandra) → update Redis so ordering partition gets it? Careful: for WhatsApp, history & delivery interleave. In our design: append history + publish to per-chat delivery partition + enqueue offline.
3. Receiver online → gateway push. Receiver offline → Kafka queue → friendly flush on connect.

## Media
Media → S3/CDN asynchronously; message carries reference, never the bytes. Dramatically reduces message-store size.

## Scaling gateway
WS connections pin to gateway → **reconnect sticky** via presence hash. Use edge PoPs with regional gateway pools; state replicated in Redis (not per-gateway memory only).

## Trade-offs to name
- Strong vs eventual for read receipts (eventual).
- History retention (deltas vs full) — cost.
- Multi-region active-active with per-region partitions coalesced via Kafka mirrors.`,
        keyConcepts: [
          "WebSocket gateway pools + sticky routing",
          "Redis presence (ephemeral) separated from durable DB",
          "Per-chat ordering partitions (not global)",
          "Cassandra/wide-column history store",
          "Offline queue + idempotent dedup",
        ],
        checklist: [
          "Calculate msg/s storage for shipping messages",
          "Explain how presence scales without killing the DB",
          "Describe message ordering guarantees practically",
        ],
        quiz: [
          {
            question: "Message ordering is guaranteed per-___?",
            options: [
              "User globally",
              "Chat/partition key",
              "Gateway",
              "Time of day",
            ],
            correct: 1,
            explanation:
              "Per-chat ordering is achievable with chat_id-partitioned writers; global ordering across all chats is neither needed nor feasible.",
          },
          {
            question: "Redis presence data is best described as...",
            options: [
              "Durable source of truth",
              "Ephemeral, fast state for online status & routing",
              "A backup of messages",
              "Cache of chat histories",
            ],
            correct: 1,
            explanation:
              "Presence churns constantly — keep it in memory (Redis), expire idle, and re-derive from durable data when needed.",
          },
        ],
        resources: [
          "Alex Xu — Design a chat system (Vol 1)",
          "Scalable WebSocket architectures — Discord engineering",
          "Etsy/Cassandra messaging writeups",
        ],
      },
      {
        slug: "ride-hailing-casestudy",
        title: "Case Study: Ride-Hailing (Uber-backend)",
        summary:
          "Geo-indexing, real-time driver tracking, matching, and surge — the geospatial case that separates seniors from staff.",
        durationMin: 30,
        content: `**Requirements:** 5M drivers, 250K location updates/s, match in < 1s, surge pricing optional.

## Estimation
- 5M drivers × 1 update/4s = **1.25M loc/s** peak (ingest heavy!).
- 8M trips/day → ~100 matchops/s (small — matching is compute, not ingest).

## Data model: geospatial indexing
Options: Redis GEO (S2), Uber H3, PostGIS.
- **H3**: hexagonal grid; hexagonal rings are natural "nearby" queries. Uber's choice — H3 index per driver, stored in memory/Redis.
- **Redis GEO**: ZSET of coordinates, georadius query. Simple, within a radius.
- PostGIS: for offline-heavy analytic queries, not hot path.

## Blueprint
\`Driver GPS (gRPC) → ingestion gateway → [location service: Redis/H3 maps] \` per-city
\`Rider Request → matching engine (k-ring)  → dispatch → trip service (ACID) → Kafka (analytics) → surge (Flink)\`

## Matching
1. Rider request → find driver cells within k-ring (expanding).
2. Score candidates: distance, ETA, surge multiplier, driver score.
3. Dispatch exactly one via **optimistic lock** (1-minute gap, multi-ack) — prevent two riders grabbing one driver.

## Trip lifecycle (must be ACID)
- Create trip, charge estimate, contruct, complete, pay. Distributed saga (payment refund on cancel).

## Surge pricing
Flink processes supply/demand per H3 cell → rule engine emits multiplier → rider app shows it → matching uses it for ranking bids.

## Consistency notes
- Location updates: **eventual** (short TTL — 10–20s stale location is acceptable; driver moves anyway).
- Trip creation/payment: **strong**.

## The staff-level discussions
- Partition cities: scale = shard each city's H3 map into city-local Redis clusters.
- Backpressure: ingest gateways shed driver GPS during spikes (eventual is safe).
- Idempotency: rides must be idempotent (request_id) — retries must not double-book.

## Intel from Uber
Uber moved to ringpop (gossip-based) + H3; matching in-memory per city partition.

## Perfect interview close
"Location is eventually-consistent over short TTLs; trips & money are ACID via a saga. Per-city partitioning makes it linear-scale."`,
        keyConcepts: [
          "H3 / S2 / Redis GEO for geo-indexing",
          "k-ring neighborhood matching",
          "Optimistic lock to dispatch one driver",
          "Trip lifecycle saga (payment/money)",
          "Eventually-consistent location vs strong trip",
        ],
        checklist: [
          "Pick a geo-index and justify it",
          "Design idempotent trip creation",
          "Explain per-city partitioning for scale",
        ],
        quiz: [
          {
            question: "Why is driver location consistency 'eventual' acceptable?",
            options: [
              "Drivers don't move",
              "10–20s stale location is cosmetically fine and writes must scale massively",
              "GPS is deterministic",
              "It's never acceptable",
            ],
            correct: 1,
            explanation:
              "Location churns at 1.25M updates/s — strong coordination is impossible and unneeded; a few seconds' staleness doesn't break matching.",
          },
          {
            question: "Matching must prevent two riders dispatching the same driver. You use:",
            options: [
              "Pessimistic global lock on all drivers",
              "Optimistic single-dispatch with a lock/lease per driver",
              "First-come first-served without locks",
              "Random assignment",
            ],
            correct: 1,
            explanation:
              "A short-lived per-driver lock (or atomic CAS dispatch) ensures exactly one ride gains the driver.",
          },
        ],
        resources: [
          "Uber eng — H3 geospatial indexing",
          "Uber eng — RingPop architecture",
          "Alex Xu Vol 2 — Ride-hailing design",
        ],
      },
      {
        slug: "video-streaming-casestudy",
        title: "Case Study: Video Streaming (TikTok/YouTube)",
        summary:
          "Adaptive bitrate, chunked CDN delivery, the recommendation problem, and watch-time telemetry at 1B+ DAU.",
        durationMin: 28,
        content: `**Requirements:** 1B DAU, 3.2M peak video requests/s, first-frame < 25ms, personalized FYP.

## Estimation
- 1B users × 30 videos/day (skips/hops) → heavy ingestion of **watch-time telemetry** (metadata, not bytes).
- Video bytes flow via CDN — origin really only sees storage + upload + popular-miss traffic.

## Blueprint
\`App → [CDN: video (HLS/DASH chunks)] | [API gateway: feed] → Feed service → [Redis precomputed feeds] | [Vector DB (Milvus)] | [profile/user graph] → Kafka (watch telemetry) → [Flink: features]  \`

## Key decisions
1. **Adaptive bitrate (ABR)** — HLS/DASH present the same video in multiple qualities cut in **2–6s chunks**; player switches quality per chunk based on bandwidth. Chunk size = trade-off (2s faster adaptation, 6s lower overhead).
2. **Chunked CDN delivery** — first frame = tiny first chunk from edge; subsequent chunks fetched on demand as user watches. Zero wasted bandwidth for skipped videos.
3. **Recommendation** — retrieval (vector similarity) + ranking (GBDT/LLM). Two-tower embeddings capture watch behavior → candidates → rank → personalize. Precompute per-user candidate lists in Redis.
4. **Like/view counters** — buffered in Redis (HyperLogLog/atomic counters), flushed to DB in batches via Kafka. Never hit the row-lock per view.

## Deep-dive: first-frame optimization
- IPoP pre-warm top N? No — instead, edge caches popular first-chunks aggressively; player requests chunk 0 first, then manifest-based following chunks.

## Deep-dive: telemetry pipeline
Watch/skip/loop events → Kafka → Flink/Storm aggregators → features write-back to vector DB (nearline) + counter stores.

## Cost & trade-offs
- CDN egress is the #1 cost — push edge caching, origin shields, batching.
- Caching: chunk granularity (tens of thousands of chunks per video) makes LRU natural; content-addressable keys prevent staleness.

## Trade-offs to name
- HLS vs DASH (HLS Apple default, DASH open, DASH smoother adaptation).
- Precompute all feeds vs rank-at-read (cost).
- Global vs regional encoding pipelines.

## Interview close
"CDN absorbs the bandwidth, pre-computed recommendation lists keep p99 under 25ms, telemetry streams decouple engagement metrics from the hot video path."`,
        keyConcepts: [
          "Adaptive bitrate + 2–6s chunks",
          "Chunked CDN delivery / first-frame path",
          "Two-tower retrieval + ranking for FYP",
          "Buffered counters (Redis→Kafka→DB)",
          "CDN cost as the dominant constraint",
        ],
        checklist: [
          "Explain ABR chunk selection to a non-technical friend",
          "Design the telemetry pipeline for a 'skip' event",
          "Compare HLS vs DASH trade-offs",
        ],
        quiz: [
          {
            question: "Why serve video as 2–6s chunks rather than one file?",
            options: [
              "Files can't be cached",
              "Players adapt quality per chunk and only fetch what is watched",
              "It encrypts the video",
              "Chunks are mandatory by law",
            ],
            correct: 1,
            explanation:
              "Chunking enables ABR quality switching and progressive fetch — skip behavior wastes no bandwidth.",
          },
          {
            question: "Like/view counters avoid DB write storms via...",
            options: [
              "Adding more databases",
              "Buffering in Redis then batch-flushing via Kafka",
              "Disabling likes",
              "SQL triggers",
            ],
            correct: 1,
            explanation:
              "In-memory aggregation smooths bursts; batched writes protect the source of truth from per-request churn.",
          },
        ],
        resources: [
          "ByteByteGo — YouTube design video",
          "Netflix — how NetFlix encodes video",
          "TikTok recommendation system papers",
        ],
      },
      {
        slug: "payments-casestudy",
        title: "Case Study: Payment Processing (Stripe-style)",
        summary:
          "Idempotency, double-entry ledgers, saga orchestration, PCI, and the zero-loss guarantees that scar engineers.",
        durationMin: 30,
        content: `**Requirements:** 25K txn/s, zero loss, < 250ms auth, idempotent retries, auditability.

## Estimation
- 25K txn/s peak × 250ms each ≈ thousands of concurrent in-flight.
- Ledger growth is append-only — 80TB/yr. Retention: many years.

## Blueprint
\`Checkout → API gateway (TLS/PCI) → idempotency store (Redis lock) → orchestration (Temporal saga) → [acquirer/bank] | [double-entry ledger] | [transactional outbox → webhooks]\`

## The 4 pillars
1. **Idempotency** — client sends \`Idempotency-Key\`; server memoizes key→result; duplicate retries never double-charge. Redis lock + stored response (24h TTL). Single-flight the expensive op.
2. **Double-entry accounting** — every financial change = ≥2 ledger entries, always balancing (debit A + credit B). Append-only → always auditable, no UPDATEs.
3. **Saga orchestration** — charge → capture → settle as an orchestrated saga (Temporal). Compensations: refund on capture-fail. Local ACID per step.
4. **Webhook delivery** — committed DB write + outbox row in same transaction → CDC → dispatcher attempts webhooks with retries + signing (HMAC) — merchants confirm receipt.

## Money invariants (state-level)
- **Sum of balances never changes** — enforced by ledger structure (not app logic).
- **No silent loss**: background reconciliation vs banks (24h). Mismatch alerts.

## The ledger schema (double-entry)
\`entry(id, account_id, amount_cents, direction, txn_id, created_at)\` — immutable. Balance = SUM(entries). Partial failure impossible because commits are atomic per transaction.

## PCI-DSS reality
- Card data: tokenize at the gateway (never touch raw PAN in our systems), vault + PCI scope reduction, mTLS, HSMs for keys.

## Deep-dive: single-flight on idempotency
Two concurrent requests with same key → Redis SETNX (lock) → winner processes, loser blocks then reads stored response. TTL short (e.g. 30s) then re-check — prevents double-charge on timeout + retry.

## Trade-offs to name
- 2PC vs saga: sagas, because 2PC blocks + hurts availability.
- Sync acks vs async: auth must be fast (sync), settlement async.
- Monotonic-id assigned outside DB (Snowflake) for reference/linkage.

## The boss answer
"Every retry is idempotent, every movement double-entry, every state change versioned, delivery via outbox, reconciliation nightly."`,
        keyConcepts: [
          "Idempotency-Key + single-flight lock",
          "Double-entry append-only ledger",
          "Orchestrated saga (Temporal)",
          "Transactional outbox → signed webhooks",
          "PCI tokenization & scope reduction",
        ],
        checklist: [
          "Model a charge as double-entry entries",
          "Describe SCRE failure with compensation (refund)",
          "Trace one payment from client to webhook",
        ],
        quiz: [
          {
            question: "Why double-entry ledger over mutable balances?",
            options: [
              "It's faster",
              "Append-only balancing entries guarantee the money invariant & audit trail",
              "It uses less disk",
              "Bans are required",
            ],
            correct: 1,
            explanation:
              "Every change is balanced paired entries; 'sum never changes' is enforced by construction, and history is immutable.",
          },
          {
            question: "Two concurrent requests with the same idempotency key must...",
            options: [
              "Both process",
              "One processes, the other waits & returns the stored result",
              "Both fail",
              "Randomize",
            ],
            correct: 1,
            explanation:
              "SETNX lock + memoized response: losing request reads the stored outcome — no double processing, no double charge.",
          },
        ],
        resources: [
          "Stripe — idempotency docs",
          "Modern Treasury — money movement engineering",
          "Temporal — payment workflows",
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // SECTION 7 — STAFF-LEVEL MASTERY & INTERVIEW PREP (Staff)
  // ─────────────────────────────────────────────────────────────────────────────
  {
    slug: "staff-level",
    title: "Staff-Level Mastery & Interview Prep",
    level: "Staff",
    icon: "🧠",
    description:
      "Move from 'correct' to 'masterful': design evaluation criteria, the 45-minute interview structure, and full mock interviews.",
    order: 7,
    lessons: [
      {
        slug: "trade-off-mastery",
        title: "Trade-Off Mastery: How Staff Engineers Argue",
        summary:
          "Naming a trade-off scores points; *quantifying* it wins rooms. Learn to bind every decision to a number.",
        durationMin: 18,
        content: `Anyone can say "this is a trade-off". Staff engineers **quantify** trade-offs so decisions become numbers, not vibes.

## Rule: every decision gets a number
- "Cache the feed in Redis" → *"cuts p99 from 420ms → 14ms, costs ~40GB RAM ≈ $3k/mo, schedules 99.5% hit on the Pareto 20%".*
- "Use eventual consistency" → *"removes cross-region 80ms latency; worst staleness ~2s for a non-critical like-count".*

## Frameworks for comparing options
### Quantitative distance
Compute cost of A vs B: latency, ops, storage, engineering hours.

### Blast radius
How big a failure does each option create? Prefer small-radius options if other metrics roughly match.

### The 3-axes trade-off triangle
- **Latency** — how fast?
- **Consistency** — how correct?
- **Cost/ops** — how much do we pay?

Any design lives somewhere in the triangle. You pick the corner the *requirement* demands.

## Example argument (strong + numbers)
> "I'd pick event-log computation for the feed over on-write fan-out. Adding a celebrity costs 4ms read-time merge vs 100M write storm. At 60M followers, push writes 60M rows per post; pull reads ~200 posts for 8ms — pull wins on blast radius and cost, with +8ms on the critical path we can spare."

## The anti-pattern
- "We'll use Kafka + Redis + 3 stores because they're modern." — no numbers, no requirement link. Called out instantly at staff level.

## Practice prompt
Pick a "naive" vs "polished" choice in any template and defend EACH with 3 quantified points.

## Self-review checklist
- [ ] Every major decision states latency/consistency/cost impact with units.
- [ ] Alternatives compared against the requirement, not "industry standard".
- [ ] The failure scenario for your choice is named with mitigation.`,
        keyConcepts: [
          "Every trade-off gets numbers (latency, cost, blast radius)",
          "Latency–consistency–cost triangle",
          "Blast radius as a first-class metric",
          "Compare against requirements, not 'standard'",
          "Name the failure mode of YOUR choice",
        ],
        checklist: [
          "Rewrite 'we'll use Redis' with 3 quantified points",
          "Compare push vs pull fan-out quantitatively",
          "Self-audit one past design for missing numbers",
        ],
        quiz: [
          {
            question: "Which answer best demonstrates trade-off mastery?",
            options: [
              "Caching improves performance",
              "Caching the top 20% of links moves p99 420→14ms for ~$3k/month RAM and keeps 99.5% hit ratio",
              "Caching is industry standard",
              "Our infra team prefers Redis",
            ],
            correct: 1,
            explanation:
              "Concrete latency, cost, and hit-ratio numbers tie the decision to the requirement — staff-level default.",
          },
          {
            question: "Blast radius refers to...",
            options: [
              "Server proximity",
              "How large a failure your design choice creates and how contained it is",
              "The size of your database",
              "CDN coverage",
            ],
            correct: 1,
            explanation:
              "Smaller blast radius = failures stay contained — staff engineers bias toward designs with limited failure impact.",
          },
        ],
        resources: [
          "The Staff Engineer's Path (Will Larson)",
          "StaffEng.com essays on trade-offs",
          "Leading Systems Design sessions internally",
        ],
      },
      {
        slug: "interview-framework",
        title: "The 45-Minute Interview Framework & Drill",
        summary:
          "The exact minute-by-minute structure used in FAANG system design rounds — with a practice script.",
        durationMin: 16,
        content: `System design interviews are scored against a **structure**. Own the clock or the clock owns you.

## The 45-minute blueprint
\`\`\`
⏱ 0–5      Clarify requirements (users, features, scale, non-functional)
⏱ 5–10     Back-of-envelope estimation (QPS, storage, bandwidth)
⏱ 10–20    High-level blueprint (DNS/CDN/LB/app/cache/db/queue diagram)
⏱ 20–32    Deep-dive 1–2 components (chosen with interviewer)
⏱ 32–42    Bottlenecks, failure modes, trade-offs (quantified)
⏱ 42–45    Summary, scaling roadmap, open items
\`\`\`

## Scoring rubric interviewers use
- **Communication:** drives the conversation, asks questions, states assumptions.
- **Logical design:** each component justified from requirements.
- **Depth:** goes deep where it matters; knows the stack layer by layer.
- **Trade-off analysis:** names + quantifies alternatives.
- **Failure analysis:** what breaks and how we survive it.

## Anti-patterns that cap your score
- Jumping straight to a diagram with no requirements. (Instant low score.)
- Memorized diagrams regurgitated without requirement linkage.
- Silent sketching — think aloud, every decision narrated.
- Vague numbers ("some scaling") when asked for estimates.
- Only focuses on what GOES in, never what GOES WRONG.

## The 5-whys drill (practice alone)
For any design you produce, ask "why" 5 times per decision. If you can't answer #3, you don't understand your own system — fix before the interview.

## Mock drill schedule
- Week 1: 4 fundamentals systems (URL shortener, pastebin, rate limiter, cache design).
- Week 2: consumer scale (feed, chat, video, ride).
- Week 3: hard/niche (payment, distributed rate limiter global, search typeahead, proximity, metrics).
- Week 4: full 45' mock with timer + scored feedback from a partner.

## Closing script to memorize
"Here's what we built and why: [30s recap]. The highest-risk components are [X, Y] — I'd add [monitoring/remediation] first. If we grew 10×, I'd [next step]."`,
        keyConcepts: [
          "45-minute staged structure (clarify→estimate→blueprint→deep→trade-offs→summary)",
          "Scoring rubric: communication, logic, depth, trade-offs, failures",
          "Think aloud — narrative decisions",
          "Quantified numbers across the board",
          "5-whys self-drill",
        ],
        checklist: [
          "Time yourself in a 45-min mock",
          "Record your estimation segment and critique it",
          "Drill the closing 30-second recap script",
        ],
        quiz: [
          {
            question: "The #1 damaging anti-pattern in system design interviews?",
            options: [
              "Overdrawing the diagram",
              "Jumping to a diagram without clarifying requirements",
              "Talking too much",
              "Using too many words",
            ],
            correct: 1,
            explanation:
              "Skipping requirements signals you design in a vacuum — interviewers downgrade immediately.",
          },
          {
            question: "'Scope control' (saying what you WON'T build) scores higher because...",
            options: [
              "It shortens the interview",
              "It shows the design was derived from requirements and priorities",
              "Interviewers hate details",
              "It hides weaknesses",
            ],
            correct: 1,
            explanation:
              "Deferring features with reasoning proves you understand what the requirement demands and what can wait.",
          },
        ],
        resources: [
          "Pramp / Karat mock interview platforms",
          "Donne Martin — interview frameworks",
          "FAANG interview experience writeups",
        ],
      },
      {
        slug: "mock-interview-drills",
        title: "Full Mock Interviews: Four Staged Prompts",
        summary:
          "Run these with a partner or timer: guidance vs exercise mode, plus what a staff answer sounds like.",
        durationMin: 20,
        content: `Practice these from memory — no notes — with hard timers. Grade yourself with the rubric from the previous lesson.

## Prompt 1 — Pastebin / Expiring Snippets (Beginner)
Requirements to clarify: paste with TTL, reads/writes ratio, retention, share URLs.
**Deep dive to expect:** cache-aside for reads, TTL rows + retention sweep, base64 IDs.

## Prompt 2 — Rate Limited API for a Public Platform (Intermediate)
Requirements: per-user/per-IP caps, dynamic quotas, fail-open policy.
**Deep dive:** two-tier token bucket (sidecar local + Redis sync), 429 responses, hot-key protection.

## Prompt 3 — Global Twitter-style feed with trending topics (Advanced)
Requirements: 500M DAU, ranked + realtime trending.
**Deep dive:** fan-out hybrid, trending windows (sliding count via stream), vector/NA for personalization, cache hierarchy.

## Prompt 4 — Metrics & Anomaly Detection Pipeline (Staff)
Requirements: ingest 10M metric points/s, query, alert, ML anomaly.
**Deep dive:** sharded LSM time-series store, downsampling/rollups, cardinality control, streaming detection (Flink windowed stats), alerting with suppression.

## What a STAFF answer sounds like (anti-example vs example)
Bad: "we'll store metrics in Mongo and alert in Python."
Good: "I'd use a TSDB (Prometheus/Timescale/Influx) with rollups to reduce point-count 100×, per-metric cardinality budgets, and a Flink pipeline that detects anomalies in 10s windows — evaluating burst tolerance means peak queries hit ~40M series, so we budget shards at 1M series/node."

## Self-grading after each mock
1. Did I clarify scale before drawing? (0/1)
2. Numbers given for QPS/storage? (0/1)
3. Deep dive went 2 levels down? (0/1)
4. Failure modes named with mitigation? (0/1)
5. Summarized in 30s with next steps? (0/1)
6. Every trade-off quantified? (0/1)

Score 6/6 = ready. <4 = repeat the drills.`,
        keyConcepts: [
          "Four graded mock prompts (beginner→staff)",
          "Self-grading checklist after each",
          "Requirements-first discipline",
          "Two-level-deep dives",
          "Quantified decisions throughout",
        ],
        checklist: [
          "Run Prompt 1 with a 10-min timer now",
          "Complete all four mocks this month",
          "Score 6/6 on the rubric twice in a row",
        ],
        quiz: [
          {
            question: "During a mock, your first response to any vague prompt should be...",
            options: [
              "Start with the datacenter diagram",
              "Ask clarifying questions (users, features, scale, non-functional)",
              "Pick your favorite tech stack",
              "Skip to estimation",
            ],
            correct: 1,
            explanation:
              "Clarification first anchors everything downstream — it's step 1 in the 45-minute structure.",
          },
          {
            question: "Which statement shows a two-level-deep dive?",
            options: [
              "We'll use CDNs",
              "The redirect gateway checks a bloom filter before the DB, falls back to replica reads, and populates cache with stale-while-revalidate",
              "We'll have a database",
              "We'll scale",
            ],
            correct: 1,
            explanation:
              "Detail on the specific mechanisms and fallbacks of one component is the depth interviewers grade.",
          },
        ],
        resources: [
          "System Design mock platforms & partners",
          "The System Design Primer mocks",
          "Interview opponents (Pramp/Karat/HelloInterview)",
        ],
      },
      {
        slug: "final-assessment",
        title: "Final Assessment: Design a Complete System End-to-End",
        summary:
          "Prove your mastery: a demanding prompt combining feeds, realtime, payments-grade consistency, and observability.",
        durationMin: 30,
        content: `This is your capstone. Design **one complete system** under the 45-minute rules, integrate every lesson.

## The capstone prompt
> Design a global **real-time collaboration platform** (like Figma/Google Docs) — concurrent editing, presence, comments/chat, file storage, and usage billing.

## Suggested plan to apply your toolkit
1. **Clarify**: 100M weekly users, 10M concurrent editors; features: multi-user editing, presence, comments, version history, billing.
2. **Estimate**: 2M concurrent docs × 100 ops/s edits → ~200–400K ops/s peak. Storage: document deltas ~40B ops/yr.
3. **Blueprint**
   - Client → edge (sharded by doc_id) → **WebSocket gateway** (by doc_id → single shard → ordering).
   - **CRDT / OT** server → durable **append-only op log** (Kafka or Cassandra) → computed document projection.
   - Presence → Redis; comments → relational; billing events → Kafka → usage service.
4. **Deep dives**
   - *Ordering:* per-doc single-writer partition guarantees op order.
   - *Version history:* op-log replay + snapshots (snapshot + tail).
   - *Consistency:* strong for the doc state; eventual for presence/cursors.
   - *Reliability:* idempotent op submission (op_id dedup), retries with linearizable op log, outbox for billing.
5. **Trade-offs**: OT vs CRDT (merge semantics vs availability), push vs pull presence, single-region vs multi-region doc affinity.

## Milestones to hit
- Numbers in every paragraph.
- Failure modes: writer crash, gateway failover, partition — each mitigated.
- Observability: p99 edit latency, op lag, region failover drill.

## The rubric one more time (self-score)
Communication / Logic / Depth / Trade-offs / Failures / Numbers (0–5 each) — 30+ = staff-ready.

## After you finish
Open the Studio, load the **Rate Limiter** template, and rebuild it purely from the concepts in this course. Then try the chaos tab on it. That's your graduation.`,
        keyConcepts: [
          "Full-system integration of every lesson",
          "Per-doc ordering via single-writer shard",
          "OT/CRDT + append-only op log",
          "Realtime consistency vs eventually-consistent presence",
          "Runtime observability requirements",
        ],
        checklist: [
          "Write estimation for concurrent editors & op throughput",
          "Draw the doc-sharded gateway architecture",
          "Define failure handling for writer crash & partition",
          "Score yourself 30+ on the rubric",
        ],
        quiz: [
          {
            question: "To guarantee per-document edit ordering, best approach:",
            options: [
              "Broadcast to all gateways",
              "Route all ops for doc_id to a single shard/partition (single writer)",
              "Use eventual convergence only",
              "Random routing",
            ],
            correct: 1,
            explanation:
              "A single writer per document/partition produces a total order; cross-shard consensus would add latency without benefit.",
          },
          {
            question: "Version history is best stored as...",
            options: [
              "Periodic full snapshots only",
              "Append-only op log + periodic snapshots (snapshot-and-tail)",
              "Overwriting mutated state",
              "A SQL UPDATE trigger",
            ],
            correct: 1,
            explanation:
              "Rebuild state by applying the tail after the latest snapshot — O(snapshot + log) with bounded replay.",
          },
        ],
        resources: [
          "Tombstone/CRDT deep dive (Martin Kleppmann)",
          "Figma multiplayer architecture talk",
          "Google Docs 'Operational Transformation' articles",
        ],
      },
    ],
  },
];