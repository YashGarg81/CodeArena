# System Design Interview Prep Guide

## The 5-Step Framework

Every system design interview follows this structure. Master this and you'll never be lost.

---

### Step 1: Requirements (3-5 minutes)

**Functional Requirements:**
- What exactly should the system do?
- What are the core features?
- Who are the users?

**Non-Functional Requirements:**
- Scale: How many users? QPS?
- Latency: What's acceptable? (100ms vs 1s)
- Availability: 99.9% or 99.99%?
- Consistency: Strong or eventual?

**Questions to Ask:**
```
"How many daily active users?"
"What's the read:write ratio?"
"Is this read-heavy or write-heavy?"
"Do we need real-time or is near-real-time OK?"
"Any geographic distribution requirements?"
```

---

### Step 2: Estimation (3-5 minutes)

**Traffic Estimation:**
```
DAU × Requests/User/Day ÷ 86,400 = Average QPS
Peak QPS = Average QPS × 2-5x
```

**Storage Estimation:**
```
Data/Record × Records/Day × Days to Store = Total Storage
```

**Bandwidth Estimation:**
```
QPS × Average Response Size = Bandwidth
```

**Example - Chat System:**
```
50M DAU × 40 messages/day = 2B messages/day
2B ÷ 86,400 = ~23K QPS average
Peak = 23K × 3 = ~70K QPS

Message size: 100 bytes
Daily storage: 2B × 100 bytes = 200 GB/day
Yearly: 200 GB × 365 = 73 TB
```

---

### Step 3: High-Level Design (10-15 minutes)

Draw the major components and data flow.

```
┌──────────┐     ┌─────────────┐     ┌──────────────┐
│  Client  │────→│ API Gateway │────→│ App Services │
└──────────┘     └─────────────┘     └──────┬───────┘
                                           │
                    ┌──────────────────────┤
                    ▼          ▼           ▼
             ┌──────────┐ ┌────────┐ ┌──────────┐
             │  Cache   │ │  DB    │ │  Queue   │
             │ (Redis)  │ │ (PG)   │ │ (Kafka)  │
             └──────────┘ └────────┘ └──────────┘
```

**Key Points:**
- Start with simple components
- Add complexity only when needed
- Label each component clearly
- Show data flow with arrows

---

### Step 4: Deep Dive (15-20 minutes)

Go deeper into specific components. Pick 2-3 to discuss in detail.

**Database Design:**
```sql
-- Show schema for core entities
-- Discuss indexing strategy
-- Explain partitioning/sharding if needed
```

**Caching Strategy:**
```
- What to cache?
- Cache eviction policy?
- Cache invalidation strategy?
- Consistency guarantees?
```

**API Design:**
```
POST /api/v1/resources
GET  /api/v1/resources/:id
PUT  /api/v1/resources/:id
DELETE /api/v1/resources/:id
```

**Scaling Plan:**
```
- How to handle 10x growth?
- Horizontal vs vertical scaling
- Database partitioning strategy
- Load balancing approach
```

---

### Step 5: Wrap Up (3-5 minutes)

**Bottlenecks:**
- What could break?
- What are the single points of failure?
- What needs monitoring?

**Improvements:**
- What would you do with more time?
- What are the trade-offs you made?
- Future considerations?

---

## 30 System Design Questions Cheat Sheet

### Tier 1: Fundamental (Must Know)

| # | Question | Key Components | Key Trade-off |
|---|----------|----------------|---------------|
| 1 | **URL Shortener** | Base62, Cache, DB | Read-heavy vs Write-heavy |
| 2 | **Rate Limiter** | Token Bucket, Redis | Accuracy vs Performance |
| 3 | **Key-Value Store** | Consistent Hashing, Replication | Consistency vs Availability |
| 4 | **Unique ID Generator** | Snowflake, UUID, DB Sequence | Uniqueness vs Performance |
| 5 | **Design Cache** | Redis, Eviction, Invalidation | Hit rate vs Memory |

### Tier 2: Social & Communication (High Priority)

| # | Question | Key Components | Key Trade-off |
|---|----------|----------------|---------------|
| 6 | **Chat System** | WebSocket, Message Queue, Cassandra | Real-time vs Offline |
| 7 | **News Feed** | Fan-out, Ranking, Cache | Push vs Pull |
| 8 | **Notification System** | Multi-channel, Queue, Dedup | Reliability vs Latency |
| 9 | **Social Network** | Graph DB, Edge Storage | Privacy vs Performance |
| 10 | **Comment System** | Nested Threads, Cache | Real-time vs Scalability |

### Tier 3: Storage & Retrieval (Medium Priority)

| # | Question | Key Components | Key Trade-off |
|---|----------|----------------|---------------|
| 11 | **Search Autocomplete** | Trie, Redis, Analytics | Freshness vs Latency |
| 12 | **Web Crawler** | BFS, Politeness, URL Frontier | Completeness vs Speed |
| 13 | **File Storage (Dropbox)** | Chunking, Dedup, Sync | Consistency vs Bandwidth |
| 14 | **Video Streaming** | CDN, Transcoding, Adaptive | Quality vs Cost |
| 15 | **Photo Sharing (Instagram)** | CDN, Thumbnails, Feed | Storage vs Load Time |

