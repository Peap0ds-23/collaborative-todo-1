"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { deleteTodo } from "@/actions/todos/actions";
import { ShareIcon, EditIcon, TrashIcon, LoadingSpinner, HistoryIcon } from "@/components/icons";

interface TodoActionsProps {
    id: string;
    onEdit: () => void;
    onShare: () => void;
    onHistory: () => void;
    isOwner: boolean;
}

export default function TodoActions({ id, onEdit, onShare, onHistory, isOwner }: TodoActionsProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await deleteTodo(id);
        } catch (error) {
            console.error("Failed to delete todo:", error);
            setIsDeleting(false);
        }
    };

    return (
        <div className="flex items-center gap-1">
            {/* Share Button - Only visible to task owner */}
            {isOwner && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="w-7 h-7 text-gray-500 hover:text-green-600 dark:hover:text-green-400"
                    onClick={onShare}
                    title="Share task"
                >
                    <ShareIcon className="w-4 h-4" />
                </Button>
            )}

            {/* History Button */}
            <Button
                variant="ghost"
                size="icon"
                className="w-7 h-7 text-gray-500 hover:text-purple-600 dark:hover:text-purple-400"
                onClick={onHistory}
                title="View history"
            >
                <HistoryIcon className="w-4 h-4" />
            </Button>

            {/* Edit Button */}
            <Button
                variant="ghost"
                size="icon"
                className="w-7 h-7 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400"
                onClick={onEdit}
                title="Edit task"
            >
                <EditIcon className="w-4 h-4" />
            </Button>

            {/* Delete Button - Only visible to task owner */}
            {isOwner && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="w-7 h-7 text-gray-500 hover:text-red-600 dark:hover:text-red-400"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    title="Delete task"
                >
                    {isDeleting ? (
                        <LoadingSpinner className="w-4 h-4" />
                    ) : (
                        <TrashIcon className="w-4 h-4" />
                    )}
                </Button>
            )}
        </div>
    );
}
