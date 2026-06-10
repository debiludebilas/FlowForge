import { useEffect, useRef, useState } from "react"
import { createTask, getTasks, deleteTask, type Task, updateTask } from "./api"
import { STATUSES, DEFAULT_PRIORITY, type TaskStatus, type TaskPriority } from "./constants"
import type { TaskUpdatePayload } from "./api"
import { Header } from "./components/Header"
import { AddTaskPanel } from "./components/AddTaskPanel"
import { KanbanColumn, ColumnEmptyState } from "./components/KanbanColumn"
import { TaskCard, DraggedTaskCard } from "./components/TaskCard"
import { DndContext, DragOverlay, closestCorners, pointerWithin } from "@dnd-kit/core"
import type { DragEndEvent, DragOverEvent, DragStartEvent, CollisionDetection } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { isColumnId, moveToColumn, reorderWithinColumn, resolveColumnId } from "./dragUtils"

const columnCollision: CollisionDetection = (args) => {
    const pointerHits = pointerWithin(args)
    if (pointerHits.length > 0) return pointerHits
    return closestCorners(args)
}

function App() {
    const [tasks, setTasks] = useState<Task[]>([])
    const [activeId, setActiveId] = useState<string | null>(null)
    const [overColumn, setOverColumn] = useState<TaskStatus | null>(null)
    const [showAddPanel, setShowAddPanel] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [loadError, setLoadError] = useState(false)

    const tasksRef = useRef<Task[]>(tasks)
    const tasksSnapshotRef = useRef<Task[] | null>(null)
    const dragOriginStatusRef = useRef<TaskStatus | null>(null)

    useEffect(() => {
        tasksRef.current = tasks
    }, [tasks])

    const [newTaskTitle, setNewTaskTitle] = useState("")
    const [newTaskDescription, setNewTaskDescription] = useState("")
    const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus>("To Do")
    const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>(DEFAULT_PRIORITY)

    const doneCount = tasks.filter((t) => t.status === "Done").length
    const inProgressCount = tasks.filter((t) => t.status === "In Progress").length

    const handleMoveTask = async (taskId: number, newStatus: string) => {
        try {
            await updateTask(taskId, { status: newStatus })
            setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)))
        } catch (error) {
            console.error("Error updating task:", error)
        }
    }

    const handleCreateTask = async () => {
        if (!newTaskTitle.trim()) return

        try {
            const createdTask = await createTask({
                title: newTaskTitle.trim(),
                description: newTaskDescription.trim() || undefined,
                status: newTaskStatus,
                priority: newTaskPriority,
            })

            setTasks((prev) => [...prev, createdTask])
            setNewTaskTitle("")
            setNewTaskDescription("")
            setNewTaskStatus("To Do")
            setNewTaskPriority(DEFAULT_PRIORITY)
            setShowAddPanel(false)
        } catch (error) {
            console.error("Error creating task:", error)
        }
    }

    const handleUpdateTask = async (taskId: number, fields: TaskUpdatePayload) => {
        try {
            const updated = await updateTask(taskId, fields)
            setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)))
        } catch (error) {
            console.error("Error updating task:", error)
        }
    }

    const handleDeleteTask = async (id: number) => {
        try {
            await deleteTask(id)
            setTasks((prev) => prev.filter((t) => t.id !== id))
        } catch (error) {
            console.error("Error deleting task:", error)
        }
    }

    const resetDragState = () => {
        setActiveId(null)
        setOverColumn(null)
        dragOriginStatusRef.current = null
        tasksSnapshotRef.current = null
    }

    const handleDragStart = (event: DragStartEvent) => {
        const taskId = Number(event.active.id)
        const task = tasks.find((t) => t.id === taskId)
        if (!task) return

        tasksSnapshotRef.current = tasks
        dragOriginStatusRef.current = task.status as TaskStatus
        setActiveId(event.active.id as string)
    }

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event
        if (!over) {
            setOverColumn(null)
            return
        }

        const taskId = Number(active.id)
        if (Number.isNaN(taskId)) return

        const overId = String(over.id)
        const prev = tasksRef.current
        const destColumn = resolveColumnId(overId, prev)

        if (!destColumn) {
            setOverColumn(null)
            return
        }

        setOverColumn(destColumn)

        const activeTask = prev.find((t) => t.id === taskId)
        if (!activeTask) return

        let next: Task[] | null = null

        if (activeTask.status === destColumn) {
            if (!isColumnId(overId)) {
                next = reorderWithinColumn(prev, taskId, destColumn, overId)
            }
        } else {
            next = moveToColumn(prev, taskId, destColumn, overId)
        }

        if (next) {
            tasksRef.current = next
            setTasks(next)
        }
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { over } = event

        if (!over && tasksSnapshotRef.current) {
            setTasks(tasksSnapshotRef.current)
            resetDragState()
            return
        }

        const taskId = Number(event.active.id)
        if (!Number.isNaN(taskId) && dragOriginStatusRef.current) {
            const finalTask = tasks.find((t) => t.id === taskId)
            if (finalTask && finalTask.status !== dragOriginStatusRef.current) {
                handleMoveTask(taskId, finalTask.status)
            }
        }

        resetDragState()
    }

    const handleDragCancel = () => {
        if (tasksSnapshotRef.current) {
            setTasks(tasksSnapshotRef.current)
        }
        resetDragState()
    }

    useEffect(() => {
        getTasks()
            .then((data) => {
                setTasks(data)
                setLoadError(false)
            })
            .catch((error) => {
                console.error("Error connecting to backend:", error)
                setLoadError(true)
            })
            .finally(() => setIsLoading(false))
    }, [])

    return (
        <div className="min-h-screen bg-slate-100">
            <Header
                totalTasks={tasks.length}
                doneCount={doneCount}
                inProgressCount={inProgressCount}
                showAddPanel={showAddPanel}
                onToggleAddPanel={() => setShowAddPanel((v) => !v)}
            />

            {showAddPanel && (
                <AddTaskPanel
                    title={newTaskTitle}
                    description={newTaskDescription}
                    status={newTaskStatus}
                    priority={newTaskPriority}
                    onTitleChange={setNewTaskTitle}
                    onDescriptionChange={setNewTaskDescription}
                    onStatusChange={(v) => setNewTaskStatus(v as TaskStatus)}
                    onPriorityChange={setNewTaskPriority}
                    onSubmit={handleCreateTask}
                />
            )}

            <main className="mx-auto max-w-[1600px] overflow-x-hidden px-6 py-6">
                {isLoading ? (
                    <div className="flex min-h-[50vh] items-center justify-center">
                        <div className="flex items-center gap-3 text-sm text-slate-500">
                            <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600" />
                            Loading board…
                        </div>
                    </div>
                ) : loadError ? (
                    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
                        <p className="text-lg font-medium text-slate-800">Could not reach the API</p>
                        <p className="max-w-md text-sm text-slate-500">
                            Make sure the backend is running at{" "}
                            <code className="rounded bg-slate-200 px-1.5 py-0.5 text-xs">localhost:8000</code>
                        </p>
                    </div>
                ) : (
                    <DndContext
                        collisionDetection={columnCollision}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDragEnd={handleDragEnd}
                        onDragCancel={handleDragCancel}
                    >
                        <div className="flex min-w-0 flex-col gap-4 lg:flex-row">
                            {STATUSES.map((status) => {
                                const columnTasks = tasks.filter((t) => t.status === status)
                                return (
                                    <KanbanColumn
                                        key={status}
                                        status={status}
                                        count={columnTasks.length}
                                        isDragging={activeId !== null}
                                        isHighlighted={overColumn === status}
                                    >
                                        <SortableContext
                                            items={columnTasks.map((t) => t.id.toString())}
                                            strategy={verticalListSortingStrategy}
                                        >
                                            {columnTasks.length === 0 ? (
                                                <ColumnEmptyState status={status} />
                                            ) : (
                                                columnTasks.map((task) => (
                                                    <TaskCard
                                                        key={task.id}
                                                        task={task}
                                                        onDelete={handleDeleteTask}
                                                        onMove={handleMoveTask}
                                                        onUpdate={handleUpdateTask}
                                                    />
                                                ))
                                            )}
                                        </SortableContext>
                                    </KanbanColumn>
                                )
                            })}
                        </div>

                        <DragOverlay
                            dropAnimation={{ duration: 200, easing: "ease" }}
                            style={{ cursor: "grabbing" }}
                        >
                            {activeId ? (
                                <DraggedTaskCard task={tasks.find((t) => t.id.toString() === activeId)!} />
                            ) : null}
                        </DragOverlay>
                    </DndContext>
                )}
            </main>
        </div>
    )
}

export default App