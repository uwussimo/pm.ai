"use client";

import { useState } from "react";
import {
  Calendar,
  MessageSquare,
  Trash2,
  User,
  Clock,
  Image as ImageIcon,
  Edit2,
  Save,
  X as XIcon,
} from "lucide-react";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useTask } from "@/lib/hooks/use-tasks";
import { useUpdateTask, useDeleteTask } from "@/lib/hooks/use-tasks";
import { useCreateComment } from "@/lib/hooks/use-comments";

interface TaskSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: string | null;
  projectId: string;
  projectUsers: { id: string; email: string }[];
  statuses: { id: string; name: string; color: string; unicode: string }[];
}

export function TaskSidebar({
  open,
  onOpenChange,
  taskId,
  projectId,
  projectUsers,
  statuses,
}: TaskSidebarProps) {
  const { data: task, isLoading } = useTask(taskId);
  const updateTask = useUpdateTask(taskId || "", projectId);
  const deleteTask = useDeleteTask(taskId || "", projectId);
  const createComment = useCreateComment(taskId || "", projectId);

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedStatusId, setSelectedStatusId] = useState("");
  const [assigneeId, setAssigneeId] = useState<string>("");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [commentContent, setCommentContent] = useState("");
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");

  // Sync form with task data when task loads
  if (task && !isEditing && task.title !== title) {
    setTitle(task.title);
    setDescription(task.description || "");
    setSelectedStatusId(task.statusId);
    setAssigneeId(task.assigneeId || "");
    setStartDate(task.startDate ? task.startDate.split("T")[0] : "");
    setDueDate(task.dueDate ? task.dueDate.split("T")[0] : "");
    setImageUrl(task.imageUrl || "");
  }

  const handleSave = () => {
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
          setIsEditing(false);
        },
      }
    );
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this task?")) {
      deleteTask.mutate(undefined, {
        onSuccess: () => {
          onOpenChange(false);
        },
      });
    }
  };

  const handleAddComment = () => {
    if (!commentContent.trim()) return;
    createComment.mutate(
      { content: commentContent },
      {
        onSuccess: () => {
          setCommentContent("");
        },
      }
    );
  };

  if (!open) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-hidden flex flex-col p-0">
        {isLoading || !task ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Loading task...</p>
          </div>
        ) : (
          <>
            <SheetHeader className="px-6 pt-6 pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {isEditing ? (
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="text-2xl font-bold mb-2"
                    />
                  ) : (
                    <SheetTitle className="text-2xl mb-2">
                      {task.title}
                    </SheetTitle>
                  )}
                  <div className="flex items-center gap-2">
                    <Badge
                      style={{
                        backgroundColor: task.status.color + "20",
                        color: task.status.color,
                      }}
                    >
                      {task.status.unicode} {task.status.name}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={handleSave}
                        disabled={updateTask.isPending}
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setIsEditing(false)}
                      >
                        <XIcon className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setIsEditing(true)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={handleDelete}
                        disabled={deleteTask.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </SheetHeader>

            <ScrollArea className="flex-1 px-6">
              <div className="space-y-6 pb-6">
                {/* Description */}
                <div className="space-y-2">
                  <Label>Description</Label>
                  {isEditing ? (
                    <Tabs
                      value={activeTab}
                      onValueChange={(v) => setActiveTab(v as any)}
                    >
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="write">Write</TabsTrigger>
                        <TabsTrigger value="preview">Preview</TabsTrigger>
                      </TabsList>
                      <TabsContent value="write">
                        <Textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Add a description (supports Markdown)..."
                          rows={8}
                          className="font-mono text-sm"
                        />
                      </TabsContent>
                      <TabsContent value="preview">
                        <div className="border rounded-md p-4 min-h-[200px] prose prose-sm dark:prose-invert max-w-none">
                          {description ? (
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {description}
                            </ReactMarkdown>
                          ) : (
                            <p className="text-muted-foreground">
                              No description provided
                            </p>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>
                  ) : (
                    <div className="border rounded-md p-4 prose prose-sm dark:prose-invert max-w-none">
                      {task.description ? (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {task.description}
                        </ReactMarkdown>
                      ) : (
                        <p className="text-muted-foreground">
                          No description provided
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Task Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    {isEditing ? (
                      <Select
                        value={selectedStatusId}
                        onValueChange={setSelectedStatusId}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statuses.map((status) => (
                            <SelectItem key={status.id} value={status.id}>
                              {status.unicode} {status.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="flex items-center gap-2 text-sm">
                        <span>
                          {task.status.unicode} {task.status.name}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Assignee</Label>
                    {isEditing ? (
                      <Select
                        value={assigneeId || undefined}
                        onValueChange={(value) => setAssigneeId(value || "")}
                      >
                        <SelectTrigger>
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
                    ) : (
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4" />
                        <span>{task.assignee?.email || "Unassigned"}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    {isEditing ? (
                      <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    ) : (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4" />
                        <span>
                          {task.startDate
                            ? format(new Date(task.startDate), "MMM d, yyyy")
                            : "Not set"}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Due Date</Label>
                    {isEditing ? (
                      <Input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                      />
                    ) : (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {task.dueDate
                            ? format(new Date(task.dueDate), "MMM d, yyyy")
                            : "Not set"}
                        </span>
                      </div>
                    )}
                  </div>

                  {isEditing && (
                    <div className="col-span-2 space-y-2">
                      <Label>Image URL</Label>
                      <Input
                        type="url"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  )}

                  {task.imageUrl && !isEditing && (
                    <div className="col-span-2 space-y-2">
                      <Label>Image</Label>
                      <div className="border rounded-md overflow-hidden">
                        <img
                          src={task.imageUrl}
                          alt="Task"
                          className="w-full h-auto"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Comments */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    <h3 className="font-semibold">
                      Comments ({task.comments.length})
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {task.comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="border rounded-lg p-4 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span className="text-sm font-medium">
                              {comment.user.email}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {format(
                              new Date(comment.createdAt),
                              "MMM d, yyyy 'at' h:mm a"
                            )}
                          </span>
                        </div>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <Textarea
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                      placeholder="Add a comment..."
                      rows={3}
                    />
                    <Button
                      onClick={handleAddComment}
                      disabled={
                        !commentContent.trim() || createComment.isPending
                      }
                      className="w-full"
                    >
                      {createComment.isPending ? "Adding..." : "Add Comment"}
                    </Button>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
