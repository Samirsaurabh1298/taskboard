import React, { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Modal, Input, Select, Button, Avatar } from '../ui/index.jsx'
import { api } from '../../api/index.js'
import { USERS, PRIORITY_CONFIG } from '../../utils/constants.js'

export function TaskForm({ task, columnId, boardId, onClose }) {
  const isEdit = !!task
  const qc = useQueryClient()

  const [form, setForm] = useState({
    title:       task?.title || '',
    description: task?.description || '',
    priority:    task?.priority || 'medium',
    assigneeId:  task?.assigneeId || '',
  })
  const [errors, setErrors] = useState({})

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title = 'Title is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const mutation = useMutation({
    mutationFn: () => isEdit
      ? api.updateTask(task.id, form)
      : api.createTask({ ...form, columnId, boardId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['board', boardId] })
      qc.invalidateQueries({ queryKey: ['activity', boardId] })
      onClose()
    },
  })

  const handleSubmit = () => {
    if (!validate()) return
    mutation.mutate()
  }

  const priorityOptions = Object.entries(PRIORITY_CONFIG).map(([k, v]) => ({ value: k, label: v.label }))
  const assigneeOptions = [
    { value: '', label: 'Unassigned' },
    ...USERS.map(u => ({ value: u.id, label: u.name })),
  ]

  return (
    <Modal title={isEdit ? 'Edit Task' : 'New Task'} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Input
          label="Title"
          placeholder="What needs to be done?"
          value={form.title}
          onChange={e => set('title', e.target.value)}
          error={errors.title}
          autoFocus
        />
        <Input
          label="Description"
          type="textarea"
          placeholder="Add more context..."
          value={form.description}
          onChange={e => set('description', e.target.value)}
        />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <Select
            label="Priority"
            options={priorityOptions}
            value={form.priority}
            onChange={e => set('priority', e.target.value)}
          />
          <Select
            label="Assignee"
            options={assigneeOptions}
            value={form.assigneeId}
            onChange={e => set('assigneeId', e.target.value)}
          />
        </div>

        {mutation.isError && (
          <div style={{ color: 'var(--danger)', fontSize: '12px', padding: '8px 12px', background: 'var(--danger-subtle)', borderRadius: 'var(--radius-sm)' }}>
            {mutation.error?.message || 'Something went wrong'}
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} loading={mutation.isPending}>
            {isEdit ? 'Save Changes' : 'Create Task'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
