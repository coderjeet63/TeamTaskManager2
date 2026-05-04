import { cn } from '../../utils/cn'

function Panel({ children, className }) {
  return <section className={cn('glass-panel p-5 md:p-6', className)}>{children}</section>
}

export default Panel
