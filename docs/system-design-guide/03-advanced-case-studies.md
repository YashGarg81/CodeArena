# Advanced System Design & Real-World Case Studies

## Chapter 7: Distributed Systems Deep Dive

### 7.1 Consensus Algorithms

**Raft (Simplified Paxos):**
- Leader-based consensus
- Leader election → Log replication → Safety
- Used in: etcd, Consul, CockroachDB

```
States: Follower → Candidate → Leader

1. All nodes start as Followers
2. If no Leader in election timeout → Candidate
3. Candidate requests votes from majority
4. If majority votes → become Leader
5. Leader sends heartbeats to maintain authority
```

**Paxos:**
- More complex but proven correct
- Two phases: Prepare/Promise → Accept/Accepted
- Used in: Google Chubby, Apache ZooKeeper

### 7.2 Vector Clocks & Causality

Track causal ordering of events in distributed systems.

```
Node A: [A:1] → [A:2] → [A:3]
Node B: [B:1] → [B:2]
Node C: [C:1]

If A receives [B:2] then sends:
A's clock: [A:4, B:2]

Comparison:
[A:2, B:1] happens-before [A:3, B:1] ✓
[A:2, B:1] concurrent with [A:2, B:2] ✗
```

### 7.3 Gossip Protocol

Eventually consistent information dissemination.

```
Node A knows about event X
1. A randomly picks Node B, sends {X: happened}
2. B randomly picks Node C, sends {X: happened}
3. Eventually all nodes know about X

Convergence time: O(log N) where N = number of nodes
```

**Used in:** Redis Cluster, Cassandra, Amazon S3

### 7.4 Circuit Breaker Pattern

Prevent cascading failures in microservices.

```
States:
CLOSED → (failures exceed threshold) → OPEN
OPEN → (timeout expires) → HALF-OPEN
HALF-OPEN → (success) → CLOSED
HALF-OPEN → (failure) → OPEN

Configuration:
- Failure threshold: 5 failures in 60s
- Open duration: 30s
- Half-open requests: 3
```

---

## Chapter 8: Scalability Patterns

### 8.1 Horizontal vs Vertical Scaling

```
Vertical Scaling (Scale Up):
┌──────────────┐     ┌──────────────────┐
│ Current      │ →   │ Bigger Server    │
│ 4 CPU, 16GB  │     │ 16 CPU, 64GB    │
└──────────────┘     └──────────────────┘
✓ Simple, no code changes
✗ Limited by hardware, single point of failure

Horizontal Scaling (Scale Out):
┌──────────────┐     ┌──────────────┐
│ Current      │ →   │ Server 1     │
│ 1 Server     │     │ Server 2     │
│              │     │ Server 3     │
└──────────────┘     │ Server N     │
                     └──────────────┘
✓ Unlimited scaling, fault tolerance
✗ More complex, data consistency challenges
```

### 8.2 Microservices vs Monolith

```
Monolith:
┌────────────────────────────────────┐
│  Auth  │ Orders │ Inventory │ Pay  │
│────────────────────────────────────│
│              Single Database        │
└────────────────────────────────────┘

Microservices:
┌─────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐
│ Auth Svc│  │ Order Svc│  │Inventory │  │Payment  │
│ (DB)    │  │ (DB)     │  │ (DB)     │  │(DB)     │
└────┬────┘  └────┬─────┘  └────┬─────┘  └────┬────┘
     │            │             │              │
     └────────────┴─────API─────┴──────────────┘
```

| Aspect | Monolith | Microservices |
|--------|----------|---------------|
| **Development** | Faster initially | Slower initially |
| **Deployment** | Single unit | Independent |
| **Scaling** | Scale everything | Scale what's needed |
| **Technology** | One stack | Polyglot |
| **Team** | Small teams | Large teams |
| **Data** | Shared DB | Database per service |

### 8.3 Service Mesh

Manage service-to-service communication.

```
┌──────────────────────────────────────┐
│            Control Plane             │
│  (Istio, Linkerd, Envoy Control)    │
└──────────────────────────────────────┘
                    │
    ┌───────────────┼───────────────┐
    ▼               ▼               ▼
┌─────────┐    ┌─────────┐    ┌─────────┐
│ Service │    │ Service │    │ Service │
│ + Sidecar│    │ + Sidecar│    │ + Sidecar│
│ (Envoy) │    │ (Envoy) │    │ (Envoy) │
└─────────┘    └─────────┘    └─────────┘

Sidecar handles: Load balancing, TLS, Observability, Retries
```

---

## Chapter 9: Real-World System Design Case Studies

### 9.1 URL Shortener (like bit.ly)

