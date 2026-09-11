// frontend/src/SystemDesignStudio.tsx
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import type { SDNode, SDConnection, SDTemplate, SimMetrics } from "./components/system-design/types";
import { DEFAULT_TEMPLATES, GUIDED_STEPS } from "./components/system-design/templates";
import { StudioHeader } from "./components/system-design/StudioHeader";
import { ComponentPalette } from "./components/system-design/ComponentPalette";
import { ArchitectureCanvas } from "./components/system-design/ArchitectureCanvas";
import { NodeInspector } from "./components/system-design/NodeInspector";
import { AnalysisConsole } from "./components/system-design/AnalysisConsole";
import { ProblemBriefModal } from "./components/system-design/ProblemBriefModal";
import { EstimationLab } from "./components/system-design/EstimationLab";
import { VisualConceptsLab } from "./components/system-design/VisualConceptsLab";
import { SystemDesignInterview } from "./components/system-design/SystemDesignInterview";
import { MurphysChaosLab } from "./components/system-design/MurphysChaosLab";
import { DatabaseSchemaLab } from "./components/system-design/DatabaseSchemaLab";
import { ReferenceSolutionModal } from "./components/system-design/ReferenceSolutionModal";
import { Icons } from "./components/ui/Icons";

const API = (typeof process !== "undefined" && process.env?.API_URL) || "http://localhost:3000";

const getAuthHeaders = () => {
  const t = localStorage.getItem("ca_token");
  return t ? { Authorization: `Bearer ${t}` } : {};
};

const api = {
  get: (url: string) => axios.get(`${API}${url}`, { headers: getAuthHeaders() }).catch(err => err.response || Promise.reject(err)),
  post: (url: string, data: any) => axios.post(`${API}${url}`, data, { headers: getAuthHeaders() }).catch(err => err.response || Promise.reject(err)),
  put: (url: string, data: any) => axios.put(`${API}${url}`, data, { headers: getAuthHeaders() }).catch(err => err.response || Promise.reject(err)),
  delete: (url: string) => axios.delete(`${API}${url}`, { headers: getAuthHeaders() }).catch(err => err.response || Promise.reject(err)),
};

