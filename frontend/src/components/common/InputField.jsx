import { cn } from '../../utils/cn'

function InputField({ className, error, label, ...props }) {
  return (
    <label className="block space-y-2">
      {label ? <span className="text-sm font-medium text-slate-300">{label}</span> : null}
      <input className={cn('field-base', error && 'border-orange-400/60', className)} {...props} />
      {error ? <p className="text-xs text-orange-300">{error}</p> : null}
    </label>
  )
}

export default InputField
