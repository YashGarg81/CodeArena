// frontend/src/components/system-design/types.ts

export interface SDNode {
  id: string;
  label: string;
  type: "client" | "cdn" | "lb" | "service" | "db" | "cache" | "queue" | "storage" | "security" | "realtime";
  x: number;
  y: number;
  icon?: string;
  tech: string;
  instances: string;
  role?: string;
  capacityRps?: number;
  memoryGB?: number;
  replicas?: number;
  consistency?: "Strong" | "Eventual" | "Linearizable";
  eviction?: "LRU" | "LFU" | "FIFO";
  failurePolicy?: "Fail-open" | "Fail-closed" | "Degrade";
}

export interface SDConnection {
  from: string;
  to: string;
  label?: string;
  protocol?: string;
  trafficRps?: number;
}

export interface SDTemplate {
  id: string;
  title: string;
  category: string;
  icon?: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Staff";
  desc: string;
  rps: string;
  storage: string;
  readWriteRatio: string;
  latencyTarget: string;
  tradeOffs: string[];
  nodes: SDNode[];
  connections: SDConnection[];
}

export interface SimMetrics {
  rps: number;
  p99Latency: number;
  errorRate: number;
  cpu: number;
  memory: number;
  queueBacklog: number;
}

export interface ColumnSchema {
  name: string;
  type: string;
  index: string;
  description?: string;
}

export interface TableSchema {
  table: string;
  engine: string;
  partitionKey?: string;
  columns: ColumnSchema[];
}

export interface ReferenceSolution {
  templateId: string;
  author: string;
  overview: string;
  keyDecisions: Array<{
    topic: string;
    decision: string;
    rationale: string;
  }>;
  schema?: TableSchema;
  bottlenecksAndMitigations: Array<{
    issue: string;
    fix: string;
  }>;
}

export interface ChaosScenario {
  id: string;
  title: string;
  icon: string;
  category: "Datacenter" | "Storage" | "Networking" | "Traffic";
  description: string;
  expectedImpact: string;
  remediationPlaybook: string;
  impactedNodeType: string;
}

export interface SDProjectVersion {
  id: string;
  versionNumber: number;
  message: string;
  nodes: SDNode[];
  connections: SDConnection[];
  createdAt: string;
}

export interface SDProject {
  id: string;
  title: string;
  description: string;
  templateId?: string;
  ownerId: string;
  isPublic: boolean;
  shareToken?: string;
  nodes: SDNode[];
  connections: SDConnection[];
  version: number;
  versions: SDProjectVersion[];
  createdAt: string;
  updatedAt: string;
}

export type SDCurriculumLevel = "Beginner" | "Intermediate" | "Advanced" | "Staff";

export interface SDCurriculumQuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface SDCurriculumLesson {
  id: string; // "<sectionSlug>/<lessonSlug>"
  slug: string;
  title: string;
  summary: string;
  durationMin: number;
  order: number;
  content: string;
  keyConcepts: string[];
  checklist: string[];
  quiz: SDCurriculumQuizQuestion[];
  resources: string[];
  completed?: boolean;
  score?: number | null;
}

export interface SDCurriculumSection {
  slug: string;
  title: string;
  level: SDCurriculumLevel;
  icon: string;
  description: string;
  order: number;
  lessons: SDCurriculumLesson[];
}

export interface SDCurriculumPayload {
  curriculum: SDCurriculumSection[];
  totalLessons: number;
}

