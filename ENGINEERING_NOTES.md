# Engineering Notes

## Overview

This is a frontend SPA built with React 18 and JavaScript, using Vite as the build tool. All API calls are intercepted by MSW (Mock Service Worker) which runs in the browser as a service worker — meaning the mock is indistinguishable from a real network call and can be replaced with a real API by simply removing the MSW bootstrap in `main.jsx`.

---

## Architectural Decisions

### SPA over SSR

The application is a pure client-side SPA (no Next.js / SSR). This was a deliberate trade-off:

**Pros:** Simpler setup, faster iteration, no server required.  
**Cons:** Public board pages rendered by the client won't have OG meta tags visible to crawlers that don't execute JavaScript.

**Mitigation:** I inject OG/Twitter meta tags dynamically via `document.querySelector` in `PublicBoardPage`. This works for most social preview tools (Slack, iMessage, WhatsApp) which do execute JS. For Google/proper SEO, the production fix would be switching to Next.js with `generateMetadata` and server-side rendering of public routes — a one-page route migration, not a full rewrite.

**Assumption:** For this assignment, JS-injected meta tags are sufficient to demonstrate the shareable views concept.

---

### Mock API with MSW v2

All API endpoints are intercepted using MSW's `http` handlers. The mock data is seeded in memory at startup. This approach means:

- Zero difference between "mock mode" and "real API mode" from React's perspective — the same `fetch` calls work in both cases.
- Switching to a real backend is a one-line change: remove `worker.start()` from `main.jsx`.
- The in-memory store persists across hot reloads in dev but resets on full page refresh — intentional for a demo.

---

## State Management

I split state into two layers with a clear separation of concerns:

### Server State → TanStack Query (React Query)

Everything that lives on the server: workspaces, boards, tasks, activity feed. React Query handles:
- Caching with configurable stale times
- Background refetching on window focus
- Loading/error states per query
- Optimistic updates via `setQueryData` for drag & drop

I use `invalidateQueries` after mutations to ensure the UI stays consistent. For drag & drop, I additionally apply an **optimistic update** (`setQueryData`) before the mutation fires, so the UI responds instantly without waiting for the network round-trip.

### Client State → Zustand

Only three thin slices:
- `authStore` — user, token, persisted to `sessionStorage`
- `themeStore` — current active theme ('dark' or 'light'), persisted to `localStorage`
- `workspaceStore` — active workspace ID, persisted to `localStorage`
- `uiStore` — sidebar open/closed, activity panel open/closed, active modal — ephemeral

**Why Zustand over Redux?** Redux Toolkit adds meaningful boilerplate (slice, selectors, thunks) that doesn't pay off at this scale. Zustand gives the same result with ~5 lines per slice and no ceremony.

---

## Data Fetching Strategy

| Query | Stale Time | Refetch Interval |
|---|---|---|
| Workspaces | 30s | on focus |
| Boards list | 10s | on focus |
| Board (full) | 5s | on focus |
| Activity feed | 5s | every 10s |
| Public board | 30s | none |

The activity feed uses `refetchInterval: 10000` to poll for new events — a pragmatic stand-in for WebSockets. In production this would be replaced with a SSE or WebSocket connection.

**Session expiry:** The `api.js` request wrapper checks for HTTP 401, clears sessionStorage, and redirects to `/login`. Since MSW handles all requests, this is simulated by returning 401 from the login endpoint on bad credentials.

---

## Component Organization

**Dumb components** (`src/components/ui/`) — purely presentational, receive only props, no store access:
`Button`, `Badge`, `Avatar`, `Modal`, `Input`, `Select`, `Spinner`, `Skeleton`, `EmptyState`

**Feature components** (`src/components/board/`) — domain-specific but still prop-driven:
`TaskCard`, `BoardColumn`, `TaskForm`, `ActivityFeed`

**Layout components** (`src/components/layout/`) — own routing context and store reads:
`AppShell`, `Sidebar`, `Topbar`, `PrivateRoute`

**Pages** (`src/pages/`) — route-level components that own data fetching:
`LoginPage`, `WorkspacesPage`, `WorkspacePage`, `BoardPage`, `PublicBoardPage`

This creates a clear data-flow direction: Pages → Feature Components → UI Components.

---

## Drag & Drop

Using `@dnd-kit` (not `react-beautiful-dnd` which is unmaintained). Key decisions:

