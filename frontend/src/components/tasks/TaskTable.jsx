import { HiOutlinePencilSquare, HiOutlineTrash } from 'react-icons/hi2'

import { statusOptions } from '../../constants/taskOptions'
import Button from '../common/Button'
import Panel from '../common/Panel'
import PriorityBadge from '../common/PriorityBadge'
import StatusBadge from '../common/StatusBadge'
import { formatDate, formatDueLabel } from '../../utils/format'

function TaskTable({
  currentUserId,
  isAdmin = false,
  onDelete,
  onEdit,
  onStatusChange,
  showProjectColumn = false,
  tasks = [],
}) {
  if (!tasks.length) {
    return (
      <Panel>
        <div className="py-8 text-center text-sm text-slate-400">
          No tasks match the current filter set.
        </div>
      </Panel>
    )
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-white/8 bg-slate-950/35">
      <div className="overflow-x-auto soft-scrollbar">
        <table className="min-w-full text-left">
          <thead className="border-b border-white/8 bg-white/5">
            <tr className="text-xs uppercase tracking-[0.2em] text-slate-500">
              <th className="px-5 py-4 font-medium">Task</th>
              {showProjectColumn ? <th className="px-5 py-4 font-medium">Project</th> : null}
              <th className="px-5 py-4 font-medium">Assignee</th>
              <th className="px-5 py-4 font-medium">Priority</th>
              <th className="px-5 py-4 font-medium">Due</th>
              <th className="px-5 py-4 font-medium">Status</th>
              <th className="px-5 py-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => {
              const canChangeStatus = isAdmin || task.assignedTo?._id === currentUserId

              return (
                <tr key={task._id} className="border-b border-white/6 last:border-b-0">
                  <td className="px-5 py-4 align-top">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-slate-100">{task.title}</p>
                      <p className="max-w-md text-sm text-slate-400">
                        {task.description || 'No extra details added.'}
                      </p>
                    </div>
                  </td>
                  {showProjectColumn ? (
                    <td className="px-5 py-4 align-top text-sm text-slate-300">{task.project?.title}</td>
                  ) : null}
                  <td className="px-5 py-4 align-top text-sm text-slate-300">{task.assignedTo?.name}</td>
                  <td className="px-5 py-4 align-top">
                    <PriorityBadge priority={task.priority} />
                  </td>
                  <td className="px-5 py-4 align-top">
                    <div className="space-y-1 text-sm">
                      <p className="text-slate-100">{formatDate(task.dueDate)}</p>
                      <p className="text-slate-500">{formatDueLabel(task.dueDate)}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4 align-top">
                    {canChangeStatus && onStatusChange ? (
                      <select
                        value={task.status}
                        onChange={(event) => onStatusChange(task._id, event.target.value)}
                        className="rounded-2xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-400/60"
                      >
                        {statusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <StatusBadge status={task.status} />
                    )}
                  </td>
                  <td className="px-5 py-4 align-top">
                    {isAdmin ? (
                      <div className="flex flex-wrap gap-2">
                        <Button variant="secondary" size="sm" className="gap-2" onClick={() => onEdit(task)}>
                          <HiOutlinePencilSquare />
                          Edit
                        </Button>
                        <Button variant="danger" size="sm" className="gap-2" onClick={() => onDelete(task)}>
                          <HiOutlineTrash />
                          Delete
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs uppercase tracking-[0.2em] text-slate-500">Status only</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default TaskTable
