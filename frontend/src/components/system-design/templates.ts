// frontend/src/components/system-design/templates.ts
import type { SDTemplate } from "./types";

export const DEFAULT_TEMPLATES: SDTemplate[] = [
  {
    id: "url-shortener",
    title: "TinyURL / URL Shortener",
    category: "Beginner",
    difficulty: "Beginner",
    desc: "High-throughput URL redirection with 100:1 read-to-write ratio and 100M daily active links.",
    rps: "11,500 RPS (Peak 35K)",
    storage: "15 TB / year",
    readWriteRatio: "100:1",
    latencyTarget: "< 15ms P99",
    tradeOffs: [
      "Base62 vs MD5 hashing for short codes",
      "Redis Cache-Aside vs In-Memory Gateway Cache",
      "PostgreSQL B-Tree vs DynamoDB Partition Key"
    ],
    nodes: [
      { id: "client", label: "Client (Web/Mobile)", type: "client", x: 40, y: 160, tech: "HTTP/2, HTTPS", instances: "Global" },
      { id: "cdn", label: "Cloudflare CDN / DNS", type: "cdn", x: 180, y: 160, tech: "Edge Anycast", instances: "300+ PoPs" },
      { id: "lb", label: "NLB / API Gateway", type: "lb", x: 320, y: 160, tech: "Nginx / Envoy", instances: "4 Nodes" },
      { id: "api_write", label: "URL Shortener Service", type: "service", x: 470, y: 70, tech: "Go Cluster", instances: "12 Pods" },
      { id: "api_read", label: "Redirect Gateway", type: "service", x: 470, y: 250, tech: "Rust Fast-Path", instances: "24 Pods" },
      { id: "cache", label: "Redis Cluster (LRU)", type: "cache", x: 630, y: 160, tech: "Redis 7.2", instances: "6 Shards" },
      { id: "db_primary", label: "PostgreSQL Primary", type: "db", x: 630, y: 40, tech: "PostgreSQL 16", instances: "1 Primary" },
      { id: "db_replicas", label: "Read Replicas (x3)", type: "db", x: 630, y: 280, tech: "Read Pool", instances: "3 Replicas" },
      { id: "kafka", label: "Kafka Click Stream", type: "queue", x: 320, y: 360, tech: "Kafka 3.7", instances: "3 Brokers" },
      { id: "analytics", label: "ClickHouse OLAP", type: "storage", x: 500, y: 360, tech: "Analytics DB", instances: "2 Nodes" }
    ],
    connections: [
      { from: "client", to: "cdn", label: "HTTPS (20K RPS)" },
      { from: "cdn", to: "lb", label: "TCP Keep-Alive" },
      { from: "lb", to: "api_write", label: "POST /api/shorten" },
      { from: "lb", to: "api_read", label: "GET /{shortCode}" },
      { from: "api_write", to: "db_primary", label: "INSERT url (Sync)" },
      { from: "api_write", to: "cache", label: "SET key:url (Async)" },
      { from: "api_read", to: "cache", label: "GET key:url (98% Hit)" },
      { from: "api_read", to: "db_replicas", label: "Fallback Read" },
      { from: "db_primary", to: "db_replicas", label: "WAL Streaming" },
      { from: "api_read", to: "kafka", label: "Click Events (Async)" },
      { from: "kafka", to: "analytics", label: "Batch Ingestion" }
    ]
  },
  {
    id: "notification-system",
    title: "Global Notification Platform",
    category: "Intermediate",
    difficulty: "Intermediate",
    desc: "Multi-channel (Push, SMS, Email, In-App) notification platform with priority queues and rate limiting.",
    rps: "50,000 RPS (Peak 200K)",
    storage: "40 TB / year",
    readWriteRatio: "1:10",
    latencyTarget: "< 200ms E2E",
    tradeOffs: [
      "Priority Queue Partitioning vs Single Stream",
      "Per-User Rate Limiting in Redis Token Bucket vs DB",
      "At-Least-Once Delivery with Idempotency Keys"
    ],
    nodes: [
      { id: "client", label: "Client Apps", type: "client", x: 40, y: 160, tech: "Mobile & Web", instances: "Global" },
      { id: "lb", label: "API Gateway & Rate Limiter", type: "lb", x: 190, y: 160, tech: "Kong / Redis Limiter", instances: "6 Nodes" },
      { id: "ingest", label: "Notification Ingestion Service", type: "service", x: 350, y: 160, tech: "Node / Go Cluster", instances: "16 Pods" },
      { id: "user_db", label: "User Preference & Device DB", type: "db", x: 350, y: 40, tech: "PostgreSQL / DynamoDB", instances: "Cluster" },
      { id: "kafka_priority", label: "Kafka Priority Queues", type: "queue", x: 520, y: 160, tech: "Kafka 3.7", instances: "12 Partitions" },
      { id: "worker_push", label: "APNs / FCM Push Workers", type: "service", x: 690, y: 60, tech: "Go Worker Pool", instances: "20 Pods" },
      { id: "worker_email", label: "SES Email Workers", type: "service", x: 690, y: 160, tech: "Batch Workers", instances: "10 Pods" },
      { id: "worker_sms", label: "Twilio SMS Workers", type: "service", x: 690, y: 260, tech: "Rate-Guarded Workers", instances: "8 Pods" },
      { id: "dedup_cache", label: "Idempotency & Dedup Cache", type: "cache", x: 520, y: 300, tech: "Redis TTL", instances: "3 Nodes" }
    ],
    connections: [
      { from: "client", to: "lb", label: "POST /v1/notify" },
      { from: "lb", to: "ingest", label: "Validated Token" },
      { from: "ingest", to: "user_db", label: "Fetch Settings" },
      { from: "ingest", to: "dedup_cache", label: "Check Idempotency" },
      { from: "ingest", to: "kafka_priority", label: "Enqueue Message" },
      { from: "kafka_priority", to: "worker_push", label: "Push Channel" },
      { from: "kafka_priority", to: "worker_email", label: "Email Channel" },
      { from: "kafka_priority", to: "worker_sms", label: "SMS Channel" }
    ]
  },
  {
    id: "whatsapp-chat",
    title: "WhatsApp / Real-Time Chat System",
    category: "Advanced",
    difficulty: "Advanced",
    desc: "End-to-end encrypted messaging for 2B users with presence detection, media storage, and offline queuing.",
    rps: "500,000 RPS (Peak 2M)",
    storage: "2 PB / year",
    readWriteRatio: "1:1",
    latencyTarget: "< 50ms Delivery",
    tradeOffs: [
      "Stateful WebSocket Gateway vs Long-Polling",
      "Cassandra / ScyllaDB for Message History vs DynamoDB",
      "Redis Cluster for Ephemeral Online Presence"
    ],
    nodes: [
      { id: "client_sender", label: "Sender App", type: "client", x: 40, y: 90, tech: "iOS / Android", instances: "Online" },
      { id: "client_receiver", label: "Receiver App", type: "client", x: 40, y: 260, tech: "iOS / Android", instances: "Online/Offline" },
      { id: "ws_gateway", label: "WebSocket Gateway Cluster", type: "lb", x: 220, y: 170, tech: "Erlang / Go Epoll", instances: "50 Nodes" },
      { id: "presence", label: "Presence & Session Service", type: "service", x: 380, y: 60, tech: "Redis Hash Ring", instances: "16 Nodes" },
      { id: "msg_service", label: "Message Routing Service", type: "service", x: 380, y: 170, tech: "Go Microservice", instances: "32 Pods" },
      { id: "offline_queue", label: "Offline Message Queue", type: "queue", x: 550, y: 270, tech: "Kafka / RabbitMQ", instances: "Cluster" },
      { id: "chat_db", label: "Cassandra / ScyllaDB Store", type: "db", x: 550, y: 170, tech: "LSM Wide-Column", instances: "18 Nodes" },
      { id: "media_s3", label: "S3 Object Store + CDN", type: "storage", x: 550, y: 60, tech: "AWS S3 / CloudFront", instances: "Multi-Region" }
    ],
    connections: [
      { from: "client_sender", to: "ws_gateway", label: "WSS TLS 1.3" },
      { from: "client_receiver", to: "ws_gateway", label: "WSS TLS 1.3" },
      { from: "ws_gateway", to: "presence", label: "Heartbeat (5s)" },
      { from: "ws_gateway", to: "msg_service", label: "Send Payload" },
      { from: "msg_service", to: "chat_db", label: "Append Log (Sync)" },
      { from: "msg_service", to: "ws_gateway", label: "Push if Online" },
      { from: "msg_service", to: "offline_queue", label: "Enqueue if Offline" },
      { from: "offline_queue", to: "ws_gateway", label: "Flush on Connect" }
    ]
  },
  {
    id: "uber-backend",
    title: "Uber / Ride Matching Architecture",
    category: "Advanced",
    difficulty: "Advanced",
    desc: "Geospatial indexing (Uber H3 / Google S2), real-time driver tracking, and dynamic surge pricing.",
    rps: "250,000 Updates/s",
    storage: "100 TB / year",
    readWriteRatio: "50:1",
    latencyTarget: "< 30ms Match",
    tradeOffs: [
      "Uber H3 Hexagonal Grid vs S2 Spherical vs Redis GEO",
      "In-Memory RingPop / Actor Model vs Centralized DB",
      "Eventual Consistency for Location vs Strong for Dispatch"
    ],
    nodes: [
      { id: "rider", label: "Rider App", type: "client", x: 40, y: 80, tech: "Mobile App", instances: "Global" },
      { id: "driver", label: "Driver App", type: "client", x: 40, y: 250, tech: "GPS Stream 4s", instances: "5M Drivers" },
      { id: "geo_gateway", label: "Location Ingestion Gateway", type: "lb", x: 210, y: 250, tech: "Netty / gRPC", instances: "24 Nodes" },
      { id: "api_gateway", label: "Rider API Gateway", type: "lb", x: 210, y: 80, tech: "Envoy Proxy", instances: "12 Nodes" },
      { id: "location_service", label: "Location Tracking (H3 Index)", type: "service", x: 390, y: 250, tech: "Redis Spatial Cluster", instances: "32 Nodes" },
      { id: "match_engine", label: "DISPATCH MATCH ENGINE", type: "service", x: 390, y: 80, tech: "Go / Java RingPop", instances: "16 Nodes" },
      { id: "surge_pricing", label: "Dynamic Surge Pricing Service", type: "service", x: 570, y: 40, tech: "Flink Real-time ML", instances: "8 Pods" },
      { id: "trips_db", label: "Trip Store & Payment DB", type: "db", x: 570, y: 160, tech: "PostgreSQL / CockroachDB", instances: "ACID Pool" },
      { id: "kafka_stream", label: "Kafka Event Stream", type: "queue", x: 570, y: 280, tech: "Kafka Pipeline", instances: "24 Brokers" }
    ],
    connections: [
      { from: "driver", to: "geo_gateway", label: "gRPC GPS (4s)" },
      { from: "geo_gateway", to: "location_service", label: "Update H3 Cell" },
      { from: "geo_gateway", to: "kafka_stream", label: "Audit Telemetry" },
      { from: "rider", to: "api_gateway", label: "Request Ride" },
      { from: "api_gateway", to: "match_engine", label: "Find Nearby Drivers" },
      { from: "match_engine", to: "location_service", label: "Query k-Ring Cells" },
      { from: "match_engine", to: "surge_pricing", label: "Calculate Fare" },
      { from: "match_engine", to: "trips_db", label: "Create Trip (ACID)" }
    ]
  },
  {
    id: "tiktok-feed",
    title: "TikTok / Video Feed & Streaming Platform",
    category: "Staff",
    difficulty: "Staff",
    desc: "Personalized For You Page (FYP) algorithm inference, chunked video CDN delivery, and high-concurrency likes/comments.",
    rps: "850,000 RPS (Peak 3.2M)",
    storage: "12 PB / year",
    readWriteRatio: "200:1",
    latencyTarget: "< 25ms Video First-Frame",
    tradeOffs: [
      "Push (Fan-out-on-write) vs Pull (Fan-out-on-read) for celebrity creators",
      "HLS vs DASH adaptive bitrate streaming chunk sizes (2s vs 6s)",
      "Vector DB / Two-Tower embeddings for real-time recommendation scoring"
    ],
    nodes: [
      { id: "client_user", label: "TikTok Mobile App", type: "client", x: 40, y: 160, tech: "ExoPlayer / AVPlayer", instances: "1B DAU" },
      { id: "cdn_video", label: "Global Video CDN Edge", type: "cdn", x: 200, y: 60, tech: "Cloudflare Stream / Fastly", instances: "500+ PoPs" },
      { id: "api_gw", label: "API Gateway & Router", type: "lb", x: 200, y: 240, tech: "Envoy / gRPC Gateway", instances: "32 Nodes" },
      { id: "feed_service", label: "Feed Ranking & FYP Engine", type: "service", x: 380, y: 160, tech: "C++ / Rust ML Scoring", instances: "64 Pods" },
      { id: "vector_db", label: "Vector Search (Milvus/Pinecone)", type: "db", x: 560, y: 60, tech: "HNSW Embeddings", instances: "16 Nodes" },
      { id: "video_store", label: "S3 Video Objects + Transcoder", type: "storage", x: 380, y: 40, tech: "AWS S3 + FFmpeg GPU", instances: "Petabyte Scale" },
      { id: "feed_cache", label: "Redis Cluster (Pre-computed Feeds)", type: "cache", x: 560, y: 160, tech: "Redis In-Memory", instances: "48 Nodes" },
      { id: "user_social_db", label: "User Graph & Comments DB", type: "db", x: 560, y: 270, tech: "TiDB / ScyllaDB", instances: "Distributed SQL" },
      { id: "event_kafka", label: "Watch Time Clickstream", type: "queue", x: 380, y: 320, tech: "Kafka 3.7", instances: "40 Brokers" }
    ],
    connections: [
      { from: "client_user", to: "cdn_video", label: "Stream Video (.mp4 / .m3u8)" },
      { from: "client_user", to: "api_gw", label: "GET /v1/feed" },
      { from: "api_gw", to: "feed_service", label: "Fetch Personalized Batch" },
      { from: "feed_service", to: "feed_cache", label: "Check Pre-Computed Feed" },
      { from: "feed_service", to: "vector_db", label: "Vector Similarity Query" },
      { from: "feed_service", to: "user_social_db", label: "Enrich Metadata" },
      { from: "cdn_video", to: "video_store", label: "Origin Fetch on Miss" },
      { from: "client_user", to: "api_gw", label: "POST /v1/telemetry (Watch Time)" },
      { from: "api_gw", to: "event_kafka", label: "Real-time Feedback Signal" }
    ]
  },
  {
    id: "distributed-rate-limiter",
    title: "Global Distributed Rate Limiter",
    category: "Intermediate",
    difficulty: "Intermediate",
    desc: "Multi-region distributed sliding-window counter & token bucket with low-latency synchronization and graceful degradation.",
    rps: "1,500,000 Check-RPS",
    storage: "500 GB RAM",
    readWriteRatio: "1:1",
    latencyTarget: "< 1.5ms P99 Check",
    tradeOffs: [
      "Sliding Window Log vs Sliding Window Counter vs Token Bucket",
      "Local Envoy sidecar in-memory cache vs centralized Redis cluster",
      "Fail-Open (allow traffic on cluster loss) vs Fail-Closed (security strict)"
    ],
    nodes: [
      { id: "public_client", label: "Internet Clients & Bots", type: "client", x: 40, y: 150, tech: "HTTP REST API", instances: "Global" },
      { id: "edge_waf", label: "Cloudflare Edge WAF & IP Shield", type: "cdn", x: 200, y: 150, tech: "Anycast Edge", instances: "300+ PoPs" },
      { id: "envoy_gw", label: "Envoy API Gateway (Sidecar)", type: "lb", x: 370, y: 150, tech: "Envoy Proxy (gRPC RLS)", instances: "24 Pods" },
      { id: "rl_service", label: "Rate Limit Service (RLS)", type: "service", x: 530, y: 90, tech: "Go / C++ Async Engine", instances: "16 Pods" },
      { id: "redis_cluster", label: "Redis Cluster (Token Bucket Lua)", type: "cache", x: 710, y: 90, tech: "Redis 7.2 Memory", instances: "12 Shards" },
      { id: "shadow_metrics", label: "Prometheus & Audit Stream", type: "queue", x: 530, y: 250, tech: "Kafka / Prometheus", instances: "Cluster" },
      { id: "backend_apps", label: "Core Business Backend Services", type: "service", x: 710, y: 220, tech: "Microservices", instances: "Protected" }
    ],
    connections: [
      { from: "public_client", to: "edge_waf", label: "HTTPS Ingress" },
      { from: "edge_waf", to: "envoy_gw", label: "Forward Allowed Requests" },
      { from: "envoy_gw", to: "rl_service", label: "CheckRateLimit(clientID)" },
      { from: "rl_service", to: "redis_cluster", label: "EVALSHA token_bucket.lua" },
      { from: "rl_service", to: "shadow_metrics", label: "Log 429 / 200 Stats" },
      { from: "envoy_gw", to: "backend_apps", label: "Pass Traffic (If 200 OK)" }
    ]
  },
  {
    id: "stripe-payments",
    title: "Stripe / Distributed Payment Processing Engine",
    category: "Staff",
    difficulty: "Staff",
    desc: "Zero-loss financial transactions, distributed two-phase commit, double-entry ledger bookkeeping, and strict idempotency.",
    rps: "25,000 Transactions/s",
    storage: "80 TB / year",
    readWriteRatio: "1:2",
    latencyTarget: "< 250ms E2E Authorization",
    tradeOffs: [
      "Two-Phase Commit (2PC) vs Saga Choreography/Orchestration",
      "Immutable append-only ledger vs mutable account balances",
      "Strong consistency (Serializable ACID) vs High availability partitions"
    ],
    nodes: [
      { id: "checkout_client", label: "Merchant & Checkout Client", type: "client", x: 40, y: 150, tech: "Stripe.js SDK", instances: "Worldwide" },
      { id: "pay_gw", label: "Secure Payment API Gateway", type: "lb", x: 200, y: 150, tech: "PCI-DSS Level 1 Gateway", instances: "12 Nodes" },
      { id: "idempotency_store", label: "Idempotency Lock (Redis TTL)", type: "cache", x: 360, y: 40, tech: "Redis Redlock", instances: "6 Nodes" },
      { id: "orchestrator", label: "Payment Saga Orchestrator", type: "service", x: 360, y: 170, tech: "Temporal / Go Workflow", instances: "24 Pods" },
      { id: "bank_acquirer", label: "Visa / Mastercard Acquirer Bank", type: "service", x: 550, y: 50, tech: "ISO 8583 Banking API", instances: "External" },
      { id: "ledger_db", label: "Double-Entry Ledger (Immutable)", type: "db", x: 550, y: 170, tech: "CockroachDB / Spanner", instances: "Multi-Region Raft" },
      { id: "outbox_queue", label: "Transactional Outbox Queue", type: "queue", x: 550, y: 290, tech: "Kafka / Debezium CDC", instances: "8 Brokers" },
      { id: "webhook_dispatcher", label: "Merchant Webhook Dispatcher", type: "service", x: 730, y: 290, tech: "Async HTTP Worker", instances: "30 Pods" }
    ],
    connections: [
      { from: "checkout_client", to: "pay_gw", label: "POST /v1/charges (Idempotency-Key)" },
      { from: "pay_gw", to: "idempotency_store", label: "Acquire Mutex Key" },
      { from: "pay_gw", to: "orchestrator", label: "Start Payment Workflow" },
      { from: "orchestrator", to: "bank_acquirer", label: "Auth & Capture Funds" },
      { from: "orchestrator", to: "ledger_db", label: "Credit/Debit Balancing Entry" },
      { from: "orchestrator", to: "outbox_queue", label: "Publish Event via Outbox" },
      { from: "outbox_queue", to: "webhook_dispatcher", label: "Payment Success Trigger" },
      { from: "webhook_dispatcher", to: "checkout_client", label: "Signed HTTPS Webhook" }
    ]
  }
];

