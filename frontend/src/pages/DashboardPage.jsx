import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import {
  HiOutlineArrowTrendingUp,
  HiOutlineClipboardDocumentList,
  HiOutlineExclamationTriangle,
  HiOutlineFolderOpen,
} from 'react-icons/hi2'
import toast from 'react-hot-toast'

import TaskCharts from '../components/charts/TaskCharts'
import EmptyState from '../components/common/EmptyState'
import PageLoader from '../components/common/PageLoader'
import Panel from '../components/common/Panel'
import { useAuth } from '../context/AuthContext'
import dashboardService from '../services/dashboardService'
import { formatDate, formatDueLabel, getErrorMessage } from '../utils/format'

const statCards = [
  { key: 'projects', label: 'Projects', icon: HiOutlineFolderOpen },
  { key: 'totalTasks', label: 'Total Tasks', icon: HiOutlineClipboardDocumentList },
  { key: 'overdueTasks', label: 'Overdue Tasks', icon: HiOutlineExclamationTriangle },
  { key: 'completionRate', label: 'Completion Rate', icon: HiOutlineArrowTrendingUp, suffix: '%' },
]

function DashboardPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [overview, setOverview] = useState(null)

  useEffect(() => {
    let isMounted = true

    const loadOverview = async () => {
      try {
        const response = await dashboardService.getOverview()

        if (isMounted) {
          setOverview(response.data)
        }
      } catch (error) {
        toast.error(getErrorMessage(error))
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    void loadOverview()

    return () => {
      isMounted = false
    }
  }, [])

  if (loading) {
    return <PageLoader label="Loading your analytics..." />
  }

  return (
    <div className="space-y-6">
      <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6 md:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-4">
            <p className="eyebrow">Overview</p>
            <h1 className="font-display text-3xl font-bold leading-tight text-slate-50 md:text-4xl">
              Welcome back, {user?.name?.split(' ')[0]}. Your team pulse is steady.
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-slate-300">
              Watch delivery trends, catch overdue work before it slips, and keep every project visible from one
              focused command center.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {statCards.map((card) => {
              const Icon = card.icon
              const value = overview?.totals?.[card.key] ?? 0

              return (
                <div key={card.key} className="rounded-3xl border border-white/8 bg-white/5 p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">{card.label}</span>
                    <Icon className="text-xl text-cyan-200" />
                  </div>
                  <p className="mt-6 font-display text-4xl font-bold text-slate-50">
                    {value}
                    {card.suffix || ''}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </motion.section>

      {overview ? <TaskCharts charts={overview.charts} /> : null}

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Panel>
          <div className="mb-5">
            <p className="eyebrow">Recent Activity</p>
            <h2 className="font-display text-xl font-semibold text-slate-50">Latest project movements</h2>
          </div>

          {overview?.recentActivity?.length ? (
            <div className="space-y-4">
              {overview.recentActivity.map((activity) => (
                <div key={activity._id} className="rounded-2xl border border-white/8 bg-white/5 px-4 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-100">{activity.message}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">
                        {activity.project?.title || 'Project'}
                        {activity.task?.title ? ` • ${activity.task.title}` : ''}
                      </p>
                    </div>
                    <span className="text-xs text-slate-500">{formatDate(activity.createdAt, 'MMM d')}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No activity yet"
              description="Project and task activity will appear here once your team starts collaborating."
            />
          )}
        </Panel>

        <Panel>
          <div className="mb-5">
            <p className="eyebrow">Attention Queue</p>
            <h2 className="font-display text-xl font-semibold text-slate-50">Overdue tasks snapshot</h2>
          </div>

          {overview?.overdueSnapshot?.length ? (
            <div className="space-y-4">
              {overview.overdueSnapshot.map((task) => (
                <div key={task._id} className="rounded-2xl border border-orange-300/10 bg-orange-500/5 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-100">{task.title}</p>
                      <p className="mt-1 text-sm text-slate-400">
                        {task.project?.title} • {task.assignedTo?.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-[0.2em] text-orange-200/70">{formatDate(task.dueDate)}</p>
                      <p className="mt-1 text-sm text-orange-200">{formatDueLabel(task.dueDate)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No overdue work"
              description="Nice. Your accessible projects do not have any tasks past their due dates right now."
            />
          )}
        </Panel>
      </div>
    </div>
  )
}

export default DashboardPage
