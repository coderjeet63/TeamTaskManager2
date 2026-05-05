import Button from '../common/Button'
import InputField from '../common/InputField'
import SelectField from '../common/SelectField'
import { priorityOptions, statusOptions } from '../../constants/taskOptions'

function TaskFilters({
  assignedTo,
  assigneeOptions = [],
  filters,
  onChange,
  onReset,
  showAssignee = false,
}) {
  const activeFilterCount = [
    filters.search.trim(),
    filters.status,
    filters.priority,
    showAssignee ? assignedTo : '',
  ].filter(Boolean).length

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <InputField
          label="Search"
          placeholder="Search by title or description"
          value={filters.search}
          onChange={(event) => onChange('search', event.target.value)}
        />
        <SelectField
          label="Status"
          value={filters.status}
          onChange={(event) => onChange('status', event.target.value)}
          options={statusOptions}
          placeholder="All statuses"
        />
        <SelectField
          label="Priority"
          value={filters.priority}
          onChange={(event) => onChange('priority', event.target.value)}
          options={priorityOptions}
          placeholder="All priorities"
        />
        {showAssignee ? (
          <SelectField
            label="Assignee"
            value={assignedTo}
            onChange={(event) => onChange('assignedTo', event.target.value)}
            options={assigneeOptions}
            placeholder="All members"
          />
        ) : null}
      </div>

      {onReset && activeFilterCount ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
          <p className="text-sm text-slate-300">
            {activeFilterCount} filter{activeFilterCount > 1 ? 's are' : ' is'} active.
          </p>
          <Button variant="ghost" size="sm" onClick={onReset}>
            Clear filters
          </Button>
        </div>
      ) : null}
    </div>
  )
}

export default TaskFilters
