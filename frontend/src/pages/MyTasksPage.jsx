import { useDeferredValue, useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import EmptyState from '../components/common/EmptyState'
import PageLoader from '../components/common/PageLoader'
import Panel from '../components/common/Panel'
import TaskFilters from '../components/tasks/TaskFilters'
import TaskTable from '../components/tasks/TaskTable'
import { useAuth } from '../context/AuthContext'
import taskService from '../services/taskService'
import { getErrorMessage } from '../utils/format'

function MyTasksPage() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
  })
  const [filters, setFilters] = useState({
    priority: '',
    search: '',
    status: '',
  })
  const deferredSearch = useDeferredValue(filters.search)

  const loadTasks = async (page = pagination.page) => {
    try {
      const response = await taskService.getTasks({
        assignedTo: user._id,
        limit: 10,
        page,
        priority: filters.priority,
        search: deferredSearch,
        status: filters.status,
      })

      setTasks(response.data.tasks)
      setPagination(response.data.pagination)
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setLoading(true)
    void loadTasks(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deferredSearch, filters.priority, filters.status, user._id])

  const handleFilterChange = (field, value) => {
    setFilters((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleStatusChange = async (taskId, status) => {
    try {
      await taskService.updateTaskStatus(taskId, status)
      await loadTasks(pagination.page)
      toast.success('Task status updated.')
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  if (loading) {
    return <PageLoader label="Loading your tasks..." />
  }

  return (
    <div className="space-y-6">
      <Panel className="p-6 md:p-8">
        <div className="space-y-4">
          <p className="eyebrow">Assigned Work</p>
          <h1 className="font-display text-3xl font-bold text-slate-50 md:text-4xl">Your focused delivery queue</h1>
          <p className="max-w-2xl text-sm leading-7 text-slate-300">
            Filter only the tasks assigned to you, keep statuses current, and use the table as a clear reviewer demo of
            member-level task execution.
          </p>
        </div>
      </Panel>

      <Panel>
        <div className="space-y-5">
          <TaskFilters filters={filters} onChange={handleFilterChange} />

          {tasks.length ? (
            <>
              <TaskTable
                tasks={tasks}
                currentUserId={user._id}
                onStatusChange={handleStatusChange}
                showProjectColumn
              />

              <div className="flex items-center justify-between rounded-3xl border border-white/8 bg-white/5 px-5 py-4">
                <p className="text-sm text-slate-400">
                  Page {pagination.page} of {pagination.totalPages}
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    disabled={pagination.page <= 1}
                    onClick={() => loadTasks(pagination.page - 1)}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => loadTasks(pagination.page + 1)}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          ) : (
            <EmptyState
              title="No assigned tasks right now"
              description="Once tasks are assigned to you, they will appear here with filters and status controls."
            />
          )}
        </div>
      </Panel>
    </div>
  )
}

export default MyTasksPage
