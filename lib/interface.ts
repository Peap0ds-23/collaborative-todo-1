export interface Todo {
  // UUID string id
  id: string;
  user_id: string;
  task: string;
  description?: string;
  due_date?: string;
  priority?: 'low' | 'medium' | 'high';
  is_complete: boolean;
  // Supabase returns timestamps as ISO strings; parse with `new Date(todo.inserted_at)` when needed
  inserted_at: string;
  // Sort order for drag-and-drop reordering
  sort_order?: number;
  // Added for shared tasks display
  owner_email?: string;
  is_shared?: boolean;
}

export interface TodoShare {
  id: string;
  todo_id: string;
  owner_id: string;
  shared_with_email: string;
  shared_with_user_id?: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'task_shared' | string;
  title: string;
  message: string;
  todo_id?: string;
  is_read: boolean;
  created_at: string;
}

export interface UserTaskOrder {
  id: string;
  user_id: string;
  todo_id: string;
  sort_order: number;
  created_at: string;
}

export interface TaskAuditLog {
  id: string;
  todo_id: string;
  action_type: 'created' | 'updated' | 'completed' | 'uncompleted' | 'collaborator_added' | 'collaborator_removed' | string;
  message: string;
  performed_by_user_id: string;
  performed_by_email?: string;
  created_at: string;
}
