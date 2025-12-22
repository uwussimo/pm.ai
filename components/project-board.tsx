"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Settings,
  UserPlus,
  Search,
  Plus,
  Filter,
  X,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TaskDialog } from "@/components/task-dialog";
import { TaskSidebar } from "@/components/task-sidebar";
import { KanbanBoard } from "@/components/kanban-board-new";
import { useProject } from "@/lib/hooks/use-projects";
import { useInviteUser } from "@/lib/hooks/use-projects";
import { useCreateStatus } from "@/lib/hooks/use-statuses";
import { useMoveTask } from "@/lib/hooks/use-tasks";

interface ProjectBoardProps {
  projectId: string;
}

export function ProjectBoard({ projectId }: ProjectBoardProps) {
  const router = useRouter();
  const { data: project, isLoading } = useProject(projectId);
  const createStatus = useCreateStatus(projectId);
  const inviteUser = useInviteUser(projectId);
  const moveTask = useMoveTask(projectId);

  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [taskSidebarOpen, setTaskSidebarOpen] = useState(false);
  const [selectedStatusId, setSelectedStatusId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAssignee, setFilterAssignee] = useState<string>("all");
  const [filterDueDate, setFilterDueDate] = useState<string>("all");
  const [statusName, setStatusName] = useState("");
  const [statusColor, setStatusColor] = useState("#3b82f6");
  const [statusUnicode, setStatusUnicode] = useState("📋");
  const [inviteEmail, setInviteEmail] = useState("");

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

  const columns = project.statuses.map((status) => ({
    id: status.id,
    name: status.name,
    unicode: status.unicode,
    color: status.color,
    tasks: project.tasks
      .filter((task) => task.statusId === status.id)
      .filter((task) => {
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
          const dueDate = task.dueDate ? new Date(task.dueDate) : null;

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
      }),
  }));

  const handleTaskMove = (taskId: string, newStatusId: string) => {
    console.log("🔄 Moving task:", taskId, "to status:", newStatusId);
    // Update task status with optimistic UI
    moveTask.mutate({ taskId, statusId: newStatusId });
  };

  const handleTaskClick = (taskId: string) => {
    setSelectedTaskId(taskId);
    setTaskSidebarOpen(true);
  };

  const handleAddTask = (statusId: string) => {
    setSelectedStatusId(statusId);
    setSelectedTaskId(null);
    setTaskDialogOpen(true);
  };

  const handleCreateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    createStatus.mutate(
      {
        name: statusName,
        color: statusColor,
        unicode: statusUnicode,
        position: project.statuses.length,
      },
      {
        onSuccess: () => {
          setStatusDialogOpen(false);
          setStatusName("");
          setStatusColor("#3b82f6");
          setStatusUnicode("📋");
        },
      }
    );
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    inviteUser.mutate(
      { email: inviteEmail },
      {
        onSuccess: () => {
          setInviteDialogOpen(false);
          setInviteEmail("");
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-semibold tracking-tight">
                  {project.name}
                </h1>
                {project.description && (
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {project.description}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Dialog
                open={inviteDialogOpen}
                onOpenChange={setInviteDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon" className="h-9 w-9">
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invite User</DialogTitle>
                    <DialogDescription>
                      Invite a user to collaborate on this project
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleInviteUser} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="user@example.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={inviteUser.isPending}
                    >
                      {inviteUser.isPending ? "Inviting..." : "Invite User"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
              <Dialog
                open={statusDialogOpen}
                onOpenChange={setStatusDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon" className="h-9 w-9">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Status</DialogTitle>
                    <DialogDescription>
                      Add a new status column to your board
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateStatus} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="statusName">Status Name</Label>
                      <Input
                        id="statusName"
                        placeholder="In Progress"
                        value={statusName}
                        onChange={(e) => setStatusName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unicode">Icon (Emoji)</Label>
                      <Input
                        id="unicode"
                        placeholder="🚀"
                        value={statusUnicode}
                        onChange={(e) => setStatusUnicode(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="color">Color</Label>
                      <Input
                        id="color"
                        type="color"
                        value={statusColor}
                        onChange={(e) => setStatusColor(e.target.value)}
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={createStatus.isPending}
                    >
                      {createStatus.isPending ? "Creating..." : "Create Status"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-6">
        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[250px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10"
              />
            </div>

            {/* Assignee Filter */}
            <Select value={filterAssignee} onValueChange={setFilterAssignee}>
              <SelectTrigger className="w-[180px] h-10">
                <SelectValue placeholder="All members" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All members</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {project.users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.email.split("@")[0]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Due Date Filter */}
            <Select value={filterDueDate} onValueChange={setFilterDueDate}>
              <SelectTrigger className="w-[160px] h-10">
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
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setFilterAssignee("all");
                  setFilterDueDate("all");
                }}
                className="h-10"
              >
                <X className="h-4 w-4 mr-2" />
                Clear filters
              </Button>
            )}
          </div>

          {/* Active Filters Display */}
          {(filterAssignee !== "all" || filterDueDate !== "all") && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Active filters:
              </span>
              {filterAssignee !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  {filterAssignee === "unassigned"
                    ? "Unassigned"
                    : project.users
                        .find((u) => u.id === filterAssignee)
                        ?.email.split("@")[0]}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setFilterAssignee("all")}
                  />
                </Badge>
              )}
              {filterDueDate !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  {filterDueDate === "no-date"
                    ? "No due date"
                    : filterDueDate === "overdue"
                    ? "Overdue"
                    : filterDueDate === "today"
                    ? "Due today"
                    : "Due this week"}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setFilterDueDate("all")}
                  />
                </Badge>
              )}
            </div>
          )}
        </div>

        {columns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border border-dashed rounded-xl bg-muted/10">
            <Settings className="h-10 w-10 text-muted-foreground/50 mb-4" />
            <h3 className="text-base font-semibold mb-1">
              No status columns yet
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm text-center">
              Create your first status column to organize tasks
            </p>
            <Button onClick={() => setStatusDialogOpen(true)} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Create Status
            </Button>
          </div>
        ) : (
          <KanbanBoard
            columns={columns}
            projectUsers={project.users}
            projectId={projectId}
            onTaskMove={handleTaskMove}
            onTaskClick={handleTaskClick}
            onAddTask={handleAddTask}
          />
        )}
      </main>

      {/* Dialogs */}
      <TaskDialog
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        projectId={project.id}
        statusId={selectedStatusId}
        taskId={selectedTaskId}
        projectUsers={project.users}
        statuses={project.statuses.map((s) => ({
          id: s.id,
          name: s.name,
          color: s.color,
          unicode: s.unicode,
        }))}
      />

      <TaskSidebar
        open={taskSidebarOpen}
        onOpenChange={setTaskSidebarOpen}
        taskId={selectedTaskId}
        projectId={projectId}
        projectUsers={project.users}
        statuses={project.statuses.map((s) => ({
          id: s.id,
          name: s.name,
          color: s.color,
          unicode: s.unicode,
        }))}
      />
    </div>
  );
}
