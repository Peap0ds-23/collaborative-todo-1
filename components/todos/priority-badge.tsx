"use client";

import { cn } from "@/lib/utils";

type Priority = 'low' | 'medium' | 'high';

interface PriorityBadgeProps {
    priority: Priority | undefined;
    className?: string;
}

export default function PriorityBadge({ priority, className }: PriorityBadgeProps) {
    if (!priority) return null;

    const priorityConfig = {
        low: {
            label: 'Low',
            className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
        },
        medium: {
            label: 'Medium',
            className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        },
        high: {
            label: 'High',
            className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        },
    };

    const config = priorityConfig[priority];

    return (
        <span
            className={cn(
                "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                config.className,
                className
            )}
        >
            {config.label}
        </span>
    );
}
