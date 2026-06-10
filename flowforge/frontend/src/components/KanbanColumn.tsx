import type { ReactNode } from "react"
import { useDroppable } from "@dnd-kit/core"
import { COLUMN_CONFIG, type TaskStatus } from "../constants"

interface KanbanColumnProps {
    status: TaskStatus
    count: number
    isDragging?: boolean
    isHighlighted?: boolean
    children: ReactNode
}

export function KanbanColumn({
    status,
    count,
    isDragging = false,
    isHighlighted = false,
    children,
}: KanbanColumnProps) {
    const { isOver, setNodeRef } = useDroppable({ id: status })
    const config = COLUMN_CONFIG[status]
    const showDropTarget = isHighlighted || isOver

    return (
        <section
            ref={setNodeRef}
            className={`flex min-h-[calc(100vh-10rem)] min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-200/80 bg-slate-50/60 border-t-4 transition-all duration-200 ${config.accent} ${
                showDropTarget ? "bg-indigo-50/80 ring-2 ring-indigo-300 ring-offset-2" : ""
            }`}
        >
            <header className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${config.dot}`} />
                    <h2 className="text-sm font-semibold text-slate-800">{config.label}</h2>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium tabular-nums ${config.badge}`}>
                    {count}
                </span>
            </header>

            <div
                className={`flex-1 space-y-3 px-3 pb-4 ${
                    isDragging ? "overflow-x-hidden overflow-y-visible" : "overflow-x-hidden overflow-y-auto"
                }`}
            >
                {children}
            </div>
        </section>
    )
}

export function ColumnEmptyState({ status }: { status: TaskStatus }) {
    return (
        <div className="flex min-h-[120px] flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white/50 px-4 py-8 text-center">
            <p className="text-sm text-slate-400">{COLUMN_CONFIG[status].emptyMessage}</p>
        </div>
    )
}