"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { onCheckChange } from "@/actions/todos/actions";
import type { Todo } from "@/lib/interface";

interface TodoCheckboxProps {
  todo: Todo;
  onToggleComplete?: (todo: Todo) => void;
}

export default function TodoCheckbox({ todo, onToggleComplete }: TodoCheckboxProps) {
  const handleChange = () => {
    if (onToggleComplete) {
      // Use callback for optimistic updates (managed by parent)
      onToggleComplete(todo);
    } else {
      // Fallback to direct server action
      onCheckChange(todo);
    }
  };

  return (
    <Checkbox
      className="mt-0.5 w-5 h-5"
      id={todo?.id as unknown as string}
      checked={todo?.is_complete}
      onCheckedChange={handleChange}
    />
  );
}
