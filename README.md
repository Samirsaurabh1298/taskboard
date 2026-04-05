# TaskBoard — Multi-Workspace Task Board with Shareable Views

A frontend engineering assignment implementation. Full-featured task board with drag & drop, multi-workspace support, real-time activity feed simulation, and publicly shareable board views.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Initialize MSW service worker (required once)
npx msw init public/ --save

# 3. Start the dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Demo Accounts

| Name | Email | Password |
|---|---|---|
| Samir Saurabh | sam@acme.com | demo |
| Priya Nair | priya@acme.com | demo |
| Rahul Dev | rahul@acme.com | demo |

> All accounts use the same password: **`demo`**

## Features

- **Auth** — Login with mock API, session in sessionStorage, auto-redirect on 401
- **Workspaces** — Switch between 3 demo workspaces (Acme Product, Design System, Growth Hacks)
- **Task Board** — Drag & drop tasks across columns and reorder within columns
- **Task CRUD** — Create, edit, delete tasks with title, description, priority, assignee
- **Activity Feed** — Collapsible panel showing recent actions, polled every 10s
- **Simulated Real-time** — Random task moves every 20s to simulate another user editing
- **Public Boards** — Shareable read-only URLs at `/public/board/:token` with OG meta tags
- **Responsive** — Mobile-first layout with collapsible sidebar and touch-friendly controls
- **Theming** — Full Dark / Light theme toggle with persisted user preference

## Public Board URLs (demo)

```
http://localhost:5173/public/board/pub-b1-token   ← Q2 Roadmap (public)
http://localhost:5173/public/board/pub-b3-token   ← Component Library (public)
```

## Project Structure

```
src/
├── api/          # Fetch abstraction layer
├── components/
│   ├── board/    # TaskCard, BoardColumn, TaskForm, ActivityFeed
│   ├── layout/   # AppShell, Sidebar, Topbar, PrivateRoute
│   └── ui/       # Button, Modal, Input, Avatar, Badge, Spinner, Skeleton
├── mocks/        # MSW handlers + seed data
├── pages/        # LoginPage, WorkspacesPage, WorkspacePage, BoardPage, PublicBoardPage
├── store/        # Zustand: authStore, workspaceStore, uiStore
└── utils/        # constants (users, priority config)
```

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 18 (JavaScript) |
| Build | Vite |
| Routing | React Router v6 |
| Server State | TanStack Query (React Query) |
| Client State | Zustand |
| Drag & Drop | @dnd-kit/core + @dnd-kit/sortable |
| Mock API | MSW v2 |
| Forms | Native (controlled) |
| Styling | CSS Variables + Component-scoped inline styles |

See `ENGINEERING_NOTES.md` for full architectural decisions and trade-offs.
