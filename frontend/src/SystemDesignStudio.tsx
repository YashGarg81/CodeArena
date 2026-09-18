// frontend/src/SystemDesignStudio.tsx
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import type { SDNode, SDConnection, SDTemplate, SimMetrics, SDProject, SDProjectVersion } from "./components/system-design/types";
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
import { API } from "./services/api";
import { SystemDesignLearnPage } from "./features/system-design/SystemDesignLearnPage";

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

  // Live mirror of the latest canvas state so history helpers never use stale closures
  const stateRef = useRef({ nodes, connections });
  stateRef.current = { nodes, connections };
  
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

  // ─── PERSISTENCE & HISTORY STATE ──────────────────────────────────────────
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(() => {
    return localStorage.getItem("ca_sd_active_project_id") || "proj_sample_url_shortener";
  });
  const [projectTitle, setProjectTitle] = useState("Production URL Shortener Architecture");
  const [projectDescription, setProjectDescription] = useState("");
  const [isPublicProject, setIsPublicProject] = useState(true);
  const [projectVersion, setProjectVersion] = useState(1);
  const [projectVersions, setProjectVersions] = useState<SDProjectVersion[]>([]);
  const [userProjects, setUserProjects] = useState<SDProject[]>([]);
  const [showProjectsModal, setShowProjectsModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  // Undo / Redo Stacks
  const [undoStack, setUndoStack] = useState<Array<{ nodes: SDNode[]; connections: SDConnection[] }>>([]);
  const [redoStack, setRedoStack] = useState<Array<{ nodes: SDNode[]; connections: SDConnection[] }>>([]);

  // Capture the DAG before a mutation so undo/redo can restore it exactly
  const pushState = (fromNodes?: SDNode[], fromConns?: SDConnection[]) => {
    const snap = { nodes: fromNodes ?? stateRef.current.nodes, connections: fromConns ?? stateRef.current.connections };
    setUndoStack(prev => [...prev.slice(-49), snap]);
    setRedoStack([]);
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1]!;
    const curNodes = stateRef.current.nodes;
    const curConns = stateRef.current.connections;
    setUndoStack(undoStack.slice(0, -1));
    setRedoStack(r => [...r.slice(-49), { nodes: curNodes, connections: curConns }]);
    setNodes(prev.nodes);
    setConnections(prev.connections);
    onToast("Action undone ↩", "info");
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1]!;
    const curNodes = stateRef.current.nodes;
    const curConns = stateRef.current.connections;
    setRedoStack(redoStack.slice(0, -1));
    setUndoStack(u => [...u.slice(-49), { nodes: curNodes, connections: curConns }]);
    setNodes(next.nodes);
    setConnections(next.connections);
    onToast("Action redone ↪", "info");
  };

  // Cloud Project Save
  const handleSaveProject = async (commitMsg?: string) => {
    setIsSaving(true);
    try {
      if (currentProjectId) {
        // Update existing project
        const res = await api.put(`/api/v1/system-design/projects/${currentProjectId}`, {
          title: projectTitle,
          description: projectDescription,
          nodes,
          connections,
          isPublic: isPublicProject,
          commitMessage: commitMsg || `Saved revision v${projectVersion + 1}`
        });
        if (res.data?.project) {
          setProjectVersion(res.data.project.version);
          setProjectVersions(res.data.project.versions || []);
          const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          setLastSavedAt(timeStr);
          onToast(`Project saved to cloud (v${res.data.project.version})! 💾`, "success");
        }
      } else {
        // Create new project
        const res = await api.post("/api/v1/system-design/projects", {
          title: projectTitle || "Custom Architecture Project",
          description: projectDescription,
          templateId: activeTemplateId,
          nodes,
          connections,
          isPublic: isPublicProject
        });
        if (res.data?.project) {
          setCurrentProjectId(res.data.project.id);
          localStorage.setItem("ca_sd_active_project_id", res.data.project.id);
          setProjectVersion(res.data.project.version);
          setProjectVersions(res.data.project.versions || []);
          const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          setLastSavedAt(timeStr);
          onToast("New project created and saved! 🚀", "success");
        }
      }
    } catch {
      onToast("Failed to save project to cloud", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Rollback to specific version
  const handleRollback = async (vNum: number) => {
    if (!currentProjectId) return;
    try {
      const res = await api.post(`/api/v1/system-design/projects/${currentProjectId}/rollback/${vNum}`, {});
      if (res.data?.project) {
        pushState();
        setNodes(res.data.project.nodes);
        setConnections(res.data.project.connections);
        setProjectVersion(res.data.project.version);
        setProjectVersions(res.data.project.versions || []);
        setShowHistoryModal(false);
        onToast(`Restored architecture to Revision v${vNum}! ⏪`, "success");
      }
    } catch {
      onToast("Failed to rollback version", "error");
    }
  };

  // Load project from cloud
  const handleLoadProject = async (proj: SDProject) => {
    pushState();
    setCurrentProjectId(proj.id);
    localStorage.setItem("ca_sd_active_project_id", proj.id);
    setProjectTitle(proj.title);
    setProjectDescription(proj.description);
    setNodes(proj.nodes);
    setConnections(proj.connections);
    setProjectVersion(proj.version);
    setProjectVersions(proj.versions || []);
    setIsPublicProject(proj.isPublic);
    setShowProjectsModal(false);
    onToast(`Loaded project: ${proj.title}`, "info");
  };

  // Fetch list of user projects
  const fetchUserProjects = async () => {
    try {
      const res = await api.get("/api/v1/system-design/projects");
      if (res.data?.projects) {
        setUserProjects(res.data.projects);
      }
    } catch {}
  };

  // Fetch active project on mount
  useEffect(() => {
    if (currentProjectId) {
      api.get(`/api/v1/system-design/projects/${currentProjectId}`)
        .then(res => {
          if (res.data?.project) {
            const p = res.data.project;
            setProjectTitle(p.title);
            setProjectDescription(p.description);
            setNodes(p.nodes);
            setConnections(p.connections);
            setProjectVersion(p.version);
            setProjectVersions(p.versions || []);
            setIsPublicProject(p.isPublic);
          }
        })
        .catch(() => {});
    }
  }, [currentProjectId]);

  // Autosave periodically (every 45s) when modified
  useEffect(() => {
    const timer = setInterval(() => {
      if (currentProjectId && nodes.length > 0) {
        api.put(`/api/v1/system-design/projects/${currentProjectId}`, {
          title: projectTitle,
          nodes,
          connections,
          commitMessage: "Automated background autosave"
        }).then(res => {
          if (res.data?.project) {
            setLastSavedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
          }
        }).catch(() => {});
      }
    }, 45000);
    return () => clearInterval(timer);
  }, [currentProjectId, projectTitle, nodes, connections]);

  // Load template on selection
  const handleSelectTemplate = (tmpl: SDTemplate) => {
    pushState();
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
  const dragStartRef = useRef<{ nodes: SDNode[]; connections: SDConnection[] } | null>(null);

  const handleNodeMouseDown = (e: React.MouseEvent, node: SDNode) => {
    e.stopPropagation();
    setSelectedNodeId(node.id);
    setDraggingNodeId(node.id);
    dragStartRef.current = { nodes: stateRef.current.nodes, connections: stateRef.current.connections };
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
    if (draggingNodeId) {
      const start = dragStartRef.current;
      const moved = start?.nodes.find(n => n.id === draggingNodeId);
      const cur = stateRef.current.nodes.find(n => n.id === draggingNodeId);
      if (start && moved && cur && (moved.x !== cur.x || moved.y !== cur.y)) {
        pushState(start.nodes, start.connections);
      }
      dragStartRef.current = null;
      setDraggingNodeId(null);
    }
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
    pushState();
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
    pushState();
    setNodes(prev => prev.filter(n => n.id !== selectedNodeId));
    setConnections(prev => prev.filter(c => c.from !== selectedNodeId && c.to !== selectedNodeId));
    setSelectedNodeId(null);
    onToast("Node removed from canvas", "info");
  };

  const updateSelectedNode = (updated: Partial<SDNode>) => {
    if (!selectedNodeId) return;
    pushState();
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
        onSaveProject={() => handleSaveProject()}
        onOpenHistory={() => setShowHistoryModal(true)}
        onOpenProjects={() => { fetchUserProjects(); setShowProjectsModal(true); }}
        onShare={() => {
          const url = `${window.location.origin}/system-design?project=${currentProjectId}`;
          setShareLink(url);
          setShowShareModal(true);
        }}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={undoStack.length > 0}
        canRedo={redoStack.length > 0}
        isSaving={isSaving}
        lastSavedAt={lastSavedAt}
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
        <SystemDesignLearnPage onToast={(m, t) => onToast(m, t || "info")} />
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

      {/* Projects Modal */}
      {showProjectsModal && (
        <div className="modal-overlay" onClick={() => setShowProjectsModal(false)}>
          <div className="modal" style={{ maxWidth: 650, width: "92vw" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 20 }}>📁</span>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Persistent System Design Projects</h3>
              </div>
              <button onClick={() => setShowProjectsModal(false)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--text-muted)" }}>×</button>
            </div>

            <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>
              Cloud-persisted architecture blueprints saved to your account. Open any design to resume working or view its version history.
            </p>

            <div style={{ maxHeight: 360, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
              {userProjects.length === 0 ? (
                <div style={{ textAlign: "center", padding: 24, color: "var(--text-muted)", fontSize: 13 }}>
                  No saved cloud projects found. Click "Save Cloud" on your current canvas to create one.
                </div>
              ) : (
                userProjects.map(p => (
                  <div
                    key={p.id}
                    onClick={() => handleLoadProject(p)}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "12px 16px",
                      borderRadius: 8,
                      border: p.id === currentProjectId ? "1px solid var(--accent-primary)" : "1px solid var(--border)",
                      background: p.id === currentProjectId ? "rgba(59,130,246,0.08)" : "var(--bg-tertiary)",
                      cursor: "pointer"
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13.5, color: "var(--text-primary)" }}>{p.title}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                        {p.nodes?.length || 0} Components · {p.connections?.length || 0} Connections · Revision v{p.version} · {new Date(p.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <button className="btn btn-primary btn-sm" style={{ fontSize: 11 }}>Open</button>
                  </div>
                ))
              )}
            </div>

            <div style={{ marginTop: 18, display: "flex", justifyContent: "flex-end" }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowProjectsModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Version History Modal */}
      {showHistoryModal && (
        <div className="modal-overlay" onClick={() => setShowHistoryModal(false)}>
          <div className="modal" style={{ maxWidth: 620, width: "92vw" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 20 }}>🕒</span>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Immutable Version History & Revisions</h3>
              </div>
              <button onClick={() => setShowHistoryModal(false)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--text-muted)" }}>×</button>
            </div>

            <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>
              Every architecture checkpoint and manual save is tracked here. You can revert your active canvas to any prior revision without data loss.
            </p>

            <div style={{ maxHeight: 360, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
              {projectVersions.length === 0 ? (
                <div style={{ textAlign: "center", padding: 24, color: "var(--text-muted)", fontSize: 13 }}>
                  No revision checkpoints found yet. Save a version to begin tracking.
                </div>
              ) : (
                projectVersions.map((v) => (
                  <div
                    key={v.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "10px 14px",
                      borderRadius: 8,
                      border: "1px solid var(--border)",
                      background: "var(--bg-tertiary)"
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span className="badge badge-purple" style={{ fontSize: 10 }}>v{v.versionNumber}</span>
                        <span style={{ fontWeight: 600, fontSize: 13 }}>{v.message}</span>
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                        {v.nodes?.length || 0} nodes · {new Date(v.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} ({new Date(v.createdAt).toLocaleDateString()})
                      </div>
                    </div>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleRollback(v.versionNumber)}
                      style={{ fontSize: 11, padding: "3px 8px" }}
                    >
                      Restore This Version
                    </button>
                  </div>
                ))
              )}
            </div>

            <div style={{ marginTop: 18, display: "flex", justifyContent: "flex-end" }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowHistoryModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="modal" style={{ maxWidth: 520, width: "92vw" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 20 }}>🔗</span>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Share Architecture Diagram</h3>
              </div>
              <button onClick={() => setShowShareModal(false)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--text-muted)" }}>×</button>
            </div>

            <p style={{ fontSize: 12.5, color: "var(--text-secondary)", marginBottom: 14 }}>
              Anyone with this link can view this persistent system design diagram and explore the topology in real time.
            </p>

            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <input
                className="input"
                readOnly
                value={shareLink}
                style={{ fontSize: 12, fontFamily: "var(--font-mono)" }}
              />
              <button
                className="btn btn-primary"
                onClick={() => {
                  navigator.clipboard.writeText(shareLink);
                  onToast("Share link copied to clipboard! 📋", "success");
                }}
              >
                Copy
              </button>
            </div>

            <div style={{ padding: "10px 14px", background: "rgba(59,130,246,0.08)", borderRadius: 6, border: "1px solid rgba(59,130,246,0.2)", fontSize: 12, color: "var(--text-muted)" }}>
              🔒 Diagram ownership: <strong>{projectTitle}</strong> (Saved in cloud with immutable version history).
            </div>

            <div style={{ marginTop: 18, display: "flex", justifyContent: "flex-end" }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowShareModal(false)}>Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export { SystemDesignStudio as default };
