import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { orpc } from "@/lib/orpc";

export const Route = createFileRoute("/(user)/app/todo")({
  component: TodoPage,
});

function TodoCard({ todo, onRefetch }: { todo: any; onRefetch: () => void }) {
  const updateMutation = useMutation(
    orpc.todo.updateTodo.mutationOptions({
      onSuccess: () => onRefetch(),
    }),
  );

  const deleteMutation = useMutation(
    orpc.todo.deleteTodo.mutationOptions({
      onSuccess: () => onRefetch(),
    }),
  );

  const handleToggleComplete = () => {
    updateMutation.mutate({
      id: todo.id,
      completedAt: todo.completedAt ? null : new Date(),
    });
  };

  const handleDelete = () => {
    deleteMutation.mutate({ id: todo.id });
  };

  return (
    <Card className="mb-2 hover:shadow-md transition-shadow duration-200 border-muted">
      <CardContent className="p-2">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={!!todo.completedAt}
            onCheckedChange={handleToggleComplete}
            disabled={updateMutation.isPending}
            className="h-4 w-4"
          />
          <div className="flex-1 min-w-0">
            <p
              className={`text-sm leading-tight break-words ${
                todo.completedAt ? "line-through text-muted-foreground" : ""
              }`}
            >
              {todo.content}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="h-6 w-6 p-0 opacity-60 hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function CategoryColumn({
  category,
  todos,
  onRefetch,
}: {
  category: any;
  todos: any[];
  onRefetch: () => void;
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTodoContent, setNewTodoContent] = useState("");

  const createMutation = useMutation(
    orpc.todo.createTodo.mutationOptions({
      onSuccess: () => {
        onRefetch();
        setNewTodoContent("");
        setIsAdding(false);
      },
    }),
  );

  const handleAddTodo = () => {
    if (newTodoContent.trim()) {
      createMutation.mutate({
        content: newTodoContent.trim(),
        categoryId: category.id,
      });
    }
  };

  return (
    <div className="flex-shrink-0 w-64">
      <div className="bg-muted/50 rounded-lg p-4 h-fit">
        <h3 className="font-semibold text-sm mb-3">{category.name}</h3>
        <div className="space-y-2">
          {todos.map((todo) => (
            <TodoCard key={todo.id} todo={todo} onRefetch={onRefetch} />
          ))}
        </div>
        {isAdding ? (
          <div className="mt-2 space-y-2">
            <Input
              placeholder="Add a todo..."
              value={newTodoContent}
              onChange={(e) => setNewTodoContent(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddTodo()}
              className="h-8"
              autoFocus
            />
            <div className="flex gap-1">
              <Button
                size="sm"
                onClick={handleAddTodo}
                disabled={createMutation.isPending}
              >
                Add
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsAdding(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAdding(true)}
            className="w-full mt-2 h-8"
          >
            + Add Todo
          </Button>
        )}
      </div>
    </div>
  );
}

function TodoPage() {
  const [newCategoryName, setNewCategoryName] = useState("");

  const { data: categories, refetch: refetchCategories } = useSuspenseQuery(
    orpc.category.listCategories.queryOptions(),
  );

  const { data: todos, refetch: refetchTodos } = useSuspenseQuery(
    orpc.todo.listTodos.queryOptions(),
  );

  const createCategoryMutation = useMutation(
    orpc.category.createCategory.mutationOptions({
      onSuccess: () => {
        refetchCategories();
        setNewCategoryName("");
      },
    }),
  );

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      createCategoryMutation.mutate({ name: newCategoryName.trim() });
    }
  };

  const groupedTodos = todos.reduce(
    (acc, todo) => {
      if (!acc[todo.categoryId]) acc[todo.categoryId] = [];
      acc[todo.categoryId].push(todo);
      return acc;
    },
    {} as Record<string, any[]>,
  );

  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-2xl font-bold">Kanban Board</h1>

      <div className="flex gap-2">
        <Input
          placeholder="Add a new category..."
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
          className="max-w-xs"
        />
        <Button
          onClick={handleAddCategory}
          disabled={createCategoryMutation.isPending}
        >
          Add Category
        </Button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {categories.map((category) => (
          <CategoryColumn
            key={category.id}
            category={category}
            todos={groupedTodos[category.id] || []}
            onRefetch={() => {
              refetchTodos();
              refetchCategories();
            }}
          />
        ))}
        {categories.length === 0 && (
          <p className="text-center text-muted-foreground">
            No categories yet. Add one above.
          </p>
        )}
      </div>
    </div>
  );
}
