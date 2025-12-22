"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useCreateTask, useUpdateTask } from "@/lib/hooks/use-tasks";

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  statusId: string | null;
  taskId: string | null;
  projectUsers: { id: string; email: string }[];
  statuses: { id: string; name: string; color: string; unicode: string }[];
}

export function TaskDialog({
  open,
  onOpenChange,
  projectId,
  statusId,
  taskId,
  projectUsers,
  statuses,
}: TaskDialogProps) {
  const createTask = useCreateTask(projectId);
  const updateTask = useUpdateTask(taskId || "", projectId);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedStatusId, setSelectedStatusId] = useState("");
  const [assigneeId, setAssigneeId] = useState<string>("");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");

  useEffect(() => {
    if (open && statusId && !taskId) {
      // Creating new task
      setTitle("");
      setDescription("");
      setSelectedStatusId(statusId);
      setAssigneeId("");
      setStartDate("");
      setDueDate("");
      setImageUrl("");
      setActiveTab("write");
    }
  }, [open, statusId, taskId]);

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();

    if (taskId) {
      // Update existing task
      updateTask.mutate(
        {
          title,
          description,
          statusId: selectedStatusId,
          assigneeId: assigneeId || undefined,
          startDate: startDate || undefined,
          dueDate: dueDate || undefined,
          imageUrl: imageUrl || undefined,
        },
        {
          onSuccess: () => {
            onOpenChange(false);
          },
        }
      );
    } else {
      // Create new task
      createTask.mutate(
        {
          title,
          description,
          statusId: selectedStatusId,
          assigneeId: assigneeId || undefined,
          startDate: startDate || undefined,
          dueDate: dueDate || undefined,
          imageUrl: imageUrl || undefined,
        },
        {
          onSuccess: () => {
            onOpenChange(false);
          },
        }
      );
    }
  };

  const isLoading = createTask.isPending || updateTask.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{taskId ? "Edit Task" : "Create New Task"}</DialogTitle>
          <DialogDescription>
            {taskId
              ? "Update the task details below"
              : "Add a new task to your project"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSaveTask} className="space-y-4 overflow-y-auto flex-1 px-1">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Description (Markdown supported)</Label>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="write">Write</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>
              <TabsContent value="write">
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a description (supports Markdown)..."
                  rows={6}
                  className="font-mono text-sm"
                />
              </TabsContent>
              <TabsContent value="preview">
                <div className="border rounded-md p-4 min-h-[150px] prose prose-sm dark:prose-invert max-w-none">
                  {description ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {description}
                    </ReactMarkdown>
                  ) : (
                    <p className="text-muted-foreground">No description provided</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={selectedStatusId}
                onValueChange={setSelectedStatusId}
                required
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status.id} value={status.id}>
                      {status.unicode} {status.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignee">Assignee</Label>
              <Select
                value={assigneeId || undefined}
                onValueChange={(value) => setAssigneeId(value || "")}
              >
                <SelectTrigger id="assignee">
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  {projectUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL (optional)</Label>
            <Input
              id="imageUrl"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? "Saving..." : taskId ? "Update Task" : "Create Task"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

