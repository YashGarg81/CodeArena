// frontend/src/components/system-design/DatabaseSchemaLab.tsx
import React, { useState } from "react";
import { Icons } from "../ui/Icons";
import type { TableSchema } from "./types";

const SAMPLE_SCHEMAS: Record<string, TableSchema[]> = {
  "url-shortener": [
    {
      table: "urls",
      engine: "PostgreSQL 16 (B-Tree Sharded by user_id)",
      partitionKey: "user_id % 16",
      columns: [
        { name: "short_code", type: "VARCHAR(7) PRIMARY KEY", index: "B-Tree Unique", description: "Base62 encoded identifier (Snowflake derived)" },
        { name: "original_url", type: "VARCHAR(2048) NOT NULL", index: "None", description: "Target destination redirect URL" },
        { name: "user_id", type: "UUID", index: "Hash Index", description: "Creator identifier for rate limits and grouping" },
        { name: "created_at", type: "TIMESTAMPTZ NOT NULL", index: "BRIN", description: "Timestamp for archival and TTL retention" },
        { name: "expires_at", type: "TIMESTAMPTZ", index: "Partial B-Tree", description: "Nullable TTL expiration date" },
        { name: "click_count", type: "BIGINT DEFAULT 0", index: "None", description: "Cached aggregate, flushed from Redis asynchronously" }
      ]
    },
    {
      table: "click_events",
      engine: "ClickHouse OLAP (Columnar Store)",
      partitionKey: "toYYYYMM(event_time)",
      columns: [
        { name: "short_code", type: "LowCardinality(String)", index: "MinMax", description: "Looked up URL code" },
        { name: "ip_hash", type: "FixedString(32)", index: "None", description: "Anonymized visitor identifier" },
        { name: "country_code", type: "LowCardinality(String)", index: "Set", description: "GeoIP mapped country" },
        { name: "user_agent", type: "String", index: "TokenBF", description: "Device browser metadata" },
        { name: "event_time", type: "DateTime64(3)", index: "PrimaryKey", description: "Exact millisecond click time" }
      ]
    }
  ],
  "tiktok-feed": [
    {
      table: "videos",
      engine: "ScyllaDB / Cassandra (Wide-Column)",
      partitionKey: "video_id (Murmur3Hash)",
      columns: [
        { name: "video_id", type: "UUID PRIMARY KEY", index: "Partition Key", description: "Globally unique 128-bit UUID" },
        { name: "author_id", type: "UUID", index: "Clustering Key", description: "Video uploader channel" },
        { name: "manifest_m3u8", type: "TEXT NOT NULL", index: "None", description: "Adaptive HLS manifest stream URI" },
        { name: "embedding", type: "FLOAT[256]", index: "HNSW Vector", description: "256-dim Two-Tower neural embedding" },
        { name: "view_count", type: "COUNTER", index: "None", description: "Distributed atomic counter" },
        { name: "like_count", type: "COUNTER", index: "None", description: "Distributed atomic counter" },
        { name: "created_at", type: "TIMESTAMP", index: "Clustering Order DESC", description: "Publishing timestamp" }
      ]
    }
  ],
  "stripe-payments": [
    {
      table: "charges",
      engine: "CockroachDB (Distributed SQL Raft Consensus)",
      partitionKey: "merchant_id (Geo-Partitioned)",
      columns: [
        { name: "charge_id", type: "UUID PRIMARY KEY", index: "Clustered Index", description: "Unique payment charge transaction" },
        { name: "idempotency_key", type: "VARCHAR(255) UNIQUE", index: "B-Tree Unique", description: "Client deduplication token preventing double charging" },
        { name: "merchant_id", type: "UUID NOT NULL", index: "Foreign Key", description: "Receiving account" },
        { name: "amount_cents", type: "BIGINT NOT NULL", index: "None", description: "Currency unit in lowest denomination" },
        { name: "currency", type: "VARCHAR(3) NOT NULL", index: "None", description: "ISO-4217 standard currency code (USD, EUR, INR)" },
        { name: "status", type: "VARCHAR(32) NOT NULL", index: "B-Tree", description: "PENDING | AUTHORIZED | CAPTURED | FAILED" },
        { name: "created_at", type: "TIMESTAMPTZ NOT NULL", index: "BRIN", description: "Transaction timestamp with timezone" }
      ]
    },
    {
      table: "ledger_entries",
      engine: "PostgreSQL 16 (Append-Only Immutable Ledger)",
      partitionKey: "account_id",
      columns: [
        { name: "entry_id", type: "BIGSERIAL PRIMARY KEY", index: "B-Tree", description: "Sequential audit ID" },
        { name: "charge_id", type: "UUID REFERENCES charges", index: "B-Tree", description: "Associated transaction" },
        { name: "account_id", type: "UUID NOT NULL", index: "B-Tree", description: "Target customer or merchant balance" },
        { name: "entry_type", type: "VARCHAR(10) NOT NULL", index: "None", description: "DEBIT vs CREDIT (Must sum to zero)" },
        { name: "amount_cents", type: "BIGINT NOT NULL", index: "None", description: "Absolute balance delta" }
      ]
    }
  ]
};