- `PointerSensor` with `activationConstraint: { distance: 8 }` — prevents accidental drag on click
- `KeyboardSensor` — accessible keyboard navigation
- `closestCorners` collision detection — works better for multi-column boards than `closestCenter`
- `DragOverlay` renders a rotated ghost card at the cursor position
- Cross-column drops update `columnId` + `order` in a single `PATCH /task/:id` call
- Optimistic update applied immediately via `qc.setQueryData` to avoid flicker

---

## Publicly Shareable Views

Each board has a `publicToken` (stable UUID). The public route `/public/board/:token`:

1. Sits outside `<PrivateRoute>` — no auth required
2. Calls `GET /api/public/board/:token` (no `Authorization` header)
3. Returns 404 if the board doesn't exist OR `isPublic` is false
4. Renders a read-only version (no drag handles, no edit/delete controls)
5. Injects OG/Twitter meta tags dynamically for link previews

**Discoverability assumption:** Public boards are opt-in at the board level. The token is stable — it doesn't rotate unless the owner regenerates it (not implemented in this demo but easy to add as a board settings action).

**Link preview example (what Slack/Twitter sees):**
```
og:title    → "Q2 Roadmap"
og:description → "12 tasks across 4 columns"
og:url      → https://yourapp.com/public/board/pub-b1-token
```

---

## Data Models

```js
Workspace  { id, name, slug, memberCount, color }
Board      { id, workspaceId, title, isPublic, publicToken, columns[] }
Column     { id, boardId, title, order, tasks[] }
Task       { id, columnId, boardId, title, description, priority, assigneeId, createdAt, updatedAt }
Activity   { id, boardId, taskId, taskTitle, actor, action, from, to, timestamp }
```

Tasks are embedded inside columns inside boards. This denormalized structure simplifies read paths (one query gets the full board) at the cost of more complex write paths (moving a task means mutating two column arrays). For a production app with high concurrency, a normalized server-side model with fractional ordering would be more robust.

---

## Trade-offs & Assumptions

| Decision | Trade-off | Production fix |
|---|---|---|
| Client-rendered public pages | OG tags need JS execution | SSR with Next.js |
| Polling for activity | 10s latency, extra requests | WebSockets / SSE |
| In-memory mock state | Resets on page refresh | Real database |
| Tasks embedded in board response | Simple reads, complex writes | Normalized REST or GraphQL |
| Integer task ordering | Concurrent reorders can conflict | Fractional indexing (like Linear) |
| Single public token per board | No per-user share control | Per-user scoped tokens with expiry |
| sessionStorage for auth | Logs out on tab close | httpOnly cookie with refresh token |

---

## Simulated Real-Time

Every 20 seconds on the `BoardPage`, a `setInterval` picks a random task from a non-final column and moves it to the next column via `api.updateTask`. This simulates another user editing the board. After the mutation, it invalidates `['board', boardId]` and `['activity', boardId]` causing React Query to refetch and update the UI.

Combined with the activity feed polling every 10s, this creates the impression of a live collaborative environment without any infrastructure.

---

## Theme Management

I implemented a robust dual-theme system (Dark/Light) using CSS variables and Zustand:

- **Tokens:** All UI components use semantic CSS variables (e.g., `--bg-base`, `--text-primary`).
- **Switching:** A `[data-theme="light"]` selector in `index.css` overrides these tokens.
- **Persistence:** The `themeStore` uses Zustand's `persist` middleware to save the user's preference to `localStorage`.
- **Performance:** To prevent a "flash" of the default dark theme, the `themeStore` module applies the saved theme attribute to `document.documentElement` as soon as it's imported, even before the React tree mounts.
- **UI:** The `ThemeToggle` component is a custom-built, animated pill toggle with spring-physics transitions (via `cubic-bezier`).

---

## What I'd Add With More Time

1. **Optimistic task creation** — task appears in column instantly before API confirms
2. **Undo/redo** — Zustand middleware recording last N mutations with Ctrl+Z support
3. **Board settings panel** — toggle isPublic, copy share link, regenerate token
4. **Search/filter** — filter tasks by assignee or priority within a board
5. **Proper SSR for public pages** — Next.js with `generateMetadata` for true crawler support
6. **WebSocket activity** — replace polling with a persistent connection
7. **Offline support** — queue mutations in IndexedDB when offline, replay on reconnect
