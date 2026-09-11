# CodeArena — Frontend Web Client

Modern, responsive Developer Operating System UI built with React, Monaco Editor, Tailwind CSS, and Lucide icons, bundled via Bun.

## Features
- **Monaco Code Editor**: Multi-language code editor with themes, keybindings, and console runner.
- **Problem Explorer**: Filterable DSA catalog by difficulty, company tags, and topic.
- **Live System Design Whiteboard**: Vector canvas for distributed system architecture.
- **Interview Studio**: Split candidate/interviewer workspace with private notes and rubrics.
- **Command Palette (`⌘K` / `Ctrl+K`)**: Instant search and navigation across problems and actions.

## Setup & Running
```bash
# Install dependencies
bun install

# Start development server (Port 3003)
bun dev

# Build production bundle
bun run build:frontend

# Typecheck
bun x tsc --noEmit
```
