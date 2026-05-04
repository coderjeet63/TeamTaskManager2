import { cn } from '../../utils/cn'

const variants = {
  primary:
    'bg-cyan-400 text-slate-950 hover:bg-cyan-300 shadow-[0_16px_40px_rgba(56,189,248,0.28)]',
  secondary:
    'border border-white/10 bg-white/10 text-slate-100 hover:bg-white/15',
  ghost: 'bg-transparent text-slate-200 hover:bg-white/5',
  danger: 'bg-orange-500 text-slate-950 hover:bg-orange-400',
}

const sizes = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-3 text-sm',
  lg: 'px-5 py-3.5 text-base',
}

function Button({
  children,
  className,
  disabled,
  loading = false,
  size = 'md',
  type = 'button',
  variant = 'primary',
  ...props
}) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center rounded-2xl font-semibold transition focus:outline-none focus:ring-2 focus:ring-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-60',
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? 'Please wait...' : children}
    </button>
  )
}

export default Button
