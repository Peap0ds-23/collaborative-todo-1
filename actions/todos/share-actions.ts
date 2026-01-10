"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { createAuditLog } from "./audit-actions";

export async function shareTodo(todoId: string, email: string) {
    const supabase = createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Not authenticated");
    }

    // Verify the user owns this todo
    const { data: todo, error: todoError } = await supabase
        .from("todos")
        .select("id, user_id, task")
        .eq("id", todoId)
        .single();

    if (todoError || !todo) {
        throw new Error("Task not found");
    }

    if (todo.user_id !== user.id) {
        throw new Error("You can only share your own tasks");
    }

    // Prevent sharing with yourself
    if (email.toLowerCase() === user.email?.toLowerCase()) {
        throw new Error("You cannot share a task with yourself");
    }

    // Try to insert the share (unique constraint will prevent duplicates)
    const { error } = await supabase.from("todo_shares").insert({
        todo_id: todoId,
        owner_id: user.id,
        shared_with_email: email.toLowerCase(),
    });

    if (error) {
        if (error.code === "23505") {
            // Unique constraint violation
            throw new Error("This task is already shared with this user");
        }
        throw new Error(error.message);
    }

    // Create audit log for collaborator added
    await createAuditLog(todoId, 'collaborator_added', `Added collaborator: ${email.toLowerCase()}`);

    revalidatePath("/");
    return { success: true };
}

export async function getCollaborators(todoId: string) {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("todo_shares")
        .select("*")
        .eq("todo_id", todoId);

    if (error) {
        throw new Error(error.message);
    }

    return data || [];
}

export async function removeCollaborator(todoId: string, email: string) {
    const supabase = createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Not authenticated");
    }

    // Get the task title for the notification
    const { data: todoData } = await supabase
        .from("todos")
        .select("task")
        .eq("id", todoId)
        .single();

    // Get the share record to find the user ID of the collaborator
    const { data: shareData } = await supabase
        .from("todo_shares")
        .select("shared_with_user_id")
        .eq("todo_id", todoId)
        .eq("shared_with_email", email.toLowerCase())
        .single();

    // Create notification for the removed user (if they have a user account)
    if (shareData?.shared_with_user_id) {
        await supabase.from("notifications").insert({
            user_id: shareData.shared_with_user_id,
            type: "collaborator_removed",
            title: "Access Removed",
            message: `You have been removed from "${todoData?.task || 'a task'}"`,
            todo_id: todoId,
            is_read: false,
        });
    }

    // Delete the share
    const { error } = await supabase
        .from("todo_shares")
        .delete()
        .eq("todo_id", todoId)
        .eq("shared_with_email", email.toLowerCase())
        .eq("owner_id", user.id);

    if (error) {
        throw new Error(error.message);
    }

    // Create audit log for collaborator removed
    await createAuditLog(todoId, 'collaborator_removed', `Removed collaborator: ${email.toLowerCase()}`);

    revalidatePath("/");
    return { success: true };
}
