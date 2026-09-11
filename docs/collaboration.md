# CodeArena — Real-Time Collaboration Architecture

## 1. Overview
CodeArena provides real-time multi-user synchronization for pair programming, mock interviews, and architectural whiteboarding. The collaboration system is built on top of high-throughput WebSocket communication and CRDT/operational-transform concepts for conflict-free state resolution.

```
                    ┌────────────────────────┐
                    │      Client A / B      │
                    │  (Monaco + Whiteboard) │
                    └───────────┬────────────┘
                                │ WebSocket (JSON-RPC / Action Frames)
                                ▼
                    ┌────────────────────────┐
                    │  WebSocket Room Router │
                    │   (Bun.serve / Redis)  │
                    └───────────┬────────────┘
                                │
                    ┌───────────┴────────────┐
                    ▼                        ▼
         ┌─────────────────────┐  ┌─────────────────────┐
         │ Room State (Memory) │  │  Redis Pub/Sub Bus  │
         │ Presence & Cursors  │  │  Multi-Node Sync    │
         └─────────────────────┘  └─────────────────────┘
```

---

## 2. Coding Rooms (`/room/:id`)
- **Room Lifecycle**: Ephemeral or persistent collaboration sessions identified by UUIDv4 or custom slug.
- **Participant Roles**:
  - `Host / Interviewer`: Room controller with code execution permissions, timer management, problem switching, and participant moderation.
  - `Candidate / Collaborator`: Active editor with real-time code synchronization.
  - `Spectator / Reviewer`: Read-only synchronized code and whiteboard viewer.
- **State Synchronization**:
  - Buffer snapshots sent on initial join.
  - Delta updates (`rangeOffset`, `text`, `version`) broadcasted to peers.
  - Cursor tracking with distinct user color assignment and name tag badges.

---

## 3. Presence & Typing Indicators
- **Heartbeat Protocol**: Clients transmit `ping` frames every 15 seconds. Inactivity exceeding 45 seconds triggers automatic disconnection and removal from the active participant list.
- **Presence Payload**:
```json
{
  "type": "presence:update",
  "userId": "usr_9981",
  "username": "alex_dev",
  "status": "online",
  "cursor": { "lineNumber": 42, "column": 18 },
  "selection": { "startLine": 42, "endLine": 45 },
  "isTyping": true
}
```

---

## 4. Shared Canvas & Whiteboard (System Design)
- **Vector Engine**: Infinite 2D architectural whiteboard built with SVG/Canvas rendering.
- **System Design Primitives**:
  - Client / Device (Web, Mobile, IoT)
  - DNS & CDN (Cloudflare, CloudFront)
  - API Gateway / Load Balancer (Nginx, Envoy, ALB)
  - Microservice / Worker (Node.js, Go, Python)
  - Message Queue / Stream (Kafka, RabbitMQ, Redis Streams)
  - Cache Layer (Redis, Memcached)
  - Relational Database (PostgreSQL, MySQL with Read Replicas)
  - NoSQL Database (DynamoDB, MongoDB, Cassandra)
- **Real-Time Canvas Sync**:
  - Element addition, dragging, resizing, and connection routing broadcast via WebSocket.
  - Undo/redo historical stack managed per-room.

---

## 5. Live Interview Mode
- **Dual-Perspective View**:
  - **Interviewer Console**: Private scratchpad notes, customizable rubric scorecard (DSA, System Design, Communication, Problem Solving), problem picker, test-case runner.
  - **Candidate Workspace**: Monaco code editor, problem statement, public test suite runner, whiteboard toggle.
- **Session Evaluation Scorecard**:
  - Criteria scored on 1–5 scale.
  - Markdown summary report generated at the end of the session.
  - Final decision (`Strong Hire`, `Hire`, `Weak Hire`, `Reject`) saved to user profile & candidate records.
