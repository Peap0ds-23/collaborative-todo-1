"use client";

import { useState, useCallback, useEffect } from "react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableTodoItem } from "./sortable-todo-item";
import TodoItem from "./todo-item";
import AddTodoModal from "./add-todo-modal";
import { updateTaskOrder, onCheckChange, deleteCompletedTodos, deleteAllTodos } from "@/actions/todos/actions";
import { Button } from "@/components/ui/button";
import type { Todo } from "@/lib/interface";

interface SortableTodoListProps {
    initialIncompleteTodos: Todo[];
    initialCompleteTodos: Todo[];
    currentUserId: string;
}

export default function SortableTodoList({
    initialIncompleteTodos,
    initialCompleteTodos,
    currentUserId,
}: SortableTodoListProps) {
    const [incompleteTodos, setIncompleteTodos] = useState(initialIncompleteTodos);
    const [completeTodos, setCompleteTodos] = useState(initialCompleteTodos);
    const [isSaving, setIsSaving] = useState(false);

    // Sync content changes from server while preserving local order
    useEffect(() => {
        setIncompleteTodos(prev => {
            const currentOrder = new Map(prev.map((t, i) => [t.id, i]));
            const stillIncomplete = initialIncompleteTodos.filter(t => !t.is_complete);
            const existingUpdated = prev
                .filter(p => stillIncomplete.some(s => s.id === p.id))
                .map(p => stillIncomplete.find(s => s.id === p.id) || p);
            const newTodos = stillIncomplete.filter(s => !currentOrder.has(s.id));
            return [...existingUpdated, ...newTodos];
        });
    }, [initialIncompleteTodos]);

    useEffect(() => {
        setCompleteTodos(prev => {
            const currentIds = new Set(prev.map(t => t.id));
            const existingUpdated = prev
                .filter(p => initialCompleteTodos.some(s => s.id === p.id))
                .map(p => initialCompleteTodos.find(s => s.id === p.id) || p);
            const newTodos = initialCompleteTodos.filter(s => !currentIds.has(s.id));
            return [...existingUpdated, ...newTodos];
        });
    }, [initialCompleteTodos]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleToggleComplete = useCallback(async (todo: Todo) => {
        const newIsComplete = !todo.is_complete;
        if (newIsComplete) {
            setIncompleteTodos(prev => prev.filter(t => t.id !== todo.id));
            setCompleteTodos(prev => [{ ...todo, is_complete: true }, ...prev]);
        } else {
            setCompleteTodos(prev => prev.filter(t => t.id !== todo.id));
            setIncompleteTodos(prev => [...prev, { ...todo, is_complete: false }]);
        }
        try {
            await onCheckChange(todo);
        } catch (error) {
            console.error("Failed to update task completion:", error);
            if (newIsComplete) {
                setCompleteTodos(prev => prev.filter(t => t.id !== todo.id));
                setIncompleteTodos(prev => [...prev, todo]);
            } else {
                setIncompleteTodos(prev => prev.filter(t => t.id !== todo.id));
                setCompleteTodos(prev => [...prev, todo]);
            }
        }
    }, []);

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = incompleteTodos.findIndex((t) => t.id === active.id);
            const newIndex = incompleteTodos.findIndex((t) => t.id === over.id);
            if (oldIndex !== -1 && newIndex !== -1) {
                const newTodos = arrayMove(incompleteTodos, oldIndex, newIndex);
                setIncompleteTodos(newTodos);
                setIsSaving(true);
                try {
                    const orderedIds = newTodos.map((t) => t.id);
                    await updateTaskOrder(orderedIds);
                } catch (error) {
                    console.error("Failed to save task order:", error);
                    setIncompleteTodos(incompleteTodos);
                } finally {
                    setIsSaving(false);
                }
            }
        }
    };

    const activeCount = incompleteTodos.length;
    const completedCount = completeTodos.length;

    return (
        <div className="flex flex-col gap-4 h-full">
            {/* Part 1: Header Section with Summary - Fixed */}
            <div className="flex items-center justify-between flex-shrink-0">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium text-blue-600 dark:text-blue-400">{activeCount} Active</span>
                    <span className="mx-2">•</span>
                    <span className="font-medium text-green-600 dark:text-green-400">{completedCount} Completed</span>
                </p>
            </div>

            {/* Part 2: Add Todo Section - Fixed */}
            <div className="flex-shrink-0">
                <AddTodoModal />
            </div>

            {/* Scrollable sections container */}
            <div className="flex-1 flex flex-col gap-4 min-h-0 overflow-hidden">
                {/* Part 3: Active Todos Section - Independently Scrollable */}
                <div className="flex-1 flex flex-col min-h-0">
                    <div className="flex items-center justify-between mb-2 flex-shrink-0">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Active Tasks</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto min-h-0">
                        {incompleteTodos.length === 0 ? (
                            <div className="py-6 text-center text-gray-500 dark:text-gray-400 text-sm">
                                No active tasks. Add one above!
                            </div>
                        ) : (
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={incompleteTodos.map((t) => t.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <div className="flex flex-col gap-1">
                                        {incompleteTodos.map((todo) => (
                                            <SortableTodoItem
                                                key={todo.id}
                                                todo={todo}
                                                currentUserId={currentUserId}
                                                onToggleComplete={handleToggleComplete}
                                            />
                                        ))}
                                    </div>
                                </SortableContext>
                            </DndContext>
                        )}
                        {isSaving && (
                            <div className="text-xs text-gray-400 text-center py-1">
                                Saving order...
                            </div>
                        )}
                    </div>
                </div>

                {/* Part 4: Completed Todos Section - Independently Scrollable */}
                <div className="flex-1 flex flex-col min-h-0">
                    <div className="flex items-center justify-between mb-2 flex-shrink-0">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Completed Tasks</h3>
                        {completeTodos.length > 0 && (
                            <Button
                                onClick={async () => {
                                    await deleteCompletedTodos();
                                }}
                                size="sm"
                                variant="ghost"
                                className="text-xs h-7 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                Clear Completed
                            </Button>
                        )}
                    </div>
                    <div className="flex-1 overflow-y-auto min-h-0">
                        {completeTodos.length === 0 ? (
                            <div className="py-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                                No completed tasks yet.
                            </div>
                        ) : (
                            <div className="flex flex-col gap-1">
                                {completeTodos.map((todo) => (
                                    <TodoItem
                                        key={todo.id}
                                        todo={todo}
                                        currentUserId={currentUserId}
                                        onToggleComplete={handleToggleComplete}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Part 5: Danger Zone Section - Fixed at bottom */}
            <div className="flex-shrink-0 mt-2 p-4 border border-red-200 dark:border-red-800/50 rounded-lg bg-red-50/50 dark:bg-red-900/10">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-semibold text-red-700 dark:text-red-400">Danger Zone</h3>
                        <p className="text-xs text-red-600/80 dark:text-red-400/70 mt-0.5">
                            This action cannot be undone.
                        </p>
                    </div>
                    <Button
                        onClick={async () => {
                            await deleteAllTodos();
                        }}
                        size="sm"
                        variant="destructive"
                        className="bg-red-600 hover:bg-red-700 text-white"
                    >
                        Clear All Todos
                    </Button>
                </div>
            </div>
        </div>
    );
}
