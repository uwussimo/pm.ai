"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/lib/hooks/use-auth";

interface DashboardHeaderProps {
  userEmail?: string;
}

export function DashboardHeader({ userEmail }: DashboardHeaderProps) {
  const { signOut, isSigningOut } = useAuth();

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Project Management</h1>
          {userEmail && (
            <p className="text-sm text-muted-foreground mt-0.5">{userEmail}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() => signOut()}
            disabled={isSigningOut}
          >
            <LogOut className="h-4 w-4" />
            <span className="sr-only">Sign out</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
