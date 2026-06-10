import { arrayMove } from "@dnd-kit/sortable"
import type { Task } from "./api"
import { STATUSES, type TaskStatus } from "./constants"

export function isColumnId(id: string): id is TaskStatus {
    return (STATUSES as readonly string[]).includes(id)
}

export function resolveColumnId(overId: string, tasks: Task[]): TaskStatus | null {
    if (isColumnId(overId)) return overId
    const task = tasks.find((t) => String(t.id) === overId)
    return task ? (task.status as TaskStatus) : null
}

export function reorderWithinColumn(
    tasks: Task[],
    taskId: number,
    column: TaskStatus,
    overId: string,
): Task[] | null {
    const columnTasks = tasks.filter((t) => t.status === column)
    const oldIndex = columnTasks.findIndex((t) => t.id === taskId)
    const newIndex = columnTasks.findIndex((t) => String(t.id) === overId)

    if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return null

    const reordered = arrayMove(columnTasks, oldIndex, newIndex)
    const withoutColumn = tasks.filter((t) => t.status !== column)
    const grouped: Record<TaskStatus, Task[]> = {
        "To Do": [],
        "In Progress": [],
        Done: [],
    }
    for (const status of STATUSES) {
        grouped[status] = status === column ? reordered : withoutColumn.filter((t) => t.status === status)
    }
    return [...grouped["To Do"], ...grouped["In Progress"], ...grouped.Done]
}

export function moveToColumn(
    tasks: Task[],
    taskId: number,
    destColumn: TaskStatus,
    overId: string,
): Task[] | null {
    const activeTask = tasks.find((t) => t.id === taskId)
    if (!activeTask) return null

    const withoutActive = tasks.filter((t) => t.id !== taskId)
    const destTasks = withoutActive.filter((t) => t.status === destColumn)

    let insertIndex = destTasks.length
    if (!isColumnId(overId)) {
        const overIndex = destTasks.findIndex((t) => String(t.id) === overId)
        if (overIndex !== -1) insertIndex = overIndex
    }

    const currentDestTasks = tasks.filter((t) => t.status === destColumn)
    const currentIndex = currentDestTasks.findIndex((t) => t.id === taskId)

    if (currentIndex === insertIndex && activeTask.status === destColumn) {
        return null
    }

    const movedTask: Task = { ...activeTask, status: destColumn }
    const newDestTasks = [
        ...destTasks.slice(0, insertIndex),
        movedTask,
        ...destTasks.slice(insertIndex),
    ]

    const withoutDest = withoutActive.filter((t) => t.status !== destColumn)
    const grouped: Record<TaskStatus, Task[]> = {
        "To Do": [],
        "In Progress": [],
        Done: [],
    }
    for (const status of STATUSES) {
        grouped[status] = status === destColumn ? newDestTasks : withoutDest.filter((t) => t.status === status)
    }
    return [...grouped["To Do"], ...grouped["In Progress"], ...grouped.Done]
}