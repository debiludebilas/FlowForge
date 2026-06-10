import { useCallback, useEffect, useRef, useState } from "react"
import type { KeyboardEvent, RefObject } from "react"

interface InlineEditableProps {
    value: string
    placeholder: string
    onSave: (value: string) => void
    className?: string
    inputClassName?: string
    required?: boolean
    multiline?: boolean
}

function estimateTextareaRows(text: string) {
    const lineBreaks = text.split("\n").length
    const wrappedLines = Math.ceil(text.length / 42)
    return Math.min(14, Math.max(4, lineBreaks, wrappedLines))
}

function resizeTextarea(el: HTMLTextAreaElement) {
    el.style.height = "auto"
    el.style.height = `${Math.max(el.scrollHeight, 96)}px`
}

export function InlineEditable({
    value,
    placeholder,
    onSave,
    className = "",
    inputClassName = "",
    required = false,
    multiline = false,
}: InlineEditableProps) {
    const [editing, setEditing] = useState(false)
    const [draft, setDraft] = useState(value)
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

    useEffect(() => {
        setDraft(value)
    }, [value])

    const focusField = useCallback(() => {
        const el = inputRef.current
        if (!el) return

        el.focus()

        if (multiline && el instanceof HTMLTextAreaElement) {
            resizeTextarea(el)
            const end = el.value.length
            el.setSelectionRange(end, end)
        } else {
            el.select()
        }
    }, [multiline])

    useEffect(() => {
        if (editing) {
            focusField()
        }
    }, [editing, focusField])

    const commit = () => {
        const trimmed = draft.trim()
        if (required && !trimmed) {
            setDraft(value)
            setEditing(false)
            return
        }
        setEditing(false)
        if (trimmed !== value) {
            onSave(trimmed)
        }
    }

    const cancel = () => {
        setDraft(value)
        setEditing(false)
    }

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (e.key === "Enter" && (!multiline || !e.shiftKey)) {
            e.preventDefault()
            commit()
        } else if (e.key === "Escape") {
            e.preventDefault()
            cancel()
        }
    }

    const fieldClassName = `w-full min-w-0 max-w-full rounded border border-indigo-300 bg-white px-2 py-1.5 outline-none ring-2 ring-indigo-100 ${inputClassName}`

    if (editing) {
        if (multiline) {
            return (
                <textarea
                    ref={inputRef as RefObject<HTMLTextAreaElement>}
                    value={draft}
                    rows={estimateTextareaRows(draft)}
                    onChange={(e) => {
                        setDraft(e.target.value)
                        resizeTextarea(e.target)
                    }}
                    onBlur={commit}
                    onKeyDown={handleKeyDown}
                    className={`${fieldClassName} relative z-10 max-h-64 min-h-24 resize-y leading-relaxed`}
                />
            )
        }

        return (
            <input
                ref={inputRef as RefObject<HTMLInputElement>}
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={commit}
                onKeyDown={handleKeyDown}
                className={fieldClassName}
            />
        )
    }

    return (
        <div
            onDoubleClick={() => setEditing(true)}
            title="Double-click to edit"
            className={`min-w-0 max-w-full cursor-text break-words rounded px-0.5 -mx-0.5 transition-colors [overflow-wrap:anywhere] hover:bg-slate-50 ${multiline ? "whitespace-pre-wrap" : ""} ${className}`}
        >
            {value ? (
                value
            ) : (
                <span className="italic text-slate-400">{placeholder}</span>
            )}
        </div>
    )
}