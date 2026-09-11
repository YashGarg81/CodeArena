# System Design Fundamentals

## What is System Design?

System design is the process of defining the architecture, components, modules, interfaces, and data flow of a system to satisfy specified requirements. It's about making trade-offs between scalability, reliability, availability, and cost.

---

## Chapter 1: Core Concepts

### 1.1 What Makes a System "Distributed"?

A distributed system is a collection of independent computers that appear to users as a single coherent system. Key characteristics:

- **Multiple processes** running on different machines
- **No shared memory** — communication via network
- **Independent failure** — components can fail without killing the system
- **Concurrency** — multiple operations happen simultaneously

### 1.2 The CAP Theorem

You can only guarantee **two out of three** properties simultaneously:

| Property | Definition | Example |
|----------|-----------|---------|
| **Consistency** | Every read gets the most recent write | Bank balance always shows correct amount |
| **Availability** | Every request gets a response (success/failure) | Website never returns error |
| **Partition Tolerance** | System works despite network failures between nodes | Data center disconnects |

**In practice**: Network partitions WILL happen. So you choose between:
- **CP Systems** (Consistent + Partition Tolerant):牺牲 availability for consistency. Example: HBase, MongoDB (strong mode)
- **AP Systems** (Available + Partition Tolerant):牺牲 consistency for availability. Example: Cassandra, DynamoDB, DNS

### 1.3 CAP Theorem in Practice

```
┌─────────────────────────────────────────────────┐
│                  CAP Triangle                    │
│                                                 │
│              Consistency                        │
│                 /\                              │
│                /  \                             │
│               / CP \                            │
│              /      \                           │
│             /────────\                          │
│            /    CA     \                        │
│           /    (old)    \                       │
│          /──────────────\                       │
│     Partition        Availability              │
│     Tolerance            AP                     │
│                                                 │
│  CA = Traditional RDBMS (no partition handling) │
│  CP = HBase, MongoDB, Redis Cluster             │
│  AP = Cassandra, DynamoDB, CouchDB              │
└─────────────────────────────────────────────────┘
```

### 1.4 PACELC Theorem (Extension of CAP)

If there's a **P**artition, choose between **A**vailability and **C**onsistency.
**E**lse (normal operation), choose between **L**atency and **C**onsistency.

| System | During Partition | Normal Operation |
|--------|-----------------|------------------|
| Cassandra | PA (prefer availability) | EL (prefer latency) |
| MongoDB | PC (prefer consistency) | EC (prefer consistency) |
| DynamoDB | PA | EL |

---

## Chapter 2: Building Blocks

### 2.1 Load Balancers

Distribute incoming traffic across multiple servers.

**Types:**

| Type | Layer | How it Works | Examples |
|------|-------|--------------|----------|
| **L4 Load Balancer** | Transport (TCP/UDP) | Routes based on IP + Port | HAProxy (TCP mode), AWS NLB |
| **L7 Load Balancer** | Application (HTTP) | Routes based on URL, headers, cookies | Nginx, AWS ALB, Cloudflare |
| **DNS Load Balancer** | DNS level | Round-robin IP resolution | Route53, Cloudflare DNS |

**Load Balancing Algorithms:**

```
Round Robin          → Server1, Server2, Server3, Server1, ...
Weighted Round Robin → Server1(5), Server2(3), Server1(5), ...
Least Connections    → Send to server with fewest active connections
IP Hash              → Same client IP always goes to same server
Least Response Time  → Send to fastest-responding server
```

**Health Checks:**
```
┌─────────┐    GET /health     ┌─────────┐
│   LB    │ ────────────────→  │ Server1 │ ✓ Healthy
│         │ ←────────────────  │         │   Keep sending
│         │                    └─────────┘
│         │    GET /health     ┌─────────┐
│         │ ────────────────→  │ Server2 │ ✗ Unhealthy
│         │ ←────────────────  │         │   Remove from pool
│         │    (timeout)       └─────────┘
└─────────┘
```

### 2.2 Caching

Store frequently accessed data in fast storage (memory) to reduce database load.

**Where to Cache:**

```
Client Cache (Browser)
    ↓
CDN Cache (Edge)
    ↓
API Gateway Cache
    ↓
Application Cache (Redis/Memcached)
    ↓
Database Cache (Query Cache, Buffer Pool)
```

**Cache Strategies:**

```
1. Cache-Aside (Lazy Loading):
   App → Check Cache → Miss → DB → Write to Cache → Return

2. Write-Through:
   App → Write to Cache → Write to DB (simultaneously) → Return

3. Write-Behind (Write-Back):
   App → Write to Cache → Return immediately
   Cache → Async write to DB (background)

4. Read-Through:
   App → Read from Cache → Cache misses → Cache loads from DB → Return
```

**Cache Invalidation Patterns:**

```
Time-To-Live (TTL):
  Set expiry time: SET user:123 "data" EX 3600  (1 hour)

Event-Based:
  On user update → DEL user:123

Versioned Keys:
  GET user:123:v2  (increment version on update)

Tag-Based:
  Tag: "user:123" → invalidate all keys with this tag
```

**Cache Problems:**

