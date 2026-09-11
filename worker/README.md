# CodeArena — Sandboxed Judge Execution Worker

Asynchronous queue consumer daemon that executes untrusted code inside secured hardware-virtualized MicroVMs or hardened Docker containers.

## Security Architecture & Isolation Model
- **Zero Host Trust**: Untrusted user code is strictly prohibited from running directly on the host worker machine in production environments.
- **Hardware Virtualization / Container Sandboxing**:
  - **Tier 1 (Production Default — MicroVM)**: Ephemeral Firecracker MicroVMs backed by KVM (`/dev/kvm`) provide guest kernel-level address space separation.
  - **Tier 2 (Containerized Fallback — Docker)**: Hardened rootless OCI containers configured with:
    - Total network isolation (`--network none`)
    - Capability dropping (`--cap-drop=ALL`)
    - Privilege escalation prevention (`--security-opt=no-new-privileges:true`)
    - Non-root user execution (`--user 1000:1000`)
    - Resource limits (`--memory`, `--cpus`, `--pids-limit`, `--ulimit fsize/nofile/nproc`)
    - Read-only root filesystem with ephemeral memory-backed writable `/tmp`
    - Bounded stream buffers (1 MB OLE limit)
  - **Tier 3 (Local Development Only — Process)**: Local process execution for development without Docker/KVM. Strictly disabled in production.
- **Fail-Closed Execution**: If hardware virtualization (Firecracker) or hardened container engines (Docker) are unavailable in strict/production mode, submissions are immediately rejected with an explicit security error rather than silently degrading to insecure host execution.
- **Pre-Execution Heuristic Filtering**: Static regex checks serve strictly as early pre-validation; runtime isolation is enforced by the virtualization boundary.
- **Result Persistence**: Stores verdicts, runtimes, test pass rates, and output back to PostgreSQL.

## Operational Deployment Matrix
| Environment | Virtualization | Supported Isolation Modes | Fail-Closed Policy |
| :--- | :--- | :--- | :--- |
| **Linux Bare-Metal / KVM Host** | `/dev/kvm` Available | `firecracker` (Default), `docker` | Yes (Fails if KVM/binary missing) |
| **Cloud VM / Container Host** | Docker Daemon Active | `docker` | Yes (Fails if Docker daemon uncontactable) |
| **Local Developer Machine** | No Docker / No KVM | `process` (`ALLOW_PROCESS_SANDBOX=true`) | Fails if production mode detected |

## Setup & Running
```bash
# Install dependencies
bun install

# Start worker daemon
bun run index.ts

# Run test suite
bun test
```
