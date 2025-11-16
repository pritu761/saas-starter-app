import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

interface Todo {
  id: string
  title: string
  completed: boolean
  userId: string
  createdAt: Date
  updatedAt: Date
}

interface TodoItemProps {
  todo: Todo
  onUpdate: (id: string, completed: boolean) => void
  onDelete: (id: string) => void
}

export function TodoItem({ todo, onUpdate, onDelete }: TodoItemProps) {
  return (
    <li className="flex items-center gap-3 p-3 bg-muted rounded-lg">
      <Checkbox
        checked={todo.completed}
        onCheckedChange={(checked: boolean) => onUpdate(todo.id, checked)}
      />
      <span
        className={`flex-1 ${
          todo.completed ? "line-through text-muted-foreground" : ""
        }`}
      >
        {todo.title}
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onDelete(todo.id)}
        className="text-destructive hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </li>
  )
}
