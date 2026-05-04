import { cn } from '../../utils/cn'

function SelectField({ className, error, label, options = [], placeholder, ...props }) {
  return (
    <label className="block space-y-2">
      {label ? <span className="text-sm font-medium text-slate-300">{label}</span> : null}
      <select className={cn('field-base', error && 'border-orange-400/60', className)} {...props}>
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? <p className="text-xs text-orange-300">{error}</p> : null}
    </label>
  )
}

export default SelectField
