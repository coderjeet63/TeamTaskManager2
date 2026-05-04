import { format } from 'date-fns'
import { HiOutlineArrowRightOnRectangle } from 'react-icons/hi2'
import toast from 'react-hot-toast'
import { useLocation } from 'react-router-dom'

import Button from '../common/Button'
import { useAuth } from '../../context/AuthContext'
import { getInitials } from '../../utils/format'

const titles = {
  '/dashboard': 'Operations Dashboard',
  '/projects': 'Projects Workspace',
  '/my-tasks': 'My Active Queue',
}

function Topbar() {
  const { pathname } = useLocation()
  const { logout, user } = useAuth()

  const handleLogout = async () => {
    await logout()
    toast.success('You have been logged out.')
  }

  return (
    <header className="sticky top-0 z-20 border-b border-white/8 bg-slate-950/40 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Live Workspace</p>
          <h2 className="font-display text-2xl font-semibold text-slate-50">
            {titles[pathname] || 'Project Workspace'}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-right sm:block">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{format(new Date(), 'EEE, MMM d')}</p>
            <p className="text-sm text-slate-300">Focused execution mode</p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/5 px-3 py-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/10 font-display text-sm font-semibold text-cyan-100">
              {getInitials(user?.name)}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-slate-100">{user?.name}</p>
              <p className="text-xs text-slate-400">{user?.email}</p>
            </div>
          </div>

          <Button variant="secondary" size="sm" onClick={handleLogout} className="gap-2">
            <HiOutlineArrowRightOnRectangle />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  )
}

export default Topbar
