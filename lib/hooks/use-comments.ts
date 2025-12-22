"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
}

interface Comment {
  id: string;
  content: string;
  userId: string;
  taskId: string;
  user: User;
  createdAt: string;
}

export function useCreateComment(taskId: string, projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ content }: { content: string }) => {
      const res = await fetch(`/api/tasks/${taskId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add comment");
      return data.comment as Comment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", taskId] });
      queryClient.invalidateQueries({ queryKey: ["projects", projectId] });
      toast.success("Comment added successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateComment(
  commentId: string,
  taskId: string,
  projectId: string
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ content }: { content: string }) => {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update comment");
      return data.comment as Comment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", taskId] });
      toast.success("Comment updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteComment(
  commentId: string,
  taskId: string,
  projectId: string
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete comment");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", taskId] });
      queryClient.invalidateQueries({ queryKey: ["projects", projectId] });
      toast.success("Comment deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
