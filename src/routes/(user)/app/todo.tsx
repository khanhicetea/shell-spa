import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, GripVertical } from "lucide-react";
import {
  DndContext,
  useDraggable,
  useDroppable,
  MouseSensor,
  TouchSensor,
  useSensors,
  useSensor,
} from "@dnd-kit/core";
import { orpc } from "@/lib/orpc";

export const Route = createFileRoute("/(user)/app/todo")({
  component: TodoPage,
});

function TodoCard({ todo, onRefetch }: { todo: any; onRefetch: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: todo.id,
    });

  const [isEditingContent, setIsEditingContent] = useState(false);
  const [editingContent, setEditingContent] = useState(todo.content);

  const updateMutation = useMutation(
    orpc.todoItem.updateTodo.mutationOptions({
      onSuccess: () => {
        onRefetch();
        setIsEditingContent(false);
      },
    }),
  );

  const deleteMutation = useMutation(
    orpc.todoItem.deleteTodo.mutationOptions({
      onSuccess: () => onRefetch(),
    }),
  );

  const handleToggleComplete = () => {
    updateMutation.mutate({
      id: todo.id,
      completedAt: todo.completedAt ? null : new Date(),
    });
  };

  const handleSaveContent = () => {
    if (editingContent.trim() && editingContent !== todo.content) {
      updateMutation.mutate({ id: todo.id, content: editingContent.trim() });
    } else {
      setIsEditingContent(false);
    }
  };

  const handleDelete = () => {
    deleteMutation.mutate({ id: todo.id });
  };

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`mb-2 hover:shadow-md transition-shadow duration-200 border-muted relative group ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <CardContent className="p-2">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={!!todo.completedAt}
            onCheckedChange={handleToggleComplete}
            disabled={updateMutation.isPending}
            className="h-4 w-4"
          />
          <div className="flex-1 min-w-0">
            {isEditingContent ? (
              <textarea
                value={editingContent}
                onChange={(e) => setEditingContent(e.target.value)}
                onBlur={handleSaveContent}
                onKeyDown={(e) =>
                  e.key === "Enter" && !e.shiftKey && handleSaveContent()
                }
                className="w-full text-sm leading-tight wrap-break-words resize-none border-none p-0 focus:ring-0 bg-transparent"
                rows={Math.max(1, editingContent.split("\n").length)}
                autoFocus
              />
            ) : (
              <p
                className={`text-sm leading-tight wrap-break-words cursor-pointer hover:bg-muted/50 px-1 rounded ${
                  todo.completedAt ? "line-through text-muted-foreground" : ""
                }`}
                onClick={() => {
                  setIsEditingContent(true);
                  setEditingContent(todo.content);
                }}
              >
                {todo.content}
              </p>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing transition-opacity"
          {...listeners}
          {...attributes}
        >
          <GripVertical className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          disabled={deleteMutation.isPending}
          className="absolute bottom-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-opacity"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
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

  const { setNodeRef, isOver } = useDroppable({
    id: category.id,
  });

  const createMutation = useMutation(
    orpc.todoItem.createTodo.mutationOptions({
      onSuccess: () => {
        onRefetch();
        setNewTodoContent("");
        setIsAdding(false);
      },
    }),
  );

  const deleteCategoryMutation = useMutation(
    orpc.todoCategory.deleteCategory.mutationOptions({
      onSuccess: () => onRefetch(),
    }),
  );

  const [isEditingName, setIsEditingName] = useState(false);
  const [editingName, setEditingName] = useState(category.name);

  const updateCategoryMutation = useMutation(
    orpc.todoCategory.updateCategory.mutationOptions({
      onSuccess: () => {
        onRefetch();
        setIsEditingName(false);
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

  const handleSaveName = () => {
    if (editingName.trim() && editingName !== category.name) {
      updateCategoryMutation.mutate({
        id: category.id,
        name: editingName.trim(),
      });
    } else {
      setIsEditingName(false);
    }
  };

  const handleDeleteCategory = () => {
    if (todos.length === 0) {
      deleteCategoryMutation.mutate({ id: category.id });
    }
  };

  return (
    <div className="shrink-0 w-64">
      <div
        ref={setNodeRef}
        className={`bg-muted/50 rounded-lg p-4 h-fit transition-colors ${
          isOver ? "bg-muted/70" : ""
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          {isEditingName ? (
            <Input
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              onBlur={handleSaveName}
              onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
              className="h-6 text-sm font-semibold border-none p-0 focus:ring-0"
              autoFocus
            />
          ) : (
            <span
              className="font-semibold text-sm cursor-pointer hover:bg-muted/50 px-1 rounded"
              onClick={() => {
                setIsEditingName(true);
                setEditingName(category.name);
              }}
            >
              {category.name}
            </span>
          )}
          {todos.length === 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteCategory}
              disabled={deleteCategoryMutation.isPending}
              className="h-6 w-6 p-0 opacity-60 hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
        <div className="space-y-2">
          {todos.map((todo) => (
            <TodoCard key={todo.id} todo={todo} onRefetch={onRefetch} />
          ))}
          {isOver && (
            <Card className="mb-2 border-2 border-dashed border-muted-foreground/50 bg-muted/20 h-16 flex items-center justify-center text-muted-foreground text-sm">
              Drop here
            </Card>
          )}
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

function AddCategoryColumn({
  newCategoryName,
  setNewCategoryName,
  onAdd,
  isPending,
}: {
  newCategoryName: string;
  setNewCategoryName: (name: string) => void;
  onAdd: () => void;
  isPending: boolean;
}) {
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = () => {
    onAdd();
    setIsAdding(false);
  };

  return (
    <div className="shrink-0 w-64">
      <div className="bg-muted/30 border-2 border-dashed border-muted-foreground/30 rounded-lg p-4 h-fit min-h-50 flex items-center justify-center">
        {isAdding ? (
          <div className="w-full space-y-2">
            <Input
              placeholder="Category name..."
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              className="h-8"
              autoFocus
            />
            <div className="flex gap-1">
              <Button size="sm" onClick={handleAdd} disabled={isPending}>
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
            onClick={() => setIsAdding(true)}
            className="w-full h-16 text-muted-foreground hover:text-foreground"
          >
            <div className="flex flex-col items-center gap-1">
              <div className="text-2xl">+</div>
              <div>Add Column</div>
            </div>
          </Button>
        )}
      </div>
    </div>
  );
}

function TodoPage() {
  const [newCategoryName, setNewCategoryName] = useState("");

  const { data: categories, refetch: refetchCategories } = useSuspenseQuery(
    orpc.todoCategory.listCategories.queryOptions(),
  );

  const { data: todos, refetch: refetchTodos } = useSuspenseQuery(
    orpc.todoItem.listTodos.queryOptions(),
  );

  const createCategoryMutation = useMutation(
    orpc.todoCategory.createCategory.mutationOptions({
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

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 8,
    },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 200,
      tolerance: 8,
    },
  });
  const sensors = useSensors(mouseSensor, touchSensor);

  const updateTodoMutation = useMutation(
    orpc.todoItem.updateTodo.mutationOptions({
      onSuccess: () => {
        refetchTodos();
      },
    }),
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (!over) return;

    const todoId = active.id;
    const newCategoryId = over.id;

    const todo = todos.find((t) => t.id === todoId);
    if (!todo || todo.categoryId === newCategoryId) return;

    updateTodoMutation.mutate({
      id: todoId,
      categoryId: newCategoryId,
    });
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-2xl font-bold">Todo Kanban Board</h1>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
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
          <AddCategoryColumn
            newCategoryName={newCategoryName}
            setNewCategoryName={setNewCategoryName}
            onAdd={handleAddCategory}
            isPending={createCategoryMutation.isPending}
          />
        </div>
      </DndContext>
    </div>
  );
}
