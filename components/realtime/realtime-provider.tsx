"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

interface RealtimeContextType {
    refreshTodos: () => void;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export function useRealtime() {
    const context = useContext(RealtimeContext);
    if (!context) {
        throw new Error("useRealtime must be used within a RealtimeProvider");
    }
    return context;
}

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    const refreshTodos = useCallback(() => {
        router.refresh();
    }, [router]);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        const supabase = createClient();

        // Subscribe to todos changes
        const todosChannel = supabase
            .channel('todos-realtime')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'todos'
                },
                () => {
                    // Refresh the page to get updated data
                    router.refresh();
                }
            )
            .subscribe();

        // Subscribe to todo_shares changes
        const sharesChannel = supabase
            .channel('shares-realtime')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'todo_shares'
                },
                () => {
                    // Refresh when shares change (task shared/unshared)
                    router.refresh();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(todosChannel);
            supabase.removeChannel(sharesChannel);
        };
    }, [mounted, router]);

    return (
        <RealtimeContext.Provider value={{ refreshTodos }}>
            {children}
        </RealtimeContext.Provider>
    );
}
