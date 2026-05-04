import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="glass-panel max-w-xl p-10 text-center">
        <p className="eyebrow">404</p>
        <h1 className="mt-3 font-display text-4xl font-bold text-slate-50">This page drifted off the board.</h1>
        <p className="mt-4 text-sm leading-7 text-slate-400">
          The route you requested does not exist anymore, or it was never part of this workspace.
        </p>
        <div className="mt-8">
          <Link
            to="/dashboard"
            className="inline-flex rounded-2xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            Return to dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage
