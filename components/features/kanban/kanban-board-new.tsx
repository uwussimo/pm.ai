"use client";

import React, { useMemo, useRef } from "react";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  KanbanProvider,
  KanbanBoard,
  KanbanHeader,
  KanbanCards,
  KanbanCard,
} from "@/components/ui/shadcn-io/kanban";
import { Button } from "@/components/ui/button";
import {
  Plus,
  User,
  CalendarIcon,
  MessageSquare,
  Trash2,
  MoreVertical,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Minus,
  Pencil,
  Edit,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { UserAvatar, getUserDisplayName } from "@/components/ui/user-avatar";
import { useUpdateTask, useCreateTask } from "@/lib/hooks/use-tasks";

interface KanbanTask {
  id: string;
  title: string;
  description: string | null;
  statusId: string;
  priority: string;
  order: number;
  assignee: {
    id: string;
    email: string;
    name?: string | null;
    githubUrl?: string | null;
  } | null;
  dueDate: string | null;
  _count: { comments: number };
}

interface Column {
  id: string;
  name: string;
  unicode: string;
  color: string;
  tasks: KanbanTask[];
}

interface User {
  id: string;
  email: string;
  name?: string | null;
  githubUrl?: string | null;
}

interface KanbanBoardProps {
  columns: Column[];
  projectUsers: User[];
  projectId: string;
  onTaskMove: (taskId: string, newStatusId: string, newOrder?: number) => void;
  onTaskClick: (taskId: string) => void;
  onAddStatus?: () => void;
  onEditStatus?: (statusId: string) => void;
}

// Transform our data structure to match shadcn kanban API
type KanbanItemData = KanbanTask & {
  name: string; // required by shadcn
  column: string; // required by shadcn
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any; // Allow additional properties
};

type KanbanColumnData = Column & {
  name: string; // required by shadcn
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any; // Allow additional properties
};

export function KanbanBoardNew({
  columns,
  projectUsers,
  projectId,
  onTaskMove,
  onTaskClick,
  onAddStatus,
  onEditStatus,
}: KanbanBoardProps) {
  // Transform columns and tasks to shadcn format
  const kanbanColumns: KanbanColumnData[] = useMemo(
    () =>
      columns.map((col) => ({
        ...col,
        name: col.name,
      })),
    [columns],
  );

  const kanbanData: KanbanItemData[] = useMemo(() => {
    const allTasks: KanbanItemData[] = [];
    columns.forEach((col) => {
      col.tasks.forEach((task) => {
        allTasks.push({
          ...task,
          name: task.title,
          column: task.statusId,
        });
      });
    });
    return allTasks.sort((a, b) => a.order - b.order);
  }, [columns]);

  const handleDataChange = () => {
    // This is called during drag operations
    // We'll handle the actual update in onDragEnd
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const activeTask = kanbanData.find((item) => item.id === active.id);
    const overTask = kanbanData.find((item) => item.id === over.id);

    if (!activeTask) return;

    // Determine the target column
    let targetStatusId = activeTask.statusId;
    let newOrder = activeTask.order;

    // Check if dropped on another task
    if (overTask) {
      targetStatusId = overTask.statusId;
      newOrder = overTask.order;
    } else {
      // Dropped on a column (board)
      const overColumn = kanbanColumns.find((col) => col.id === over.id);
      if (overColumn) {
        targetStatusId = overColumn.id;
        // Find the max order in this column and add 1
        const tasksInColumn = kanbanData.filter(
          (t) => t.statusId === overColumn.id,
        );
        newOrder =
          tasksInColumn.length > 0
            ? Math.max(...tasksInColumn.map((t) => t.order)) + 1
            : 0;
      }
    }

    // Call the parent handler
    onTaskMove(activeTask.id, targetStatusId, newOrder);
  };

  return (
    <div className="flex h-full overflow-x-auto gap-4 p-4">
      <KanbanProvider
        columns={kanbanColumns}
        data={kanbanData}
        onDataChange={handleDataChange}
        onDragEnd={handleDragEnd}
        className="flex gap-4 flex-shrink-0"
      >
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {(column: any) => (
          <KanbanBoard
            key={column.id}
            id={column.id}
            className="w-[320px] flex-shrink-0 h-fit"
          >
            <ColumnHeader
              column={column as KanbanColumnData}
              onEdit={() => onEditStatus?.(column.id)}
            />
            <KanbanCards id={column.id}>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(task: any) => (
                <TaskCard
                  key={task.id}
                  task={task as KanbanItemData}
                  projectUsers={projectUsers}
                  projectId={projectId}
                  onClick={() => onTaskClick(task.id)}
                />
              )}
            </KanbanCards>
            <AddTaskButton columnId={column.id} projectId={projectId} />
          </KanbanBoard>
        )}
      </KanbanProvider>

      {/* Add Status Button */}
      {onAddStatus && (
        <div className="flex-shrink-0 w-[320px]">
          <Button
            variant="outline"
            className="w-full h-12 text-sm font-medium"
            onClick={onAddStatus}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Status
          </Button>
        </div>
      )}
    </div>
  );
}

