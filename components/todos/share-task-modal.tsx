"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { shareTodo, getCollaborators, removeCollaborator } from "@/actions/todos/share-actions";
import type { TodoShare } from "@/lib/interface";

interface ShareTaskModalProps {
    todoId: string;
    taskName: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function ShareTaskModal({ todoId, taskName, isOpen, onClose }: ShareTaskModalProps) {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [collaborators, setCollaborators] = useState<TodoShare[]>([]);
    const [loadingCollaborators, setLoadingCollaborators] = useState(true);

    useEffect(() => {
        if (isOpen) {
            loadCollaborators();
            setEmail("");
            setError(null);
            setSuccess(null);
        }
    }, [isOpen, todoId]);

    const loadCollaborators = async () => {
        setLoadingCollaborators(true);
        try {
            const data = await getCollaborators(todoId);
            setCollaborators(data);
        } catch (err) {
            console.error("Failed to load collaborators:", err);
        } finally {
            setLoadingCollaborators(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;

        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            await shareTodo(todoId, email.trim());
            setSuccess(`Task shared with ${email}`);
            setEmail("");
            loadCollaborators();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to share task");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemove = async (emailToRemove: string) => {
        try {
            await removeCollaborator(todoId, emailToRemove);
            loadCollaborators();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to remove collaborator");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative z-10 w-full max-w-md mx-4 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Share Task</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[280px]">{taskName}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-4 space-y-4">
                    {/* Share Form */}
                    <form onSubmit={handleSubmit} className="flex gap-2">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter email address"
                            className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <Button
                            type="submit"
                            disabled={isLoading || !email.trim()}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
                        >
                            {isLoading ? <LoadingSpinner className="w-4 h-4" /> : "Share"}
                        </Button>
                    </form>

                    {/* Messages */}
                    {error && (
                        <div className="p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="p-3 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            {success}
                        </div>
                    )}

                    {/* Collaborators List */}
                    <div>
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Shared with
                        </h3>
                        {loadingCollaborators ? (
                            <div className="text-sm text-gray-500">Loading...</div>
                        ) : collaborators.length === 0 ? (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                Not shared with anyone yet
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {collaborators.map((collab) => (
                                    <div
                                        key={collab.id}
                                        className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
                                    >
                                        <div className="flex items-center gap-2">
                                            <UserIcon className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                                {collab.shared_with_email}
                                            </span>
                                            {collab.shared_with_user_id && (
                                                <span className="text-xs text-green-600 dark:text-green-400">
                                                    (joined)
                                                </span>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleRemove(collab.shared_with_email)}
                                            className="p-1 text-gray-400 hover:text-red-500 rounded"
                                            title="Remove access"
                                        >
                                            <CloseIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function CloseIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    );
}

function UserIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    );
}

function LoadingSpinner(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`animate-spin ${props.className || ''}`}>
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
    );
}