| Problem | Description | Solution |
|---------|-------------|----------|
| **Thundering Herd** | Cache expires, many requests hit DB simultaneously | Stale-while-revalidate, lock/mutex |
| **Cache Penetration** | Query for data that never exists (e.g., invalid ID) | Bloom filter, cache null results |
| **Cache Avalanche** | Many cache entries expire at once | Randomize TTLs, warm cache on startup |
| **Hot Key** | Single cached item gets disproportionate traffic | Replicate hot key, local caching |

### 2.3 Message Queues

Decouple components and handle asynchronous processing.

```
┌──────────┐     ┌───────────┐     ┌──────────┐
│ Producer │────→│  Queue    │────→│ Consumer │
│ (Order)  │     │  (Redis)  │     │ (Email)  │
└──────────┘     └───────────┘     └──────────┘
```

**Queue Types:**

| Type | Use Case | Examples |
|------|----------|----------|
| **Point-to-Point** | One task, one worker | Celery with Redis |
| **Pub/Sub** | One message, many subscribers | Redis Pub/Sub, Kafka |
| **Priority Queue** | Urgent tasks first | RabbitMQ with priority |
| **Delayed Queue** | Schedule future tasks | Bull with delay option |

**Key Patterns:**

```
Producer → Queue → Consumer
                ↓
            Dead Letter Queue (failed messages)
            
Producer → Queue → Consumer A (video processing)
               → Consumer B (thumbnail generation)
               → Consumer C (notification)
```

### 2.4 Content Delivery Networks (CDN)

Cache static content geographically close to users.

```
User (Tokyo) → CDN Edge (Tokyo) → Cache Hit? → Return cached content
                                  Cache Miss → Origin Server (US-East)
                                              → Cache at Edge → Return
```

**CDN Types:**
- **Push CDN**: You upload content to CDN (static assets, images)
- **Pull CDN**: CDN pulls from origin on first request (dynamic content)

**When to Use CDN:**
- Static assets (JS, CSS, images, videos)
- API responses with high read-to-write ratio
- Global user base
- DDoS protection (CDN acts as shield)

### 2.5 Proxies

**Forward Proxy**: Client → Proxy → Server (hides client identity)
```
User → Forward Proxy → Website
(anonymity, access control, caching)
```

**Reverse Proxy**: Client → Proxy → Server (hides server identity)
```
User → Reverse Proxy → Web Server
(load balancing, SSL termination, caching, security)
```

**Common Reverse Proxies:**
- **Nginx**: High-performance, load balancing, SSL termination
- **HAProxy**: TCP/HTTP load balancing, health checks
- **Envoy**: Modern, Cloud-native, service mesh ready
- **Traefik**: Auto-discovery with Docker/Kubernetes

### 2.6 Database Replication

```
                    Primary (Write)
                   /      |       \
              Replica1  Replica2  Replica3
              (Read)    (Read)    (Read)
```

**Replication Types:**

| Type | Description | Trade-off |
|------|-------------|-----------|
| **Synchronous** | Write confirmed after all replicas update | Strong consistency, higher latency |
| **Asynchronous** | Write confirmed immediately, replicas update later | Low latency, possible data loss |
| **Semi-synchronous** | Write confirmed after at least 1 replica | Balance between the two |

---

## Chapter 3: Back-of-the-Envelope Estimation

### 3.1 Numbers Every Engineer Should Know

```
L1 Cache Reference:          0.5 ns
L2 Cache Reference:          7 ns
Main Memory Reference:       100 ns
SSD Random Read:             150 μs
HDD Random Read:             10 ms
Read 1 MB Sequential (SSD):  1 ms
Read 1 MB Sequential (HDD):  20 ms
Same Datacenter Round Trip:  0.5 ms
Cross-Continent Round Trip:  150 ms
```

### 3.2 Common Calculations

**QPS (Queries Per Second):**
```
Daily Active Users (DAU) × Requests per User per Day
÷ 86,400 (seconds in a day)
= Average QPS

Peak QPS = Average QPS × 2-5x
```

**Storage Estimation:**
```
Data per record × Records per day × Days to store
= Total storage needed

Example:
500 bytes/user × 10M users × 365 days × 3 years
= 5.475 TB
```

**Bandwidth Estimation:**
```
QPS × Average Response Size
= Bandwidth needed

10,000 QPS × 50 KB = 500 MB/s = 4 Gbps
```

### 3.3 Example Estimation: URL Shortener

```
Requirements:
- 100M new URLs/month
- 10:1 read:write ratio
- URL valid for 5 years

Write QPS:
100M / (30 × 24 × 3600) = ~39 writes/sec
Peak write QPS = 39 × 3 = ~120 writes/sec

Read QPS:
39 × 10 = 390 reads/sec
Peak read QPS = 390 × 3 = ~1,200 reads/sec

Storage (5 years):
100M × 12 × 5 = 6B URLs
6B × 500 bytes = 3 TB storage

Bandwidth:
1,200 × 500 bytes = 600 KB/s = ~5 Mbps (read)
```

---

## Key Takeaways

1. **Distributed systems trade consistency for availability** (and vice versa)
2. **CAP theorem** is theoretical; PACELC is practical
3. **Building blocks** (load balancers, caches, queues, CDNs) compose to form systems
4. **Estimation** is about reasonable assumptions, not precise math
5. **Understand trade-offs** — every design decision has costs
