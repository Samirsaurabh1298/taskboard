import { nanoid } from 'nanoid'

export const USERS = [
  { id: 'u1', name: 'Samir Saurabh', email: 'sam@acme.com', avatar: 'SS', color: '#5b6af0' },
  { id: 'u2', name: 'Priya Nair',    email: 'priya@acme.com', avatar: 'PN', color: '#2dd4a0' },
  { id: 'u3', name: 'Rahul Dev',     email: 'rahul@acme.com', avatar: 'RD', color: '#f5a623' },
]

export const WORKSPACES = [
  { id: 'ws1', name: 'Acme Product', slug: 'acme-product', memberCount: 8, color: '#5b6af0' },
  { id: 'ws2', name: 'Design System', slug: 'design-system', memberCount: 4, color: '#2dd4a0' },
  { id: 'ws3', name: 'Growth Hacks', slug: 'growth-hacks', memberCount: 5, color: '#f5a623' },
]

const makeTask = (colId, boardId, title, priority, assigneeId, desc = '') => ({
  id: nanoid(8),
  columnId: colId,
  boardId,
  title,
  description: desc,
  priority,
  assigneeId,
  createdAt: new Date(Date.now() - Math.random() * 7 * 86400000).toISOString(),
  updatedAt: new Date().toISOString(),
})

export function buildBoards() {
  const boards = [
    // ws1 boards
    {
      id: 'b1', workspaceId: 'ws1', title: 'Q2 Roadmap',
      isPublic: true, publicToken: 'pub-b1-token',
      columns: [
        { id: 'c1', boardId: 'b1', title: 'Backlog', order: 0, tasks: [] },
        { id: 'c2', boardId: 'b1', title: 'In Progress', order: 1, tasks: [] },
        { id: 'c3', boardId: 'b1', title: 'Review', order: 2, tasks: [] },
        { id: 'c4', boardId: 'b1', title: 'Done', order: 3, tasks: [] },
      ]
    },
    {
      id: 'b2', workspaceId: 'ws1', title: 'Bug Tracker',
      isPublic: false, publicToken: 'pub-b2-token',
      columns: [
        { id: 'c5', boardId: 'b2', title: 'Reported', order: 0, tasks: [] },
        { id: 'c6', boardId: 'b2', title: 'Fixing', order: 1, tasks: [] },
        { id: 'c7', boardId: 'b2', title: 'Resolved', order: 2, tasks: [] },
      ]
    },
    // ws2 boards
    {
      id: 'b3', workspaceId: 'ws2', title: 'Component Library',
      isPublic: true, publicToken: 'pub-b3-token',
      columns: [
        { id: 'c8', boardId: 'b3', title: 'Proposed', order: 0, tasks: [] },
        { id: 'c9', boardId: 'b3', title: 'Building', order: 1, tasks: [] },
        { id: 'c10', boardId: 'b3', title: 'Shipped', order: 2, tasks: [] },
      ]
    },
    // ws3 boards
    {
      id: 'b4', workspaceId: 'ws3', title: 'Launch Experiments',
      isPublic: false, publicToken: 'pub-b4-token',
      columns: [
        { id: 'c11', boardId: 'b4', title: 'Ideas', order: 0, tasks: [] },
        { id: 'c12', boardId: 'b4', title: 'Running', order: 1, tasks: [] },
        { id: 'c13', boardId: 'b4', title: 'Results', order: 2, tasks: [] },
      ]
    },
  ]

  // Seed tasks for b1
  boards[0].columns[0].tasks = [
    makeTask('c1','b1','Redesign onboarding flow','high','u1','Full revamp of the 3-step onboarding wizard'),
    makeTask('c1','b1','Add CSV export to reports','medium','u2'),
    makeTask('c1','b1','Workspace role permissions','medium','u3','Admin, member, viewer roles'),
    makeTask('c1','b1','Dark mode support','low','u1'),
  ]
  boards[0].columns[1].tasks = [
    makeTask('c2','b1','Drag & drop task board','high','u1','Using dnd-kit for accessible DnD'),
    makeTask('c2','b1','Activity feed real-time updates','medium','u2'),
    makeTask('c2','b1','Mobile responsive layout','high','u3'),
  ]
  boards[0].columns[2].tasks = [
    makeTask('c3','b1','API rate limiting','medium','u2'),
    makeTask('c3','b1','Email notification system','low','u1'),
  ]
  boards[0].columns[3].tasks = [
    makeTask('c4','b1','Authentication & session handling','high','u3','JWT + refresh token flow'),
    makeTask('c4','b1','Multi-workspace switcher','medium','u1'),
  ]

  // b2
  boards[1].columns[0].tasks = [
    makeTask('c5','b2','Sidebar collapses on mobile','high','u1'),
    makeTask('c5','b2','Date picker timezone issue','medium','u2'),
  ]
  boards[1].columns[1].tasks = [
    makeTask('c6','b2','Task card hover state flicker','low','u3'),
  ]
  boards[1].columns[2].tasks = [
    makeTask('c7','b2','Login redirect loop fixed','high','u1'),
  ]

  // b3
  boards[2].columns[0].tasks = [
    makeTask('c8','b3','Toast notification component','medium','u2'),
    makeTask('c8','b3','Date range picker','high','u1'),
  ]
  boards[2].columns[1].tasks = [
    makeTask('c9','b3','Avatar component','low','u3'),
    makeTask('c9','b3','Badge variants','low','u2'),
  ]
  boards[2].columns[2].tasks = [
    makeTask('c10','b3','Button component','medium','u1'),
    makeTask('c10','b3','Modal / Dialog','high','u2'),
    makeTask('c10','b3','Input & Form fields','medium','u3'),
  ]

  // b4
  boards[3].columns[0].tasks = [
    makeTask('c11','b4','Homepage hero A/B test','high','u1'),
    makeTask('c11','b4','Pricing page copy experiment','medium','u2'),
  ]
  boards[3].columns[1].tasks = [
    makeTask('c12','b4','CTA button color experiment','medium','u3'),
  ]
  boards[3].columns[2].tasks = [
    makeTask('c13','b4','Signup flow optimization — +12% CVR','high','u1'),
  ]

  return boards
}

export const ACTIVITY_ACTIONS = ['moved', 'created', 'updated']

export function makeActivity(task, action, actor, from, to) {
  return {
    id: nanoid(6),
    boardId: task.boardId,
    taskId: task.id,
    taskTitle: task.title,
    actor,
    action,
    from,
    to,
    timestamp: new Date().toISOString(),
  }
}
