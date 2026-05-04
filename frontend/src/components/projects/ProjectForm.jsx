import { useEffect, useState } from 'react'

import Button from '../common/Button'
import InputField from '../common/InputField'
import TextareaField from '../common/TextareaField'

const emptyValues = {
  title: '',
  description: '',
}

function ProjectForm({
  initialValues,
  mode = 'create',
  onCancel,
  onSubmit,
  submitting = false,
}) {
  const [formData, setFormData] = useState(emptyValues)

  useEffect(() => {
    setFormData({
      description: initialValues?.description || '',
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
        <p className="eyebrow">{mode === 'create' ? 'New Project' : 'Edit Project'}</p>
        <h3 className="font-display text-2xl font-semibold text-slate-50">
          {mode === 'create' ? 'Create a project space' : 'Update project details'}
        </h3>
        <p className="text-sm text-slate-400">
          {mode === 'create'
            ? 'Every new project automatically makes you the admin for that workspace.'
            : 'Keep the project context current so teammates know what they are delivering.'}
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <InputField
          label="Project title"
          name="title"
          placeholder="Marketing launch sprint"
          value={formData.title}
          onChange={handleChange}
          required
        />
        <div className="rounded-2xl border border-white/8 bg-white/5 px-4 py-4">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Workspace tip</p>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Clear titles and short context blurbs make dashboards easier to scan during interviews and demos.
          </p>
        </div>
      </div>

      <TextareaField
        label="Description"
        name="description"
        placeholder="Outline the project goal, timeline, or delivery expectations."
        value={formData.description}
        onChange={handleChange}
      />

      <div className="flex flex-wrap gap-3">
        <Button type="submit" loading={submitting}>
          {mode === 'create' ? 'Create project' : 'Save changes'}
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

export default ProjectForm
