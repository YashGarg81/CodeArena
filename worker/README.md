# CodeArena — Sandboxed Judge Execution Worker

Asynchronous queue consumer daemon that executes untrusted code in isolated subprocesses.

## Features
- **Queue Consumer**: Pops execution jobs from Redis FIFO queue (`problems`).
- **Multi-Language Drivers**: Automated driver wrapping for JavaScript (Node), Python, and C++ (`g++`).
- **Isolation & Watchdogs**: 5-second hard `SIGKILL` timeout to prevent infinite loops and fork bombs.
- **Result Persistence**: Stores verdicts, runtimes, test pass rates, and output back to PostgreSQL.

## Setup & Running
```bash
# Install dependencies
bun install

# Start worker daemon
bun run index.ts

# Run test suite
bun test
```
