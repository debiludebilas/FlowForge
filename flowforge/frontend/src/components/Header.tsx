import logo from "../assets/8vjgD.jpg"

interface HeaderProps {
    totalTasks: number
    doneCount: number
    inProgressCount: number
    showAddPanel: boolean
    onToggleAddPanel: () => void
}

export function Header({
    totalTasks,
    doneCount,
    inProgressCount,
    showAddPanel,
    onToggleAddPanel,
}: HeaderProps) {
    return (
        <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
            <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-6 py-4">
                <div className="flex items-center gap-3">
                    <img
                        src={logo}
                        alt="FlowForge logo"
                        className="h-10 w-10 rounded-xl object-cover shadow-sm shadow-slate-200"
                    />
                    <div>
                        <h1 className="text-lg font-semibold tracking-tight text-slate-900">FlowForge</h1>
                        <p className="text-xs text-slate-500">Kanban task board</p>
                    </div>
                </div>

                <div className="hidden items-center gap-6 text-sm text-slate-600 sm:flex">
                    <Stat label="Total" value={totalTasks} />
                    <Stat label="In progress" value={inProgressCount} accent="text-blue-600" />
                    <Stat label="Done" value={doneCount} accent="text-emerald-600" />
                </div>

                <button
                    type="button"
                    onClick={onToggleAddPanel}
                    className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                        showAddPanel
                            ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                            : "bg-indigo-600 text-white shadow-sm shadow-indigo-200 hover:bg-indigo-700"
                    }`}
                >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d={showAddPanel ? "M6 18L18 6M6 6l12 12" : "M12 4v16m8-8H4"} />
                    </svg>
                    {showAddPanel ? "Close" : "New task"}
                </button>
            </div>
        </header>
    )
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: string }) {
    return (
        <div className="flex items-center gap-2">
            <span className="text-slate-400">{label}</span>
            <span className={`font-semibold tabular-nums ${accent ?? "text-slate-800"}`}>{value}</span>
        </div>
    )
}