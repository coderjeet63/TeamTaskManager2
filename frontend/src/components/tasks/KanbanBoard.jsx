import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd'

import { statusOptions } from '../../constants/taskOptions'
import PriorityBadge from '../common/PriorityBadge'
import StatusBadge from '../common/StatusBadge'
import { formatDate } from '../../utils/format'

function KanbanBoard({ tasks = [], onStatusChange }) {
  const groupedTasks = statusOptions.reduce((accumulator, status) => {
    accumulator[status.value] = tasks.filter((task) => task.status === status.value)
    return accumulator
  }, {})

  const handleDragEnd = (result) => {
    if (!result.destination) {
      return
    }

    const { draggableId, destination, source } = result

    if (destination.droppableId === source.droppableId) {
      return
    }

    onStatusChange(draggableId, destination.droppableId)
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid gap-4 lg:grid-cols-3">
        {statusOptions.map((column) => (
          <Droppable key={column.value} droppableId={column.value}>
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="rounded-3xl border border-white/8 bg-slate-950/40 p-4"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="eyebrow">{column.label}</p>
                    <h3 className="font-display text-xl font-semibold text-slate-50">
                      {groupedTasks[column.value]?.length || 0} cards
                    </h3>
                  </div>
                  <StatusBadge status={column.value} />
                </div>

                <div className="space-y-3">
                  {groupedTasks[column.value]?.map((task, index) => (
                    <Draggable key={task._id} draggableId={task._id} index={index}>
                      {(dragProvided, snapshot) => (
                        <article
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          {...dragProvided.dragHandleProps}
                          className={`rounded-3xl border border-white/8 bg-white/5 p-4 transition ${
                            snapshot.isDragging ? 'rotate-[1deg] border-cyan-300/30 shadow-glow' : ''
                          }`}
                        >
                          <div className="space-y-3">
                            <div>
                              <p className="text-sm font-semibold text-slate-100">{task.title}</p>
                              <p className="mt-2 text-sm leading-6 text-slate-400">
                                {task.description || 'No task description yet.'}
                              </p>
                            </div>
                            <div className="flex items-center justify-between">
                              <PriorityBadge priority={task.priority} />
                              <span className="text-xs uppercase tracking-[0.2em] text-slate-500">
                                {task.assignedTo?.name}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500">Due {formatDate(task.dueDate)}</p>
                          </div>
                        </article>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  )
}

export default KanbanBoard
