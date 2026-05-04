import { useDeferredValue, useEffect, useState } from 'react'
import { HiOutlineMagnifyingGlass, HiOutlinePlus } from 'react-icons/hi2'
import toast from 'react-hot-toast'

import Button from '../components/common/Button'
import EmptyState from '../components/common/EmptyState'
import InputField from '../components/common/InputField'
import PageLoader from '../components/common/PageLoader'
import Panel from '../components/common/Panel'
import ProjectForm from '../components/projects/ProjectForm'
import ProjectGrid from '../components/projects/ProjectGrid'
import projectService from '../services/projectService'
import { getErrorMessage } from '../utils/format'

function ProjectsPage() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
  })
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)
  const [formMode, setFormMode] = useState('create')
  const [activeProject, setActiveProject] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [formVisible, setFormVisible] = useState(false)

  const loadProjects = async (page = pagination.page) => {
    try {
      const response = await projectService.getProjects({
        limit: 9,
        page,
        search: deferredSearch,
      })

      setProjects(response.data.projects)
      setPagination(response.data.pagination)
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setLoading(true)
    void loadProjects(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deferredSearch])

  const handleSubmit = async (values) => {
    setSubmitting(true)

    try {
      if (formMode === 'create') {
        await projectService.createProject(values)
        toast.success('Project created successfully.')
      } else if (activeProject) {
        await projectService.updateProject(activeProject._id, values)
        toast.success('Project updated successfully.')
      }

      setActiveProject(null)
      setFormMode('create')
      setFormVisible(false)
      await loadProjects(formMode === 'create' ? 1 : pagination.page)
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (project) => {
    const confirmed = window.confirm(`Delete "${project.title}"? This will remove its tasks too.`)

    if (!confirmed) {
      return
    }

    try {
      await projectService.deleteProject(project._id)
      toast.success('Project deleted successfully.')
      await loadProjects(pagination.page)
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  const handleEdit = (project) => {
    setFormMode('edit')
    setActiveProject(project)
    setFormVisible(true)
  }

  const openCreateForm = () => {
    setFormMode('create')
    setActiveProject(null)
    setFormVisible((current) => !current)
  }

  if (loading) {
    return <PageLoader label="Loading project workspaces..." />
  }

  return (
    <div className="space-y-6">
      <Panel className="p-6 md:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-2xl space-y-4">
            <p className="eyebrow">Projects</p>
            <h1 className="font-display text-3xl font-bold text-slate-50 md:text-4xl">
              Build a project layer that feels ready for real teammates.
            </h1>
            <p className="text-sm leading-7 text-slate-300">
              Create delivery spaces, manage membership, and keep task execution grouped by mission instead of a flat
              list.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="min-w-[260px]">
              <InputField
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search projects"
                className="pl-12"
              />
              <HiOutlineMagnifyingGlass className="pointer-events-none relative -top-11 left-4 text-slate-500" />
            </div>
            <Button className="gap-2" onClick={openCreateForm}>
              <HiOutlinePlus />
              {formVisible && formMode === 'create' ? 'Hide form' : 'New project'}
            </Button>
          </div>
        </div>
      </Panel>

      {formVisible ? (
        <Panel>
          <ProjectForm
            mode={formMode}
            initialValues={activeProject}
            submitting={submitting}
            onSubmit={handleSubmit}
            onCancel={() => {
              setFormVisible(false)
              setActiveProject(null)
              setFormMode('create')
            }}
          />
        </Panel>
      ) : null}

      {projects.length ? (
        <>
          <ProjectGrid projects={projects} onDelete={handleDelete} onEdit={handleEdit} />

          <div className="flex items-center justify-between rounded-3xl border border-white/8 bg-white/5 px-5 py-4">
            <p className="text-sm text-slate-400">
              Page {pagination.page} of {pagination.totalPages}
            </p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                disabled={pagination.page <= 1}
                onClick={() => loadProjects(pagination.page - 1)}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => loadProjects(pagination.page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      ) : (
        <EmptyState
          title="No projects match this search"
          description="Try a broader search term or create a fresh project workspace to get started."
          action={
            <Button onClick={openCreateForm}>
              {formVisible ? 'Form ready above' : 'Create your first project'}
            </Button>
          }
        />
      )}
    </div>
  )
}

export default ProjectsPage
