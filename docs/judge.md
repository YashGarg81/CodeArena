# CodeArena — Online Judge & Sandbox Execution Engine

## Overview
The judge subsystem isolates user submitted code into asynchronous sandboxed execution processes.

```
Client (Submit) ──► API (/submissions) ──► Redis Queue ('problems')
                                                    │
                                                    ▼
                                           Worker Daemon (Pop)
                                                    │
                                          ┌─────────┴─────────┐
                                          │  Driver Injection │
                                          │  Sandbox Subproc  │
                                          │  5s TLE Watchdog  │
                                          └─────────┬─────────┘
                                                    │
                                                    ▼
                                           PostgreSQL (Result)
```

## Language Execution Matrix
| Language | Driver File | Command | Timeout | Memory Limit |
|---|---|---|---|---|
| JavaScript | `a.cjs` | `node a.cjs` | 5000 ms | 128 MB |
| Python | `a.py` | `python a.py` | 5000 ms | 128 MB |
| C++ | `a.cpp` ➔ `out.exe` | `g++ a.cpp -o out.exe && ./out.exe` | 5000 ms | 128 MB |

## Execution Safety Rules
1. Subprocesses execute with stdin/stdout piping only.
2. Hard timer forcefully kills spawned process on timeout (`TLE` status).
3. Temporary execution folders are scrubbed between runs.
4. Database updates are performed strictly after execution finishes.
