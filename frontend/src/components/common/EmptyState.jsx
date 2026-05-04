import Panel from './Panel'

function EmptyState({ action, description, title }) {
  return (
    <Panel className="border-dashed border-white/15 text-center">
      <div className="mx-auto max-w-md space-y-3 py-8">
        <p className="eyebrow">Nothing Here Yet</p>
        <h3 className="font-display text-2xl font-semibold text-slate-50">{title}</h3>
        <p className="text-sm leading-6 text-slate-400">{description}</p>
        {action ? <div className="pt-3">{action}</div> : null}
      </div>
    </Panel>
  )
}

export default EmptyState
