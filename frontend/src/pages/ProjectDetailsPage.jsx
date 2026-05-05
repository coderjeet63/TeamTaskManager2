import { useDeferredValue, useEffect, useState } from 'react'
import { HiOutlineSquares2X2, HiOutlineTableCells } from 'react-icons/hi2'
import toast from 'react-hot-toast'
import { useParams } from 'react-router-dom'

import Button from '../components/common/Button'
import EmptyState from '../components/common/EmptyState'
import PageLoader from '../components/common/PageLoader'
import Panel from '../components/common/Panel'
import MemberManager from '../components/projects/MemberManager'
import ProjectForm from '../components/projects/ProjectForm'
import KanbanBoard from '../components/tasks/KanbanBoard'
import TaskFilters from '../components/tasks/TaskFilters'
import TaskForm from '../components/tasks/TaskForm'
import TaskTable from '../components/tasks/TaskTable'
import { useAuth } from '../context/AuthContext'
import projectService from '../services/projectService'
import taskService from '../services/taskService'
import userService from '../services/userService'
import { formatDate, getErrorMessage } from '../utils/format'

function ProjectDetailsPage() {
  const { projectId } = useParams()
  const { user } = useAuth()
  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [taskLoading, setTaskLoading] = useState(true)
  const [projectLoadError, setProjectLoadError] = useState(null)
  const [filters, setFilters] = useState({
    assignedTo: '',
    priority: '',
    search: '',
    status: '',
  })
  const deferredSearch = useDeferredValue(filters.search)
  const [memberQuery, setMemberQuery] = useState('')
  const deferredMemberQuery = useDeferredValue(memberQuery)
  const [searchResults, setSearchResults] = useState([])
  const [viewMode, setViewMode] = useState('table')
  const [projectEditorOpen, setProjectEditorOpen] = useState(false)
  const [taskEditorOpen, setTaskEditorOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [savingProject, setSavingProject] = useState(false)
  const [savingTask, setSavingTask] = useState(false)
  const [addingMember, setAddingMember] = useState(false)

  const isAdmin = project?.currentUserRole === 'admin'

  const loadProject = async () => {
    const response = await projectService.getProject(projectId)
    setProject(response.data.project)
    setProjectLoadError(null)
  }

  const loadTasks = async () => {
    setTaskLoading(true)

    try {
      const response = await taskService.getTasks({
        assignedTo: filters.assignedTo,
        limit: 50,
        priority: filters.priority,
        projectId,
        search: deferredSearch,
        status: filters.status,
      })
      setTasks(response.data.tasks)
    } finally {
      setTaskLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true

    const bootstrap = async () => {
      try {
        const projectResponse = await projectService.getProject(projectId)

        if (isMounted) {
          setProject(projectResponse.data.project)
          setProjectLoadError(null)
        }
      } catch (error) {
        if (isMounted) {
          const status = error?.response?.status

          setProject(null)
          setProjectLoadError(
            status === 403
              ? {
                  title: 'Access denied',
                  description: 'You do not have permission to access this project workspace.',
                }
              : status === 404
                ? {
                    title: 'Project not found',
                    description: 'The requested project could not be loaded or it no longer exists.',
                  }
                : {
                    title: 'Unable to load project',
                    description: 'There was a problem loading this workspace. Please try again.',
                  },
          )
        }

        toast.error(getErrorMessage(error))
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    void bootstrap()

    return () => {
      isMounted = false
    }
  }, [projectId])

  useEffect(() => {
    if (!project) {
      return
    }

    void loadTasks().catch((error) => {
      toast.error(getErrorMessage(error))
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deferredSearch, filters.priority, filters.status, filters.assignedTo, projectId])

  useEffect(() => {
    if (!isAdmin || !deferredMemberQuery.trim()) {
      setSearchResults([])
      return
    }

    let isMounted = true

    const searchMembers = async () => {
      try {
        const response = await userService.searchUsers(deferredMemberQuery)

        if (isMounted) {
          setSearchResults(response.data.users.filter((item) => item.email !== user.email))
        }
      } catch {
        if (isMounted) {
          setSearchResults([])
        }
      }
    }

    void searchMembers()

    return () => {
      isMounted = false
    }
  }, [deferredMemberQuery, isAdmin, user.email])

  const handleFilterChange = (field, value) => {
    setFilters((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleProjectUpdate = async (values) => {
    setSavingProject(true)

    try {
      await projectService.updateProject(projectId, values)
      toast.success('Project updated.')
      await loadProject()
      setProjectEditorOpen(false)
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setSavingProject(false)
    }
  }

  const handleTaskSubmit = async (values) => {
    setSavingTask(true)

    try {
      if (editingTask) {
        await taskService.updateTask(editingTask._id, values)
        toast.success('Task updated.')
      } else {
        await taskService.createTask({
          ...values,
          project: projectId,
        })
        toast.success('Task created.')
      }

      setEditingTask(null)
      setTaskEditorOpen(false)
      await Promise.all([loadProject(), loadTasks()])
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setSavingTask(false)
    }
  }

  const handleDeleteTask = async (task) => {
    const confirmed = window.confirm(`Delete "${task.title}"?`)

    if (!confirmed) {
      return
    }

    try {
      await taskService.deleteTask(task._id)
      toast.success('Task deleted.')
      await Promise.all([loadProject(), loadTasks()])
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  const handleStatusChange = async (taskId, status) => {
    try {
      await taskService.updateTaskStatus(taskId, status)
      await Promise.all([loadProject(), loadTasks()])
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  const handleAddMember = async () => {
    if (!memberQuery.trim()) {
      toast.error('Enter a member email address first.')
      return
    }

    setAddingMember(true)

    try {
      await projectService.addMember(projectId, { email: memberQuery.trim() })
      toast.success('Member added successfully.')
      setMemberQuery('')
      setSearchResults([])
      await loadProject()
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setAddingMember(false)
    }
  }

  const handleRemoveMember = async (member) => {
    const confirmed = window.confirm(`Remove ${member.name} from this project?`)

    if (!confirmed) {
      return
    }

    try {
      await projectService.removeMember(projectId, member._id)
      toast.success('Member removed.')
      await Promise.all([loadProject(), loadTasks()])
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  if (loading) {
    return <PageLoader label="Loading project workspace..." />
  }

  if (!project) {
    return (
      <EmptyState
        title={projectLoadError?.title || 'Project not found'}
        description={
          projectLoadError?.description ||
          'The requested project could not be loaded or you may not have permission to access it.'
        }
      />
    )
  }

  return (
    <div className="space-y-6">
      <Panel className="p-6 md:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl space-y-4">
            <p className="eyebrow">{isAdmin ? 'Admin Workspace' : 'Member Workspace'}</p>
            <h1 className="font-display text-3xl font-bold text-slate-50 md:text-4xl">{project.title}</h1>
            <p className="text-sm leading-7 text-slate-300">
              {project.description || 'No project description added yet. Use the editor to outline the scope and goals.'}
            </p>
            <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.2em] text-slate-500">
              <span>{project.memberCount} members</span>
              <span>{project.taskStats?.total ?? 0} tasks</span>
              <span>Updated {formatDate(project.updatedAt, 'MMM d')}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {isAdmin ? (
              <>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setProjectEditorOpen((current) => !current)
                  }}
                >
                  {projectEditorOpen ? 'Hide project editor' : 'Edit project'}
                </Button>
                <Button
                  onClick={() => {
                    setEditingTask(null)
                    setTaskEditorOpen((current) => !current)
                  }}
                >
                  {taskEditorOpen ? 'Hide task form' : 'Create task'}
                </Button>
              </>
            ) : null}
          </div>
        </div>
      </Panel>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          {projectEditorOpen && isAdmin ? (
            <Panel>
              <ProjectForm
                mode="edit"
                initialValues={project}
                submitting={savingProject}
                onSubmit={handleProjectUpdate}
                onCancel={() => setProjectEditorOpen(false)}
              />
            </Panel>
          ) : null}

          {taskEditorOpen && isAdmin ? (
            <Panel>
              <TaskForm
                mode={editingTask ? 'edit' : 'create'}
                initialValues={editingTask}
                members={project.members}
                submitting={savingTask}
                onSubmit={handleTaskSubmit}
                onCancel={() => {
                  setEditingTask(null)
                  setTaskEditorOpen(false)
                }}
              />
            </Panel>
          ) : null}

          <Panel>
            <div className="space-y-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                <div>
                  <p className="eyebrow">Task Views</p>
                  <h2 className="font-display text-2xl font-semibold text-slate-50">Execution board</h2>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant={viewMode === 'table' ? 'primary' : 'secondary'}
                    className="gap-2"
                    onClick={() => setViewMode('table')}
                  >
                    <HiOutlineTableCells />
                    Table
                  </Button>
                  <Button
                    variant={viewMode === 'board' ? 'primary' : 'secondary'}
                    className="gap-2"
                    onClick={() => setViewMode('board')}
                  >
                    <HiOutlineSquares2X2 />
                    Board
                  </Button>
                </div>
              </div>

              <TaskFilters
                filters={filters}
                assignedTo={filters.assignedTo}
                assigneeOptions={project.members.map((member) => ({
                  label: member.user.name,
                  value: member.user._id,
                }))}
                onChange={handleFilterChange}
                showAssignee={isAdmin}
              />

              {taskLoading ? (
                <PageLoader label="Refreshing tasks..." />
              ) : viewMode === 'board' ? (
                <KanbanBoard tasks={tasks} onStatusChange={handleStatusChange} />
              ) : (
                <TaskTable
                  tasks={tasks}
                  currentUserId={user._id}
                  isAdmin={isAdmin}
                  onDelete={handleDeleteTask}
                  onEdit={(task) => {
                    setEditingTask(task)
                    setTaskEditorOpen(true)
                  }}
                  onStatusChange={handleStatusChange}
                />
              )}
            </div>
          </Panel>
        </div>

        <div className="space-y-6">
          <MemberManager
            addingMember={addingMember}
            canManage={isAdmin}
            creatorId={project.createdBy?._id || project.createdBy}
            memberQuery={memberQuery}
            members={project.members}
            onAddMember={handleAddMember}
            onMemberQueryChange={setMemberQuery}
            onRemoveMember={handleRemoveMember}
            searchResults={searchResults}
          />

          <Panel>
            <div className="space-y-4">
              <p className="eyebrow">Project Signals</p>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { label: 'To Do', value: project.taskStats?.todo ?? 0 },
                  { label: 'In Progress', value: project.taskStats?.['in-progress'] ?? 0 },
                  { label: 'Completed', value: project.taskStats?.done ?? 0 },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/8 bg-white/5 p-4 text-center">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{item.label}</p>
                    <p className="mt-3 font-display text-3xl font-semibold text-slate-50">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}

export default ProjectDetailsPage
