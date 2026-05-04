import { cn } from '../../utils/cn'
import { formatStatusLabel } from '../../utils/format'

const tones = {
  todo: 'border-white/10 bg-slate-800/70 text-slate-200',
  'in-progress': 'border-cyan-300/20 bg-cyan-500/10 text-cyan-200',
  done: 'border-emerald-300/20 bg-emerald-500/10 text-emerald-200',
}

function StatusBadge({ className, status }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]',
        tones[status] || tones.todo,
        className,
      )}
    >
      {formatStatusLabel(status)}
    </span>
  )
}

export default StatusBadge