### Tier 4: Infrastructure & Data (Advanced)

| # | Question | Key Components | Key Trade-off |
|---|----------|----------------|---------------|
| 16 | **Metrics System** | Time-series DB, Aggregation | Accuracy vs Cost |
| 17 | **Log Aggregation** | Kafka, ELK, Streaming | Real-time vs Batch |
| 18 | **Email System** | Queue, Retry, Bounce Handling | Deliverability vs Speed |
| 19 | **Payment System** | Idempotency, Ledger, Retry | Consistency vs Availability |
| 20 | **Ticket Booking** | Inventory, Hold, Race Condition | Consistency vs UX |

### Tier 5: Complex Systems (Expert)

| # | Question | Key Components | Key Trade-off |
|---|----------|----------------|---------------|
| 21 | **Google Search** | Crawler, Indexer, Ranker | Freshness vs Quality |
| 22 | **YouTube/Netflix** | CDN, Transcoding, Recommendation | Cost vs Quality |
| 23 | **Uber/Lyft** | Matching, Location, ETA | Accuracy vs Speed |
| 24 | **Google Maps** | Tile System, Routing, Traffic | Real-time vs Cost |
| 25 | **Distributed Cache** | Consistent Hashing, Replication | Hit Rate vs Memory |

### Tier 6: Specialized Systems

| # | Question | Key Components | Key Trade-off |
|---|----------|----------------|---------------|
| 26 | **Webhooks** | Queue, Retry, Delivery | Reliability vs Latency |
| 27 | **Counting Service** | HyperLogLog, Bitmap | Accuracy vs Memory |
| 28 | **Proximity Service** | Geohash, Quadtree | Accuracy vs Speed |
| 29 | **Reminder System** | Scheduler, Queue, Persistence | Reliability vs Cost |
| 30 | **Real-time Analytics** | Stream Processing, OLAP | Freshness vs Cost |

---

## Technology Selection Guide

### When to Use What?

| Need | Options | Choose When |
|------|---------|-------------|
| **Primary DB** | PostgreSQL | Complex queries, transactions, ACID |
| | MySQL | Simple queries, high read throughput |
| | MongoDB | Flexible schema, rapid prototyping |
| **Cache** | Redis | Data structures, pub/sub, persistence |
| | Memcached | Simple key-value, multi-threaded |
| **Queue** | Kafka | High throughput, event sourcing, replay |
| | RabbitMQ | Complex routing, priority queues |
| | Redis Streams | Simple pub/sub, low latency |
| **Search** | Elasticsearch | Full-text search, complex queries |
| | Algolia | Hosted, easy setup |
| **Analytics** | ClickHouse | Columnar, fast aggregations |
| | Druid | Real-time analytics, time-series |
| **Time-Series** | InfluxDB | Metrics, monitoring |
| | TimescaleDB | PostgreSQL extension, SQL |

---

## Common Mistakes to Avoid

### 1. Not Clarifying Requirements
```
Bad: "I'll design a chat system"
Good: "Before I start, let me clarify: 
       Is this for 1:1 or group chat? 
       What scale are we targeting? 
       Do we need message persistence?"
```

### 2. Jumping to Details Too Early
```
Bad: Starts writing SQL schema immediately
Good: First draw high-level architecture, then dive into details
```

### 3. Ignoring Trade-offs
```
Bad: "We'll use Redis for caching"
Good: "We'll use Redis for caching with 5-minute TTL. 
       Trade-off: We might serve stale data, 
       but we reduce DB load by 90%"
```

### 4. Not Considering Failure Modes
```
Bad: "The system will work"
Good: "If Redis fails, we fall back to DB queries with rate limiting"
```

### 5. Over-Engineering
```
Bad: "We need Kubernetes, service mesh, and 15 microservices"
Good: "Start with monolith, split when needed. 
       Premature optimization is the root of all evil"
```

---

## Quick Reference Card

### Back-of-Envelope Numbers
```
1M users × 10 req/day ÷ 86400 ≈ 120 QPS
100M users × 10 req/day ÷ 86400 ≈ 12K QPS
1B users × 10 req/day ÷ 86400 ≈ 120K QPS

1 KB × 1M = 1 GB
1 MB × 1M = 1 TB
1 GB × 1M = 1 PB
```

### Latency Numbers
```
L1 Cache:         0.5 ns
L2 Cache:         7 ns
RAM:              100 ns
SSD:              150 μs
HDD:              10 ms
Same DC Round:    0.5 ms
Cross-Continent:  150 ms
```

### Availability Math
```
99.9% = 8.76 hours downtime/year
99.99% = 52.6 minutes downtime/year
99.999% = 5.26 minutes downtime/year

2 nines = 99% = 3.65 days/year
3 nines = 99.9% = 8.76 hours/year
4 nines = 99.99% = 52.6 min/year
5 nines = 99.999% = 5.26 min/year
```

### Storage Formulas
```
Daily Storage = Records/Day × Record Size
Monthly = Daily × 30
Yearly = Daily × 365

QPS = Daily Requests ÷ 86400
Peak QPS = Average QPS × 3
```
