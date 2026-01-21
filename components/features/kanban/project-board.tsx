"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Settings,
  Share2,
  Search,
  Plus,
  X,
  LayoutGrid,
  LayoutList,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { KanbanBoardNew } from "@/components/features/kanban/kanban-board-new";
import { TaskGridView } from "@/components/features/kanban/task-grid-view";
import { getUserDisplayName } from "@/components/ui/user-avatar";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useProject } from "@/lib/hooks/use-projects";
import { useMoveTask } from "@/lib/hooks/use-tasks";
import { useModal } from "@/lib/hooks/use-modal";
import {
  usePresence,
  useCursors,
  useRealtimeUpdates,
} from "@/lib/hooks/use-realtime";
import { useAuth } from "@/lib/hooks/use-auth";
import { PresenceAvatars } from "@/components/features/collaboration/presence-avatars";
import { CursorCanvas } from "@/components/features/collaboration/cursor-canvas";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface ProjectBoardProps {
  projectId: string;
}

export function ProjectBoard({ projectId }: ProjectBoardProps) {
  const router = useRouter();
  const { data: project, isLoading } = useProject(projectId);
  const moveTask = useMoveTask(projectId);
  const modal = useModal();
  const queryClient = useQueryClient();

  // Load user properly
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterAssignee, setFilterAssignee] = useState<string>("all");
  const [filterDueDate, setFilterDueDate] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"kanban" | "grid">("kanban");

  // Real-time collaboration
  const { members, channel } = usePresence(projectId, user?.id || "");
  const { cursors, broadcastCursor } = useCursors(channel, user?.id || "");
  const throttleRef = useRef<NodeJS.Timeout | null>(null);

  // Handle real-time task updates from other users
  const handleRealtimeUpdate = useCallback(() => {
    // Invalidate queries to refetch data
    queryClient.invalidateQueries({ queryKey: ["projects", projectId] });
  },
    [queryClient, projectId]
  );

  useRealtimeUpdates(projectId, handleRealtimeUpdate);

  // Broadcast cursor position - Figma-style (smoother, less throttling)
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!user || !channel) return;

      if (throttleRef.current) {
        clearTimeout(throttleRef.current);
      }

      throttleRef.current = setTimeout(() => {
        const userName = ("name" in user && user.name) || user.email.split("@")[0];
        broadcastCursor(e.clientX, e.clientY, userName);
      }, 16);
    },
    [user, channel, broadcastCursor]
  );

  useEffect(() => {
    if (user && channel) {
      window.addEventListener("mousemove", handleMouseMove);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        if (throttleRef.current) {
          clearTimeout(throttleRef.current);
        }
      };
    }
  }, [handleMouseMove, user, channel]);

  // Refined color palette matching presence avatars
  const getUserColor = (userId: string): string => {
    const colors = [
      "#0EA5E9", // sky blue
      "#8B5CF6", // violet
      "#EC4899", // pink
      "#F59E0B", // amber
      "#10B981", // emerald
      "#6366F1", // indigo
      "#14B8A6", // teal
      "#F97316", // orange
    ];

    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-3">
          <p className="text-muted-foreground">Project not found</p>
          <Button onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const filteredTasks = project.tasks.filter((task) => {
    // Search filter
    if (
      searchQuery &&
      !task.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !task.description
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) &&
      !task.assignee?.email
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // Assignee filter
    if (filterAssignee !== "all") {
      if (filterAssignee === "unassigned" && task.assignee) return false;
      if (
        filterAssignee !== "unassigned" &&
        task.assigneeId !== filterAssignee
      )
        return false;
    }

    // Due date filter
    if (filterDueDate !== "all") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dueDate = task.dueDate
        ? (() => {
          try {
            const dateStr = task.dueDate.split("T")[0];
            return new Date(dateStr + "T00:00:00");
          } catch {
            return null;
          }
        })()
        : null;

      if (filterDueDate === "no-date" && dueDate) return false;
      if (filterDueDate === "overdue" && (!dueDate || dueDate >= today))
        return false;
      if (filterDueDate === "today") {
        if (!dueDate) return false;
        const dueDateOnly = new Date(dueDate);
        dueDateOnly.setHours(0, 0, 0, 0);
        if (dueDateOnly.getTime() !== today.getTime()) return false;
      }
      if (filterDueDate === "week") {
        if (!dueDate) return false;
        const weekFromNow = new Date(today);
        weekFromNow.setDate(weekFromNow.getDate() + 7);
        if (dueDate < today || dueDate > weekFromNow) return false;
      }
    }

    return true;
  });

  const columns = project.statuses.map((status) => ({
    id: status.id,
    name: status.name,
    unicode: status.unicode,
    color: status.color,
    tasks: filteredTasks
      .filter((task) => task.statusId === status.id)
      .sort((a, b) => a.order - b.order), // Sort by order field
  }));

  const handleTaskMove = (
    taskId: string,
    newStatusId: string,
    newOrder?: number
  ) => {
    console.log("🔄 Moving task:", taskId, "to status:", newStatusId, "order:", newOrder);

    // If newOrder is provided, use the reordering logic
    if (newOrder !== undefined) {
      handleTaskReorder(taskId, newOrder, newStatusId);
    } else {
      // Just move to the status without reordering
      moveTask.mutate({ taskId, statusId: newStatusId });
    }
  };

  const handleTaskUpdate = async (taskId: string, updates: Record<string, unknown>) => {
    console.log("🔄 Updating task:", taskId, updates);
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error("Failed to update task");
      }

      await response.json();

      // Invalidate queries to refresh UI
      await queryClient.invalidateQueries({ queryKey: ["projects", projectId] });

      // Broadcast the update to other users
      const { broadcastTaskEvent } = await import("@/lib/hooks/use-realtime");
      await broadcastTaskEvent(projectId, "task-updated", { taskId });

      console.log("✅ Task updated successfully:", taskId);
    } catch (error) {
      console.error("❌ Failed to update task:", error);
      toast.error("Failed to update task");
    }
  };

  const handleTaskReorder = async (
    taskId: string,
    newOrder: number,
    statusId: string
  ) => {
    console.log("🔄 Reordering task:", taskId, "to order:", newOrder, "in status:", statusId);

    // Find the task being moved
    const task = filteredTasks.find((t) => t.id === taskId);
    if (!task) return;

    const oldOrder = task.order;
    const oldStatusId = task.statusId;

    // Get all tasks in the target status
    const tasksInStatus = filteredTasks
      .filter((t) => t.statusId === statusId)
      .sort((a, b) => a.order - b.order);

    // If moving within same status
    if (oldStatusId === statusId) {
      // Update orders for all affected tasks
      const updates: Array<{ id: string; order: number }> = [];

      if (newOrder < oldOrder) {
        // Moving up - shift tasks down between newOrder and oldOrder
        tasksInStatus.forEach((t) => {
          if (t.id === taskId) {
            updates.push({ id: t.id, order: newOrder });
          } else if (t.order >= newOrder && t.order < oldOrder) {
            updates.push({ id: t.id, order: t.order + 1 });
          }
        });
      } else if (newOrder > oldOrder) {
        // Moving down - shift tasks up between oldOrder and newOrder
        tasksInStatus.forEach((t) => {
          if (t.id === taskId) {
            updates.push({ id: t.id, order: newOrder });
          } else if (t.order > oldOrder && t.order <= newOrder) {
            updates.push({ id: t.id, order: t.order - 1 });
          }
        });
      }

      // Apply all updates
      for (const { id, order } of updates) {
        await handleTaskUpdate(id, { order });
      }
    } else {
      // Moving to different status - update the task's status and order
      await handleTaskUpdate(taskId, { order: newOrder, statusId });
      toast.success("Task moved");
    }
  };

  const handleTaskClick = (taskId: string) => {
    modal.openTaskView({
      projectId,
      taskId,
      projectUsers: project.users,
      statuses: project.statuses.map((s) => ({
        id: s.id,
        name: s.name,
        color: s.color,
        unicode: s.unicode,
      })),
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="container mx-auto px-6 py-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/dashboard">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 hover:bg-muted"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div className="h-8 w-px bg-border" />
              <div>
                <h1 className="text-lg font-bold tracking-tight flex items-center gap-2">
                  {project.name}
                  <Badge variant="outline" className="text-xs font-normal">
                    {project.tasks.length}{" "}
                    {project.tasks.length === 1 ? "task" : "tasks"}
                  </Badge>
                </h1>
                {project.description && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                    {project.description}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              {/* Presence Avatars */}
              {members.length > 0 && (
                <>
                  <PresenceAvatars members={members} />
                  <div className="h-4 w-px bg-border/60" />
                </>
              )}
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-2"
                onClick={() => modal.openShareProject({ projectId })}
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-2"
                onClick={() => modal.openCreateStatus({ projectId })}
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Status</span>
              </Button>
              <ToggleGroup
                type="single"
                value={viewMode}
                onValueChange={(value) => {
                  if (value) setViewMode(value as "kanban" | "grid");
                }}
                className="border rounded-md"
              >
                <ToggleGroupItem
                  value="kanban"
                  aria-label="Kanban view"
                  className="h-9"
                >
                  <LayoutList className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="grid"
                  aria-label="Grid view"
                  className="h-9"
                >
                  <LayoutGrid className="h-4 w-4" />
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-6">
        {/* Search and Filters */}
        <div className="mb-6 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder="Search tasks by title, description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>

            {/* Assignee Filter */}
            <Select value={filterAssignee} onValueChange={setFilterAssignee}>
              <SelectTrigger className="w-[160px] h-9 text-sm">
                <SelectValue placeholder="All members" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All members</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {project.users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {getUserDisplayName(user)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Due Date Filter */}
            <Select value={filterDueDate} onValueChange={setFilterDueDate}>
              <SelectTrigger className="w-[145px] h-9 text-sm">
                <SelectValue placeholder="All dates" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All dates</SelectItem>
                <SelectItem value="no-date">No due date</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="today">Due today</SelectItem>
                <SelectItem value="week">Due this week</SelectItem>
              </SelectContent>
            </Select>

            {/* Clear Filters Button */}
            {(searchQuery ||
              filterAssignee !== "all" ||
              filterDueDate !== "all") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setFilterAssignee("all");
                    setFilterDueDate("all");
                  }}
                  className="h-9 gap-2"
                >
                  <X className="h-3.5 w-3.5" />
                  Clear all
                </Button>
              )}
          </div>

          {/* Active Filters Display */}
          {(filterAssignee !== "all" ||
            filterDueDate !== "all" ||
            searchQuery) && (
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-muted-foreground font-medium">
                  Filters:
                </span>
                {searchQuery && (
                  <Badge variant="secondary" className="gap-1.5 font-normal">
                    Search: &quot;
                    {searchQuery.length > 20
                      ? searchQuery.slice(0, 20) + "..."
                      : searchQuery}
                    &quot;
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-foreground transition-colors"
                      onClick={() => setSearchQuery("")}
                    />
                  </Badge>
                )}
                {filterAssignee !== "all" && (
                  <Badge variant="secondary" className="gap-1.5 font-normal">
                    {filterAssignee === "unassigned"
                      ? "Unassigned"
                      : getUserDisplayName(
                        project.users.find((u) => u.id === filterAssignee) || {
                          id: "",
                          email: "",
                        }
                      )}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-foreground transition-colors"
                      onClick={() => setFilterAssignee("all")}
                    />
                  </Badge>
                )}
                {filterDueDate !== "all" && (
                  <Badge variant="secondary" className="gap-1.5 font-normal">
                    {filterDueDate === "no-date"
                      ? "No due date"
                      : filterDueDate === "overdue"
                        ? "Overdue"
                        : filterDueDate === "today"
                          ? "Due today"
                          : "Due this week"}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-foreground transition-colors"
                      onClick={() => setFilterDueDate("all")}
                    />
                  </Badge>
                )}
              </div>
            )}
        </div>

        {columns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed rounded-xl bg-muted/10">
            <div className="rounded-full bg-primary/10 p-6 mb-6">
              <Settings className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Set up your workflow</h3>
            <p className="text-sm text-muted-foreground mb-8 max-w-md text-center">
              Create status columns like &quot;To Do&quot;, &quot;In Progress&quot;, and &quot;Done&quot; to
              organize and track your tasks effectively.
            </p>
            <Button
              onClick={() => modal.openCreateStatus({ projectId })}
              size="lg"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Your First Status
            </Button>
          </div>
        ) : viewMode === "kanban" ? (
          <KanbanBoardNew
            columns={columns}
            projectUsers={project.users}
            projectId={projectId}
            onTaskMove={handleTaskMove}
            onTaskClick={handleTaskClick}
            onAddStatus={() => modal.openCreateStatus({ projectId })}
            onEditStatus={(statusId) => modal.openEditStatus({ projectId, statusId })}
          />
        ) : (
          <TaskGridView
            tasks={filteredTasks}
            statuses={project.statuses}
            projectUsers={project.users}
            onTaskClick={handleTaskClick}
            onTaskUpdate={handleTaskUpdate}
            onTaskReorder={handleTaskReorder}
          />
        )}
      </main>

      {/* Real-time Cursors with Canvas Architecture */}
      <CursorCanvas cursors={cursors} getUserColor={getUserColor} />
    </div>
  );
}
