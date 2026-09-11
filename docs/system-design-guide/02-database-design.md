# Database Design & Data Modeling

## Chapter 4: Database Fundamentals

### 4.1 SQL vs NoSQL

| Feature | SQL (Relational) | NoSQL (Non-relational) |
|---------|-----------------|----------------------|
| **Schema** | Fixed schema, enforced | Dynamic schema, flexible |
| **Scaling** | Vertical (bigger machine) | Horizontal (more machines) |
| **Consistency** | Strong (ACID) | Eventual (BASE) |
| **Joins** | Native support | Application-level or denormalized |
| **Best For** | Complex queries, transactions | High throughput, flexible data |
| **Examples** | PostgreSQL, MySQL, Oracle | MongoDB, Redis, Cassandra, DynamoDB |

### 4.2 SQL Database Deep Dive

**ACID Properties:**

```
Atomicity    → Transaction is all-or-nothing
Consistency  → Data always valid (constraints, cascades, triggers)
Isolation    → Concurrent transactions don't interfere
Durability   → Committed data survives crashes
```

**Normalization (1NF → 3NF):**

```
1NF: No repeating groups, atomic values
     Orders: [Order1, Order2] → Separate rows

2NF: No partial dependency (all non-key columns depend on entire PK)
     Orders: (OrderID, ProductID) → ProductName should be in Products table

3NF: No transitive dependency (non-key columns don't depend on other non-key columns)
     Employees: DepartmentName depends on DepartmentID, not directly on EmployeeID
```

**Indexing:**

```
B-Tree Index (default):
- Good for: equality, range queries, sorting
- Example: CREATE INDEX idx_users_email ON users(email)

Hash Index:
- Good for: exact equality lookups only
- Example: CREATE INDEX idx_cache_key USING HASH ON cache(key)

Composite Index:
- Good for: multi-column queries
- Example: CREATE INDEX idx_orders_user_date ON orders(user_id, created_at)
- Column order matters! (user_id first, then created_at)
```

**Index Selection Rules:**
```
1. Index columns in WHERE clause
2. Index columns in JOIN conditions
3. Index columns in ORDER BY
4. Don't over-index (slows down writes)
5. Use covering indexes for frequent queries
6. Consider partial indexes for filtered queries
```

### 4.3 NoSQL Database Types

**Document Store (MongoDB, Couchbase):**
```json
{
  "_id": "user123",
  "name": "Alice",
  "email": "alice@example.com",
  "orders": [
    {"product": "laptop", "price": 999},
    {"product": "mouse", "price": 25}
  ]
}
```
Use when: Flexible schema, nested data, rapid iteration

**Key-Value (Redis, DynamoDB, etcd):**
```
Key: "user:123:profile"
Value: { name: "Alice", age: 30 }
TTL: 3600 seconds
```
Use when: Simple lookups, caching, sessions, feature flags

**Column-Family (Cassandra, HBase):**
```
Row Key: user123
Column Family: profile
  name: "Alice"
  age: 30
Column Family: activity
  login: "2024-01-15"
  purchases: ["item1", "item2"]
```
Use when: Wide-column data, time-series, write-heavy workloads

**Graph (Neo4j, Amazon Neptune):**
```
(Alice)-[:FRIENDS_WITH]->(Bob)
(Alice)-[:PURCHASED]->(Laptop)
(Bob)-[:PURCHASED]->(Mouse)
```
Use when: Relationships matter (social networks, recommendations)

### 4.4 Sharding

Split large database across multiple machines.

```
Before Sharding:
┌──────────────────────────┐
│   Single Database        │
│   10TB, 100K QPS        │
└──────────────────────────┘

After Sharding (by user_id % 3):
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  Shard 0     │ │  Shard 1     │ │  Shard 2     │
│  user 0,3,6  │ │  user 1,4,7  │ │  user 2,5,8  │
│  3.3TB       │ │  3.3TB       │ │  3.3TB       │
│  33K QPS     │ │  33K QPS     │ │  33K QPS     │
└──────────────┘ └──────────────┘ └──────────────┘
```

**Sharding Strategies:**

| Strategy | How | Pros | Cons |
|----------|-----|------|------|
| **Range-based** | user_id 1-1M → Shard0 | Easy to implement | Hotspots, uneven distribution |
| **Hash-based** | hash(user_id) % N | Even distribution | Range queries hard, rehashing |
| **Directory-based** | Lookup table maps keys to shards | Flexible, custom logic | Lookup table is SPOF |
| **Geo-based** | Region → Shard | Low latency by region | Uneven data, cross-region queries |

**Sharding Challenges:**
```
1. Cross-shard queries → Denormalize or use scatter-gather
2. Joins across shards → Application-level joins or materialized views
3. Resharding → Consistent hashing (virtual nodes)
4. Hotspots → Replicate hot shards, use local caching
```

### 4.5 Database Replication Patterns

**Single Primary, Multiple Replicas:**
```
                    ┌──────────────┐
                    │   Primary    │
                    │   (Write)    │
                    └──────┬───────┘
                           │ Replication
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │ Replica1 │ │ Replica2 │ │ Replica3 │
        │  (Read)  │ │  (Read)  │ │  (Read)  │
        └──────────┘ └──────────┘ └──────────┘
```

