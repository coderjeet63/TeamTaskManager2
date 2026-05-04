function PageLoader({ fullScreen = false, label = 'Loading...' }) {
  return (
    <div
      className={
        fullScreen
          ? 'flex min-h-screen items-center justify-center px-6'
          : 'flex min-h-[260px] items-center justify-center'
      }
    >
      <div className="glass-panel flex items-center gap-4 px-6 py-4 text-sm text-slate-300">
        <span className="h-3 w-3 animate-pulse rounded-full bg-cyan-300" />
        <span>{label}</span>
      </div>
    </div>
  )
}

export default PageLoader
