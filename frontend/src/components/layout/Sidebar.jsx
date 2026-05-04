import {
  HiOutlineBriefcase,
  HiOutlineChartBarSquare,
  HiOutlineClipboardDocumentList,
} from 'react-icons/hi2'
import { NavLink } from 'react-router-dom'

import { navigationLinks } from '../../constants/navigation'
import { cn } from '../../utils/cn'

const icons = {
  dashboard: HiOutlineChartBarSquare,
  projects: HiOutlineBriefcase,
  'my-tasks': HiOutlineClipboardDocumentList,
}

function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-80 shrink-0 border-r border-white/8 bg-slate-950/45 px-6 py-8 backdrop-blur-xl lg:block">
      <div className="glass-panel flex h-full flex-col justify-between bg-slate-950/30 p-6">
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="inline-flex rounded-2xl border border-cyan-300/25 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-cyan-200">
              PulseBoard
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-slate-50">Team Mission Control</h1>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Track delivery, assign work, and keep every project moving with clarity.
              </p>
            </div>
          </div>

          <nav className="space-y-2">
            {navigationLinks.map((link) => {
              const Icon = icons[link.key]

              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition',
                      isActive
                        ? 'bg-cyan-400/12 text-cyan-100 shadow-glow'
                        : 'text-slate-400 hover:bg-white/5 hover:text-slate-100',
                    )
                  }
                >
                  <Icon className="text-lg" />
                  <span>{link.label}</span>
                </NavLink>
              )
            })}
          </nav>
        </div>

        <div className="rounded-3xl border border-white/8 bg-white/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Assignment Ready</p>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Built for multi-user planning, task ownership, analytics, and a polished reviewer-friendly flow.
          </p>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
