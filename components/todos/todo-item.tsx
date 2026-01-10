"use client";

import { useState, useEffect } from "react";
import TodoCheckbox from "./todo-checkbox";
import PriorityBadge from "./priority-badge";
import TodoActions from "./todo-actions";
import EditTodoModal from "./edit-todo-modal";
import ShareTaskModal from "./share-task-modal";
import TaskHistoryModal from "./task-history-modal";
import type { Todo } from "@/lib/interface";
import { Users } from "lucide-react";

interface TodoItemProps {
    todo: Todo;
    currentUserId: string;
    onToggleComplete?: (todo: Todo) => void;
}

export default function TodoItem({ todo, currentUserId, onToggleComplete }: TodoItemProps) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    // User is owner if they created the todo
    const isOwner = todo.user_id === currentUserId;

    useEffect(() => {
        setMounted(true);
    }, []);

    const isOverdue = todo.due_date && new Date(todo.due_date) < new Date() && !todo.is_complete;

    return (
        <>
            <div className="flex items-start gap-3 py-3 px-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                <div className="pt-0.5">
                    <TodoCheckbox todo={todo} onToggleComplete={onToggleComplete} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-base font-medium ${todo.is_complete ? 'line-through text-gray-400' : ''}`}>
                            {todo.task}
                        </span>
                        <PriorityBadge priority={todo.priority} />
                        {todo.is_shared && todo.owner_email && (
                            <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                                {/* Shared by {todo.owner_email} */}
                                <Users className="w-4 h-4 text-gray-500" />
                                <span>Shared</span>
                            </span>
                        )}
                    </div>

                    {todo.description && (
                        <p className={`text-sm mt-1 ${todo.is_complete ? 'text-gray-400 line-through' : 'text-gray-600 dark:text-gray-400'}`}>
                            {todo.description}
                        </p>
                    )}

                    {todo.due_date && (
                        <div className="flex items-center gap-1.5 mt-2">
                            <CalendarIcon className="w-3.5 h-3.5 text-gray-400" />
                            <span className={`text-xs ${isOverdue ? 'text-red-500 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                                {isOverdue && '⚠ '}
                                {mounted ? formatDueDate(todo.due_date) : ''}
                            </span>
                        </div>
                    )}
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <TodoActions
                        id={todo.id}
                        onEdit={() => setIsEditModalOpen(true)}
                        onShare={() => setIsShareModalOpen(true)}
                        onHistory={() => setIsHistoryModalOpen(true)}
                        isOwner={isOwner}
                    />
                </div>
            </div>

            <EditTodoModal
                todo={todo}
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
            />

            <ShareTaskModal
                todoId={todo.id}
                taskName={todo.task}
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
            />

            <TaskHistoryModal
                todoId={todo.id}
                taskName={todo.task}
                isOpen={isHistoryModalOpen}
                onClose={() => setIsHistoryModalOpen(false)}
            />
        </>
    );
}

function formatDueDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (targetDate.getTime() === today.getTime()) {
        return `Today at ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (targetDate.getTime() === tomorrow.getTime()) {
        return `Tomorrow at ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

function CalendarIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
            <line x1="16" x2="16" y1="2" y2="6" />
            <line x1="8" x2="8" y1="2" y2="6" />
            <line x1="3" x2="21" y1="10" y2="10" />
        </svg>
    );
}
