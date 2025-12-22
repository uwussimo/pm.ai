"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, FolderOpen, Users, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { useProjects, useCreateProject } from "@/lib/hooks/use-projects";

export function ProjectsList() {
  const router = useRouter();
  const { data: projects, isLoading } = useProjects();
  const createProject = useCreateProject();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    createProject.mutate(
      { name, description },
      {
        onSuccess: () => {
          setOpen(false);
          setName("");
          setDescription("");
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading projects...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Projects</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your projects and tasks
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Add a new project to organize your tasks
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name</Label>
                <Input
                  id="name"
                  placeholder="My Awesome Project"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Project description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={createProject.isPending}
              >
                {createProject.isPending ? "Creating..." : "Create Project"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {!projects || projects.length === 0 ? (
        <Card className="border-dashed bg-muted/10">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FolderOpen className="h-10 w-10 text-muted-foreground/50 mb-4" />
            <h3 className="text-base font-semibold mb-1">No projects yet</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Create your first project to get started
            </p>
            <Button onClick={() => setOpen(true)} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Create Project
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Card
              key={project.id}
              className="group cursor-pointer hover:shadow-md transition-all duration-200 border-border/50 hover:border-border"
              onClick={() => router.push(`/projects/${project.id}`)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <FolderOpen className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  {project.name}
                </CardTitle>
                {project.description && (
                  <CardDescription className="text-sm line-clamp-2 mt-1.5">
                    {project.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <CheckSquare className="h-3.5 w-3.5" />
                    <span>{project._count.tasks}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" />
                    <span>{project.users.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
