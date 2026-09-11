// frontend/src/components/system-design/ComponentPalette.tsx
import React from "react";
import { Icons } from "../ui/Icons";

export const PALETTE_CATEGORIES = [
  {
    category: "APPLICATION",
    items: [
      { type: "client" as const, label: "Web Client", icon: "client", tech: "React / Next.js", defaultInstances: "Global Web" },
      { type: "client" as const, label: "Mobile App", icon: "client", tech: "iOS / Android", defaultInstances: "Global App" },
      { type: "service" as const, label: "Public API Gateway", icon: "service", tech: "GraphQL / REST", defaultInstances: "8 Instances" },
    ]
  },
  {
    category: "TRAFFIC & EDGE",
    items: [
      { type: "cdn" as const, label: "Global Edge CDN", icon: "cdn", tech: "Cloudflare / CloudFront", defaultInstances: "300+ PoPs" },
      { type: "lb" as const, label: "Network Load Balancer", icon: "lb", tech: "AWS NLB / Nginx", defaultInstances: "4 Nodes" },
      { type: "security" as const, label: "WAF & Rate Limiter", icon: "security", tech: "Token Bucket / Envoy", defaultInstances: "Clustered" },
    ]
  },
  {
    category: "COMPUTE & SERVICES",
    items: [
      { type: "service" as const, label: "Microservice Worker", icon: "service", tech: "Go / Node.js Cluster", defaultInstances: "16 Pods" },
      { type: "service" as const, label: "Background Job Worker", icon: "service", tech: "Celery / Temporal", defaultInstances: "8 Workers" },
      { type: "realtime" as const, label: "WebSocket Gateway", icon: "realtime", tech: "Erlang / Netty Cluster", defaultInstances: "20 Nodes" },
    ]
  },
  {
    category: "DATA & STORAGE",
    items: [
      { type: "db" as const, label: "Relational SQL Primary", icon: "db", tech: "PostgreSQL 16", defaultInstances: "1 Primary" },
      { type: "db" as const, label: "SQL Read Replicas", icon: "db", tech: "PostgreSQL Pool", defaultInstances: "3 Replicas" },
      { type: "db" as const, label: "Distributed NoSQL", icon: "db", tech: "Cassandra / DynamoDB", defaultInstances: "12 Shards" },
      { type: "storage" as const, label: "S3 Object Storage", icon: "storage", tech: "AWS S3 / MinIO", defaultInstances: "Multi-AZ" },
    ]
  },
  {
    category: "CACHE & SPEED",
    items: [
      { type: "cache" as const, label: "Redis Distributed Cache", icon: "cache", tech: "Redis Cluster (LRU)", defaultInstances: "6 Nodes" },
      { type: "cache" as const, label: "Memcached In-Memory", icon: "cache", tech: "Memcached Cluster", defaultInstances: "4 Nodes" },
    ]
  },
  {
    category: "MESSAGING & EVENTS",
    items: [
      { type: "queue" as const, label: "Kafka Event Stream", icon: "queue", tech: "Kafka 3.7 Cluster", defaultInstances: "6 Brokers" },
      { type: "queue" as const, label: "RabbitMQ Task Queue", icon: "queue", tech: "RabbitMQ HA", defaultInstances: "3 Nodes" },
    ]
  }
];

export function getNodeIcon(type: string, size = 16) {
  switch (type) {
    case "client": return <Icons.Globe size={size} className="text-sky-400" />;
    case "cdn": return <Icons.Radio size={size} className="text-cyan-400" />;
    case "lb": return <Icons.Sliders size={size} className="text-indigo-400" />;
    case "service": return <Icons.Cpu size={size} className="text-blue-400" />;
    case "db": return <Icons.Database size={size} className="text-amber-400" />;
    case "cache": return <Icons.Zap size={size} className="text-yellow-400" />;
    case "queue": return <Icons.Layers size={size} className="text-purple-400" />;
    case "storage": return <Icons.Server size={size} className="text-emerald-400" />;
    case "security": return <Icons.Shield size={size} className="text-rose-400" />;
    case "realtime": return <Icons.Activity size={size} className="text-teal-400" />;
    default: return <Icons.Cpu size={size} className="text-blue-400" />;
  }
}

export function ComponentPalette({
  search,
  onSearchChange,
  onAddNode
}: {
  search: string;
  onSearchChange: (q: string) => void;
  onAddNode: (item: any) => void;
}) {
  return (
    <div style={{ width: 230, background: "var(--bg-secondary)", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", zIndex: 10 }}>
      <div style={{ padding: "10px 12px", borderBottom: "1px solid var(--border-light)" }}>
        <div style={{ position: "relative" }}>
          <Icons.Search size={13} style={{ position: "absolute", left: 8, top: 8, color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder="Search palette..."
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            style={{
              width: "100%",
              background: "var(--bg-primary)",
              border: "1px solid var(--border)",
              borderRadius: 6,
              color: "var(--text-primary)",
              fontSize: 12,
              padding: "5px 8px 5px 26px"
            }}
          />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "10px" }}>
        {PALETTE_CATEGORIES.map(cat => {
          const filteredItems = cat.items.filter(
            item =>
              item.label.toLowerCase().includes(search.toLowerCase()) ||
              item.tech.toLowerCase().includes(search.toLowerCase())
          );
          if (filteredItems.length === 0) return null;

          return (
            <div key={cat.category} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", marginBottom: 6, textTransform: "uppercase", fontFamily: "var(--font-mono)" }}>
                {cat.category}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {filteredItems.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => onAddNode(item)}
                    style={{
                      background: "var(--bg-card)",
                      border: "1px solid var(--border-light)",
                      borderRadius: 6,
                      padding: "6px 8px",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      cursor: "pointer",
                      transition: "all 0.12s ease"
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = "var(--accent-primary)";
                      e.currentTarget.style.background = "var(--bg-hover)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = "var(--border-light)";
                      e.currentTarget.style.background = "var(--bg-card)";
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center" }}>
                      {getNodeIcon(item.type, 15)}
                    </div>
                    <div style={{ overflow: "hidden", flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {item.label}
                      </div>
                      <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                        {item.tech}
                      </div>
                    </div>
                    <Icons.Plus size={13} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
