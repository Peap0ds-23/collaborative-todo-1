import { createClient } from "@/utils/supabase/server";
import SortableTodoList from "./sortable-todo-list";
import type { Todo } from "@/lib/interface";

export default async function Todos() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div>Please sign in to view your tasks.</div>;
  }

  // Fetch owned todos
  const { data: ownedTodos, error: ownedError } = await supabase
    .from("todos")
    .select("*")
    .eq("user_id", user.id)
    .order("inserted_at", { ascending: false });

  if (ownedError) {
    throw new Error(ownedError.message);
  }

  // Fetch shared todos via todo_shares
  const { data: sharedTodosData, error: sharedError } = await supabase
    .from("todo_shares")
    .select(`
      todo_id,
      todos!inner (
        id,
        user_id,
        task,
        description,
        due_date,
        priority,
        is_complete,
        inserted_at
      )
    `)
    .eq("shared_with_user_id", user.id);

  if (sharedError) {
    console.error("Error fetching shared todos:", sharedError);
  }

  // Fetch user's personal task order
  const { data: userOrderData } = await supabase
    .from("user_task_order")
    .select("todo_id, sort_order")
    .eq("user_id", user.id);

  // Create a map of todo_id -> sort_order for quick lookup
  const orderMap = new Map<string, number>();
  if (userOrderData) {
    for (const order of userOrderData) {
      orderMap.set(order.todo_id, order.sort_order);
    }
  }

  // Process shared todos - mark them as shared
  const sharedTodos: Todo[] = [];
  if (sharedTodosData) {
    for (const share of sharedTodosData) {
      const todoData = share.todos as any;
      if (todoData) {
        sharedTodos.push({
          ...todoData,
          is_shared: true,
          owner_email: "Shared with you",
        });
      }
    }
  }

  // Combine and deduplicate (in case user owns and is shared same task)
  const allTodos: Todo[] = [
    ...(ownedTodos || []).map(t => ({ ...t, is_shared: false })),
    ...sharedTodos.filter(st => !ownedTodos?.some(ot => ot.id === st.id)),
  ];

  // Apply user's personal sort order
  const sortedTodos = allTodos.sort((a, b) => {
    const aOrder = orderMap.get(a.id);
    const bOrder = orderMap.get(b.id);

    // If both have order, sort by order
    if (aOrder !== undefined && bOrder !== undefined) {
      return aOrder - bOrder;
    }
    // If only one has order, put the ordered one first
    if (aOrder !== undefined) return -1;
    if (bOrder !== undefined) return 1;
    // Otherwise sort by inserted_at (newest first)
    return new Date(b.inserted_at).getTime() - new Date(a.inserted_at).getTime();
  });

  const incompleteTodos = sortedTodos.filter((todo) => !todo.is_complete);
  const completeTodos = sortedTodos.filter((todo) => todo.is_complete);

  return (
    <SortableTodoList
      initialIncompleteTodos={incompleteTodos}
      initialCompleteTodos={completeTodos}
      currentUserId={user.id}
    />
  );
}

