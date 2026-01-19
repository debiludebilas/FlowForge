import axios from "axios"

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"

export interface Task {
    id: number;
    title: string;
    description?: string;
    status: string;
}

const api = axios.create({
    baseURL: API_URL,
})

export const getTasks = async () => {
    const response = await api.get<Task[]>("/tasks/")
    return response.data
}

export const createTask = async (task: { title: string; description?: string, status: string }) => {
    const response = await api.post<Task>("/tasks/", task)
    return response.data
}

export const updateTask = async (taskId: number, task: any) => {
    const response = await api.patch<Task>(`/tasks/${taskId}`, task)
    return response.data
}

export const deleteTask = async (taskId: number) => {
    const response = await api.delete(`/tasks/${taskId}`)
    return response.data
}