// Column Header Component
function ColumnHeader({
  column,
  onEdit,
}: {
  column: KanbanColumnData;
  onEdit: () => void;
}) {
  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/statuses/${column.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete status");
      }

      window.location.reload();
    } catch (error) {
      console.error("Error deleting status:", error);
    }
  };

  return (
    <KanbanHeader className="flex items-center justify-between gap-2 bg-muted/50">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span
          className="flex-shrink-0 w-2 h-2 rounded-full"
          style={{ backgroundColor: column.color }}
        />
        <span className="truncate font-semibold">
          {column.unicode} {column.name}
        </span>
        <span className="text-muted-foreground ml-auto">
          {column.tasks?.length || 0}
        </span>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 flex-shrink-0"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={onEdit}
            className="text-foreground focus:text-foreground"
          >
            <Pencil className="h-4 w-4 mr-2" />
            Edit status
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleDelete}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete status
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </KanbanHeader>
  );
}

// Task Card Component
function TaskCard({
  task,
  projectUsers,
  projectId,
  onClick,
}: {
  task: KanbanItemData;
  projectUsers: User[];
  projectId: string;
  onClick: () => void;
}) {
  const updateTask = useUpdateTask(task.id, projectId);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const handleAssigneeChange = (userId: string) => {
    updateTask.mutate({
      assigneeId: userId === "unassigned" ? "" : userId,
    });
  };

  const handleDueDateChange = (dateString: string) => {
    if (!dateString) {
      updateTask.mutate({
        dueDate: "",
      });
      return;
    }

    const date = new Date(dateString);
    date.setHours(23, 59, 59, 999);
    updateTask.mutate({
      dueDate: date.toISOString(),
    });
  };

  const handleDateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (dateInputRef.current) {
      dateInputRef.current.showPicker();
    }
  };

  const handlePriorityChange = (priority: string) => {
    updateTask.mutate(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { priority } as any,
    );
  };

  const getPriorityIcon = () => {
    switch (task.priority) {
      case "high":
        return <ArrowUp className="h-3 w-3" />;
      case "low":
        return <ArrowDown className="h-3 w-3" />;
      default:
        return <Minus className="h-3 w-3" />;
    }
  };

  const getPriorityColor = () => {
    switch (task.priority) {
      case "high":
        return "text-red-400 bg-red-500/10 hover:bg-red-500/20";
      case "low":
        return "text-blue-400 bg-blue-500/10 hover:bg-blue-500/20";
      default:
        return "text-gray-400 bg-gray-500/10 hover:bg-gray-500/20";
    }
  };

  const isOverdue =
    task.dueDate && new Date(task.dueDate) < new Date() ? true : false;

  return (
    <KanbanCard id={task.id} name={task.name} column={task.column}>
      <div className="space-y-3">
        {/* Title with Edit Icon */}
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-medium text-sm leading-tight line-clamp-2 flex-1">
            {task.title}
          </h4>
          <button
            onClick={onClick}
            className="flex-shrink-0 p-1 hover:bg-muted rounded transition-colors"
            title="View task details"
          >
            <Edit className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Priority */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                className={cn(
                  "inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors",
                  getPriorityColor(),
                )}
              >
                {getPriorityIcon()}
                <span className="capitalize">{task.priority}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              onClick={(e) => e.stopPropagation()}
            >
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  handlePriorityChange("high");
                }}
              >
                <ArrowUp className="h-4 w-4 mr-2 text-red-400" />
                High
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  handlePriorityChange("medium");
                }}
              >
                <Minus className="h-4 w-4 mr-2 text-gray-600" />
                Medium
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  handlePriorityChange("low");
                }}
              >
                <ArrowDown className="h-4 w-4 mr-2 text-blue-600" />
                Low
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Due Date */}
          <div className="inline-block">
            <input
              ref={dateInputRef}
              type="date"
              value={task.dueDate ? task.dueDate.split("T")[0] : ""}
              onChange={(e) => {
                e.stopPropagation();
                handleDueDateChange(e.target.value);
              }}
              onClick={(e) => e.stopPropagation()}
              className="sr-only"
            />
            <button
              type="button"
              onClick={handleDateClick}
              onPointerDown={(e) => e.stopPropagation()}
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[13px] font-medium transition-colors cursor-pointer",
                task.dueDate
                  ? isOverdue
                    ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                    : "bg-primary/10 text-primary hover:bg-primary/20"
                  : "bg-muted text-muted-foreground hover:bg-muted/80",
              )}
            >
              {isOverdue && <AlertCircle className="h-3.5 w-3.5" />}
              <CalendarIcon className="h-3.5 w-3.5" />
              <span className="text-xs">
                {task.dueDate
                  ? new Date(task.dueDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  : "No date"}
              </span>
            </button>
          </div>

          {/* Comments count */}
          {task._count.comments > 0 && (
            <div className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <MessageSquare className="h-3 w-3" />
              <span>{task._count.comments}</span>
            </div>
          )}
        </div>

        {/* Assignee */}
        <div className="flex items-center gap-2 pt-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                {task.assignee ? (
                  <>
                    <UserAvatar user={task.assignee} size="sm" />
                    <span className="text-xs font-medium truncate max-w-[120px]">
                      {getUserDisplayName(task.assignee)}
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-3 w-3 text-muted-foreground" />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Unassigned
                    </span>
                  </>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              onClick={(e) => e.stopPropagation()}
            >
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  handleAssigneeChange("unassigned");
                }}
              >
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center mr-2">
                  <User className="h-3 w-3 text-muted-foreground" />
                </div>
                Unassigned
              </DropdownMenuItem>
              {projectUsers.map((user) => (
                <DropdownMenuItem
                  key={user.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAssigneeChange(user.id);
                  }}
                >
                  <UserAvatar user={user} size="sm" className="mr-2" />
                  {getUserDisplayName(user)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </KanbanCard>
  );
}

// Add Task Button Component
function AddTaskButton({
  columnId,
  projectId,
}: {
  columnId: string;
  projectId: string;
}) {
  const [isAdding, setIsAdding] = React.useState(false);
  const [newTaskTitle, setNewTaskTitle] = React.useState("");
  const createTask = useCreateTask(projectId);

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;

    try {
      await createTask.mutateAsync({
        title: newTaskTitle,
        statusId: columnId,
      });
      setNewTaskTitle("");
      setIsAdding(false);
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddTask();
    } else if (e.key === "Escape") {
      setIsAdding(false);
      setNewTaskTitle("");
    }
  };

  if (isAdding) {
    return (
      <div className="p-2">
        <Input
          autoFocus
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleAddTask}
          placeholder="Enter task title..."
          className="text-sm"
        />
      </div>
    );
  }

  return (
    <div className="p-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsAdding(true)}
        className="w-full justify-start text-muted-foreground hover:text-foreground"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add task
      </Button>
    </div>
  );
}
