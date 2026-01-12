"use client";

import { useState, useEffect } from "react";
import { getTaskAuditLogs } from "@/actions/todos/audit-actions";
import type { TaskAuditLog } from "@/lib/interface";
import {
    CloseIcon,
    HistoryIcon,
    LoadingSpinner,
    PlusIcon,
    EditIcon,
    CheckIcon,
    UndoIcon,
    UserPlusIcon,
    UserMinusIcon,
    ClockIcon
} from "@/components/icons";

interface TaskHistoryModalProps {
    todoId: string;
    taskName: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function TaskHistoryModal({ todoId, taskName, isOpen, onClose }: TaskHistoryModalProps) {
    const [logs, setLogs] = useState<TaskAuditLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            loadLogs();
        }
    }, [isOpen, todoId]);

    const loadLogs = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getTaskAuditLogs(todoId);
            setLogs(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load history");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getActionIcon = (actionType: string) => {
        switch (actionType) {
            case 'created':
                return <PlusIcon className="w-4 h-4 text-green-500" />;
            case 'updated':
                return <EditIcon className="w-4 h-4 text-blue-500" />;
            case 'completed':
                return <CheckIcon className="w-4 h-4 text-green-500" />;
            case 'uncompleted':
                return <UndoIcon className="w-4 h-4 text-orange-500" />;
            case 'collaborator_added':
                return <UserPlusIcon className="w-4 h-4 text-purple-500" />;
            case 'collaborator_removed':
                return <UserMinusIcon className="w-4 h-4 text-red-500" />;
            default:
                return <ClockIcon className="w-4 h-4 text-gray-500" />;
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative z-10 w-full max-w-lg mx-4 max-h-[80vh] flex flex-col bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <HistoryIcon className="w-5 h-5" />
                            Task History
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[300px]">{taskName}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <LoadingSpinner className="w-6 h-6 text-gray-400" />
                            <span className="ml-2 text-gray-500">Loading history...</span>
                        </div>
                    ) : error ? (
                        <div className="p-4 text-center text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg">
                            {error}
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                            <HistoryIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>No history available yet</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {logs.map((log) => (
                                <div
                                    key={log.id}
                                    className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                                >
                                    <div className="shrink-0 mt-0.5">
                                        {getActionIcon(log.action_type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-gray-900 dark:text-white">
                                            {log.message}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                            <span className="font-medium">
                                                {log.performed_by_email || 'Unknown user'}
                                            </span>
                                            <span>•</span>
                                            <span>{formatTimestamp(log.created_at)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
