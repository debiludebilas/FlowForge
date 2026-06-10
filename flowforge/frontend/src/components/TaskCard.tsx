import type { CSSProperties, ReactNode } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import type { Task, TaskUpdatePayload } from "../api"
import { DEFAULT_PRIORITY, PRIORITY_CONFIG } from "../constants"
import { InlineEditable } from "./InlineEditable"
import { PriorityLights, PriorityBadge } from "./PriorityLights"

const DRAG_TITLE_MAX = 32
const DRAG_DESCRIPTION_MAX = 40

function truncateForDrag(text: string, maxLength: number) {
    const collapsed = text.replace(/\s+/g, " ").trim()
    if (collapsed.length <= maxLength) return collapsed
    return `${collapsed.slice(0, maxLength).trimEnd()}…`
}

function CompactTaskPreview({ task }: { task: Task }) {
    const priority = task.priority ?? DEFAULT_PRIORITY
    const priorityDot = PRIORITY_CONFIG[priority].dot

    return (
        <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-5 w-4 shrink-0 items-center justify-center text-slate-300">
                <GripIcon />
            </div>
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium leading-tight text-slate-900">
                    {truncateForDrag(task.title, DRAG_TITLE_MAX)}
                </p>
                {task.description && (
                    <p className="truncate text-xs leading-tight text-slate-400">
                        {truncateForDrag(task.description, DRAG_DESCRIPTION_MAX)}
                    </p>
                )}
            </div>
            <span className={`h-2 w-2 shrink-0 rounded-full ${priorityDot}`} />
        </div>
    )
}

interface TaskCardProps {
    task: Task
    onDelete: (id: number) => void
    onMove: (id: number, status: string) => void
    onUpdate: (id: number, fields: TaskUpdatePayload) => void
}

export function TaskCard({ task, onDelete, onMove, onUpdate }: TaskCardProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: task.id.toString(),
    })

    const style: CSSProperties = {
        transform: isDragging ? undefined : CSS.Transform.toString(transform),
        transition,
    }

    const priority = task.priority ?? DEFAULT_PRIORITY
    const priorityBorder = PRIORITY_CONFIG[priority].border

    const prevStatus = task.status === "Done" ? "In Progress" : "To Do"
    const nextStatus = task.status === "To Do" ? "In Progress" : "Done"
    const nextLabel = task.status === "To Do" ? "Start" : "Complete"

    return (
        <article
            ref={setNodeRef}
            style={style}
            {...attributes}
            aria-hidden={isDragging}
            className={`group min-w-0 max-w-full overflow-hidden rounded-xl border border-l-[3px] transition-shadow ${
                isDragging
                    ? `border-dashed border-indigo-200 bg-indigo-50/40 px-2.5 py-2 shadow-none ${priorityBorder}`
                    : `border-slate-200/80 bg-white p-3 shadow-sm hover:shadow-md ${priorityBorder}`
            }`}
        >
            {isDragging ? (
                <CompactTaskPreview task={task} />
            ) : (
            <div>
                <div className="flex min-w-0 gap-2">
                    <button
                        type="button"
                        {...listeners}
                        aria-label="Drag task"
                        className="mt-0.5 flex h-8 w-6 shrink-0 cursor-grab items-center justify-center rounded text-slate-300 transition-colors hover:bg-slate-50 hover:text-slate-500 active:cursor-grabbing touch-none"
                    >
                        <GripIcon />
                    </button>

                    <div className="min-w-0 flex-1">
                        <div className="mb-1.5 flex min-w-0 items-start justify-between gap-2">
                            <InlineEditable
                                value={task.title}
                                placeholder="Untitled task"
                                required
                                onSave={(title) => onUpdate(task.id, { title })}
                                className="min-w-0 flex-1 font-medium leading-snug text-slate-900"
                                inputClassName="text-sm font-medium"
                            />
                            <div className="shrink-0">
                                <PriorityLights
                                    priority={priority}
                                    onChange={(p) => onUpdate(task.id, { priority: p })}
                                />
                            </div>
                        </div>
                        <InlineEditable
                            value={task.description ?? ""}
                            placeholder="Add a description…"
                            multiline
                            onSave={(description) => onUpdate(task.id, { description: description || undefined })}
                            className="text-sm leading-relaxed text-slate-500"
                            inputClassName="text-sm shadow-md"
                        />
                    </div>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2">
                    <div className="flex items-center gap-1">
                        {task.status !== "To Do" && (
                            <IconButton
                                label="Move back"
                                onClick={() => onMove(task.id, prevStatus)}
                                className="text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                            >
                                <ChevronLeftIcon />
                            </IconButton>
                        )}
                        {task.status !== "Done" && (
                            <IconButton
                                label={nextLabel}
                                onClick={() => onMove(task.id, nextStatus)}
                                className="text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700"
                            >
                                <ChevronRightIcon />
                                <span className="text-xs font-medium">{nextLabel}</span>
                            </IconButton>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <PriorityBadge priority={priority} />
                        <IconButton
                            label="Delete task"
                            onClick={() => onDelete(task.id)}
                            className="text-slate-400 opacity-0 transition-opacity hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
                        >
                            <TrashIcon />
                        </IconButton>
                    </div>
                </div>
            </div>
            )}
        </article>
    )
}

export function DraggedTaskCard({ task }: { task: Task }) {
    const priority = task.priority ?? DEFAULT_PRIORITY
    const priorityBorder = PRIORITY_CONFIG[priority].border

    return (
        <article
            className={`w-52 rotate-1 overflow-hidden rounded-lg border border-l-[3px] border-indigo-200 bg-white px-2.5 py-2 shadow-lg ring-2 ring-indigo-100 ${priorityBorder}`}
        >
            <CompactTaskPreview task={task} />
        </article>
    )
}

function IconButton({
    label,
    onClick,
    className,
    children,
}: {
    label: string
    onClick: () => void
    className: string
    children: ReactNode
}) {
    return (
        <button
            type="button"
            aria-label={label}
            onClick={onClick}
            className={`inline-flex items-center gap-1 rounded-md px-2 py-1 transition-colors ${className}`}
        >
            {children}
        </button>
    )
}

function GripIcon() {
    return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="9" cy="7" r="1.5" />
            <circle cx="15" cy="7" r="1.5" />
            <circle cx="9" cy="12" r="1.5" />
            <circle cx="15" cy="12" r="1.5" />
            <circle cx="9" cy="17" r="1.5" />
            <circle cx="15" cy="17" r="1.5" />
        </svg>
    )
}

function ChevronLeftIcon() {
    return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
    )
}

function ChevronRightIcon() {
    return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
    )
}

function TrashIcon() {
    return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
    )
}