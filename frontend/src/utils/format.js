import { format, formatDistanceToNowStrict, isPast, isToday, parseISO } from 'date-fns'

export const formatDate = (value, pattern = 'MMM d, yyyy') => {
  if (!value) {
    return 'No date'
  }

  const date = typeof value === 'string' ? parseISO(value) : value
  return format(date, pattern)
}

export const formatStatusLabel = (value) => {
  switch (value) {
    case 'todo':
      return 'To Do'
    case 'in-progress':
      return 'In Progress'
    case 'done':
      return 'Completed'
    default:
      return value
  }
}

export const formatPriorityLabel = (value) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : 'Priority'

export const getInitials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')

export const formatDueLabel = (value) => {
  if (!value) {
    return 'No due date'
  }

  const date = typeof value === 'string' ? parseISO(value) : value

  if (isToday(date)) {
    return 'Due today'
  }

  if (isPast(date)) {
    return `Overdue by ${formatDistanceToNowStrict(date)}`
  }

  return `Due in ${formatDistanceToNowStrict(date)}`
}

export const getErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.message ||
  'Something went wrong. Please try again.'
