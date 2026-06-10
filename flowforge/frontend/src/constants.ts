export const STATUSES = ["To Do", "In Progress", "Done"] as const
export const PRIORITIES = ["Urgent", "Normal", "Low"] as const

export type TaskStatus = (typeof STATUSES)[number]
export type TaskPriority = (typeof PRIORITIES)[number]

export const PRIORITY_CONFIG: Record<
    TaskPriority,
    { label: string; dot: string; ring: string; glow: string; border: string }
> = {
    Urgent: {
        label: "Urgent",
        dot: "bg-red-500",
        ring: "ring-red-300",
        glow: "shadow-red-200",
        border: "border-l-red-500",
    },
    Normal: {
        label: "Normal",
        dot: "bg-amber-400",
        ring: "ring-amber-300",
        glow: "shadow-amber-200",
        border: "border-l-amber-400",
    },
    Low: {
        label: "Low",
        dot: "bg-emerald-400",
        ring: "ring-emerald-300",
        glow: "shadow-emerald-200",
        border: "border-l-emerald-400",
    },
}

export const DEFAULT_PRIORITY: TaskPriority = "Normal"

export const COLUMN_CONFIG: Record<
    TaskStatus,
    {
        label: string
        accent: string
        badge: string
        dot: string
        emptyMessage: string
    }
> = {
    "To Do": {
        label: "To Do",
        accent: "border-t-slate-400",
        badge: "bg-slate-100 text-slate-700",
        dot: "bg-slate-400",
        emptyMessage: "No tasks queued yet",
    },
    "In Progress": {
        label: "In Progress",
        accent: "border-t-blue-500",
        badge: "bg-blue-50 text-blue-700",
        dot: "bg-blue-500",
        emptyMessage: "Drag a task here to start",
    },
    Done: {
        label: "Done",
        accent: "border-t-emerald-500",
        badge: "bg-emerald-50 text-emerald-700",
        dot: "bg-emerald-500",
        emptyMessage: "Completed tasks land here",
    },
}