"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { editTodo } from "@/actions/todos/actions";
import type { Todo } from "@/lib/interface";
import { validateDueDate } from "@/lib/validations/todo-schema";

interface EditTodoModalProps {
    todo: Todo;
    isOpen: boolean;
    onClose: () => void;
}

export default function EditTodoModal({ todo, isOpen, onClose }: EditTodoModalProps) {
    const formRef = useRef<HTMLFormElement>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [dateError, setDateError] = useState<string | null>(null);

    if (!isOpen) return null;

    const formatDateForInput = (dateString?: string): string => {
        if (!dateString) return "";
        const date = new Date(dateString);
        // Format as YYYY-MM-DD for date input
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const handleClose = () => {
        setDateError(null);
        onClose();
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const error = validateDueDate(value);
        setDateError(error);
    };

    const handleSubmit = async (formData: FormData) => {
        const dueDate = formData.get("due_date") as string;

        // Validate date before submission
        const error = validateDueDate(dueDate);
        if (error) {
            setDateError(error);
            return;
        }

        setIsSubmitting(true);
        try {
            // Convert date to ISO string for storage
            let dueDateUTC: string | undefined = undefined;
            if (dueDate) {
                const localDate = new Date(dueDate);
                dueDateUTC = localDate.toISOString();
            }

            const updatedTodo: Todo = {
                ...todo,
                task: formData.get("task") as string,
                description: (formData.get("description") as string) || undefined,
                due_date: dueDateUTC,
                priority: (formData.get("priority") as 'low' | 'medium' | 'high') || undefined,
            };
            await editTodo(updatedTodo);
            setDateError(null);
            onClose();
        } catch (error) {
            console.error("Failed to update todo:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md mx-4 p-6 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        Edit Task
                    </h2>
                    <button
                        onClick={handleClose}
                        className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <XIcon className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <form ref={formRef} action={handleSubmit} className="space-y-4">
                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="edit-task" className="text-sm font-medium">
                            Title <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="edit-task"
                            name="task"
                            defaultValue={todo.task}
                            placeholder="What needs to be done?"
                            required
                            className="w-full"
                            autoFocus
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="edit-description" className="text-sm font-medium">
                            Description
                        </Label>
                        <textarea
                            id="edit-description"
                            name="description"
                            defaultValue={todo.description || ""}
                            placeholder="Add more details..."
                            rows={3}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                        />
                    </div>

                    {/* Due Date & Priority Row */}
                    <div className="flex gap-4">
                        {/* Due Date */}
                        <div className="space-y-2 w-2/5">
                            <Label htmlFor="edit-due_date" className="text-sm font-medium">
                                Due Date <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="edit-due_date"
                                name="due_date"
                                type="date"
                                defaultValue={formatDateForInput(todo.due_date)}
                                className={`w-full ${dateError ? 'border-red-500' : ''}`}
                                onChange={handleDateChange}
                            />
                            {dateError && (
                                <p className="text-sm text-red-500">{dateError}</p>
                            )}
                        </div>

                        {/* Priority */}
                        <div className="space-y-2 w-3/5">
                            <Label htmlFor="edit-priority" className="text-sm font-medium">
                                Priority
                            </Label>
                            <select
                                id="edit-priority"
                                name="priority"
                                defaultValue={todo.priority || "medium"}
                                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <LoadingSpinner className="w-4 h-4 mr-2" />
                                    Saving...
                                </>
                            ) : (
                                "Save Changes"
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function XIcon(props: React.SVGProps<SVGSVGElement>) {
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
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
        </svg>
    );
}

function LoadingSpinner(props: React.SVGProps<SVGSVGElement>) {
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
            className={`animate-spin ${props.className || ''}`}
        >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
    );
}
