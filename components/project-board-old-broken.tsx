"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Settings,
  UserPlus,
  Search,
  Calendar,
  User,
  MessageSquare,
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
  KanbanProvider,
  KanbanBoard,
  KanbanHeader,
  KanbanCards,
  KanbanCard,
} from "@/components/ui/shadcn-io/kanban";
import { TaskDialog } from "@/components/task-dialog";
import { TaskSidebar } from "@/components/task-sidebar";
import { useProject } from "@/lib/hooks/use-projects";
import { useInviteUser } from "@/lib/hooks/use-projects";
import { useCreateStatus } from "@/lib/hooks/use-statuses";
import { useUpdateTask } from "@/lib/hooks/use-tasks";

interface ProjectBoardProps {
  projectId: string;
}

type KanbanTask = {
  id: string;
  name: string;
  column: string;
  task: {
    id: string;
    title: string;
    description: string | null;
    statusId: string;
    assignee: { id: string; email: string } | null;
    _count: { comments: number };
    dueDate: string | null;
    startDate: string | null;
    imageUrl: string | null;
  };
};

type KanbanColumn = {
  id: string;
  name: string;
  unicode: string;
  color: string;
};

export function ProjectBoard({ projectId }: ProjectBoardProps) {
  const router = useRouter();
  const { data: project, isLoading } = useProject(projectId);
  const updateTask = useUpdateTask("", projectId);
  const createStatus = useCreateStatus(projectId);
  const inviteUser = useInviteUser(projectId);

  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [taskSidebarOpen, setTaskSidebarOpen] = useState(false);
  const [selectedStatusId, setSelectedStatusId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusName, setStatusName] = useState("");
  const [statusColor, setStatusColor] = useState("#3b82f6");
  const [statusUnicode, setStatusUnicode] = useState("📋");
  const [inviteEmail, setInviteEmail] = useState("");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading project...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Project not found</p>
      </div>
    );
  }

  const kanbanData: KanbanTask[] =
    project.tasks?.map((task) => ({
      id: task.id,
      name: task.title,
      column: task.statusId,
      task: {
        ...task,
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : null,
        startDate: task.startDate ? new Date(task.startDate).toISOString() : null,
      },
    })) || [];

  const kanbanColumns: KanbanColumn[] =
    project.statuses?.map((status) => ({
      id: status.id,
      name: status.name,
      unicode: status.unicode,
      color: status.color,
    })) || [];

  const filteredKanbanData = searchQuery
    ? kanbanData.filter(
        (item) =>
          item.task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.task.description
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          item.task.assignee?.email
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      )
    : kanbanData;

  const handleDataChange = (data: KanbanTask[]) => {
    const movedTask = data.find((item) => {
      const original = kanbanData.find((k) => k.id === item.id);
      return original && original.column !== item.column;
    });

    if (movedTask) {
      updateTask.mutate({
        statusId: movedTask.column,
      });
    }
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

  const handleOpenTaskDialog = (statusId: string) => {
    setSelectedStatusId(statusId);
    setSelectedTaskId(null);
    setTaskDialogOpen(true);
  };

  const handleOpenTaskDetail = (taskId: string) => {
    setSelectedTaskId(taskId);
    setTaskSidebarOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
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
                <h1 className="text-xl font-semibold tracking-tight">{project.name}</h1>
                {project.description && (
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {project.description}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
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
              <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
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

      <main className="container mx-auto px-6 py-6">
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10"
            />
          </div>
        </div>

        {kanbanColumns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border border-dashed rounded-xl bg-muted/10">
            <Settings className="h-10 w-10 text-muted-foreground/50 mb-4" />
            <h3 className="text-base font-semibold mb-1">No status columns yet</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm text-center">
              Create your first status column to organize tasks
            </p>
            <Button onClick={() => setStatusDialogOpen(true)} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Create Status
            </Button>
          </div>
        ) : (
          <KanbanProvider
            data={filteredKanbanData}
            columns={kanbanColumns}
            onDataChange={handleDataChange}
          >
            {(column) => (
              <div key={column.id} className="flex flex-col gap-3 min-w-[320px]">
                <div className="flex items-center justify-between px-1">
                  <KanbanHeader id={column.id} className="flex items-center gap-2 font-semibold text-sm">
                    <span className="text-base">{column.unicode}</span>
                    <span>{column.name}</span>
                    <span className="ml-1 px-2 py-0.5 rounded-full bg-muted text-xs font-medium text-muted-foreground">
                      {filteredKanbanData.filter((t) => t.column === column.id).length}
                    </span>
                  </KanbanHeader>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleOpenTaskDialog(column.id)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <KanbanCards id={column.id}>
                  {(item: KanbanTask) => (
                    <KanbanCard
                      {...item}
                      key={item.id}
                    >
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm leading-snug">
                          {item.task.title}
                        </h4>

                        {item.task.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {item.task.description.replace(/[#*_`]/g, "")}
                          </p>
                        )}

                        {(item.task.assignee || item.task.dueDate || item.task._count.comments > 0) && (
                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            {item.task.assignee && (
                              <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-secondary text-xs">
                                <User className="h-3 w-3" />
                                <span className="truncate max-w-[100px]">
                                  {item.task.assignee.email.split("@")[0]}
                                </span>
                              </div>
                            )}

                            {item.task.dueDate && (
                              <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-secondary text-xs">
                                <Calendar className="h-3 w-3" />
                                <span>
                                  {new Date(item.task.dueDate).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </span>
                              </div>
                            )}

                            {item.task._count.comments > 0 && (
                              <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-secondary text-xs">
                                <MessageSquare className="h-3 w-3" />
                                <span>{item.task._count.comments}</span>
                              </div>
                            )}
                          </div>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full h-8 text-xs -mx-3 -mb-3 mt-2 rounded-t-none border-t"
                          onClick={(e: React.MouseEvent) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleOpenTaskDetail(item.task.id);
                          }}
                          onPointerDown={(e: React.PointerEvent) => {
                            e.stopPropagation();
                          }}
                        >
                          View Details
                        </Button>
                      </div>
                    </KanbanCard>
                  )}
                </KanbanCards>
              </div>
            )}
          </KanbanProvider>
        )}
      </main>

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