export function DatabaseSchemaLab({
  activeTemplateId
}: {
  activeTemplateId: string;
}) {
  const schemas = SAMPLE_SCHEMAS[activeTemplateId] || SAMPLE_SCHEMAS["url-shortener"]!;
  const [selectedTableIdx, setSelectedTableIdx] = useState(0);
  const activeTable = schemas[selectedTableIdx] || schemas[0]!;

  const [dbParadigm, setDbParadigm] = useState<"sql" | "nosql" | "newsql">("sql");

  return (
    <div className="container" style={{ padding: "28px 24px", maxWidth: 1060 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 26 }}>🗄️</span>
            <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em" }}>
              Database & Low-Level Schema Lab
            </h1>
            <span className="badge badge-blue" style={{ fontSize: 11 }}>ScaleDojo LLD Lab</span>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 4 }}>
            Explore relational B-Trees, LSM wide-column schemas, indexing trade-offs, and sharding partition keys for production data tiers.
          </p>
        </div>

        <div style={{ display: "flex", gap: 6, background: "var(--bg-secondary)", padding: 4, borderRadius: 6, border: "1px solid var(--border)" }}>
          {(["sql", "nosql", "newsql"] as const).map(p => (
            <button
              key={p}
              onClick={() => setDbParadigm(p)}
              style={{
                background: dbParadigm === p ? "var(--bg-tertiary)" : "transparent",
                color: dbParadigm === p ? "var(--text-primary)" : "var(--text-muted)",
                border: "none",
                borderRadius: 4,
                padding: "4px 10px",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                textTransform: "uppercase"
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Table Selector Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {schemas.map((t, idx) => (
          <button
            key={t.table}
            onClick={() => setSelectedTableIdx(idx)}
            className={`btn btn-sm ${selectedTableIdx === idx ? "btn-primary" : "btn-secondary"}`}
            style={{ fontSize: 12.5 }}
          >
            <Icons.Database size={13} />
            <span>Table: {t.table}</span>
          </button>
        ))}
      </div>

      {/* Schema Card */}
      <div className="card" style={{ padding: 20, margin: 0 }}>
        {/* Meta Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid var(--border-light)" }}>
          <div>
            <span style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", fontFamily: "var(--font-mono)" }}>
              STORAGE ENGINE & PARTITION STRATEGY:
            </span>
            <div style={{ fontWeight: 700, fontSize: 14, color: "var(--accent-blue)", marginTop: 2 }}>
              {activeTable.engine}
            </div>
          </div>
          {activeTable.partitionKey && (
            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", fontFamily: "var(--font-mono)" }}>
                SHARDING HASH KEY:
              </span>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--accent-green)", fontFamily: "var(--font-mono)" }}>
                {activeTable.partitionKey}
              </div>
            </div>
          )}
        </div>

        {/* Columns Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", textAlign: "left", color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: 11.5 }}>
                <th style={{ padding: "8px 12px" }}>COLUMN</th>
                <th style={{ padding: "8px 12px" }}>DATA TYPE</th>
                <th style={{ padding: "8px 12px" }}>INDEX STRATEGY</th>
                <th style={{ padding: "8px 12px" }}>ARCHITECTURAL PURPOSE</th>
              </tr>
            </thead>
            <tbody>
              {activeTable.columns.map(col => (
                <tr key={col.name} style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <td style={{ padding: "10px 12px", fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
                    {col.name}
                  </td>
                  <td style={{ padding: "10px 12px", color: "var(--accent-primary)", fontFamily: "var(--font-mono)" }}>
                    {col.type}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: 4,
                        fontSize: 11,
                        background: col.index.includes("Unique") || col.index.includes("Primary") ? "rgba(16, 185, 129, 0.15)" : "var(--bg-tertiary)",
                        color: col.index.includes("Unique") || col.index.includes("Primary") ? "var(--accent-green)" : "var(--text-secondary)",
                        border: "1px solid var(--border-light)"
                      }}
                    >
                      {col.index}
                    </span>
                  </td>
                  <td style={{ padding: "10px 12px", color: "var(--text-secondary)" }}>
                    {col.description || "Core entity attribute"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Trade-off Callout */}
        <div style={{ marginTop: 20, background: "var(--bg-tertiary)", padding: 14, borderRadius: 6, border: "1px solid var(--border-light)", fontSize: 12.5, lineHeight: 1.5 }}>
          <strong style={{ color: "var(--accent-blue)" }}>💡 Indexing Trade-Off Note:</strong> Every secondary B-Tree index accelerates <code>SELECT</code> queries from O(N) table scans down to O(log N), but adds synchronous write amplification on every <code>INSERT</code> and <code>UPDATE</code> statement. In high-concurrency systems, keep secondary indexes under 4 per table and offload historical lookups to read replicas or search indexes.
        </div>
      </div>
    </div>
  );
}
