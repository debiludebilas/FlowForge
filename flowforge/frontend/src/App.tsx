import {useEffect, useState} from 'react'
import {createTask, getTasks, deleteTask, type Task} from './api'

function App() {
    const [tasks, setTasks] = useState<Task[]>([])

    // State for the add form
    const [newTaskTitle, setNewTaskTitle] = useState("")
    const [newTaskDescription, setNewTaskDescription] = useState("")
    const [newTaskStatus, setNewTaskStatus] = useState("To Do")

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
                <div className={"grid grid-cols-1 md:grid-cols-3 gap-6"}>

                    {/* To Do */}
                    <div className={"bg-gray-100 p-4 rounded-lg shadow-sm"}>
                        <h2 className={"font-bold text-gray-700 mb-4 text-xl"}>To Do</h2>
                        <div className={"space-y-3"}>
                            {tasks
                                .filter((task) => task.status === "To Do")
                                .map((task) => (
                                    <div key={task.id} className={"bg-white p-4 rounded shadow border border-gray-200"}>
                                        <strong className={"block text-lg text-gray-800"}>{task.title}</strong>
                                        <p className={"text-sm text-gray-500"}>{task.description}</p>
                                        <button className={"text-sm text-red-600 font-bold mt-2 hover:underline"}
                                                onClick={() => handleDeleteTask(task.id)}>Delete
                                        </button>
                                    </div>
                                ))}
                        </div>
                    </div>

                    {/* In Progress */}
                    <div className={"bg-blue-50 p-4 rounded-lg shadow-sm"}>
                        <h2 className={"font-bold text-blue-700 mb-4 text-xl"}>In Progress</h2>
                        <div className={"space-y-3"}>
                            {tasks
                                .filter((task) => task.status === "In Progress")
                                .map((task) => (
                                    <div key={task.id} className={"bg-white p-4 rounded shadow border border-blue-100"}>
                                        <strong className={"block text-lg text-gray-800"}>{task.title}</strong>
                                        <p className={"text-sm text-gray-500"}>{task.description}</p>
                                        <button className={"text-sm text-red-600 font-bold mt-2 hover:underline"}
                                                onClick={() => handleDeleteTask(task.id)}>Delete
                                        </button>
                                    </div>
                                ))}
                        </div>
                    </div>

                    {/* Done */}
                    <div className={"bg-green-50 p-4 rounded-lg shadow-sm"}>
                        <h2 className={"font-bold text-green-700 mb-4 text-xl"}>Done</h2>
                        <div className={"space-y-3"}>
                            {tasks
                                .filter((task) => task.status === "Done")
                                .map((task) => (
                                    <div key={task.id} className={"bg-white p-4 rounded shadow border border-green-100"}>
                                        <strong className={"block text-lg text-gray-800 line-through decoration-gray-400"}>{task.title}</strong>
                                        <p className={"text-sm text-gray-500"}>{task.description}</p>
                                        <button className={"text-sm text-red-600 font-bold mt-2 hover:underline"}
                                                onClick={() => handleDeleteTask(task.id)}>Delete
                                        </button>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default App