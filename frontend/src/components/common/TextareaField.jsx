import { cn } from '../../utils/cn'

function TextareaField({ className, error, label, rows = 4, ...props }) {
  return (
    <label className="block space-y-2">
      {label ? <span className="text-sm font-medium text-slate-300">{label}</span> : null}
      <textarea
        rows={rows}
        className={cn('field-base resize-none', error && 'border-orange-400/60', className)}
        {...props}
      />
      {error ? <p className="text-xs text-orange-300">{error}</p> : null}
    </label>
  )
}

export default TextareaField