export function SystemDesignStudio({ onToast }: { onToast: (m: string, t: string) => void }) {
  const [templates, setTemplates] = useState<SDTemplate[]>(DEFAULT_TEMPLATES);
  const [activeTemplateId, setActiveTemplateId] = useState("url-shortener");
  
  const initialTemplate = DEFAULT_TEMPLATES[0]!;
  const [nodes, setNodes] = useState<SDNode[]>(initialTemplate.nodes);
  const [connections, setConnections] = useState<SDConnection[]>(initialTemplate.connections);
  
  const [activeTab, setActiveTab] = useState<"studio" | "chaos" | "schema" | "learn" | "casestudies" | "estimation" | "concepts" | "interview" | "progress">("studio");
  const [showAnswerKeyModal, setShowAnswerKeyModal] = useState(false);
  
  // Studio Mode: 'advanced' | 'guided'
  const [studioMode, setStudioMode] = useState<"advanced" | "guided">("advanced");
  const [guidedStepIdx, setGuidedStepIdx] = useState(0);
  const [guidedAnswered, setGuidedAnswered] = useState<{ [step: number]: { selected: number; correct: boolean; feedback: string } }>({});

  // Challenge Brief Modal
  const [showBriefModal, setShowBriefModal] = useState(false);

  // Selected Node for Inspector
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>("db_primary");

  // Canvas Interactions
  const [zoom, setZoom] = useState(0.9);
  const [panOffset, setPanOffset] = useState({ x: 40, y: 20 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [paletteSearch, setPaletteSearch] = useState("");
  const canvasRef = useRef<HTMLDivElement>(null);

  // Bottom Analysis Rails
  const [bottomTab, setBottomTab] = useState<"traffic" | "chaos" | "linter" | "tradeoffs" | "score" | "cost" | "timeline" | "diff">("traffic");
  const [bottomExpanded, setBottomExpanded] = useState(true);

  // Simulation & Chaos States
  const [trafficMultiplier, setTrafficMultiplier] = useState(1);
  const [isSimulating] = useState(true);
  const [injectedFailure, setInjectedFailure] = useState<string | null>(null);
  const [simMetrics, setSimMetrics] = useState<SimMetrics>({
    rps: 18450,
    p99Latency: 14.8,
    errorRate: 0.001,
    cpu: 48,
    memory: 54,
    queueBacklog: 120
  });

  // Timeline of decisions
  const [architectureTimeline, setArchitectureTimeline] = useState<Array<{ time: string; action: string; impact: string; costChange: string }>>([
    { time: "10:00", action: "Initialized Base Client + Load Balancer + Primary SQL", impact: "Baseline Setup", costChange: "+$420/mo" },
    { time: "10:04", action: "Added Redis Cluster (LRU Cache-Aside)", impact: "Reduced DB Load by 92%, P99 < 15ms", costChange: "+$180/mo" },
    { time: "10:08", action: "Added PostgreSQL Read Replicas (x3) with WAL Streaming", impact: "Increased read throughput to 50K QPS", costChange: "+$360/mo" },
    { time: "10:12", action: "Integrated Kafka Clickstream & Asynchronous Queuing", impact: "Decoupled write spikes, guaranteed delivery", costChange: "+$220/mo" }
  ]);

  // Load template on selection
  const handleSelectTemplate = (tmpl: SDTemplate) => {
    setActiveTemplateId(tmpl.id);
    setNodes(tmpl.nodes);
    setConnections(tmpl.connections);
    setSelectedNodeId(tmpl.nodes[0]?.id || null);
    onToast(`Loaded template: ${tmpl.title}`, "info");
  };

  // Fetch templates from API with fallback
  useEffect(() => {
    api.get("/api/v1/system-design/templates")
      .then(r => {
        if (r.data && Array.isArray(r.data.templates) && r.data.templates.length > 0) {
          setTemplates(r.data.templates);
        }
      })
      .catch(() => {});
  }, []);

  // Recalculate simulation metrics
  useEffect(() => {
    const baseRps = Math.round(18500 * trafficMultiplier);
    let p99 = Number((12.5 + trafficMultiplier * 4.8).toFixed(1));
    let err = 0.001;
    let cpuVal = Math.min(98, Math.round(30 + trafficMultiplier * 16));
    let memVal = Math.min(95, Math.round(38 + trafficMultiplier * 11));
    let qBacklog = trafficMultiplier > 2.5 ? Math.round((trafficMultiplier - 2.5) * 8500) : 80;

    if (injectedFailure === "db_primary") {
      p99 += 115.0;
      err = 0.082;
      cpuVal = Math.min(99, cpuVal + 30);
      qBacklog += 14500;
    } else if (injectedFailure === "redis_cache") {
      p99 += 82.0;
      cpuVal = Math.min(96, cpuVal + 40);
    } else if (injectedFailure === "region_failure") {
      p99 += 240.0;
      err = 0.145;
    }

    setSimMetrics({
      rps: baseRps,
      p99Latency: p99,
      errorRate: err,
      cpu: cpuVal,
      memory: memVal,
      queueBacklog: qBacklog
    });
  }, [trafficMultiplier, injectedFailure]);

  // Canvas Node Dragging
  const handleNodeMouseDown = (e: React.MouseEvent, node: SDNode) => {
    e.stopPropagation();
    setSelectedNodeId(node.id);
    setDraggingNodeId(node.id);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: (e.clientX - rect.left) / zoom - node.x,
        y: (e.clientY - rect.top) / zoom - node.y
      });
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (draggingNodeId && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const newX = Math.round((e.clientX - rect.left) / zoom - dragOffset.x);
      const newY = Math.round((e.clientY - rect.top) / zoom - dragOffset.y);
      setNodes(prev => prev.map(n => n.id === draggingNodeId ? { ...n, x: Math.max(10, Math.min(1100, newX)), y: Math.max(10, Math.min(650, newY)) } : n));
    } else if (isPanning) {
      setPanOffset({
        x: panOffset.x + (e.clientX - panStart.x),
        y: panOffset.y + (e.clientY - panStart.y)
      });
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleCanvasMouseUp = () => {
    if (draggingNodeId) setDraggingNodeId(null);
    if (isPanning) setIsPanning(false);
  };

  const addPaletteNode = (item: any) => {
    const id = `node_${Date.now().toString().slice(-4)}`;
    const newNode: SDNode = {
      id,
      label: item.label,
      type: item.type,
      x: 100 + Math.floor(Math.random() * 300),
      y: 80 + Math.floor(Math.random() * 200),
      tech: item.tech,
      instances: item.defaultInstances,
      replicas: 2,
      consistency: "Strong",
      eviction: "LRU",
      failurePolicy: "Fail-open"
    };
    setNodes(prev => [...prev, newNode]);
    setSelectedNodeId(id);
    setArchitectureTimeline(prev => [
      ...prev,
      { time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), action: `Added ${item.label} (${item.tech})`, impact: "Component integrated into architecture graph", costChange: "+$120/mo" }
    ]);
    onToast(`Added ${item.label} to canvas`, "success");
  };

  const deleteSelectedNode = () => {
    if (!selectedNodeId) return;
    setNodes(prev => prev.filter(n => n.id !== selectedNodeId));
    setConnections(prev => prev.filter(c => c.from !== selectedNodeId && c.to !== selectedNodeId));
    setSelectedNodeId(null);
    onToast("Node removed from canvas", "info");
  };

  const updateSelectedNode = (updated: Partial<SDNode>) => {
    if (!selectedNodeId) return;
    setNodes(prev => prev.map(n => n.id === selectedNodeId ? { ...n, ...updated } : n));
  };

  // Selected Node Details
  const selectedNode = nodes.find(n => n.id === selectedNodeId) || null;

  // Architecture Linter Rule Checks
  const hasCdn = nodes.some(n => n.type === "cdn");
  const hasLb = nodes.some(n => n.type === "lb");
  const hasCache = nodes.some(n => n.type === "cache");
  const hasDb = nodes.some(n => n.type === "db");
  const hasQueue = nodes.some(n => n.type === "queue");
  const hasReplicas = nodes.some(n => n.instances && n.instances.toLowerCase().includes("replica"));

  const linterIssues = [
    {
      level: hasDb && !hasReplicas ? "CRITICAL" : "GOOD",
      title: hasDb && !hasReplicas ? "Single Database Instance (Single Point of Failure)" : "Database Redundancy Configured",
      desc: hasDb && !hasReplicas ? "A single primary database node without automated standby or read replicas risks severe downtime during hardware failover." : "WAL replication or replica pool ensures high availability."
    },
    {
      level: !hasCache ? "WARNING" : "GOOD",
      title: !hasCache ? "Missing Distributed In-Memory Cache Tier" : "Multi-Tier In-Memory Cache Active",
      desc: !hasCache ? "Heavy read traffic directly hits relational disk tables, risking connection saturation under peak spikes." : "Redis LRU cache protects database and reduces P99 latency."
    },
    {
      level: !hasLb ? "WARNING" : "GOOD",
      title: !hasLb ? "No API Gateway or Load Balancer Detected" : "Layer 4/7 Load Balancer Active",
      desc: !hasLb ? "Clients connect directly to compute pods with no health checking or TLS termination." : "Traffic is evenly distributed with health checking and rate protection."
    },
    {
      level: !hasQueue ? "INFO" : "GOOD",
      title: !hasQueue ? "Synchronous Chain Risk on Heavy Writes" : "Asynchronous Message Queue Buffer Active",
      desc: !hasQueue ? "Consider introducing Kafka/RabbitMQ to buffer bursty write traffic and decouple downstream workers." : "Kafka buffers incoming traffic and guarantees at-least-once delivery."
    },
    {
      level: !hasCdn ? "INFO" : "GOOD",
      title: !hasCdn ? "Static Assets & DNS Not Accelerated by CDN" : "Global Edge CDN PoPs Active",
      desc: !hasCdn ? "Traffic from overseas users travels to origin datacenter with high latency." : "300+ Edge Anycast PoPs terminate TLS and serve cached assets locally."
    }
  ];

  // Architecture Score
  const scoreScalability = 14 + (hasCdn ? 2 : 0) + (hasLb ? 2 : 0) + (hasCache ? 2 : 0);
  const scoreReliability = 12 + (hasReplicas ? 4 : 0) + (hasQueue ? 2 : 0) + (hasLb ? 2 : 0);
  const scoreAvailability = 13 + (hasCdn ? 2 : 0) + (hasLb ? 3 : 0) + (hasReplicas ? 2 : 0);
  const scorePerformance = 12 + (hasCache ? 4 : 0) + (hasCdn ? 2 : 0) + (hasLb ? 2 : 0);
  const overallScore = Math.min(98, scoreScalability + scoreReliability + scoreAvailability + scorePerformance + 8 + 9);

  // Cost estimate breakdown
  const monthlyCostCompute = nodes.filter(n => n.type === "service" || n.type === "realtime").length * 120 + 240;
  const monthlyCostDb = nodes.filter(n => n.type === "db").length * 180 + 200;
  const monthlyCostCache = nodes.filter(n => n.type === "cache").length * 90;
  const monthlyCostQueue = nodes.filter(n => n.type === "queue").length * 110;
  const monthlyCostCdn = hasCdn ? 150 : 0;
  const monthlyCostTotal = monthlyCostCompute + monthlyCostDb + monthlyCostCache + monthlyCostQueue + monthlyCostCdn + 180;

  const currentTemplate = templates.find(t => t.id === activeTemplateId) || templates[0] || null;

  return (
    <div className="system-design-studio-root" style={{ background: "var(--bg-primary)", color: "var(--text-primary)", minHeight: "calc(100vh - 52px)", display: "flex", flexDirection: "column" }}>
      {/* Studio Header & Subnavigation */}
      <StudioHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        templates={templates}
        activeTemplateId={activeTemplateId}
        onSelectTemplate={handleSelectTemplate}
        studioMode={studioMode}
        onToggleStudioMode={setStudioMode}
        zoom={zoom}
        onZoomIn={() => setZoom(z => Math.min(1.4, z + 0.1))}
        onZoomOut={() => setZoom(z => Math.max(0.6, z - 0.1))}
        onResetView={() => { setZoom(0.9); setPanOffset({ x: 40, y: 20 }); }}
        onOpenBrief={() => setShowBriefModal(true)}
        onOpenAnswerKey={() => setShowAnswerKeyModal(true)}
        onExport={() => onToast("Architecture specs exported (JSON & Diagram)", "success")}
      />

      {/* ─── TAB 1: ARCHITECTURE STUDIO ────────────────────────────────────── */}
      {activeTab === "studio" && (
        <div style={{ display: "flex", flexDirection: "column", flex: 1, height: "calc(100vh - 100px)", overflow: "hidden" }}>
          {/* Guided Mode Banner (if Beginner Mode Active) */}
          {studioMode === "guided" && GUIDED_STEPS[guidedStepIdx] && (
            <div style={{ background: "rgba(16, 185, 129, 0.12)", borderBottom: "1px solid rgba(16, 185, 129, 0.3)", padding: "10px 20px", display: "flex", alignItems: "center", gap: 14 }}>
              <Icons.GraduationCap size={20} className="text-emerald-400" />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: "var(--accent-green)" }}>
                  {GUIDED_STEPS[guidedStepIdx]?.title} (Step {guidedStepIdx + 1} of {GUIDED_STEPS.length})
                </div>
                <div style={{ fontSize: 12, color: "var(--text-primary)", marginTop: 2 }}>
                  {GUIDED_STEPS[guidedStepIdx]?.instruction}
                </div>
                <div style={{ marginTop: 6, display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {GUIDED_STEPS[guidedStepIdx]?.options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setGuidedAnswered(p => ({
                          ...p,
                          [guidedStepIdx]: { selected: i, correct: opt.correct, feedback: opt.feedback }
                        }));
                      }}
                      style={{
                        background: guidedAnswered[guidedStepIdx]?.selected === i ? (opt.correct ? "var(--accent-green)" : "var(--accent-red)") : "var(--bg-tertiary)",
                        color: "#fff",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius-sm)",
                        padding: "4px 10px",
                        fontSize: 11.5,
                        cursor: "pointer"
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                {guidedAnswered[guidedStepIdx] && (
                  <div style={{ marginTop: 4, fontSize: 11.5, color: "var(--text-secondary)" }}>
                    {guidedAnswered[guidedStepIdx].feedback}
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  disabled={guidedStepIdx === 0}
                  onClick={() => setGuidedStepIdx(s => s - 1)}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: 11 }}
                >
                  ← Prev
                </button>
                <button
                  disabled={guidedStepIdx === GUIDED_STEPS.length - 1}
                  onClick={() => setGuidedStepIdx(s => s + 1)}
                  className="btn btn-primary btn-sm"
                  style={{ fontSize: 11 }}
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* Main Studio Center Workspace */}
          <div style={{ display: "flex", flex: 1, position: "relative", overflow: "hidden" }}>
            {/* Left: Palette */}
            <ComponentPalette
              search={paletteSearch}
              onSearchChange={setPaletteSearch}
              onAddNode={addPaletteNode}
            />

            {/* Center: Interactive Canvas */}
            <div ref={canvasRef} style={{ flex: 1, display: "flex", position: "relative", overflow: "hidden" }}>
              <ArchitectureCanvas
                nodes={nodes}
                connections={connections}
                selectedNodeId={selectedNodeId}
                draggingNodeId={draggingNodeId}
                injectedFailure={injectedFailure}
                isSimulating={isSimulating}
                zoom={zoom}
                panOffset={panOffset}
                isPanning={isPanning}
                onNodeMouseDown={handleNodeMouseDown}
                onCanvasMouseMove={handleCanvasMouseMove}
                onCanvasMouseUp={handleCanvasMouseUp}
                onCanvasMouseDown={e => {
                  if (e.target === canvasRef.current || (e.target as HTMLElement).tagName === "svg") {
                    setIsPanning(true);
                    setPanStart({ x: e.clientX, y: e.clientY });
                  }
                }}
              />
            </div>

            {/* Right: Inspector */}
            <NodeInspector
              selectedNode={selectedNode}
              onUpdateNode={updateSelectedNode}
              onDeleteNode={deleteSelectedNode}
            />
          </div>

          {/* Bottom Analysis & Simulation Console */}
          <AnalysisConsole
            bottomTab={bottomTab}
            bottomExpanded={bottomExpanded}
            onTabChange={setBottomTab}
            onToggleExpanded={() => setBottomExpanded(e => !e)}
            trafficMultiplier={trafficMultiplier}
            onTrafficMultiplierChange={setTrafficMultiplier}
            simMetrics={simMetrics}
            injectedFailure={injectedFailure}
            onSetInjectedFailure={setInjectedFailure}
            linterIssues={linterIssues}
            scoreScalability={scoreScalability}
            scoreReliability={scoreReliability}
            scoreAvailability={scoreAvailability}
            scorePerformance={scorePerformance}
            overallScore={overallScore}
            monthlyCostTotal={monthlyCostTotal}
            monthlyCostCompute={monthlyCostCompute}
            monthlyCostDb={monthlyCostDb}
            monthlyCostCache={monthlyCostCache}
            monthlyCostQueue={monthlyCostQueue}
            monthlyCostCdn={monthlyCostCdn}
            architectureTimeline={architectureTimeline}
          />
        </div>
      )}

      {/* ─── TAB: CHAOS LAB (MURPHY'S - SCALEDOJO) ────────────────────────── */}
      {activeTab === "chaos" && (
        <MurphysChaosLab
          injectedFailure={injectedFailure}
          onTriggerFailure={fId => {
            setInjectedFailure(fId);
            if (fId) {
              onToast(`Injected Chaos Outage: ${fId}. Observe failure propagation!`, "error");
            } else {
              onToast("All chaos experiments halted. Systems returning to nominal state.", "success");
            }
          }}
          simMetrics={simMetrics}
        />
      )}

      {/* ─── TAB: DATABASE & SCHEMA LAB (SCALEDOJO LLD) ─────────────────────── */}
      {activeTab === "schema" && (
        <DatabaseSchemaLab activeTemplateId={activeTemplateId} />
      )}

      {/* ─── TAB 2: ACADEMY CURRICULUM (LEARN) ─────────────────────────────── */}
      {activeTab === "learn" && (
        <div className="container" style={{ padding: "28px 24px", maxWidth: 960 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6, letterSpacing: "-0.02em" }}>
            System Design Academy Curriculum
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 24 }}>
            Structured 10-level progressive curriculum from System Foundations to Staff/Principal Architect.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { level: "LEVEL 0", title: "Foundations & Networking", topics: ["Client-Server Model", "HTTP/1.1 vs HTTP/2 vs HTTP/3", "DNS & Anycast", "REST vs gRPC vs GraphQL"], progress: 100 },
              { level: "LEVEL 1", title: "Core Traffic & Edge Infrastructure", topics: ["CDN Edge Caching", "Layer 4 vs Layer 7 Load Balancing", "API Gateways", "Rate Limiting Algorithms"], progress: 90 },
              { level: "LEVEL 2", title: "Databases & Storage", topics: ["SQL vs NoSQL", "B-Tree vs LSM Indexes", "ACID Isolation Levels", "Read Replicas & Sharding"], progress: 75 },
              { level: "LEVEL 3", title: "Caching & Fast-Path", topics: ["Cache-Aside vs Write-Through", "Cache Invalidation & Stampedes", "Redis Clustering & Eviction"], progress: 80 },
              { level: "LEVEL 4", title: "Distributed Systems & Consensus", topics: ["CAP & PACELC Theorems", "Eventual vs Strong Consistency", "Raft & Paxos Consensus", "Distributed Locks"], progress: 60 },
              { level: "LEVEL 5", title: "Asynchronous Messaging & Queues", topics: ["Kafka Log Partitions", "RabbitMQ AMQP", "At-Least-Once Delivery & Idempotency"], progress: 50 },
              { level: "LEVEL 6", title: "Scalability & Load Shedding", topics: ["Horizontal Auto-Scaling", "Stateless Architecture", "Connection Pooling", "Circuit Breakers"], progress: 40 },
              { level: "LEVEL 7", title: "Reliability & Multi-Region", topics: ["Multi-AZ vs Multi-Region", "Disaster Recovery (RPO/RTO)", "Chaos Engineering"], progress: 30 },
              { level: "LEVEL 8", title: "Advanced Architecture Patterns", topics: ["CQRS & Event Sourcing", "Saga Pattern for Transactions", "Change Data Capture (CDC)"], progress: 20 },
              { level: "LEVEL 9", title: "Staff/Principal Engineering", topics: ["Capacity Planning", "Cost Optimization", "SLO/SLI Error Budgets", "Architecture Governance"], progress: 15 },
            ].map((lvl, idx) => (
              <div key={idx} className="card" style={{ padding: 16, margin: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span className="badge badge-blue">{lvl.level}</span>
                    <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>{lvl.title}</span>
                  </div>
                  <span style={{ fontSize: 12.5, color: "var(--accent-primary)", fontWeight: 700, fontFamily: "var(--font-mono)" }}>
                    {lvl.progress}% Mastered
                  </span>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                  {lvl.topics.map((t, i) => (
                    <span key={i} style={{ background: "var(--bg-tertiary)", padding: "3px 8px", borderRadius: 4, fontSize: 11.5, color: "var(--text-secondary)", border: "1px solid var(--border-light)" }}>
                      ✓ {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB 3: CASE STUDIES ───────────────────────────────────────────── */}
      {activeTab === "casestudies" && (
        <div className="container" style={{ padding: "28px 24px" }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6, letterSpacing: "-0.02em" }}>
            Production System Architecture Case Studies
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 24 }}>
            Explore battle-tested production architectures with deep dives into throughput bottlenecks, failure models, and multi-region scaling.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
            {templates.map(tmpl => (
              <div
                key={tmpl.id}
                className="card"
                style={{ padding: 20, margin: 0, display: "flex", flexDirection: "column" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 6, background: "var(--bg-tertiary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icons.Layers size={18} className="text-blue-400" />
                  </div>
                  <span className={`badge ${tmpl.difficulty === "Beginner" ? "badge-easy" : tmpl.difficulty === "Intermediate" ? "badge-medium" : "badge-hard"}`}>
                    {tmpl.difficulty}
                  </span>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)", marginBottom: 6 }}>{tmpl.title}</h3>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5, flex: 1 }}>{tmpl.desc}</p>
                <div style={{ display: "flex", gap: 12, fontSize: 11, color: "var(--text-muted)", marginTop: 14, marginBottom: 14, fontFamily: "var(--font-mono)" }}>
                  <span>🚀 {tmpl.rps}</span>
                  <span>📦 {tmpl.storage}</span>
                </div>
                <button
                  className="btn btn-primary btn-sm w-full"
                  onClick={() => {
                    handleSelectTemplate(tmpl);
                    setActiveTab("studio");
                  }}
                >
                  Open in Architecture Studio →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB 4: ESTIMATION LAB ─────────────────────────────────────────── */}
      {activeTab === "estimation" && <EstimationLab />}

      {/* ─── TAB 5: VISUAL CONCEPTS ────────────────────────────────────────── */}
      {activeTab === "concepts" && <VisualConceptsLab />}

      {/* ─── TAB 6: MOCK INTERVIEW MODE ────────────────────────────────────── */}
      {activeTab === "interview" && (
        <SystemDesignInterview
          activeTemplateId={activeTemplateId}
          templates={templates}
          onSelectTemplate={handleSelectTemplate}
          onToast={onToast}
        />
      )}

      {/* ─── TAB 7: MY PROGRESS & MASTERY ─────────────────────────────────── */}
      {activeTab === "progress" && (
        <div className="container" style={{ padding: "28px 24px", maxWidth: 960 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6, letterSpacing: "-0.02em" }}>
            Architecture Mastery & Track Progress
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 24 }}>
            Track your verified competencies across Distributed Systems, High Availability, Database Sharding, and Interview Readiness.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            <div className="card" style={{ padding: 20, margin: 0 }}>
              <div style={{ fontSize: 11.5, color: "var(--text-muted)", textTransform: "uppercase", fontFamily: "var(--font-mono)" }}>
                ARCHITECT TIER
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "var(--accent-primary)", marginTop: 6 }}>
                Senior Architect
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                Next: Staff / Principal Architect
              </div>
            </div>

            <div className="card" style={{ padding: 20, margin: 0 }}>
              <div style={{ fontSize: 11.5, color: "var(--text-muted)", textTransform: "uppercase", fontFamily: "var(--font-mono)" }}>
                SYSTEM DESIGN XP
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "var(--accent-green)", marginTop: 6, fontFamily: "var(--font-mono)" }}>
                2,850 XP
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                Rank: Top 5% Globally
              </div>
            </div>

            <div className="card" style={{ padding: 20, margin: 0 }}>
              <div style={{ fontSize: 11.5, color: "var(--text-muted)", textTransform: "uppercase", fontFamily: "var(--font-mono)" }}>
                MOCK INTERVIEW SCORE
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "var(--accent-purple)", marginTop: 6, fontFamily: "var(--font-mono)" }}>
                91 / 100
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                Status: FAANG Staff Bar Cleared
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Challenge Brief Modal */}
      {showBriefModal && currentTemplate && (
        <ProblemBriefModal
          template={currentTemplate}
          onClose={() => setShowBriefModal(false)}
          onStartDesigning={() => {
            setActiveTab("studio");
          }}
        />
      )}

      {/* Staff Engineer Reference Answer Key Modal (TheOnsite style) */}
      {showAnswerKeyModal && currentTemplate && (
        <ReferenceSolutionModal
          templateId={currentTemplate.id}
          templateTitle={currentTemplate.title}
          onClose={() => setShowAnswerKeyModal(false)}
        />
      )}
    </div>
  );
}

export { SystemDesignStudio as default };
