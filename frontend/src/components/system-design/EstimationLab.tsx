// frontend/src/components/system-design/EstimationLab.tsx
import React, { useState } from "react";

export function EstimationLab() {
  const [calcDau, setCalcDau] = useState(25000000);
  const [calcReadsPerUser, setCalcReadsPerUser] = useState(20);
  const [calcWritesPerUser, setCalcWritesPerUser] = useState(2);
  const [calcReadSizeKB, setCalcReadSizeKB] = useState(2);
  const [calcWriteSizeKB, setCalcWriteSizeKB] = useState(0.5);

  const totalRequests = calcDau * (calcReadsPerUser + calcWritesPerUser);
  const avgQps = Math.round(totalRequests / 86400);
  const peakQps = Math.round(avgQps * 2.8);
  const annualStorageTB = Number((((calcDau * calcWritesPerUser * calcWriteSizeKB * 1024 * 365) / (1024 ** 4))).toFixed(2));
  const readBwMBps = Number((((calcDau * calcReadsPerUser * calcReadSizeKB * 1024) / 86400 / (1024 ** 2))).toFixed(2));
  const writeBwMBps = Number((((calcDau * calcWritesPerUser * calcWriteSizeKB * 1024) / 86400 / (1024 ** 2))).toFixed(2));
  const cacheMemoryGB = Number((((calcDau * calcReadsPerUser * 0.2 * calcReadSizeKB * 1024) / (1024 ** 3))).toFixed(1));

  return (
    <div className="container" style={{ padding: "28px 24px", maxWidth: 960 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6, letterSpacing: "-0.02em" }}>
        Back-of-the-Envelope Estimation Lab
      </h1>
      <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 24 }}>
        Calculate QPS, storage growth, network bandwidth, and memory cache requirements with transparent architectural formulas.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Input Parameters */}
        <div className="card" style={{ padding: 20, margin: 0 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: "var(--accent-blue)" }}>
            Traffic & Volume Parameters
          </h3>

          <div className="form-group" style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
              <span className="label" style={{ margin: 0 }}>Daily Active Users (DAU)</span>
              <strong style={{ fontFamily: "var(--font-mono)" }}>{calcDau.toLocaleString()}</strong>
            </div>
            <input
              type="range"
              min="1000000"
              max="500000000"
              step="5000000"
              value={calcDau}
              onChange={e => setCalcDau(parseInt(e.target.value))}
              style={{ width: "100%" }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
              <span className="label" style={{ margin: 0 }}>Reads per User / Day</span>
              <strong style={{ fontFamily: "var(--font-mono)" }}>{calcReadsPerUser}</strong>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              value={calcReadsPerUser}
              onChange={e => setCalcReadsPerUser(parseInt(e.target.value))}
              style={{ width: "100%" }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
              <span className="label" style={{ margin: 0 }}>Writes per User / Day</span>
              <strong style={{ fontFamily: "var(--font-mono)" }}>{calcWritesPerUser}</strong>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              value={calcWritesPerUser}
              onChange={e => setCalcWritesPerUser(parseInt(e.target.value))}
              style={{ width: "100%" }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
              <span className="label" style={{ margin: 0 }}>Read Payload Size</span>
              <strong style={{ fontFamily: "var(--font-mono)" }}>{calcReadSizeKB} KB</strong>
            </div>
            <input
              type="range"
              min="0.5"
              max="10"
              step="0.5"
              value={calcReadSizeKB}
              onChange={e => setCalcReadSizeKB(parseFloat(e.target.value))}
              style={{ width: "100%" }}
            />
          </div>

          <div className="form-group">
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
              <span className="label" style={{ margin: 0 }}>Write Payload Size</span>
              <strong style={{ fontFamily: "var(--font-mono)" }}>{calcWriteSizeKB} KB</strong>
            </div>
            <input
              type="range"
              min="0.1"
              max="5"
              step="0.1"
              value={calcWriteSizeKB}
              onChange={e => setCalcWriteSizeKB(parseFloat(e.target.value))}
              style={{ width: "100%" }}
            />
          </div>
        </div>

        {/* Calculated Results */}
        <div className="card" style={{ padding: 20, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--accent-green)" }}>
            Calculated Sizing Specifications
          </h3>

          <div style={{ background: "var(--bg-tertiary)", padding: 12, borderRadius: 6, border: "1px solid var(--border-light)" }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>THROUGHPUT (AVERAGE & PEAK)</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "var(--accent-blue)", fontFamily: "var(--font-mono)", marginTop: 2 }}>
              {avgQps.toLocaleString()} QPS (Avg) · {peakQps.toLocaleString()} QPS (Peak)
            </div>
            <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>
              Formula: Total Requests ({totalRequests.toLocaleString()}) / 86,400s
            </div>
          </div>

          <div style={{ background: "var(--bg-tertiary)", padding: 12, borderRadius: 6, border: "1px solid var(--border-light)" }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>ANNUAL STORAGE CAPACITY</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "var(--accent-purple)", fontFamily: "var(--font-mono)", marginTop: 2 }}>
              {annualStorageTB} TB / year
            </div>
            <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>
              Formula: Daily Writes ({calcDau * calcWritesPerUser}) × Payload × 365 Days
            </div>
          </div>

          <div style={{ background: "var(--bg-tertiary)", padding: 12, borderRadius: 6, border: "1px solid var(--border-light)" }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>80/20 CACHE RAM SIZING</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "var(--accent-cyan)", fontFamily: "var(--font-mono)", marginTop: 2 }}>
              {cacheMemoryGB} GB RAM (20% Hot Keys)
            </div>
            <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>
              Recommended: {Math.ceil(cacheMemoryGB / 32)}x 32GB Redis Cluster Nodes
            </div>
          </div>

          <div style={{ background: "var(--bg-tertiary)", padding: 12, borderRadius: 6, border: "1px solid var(--border-light)" }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>NETWORK BANDWIDTH</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "var(--accent-green)", fontFamily: "var(--font-mono)", marginTop: 2 }}>
              Egress: {readBwMBps} MB/s · Ingress: {writeBwMBps} MB/s
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
