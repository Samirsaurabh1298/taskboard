import React, { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { TaskCard } from './TaskCard.jsx'
import { Button } from '../ui/index.jsx'
import { TaskForm } from './TaskForm.jsx'

export function BoardColumn({ column, boardId }) {
  const [addingTask, setAddingTask] = useState(false)

  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { type: 'column', column },
  })

  const taskIds = column.tasks.map(t => t.id)

  return (
    <div style={{
      width: 280, flexShrink: 0,
      display: 'flex', flexDirection: 'column', gap: '0',
      animation: 'slideIn 0.2s ease',
    }}>
      {/* Column header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 4px', marginBottom: '8px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            fontFamily: 'var(--font-display)', fontWeight: 700,
            fontSize: '13px', letterSpacing: '0.04em', textTransform: 'uppercase',
            color: 'var(--text-secondary)',
          }}>
            {column.title}
          </span>
          <span style={{
            minWidth: 20, height: 20, borderRadius: '6px',
            background: 'var(--bg-raised)', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)',
          }}>
            {column.tasks.length}
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setAddingTask(true)}
          style={{ padding: '3px 7px', fontSize: '16px', color: 'var(--text-muted)' }}>
          +
        </Button>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        style={{
          display: 'flex', flexDirection: 'column', gap: '8px',
          minHeight: 80, padding: '4px',
          borderRadius: 'var(--radius-md)',
          background: isOver ? 'var(--accent-subtle)' : 'transparent',
          border: isOver ? '1px dashed var(--accent)' : '1px dashed transparent',
          transition: 'background 0.15s, border-color 0.15s',
          flex: 1,
        }}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {column.tasks.map(task => (
            <TaskCard key={task.id} task={task} boardId={boardId} />
          ))}
        </SortableContext>

        {column.tasks.length === 0 && !isOver && (
          <div style={{
            padding: '20px', textAlign: 'center',
            color: 'var(--text-muted)', fontSize: '12px',
            borderRadius: 'var(--radius-sm)',
          }}>
            Drop tasks here
          </div>
        )}
      </div>

      {/* Add task button at bottom */}
      <button
        onClick={() => setAddingTask(true)}
        style={{
          marginTop: '8px', width: '100%', padding: '8px',
          background: 'transparent', border: '1px dashed var(--border)',
          borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)',
          fontSize: '12px', cursor: 'pointer', fontFamily: 'var(--font-body)',
          transition: 'all 0.15s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = 'var(--accent)'
          e.currentTarget.style.color = 'var(--accent)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'var(--border)'
          e.currentTarget.style.color = 'var(--text-muted)'
        }}
      >
        + Add task
      </button>

      {addingTask && (
        <TaskForm
          columnId={column.id}
          boardId={boardId}
          onClose={() => setAddingTask(false)}
        />
      )}
    </div>
  )
}
