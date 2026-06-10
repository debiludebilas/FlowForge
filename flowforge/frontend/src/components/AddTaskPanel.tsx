import type { KeyboardEvent } from "react"
import { STATUSES, type TaskPriority } from "../constants"
import { PriorityLights } from "./PriorityLights"

interface AddTaskPanelProps {
    title: string
    description: string
    status: string
    priority: TaskPriority
    onTitleChange: (value: string) => void
    onDescriptionChange: (value: string) => void
    onStatusChange: (value: string) => void
    onPriorityChange: (value: TaskPriority) => void
    onSubmit: () => void
}

export function AddTaskPanel({
    title,
    description,
    status,
    priority,
    onTitleChange,
    onDescriptionChange,
    onStatusChange,
    onPriorityChange,
    onSubmit,
}: AddTaskPanelProps) {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            onSubmit()
        }
    }

    return (
        <section className="border-b border-slate-200 bg-white">
            <div className="mx-auto max-w-[1600px] px-6 py-5">
                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5">
                    <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
                        Create a task
                    </h2>
                    <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
                        <label className="block">
                            <span className="mb-1.5 block text-sm font-medium text-slate-700">Title</span>
                            <input
                                type="text"
                                placeholder="e.g. Fix login validation"
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-shadow placeholder:text-slate-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                                value={title}
                                onChange={(e) => onTitleChange(e.target.value)}
                                onKeyDown={handleKeyDown}
                                autoFocus
                            />
                        </label>

                        <label className="block">
                            <span className="mb-1.5 block text-sm font-medium text-slate-700">Description</span>
                            <input
                                type="text"
                                placeholder="Optional details"
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-shadow placeholder:text-slate-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                                value={description}
                                onChange={(e) => onDescriptionChange(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                        </label>

                        <div className="flex gap-3 md:flex-col md:items-stretch">
                            <label className="block flex-1 md:flex-none">
                                <span className="mb-1.5 block text-sm font-medium text-slate-700">Column</span>
                                <select
                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                                    value={status}
                                    onChange={(e) => onStatusChange(e.target.value)}
                                >
                                    {STATUSES.map((s) => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </label>

                            <div className="block flex-1 md:flex-none">
                                <span className="mb-1.5 block text-sm font-medium text-slate-700">Priority</span>
                                <div className="flex h-[42px] items-center rounded-lg border border-slate-200 bg-white px-3">
                                    <PriorityLights priority={priority} onChange={onPriorityChange} size="md" />
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={onSubmit}
                                disabled={!title.trim()}
                                className="self-end rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm shadow-indigo-200 transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 md:mt-auto"
                            >
                                Add task
                            </button>
                        </div>
                    </div>
                    <p className="mt-3 text-xs text-slate-400">Tip: press Ctrl+Enter to create quickly</p>
                </div>
            </div>
        </section>
    )
}