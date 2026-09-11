import { Router, type Request, type Response } from 'express';

export const systemDesignRouter = Router();

export interface SDTemplate {
  id: string;
  title: string;
  category: string;
  icon: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Staff";
  desc: string;
  rps: string;
  storage: string;
  readWriteRatio: string;
  latencyTarget: string;
  tradeOffs: string[];
  nodes: any[];
  connections: any[];
}

const TEMPLATES: SDTemplate[] = [
  {
    id: "url-shortener",
    title: "TinyURL / URL Shortener",
    category: "Beginner",
    icon: "🔗",
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
      { id: "client", label: "Client (Web/Mobile)", type: "client", x: 40, y: 160, icon: "📱", tech: "HTTP/2, HTTPS", instances: "Global" },
      { id: "cdn", label: "Cloudflare CDN / DNS", type: "cdn", x: 180, y: 160, icon: "🌐", tech: "Edge Anycast", instances: "300+ PoPs" },
      { id: "lb", label: "NLB / API Gateway", type: "lb", x: 320, y: 160, icon: "⚖️", tech: "Nginx / Envoy", instances: "4 Nodes" },
      { id: "api_write", label: "URL Shortener Service", type: "service", x: 470, y: 70, icon: "⚡", tech: "Go Cluster", instances: "12 Pods" },
      { id: "api_read", label: "Redirect Gateway", type: "service", x: 470, y: 250, icon: "🔄", tech: "Rust Fast-Path", instances: "24 Pods" },
      { id: "cache", label: "Redis Cluster (LRU)", type: "cache", x: 630, y: 160, icon: "⚡", tech: "Redis 7.2", instances: "6 Shards" },
      { id: "db_primary", label: "PostgreSQL Primary", type: "db", x: 630, y: 40, icon: "🗄️", tech: "PostgreSQL 16", instances: "1 Primary" },
      { id: "db_replicas", label: "Read Replicas (x3)", type: "db", x: 630, y: 280, icon: "📑", tech: "Read Pool", instances: "3 Replicas" },
      { id: "kafka", label: "Kafka Click Stream", type: "queue", x: 320, y: 360, icon: "📨", tech: "Kafka 3.7", instances: "3 Brokers" },
      { id: "analytics", label: "ClickHouse OLAP", type: "storage", x: 500, y: 360, icon: "📊", tech: "Analytics DB", instances: "2 Nodes" }
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
    icon: "🔔",
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
      { id: "client", label: "Client Apps", type: "client", x: 40, y: 160, icon: "📱", tech: "Mobile & Web", instances: "Global" },
      { id: "lb", label: "API Gateway & Rate Limiter", type: "lb", x: 190, y: 160, icon: "🛡️", tech: "Kong / Redis Limiter", instances: "6 Nodes" },
      { id: "ingest", label: "Notification Ingestion Service", type: "service", x: 350, y: 160, icon: "⚡", tech: "Node / Go Cluster", instances: "16 Pods" },
      { id: "user_db", label: "User Preference & Device DB", type: "db", x: 350, y: 40, icon: "🗄️", tech: "PostgreSQL / DynamoDB", instances: "Cluster" },
      { id: "kafka_priority", label: "Kafka Priority Queues (High/Med/Low)", type: "queue", x: 520, y: 160, icon: "📨", tech: "Kafka 3.7", instances: "12 Partitions" },
      { id: "worker_push", label: "APNs / FCM Push Workers", type: "service", x: 690, y: 60, icon: "📲", tech: "Go Worker Pool", instances: "20 Pods" },
      { id: "worker_email", label: "SES Email Workers", type: "service", x: 690, y: 160, icon: "📧", tech: "Batch Workers", instances: "10 Pods" },
      { id: "worker_sms", label: "Twilio SMS Workers", type: "service", x: 690, y: 260, icon: "💬", tech: "Rate-Guarded Workers", instances: "8 Pods" },
      { id: "dedup_cache", label: "Idempotency & Dedup Cache", type: "cache", x: 520, y: 300, icon: "⚡", tech: "Redis TTL", instances: "3 Nodes" }
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
    icon: "💬",
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
      { id: "client_sender", label: "Sender App", type: "client", x: 40, y: 90, icon: "📱", tech: "iOS / Android", instances: "Online" },
      { id: "client_receiver", label: "Receiver App", type: "client", x: 40, y: 260, icon: "📱", tech: "iOS / Android", instances: "Online/Offline" },
      { id: "ws_gateway", label: "WebSocket Gateway Cluster", type: "lb", x: 220, y: 170, icon: "⚡", tech: "Erlang / Go Epoll", instances: "50 Nodes" },
      { id: "presence", label: "Presence & Session Service", type: "service", x: 380, y: 60, icon: "🟢", tech: "Redis Hash Ring", instances: "16 Nodes" },
      { id: "msg_service", label: "Message Routing Service", type: "service", x: 380, y: 170, icon: "🔄", tech: "Go Microservice", instances: "32 Pods" },
      { id: "offline_queue", label: "Offline Message Queue", type: "queue", x: 550, y: 270, icon: "📥", tech: "Kafka / RabbitMQ", instances: "Cluster" },
      { id: "chat_db", label: "Cassandra / ScyllaDB Store", type: "db", x: 550, y: 170, icon: "🗄️", tech: "LSM Wide-Column", instances: "18 Nodes" },
      { id: "media_s3", label: "S3 Object Store + CDN", type: "storage", x: 550, y: 60, icon: "📦", tech: "AWS S3 / CloudFront", instances: "Multi-Region" }
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
    icon: "🚗",
    difficulty: "Advanced",
    desc: "Geospatial indexing (Uber H3 / Google S2), real-time driver tracking, and dynamic surge pricing.",
    rps: "250,000 Location Updates/s",
    storage: "100 TB / year",
    readWriteRatio: "50:1",
    latencyTarget: "< 30ms Match Time",
    tradeOffs: [
      "Uber H3 Hexagonal Grid vs S2 Spherical vs Redis GEO",
      "In-Memory RingPop / Actor Model vs Centralized DB",
      "Eventual Consistency for Location vs Strong for Dispatch"
    ],
    nodes: [
      { id: "rider", label: "Rider App", type: "client", x: 40, y: 80, icon: "👤", tech: "Mobile App", instances: "Global" },
      { id: "driver", label: "Driver App", type: "client", x: 40, y: 250, icon: "🚕", tech: "GPS Stream 4s", instances: "5M Drivers" },
      { id: "geo_gateway", label: "Location Ingestion Gateway", type: "lb", x: 210, y: 250, icon: "📍", tech: "Netty / gRPC", instances: "24 Nodes" },
      { id: "api_gateway", label: "Rider API Gateway", type: "lb", x: 210, y: 80, icon: "🌐", tech: "Envoy Proxy", instances: "12 Nodes" },
      { id: "location_service", label: "Location Tracking (H3 Index)", type: "service", x: 390, y: 250, icon: "🗺️", tech: "Redis Spatial Cluster", instances: "32 Nodes" },
      { id: "match_engine", label: "DISPATCH MATCH ENGINE", type: "service", x: 390, y: 80, icon: "⚡", tech: "Go / Java RingPop", instances: "16 Nodes" },
      { id: "surge_pricing", label: "Dynamic Surge Pricing Service", type: "service", x: 570, y: 40, icon: "📈", tech: "Flink Real-time ML", instances: "8 Pods" },
      { id: "trips_db", label: "Trip Store & Payment DB", type: "db", x: 570, y: 160, icon: "🗄️", tech: "PostgreSQL / CockroachDB", instances: "ACID Pool" },
      { id: "kafka_stream", label: "Kafka Event Stream", type: "queue", x: 570, y: 280, icon: "📨", tech: "Kafka Pipeline", instances: "24 Brokers" }
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
    icon: "🎵",
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
      { id: "client_user", label: "TikTok Mobile App", type: "client", x: 40, y: 160, icon: "📱", tech: "ExoPlayer / AVPlayer", instances: "1B DAU" },
      { id: "cdn_video", label: "Global Video CDN Edge", type: "cdn", x: 200, y: 60, icon: "🌐", tech: "Cloudflare Stream / Fastly", instances: "500+ PoPs" },
      { id: "api_gw", label: "API Gateway & Router", type: "lb", x: 200, y: 240, icon: "🛡️", tech: "Envoy / gRPC Gateway", instances: "32 Nodes" },
      { id: "feed_service", label: "Feed Ranking & FYP Engine", type: "service", x: 380, y: 160, icon: "⚡", tech: "C++ / Rust ML Scoring", instances: "64 Pods" },
      { id: "vector_db", label: "Vector Search (Milvus/Pinecone)", type: "db", x: 560, y: 60, icon: "🧠", tech: "HNSW Embeddings", instances: "16 Nodes" },
      { id: "video_store", label: "S3 Video Objects + Transcoder", type: "storage", x: 380, y: 40, icon: "🎥", tech: "AWS S3 + FFmpeg GPU", instances: "Petabyte Scale" },
      { id: "feed_cache", label: "Redis Cluster (Pre-computed Feeds)", type: "cache", x: 560, y: 160, icon: "⚡", tech: "Redis In-Memory", instances: "48 Nodes" },
      { id: "user_social_db", label: "User Graph & Comments DB", type: "db", x: 560, y: 270, icon: "🗄️", tech: "TiDB / ScyllaDB", instances: "Distributed SQL" },
      { id: "event_kafka", label: "Watch Time Clickstream", type: "queue", x: 380, y: 320, icon: "📨", tech: "Kafka 3.7", instances: "40 Brokers" }
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
    icon: "⏱️",
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
      { id: "public_client", label: "Internet Clients & Bots", type: "client", x: 40, y: 150, icon: "🌐", tech: "HTTP REST API", instances: "Global" },
      { id: "edge_waf", label: "Cloudflare Edge WAF & IP Shield", type: "cdn", x: 200, y: 150, icon: "🛡️", tech: "Anycast Edge", instances: "300+ PoPs" },
      { id: "envoy_gw", label: "Envoy API Gateway (Sidecar)", type: "lb", x: 370, y: 150, icon: "⚖️", tech: "Envoy Proxy (gRPC RLS)", instances: "24 Pods" },
      { id: "rl_service", label: "Rate Limit Service (RLS)", type: "service", x: 530, y: 90, icon: "⚡", tech: "Go / C++ Async Engine", instances: "16 Pods" },
      { id: "redis_cluster", label: "Redis Cluster (Token Bucket Lua)", type: "cache", x: 710, y: 90, icon: "⚡", tech: "Redis 7.2 Memory", instances: "12 Shards" },
      { id: "shadow_metrics", label: "Prometheus & Audit Stream", type: "queue", x: 530, y: 250, icon: "📊", tech: "Kafka / Prometheus", instances: "Cluster" },
      { id: "backend_apps", label: "Core Business Backend Services", type: "service", x: 710, y: 220, icon: "📦", tech: "Microservices", instances: "Protected" }
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
    icon: "💳",
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
      { id: "checkout_client", label: "Merchant & Checkout Client", type: "client", x: 40, y: 150, icon: "🛒", tech: "Stripe.js SDK", instances: "Worldwide" },
      { id: "pay_gw", label: "Secure Payment API Gateway", type: "lb", x: 200, y: 150, icon: "🛡️", tech: "PCI-DSS Level 1 Gateway", instances: "12 Nodes" },
      { id: "idempotency_store", label: "Idempotency Lock (Redis TTL)", type: "cache", x: 360, y: 40, icon: "🔒", tech: "Redis Redlock", instances: "6 Nodes" },
      { id: "orchestrator", label: "Payment Saga Orchestrator", type: "service", x: 360, y: 170, icon: "⚡", tech: "Temporal / Go Workflow", instances: "24 Pods" },
      { id: "bank_acquirer", label: "Visa / Mastercard Acquirer Bank", type: "service", x: 550, y: 50, icon: "🏦", tech: "ISO 8583 Banking API", instances: "External" },
      { id: "ledger_db", label: "Double-Entry Ledger (Immutable)", type: "db", x: 550, y: 170, icon: "📑", tech: "CockroachDB / Spanner", instances: "Multi-Region Raft" },
      { id: "outbox_queue", label: "Transactional Outbox Queue", type: "queue", x: 550, y: 290, icon: "📨", tech: "Kafka / Debezium CDC", instances: "8 Brokers" },
      { id: "webhook_dispatcher", label: "Merchant Webhook Dispatcher", type: "service", x: 730, y: 290, icon: "📡", tech: "Async HTTP Worker", instances: "30 Pods" }
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

// Reference Staff Solutions Data (TheOnsite style)
const REFERENCE_SOLUTIONS: Record<string, any> = {
  "url-shortener": {
    templateId: "url-shortener",
    author: "Senior Staff Systems Architect (ex-Google)",
    overview: "TinyURL requires ultra-low latency reads (100:1 read-to-write ratio) with high availability. The design separates writes (shortening) from reads (301/302 redirects) to isolate hot path queries.",
    keyDecisions: [
      { topic: "Base62 Encoding vs MD5", decision: "Use 7-character Base62 with distributed 64-bit ID generator (Snowflake)", rationale: "62^7 ≈ 3.5 trillion URLs without collisions and without exposing incremental sequential IDs." },
      { topic: "Redirection Code", decision: "HTTP 302 Temporary Redirect for analytics tracking, HTTP 301 for ultimate cache efficiency", rationale: "302 ensures subsequent clicks hit our gateway to record telemetry; 301 allows browser client caching to eliminate server hits completely." },
      { topic: "Caching Strategy", decision: "Redis LRU Cache with 80-20 Pareto distribution", rationale: "20% of trending links generate 80% of click traffic. Caching top 20% in memory guarantees < 5ms P99 response." }
    ],
    schema: {
      table: "urls",
      engine: "PostgreSQL 16 / CockroachDB",
      columns: [
        { name: "short_code", type: "VARCHAR(7) PRIMARY KEY", index: "B-Tree Unique" },
        { name: "original_url", type: "VARCHAR(2048) NOT NULL", index: "None" },
        { name: "user_id", type: "UUID", index: "Hash" },
        { name: "created_at", type: "TIMESTAMPTZ NOT NULL", index: "BRIN" },
        { name: "expires_at", type: "TIMESTAMPTZ", index: "B-Tree (Partial)" },
        { name: "click_count", type: "BIGINT DEFAULT 0", index: "None (Stream to OLAP)" }
      ]
    },
    bottlenecksAndMitigations: [
      { issue: "Cache Stampede on viral tweet link", fix: "XFetch / Probabilistic early refresh algorithm with mutex lock on redis miss." },
      { issue: "Single primary database write saturation", fix: "Pre-generate ranges of 10,000 Base62 IDs per application pod using ZooKeeper/etcd." }
    ]
  },
  "tiktok-feed": {
    templateId: "tiktok-feed",
    author: "Principal Infrastructure Architect (ex-ByteDance / Meta)",
    overview: "TikTok's FYP prioritizes instant video playback with immediate machine learning feedback on watch-time telemetry (completion rate, skips, loops).",
    keyDecisions: [
      { topic: "Feed Generation Model", decision: "Hybrid Two-Tower Vector Retrieval + In-Memory Ranking", rationale: "Milvus/Pinecone vector indices retrieve top 200 candidates in 8ms; lightweight GBDT reranks top 10 items." },
      { topic: "Video CDN Delivery", decision: "Edge Chunking with 2-second initial HLS fragments", rationale: "First frame renders in under 25ms; background thread fetches remaining chunks only if user doesn't swipe away." },
      { topic: "Like / View Counter Scaling", decision: "Write-back buffering via Redis HyperLogLog & Kafka batched database flushes", rationale: "Avoids direct row locks on viral clips receiving 50,000 likes/second." }
    ],
    schema: {
      table: "video_posts",
      engine: "ScyllaDB / Distributed LSM Store",
      columns: [
        { name: "video_id", type: "UUID PRIMARY KEY", index: "Partition Key" },
        { name: "author_id", type: "UUID NOT NULL", index: "Clustering Key" },
        { name: "hls_manifest_url", type: "TEXT NOT NULL", index: "None" },
        { name: "embedding_vector", type: "FLOAT[256]", index: "HNSW Vector Index" },
        { name: "duration_sec", type: "FLOAT NOT NULL", index: "None" },
        { name: "created_at", type: "TIMESTAMP", index: "Clustering Order DESC" }
      ]
    },
    bottlenecksAndMitigations: [
      { issue: "Cold-Start user with no watch history", fix: "Fall back to geographically trending top-rated videos and explore/exploit bandit algorithms." },
      { issue: "CDN cache miss storm on brand-new viral clip", fix: "Edge origin shield with request coalescing (collapse concurrent requests into 1 origin fetch)." }
    ]
  },
  "distributed-rate-limiter": {
    templateId: "distributed-rate-limiter",
    author: "Staff Reliability Engineer (ex-Cloudflare)",
    overview: "A carrier-grade rate limiter that intercepts requests at the Envoy proxy layer and calculates token allowance with zero locks.",
    keyDecisions: [
      { topic: "Algorithm Choice", decision: "Sliding Window Counter implemented via atomic Redis Lua Script", rationale: "Smooths traffic boundary spikes compared to Fixed Window while requiring 1/50th the memory of Sliding Log." },
      { topic: "Failure Policy", decision: "Fail-Open with local circuit breaker", rationale: "A failure in the rate limiter service must never cause an outage of business-critical traffic." }
    ],
    schema: {
      table: "rate_limits",
      engine: "Redis In-Memory Key-Value",
      columns: [
        { name: "key", type: "rl:{client_id}:{window_minute}", index: "Hash Slot" },
        { name: "tokens_remaining", type: "INTEGER", index: "In-Memory" },
        { name: "last_refill_ts", type: "TIMESTAMP", index: "In-Memory" }
      ]
    },
    bottlenecksAndMitigations: [
      { issue: "Redis network roundtrip adding 4ms to every API request", fix: "Local in-process token cache on Envoy pod for 90% of requests; sync in 200ms batch windows." }
    ]
  }
};

// GET /api/v1/system-design/templates
systemDesignRouter.get('/templates', (_req: Request, res: Response) => {
  res.json({ templates: TEMPLATES });
});

// GET /api/v1/system-design/templates/:id
systemDesignRouter.get('/templates/:id', (req: Request, res: Response) => {
  const t = TEMPLATES.find(x => x.id === req.params.id);
  if (!t) return res.status(404).json({ error: 'Template not found' });
  res.json({ template: t });
});

// GET /api/v1/system-design/reference-solution/:id
systemDesignRouter.get('/reference-solution/:id', (req: Request, res: Response) => {
  const sol = REFERENCE_SOLUTIONS[req.params.id as string];
  if (!sol) {
    // Generate intelligent default reference solution
    const t = TEMPLATES.find(x => x.id === req.params.id);
    if (!t) return res.status(404).json({ error: 'Template not found' });
    return res.json({
      solution: {
        templateId: t.id,
        author: "Principal Distributed Systems Architect (FAANG Staff)",
        overview: `Production architectural blueprint for ${t.title}. Optimized for target throughput of ${t.rps} and latency ${t.latencyTarget}.`,
        keyDecisions: t.tradeOffs.map(to => ({
          topic: to,
          decision: "Industry Standard Production Pattern",
          rationale: "Selected to maximize availability, minimize tail latency, and prevent single points of failure under peak load."
        })),
        schema: {
          table: "core_entities",
          engine: "PostgreSQL 16 + Redis Cluster",
          columns: [
            { name: "id", type: "UUID PRIMARY KEY", index: "B-Tree" },
            { name: "payload", type: "JSONB NOT NULL", index: "GIN Index" },
            { name: "version", type: "BIGINT DEFAULT 1", index: "Optimistic Locking" },
            { name: "updated_at", type: "TIMESTAMPTZ", index: "B-Tree" }
          ]
        },
        bottlenecksAndMitigations: [
          { issue: "Single Region Latency Degradation", fix: "Deploy multi-region active-active clusters with geo-DNS routing." },
          { issue: "Cascading Thundering Herd Failures", fix: "Introduce exponential backoff with jitter and circuit breaker policies." }
        ]
      }
    });
  }
  res.json({ solution: sol });
});

// POST /api/v1/system-design/estimate
systemDesignRouter.post('/estimate', (req: Request, res: Response) => {
  const { dau = 50000000, readsPerUser = 20, writesPerUser = 2, readPayloadKB = 2, writePayloadKB = 0.5 } = req.body;
  
  const totalDailyReads = dau * readsPerUser;
  const totalDailyWrites = dau * writesPerUser;
  const totalDailyRequests = totalDailyReads + totalDailyWrites;
  
  const avgQps = Math.round(totalDailyRequests / 86400);
  const peakQps = Math.round(avgQps * 2.8);
  
  const dailyStorageBytes = totalDailyWrites * writePayloadKB * 1024;
  const annualStorageTB = Number(((dailyStorageBytes * 365) / (1024 ** 4)).toFixed(2));
  
  const readBandwidthMBps = Number(((totalDailyReads * readPayloadKB * 1024) / 86400 / (1024 ** 2)).toFixed(2));
  const writeBandwidthMBps = Number(((totalDailyWrites * writePayloadKB * 1024) / 86400 / (1024 ** 2)).toFixed(2));
  
  const memoryCacheGB = Number(((totalDailyReads * 0.2 * readPayloadKB * 1024) / (1024 ** 3)).toFixed(1)); // 80/20 rule
  
  res.json({
    metrics: {
      dau,
      avgQps,
      peakQps,
      totalDailyRequests,
      annualStorageTB,
      readBandwidthMBps,
      writeBandwidthMBps,
      memoryCacheGB,
      recommendedAppServers: Math.ceil(peakQps / 4000),
      recommendedRedisNodes: Math.ceil(memoryCacheGB / 32)
    }
  });
});

// POST /api/v1/system-design/simulate
systemDesignRouter.post('/simulate', (req: Request, res: Response) => {
  const { nodes = [], connections = [], trafficMultiplier = 1, failureInjected = null } = req.body;
  
  const baseRps = 10000 * trafficMultiplier;
  let p99Latency = 15 + trafficMultiplier * 4.2;
  let errorRate = 0.001;
  let cpu = Math.min(95, 35 + trafficMultiplier * 18);
  let memory = Math.min(90, 40 + trafficMultiplier * 12);
  let queueBacklog = Math.round(trafficMultiplier > 3 ? (trafficMultiplier - 3) * 12500 : 250);
  
  const impacts: string[] = [];
  const mitigations: string[] = [];
  
  if (failureInjected === 'db_primary') {
    p99Latency += 120;
    errorRate = 0.084;
    impacts.push('Write operations rejecting with HTTP 500', 'Read replicas absorbing traffic with slight staleness', 'Queue buffer rapidly filling');
    mitigations.push('Trigger Automated Sentinel / Patroni Failover', 'Activate circuit breaker on Write API', 'Queue writes to dead-letter storage');
  } else if (failureInjected === 'redis_cache') {
    p99Latency += 85;
    cpu = 92;
    impacts.push('Cache stampede directly impacting Primary DB', 'Database connection pool saturated (98%)');
    mitigations.push('Enable Mutex / Single-flight locking on cache miss', 'Spin up read replicas to offload SQL queries', 'Pre-warm cache from standby cluster');
  } else if (failureInjected === 'network_partition') {
    p99Latency += 350;
    errorRate = 0.14;
    impacts.push('Cross-region replication split-brain risk', 'Leader election flapping in quorum');
    mitigations.push('Enforce strict Raft/Paxos quorum majority', 'Degrade non-critical secondary features');
  } else if (failureInjected === 'cdn_blackout') {
    p99Latency += 210;
    cpu = 94;
    errorRate = 0.06;
    impacts.push('All 300+ Edge PoPs unreachable; 100% of static and dynamic egress hits origin', 'Origin load balancer connection pool exhausted');
    mitigations.push('DNS automated failover to secondary backup CDN provider (Fastly/Akamai)', 'Activate aggressive stale-if-error local browser cache headers');
  } else if (failureInjected === 'kafka_lag') {
    p99Latency += 40;
    queueBacklog = 840000;
    impacts.push('Consumer group rebalancing loop; downstream workers falling behind by 45 minutes', 'Disk buffer on broker-02 exceeding 90% threshold');
    mitigations.push('Dynamically spin up 24 additional worker pods matching partition count', 'Temporarily drop non-critical debug telemetry events');
  }
  
  res.json({
    simulation: {
      rps: baseRps,
      p99Latency: Number(p99Latency.toFixed(1)),
      errorRate: Number(errorRate.toFixed(4)),
      cpu: Math.round(cpu),
      memory: Math.round(memory),
      queueBacklog,
      failureActive: !!failureInjected,
      impacts,
      mitigations
    }
  });
});

// POST /api/v1/system-design/score
systemDesignRouter.post('/score', (req: Request, res: Response) => {
  const { nodes = [], connections = [] } = req.body;
  
  const hasCdn = nodes.some((n: any) => n.type === 'cdn');
  const hasLb = nodes.some((n: any) => n.type === 'lb');
  const hasCache = nodes.some((n: any) => n.type === 'cache');
  const hasDb = nodes.some((n: any) => n.type === 'db');
  const hasQueue = nodes.some((n: any) => n.type === 'queue');
  const hasReplicas = nodes.some((n: any) => n.instances && String(n.instances).toLowerCase().includes('replica'));

  let scalability = 12 + (hasCdn ? 2 : 0) + (hasLb ? 3 : 0) + (hasCache ? 3 : 0);
  let reliability = 10 + (hasReplicas ? 4 : 0) + (hasQueue ? 3 : 0) + (hasLb ? 3 : 0);
  let availability = 12 + (hasCdn ? 3 : 0) + (hasLb ? 3 : 0) + (hasReplicas ? 2 : 0);
  let performance = 11 + (hasCache ? 4 : 0) + (hasCdn ? 3 : 0) + (hasLb ? 2 : 0);
  let security = 7 + (hasLb ? 2 : 0);
  let cost = 8;

  const total = Math.min(98, scalability + reliability + availability + performance + security + cost);
  
  const strengths = [];
  const bottlenecks = [];
  
  if (hasCache) strengths.push('Multi-tier in-memory caching for sub-millisecond hot reads');
  if (hasLb) strengths.push('Horizontal load distribution with active health monitoring');
  if (hasCdn) strengths.push('Global edge distribution reducing origin backbone egress');
  if (hasQueue) strengths.push('Asynchronous decoupling buffer protecting downstream writes');
  
  if (!hasCache) bottlenecks.push('Direct database reads may experience thundering herd at scale');
  if (!hasReplicas) bottlenecks.push('Single database node constitutes a Single Point of Failure (SPOF)');
  if (!hasCdn) bottlenecks.push('Static assets and DNS resolve through single origin region');
  
  res.json({
    score: {
      overall: total,
      categories: {
        scalability: Math.min(20, scalability),
        reliability: Math.min(20, reliability),
        availability: Math.min(20, availability),
        performance: Math.min(20, performance),
        security: Math.min(10, security),
        cost: Math.min(10, cost)
      },
      strengths,
      bottlenecks,
      explanation: 'Deterministic evaluation based on multi-tier redundancy, horizontal scaling capacity, and decoupled asynchronous processing guarantees.'
    }
  });
});

