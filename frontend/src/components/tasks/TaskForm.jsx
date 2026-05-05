import { useEffect, useState } from 'react'

import { priorityOptions, statusOptions } from '../../constants/taskOptions'
import Button from '../common/Button'
import InputField from '../common/InputField'
import SelectField from '../common/SelectField'
import TextareaField from '../common/TextareaField'

const emptyValues = {
  assignedTo: '',
  description: '',
  dueDate: '',
  priority: 'medium',
  status: 'todo',
  title: '',
}

const toDateInput = (value) => {
  if (!value) {
    return ''
  }

  return new Date(value).toISOString().slice(0, 10)
}

function TaskForm({
  initialValues,
  members = [],
  mode = 'create',
  onCancel,
  onSubmit,
  submitting = false,
}) {
  const [formData, setFormData] = useState(emptyValues)

  useEffect(() => {
    setFormData({
      assignedTo: initialValues?.assignedTo?._id || initialValues?.assignedTo || '',
      description: initialValues?.description || '',
      dueDate: toDateInput(initialValues?.dueDate),
      priority: initialValues?.priority || 'medium',
      status: initialValues?.status || 'todo',
      title: initialValues?.title || '',
    })
  }, [initialValues])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    await onSubmit(formData)

    if (mode === 'create') {
      setFormData(emptyValues)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <p className="eyebrow">{mode === 'create' ? 'New Task' : 'Edit Task'}</p>
        <h3 className="font-display text-2xl font-semibold text-slate-50">
          {mode === 'create' ? 'Plan a new task' : 'Refine task details'}
        </h3>
        <p className="text-sm text-slate-400">
          Admins can manage title, assignee, due date, priority, status, and description from this form.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <InputField
          label="Task title"
          name="title"
          placeholder="Design review deck"
          value={formData.title}
          onChange={handleChange}
          required
        />
        <SelectField
          label="Assign to"
          name="assignedTo"
          value={formData.assignedTo}
          onChange={handleChange}
          options={members.map((member) => ({
            label: `${member.user.name} (${member.role})`,
            value: member.user._id,
          }))}
          placeholder="Select teammate"
          required
        />
      </div>

      <div className="rounded-2xl border border-white/8 bg-white/5 px-4 py-4">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Scheduling</p>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Set the due date and priority here before saving so the task appears correctly in dashboards and overdue
          tracking.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <InputField
          label="Due date"
          name="dueDate"
          type="date"
          value={formData.dueDate}
          onChange={handleChange}
          required
        />
        <SelectField
          label="Priority"
          name="priority"
          value={formData.priority}
          onChange={handleChange}
          options={priorityOptions}
        />
        <SelectField
          label="Status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          options={statusOptions}
        />
      </div>

      <TextareaField
        label="Description"
        name="description"
        placeholder="Capture task context, dependencies, or reviewer notes."
        value={formData.description}
        onChange={handleChange}
      />

      <div className="flex flex-wrap gap-3">
        <Button type="submit" loading={submitting}>
          {mode === 'create' ? 'Create task' : 'Save task'}
        </Button>
        {onCancel ? (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  )
}

export default TaskForm
