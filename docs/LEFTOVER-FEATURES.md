# CodeArena — Leftover and addable features

Features that are **missing**, **partial**, or **safe to add** without pretending they already ship. Grouped by priority. Pair with `QA_ELEMENT_AND_API_REPORT.md` for bugs vs new work.

Status key: **MISSING** (no real path) · **STUB** (API or UI only) · **PARTIAL** (exists but not E2E) · **ADD** (not in spec yet, high value)

---

## P0 — Must exist before any public deploy

| Feature | Status | What to add |
| --- | --- | --- |
| Short-lived access + refresh rotation | STUB | Use `generateAccessToken` / `generateRefreshToken` on signup/login/social. Add `POST /api/v1/auth/refresh` with rotation and reuse detection. Store `RefreshToken` + `Session` rows. |
| Logout that actually kills the session | PARTIAL | Frontend `handleLogout` → `POST /auth/logout`. Device list UI → `GET /auth/sessions` + `POST /auth/logout-all`. |
| Real 2FA | STUB | Persist `totpSecret`, `twoFactorEnabled`, hashed backup codes on `User`. Setup must save secret only after verify. Login must require TOTP when enabled. |
| Password reset + email verification | MISSING | `POST /auth/forgot-password`, `/reset-password`, `/verify-email`. Token hashed in DB, TTL, revoke sessions on reset. Email worker (today queue is mostly in-memory). |
| Production judge isolation | PARTIAL | Refuse worker/API start if `NODE_ENV=production` and Docker sandbox unavailable. Move `/submissions/run` off the API process onto the worker queue. |
| Remove demo admin backdoor | MISSING as policy | Delete `password123` auto-provision of ADMIN. Seed admin only via migration + env. |
| Hard-fail without Postgres | PARTIAL | Disable silent in-memory Prisma writes in production. |

---

## P1 — Core product journeys still incomplete

| Feature | Status | What to add |
| --- | --- | --- |
| URL routing / deep links | MISSING | `/problems/:id`, `/contest/:id`, `/learn/:slug`. Browser back, shareable links, refresh persistence. |
| Contest register, enter, standings | STUB | `POST /contests/:id/register`, `GET /contests/:id`, `GET /contests/:id/standings`, freeze, clarifications. Wire the Register button (today it only toasts). |
| Live mock interview | STUB | Interview page → `POST/GET /api/v1/interviews`. Shared editor room, timer, scorecard persisted as `InterviewEvaluation`. |
| Collaborative editor (real) | STUB | Connect `CollaborativeEditor` to Socket.IO (`collaborationEngine`). Auth on join, room ACLs, OT or CRDT, not fake `alice_dev`. |
| Roadmap progress | PARTIAL | Map API `nodes` to UI (or return `stages`). `POST /roadmaps/:slug/nodes/:id/complete`. Persist `RoadmapProgress`. |
| Problem likes in UI | PARTIAL | Heart button on problem list/detail calling toggle like API. |
| Submission compare UI | STUB | Two-pane diff using `/submissions/:id/compare/:targetId`. |
| Global search API in command palette | STUB | Palette should query `GET /api/v1/search` (problems, posts, users), not only local nav. |
| Profile by username | PARTIAL | Public `/u/:username` using `GET /users/:username/profile`. |
| Notifications bell | STUB | Poll or websocket `GET /notifications` + mark read. |
| Snippets product | STUB | UI for `GET/POST /api/v1/snippets`. |
| Achievements / XP display | PARTIAL | Surface `GET /achievements` and `GET /users/me/learning` on dashboard. |
| Real OAuth | PARTIAL | GitHub/Google redirect + code exchange. Frontend must send `oauthToken`. Disable `ALLOW_DEV_SOCIAL_AUTH` in staging. |

---

## P2 — Learning, judge, and admin depth

| Feature | Status | What to add |
| --- | --- | --- |
| AI tutor (real) | STUB | Optional LLM provider with rate limits, prompt isolation, no hidden-test leakage. Keep current templates as fallback. UI “Explain / Hint” buttons. |
| Plagiarism on submit | STUB | Call `compareSubmissions` after Accepted; flag + admin queue. |
| Advanced checkers in worker | PARTIAL | Wire `outputCheckers` into worker adapters (float, tokens), not only unit tests. |
| Hidden-test authoring UX | PARTIAL | Admin test-case editor exists; add checker type, explanation, sample vs hidden badges. |
| Discussion per problem | ADD | LeetCode-style threads keyed by `problemId` (forum is global only). |
| Solutions / editorial unlock | ADD | Show editorial after Accepted or after contest freeze. Public GET already strips `solutions`. |
| Daily challenge / streak freeze | ADD | Cron job, timezone, streak repair rules (`lastActiveDate` exists). |
| Contest rating for participants | PARTIAL | `applyContestRatings` on admin `end`; need join + scored submissions first. |
| Course lesson editor | PARTIAL | Admin courses CRUD exists; nested lesson/quiz editor in UI is thin. |
| Organizations / teams | STUB | Prisma `OrganizationMember` unused in product UI. |
| Billing / subscriptions | STUB | `UserSubscription` model unused. |

---

## P3 — UX, a11y, quality

| Feature | Status | What to add |
| --- | --- | --- |
| Accessibility baseline | MISSING | `htmlFor` on every label, dialog roles, focus trap, skip link, keyboard Monaco, contrast audit. |
| Empty / error / loading states | PARTIAL | Consistent skeletons; retry on 5xx; offline banner. |
| i18n | ADD | String catalog; keep problem statements in DB per locale. |
| Dark/light persistence | PARTIAL | Theme in `localStorage`; add system preference. |
| Mobile nav | PARTIAL | Large `App.tsx` layouts (contest 1fr/300px) will break; add drawer. |
| Share cards / OG | PARTIAL | Share API exists; add Open Graph for crawlers (SPA limitation — needs prerender or meta API). |
| Keyboard shortcuts help | ADD | `?` overlay documenting command palette keys. |
| Onboarding checklist | ADD | First-run: pick language, solve Two Sum, enroll in a course. |

---

## P4 — Scale / enterprise (later)

| Feature | Status | What to add |
| --- | --- | --- |
| gVisor / Firecracker judge | ADD | Replace Docker-socket worker. |
| Multi-region Redis + Postgres | ADD | Documented in `docs/scaling.md`; not implemented. |
| CDN for static + Monaco | ADD | |
| Feature flags | ADD | |
| Audit export / SIEM | PARTIAL | Audit logs API; add retention and export. |
| SSO / SAML / OIDC | ADD | |
| SCIM user provisioning | ADD | |
| Custom domains per org | ADD | |

---

## Suggested first slice (smallest useful E2E)

1. Navbar logout → revoke token (E03).  
2. Contest `register` API + button (E05).  
3. Roadmap `nodes` mapping (E08).  
4. Login tokens 15m + refresh (A01).  
5. Delete admin password backdoor (A02).  

That slice does not require an LLM, Docker chaos tests, or a rewrite of `App.tsx`, but it makes the “minute-level” product honest.
