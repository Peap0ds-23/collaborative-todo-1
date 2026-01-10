"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import TodoItem from "./todo-item";
import type { Todo } from "@/lib/interface";

interface SortableTodoItemProps {
    todo: Todo;
    currentUserId: string;
    onToggleComplete: (todo: Todo) => void;
}

export function SortableTodoItem({ todo, currentUserId, onToggleComplete }: SortableTodoItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: todo.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 100 : undefined,
        position: isDragging ? 'relative' as const : undefined,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes}>
            <div className="flex items-center gap-1">
                {/* Drag handle */}
                <button
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 touch-none"
                    aria-label="Drag to reorder"
                >
                    <GripVerticalIcon className="w-4 h-4" />
                </button>
                <div className="flex-1">
                    <TodoItem
                        todo={todo}
                        currentUserId={currentUserId}
                        onToggleComplete={onToggleComplete}
                    />
                </div>
            </div>
        </div>
    );
}

function GripVerticalIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="9" cy="12" r="1" />
            <circle cx="9" cy="5" r="1" />
            <circle cx="9" cy="19" r="1" />
            <circle cx="15" cy="12" r="1" />
            <circle cx="15" cy="5" r="1" />
            <circle cx="15" cy="19" r="1" />
        </svg>
    );
}
