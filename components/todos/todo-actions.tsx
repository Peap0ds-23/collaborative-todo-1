"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { deleteTodo } from "@/actions/todos/actions";

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

function ShareIcon(props: React.SVGProps<SVGSVGElement>) {
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
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
    );
}

function EditIcon(props: React.SVGProps<SVGSVGElement>) {
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
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            <path d="m15 5 4 4" />
        </svg>
    );
}

function TrashIcon(props: React.SVGProps<SVGSVGElement>) {
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
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            <line x1="10" x2="10" y1="11" y2="17" />
            <line x1="14" x2="14" y1="11" y2="17" />
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

function HistoryIcon(props: React.SVGProps<SVGSVGElement>) {
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
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M12 7v5l4 2" />
        </svg>
    );
}