export const GUIDED_STEPS = [
  {
    step: 1,
    title: "1. Client & DNS Resolution",
    instruction: "When a user enters a URL or opens the mobile app, where does the request resolve first?",
    question: "Which component converts human domain names into IP addresses and routes to nearest edge?",
    options: [
      { label: "CDN / Anycast DNS", correct: true, feedback: "✅ Correct! Anycast DNS and CDN route users to the closest point of presence with ultra-low latency." },
      { label: "Direct Primary Database", correct: false, feedback: "❌ Incorrect. Direct clients should never connect directly to a database due to security and connection limits." },
      { label: "Kafka Event Broker", correct: false, feedback: "❌ Incorrect. Kafka is an internal message broker, not a public DNS resolver." }
    ],
    recommendNode: "cdn"
  },
  {
    step: 2,
    title: "2. Load Balancing & Traffic Guard",
    instruction: "Millions of concurrent requests hit your edge servers. How do you distribute load across application servers?",
    question: "What layer inspects SSL certificates, health checks instances, and applies rate limiting?",
    options: [
      { label: "Load Balancer & API Gateway", correct: true, feedback: "✅ Correct! NLB / ALB and API Gateways distribute traffic, terminate TLS, and enforce security rate limits." },
      { label: "Redis In-Memory Store", correct: false, feedback: "❌ Incorrect. Redis is a data store/cache, not a layer 4/7 reverse proxy." },
      { label: "Cron Worker", correct: false, feedback: "❌ Incorrect. Cron workers run asynchronous scheduled jobs." }
    ],
    recommendNode: "lb"
  },
  {
    step: 3,
    title: "3. Stateless Microservices",
    instruction: "Your core business logic executes here. How should your application tier be structured?",
    question: "Why must web/API service instances remain completely stateless?",
    options: [
      { label: "Stateless services allow instant horizontal auto-scaling", correct: true, feedback: "✅ Correct! Stateless servers don't store user session in memory, allowing any server to handle any request." },
      { label: "Stateless servers store database files locally on disk", correct: false, feedback: "❌ Incorrect. Storing state on local disks prevents horizontal auto-scaling." }
    ],
    recommendNode: "service"
  },
  {
    step: 4,
    title: "4. Caching & Fast Read Path",
    instruction: "98% of your traffic is reading existing data. Database queries are taking 80ms.",
    question: "How do you achieve sub-millisecond response times for frequent reads?",
    options: [
      { label: "Redis / Memcached In-Memory Cache (Cache-Aside)", correct: true, feedback: "✅ Correct! In-memory caches serve hot read data in < 2ms, offloading 95%+ of queries from relational DBs." },
      { label: "Write all data to flat text files", correct: false, feedback: "❌ Incorrect. Text files lack concurrency control and indexing." }
    ],
    recommendNode: "cache"
  },
  {
    step: 5,
    title: "5. Persistent Storage & Replication",
    instruction: "You need ACID transactions and durable storage for user data.",
    question: "How do you protect against single database failure and scale heavy read traffic?",
    options: [
      { label: "Primary Database with Read Replicas (WAL Streaming)", correct: true, feedback: "✅ Correct! Primary handles writes with WAL replication to Read Replicas for scalable queries." },
      { label: "Single SQLite file on the web server", correct: false, feedback: "❌ Incorrect. SQLite has single-writer locks and lacks distributed replication." }
    ],
    recommendNode: "db"
  }
];