**Requirements:**
- Shorten URLs, redirect to original
- High read:write ratio (100:1)
- 100M URLs/month, 5-year retention

**Architecture:**
```
┌─────────┐    ┌─────────────┐    ┌─────────┐
│  Client │───→│ API Gateway │───→│ App Svc │
└─────────┘    └─────────────┘    └────┬────┘
                                       │
                    ┌──────────────────┤
                    ▼                  ▼
             ┌──────────┐        ┌──────────┐
             │  Cache   │        │ Database │
             │ (Redis)  │        │(PostgreSQL)│
             └──────────┘        └──────────┘
```

**Key Design Decisions:**

1. **ID Generation:**
   - Base62 encoding (a-z, A-Z, 0-9)
   - 7 chars = 62^7 = 3.5 trillion unique URLs
   - Counter-based with Base62 conversion

2. **Database Schema:**
```sql
CREATE TABLE urls (
    id BIGINT PRIMARY KEY,
    original_url TEXT NOT NULL,
    short_code VARCHAR(7) UNIQUE,
    created_at TIMESTAMP,
    expires_at TIMESTAMP,
    user_id BIGINT
);
CREATE INDEX idx_short_code ON urls(short_code);
```

3. **Read Path:**
   - Check Redis cache → Cache hit? Return
   - Cache miss? Query DB → Cache result → Return
   - 301 redirect to original URL

### 9.2 Chat System (like WhatsApp/Slack)

**Requirements:**
- 1:1 and group messaging
- Online/offline presence
- Message delivery guarantee
- 50M daily active users

**Architecture:**
```
┌──────────┐     ┌──────────────┐     ┌──────────────┐
│  Client  │────→│ WebSocket    │────→│ Chat Service │
│ (Mobile) │     │ Gateway      │     │              │
└──────────┘     └──────────────┘     └──────┬───────┘
                                             │
                    ┌────────────────────────┤
                    ▼                        ▼
             ┌──────────────┐        ┌──────────────┐
             │ Message Queue│        │ User Service │
             │  (Kafka)     │        │ (Presence)   │
             └──────┬───────┘        └──────────────┘
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
   ┌─────────┐ ┌─────────┐ ┌─────────┐
   │ Msg DB  │ │ Msg DB  │ │ Msg DB  │
   │ Shard 0 │ │ Shard 1 │ │ Shard 2 │
   └─────────┘ └─────────┘ └─────────┘
```

**Key Design Decisions:**

1. **Message Storage:**
   - Cassandra (write-optimized, time-series)
   - Partition by chat_id
   - Clustering by timestamp DESC

2. **Message Flow:**
```
User A → WebSocket → Chat Service → 
  1. Store message in DB
  2. Publish to Kafka
  3. Notification service → Push to User B
  4. If B offline → Store in notification queue
```

3. **Read Receipts & Presence:**
   - Redis Sorted Sets for presence (score = timestamp)
   - Periodic heartbeat (every 30s)
   - TTL = 60s (no heartbeat = offline)

### 9.3 Rate Limiter

**Algorithms:**

**Token Bucket:**
```
Bucket capacity: 100 tokens
Refill rate: 10 tokens/second

Request → Has tokens? 
  Yes → Consume 1 token → Allow
  No  → Reject (429 Too Many Requests)
```

**Sliding Window Log:**
```
Store timestamp of each request in sorted set
Remove entries older than window
Count remaining entries
If count < limit → Allow
```

**Sliding Window Counter:**
```
Current window count + Previous window count × overlap factor
More memory efficient than log approach
```

**Implementation (Redis):**
```lua
-- Token Bucket in Redis
local key = KEYS[1]
local capacity = tonumber(ARGV[1])
local refill_rate = tonumber(ARGV[2])
local now = tonumber(ARGV[3])

local bucket = redis.call('HMGET', key, 'tokens', 'last_refill')
local tokens = tonumber(bucket[1]) or capacity
local last_refill = tonumber(bucket[2]) or now

-- Refill tokens
local elapsed = now - last_refill
tokens = math.min(capacity, tokens + elapsed * refill_rate)

if tokens >= 1 then
  tokens = tokens - 1
  redis.call('HMSET', key, 'tokens', tokens, 'last_refill', now)
  redis.call('EXPIRE', key, 3600)
  return 1  -- Allow
else
  return 0  -- Reject
end
```

### 9.4 Notification System

**Requirements:**
- Multi-channel: Email, SMS, Push, In-App
- 10M notifications/day
- Priority levels
- Deduplication

