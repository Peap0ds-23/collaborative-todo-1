"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addTodo } from "@/actions/todos/actions";
import { validateDueDate } from "@/lib/validations/todo-schema";

interface AddTodoModalProps {
    onClose?: () => void;
}

export default function AddTodoModal({ onClose }: AddTodoModalProps) {
    const formRef = useRef<HTMLFormElement>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [dateError, setDateError] = useState<string | null>(null);

    const handleClose = () => {
        setIsOpen(false);
        setDateError(null);
        onClose?.();
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
            await addTodo(formData);
            formRef.current?.reset();
            setDateError(null);
            handleClose();
        } catch (error) {
            console.error("Failed to add todo:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) {
        return (
            <Button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 w-full justify-start bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 border border-dashed border-gray-300 dark:border-gray-700"
            >
                <PlusIcon className="w-4 h-4" />
                Add new task
            </Button>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md mx-4 p-6 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        Add New Task
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
                        <Label htmlFor="task" className="text-sm font-medium">
                            Title <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="task"
                            name="task"
                            placeholder="What needs to be done?"
                            required
                            className="w-full"
                            autoFocus
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-sm font-medium">
                            Description
                        </Label>
                        <textarea
                            id="description"
                            name="description"
                            placeholder="Add more details..."
                            rows={3}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                        />
                    </div>

                    {/* Due Date & Priority Row */}
                    <div className="flex gap-4">
                        {/* Due Date */}
                        <div className="space-y-2 w-2/5">
                            <Label htmlFor="due_date" className="text-sm font-medium">
                                Due Date <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="due_date"
                                name="due_date"
                                type="date"
                                className={`w-full ${dateError ? 'border-red-500' : ''}`}
                                onChange={handleDateChange}
                            />
                            {dateError && (
                                <p className="text-sm text-red-500">{dateError}</p>
                            )}
                        </div>

                        {/* Priority */}
                        <div className="space-y-2 w-3/5">
                            <Label htmlFor="priority" className="text-sm font-medium">
                                Priority
                            </Label>
                            <select
                                id="priority"
                                name="priority"
                                defaultValue="medium"
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
                            {isSubmitting ? "Adding..." : "Add Task"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
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
            <path d="M5 12h14" />
            <path d="M12 5v14" />
        </svg>
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