**Multi-Primary (Active-Active):**
```
┌──────────────┐    ┌──────────────┐
│  Primary 1   │◄──►│  Primary 2   │
│  (Read/Write)│    │  (Read/Write)│
└──────┬───────┘    └──────┬───────┘
       │ Replication       │ Replication
       ▼                   ▼
┌──────────┐          ┌──────────┐
│ Replica1 │          │ Replica2 │
└──────────┘          └──────────┘
```
Challenge: Conflict resolution (last-write-wins, vector clocks)

---

## Chapter 5: Consistent Hashing

### 5.1 The Problem

Traditional hash ring: `hash(key) % N` where N is number of servers.

```
Problem: When you add/remove a server, almost ALL keys need remapping!

Before: Server0, Server1, Server2
hash("user1") % 3 = 0 → Server0
hash("user2") % 3 = 1 → Server1

After adding Server3:
hash("user1") % 4 = 2 → Server2 (was Server0!)
hash("user2") % 4 = 2 → Server2 (was Server1!)
```

### 5.2 Consistent Hashing Solution

```
     0 (Server0)
      ╱  ╲
     ╱    ╲
    ╱      ╲
 270        90
(Server2)   (Server1)
     ╲      ╱
      ╲    ╱
       ╲  ╱
       180

Key "user1" hashes to 45 → Server1 (next clockwise)
Key "user2" hashes to 120 → Server2 (next clockwise)
```

**Adding Server3 at position 200:**
- Only keys between 180-200 need remapping (a small fraction!)
- Other keys stay on their servers

**Virtual Nodes:**
- Each server gets multiple positions on the ring
- Improves load distribution
- Example: 200 virtual nodes per physical server

```
Ring with virtual nodes:
  S1-v1 → S1-v2 → S2-v1 → S1-v3 → S2-v2 → S3-v1 → ...
  
Each virtual node maps to physical server
Physical server load = sum of its virtual nodes' load
```

### 5.3 Use Cases

- **Distributed caches**: Redis Cluster, Memcached
- **Distributed databases**: Cassandra, DynamoDB
- **Load balancing**: Nginx upstream with consistent hash
- **CDNs**: Route requests to nearest edge server

---

## Chapter 6: Data-Intensive Application Patterns

### 6.1 CQRS (Command Query Responsibility Segregation)

Separate read and write models.

```
         Write Model                    Read Model
┌─────────────────────┐        ┌─────────────────────┐
│   Commands          │        │   Queries            │
│   (Create, Update,  │        │   (Search, List,     │
│    Delete)          │        │    Dashboard, Report) │
│                     │        │                     │
│   Normalized DB     │ Event  │   Denormalized DB   │
│   (PostgreSQL)      │───────→│   (Elasticsearch)   │
│                     │ Bus    │   (Redis)           │
└─────────────────────┘        └─────────────────────┘
```

**When to Use:**
- Read and write patterns differ significantly
- Read-heavy system (90% reads, 10% writes)
- Different scaling needs for reads vs writes
- Complex queries that are expensive to compute

### 6.2 Event Sourcing

Store all changes as a sequence of events instead of current state.

```
Traditional (Current State):
Account Balance = $500

Event Sourcing (Event Log):
1. AccountCreated(amount=0)
2. Deposit(amount=1000)
3. Withdraw(amount=300)
4. Withdraw(amount=200)
→ Current Balance = $500 (computed from events)
```

**Benefits:**
- Complete audit trail
- Temporal queries ("what was the state at time T?")
- Event replay for debugging
- Natural fit for event-driven architecture

**Challenges:**
- Event schema evolution
- Event store grows indefinitely (need snapshots)
- Complex to query current state

### 6.3 Saga Pattern

Distributed transactions without 2PC.

```
Order Saga:
1. CreateOrder → Success → 
2. ReserveInventory → Success →
3. ProcessPayment → Success → 
4. ShipOrder → Success → Complete

If step 3 fails:
3. ProcessPayment → Failure →
2'. ReleaseInventory (Compensate) →
1'. CancelOrder (Compensate) → Rollback
```

**Two Implementations:**

| Type | Description | Pros | Cons |
|------|-------------|------|------|
| **Choreography** | Each service publishes events, others react | Loose coupling | Hard to track flow |
| **Orchestration** | Central coordinator tells services what to do | Easy to understand | Single point of failure |

### 6.4 API Design Patterns

**REST API:**
```
GET    /api/v1/users          → List users
POST   /api/v1/users          → Create user
GET    /api/v1/users/:id      → Get user
PUT    /api/v1/users/:id      → Update user
DELETE /api/v1/users/:id      → Delete user

Nested:
GET    /api/v1/users/:id/orders → User's orders
```

**GraphQL:**
```graphql
query {
  user(id: "123") {
    name
    email
    orders {
      product
      price
    }
  }
}
```

**gRPC:**
```protobuf
service UserService {
  rpc GetUser(GetUserRequest) returns (User);
  rpc ListUsers(ListUsersRequest) returns (stream User);
}
```

**Comparison:**

| Feature | REST | GraphQL | gRPC |
|---------|------|---------|------|
| Protocol | HTTP/1.1 | HTTP/1.1 | HTTP/2 |
| Schema | OpenAPI (optional) | Strongly typed | Protobuf |
| Caching | HTTP cache built-in | Manual | Manual |
| Real-time | WebSocket/SSE | Subscriptions | Streaming |
| Use case | CRUD APIs | Complex queries | Microservices |
