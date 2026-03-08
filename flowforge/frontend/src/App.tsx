import {useEffect, useState} from 'react'
import type {ReactNode, CSSProperties} from 'react'
import {createTask, getTasks, deleteTask, type Task, updateTask} from './api'

// dnd-kit libraries for drag-and-drop
import {
    DndContext,
    useDroppable,
    DragOverlay,
} from '@dnd-kit/core'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import {
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
    arrayMove,
} from '@dnd-kit/sortable'
import {CSS} from '@dnd-kit/utilities'

function App() {
    const [tasks, setTasks] = useState<Task[]>([])
    const [activeId, setActiveId] = useState<string | null>(null)

    // State for the add form
    const [newTaskTitle, setNewTaskTitle] = useState("")
    const [newTaskDescription, setNewTaskDescription] = useState("")
    const [newTaskStatus, setNewTaskStatus] = useState("To Do")

    const handleMoveTask = async (taskId: number, newStatus: string) => {
        try {
            await updateTask(taskId, {status: newStatus})

            setTasks(tasks.map((t) => {
                if (t.id === taskId) {
                    return {...t, status: newStatus}
                } else {
                    return t
                }
            }))
        } catch (error) {
            console.log("Error updating task: ", error)
        }
    }

    const handleCreateTask = async () => {
        if (!newTaskTitle) return;

        try {
            const createdTask = await createTask({
                title: newTaskTitle,
                description: newTaskDescription,
                status: newTaskStatus
            })

            // Add new task
            setTasks([...tasks, createdTask])

            // Reset the form
            setNewTaskTitle("")
            setNewTaskDescription("")
            setNewTaskStatus("To Do")
        } catch (error) {
            console.error("Error creating task:", error)
        }
    }

    const handleDeleteTask = async (id: number) => {
        if (!id) return;

        try {
            await deleteTask(id)
            setTasks(tasks.filter((t) => t.id !== id))
        } catch (error) {
            console.error("Error deleting task:", error)
        }
    }

    // --- drag & drop helpers ------------------------------------------------
    // a simple draggable card powered by useSortable
    function TaskCard({ task }: { task: Task }) {
        const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id.toString() });
        const style: CSSProperties = {
            transform: CSS.Transform.toString(transform),
            transition,
        };

        if (isDragging) return null;

        return (
            <div
                ref={setNodeRef}
                style={style}
                {...attributes}
                {...listeners}
                className="bg-white p-4 rounded shadow border"
            >
                <strong className="block text-lg text-gray-800">{task.title}</strong>
                <p className="text-sm text-gray-500">{task.description}</p>
                <button
                    className="text-sm text-red-600 font-bold mt-2 hover:underline"
                    onClick={() => handleDeleteTask(task.id)}
                >
                    Delete
                </button>
                <div className="flex justify-between mt-2">
                    {task.status !== "To Do" && (
                        <button
                            className="text-sm text-gray-500 hover:text-black font-bold"
                            onClick={() => handleMoveTask(task.id, task.status === "Done" ? "In Progress" : "To Do")}
                        >
                            ← Back
                        </button>
                    )}
                    {task.status !== "Done" && (
                        <button
                            className="text-sm text-green-600 hover:underline font-bold"
                            onClick={() => handleMoveTask(task.id, task.status === "To Do" ? "In Progress" : "Done")}
                        >
                            {task.status === "To Do" ? "In Progress →" : "Finish →"}
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // wrapper for each status column; provides droppable zone
    function Column({ status, children }: { status: string; children: ReactNode }) {
        const { isOver, setNodeRef } = useDroppable({ id: status });
        const baseClass = status === "To Do" ? "bg-gray-100" : status === "In Progress" ? "bg-blue-50" : "bg-green-50";
        const highlight = isOver ? "bg-blue-100 border-2 border-blue-500 shadow-lg" : "";
        return (
            <div
                ref={setNodeRef}
                className={`p-4 rounded-lg shadow-sm transition-all duration-200 ${baseClass} ${highlight}`}
                data-status={status}
            >
                {children}
            </div>
        );
    }

    // component for the drag overlay (no sortable hooks)
    function DraggedTaskCard({ task }: { task: Task }) {
        return (
            <div className="bg-white p-4 rounded shadow border">
                <strong className="block text-lg text-gray-800">{task.title}</strong>
                <p className="text-sm text-gray-500">{task.description}</p>
            </div>
        );
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) {
            setActiveId(null);
            return;
        }
        const taskId = Number(active.id);
        if (Number.isNaN(taskId)) {
            setActiveId(null);
            return;
        }

        // decide which column we dropped into
        let destStatus = over.id as string;
        // if we dropped over a card, look up its status
        if (tasks.some((t) => String(t.id) === over.id)) {
            const found = tasks.find((t) => String(t.id) === over.id);
            if (found) destStatus = found.status;
        }

        const currentStatus = tasks.find((t) => t.id === taskId)?.status;

        // if dropping within same column and over a card, reorder locally
        if (destStatus === currentStatus && tasks.some((t) => String(t.id) === over.id)) {
            const columnTasks = tasks.filter((t) => t.status === currentStatus);
            const oldIndex = columnTasks.findIndex((t) => t.id === taskId);
            const newIndex = columnTasks.findIndex((t) => String(t.id) === over.id);
            if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
                const reordered = arrayMove(columnTasks, oldIndex, newIndex);
                // rebuild full array keeping status groups in order
                const grouped: Record<string, Task[]> = {"To Do": [], "In Progress": [], "Done": []};
                tasks.forEach((t) => grouped[t.status as string].push(t));
                grouped[currentStatus as string] = reordered;
                setTasks([
                    ...grouped["To Do"],
                    ...grouped["In Progress"],
                    ...grouped["Done"],
                ]);
            }
        } else if (destStatus && destStatus !== currentStatus) {
            handleMoveTask(taskId, destStatus);
        }
        setActiveId(null);
    };


    useEffect(() => {
        getTasks()
            .then((data) => setTasks(data))
            .catch((error) => console.error("Error connecting to backend:", error))
    }, [])

    return (
        <div style={{padding: "20px", fontFamily: "Arial, sans-serif"}}>
            <h1 className={"text-3xl font-bold mb-8 text-blue-600"}>FlowForge Task Board</h1>

            {/* Create Form */}
            <div className="mb-8 flex flex-col gap-4 border p-4 rounded bg-gray-50">
                <div className="flex gap-4">
                    <input
                        type="text"
                        placeholder="Task Title (e.g., Fix Bug)"
                        className="flex-grow border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                    />

                    <select
                        className="border p-2 rounded bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                        value={newTaskStatus}
                        onChange={(e) => setNewTaskStatus(e.target.value)}
                    >
                        <option value="To Do">To Do</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Done">Done</option>
                    </select>
                </div>

                <input
                    type="text"
                    placeholder="Task Description (Optional)"
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    value={newTaskDescription}
                    onChange={(e) => setNewTaskDescription(e.target.value)}
                />

                <button
                    className="bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 self-start"
                    onClick={handleCreateTask}
                >
                    + Add Task
                </button>
            </div>

            {/* Task Columns */}
            {tasks.length === 0 ? (
                <p>No tasks found. Backend is running, but database is empty.</p>
            ) : (
                <DndContext onDragStart={(event: DragStartEvent) => setActiveId(event.active.id as string)} onDragEnd={handleDragEnd}>
                    <div className={"grid grid-cols-1 md:grid-cols-3 gap-6 mt-4"}>
                        {/* To Do Column */}
                        <Column status="To Do">
                            <h2 className="font-bold text-gray-700 mb-4 text-xl">To Do</h2>
                            <SortableContext
                                items={tasks
                                    .filter((t) => t.status === "To Do")
                                    .map((t) => t.id.toString())}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className="space-y-3 min-h-[200px]">
                                    {tasks
                                        .filter((task) => task.status === "To Do")
                                        .map((task) => (
                                            <TaskCard key={task.id} task={task} />
                                        ))}
                                </div>
                            </SortableContext>
                        </Column>

                        {/* In Progress Column */}
                        <Column status="In Progress">
                            <h2 className="font-bold text-blue-700 mb-4 text-xl">In Progress</h2>
                            <SortableContext
                                items={tasks
                                    .filter((t) => t.status === "In Progress")
                                    .map((t) => t.id.toString())}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className="space-y-3 min-h-[200px]">
                                    {tasks
                                        .filter((task) => task.status === "In Progress")
                                        .map((task) => (
                                            <TaskCard key={task.id} task={task} />
                                        ))}
                                </div>
                            </SortableContext>
                        </Column>

                        {/* Done Column */}
                        <Column status="Done">
                            <h2 className="font-bold text-green-700 mb-4 text-xl">Done</h2>
                            <SortableContext
                                items={tasks
                                    .filter((t) => t.status === "Done")
                                    .map((t) => t.id.toString())}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className="space-y-3 min-h-[200px]">
                                    {tasks
                                        .filter((task) => task.status === "Done")
                                        .map((task) => (
                                            <TaskCard key={task.id} task={task} />
                                        ))}
                                </div>
                            </SortableContext>
                        </Column>
                    </div>
                    <DragOverlay>
                        {activeId ? <DraggedTaskCard task={tasks.find(t => t.id.toString() === activeId)!} /> : null}
                    </DragOverlay>
                </DndContext>
            )}
        </div>
    )
}

export default App