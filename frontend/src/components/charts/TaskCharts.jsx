import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import EmptyState from '../common/EmptyState'
import Panel from '../common/Panel'
import { formatStatusLabel } from '../../utils/format'

const palette = ['#38bdf8', '#67e8f9', '#10b981', '#f59e0b', '#f97316']

function TaskCharts({ charts }) {
  const statusData =
    charts?.statusBreakdown?.map((item) => ({
      ...item,
      label: formatStatusLabel(item._id),
    })) || []
  const trendData = charts?.completionTrend || []
  const workloadData = charts?.tasksPerUser || []

  if (!statusData.length && !trendData.length && !workloadData.length) {
    return (
      <EmptyState
        title="Analytics will show up here"
        description="Create a few tasks and complete work across your projects to unlock dashboard trends."
      />
    )
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
      <Panel>
        <div className="mb-5">
          <p className="eyebrow">Throughput</p>
          <h3 className="font-display text-xl font-semibold text-slate-50">Completed work over the last 7 days</h3>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
              <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 12 }} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  background: '#081423',
                  border: '1px solid rgba(148,163,184,0.18)',
                  borderRadius: '16px',
                }}
              />
              <Line type="monotone" dataKey="completed" stroke="#38bdf8" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <div className="grid gap-6">
        <Panel>
          <div className="mb-5">
            <p className="eyebrow">Status Balance</p>
            <h3 className="font-display text-xl font-semibold text-slate-50">Tasks by current status</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
                <XAxis dataKey="label" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: '#081423',
                    border: '1px solid rgba(148,163,184,0.18)',
                    borderRadius: '16px',
                  }}
                />
                <Bar dataKey="value" radius={[12, 12, 0, 0]}>
                  {statusData.map((entry, index) => (
                    <Cell key={`${entry.label}-${entry.value}`} fill={palette[index % palette.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel>
          <div className="mb-5">
            <p className="eyebrow">Workload Spread</p>
            <h3 className="font-display text-xl font-semibold text-slate-50">Tasks per teammate</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={workloadData} dataKey="value" nameKey="label" innerRadius={58} outerRadius={90}>
                  {workloadData.map((entry, index) => (
                    <Cell key={`${entry.label}-${entry.value}`} fill={palette[index % palette.length]} />
                  ))}
                </Pie>
                <Legend verticalAlign="bottom" iconType="circle" />
                <Tooltip
                  contentStyle={{
                    background: '#081423',
                    border: '1px solid rgba(148,163,184,0.18)',
                    borderRadius: '16px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>
    </div>
  )
}

export default TaskCharts
