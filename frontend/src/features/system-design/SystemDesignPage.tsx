import React, { useState, useEffect, useRef } from "react";
import { Icons } from "../../components/ui/Icons";
import { StateView } from "../../components/common/StateView";
import { api } from "../../services/api";
import { SystemDesignStudio } from "../../SystemDesignStudio";

export 
interface SDNode {
  id: string;
  label: string;
  type: string;
  x: number;
  y: number;
  icon: string;
  tech?: string;
  instances?: string;
}

interface SDConnection {
  from: string;
  to: string;
  label?: string;
}

interface SDTemplate {
  id: string;
  title: string;
  icon: string;
  difficulty: string;
  desc: string;
  rps: string;
  storage: string;
  readWriteRatio: string;
  latencyTarget: string;
  tradeOffs: string[];
  nodes: SDNode[];
  connections: SDConnection[];
}

function SystemDesignPage({ onToast }: { onToast: (m: string, t: string) => void }) {
  const [topTab, setTopTab] = useState<"studio" | "concepts" | "calculator" | "interview">("studio");
  const [templates, setTemplates] = useState<SDTemplate[]>([]);
  const [activeTemplateId, setActiveTemplateId] = useState("url-shortener");
  const [nodes, setNodes] = useState<SDNode[]>([]);
  const [connections, setConnections] = useState<SDConnection[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [connectingSourceId, setConnectingSourceId] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [zoom, setZoom] = useState(0.85);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [telemetry, setTelemetry] = useState({ rps: 124580, p99Latency: 14.2, cacheHit: 96.8, errorRate: 0.002 });
  const [showExportModal, setShowExportModal] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Concept visualizer states
  const [capSelection, setCapSelection] = useState<"CP" | "AP" | "CA">("CP");
  const [hashRingNodes, setHashRingNodes] = useState<string[]>(["Node A (0°)", "Node B (120°)", "Node C (240°)"]);
  const [hashRingKey, setHashRingKey] = useState<string | null>("user_9842 (Hash: 178° -> Node C)");
  const [circuitState, setCircuitState] = useState<"CLOSED" | "OPEN" | "HALF-OPEN">("CLOSED");
  const [circuitFailures, setCircuitFailures] = useState(0);

  // Estimation calculator states
  const [dau, setDau] = useState(50000000); // 50M
  const [readsPerUser, setReadsPerUser] = useState(20);
  const [writesPerUser, setWritesPerUser] = useState(2);
  const [readPayloadKB, setReadPayloadKB] = useState(2);
  const [writePayloadKB, setWritePayloadKB] = useState(0.5);

  // Fallback templates data with compact coordinates
  const fallbackUrlShortener: SDNode[] = [
    { id: "client", label: "Client (Web/Mobile)", type: "client", x: 15, y: 140, icon: "📱", tech: "HTTP/2, HTTPS", instances: "Global" },
    { id: "dns", label: "Cloudflare CDN", type: "cdn", x: 145, y: 140, icon: "🌐", tech: "Edge Anycast", instances: "300+ PoPs" },
    { id: "lb", label: "Load Balancer", type: "lb", x: 275, y: 140, icon: "⚖️", tech: "Nginx / Envoy", instances: "4 Nodes" },
    { id: "api_write", label: "Shortener Service", type: "service", x: 410, y: 55, icon: "⚡", tech: "Go Cluster", instances: "12 Pods" },
    { id: "api_read", label: "Redirect Gateway", type: "service", x: 410, y: 225, icon: "🔄", tech: "Rust Gateway", instances: "24 Pods" },
    { id: "cache", label: "Redis Cluster", type: "cache", x: 550, y: 140, icon: "⚡", tech: "Redis LRU", instances: "6 Nodes" },
    { id: "db_primary", label: "PostgreSQL Master", type: "db", x: 550, y: 25, icon: "🗄️", tech: "PostgreSQL 16", instances: "1 Primary" },
    { id: "db_replicas", label: "Read Replicas (x3)", type: "db", x: 550, y: 255, icon: "📑", tech: "Read Pool", instances: "3 Replicas" },
    { id: "kafka", label: "Kafka Events", type: "queue", x: 275, y: 350, icon: "📨", tech: "Kafka Stream", instances: "3 Brokers" },
    { id: "analytics", label: "ClickHouse OLAP", type: "storage", x: 440, y: 350, icon: "📊", tech: "Analytics DB", instances: "2 Nodes" }
  ];

  const fallbackConnections: SDConnection[] = [
    { from: "client", to: "dns", label: "HTTPS" },
    { from: "dns", to: "lb", label: "Anycast" },
    { from: "lb", to: "api_write", label: "POST /shorten" },
    { from: "lb", to: "api_read", label: "GET /{code}" },
    { from: "api_read", to: "cache", label: "Lookup" },
    { from: "api_write", to: "cache", label: "Write Cache" },
    { from: "api_write", to: "db_primary", label: "Persist" },
    { from: "cache", to: "db_replicas", label: "Fallback" },
    { from: "api_read", to: "kafka", label: "Log Click" },
    { from: "kafka", to: "analytics", label: "Aggregate" }
  ];

  // Fetch templates on load
  useEffect(() => {
    api.get("/api/v1/system-design/templates")
      .then(r => {
        if (r.data.templates?.length > 0) {
          setTemplates(r.data.templates);
          const initial = r.data.templates[0];
          setNodes(initial.nodes);
          setConnections(initial.connections);
        }
      })
      .catch(() => {
        setNodes(fallbackUrlShortener);
        setConnections(fallbackConnections);
      });
  }, []);

  // Switch template
  const handleSelectTemplate = (templateId: string) => {
    setActiveTemplateId(templateId);
    setSelectedNodeId(null);
    setConnectingSourceId(null);
    setPanOffset({ x: 0, y: 0 });
    const tmpl = templates.find(t => t.id === templateId);
    if (tmpl) {
      setNodes(JSON.parse(JSON.stringify(tmpl.nodes)));
      setConnections(JSON.parse(JSON.stringify(tmpl.connections)));
      onToast(`Loaded ${tmpl.title} template! 📐`, "info");
    }
  };

  // Canvas background pan handler
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    setSelectedNodeId(null);
    setConnectingSourceId(null);
    setIsPanning(true);
    setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  // Node Drag handlers
  const handleMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    if (connectingSourceId) {
      if (connectingSourceId !== nodeId) {
        setConnections(prev => [...prev, { from: connectingSourceId, to: nodeId, label: "Data Flow" }]);
        onToast("Nodes connected! 🔗", "success");
      }
      setConnectingSourceId(null);
      return;
    }

    const node = nodes.find(n => n.id === nodeId);
    if (!node || !canvasRef.current) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    setDraggingNodeId(nodeId);
    setSelectedNodeId(nodeId);
    setDragOffset({
      x: (e.clientX - canvasRect.left - panOffset.x) / zoom - node.x,
      y: (e.clientY - canvasRect.top - panOffset.y) / zoom - node.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPanOffset({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
      return;
    }
    if (!draggingNodeId || !canvasRef.current) return;
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const newX = Math.max(10, Math.min(1000, (e.clientX - canvasRect.left - panOffset.x) / zoom - dragOffset.x));
    const newY = Math.max(10, Math.min(500, (e.clientY - canvasRect.top - panOffset.y) / zoom - dragOffset.y));

    setNodes(prev => prev.map(n => n.id === draggingNodeId ? { ...n, x: newX, y: newY } : n));
  };

  const handleMouseUp = () => {
    setDraggingNodeId(null);
    setIsPanning(false);
  };

  // Add block from palette
  const addBlock = (type: string, label: string, icon: string) => {
    const id = "node_" + Date.now().toString().slice(-4);
    const newNode: SDNode = {
      id,
      label,
      type,
      x: 100 + Math.random() * 250,
      y: 80 + Math.random() * 180,
      icon,
      tech: type === "cache" ? "Redis Cluster" : type === "db" ? "PostgreSQL" : type === "queue" ? "Apache Kafka" : "Go / Node.js",
      instances: "2 Instances"
    };
    setNodes(prev => [...prev, newNode]);
    setSelectedNodeId(id);
    onToast(`Added ${label} to canvas`, "info");
  };

  const handleDeleteSelectedNode = () => {
    if (!selectedNodeId) return;
    setNodes(prev => prev.filter(n => n.id !== selectedNodeId));
    setConnections(prev => prev.filter(c => c.from !== selectedNodeId && c.to !== selectedNodeId));
    setSelectedNodeId(null);
    onToast("Node deleted", "info");
  };

  // Traffic simulation interval
  useEffect(() => {
    if (!isSimulating) return;
    const interval = setInterval(() => {
      setTelemetry(prev => ({
        rps: Math.round(120000 + (Math.random() - 0.5) * 15000),
        p99Latency: +(14 + (Math.random() - 0.5) * 3).toFixed(1),
        cacheHit: +(96.5 + (Math.random() - 0.5) * 1.5).toFixed(1),
        errorRate: +(0.002 + Math.random() * 0.001).toFixed(3)
      }));
    }, 1200);
    return () => clearInterval(interval);
  }, [isSimulating]);

  // Calculations for estimation tab
  const readQPS = Math.round((dau * readsPerUser) / 86400);
  const peakReadQPS = readQPS * 2;
  const writeQPS = Math.round((dau * writesPerUser) / 86400);
  const peakWriteQPS = writeQPS * 2;
  const dailyStorageGB = +((dau * writesPerUser * writePayloadKB) / (1024 * 1024)).toFixed(2);
  const fiveYearStorageTB = +((dailyStorageGB * 365 * 5) / 1024).toFixed(2);
  const egressMBps = +((readQPS * readPayloadKB) / 1024).toFixed(2);
  const egressGbps = +((egressMBps * 8) / 1024).toFixed(2);
  const cacheRAM_GB = +(dailyStorageGB * 0.2).toFixed(1);

  const activeTemplate = templates.find(t => t.id === activeTemplateId) || {
    id: "url-shortener",
    title: "TinyURL / Bitly Shortener",
    icon: "🔗",
    difficulty: "Medium",
    desc: "High-read low-write system with 100:1 read/write ratio, base62 encoding, and distributed caching.",
    rps: "100K Read RPS, 1K Write RPS",
    storage: "15 TB / year",
    readWriteRatio: "100:1 (Read Heavy)",
    latencyTarget: "P99 < 20ms",
    tradeOffs: [
      "301 Permanent Redirect (Browser cached) vs 302 Temporary Redirect (Accurate analytics)",
      "Pre-generated token range server vs Base62 hash of auto-incrementing Snowflake ID",
      "LRU Cache eviction with Redis Cluster to maintain 95%+ cache hit ratio"
    ]
  };

  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  return (
    <div className="container" style={{ padding: "28px 24px", maxWidth: "1650px" }} onMouseUp={handleMouseUp}>
      {/* Studio Header & Top Navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.5, display: "flex", alignItems: "center", gap: 10 }}>
            <span>🏗️</span>
            <span>System Design Visual Guide & Studio</span>
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
            From Fundamentals to Advanced Architecture Case Studies, Interactive Calculators, and Interview Frameworks.
          </p>
        </div>

        {/* Top Module Switcher Tabs */}
        <div style={{ display: "flex", gap: 8, background: "var(--bg-secondary)", padding: 4, borderRadius: "var(--radius-md)", border: "1px solid var(--border-light)" }}>
          {[
            { id: "studio", label: "🏗️ Architecture Studio" },
            { id: "concepts", label: "📐 Visual Concepts & CAP" },
            { id: "calculator", label: "🧮 Estimation Calculator" },
            { id: "interview", label: "🎯 Interview Framework & 30 Qs" }
          ].map(tab => (
            <button
              key={tab.id}
              className={`btn btn-sm ${topTab === tab.id ? "btn-primary" : "btn-secondary"}`}
              style={{ border: "none", fontSize: 12, padding: "6px 12px" }}
              onClick={() => setTopTab(tab.id as any)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* TAB 1: ARCHITECTURE STUDIO                                                */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {topTab === "studio" && (
        <>
          {/* Template Selector Tabs */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
            <div className="tabs" style={{ marginBottom: 0 }}>
              {[
                { id: "url-shortener", title: "TinyURL Shortener", icon: "🔗" },
                { id: "instagram", title: "Instagram News Feed", icon: "📸" },
                { id: "whatsapp", title: "WhatsApp Chat", icon: "💬" },
                { id: "uber", title: "Uber Geo Dispatch", icon: "🚗" },
                { id: "rate-limiter", title: "API Rate Limiter", icon: "⏱️" },
                { id: "notification-system", title: "Notification Platform", icon: "🔔" }
              ].map(t => (
                <button
                  key={t.id}
                  className={`tab ${activeTemplateId === t.id ? "active" : ""}`}
                  onClick={() => handleSelectTemplate(t.id)}
                >
                  <span>{t.icon}</span>
                  <span>{t.title}</span>
                </button>
              ))}
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button
                className={`btn btn-sm ${isSimulating ? "btn-success" : "btn-primary"}`}
                onClick={() => {
                  setIsSimulating(p => !p);
                  onToast(isSimulating ? "Traffic simulation stopped" : "▶ Traffic simulation started! 🚀", isSimulating ? "info" : "success");
                }}
              >
                {isSimulating ? "⏹ Stop Simulation" : "▶ Simulate Traffic"}
              </button>

              <button
                className={`btn btn-sm ${connectingSourceId ? "btn-success" : "btn-secondary"}`}
                onClick={() => {
                  if (connectingSourceId) {
                    setConnectingSourceId(null);
                  } else if (selectedNodeId) {
                    setConnectingSourceId(selectedNodeId);
                    onToast("Click a target node to connect", "info");
                  } else {
                    onToast("Select a node first, then click Connect", "info");
                  }
                }}
              >
                {connectingSourceId ? "✕ Cancel" : "🔗 Connect"}
              </button>

              <button className="btn btn-secondary btn-sm" onClick={() => setShowExportModal(true)}>
                📥 Export Spec
              </button>
            </div>
          </div>

          {/* Live Telemetry Bar */}
          {isSimulating && (
            <div style={{
              padding: "12px 18px",
              background: "rgba(63, 185, 80, 0.08)",
              border: "1px solid rgba(63, 185, 80, 0.3)",
              borderRadius: "var(--radius-md)",
              display: "flex",
              alignItems: "center",
              gap: 20,
              flexWrap: "wrap",
              marginBottom: 16,
              animation: "fadeIn 0.2s ease"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--accent-green)", animation: "pulse 1s infinite" }} />
                <strong style={{ fontSize: 13, color: "var(--accent-green)" }}>LIVE LOAD TEST</strong>
              </div>
              <div className="sd-telemetry-badge active">⚡ {telemetry.rps.toLocaleString()} RPS</div>
              <div className="sd-telemetry-badge active">⏱ P99: {telemetry.p99Latency}ms</div>
              <div className="sd-telemetry-badge active">🎯 Cache Hit: {telemetry.cacheHit}%</div>
              <div className="sd-telemetry-badge active">🛡️ Error Rate: {telemetry.errorRate}%</div>
              <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--accent-green)", fontWeight: 600 }}>
                ✓ System Healthy (Scaling Ready)
              </span>
            </div>
          )}

          {/* Studio Workspace Layout */}
          <div style={{ display: "grid", gridTemplateColumns: "200px 1fr 280px", gap: 16, alignItems: "start" }}>
            {/* Left: Component Palette */}
            <div className="card" style={{ padding: 14 }}>
              <h3 style={{ fontSize: 11, fontWeight: 800, marginBottom: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>
                Components Palette
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  { type: "client", label: "Client App", icon: "📱" },
                  { type: "cdn", label: "CDN / DNS", icon: "🌐" },
                  { type: "lb", label: "Load Balancer", icon: "⚖️" },
                  { type: "service", label: "Microservice", icon: "⚙️" },
                  { type: "cache", label: "Redis Cache", icon: "⚡" },
                  { type: "db", label: "PostgreSQL DB", icon: "🗄️" },
                  { type: "queue", label: "Kafka Queue", icon: "📨" },
                  { type: "storage", label: "S3 Object Store", icon: "📦" }
                ].map(b => (
                  <button
                    key={b.label}
                    className="btn btn-secondary btn-sm"
                    style={{ justifyContent: "flex-start", fontSize: 12, padding: "8px 10px", gap: 8 }}
                    onClick={() => addBlock(b.type, b.label, b.icon)}
                  >
                    <span>{b.icon}</span>
                    <span>+ {b.label}</span>
                  </button>
                ))}
              </div>

              <div style={{ marginTop: 20, paddingTop: 14, borderTop: "1px solid var(--border-light)" }}>
                <h4 style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 6 }}>
                  Quick Controls
                </h4>
                <div style={{ fontSize: 11.5, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  <div>• Drag nodes to arrange</div>
                  <div style={{ marginTop: 4 }}>• Click node to edit properties</div>
                  <div style={{ marginTop: 4 }}>• Connect tool draws data flows</div>
                </div>
              </div>
            </div>

            {/* Center: Interactive Canvas with Toolbar */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {/* Canvas Viewport Controls */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 8px" }}>
                <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>Architecture Layout Canvas</span>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ padding: "2px 8px", height: 24, fontSize: 11 }}
                    onClick={() => setZoom(z => Math.max(0.6, +(z - 0.1).toFixed(1)))}
                  >
                    🔍 -
                  </button>
                  <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", minWidth: 38, textAlign: "center" }}>
                    {Math.round(zoom * 100)}%
                  </span>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ padding: "2px 8px", height: 24, fontSize: 11 }}
                    onClick={() => setZoom(z => Math.min(1.5, +(z + 0.1).toFixed(1)))}
                  >
                    🔍 +
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ padding: "2px 8px", height: 24, fontSize: 11 }}
                    onClick={() => { setZoom(0.85); setPanOffset({ x: 0, y: 0 }); }}
                  >
                    Reset ⛶
                  </button>
                </div>
              </div>

              <div
                ref={canvasRef}
                className="sd-canvas-wrapper"
                style={{ minHeight: 560, width: "100%", overflow: "hidden", cursor: isPanning ? "grabbing" : "default" }}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleMouseMove}
              >
                <div style={{
                  position: "relative",
                  width: 780,
                  height: 520,
                  transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
                  transformOrigin: "top left"
                }}>
                  {/* SVG Dynamic Connection Lines */}
                  <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
                    <defs>
                      <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--accent-primary)" />
                      </marker>
                    </defs>

                    {connections.map((conn, idx) => {
                      const fromNode = nodes.find(n => n.id === conn.from);
                      const toNode = nodes.find(n => n.id === conn.to);
                      if (!fromNode || !toNode) return null;

                      const x1 = fromNode.x + 75;
                      const y1 = fromNode.y + 22;
                      const x2 = toNode.x + 10;
                      const y2 = toNode.y + 22;

                      const dx = Math.abs(x2 - x1) * 0.5;
                      const pathD = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;

                      return (
                        <g key={idx}>
                          <path
                            d={pathD}
                            className={`sd-flow-line ${isSimulating ? "simulating" : ""}`}
                            markerEnd="url(#arrow)"
                          />
                          {conn.label && (
                            <text
                              x={(x1 + x2) / 2}
                              y={(y1 + y2) / 2 - 6}
                              fill="var(--text-muted)"
                              fontSize="9.5"
                              fontFamily="var(--font-mono)"
                              textAnchor="middle"
                            >
                              {conn.label}
                            </text>
                          )}
                        </g>
                      );
                    })}
                  </svg>

                  {/* Render Nodes */}
                  {nodes.map(n => {
                    const isSelected = selectedNodeId === n.id;
                    const isConnectingSource = connectingSourceId === n.id;
                    return (
                      <div
                        key={n.id}
                        className={`sd-node ${isSelected ? "selected" : ""} ${isConnectingSource ? "connecting-source" : ""}`}
                        style={{ left: n.x, top: n.y }}
                        onMouseDown={e => handleMouseDown(e, n.id)}
                        onClick={e => { e.stopPropagation(); setSelectedNodeId(n.id); }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 15 }}>{n.icon}</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {n.label}
                            </div>
                          </div>
                        </div>

                        {n.tech && (
                          <div style={{ fontSize: 10, color: "var(--accent-primary)", fontFamily: "var(--font-mono)", opacity: 0.9 }}>
                            {n.tech}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right: Node Inspector & Architecture Specs */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {selectedNode ? (
                <div className="card" style={{ padding: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <h3 style={{ fontSize: 13, fontWeight: 800 }}>⚙️ Node Inspector</h3>
                    <span className="badge badge-blue" style={{ fontSize: 10 }}>{selectedNode.type.toUpperCase()}</span>
                  </div>

                  <div className="form-group" style={{ marginBottom: 10 }}>
                    <label className="label" style={{ fontSize: 11 }}>Label</label>
                    <input
                      className="input"
                      style={{ height: 32, fontSize: 12 }}
                      value={selectedNode.label}
                      onChange={e => {
                        const next = nodes.map(n => n.id === selectedNode.id ? { ...n, label: e.target.value } : n);
                        setNodes(next);
                      }}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 10 }}>
                    <label className="label" style={{ fontSize: 11 }}>Technology / Stack</label>
                    <input
                      className="input"
                      style={{ height: 32, fontSize: 12 }}
                      value={selectedNode.tech || ""}
                      onChange={e => {
                        const next = nodes.map(n => n.id === selectedNode.id ? { ...n, tech: e.target.value } : n);
                        setNodes(next);
                      }}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 14 }}>
                    <label className="label" style={{ fontSize: 11 }}>Instances / Scale</label>
                    <input
                      className="input"
                      style={{ height: 32, fontSize: 12 }}
                      value={selectedNode.instances || ""}
                      onChange={e => {
                        const next = nodes.map(n => n.id === selectedNode.id ? { ...n, instances: e.target.value } : n);
                        setNodes(next);
                      }}
                    />
                  </div>

                  <button
                    className="btn btn-secondary btn-sm w-full"
                    style={{ color: "var(--accent-red)", borderColor: "rgba(248, 81, 73, 0.4)" }}
                    onClick={handleDeleteSelectedNode}
                  >
                    🗑️ Delete Component
                  </button>
                </div>
              ) : (
                <div className="card" style={{ padding: 16, textAlign: "center", color: "var(--text-muted)" }}>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>👆</div>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>Click any node to inspect & edit its configuration</div>
                </div>
              )}

              {/* System Metrics & Capacity Estimations */}
              <div className="card" style={{ padding: 16 }}>
                <h3 style={{ fontSize: 13, fontWeight: 800, marginBottom: 10 }}>📊 Capacity Estimates</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>Throughput:</span>
                    <span style={{ fontWeight: 600 }}>{activeTemplate.rps}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>Storage Growth:</span>
                    <span style={{ fontWeight: 600 }}>{activeTemplate.storage}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>Read/Write:</span>
                    <span style={{ fontWeight: 600 }}>{activeTemplate.readWriteRatio}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>Latency SLA:</span>
                    <span style={{ fontWeight: 600, color: "var(--accent-green)" }}>{activeTemplate.latencyTarget}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Architectural Trade-offs & Deep Dive */}
          <div className="card" style={{ marginTop: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
              <span>⚖️</span>
              <span>Architectural Trade-Offs & Design Decisions</span>
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {activeTemplate.tradeOffs.map((to, i) => (
                <div key={i} style={{ padding: "10px 14px", background: "var(--bg-tertiary)", borderRadius: "var(--radius-sm)", fontSize: 13, lineHeight: 1.5, display: "flex", gap: 10 }}>
                  <span style={{ color: "var(--accent-primary)", fontWeight: 700 }}>•</span>
                  <span>{to}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* TAB 2: VISUAL CONCEPTS & DIAGRAMS (FROM DOCS)                             */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {topTab === "concepts" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Section 1: Interactive CAP Theorem & PACELC */}
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}>
                  <span>🔺</span>
                  <span>CAP & PACELC Theorem Visualizer (Chapter 1)</span>
                </h2>
                <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>
                  In a distributed system, network partitions (P) are unavoidable. You must choose between Consistency (C) and Availability (A).
                </p>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                {(["CP", "AP", "CA"] as const).map(mode => (
                  <button
                    key={mode}
                    className={`btn btn-sm ${capSelection === mode ? "btn-primary" : "btn-secondary"}`}
                    onClick={() => setCapSelection(mode)}
                  >
                    {mode === "CP" ? "🛡️ CP (Consistent)" : mode === "AP" ? "⚡ AP (Available)" : "🏛️ CA (Traditional)"}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 20, alignItems: "center" }}>
              {/* SVG CAP Triangle Visualizer */}
              <div style={{ background: "var(--bg-tertiary)", padding: 20, borderRadius: "var(--radius-md)", textAlign: "center" }}>
                <svg width="280" height="240" viewBox="0 0 280 240" style={{ margin: "auto", display: "block" }}>
                  <polygon
                    points="140,20 20,220 260,220"
                    fill="none"
                    stroke="var(--border)"
                    strokeWidth="3"
                  />
                  {/* Active Highlight Line */}
                  {capSelection === "CP" && (
                    <line x1="140" y1="20" x2="20" y2="220" stroke="var(--accent-primary)" strokeWidth="6" />
                  )}
                  {capSelection === "AP" && (
                    <line x1="20" y1="220" x2="260" y2="220" stroke="var(--accent-green)" strokeWidth="6" />
                  )}
                  {capSelection === "CA" && (
                    <line x1="140" y1="20" x2="260" y2="220" stroke="var(--accent-yellow)" strokeWidth="6" />
                  )}

                  {/* Vertex Circles & Labels */}
                  <circle cx="140" cy="20" r="14" fill={capSelection === "CP" || capSelection === "CA" ? "var(--accent-primary)" : "var(--bg-primary)"} stroke="var(--accent-primary)" strokeWidth="3" />
                  <text x="140" y="5" fill="var(--text-primary)" fontSize="11" fontWeight="800" textAnchor="middle">Consistency (C)</text>

                  <circle cx="20" cy="220" r="14" fill={capSelection === "CP" || capSelection === "AP" ? "var(--accent-green)" : "var(--bg-primary)"} stroke="var(--accent-green)" strokeWidth="3" />
                  <text x="35" y="240" fill="var(--text-primary)" fontSize="11" fontWeight="800" textAnchor="start">Partition Tolerance (P)</text>

                  <circle cx="260" cy="220" r="14" fill={capSelection === "AP" || capSelection === "CA" ? "var(--accent-yellow)" : "var(--bg-primary)"} stroke="var(--accent-yellow)" strokeWidth="3" />
                  <text x="245" y="240" fill="var(--text-primary)" fontSize="11" fontWeight="800" textAnchor="end">Availability (A)</text>
                </svg>
              </div>

              {/* Dynamic Description Box */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {capSelection === "CP" && (
                  <>
                    <div className="badge badge-blue" style={{ alignSelf: "flex-start" }}>CP Systems (Consistency + Partition Tolerance)</div>
                    <p style={{ fontSize: 13.5, lineHeight: 1.6, color: "var(--text-secondary)" }}>
                      <strong>Trade-Off:</strong> Sacrifices availability to prevent stale reads. If a network partition occurs, the system returns an error or blocks writes rather than risk returning inconsistent data.
                    </p>
                    <div style={{ background: "var(--bg-tertiary)", padding: "10px 14px", borderRadius: "var(--radius-sm)", fontSize: 13 }}>
                      <strong>Examples:</strong> HBase, MongoDB (Strong Mode), Redis Cluster, Google Spanner, CockroachDB.
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      <em>PACELC:</em> <strong>PC / EC</strong> — During partition, prefer Consistency. Normal operation, prefer Consistency.
                    </div>
                  </>
                )}

                {capSelection === "AP" && (
                  <>
                    <div className="badge badge-easy" style={{ alignSelf: "flex-start" }}>AP Systems (Availability + Partition Tolerance)</div>
                    <p style={{ fontSize: 13.5, lineHeight: 1.6, color: "var(--text-secondary)" }}>
                      <strong>Trade-Off:</strong> Sacrifices strong consistency for 100% uptime and low latency. Every node responds immediately, but different nodes may temporarily return different versions of the data (Eventual Consistency).
                    </p>
                    <div style={{ background: "var(--bg-tertiary)", padding: "10px 14px", borderRadius: "var(--radius-sm)", fontSize: 13 }}>
                      <strong>Examples:</strong> Apache Cassandra, Amazon DynamoDB, CouchDB, DNS.
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      <em>PACELC:</em> <strong>PA / EL</strong> — During partition, prefer Availability. Normal operation, prefer Low Latency.
                    </div>
                  </>
                )}

                {capSelection === "CA" && (
                  <>
                    <div className="badge badge-medium" style={{ alignSelf: "flex-start" }}>CA Systems (Traditional Non-Distributed)</div>
                    <p style={{ fontSize: 13.5, lineHeight: 1.6, color: "var(--text-secondary)" }}>
                      <strong>Trade-Off:</strong> Full consistency and availability on a single machine or local cluster without network partitions. In cloud environments where network partitions are inevitable, pure CA is impossible across multiple datacenters.
                    </p>
                    <div style={{ background: "var(--bg-tertiary)", padding: "10px 14px", borderRadius: "var(--radius-sm)", fontSize: 13 }}>
                      <strong>Examples:</strong> Single-node PostgreSQL, MySQL Master, SQLite.
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Consistent Hashing Ring & Circuit Breaker */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {/* Consistent Hashing Visualizer */}
            <div className="card">
              <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
                <span>⭕</span>
                <span>Consistent Hashing Ring (Chapter 5)</span>
              </h3>
              <p style={{ fontSize: 12.5, color: "var(--text-secondary)", marginBottom: 14 }}>
                Even key distribution without reshuffling the entire cluster when nodes are added or removed.
              </p>

              <div style={{ textAlign: "center", margin: "16px 0" }}>
                <svg width="220" height="220" viewBox="0 0 220 220" style={{ margin: "auto", display: "block" }}>
                  <circle cx="110" cy="110" r="85" fill="none" stroke="var(--border)" strokeWidth="4" />
                  {/* Server Nodes on Ring */}
                  <circle cx="110" cy="25" r="9" fill="var(--accent-primary)" />
                  <text x="110" y="15" fill="var(--accent-primary)" fontSize="10" fontWeight="700" textAnchor="middle">Node A</text>

                  <circle cx="185" cy="155" r="9" fill="var(--accent-green)" />
                  <text x="195" y="160" fill="var(--accent-green)" fontSize="10" fontWeight="700" textAnchor="start">Node B</text>

                  <circle cx="35" cy="155" r="9" fill="var(--accent-yellow)" />
                  <text x="25" y="160" fill="var(--accent-yellow)" fontSize="10" fontWeight="700" textAnchor="end">Node C</text>

                  {/* Incoming Key */}
                  <circle cx="95" cy="193" r="6" fill="var(--accent-red)" />
                  <text x="95" y="210" fill="var(--accent-red)" fontSize="9" fontWeight="700" textAnchor="middle">key_user</text>
                  <line x1="95" y1="193" x2="35" y2="155" stroke="var(--accent-red)" strokeWidth="1.5" strokeDasharray="3 3" />
                </svg>
              </div>

              <div style={{ background: "var(--bg-tertiary)", padding: "10px 14px", borderRadius: "var(--radius-sm)", fontSize: 12, marginBottom: 12 }}>
                <strong>Key Routing:</strong> Requests hash to a position on the ring and route clockwise (⟳) to the nearest available server. Adding virtual nodes balances uneven traffic hotspots.
              </div>

              <button className="btn btn-secondary btn-sm w-full" onClick={() => onToast("Virtual nodes rebalanced! Key user_9842 -> Node C ⚡", "success")}>
                + Add Virtual Nodes (k=100)
              </button>
            </div>

            {/* Circuit Breaker Pattern State Machine */}
            <div className="card">
              <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
                <span>⚡</span>
                <span>Circuit Breaker State Machine (Chapter 7)</span>
              </h3>
              <p style={{ fontSize: 12.5, color: "var(--text-secondary)", marginBottom: 14 }}>
                Prevents cascading service failures by failing fast when downstream services become unresponsive.
              </p>

              <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center", margin: "24px 0", gap: 10 }}>
                <div style={{
                  padding: "12px 16px", borderRadius: "var(--radius-md)", textAlign: "center",
                  border: `2px solid ${circuitState === "CLOSED" ? "var(--accent-green)" : "var(--border)"}`,
                  background: circuitState === "CLOSED" ? "rgba(63, 185, 80, 0.1)" : "var(--bg-tertiary)"
                }}>
                  <div style={{ fontWeight: 800, fontSize: 13, color: "var(--accent-green)" }}>CLOSED</div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Normal Traffic</div>
                </div>

                <span style={{ fontSize: 18, color: "var(--text-muted)" }}>➔</span>

                <div style={{
                  padding: "12px 16px", borderRadius: "var(--radius-md)", textAlign: "center",
                  border: `2px solid ${circuitState === "OPEN" ? "var(--accent-red)" : "var(--border)"}`,
                  background: circuitState === "OPEN" ? "rgba(248, 81, 73, 0.1)" : "var(--bg-tertiary)"
                }}>
                  <div style={{ fontWeight: 800, fontSize: 13, color: "var(--accent-red)" }}>OPEN</div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Fail Fast (503)</div>
                </div>

                <span style={{ fontSize: 18, color: "var(--text-muted)" }}>➔</span>

                <div style={{
                  padding: "12px 16px", borderRadius: "var(--radius-md)", textAlign: "center",
                  border: `2px solid ${circuitState === "HALF-OPEN" ? "var(--accent-yellow)" : "var(--border)"}`,
                  background: circuitState === "HALF-OPEN" ? "rgba(210, 153, 34, 0.1)" : "var(--bg-tertiary)"
                }}>
                  <div style={{ fontWeight: 800, fontSize: 13, color: "var(--accent-yellow)" }}>HALF-OPEN</div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Canary Test</div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1, color: "var(--accent-red)" }}
                  onClick={() => {
                    setCircuitState("OPEN");
                    setCircuitFailures(5);
                    onToast("Threshold breached! Circuit tripped to OPEN 🚨", "info");
                  }}
                >
                  Simulate 5 Errors
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1 }}
                  onClick={() => {
                    setCircuitState("CLOSED");
                    setCircuitFailures(0);
                    onToast("Service healthy! Circuit restored to CLOSED ✓", "success");
                  }}
                >
                  Reset Circuit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* TAB 3: ESTIMATION CALCULATOR (FROM CHAPTER 3)                             */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {topTab === "calculator" && (
        <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 24, alignItems: "start" }}>
          {/* Input Parameter Form */}
          <div className="card">
            <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
              <span>🧮</span>
              <span>Estimation Inputs (Chapter 3)</span>
            </h2>

            <div className="form-group" style={{ marginBottom: 14 }}>
              <label className="label" style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Daily Active Users (DAU)</span>
                <strong>{(dau / 1000000).toFixed(0)}M users</strong>
              </label>
              <input
                type="range"
                min="1000000"
                max="500000000"
                step="1000000"
                value={dau}
                onChange={e => setDau(Number(e.target.value))}
                style={{ width: "100%" }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 14 }}>
              <label className="label" style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Read Requests / User / Day</span>
                <strong>{readsPerUser} reads</strong>
              </label>
              <input
                type="range"
                min="1"
                max="100"
                value={readsPerUser}
                onChange={e => setReadsPerUser(Number(e.target.value))}
                style={{ width: "100%" }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 14 }}>
              <label className="label" style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Write Requests / User / Day</span>
                <strong>{writesPerUser} writes</strong>
              </label>
              <input
                type="range"
                min="1"
                max="50"
                value={writesPerUser}
                onChange={e => setWritesPerUser(Number(e.target.value))}
                style={{ width: "100%" }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 14 }}>
              <label className="label" style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Read Payload Size</span>
                <strong>{readPayloadKB} KB</strong>
              </label>
              <input
                type="range"
                min="0.5"
                max="20"
                step="0.5"
                value={readPayloadKB}
                onChange={e => setReadPayloadKB(Number(e.target.value))}
                style={{ width: "100%" }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 14 }}>
              <label className="label" style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Write Payload Size</span>
                <strong>{writePayloadKB} KB</strong>
              </label>
              <input
                type="range"
                min="0.1"
                max="10"
                step="0.1"
                value={writePayloadKB}
                onChange={e => setWritePayloadKB(Number(e.target.value))}
                style={{ width: "100%" }}
              />
            </div>

            <div style={{ fontSize: 11.5, color: "var(--text-muted)", lineHeight: 1.5, borderTop: "1px solid var(--border-light)", paddingTop: 10 }}>
              💡 <em>Formula:</em> QPS = (DAU × Requests) / 86,400 seconds/day
            </div>
          </div>

          {/* Calculated Output Metrics */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
              {/* QPS Metric Card */}
              <div className="card" style={{ borderLeft: "4px solid var(--accent-primary)" }}>
                <div style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Query Throughput (QPS)</div>
                <div style={{ fontSize: 24, fontWeight: 800, margin: "6px 0" }}>{readQPS.toLocaleString()} Read QPS</div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                  <div>• <strong>Peak Read QPS (2x):</strong> {peakReadQPS.toLocaleString()} QPS</div>
                  <div>• <strong>Write QPS:</strong> {writeQPS.toLocaleString()} QPS (Peak: {peakWriteQPS.toLocaleString()})</div>
                </div>
              </div>

              {/* Storage Metric Card */}
              <div className="card" style={{ borderLeft: "4px solid var(--accent-green)" }}>
                <div style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Storage Capacity (5 Years)</div>
                <div style={{ fontSize: 24, fontWeight: 800, margin: "6px 0", color: "var(--accent-green)" }}>{fiveYearStorageTB} TB</div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                  <div>• <strong>Daily Growth:</strong> {dailyStorageGB} GB / day</div>
                  <div>• <strong>1 Year Storage:</strong> {(dailyStorageGB * 365 / 1024).toFixed(1)} TB</div>
                </div>
              </div>

              {/* Network Bandwidth Card */}
              <div className="card" style={{ borderLeft: "4px solid var(--accent-yellow)" }}>
                <div style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Network Bandwidth (Egress)</div>
                <div style={{ fontSize: 24, fontWeight: 800, margin: "6px 0" }}>{egressMBps} MB/s</div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                  <div>• <strong>Network Bandwidth:</strong> {egressGbps} Gbps</div>
                  <div>• <strong>Ingress Bandwidth:</strong> {((writeQPS * writePayloadKB) / 1024).toFixed(2)} MB/s</div>
                </div>
              </div>

              {/* Memory Cache Requirement Card */}
              <div className="card" style={{ borderLeft: "4px solid var(--accent-purple, #a371f7)" }}>
                <div style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Redis Cache (80/20 Rule)</div>
                <div style={{ fontSize: 24, fontWeight: 800, margin: "6px 0", color: "var(--accent-purple, #a371f7)" }}>{cacheRAM_GB} GB RAM</div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                  <div>• Cache 20% of hot daily read data</div>
                  <div>• <strong>Cluster Size:</strong> {Math.ceil(cacheRAM_GB / 32)} x 32GB Redis Nodes</div>
                </div>
              </div>
            </div>

            {/* Reference Estimation Table */}
            <div className="card">
              <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 10 }}>📐 Quick Rule-of-Thumb Conversion Table</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, fontSize: 12 }}>
                <div style={{ background: "var(--bg-tertiary)", padding: 10, borderRadius: "var(--radius-sm)" }}>
                  <strong>Seconds per day:</strong>
                  <div style={{ fontFamily: "var(--font-mono)", marginTop: 4 }}>86,400 ≈ 100,000</div>
                </div>
                <div style={{ background: "var(--bg-tertiary)", padding: 10, borderRadius: "var(--radius-sm)" }}>
                  <strong>1 Million req/day:</strong>
                  <div style={{ fontFamily: "var(--font-mono)", marginTop: 4 }}>≈ 12 QPS (Peak: 24 QPS)</div>
                </div>
                <div style={{ background: "var(--bg-tertiary)", padding: 10, borderRadius: "var(--radius-sm)" }}>
                  <strong>100 Million req/day:</strong>
                  <div style={{ fontFamily: "var(--font-mono)", marginTop: 4 }}>≈ 1,200 QPS (Peak: 2.4K)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* TAB 4: INTERVIEW FRAMEWORK & 30 QUESTIONS (FROM DOCS 04)                  */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {topTab === "interview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Section 1: The 5-Step Framework */}
          <div className="card">
            <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
              <span>🎯</span>
              <span>The 5-Step System Design Interview Framework (Chapter 10)</span>
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
              {[
                { step: "Step 1", title: "Scope & Reqs", time: "3-5 mins", icon: "🎯", points: ["Functional reqs", "Non-functional reqs", "Scale (DAU, QPS)"] },
                { step: "Step 2", title: "Estimation", time: "3-5 mins", icon: "🧮", points: ["QPS & Peak", "Storage / 5 yrs", "Bandwidth & RAM"] },
                { step: "Step 3", title: "High-Level Design", time: "10-15 mins", icon: "📐", points: ["API endpoints", "Core diagrams", "SQL vs NoSQL"] },
                { step: "Step 4", title: "Deep Dive", time: "15-20 mins", icon: "🔍", points: ["Data partitioning", "Algorithms & Caching", "Concurrency"] },
                { step: "Step 5", title: "Resilience & Wrap", time: "5-8 mins", icon: "🛡️", points: ["SPOF bottlenecks", "Circuit breakers", "Trade-offs"] }
              ].map(st => (
                <div key={st.step} style={{ background: "var(--bg-tertiary)", padding: 14, borderRadius: "var(--radius-md)", borderTop: "3px solid var(--accent-primary)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: "var(--accent-primary)" }}>{st.step}</span>
                    <span className="badge badge-sm" style={{ fontSize: 10 }}>{st.time}</span>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 8 }}>{st.icon} {st.title}</div>
                  <ul style={{ margin: 0, paddingLeft: 14, fontSize: 11.5, color: "var(--text-secondary)", lineHeight: 1.4 }}>
                    {st.points.map((p, i) => <li key={i}>{p}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Latency Numbers Every Engineer Should Know */}
          <div className="card">
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
              <span>⚡</span>
              <span>Latency Numbers Every Engineer Should Know</span>
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { label: "L1 Cache Reference", value: "0.5 ns", bar: 2, color: "var(--accent-green)" },
                { label: "Main Memory (RAM) Read", value: "100 ns", bar: 12, color: "var(--accent-green)" },
                { label: "SSD Random Read (NVMe)", value: "16,000 ns (16 μs)", bar: 35, color: "var(--accent-yellow)" },
                { label: "Round Trip in Same Datacenter", value: "500,000 ns (0.5 ms)", bar: 60, color: "var(--accent-primary)" },
                { label: "Read 1MB Sequentially from SSD", value: "1,000,000 ns (1 ms)", bar: 70, color: "var(--accent-primary)" },
                { label: "Disk Seek (HDD Mechanical)", value: "4,000,000 ns (4 ms)", bar: 80, color: "var(--accent-red)" },
                { label: "Cross-Country Packet (CA to NY)", value: "40,000,000 ns (40 ms)", bar: 90, color: "var(--accent-red)" },
                { label: "Trans-Atlantic Packet (CA to NL)", value: "150,000,000 ns (150 ms)", bar: 100, color: "var(--accent-red)" }
              ].map(lat => (
                <div key={lat.label} style={{ display: "grid", gridTemplateColumns: "240px 1fr 140px", alignItems: "center", gap: 14, fontSize: 12 }}>
                  <span style={{ fontWeight: 600 }}>{lat.label}</span>
                  <div style={{ height: 8, background: "var(--bg-tertiary)", borderRadius: 99, overflow: "hidden" }}>
                    <div style={{ width: `${lat.bar}%`, height: "100%", background: lat.color, borderRadius: 99 }} />
                  </div>
                  <span style={{ fontFamily: "var(--font-mono)", textAlign: "right", color: lat.color, fontWeight: 700 }}>{lat.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: 30 Top Questions Cheat Sheet */}
          <div className="card">
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 14 }}>📋 30 System Design Interview Questions Cheat Sheet</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
              {[
                { tier: "Tier 1: Foundational", questions: ["TinyURL Shortener", "Distributed Rate Limiter", "Pastebin Service", "Key-Value Store (Redis)"] },
                { tier: "Tier 2: High Scale Social", questions: ["Instagram Photo Feed", "Twitter / News Feed", "WhatsApp Chat System", "YouTube Video Stream"] },
                { tier: "Tier 3: Mobility & Geo", questions: ["Uber Dispatch System", "Google Maps / Proximity", "Airbnb Booking & Search", "Nearby Places (Yelp)"] },
                { tier: "Tier 4: E-Commerce & FinTech", questions: ["Amazon E-Commerce", "Ticketmaster Flash Sale", "Stripe Payment Gateway", "Stock Trading Engine"] },
                { tier: "Tier 5: Distributed Infra", questions: ["Notification Platform", "Distributed Web Crawler", "Typeahead Autocomplete", "Distributed Cache Cluster"] },
                { tier: "Tier 6: Data & Analytics", questions: ["Google Search Indexer", "Metrics & Alerting (Prometheus)", "Ad Click Aggregator", "Top-K Heavy Hitters"] }
              ].map(cat => (
                <div key={cat.tier} style={{ background: "var(--bg-tertiary)", padding: 14, borderRadius: "var(--radius-md)" }}>
                  <h4 style={{ fontSize: 13, fontWeight: 800, color: "var(--accent-primary)", marginBottom: 8 }}>{cat.tier}</h4>
                  <ul style={{ margin: 0, paddingLeft: 14, fontSize: 12, lineHeight: 1.6, color: "var(--text-secondary)" }}>
                    {cat.questions.map((q, idx) => (
                      <li key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Export JSON Spec Modal */}
      {showExportModal && (
        <div className="modal-backdrop" onClick={() => setShowExportModal(false)}>
          <div className="modal" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: 16, fontWeight: 800 }}>📥 Export Architecture Spec</h3>
              <button className="modal-close" onClick={() => setShowExportModal(false)}>×</button>
            </div>
            <div style={{ padding: "18px 20px" }}>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 12 }}>
                JSON specification of the system architecture nodes and connections:
              </p>
              <textarea
                className="code-textarea"
                style={{ width: "100%", height: 260, fontSize: 12, fontFamily: "var(--font-mono)", padding: 12 }}
                readOnly
                value={JSON.stringify({ template: activeTemplate.title, nodes, connections, capacity: { rps: activeTemplate.rps, storage: activeTemplate.storage } }, null, 2)}
              />
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary btn-sm" onClick={() => setShowExportModal(false)}>Close</button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify({ template: activeTemplate.title, nodes, connections }, null, 2));
                  onToast("Architecture JSON copied to clipboard! 📋", "success");
                  setShowExportModal(false);
                }}
              >
                Copy JSON
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
