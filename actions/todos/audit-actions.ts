"use server";

import { createClient } from "@/utils/supabase/server";
import type { TaskAuditLog } from "@/lib/interface";

// Create a new audit log entry
export async function createAuditLog(
    todoId: string,
    actionType: string,
    message: string
) {
    const supabase = createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        console.error("Cannot create audit log: user not authenticated");
        return;
    }

    const { error } = await supabase.from("task_audit_logs").insert({
        todo_id: todoId,
        action_type: actionType,
        message: message,
        performed_by_user_id: user.id,
        performed_by_email: user.email,
    });

    if (error) {
        console.error("Failed to create audit log:", error);
    }
}

// Get all audit logs for a task
export async function getTaskAuditLogs(todoId: string): Promise<TaskAuditLog[]> {
    const supabase = createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Not authenticated");
    }

    const { data, error } = await supabase
        .from("task_audit_logs")
        .select("*")
        .eq("todo_id", todoId)
        .order("created_at", { ascending: false });

    if (error) {
        throw new Error(error.message);
    }

    return data || [];
}
