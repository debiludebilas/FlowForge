import { PRIORITIES, PRIORITY_CONFIG, type TaskPriority } from "../constants"

interface PriorityLightsProps {
    priority: TaskPriority
    onChange: (priority: TaskPriority) => void
    size?: "sm" | "md"
}

export function PriorityLights({ priority, onChange, size = "sm" }: PriorityLightsProps) {
    const dotSize = size === "sm" ? "h-2.5 w-2.5" : "h-3 w-3"

    return (
        <div className="flex items-center gap-1.5" role="group" aria-label="Task priority">
            {PRIORITIES.map((p) => {
                const active = priority === p
                const config = PRIORITY_CONFIG[p]
                return (
                    <button
                        key={p}
                        type="button"
                        title={`${config.label} priority`}
                        aria-label={`Set ${config.label} priority`}
                        aria-pressed={active}
                        onClick={() => onChange(p)}
                        className={`rounded-full transition-all ${dotSize} ${config.dot} ${
                            active
                                ? `scale-110 ring-2 ring-offset-1 ${config.ring} shadow-sm ${config.glow}`
                                : "opacity-25 hover:opacity-60"
                        }`}
                    />
                )
            })}
        </div>
    )
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
    const config = PRIORITY_CONFIG[priority]
    return (
        <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
            <span className={`h-2 w-2 rounded-full ${config.dot}`} />
            {config.label}
        </span>
    )
}