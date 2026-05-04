import { HiOutlineArrowRight, HiOutlinePencilSquare, HiOutlineTrash } from 'react-icons/hi2'
import { Link } from 'react-router-dom'

import Button from '../common/Button'
import Panel from '../common/Panel'
import { formatDate } from '../../utils/format'

function ProjectGrid({ projects, onDelete, onEdit }) {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {projects.map((project) => (
        <Panel key={project._id} className="flex h-full flex-col justify-between">
          <div className="space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="eyebrow">{project.currentUserRole === 'admin' ? 'Admin Access' : 'Member Access'}</p>
                <h3 className="mt-2 font-display text-2xl font-semibold text-slate-50">{project.title}</h3>
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-400">
                {project.memberCount} Members
              </span>
            </div>

            <p className="min-h-[72px] text-sm leading-7 text-slate-400">
              {project.description || 'No description added yet. Use this space to capture the mission and scope.'}
            </p>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'To Do', value: project.taskStats?.todo ?? 0 },
                { label: 'In Progress', value: project.taskStats?.['in-progress'] ?? 0 },
                { label: 'Done', value: project.taskStats?.done ?? 0 },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/8 bg-white/5 p-3 text-center">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{item.label}</p>
                  <p className="mt-3 font-display text-2xl font-semibold text-slate-50">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate-500">
              <span>Updated {formatDate(project.updatedAt, 'MMM d')}</span>
              <span>{project.taskStats?.total ?? 0} Tasks</span>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to={`/projects/${project._id}`}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                Open
                <HiOutlineArrowRight />
              </Link>

              {project.currentUserRole === 'admin' ? (
                <>
                  <Button variant="secondary" onClick={() => onEdit(project)} className="gap-2">
                    <HiOutlinePencilSquare />
                    Edit
                  </Button>
                  <Button variant="danger" onClick={() => onDelete(project)} className="gap-2">
                    <HiOutlineTrash />
                    Delete
                  </Button>
                </>
              ) : null}
            </div>
          </div>
        </Panel>
      ))}
    </div>
  )
}

export default ProjectGrid
