"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { Todo } from "@/lib/interface";
import { createAuditLog } from "./audit-actions";

export async function addTodo(formData: FormData) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const task = formData.get("task") as string;
  const description = formData.get("description") as string | null;
  const dueDateLocal = formData.get("due_date") as string | null;
  const priority = formData.get("priority") as 'low' | 'medium' | 'high' | null;

  // Convert local datetime to UTC ISO string for consistent storage
  let dueDate: string | null = null;
  if (dueDateLocal) {
    // datetime-local input gives us "YYYY-MM-DDTHH:MM" in local time
    // Create a Date object (interpreted as local time) and convert to ISO UTC
    const localDate = new Date(dueDateLocal);
    dueDate = localDate.toISOString();
  }

  const { data, error } = await supabase
    .from("todos")
    .insert([
      {
        user_id: user?.id,
        task,
        description: description || null,
        due_date: dueDate,
        priority: priority || 'medium',
        is_complete: false,
        inserted_at: new Date().toISOString(),
      },
    ])
    .select();

  if (error) {
    throw new Error(error.message);
  }

  // Create audit log for task creation
  if (data && data[0]) {
    await createAuditLog(data[0].id, 'created', `Task created: "${task}"`);
  }

  revalidatePath("/");
}

export async function editTodo(todo: Todo) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  // RLS policy handles permission check - allows both owners and collaborators
  const { error } = await supabase
    .from("todos")
    .update({
      task: todo.task,
      description: todo.description,
      due_date: todo.due_date,
      priority: todo.priority,
    })
    .eq("id", todo.id)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  // Create audit log for task update
  await createAuditLog(todo.id, 'updated', `Task updated: "${todo.task}"`);

  revalidatePath("/");
}

export async function deleteTodo(id: string) {
  const supabase = createClient();

  const { error } = await supabase.from("todos").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
}

export async function deleteCompletedTodos() {
  const supabase = createClient();

  const { error } = await supabase
    .from("todos")
    .delete()
    .eq("is_complete", true);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
}

export async function deleteAllTodos() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("todos")
    .delete()
    .eq("user_id", user?.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
}

export async function onCheckChange(todo: Todo) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  // RLS policy handles permission check - allows both owners and collaborators
  const newIsComplete = !todo?.is_complete;
  const { error } = await supabase
    .from("todos")
    .update({ is_complete: newIsComplete })
    .eq("id", todo?.id)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  // Create audit log for completion change
  const actionType = newIsComplete ? 'completed' : 'uncompleted';
  const message = newIsComplete
    ? `Marked task as completed: "${todo.task}"`
    : `Marked task as incomplete: "${todo.task}"`;
  await createAuditLog(todo.id, actionType, message);

  revalidatePath("/");
}

// Update task order after drag-and-drop reordering (per-user)
export async function updateTaskOrder(orderedTodoIds: string[]) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  // Upsert each todo's sort_order for this user in user_task_order table
  const updates = orderedTodoIds.map((todoId, index) => ({
    user_id: user.id,
    todo_id: todoId,
    sort_order: index,
  }));

  // Perform batch upsert to user_task_order table
  for (const update of updates) {
    const { error } = await supabase
      .from("user_task_order")
      .upsert(
        {
          user_id: update.user_id,
          todo_id: update.todo_id,
          sort_order: update.sort_order,
        },
        { onConflict: "user_id,todo_id" }
      );

    if (error) {
      console.error(`Error updating task order for ${update.todo_id}:`, error);
    }
  }

  // Don't revalidatePath here - order is user-specific and shouldn't trigger realtime sync
}
