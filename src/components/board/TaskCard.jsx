import React, { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Badge, Avatar } from '../ui/index.jsx'
import { getUserById, PRIORITY_CONFIG } from '../../utils/constants.js'
import { api } from '../../api/index.js'
import { TaskForm } from './TaskForm.jsx'

export function TaskCard({ task, boardId, overlay = false }) {
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const qc = useQueryClient()

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: 'task', task },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
  }

  const deleteMutation = useMutation({
    mutationFn: () => api.deleteTask(task.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['board', boardId] })
      qc.invalidateQueries({ queryKey: ['activity', boardId] })
    },
  })

  const assignee = getUserById(task.assigneeId)
  const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium

  const cardStyle = {
    background: overlay ? 'var(--bg-hover)' : 'var(--bg-raised)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    padding: '12px 14px',
    cursor: 'grab',
    boxShadow: overlay ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
    transform: overlay ? 'rotate(2deg) scale(1.02)' : undefined,
    display: 'flex', flexDirection: 'column', gap: '10px',
    transition: 'box-shadow 0.15s, border-color 0.15s',
    position: 'relative',
    animation: 'fadeIn 0.18s ease',
  }

  return (
    <>
      <div ref={setNodeRef} style={{ ...cardStyle, ...style }} {...attributes} {...listeners}
        onMouseEnter={e => { if (!isDragging) e.currentTarget.style.borderColor = 'var(--border-light)' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
      >
        {/* Priority strip */}
        <div style={{
          position: 'absolute', top: 0, left: 0, width: 3,
          height: '100%', borderRadius: '10px 0 0 10px',
          background: priority.color,
        }} />

        {/* Title */}
        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.45, paddingLeft: '4px' }}>
          {task.title}
        </div>

        {/* Description preview */}
        {task.description && (
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.4, paddingLeft: '4px',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {task.description}
          </div>
        )}

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: '4px' }}>
          <Badge color={priority.color} bg={priority.bg}>{priority.label}</Badge>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {assignee && <Avatar user={assignee} size={22} />}
            {/* Actions — only visible on hover via CSS-in-JS trick */}
            <div className="card-actions" style={{ display: 'flex', gap: '2px' }}
              onPointerDown={e => e.stopPropagation()}>
              <ActionBtn title="Edit" onClick={() => setEditing(true)}>✎</ActionBtn>
              <ActionBtn title="Delete" onClick={() => setConfirmDelete(true)} danger>✕</ActionBtn>
            </div>
          </div>
        </div>
      </div>

      {editing && (
        <TaskForm task={task} boardId={boardId} onClose={() => setEditing(false)} />
      )}

      {confirmDelete && (
        <ConfirmDialog
          message={`Delete "${task.title}"?`}
          onConfirm={() => { deleteMutation.mutate(); setConfirmDelete(false) }}
          onCancel={() => setConfirmDelete(false)}
          loading={deleteMutation.isPending}
        />
      )}
    </>
  )
}

function ActionBtn({ children, onClick, title, danger }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      title={title}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: 22, height: 22, border: 'none', borderRadius: 4,
        background: hov ? (danger ? 'var(--danger-subtle)' : 'var(--bg-hover)') : 'transparent',
        color: hov ? (danger ? 'var(--danger)' : 'var(--text-primary)') : 'var(--text-muted)',
        cursor: 'pointer', fontSize: '11px', display: 'flex',
        alignItems: 'center', justifyContent: 'center', transition: 'all 0.12s',
      }}
    >
      {children}
    </button>
  )
}

function ConfirmDialog({ message, onConfirm, onCancel, loading }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1100,
      background: 'rgba(0,0,0,0.65)', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
    }} onClick={onCancel}>
      <div style={{
        background: 'var(--bg-surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', padding: '24px 28px',
        boxShadow: 'var(--shadow-lg)', minWidth: 300,
        animation: 'fadeIn 0.15s ease',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '8px' }}>Confirm Delete</div>
        <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '20px' }}>{message}</div>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={{
            padding: '7px 14px', borderRadius: 6, border: '1px solid var(--border)',
            background: 'var(--bg-raised)', color: 'var(--text-primary)',
            fontSize: '13px', cursor: 'pointer', fontFamily: 'var(--font-body)',
          }}>Cancel</button>
          <button onClick={onConfirm} disabled={loading} style={{
            padding: '7px 14px', borderRadius: 6, border: 'none',
            background: 'var(--danger)', color: '#fff',
            fontSize: '13px', cursor: 'pointer', fontFamily: 'var(--font-body)',
            opacity: loading ? 0.6 : 1,
          }}>Delete</button>
        </div>
      </div>
    </div>
  )
}
