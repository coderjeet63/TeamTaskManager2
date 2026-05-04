import { cn } from '../../utils/cn'
import { formatPriorityLabel } from '../../utils/format'

const tones = {
  low: 'border-white/10 bg-slate-800/70 text-slate-200',
  medium: 'border-amber-300/20 bg-amber-500/10 text-amber-200',
  high: 'border-orange-300/20 bg-orange-500/10 text-orange-200',
}

function PriorityBadge({ className, priority }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]',
        tones[priority] || tones.medium,
        className,
      )}
    >
      {formatPriorityLabel(priority)}
    </span>
  )
}

export default PriorityBadge