**Architecture:**
```
┌──────────┐    ┌─────────────┐    ┌─────────────────┐
│  Client  │───→│ Notification│───→│ Notification    │
│  (API)   │    │   Service   │    │ Queue (Kafka)   │
└──────────┘    └─────────────┘    └────────┬────────┘
                                           │
                    ┌──────────────────────┤
                    ▼          ▼           ▼
             ┌──────────┐ ┌────────┐ ┌─────────┐
             │ Email    │ │  SMS   │ │  Push   │
             │ Worker   │ │ Worker │ │ Worker  │
             └──────────┘ └────────┘ └─────────┘
```

**Key Patterns:**
- **Fan-out on write**: Pre-compute notification lists (for small audiences)
- **Fan-out on read**: Compute at request time (for large audiences)
- **Deduplication**: Content hash + user_id + time window
- **Rate limiting**: Per-user, per-channel limits

### 9.5 Search Autocomplete (Typeahead)

**Requirements:**
- Suggest top 5 queries as user types
- 100K QPS
- Real-time trending updates

**Architecture:**
```
┌──────────┐    ┌─────────────┐    ┌─────────────┐
│  Client  │───→│ API Gateway │───→│ Trie Service│
└──────────┘    └─────────────┘    └──────┬──────┘
                                         │
                    ┌────────────────────┤
                    ▼                    ▼
             ┌──────────────┐    ┌──────────────┐
             │ Redis Cache  │    │  Analytics   │
             │ (Trie Data)  │    │  Service     │
             └──────────────┘    └──────────────┘
```

**Data Structure: Trie (Prefix Tree)**
```
Root
├── b
│   └── a
│       ├── n
│       │   └── k → [bank, banking, bank of america]
│       └── l
│           └── l → [ball, baltimore, ballet]
├── f
│   └── a
│       └── c → [facebook, facts, factory]
└── s
    └── a
        └── m → [samsung, sam's, sample]
```

**Update Strategy:**
- Aggregate search logs in Kafka
- Update trie every 5 minutes (batch, not real-time)
- Keep top 5 suggestions per prefix
- Use frequency count for ranking

---

## Chapter 10: Common System Design Interview Questions

### 10.1 Interview Framework

```
1. Requirements Clarification (3-5 min)
   - Functional: What should the system do?
   - Non-functional: Scale, latency, availability, consistency?
   
2. Estimation (3-5 min)
   - Users, QPS, storage, bandwidth
   
3. High-Level Design (10-15 min)
   - Major components
   - Data flow
   - API design
   
4. Deep Dive (15-20 min)
   - Component-specific design
   - Database schema
   - Caching strategy
   - Scalability plan
   
5. Wrap Up (3-5 min)
   - Bottlenecks
   - Monitoring
   - Future improvements
```

### 10.2 Common Questions & Key Points

| Question | Key Points |
|----------|-----------|
| **Design URL Shortener** | Base62 encoding, read-heavy caching, 301 vs 302 redirect |
| **Design Chat System** | WebSocket, message ordering, read receipts, offline support |
| **Design News Feed** | Fan-out on write vs read, pull vs push, ranking algorithm |
| **Design Rate Limiter** | Token bucket vs sliding window, distributed counting |
| **Design Notification System** | Multi-channel, deduplication, priority queues |
| **Design Search Autocomplete** | Trie, prefix matching, real-time trending |
| **Design Web Crawler** | BFS/DFS, politeness, URL frontier, deduplication |
| **Design Key-Value Store** | Consistent hashing, replication, conflict resolution |
| **Design Unique ID Generator** | Snowflake, UUID, database sequences, ZooKeeper |
| **Design Metrics System** | Time-series DB, aggregation, real-time dashboards |

### 10.3 Quick Reference Cheat Sheet

**Back-of-Envelope Numbers:**
```
1M users × 10 requests/day ÷ 86400 ≈ 120 QPS
100M users × 10 requests/day ÷ 86400 ≈ 12K QPS
1 billion users × 10 requests/day ÷ 86400 ≈ 120K QPS

1 KB × 1M = 1 GB
1 MB × 1M = 1 TB
1 GB × 1M = 1 PB
```

**Latency Numbers:**
```
L1 cache: 0.5 ns
L2 cache: 7 ns
RAM: 100 ns
SSD: 150 μs
HDD: 10 ms
Same DC round trip: 0.5 ms
Cross-continent: 150 ms
```

**Storage Formulas:**
```
Daily storage = DAU × data_per_request × requests_per_day
QPS = DAU × requests_per_day ÷ 86400
Peak QPS = Average QPS × 3
Storage (N years) = Daily storage × 365 × N
```

**Capacity Planning:**
```
Read QPS: Cache hit ratio × total QPS + (1 - cache hit ratio) × DB capacity
Write QPS: Must fit in DB write capacity
Storage: Growth rate × retention period + buffer
Bandwidth: QPS × average_response_size
```
