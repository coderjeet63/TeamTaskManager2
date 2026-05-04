import InputField from '../common/InputField'
import SelectField from '../common/SelectField'
import { priorityOptions, statusOptions } from '../../constants/taskOptions'

function TaskFilters({
  assignedTo,
  assigneeOptions = [],
  filters,
  onChange,
  showAssignee = false,
}) {
  return (
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
  )
}

export default TaskFilters
