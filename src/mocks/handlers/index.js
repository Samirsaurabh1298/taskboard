import { http, HttpResponse, delay } from 'msw'
import { nanoid } from 'nanoid'
import { USERS, WORKSPACES, buildBoards, makeActivity } from '../data/seed.js'

// --- In-memory store ---
let boards = buildBoards()
let activityLog = []          // { boardId, events[] }

const getActivity = (boardId) => activityLog.filter(e => e.boardId === boardId)
const pushActivity = (event) => activityLog.unshift(event)

// Helper: deep clone a board
const findBoard  = (id) => boards.find(b => b.id === id)
const findTask   = (taskId) => {
  for (const b of boards) {
    for (const col of b.columns) {
      const t = col.tasks.find(t => t.id === taskId)
      if (t) return { task: t, col, board: b }
    }
  }
  return null
}

export const handlers = [

  // POST /login
  http.post('/api/login', async ({ request }) => {
    await delay(600)
    const { email, password } = await request.json()
    if (password !== 'demo') {
      return HttpResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }
    const user = USERS.find(u => u.email === email) || USERS[0]
    return HttpResponse.json({ user, token: 'mock-jwt-token-' + nanoid(8) })
  }),

  // GET /workspaces
  http.get('/api/workspaces', async () => {
    await delay(400)
    return HttpResponse.json(WORKSPACES)
  }),

  // GET /boards?workspaceId=
  http.get('/api/boards', async ({ request }) => {
    await delay(350)
    const url = new URL(request.url)
    const wsId = url.searchParams.get('workspaceId')
    const result = boards
      .filter(b => b.workspaceId === wsId)
      .map(({ columns, ...b }) => ({ ...b, taskCount: columns.reduce((s, c) => s + c.tasks.length, 0) }))
    return HttpResponse.json(result)
  }),

  // GET /board/:id
  http.get('/api/board/:id', async ({ params }) => {
    await delay(400)
    const board = findBoard(params.id)
    if (!board) return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    return HttpResponse.json(board)
  }),

  // GET /public/board/:token (no auth)
  http.get('/api/public/board/:token', async ({ params }) => {
    await delay(400)
    const board = boards.find(b => b.publicToken === params.token)
    if (!board || !board.isPublic) {
      return HttpResponse.json({ error: 'Not found or not public' }, { status: 404 })
    }
    return HttpResponse.json(board)
  }),

  // POST /task
  http.post('/api/task', async ({ request }) => {
    await delay(300)
    const body = await request.json()
    const newTask = {
      id: nanoid(8),
      columnId: body.columnId,
      boardId: body.boardId,
      title: body.title,
      description: body.description || '',
      priority: body.priority || 'medium',
      assigneeId: body.assigneeId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    const board = findBoard(body.boardId)
    const col = board?.columns.find(c => c.id === body.columnId)
    if (!col) return HttpResponse.json({ error: 'Column not found' }, { status: 404 })
    col.tasks.push(newTask)
    pushActivity(makeActivity(newTask, 'created', 'You', null, col.title))
    return HttpResponse.json(newTask, { status: 201 })
  }),

  // PATCH /task/:id
  http.patch('/api/task/:id', async ({ params, request }) => {
    await delay(250)
    const body = await request.json()
    const found = findTask(params.id)
    if (!found) return HttpResponse.json({ error: 'Task not found' }, { status: 404 })
    const { task, col, board } = found

    if (body.columnId && body.columnId !== task.columnId) {
      // Move task to new column
      const oldColTitle = col.title
      col.tasks = col.tasks.filter(t => t.id !== task.id)
      const newCol = board.columns.find(c => c.id === body.columnId)
      if (!newCol) return HttpResponse.json({ error: 'Target column not found' }, { status: 404 })
      task.columnId = body.columnId
      task.updatedAt = new Date().toISOString()
      // Insert at position if provided
      if (typeof body.order === 'number') {
        newCol.tasks.splice(body.order, 0, task)
      } else {
        newCol.tasks.push(task)
      }
      pushActivity(makeActivity(task, 'moved', 'You', oldColTitle, newCol.title))
    } else if (body.order !== undefined && body.order !== null) {
      // Reorder within same column
      const idx = col.tasks.findIndex(t => t.id === task.id)
      col.tasks.splice(idx, 1)
      col.tasks.splice(body.order, 0, task)
    }

    // Update fields
    if (body.title !== undefined) task.title = body.title
    if (body.description !== undefined) task.description = body.description
    if (body.priority !== undefined) task.priority = body.priority
    if (body.assigneeId !== undefined) task.assigneeId = body.assigneeId
    task.updatedAt = new Date().toISOString()

    if (!body.columnId && body.title) {
      pushActivity(makeActivity(task, 'updated', 'You', null, null))
    }

    return HttpResponse.json(task)
  }),

  // DELETE /task/:id
  http.delete('/api/task/:id', async ({ params }) => {
    await delay(250)
    const found = findTask(params.id)
    if (!found) return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    const { task, col } = found
    col.tasks = col.tasks.filter(t => t.id !== task.id)
    pushActivity(makeActivity(task, 'deleted', 'You', null, null))
    return HttpResponse.json({ success: true })
  }),

  // GET /activity/:boardId
  http.get('/api/activity/:boardId', async ({ params }) => {
    await delay(200)
    return HttpResponse.json(getActivity(params.boardId).slice(0, 20))
  }),
]
