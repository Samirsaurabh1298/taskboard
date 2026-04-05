import React, { useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  DndContext, DragOverlay, closestCorners,
  KeyboardSensor, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates, arrayMove } from '@dnd-kit/sortable'
import { AppShell } from '../components/layout/AppShell.jsx'
import { BoardColumn } from '../components/board/BoardColumn.jsx'
import { TaskCard } from '../components/board/TaskCard.jsx'
import { ActivityFeed } from '../components/board/ActivityFeed.jsx'
import { Skeleton, EmptyState } from '../components/ui/index.jsx'
import { useUIStore } from '../store/uiStore.js'
import { api } from '../api/index.js'

export default function BoardPage() {
  const { boardId, workspaceId } = useParams()
  const { activityOpen } = useUIStore()
  const qc = useQueryClient()

  const { data: board, isLoading, isError } = useQuery({
    queryKey: ['board', boardId],
    queryFn: () => api.getBoard(boardId),
    enabled: !!boardId,
    staleTime: 5000,
  })

  // Simulate remote update every 20s
  useEffect(() => {
    if (!board) return
    const timer = setInterval(() => {
      // Pick a random task from any non-last column and "move" it
      const movableCols = board.columns.filter((c, i) => i < board.columns.length - 1 && c.tasks.length > 0)
      if (movableCols.length === 0) return
      const fromCol = movableCols[Math.floor(Math.random() * movableCols.length)]
      const task = fromCol.tasks[0]
      const toColIdx = board.columns.findIndex(c => c.id === fromCol.id) + 1
      const toCol = board.columns[toColIdx]
      if (!toCol) return
      api.updateTask(task.id, { columnId: toCol.id }).then(() => {
        qc.invalidateQueries({ queryKey: ['board', boardId] })
        qc.invalidateQueries({ queryKey: ['activity', boardId] })
      })
    }, 20000)
    return () => clearInterval(timer)
  }, [board, boardId, qc])

  // DnD state
  const [activeTask, setActiveTask] = React.useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const moveMutation = useMutation({
    mutationFn: ({ taskId, columnId, order }) => api.updateTask(taskId, { columnId, order }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['board', boardId] })
      qc.invalidateQueries({ queryKey: ['activity', boardId] })
    },
  })

  const handleDragStart = ({ active }) => {
    const task = findTaskById(board, active.id)
    setActiveTask(task)
  }

  const handleDragEnd = ({ active, over }) => {
    setActiveTask(null)
    if (!over || !board) return

    const taskId = active.id
    const overId = over.id

    // Find source
    const sourceCol = board.columns.find(c => c.tasks.some(t => t.id === taskId))
    if (!sourceCol) return

    // Is the over target a column or a task?
    const destCol = board.columns.find(c => c.id === overId)
      || board.columns.find(c => c.tasks.some(t => t.id === overId))

    if (!destCol) return

    const task = sourceCol.tasks.find(t => t.id === taskId)
    const isSameCol = sourceCol.id === destCol.id

    let newOrder
    if (overId === destCol.id) {
      // Dropped directly on column — append
      newOrder = destCol.tasks.length
    } else {
      const overTask = destCol.tasks.find(t => t.id === overId)
      newOrder = destCol.tasks.indexOf(overTask)
    }

    // Optimistic update
    qc.setQueryData(['board', boardId], (old) => {
      if (!old) return old
      const newBoard = JSON.parse(JSON.stringify(old))
      const src = newBoard.columns.find(c => c.id === sourceCol.id)
      const dst = newBoard.columns.find(c => c.id === destCol.id)
      src.tasks = src.tasks.filter(t => t.id !== taskId)
      task.columnId = destCol.id
      if (newOrder >= dst.tasks.length) dst.tasks.push(task)
      else dst.tasks.splice(newOrder, 0, task)
      return newBoard
    })

    moveMutation.mutate({ taskId, columnId: destCol.id, order: newOrder })
  }

  if (isLoading) return (
    <AppShell>
      <div style={{ flex: 1, padding: '32px', display: 'flex', gap: '16px', overflowX: 'auto' }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{ width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Skeleton height={20} width={120} />
            {[...Array(3)].map((_, j) => <Skeleton key={j} height={90} radius={10} />)}
          </div>
        ))}
      </div>
    </AppShell>
  )

  if (isError || !board) return (
    <AppShell>
      <EmptyState icon="⚠️" title="Board not found" description="This board doesn't exist or you don't have access." />
    </AppShell>
  )

  return (
    <AppShell>
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Board area */}
        <div style={{ flex: 1, overflowX: 'auto', overflowY: 'hidden' }}>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div style={{
              display: 'flex', gap: '20px',
              padding: '28px 32px',
              height: '100%', alignItems: 'flex-start',
              minWidth: 'max-content',
            }}>
              {board.columns
                .slice()
                .sort((a, b) => a.order - b.order)
                .map(col => (
                  <BoardColumn key={col.id} column={col} boardId={boardId} />
                ))
              }
            </div>

            <DragOverlay>
              {activeTask && <TaskCard task={activeTask} boardId={boardId} overlay />}
            </DragOverlay>
          </DndContext>
        </div>

        {/* Activity feed */}
        <ActivityFeed boardId={boardId} open={activityOpen} />
      </div>
    </AppShell>
  )
}

function findTaskById(board, taskId) {
  if (!board) return null
  for (const col of board.columns) {
    const task = col.tasks.find(t => t.id === taskId)
    if (task) return task
  }
  return null
}
