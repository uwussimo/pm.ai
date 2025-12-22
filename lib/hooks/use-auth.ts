"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
}

export function useAuth() {
  const { user, setUser, clearUser, setLoading } = useAuthStore();
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me");
      if (!res.ok) {
        throw new Error("Not authenticated");
      }
      const data = await res.json();
      return data.user as User;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
    enabled: !user, // Only fetch if we don't have user in store
  });

  // Sync query data with store
  if (data && !user) {
    setUser(data);
  }

  if (!isLoading && !data && user) {
    clearUser();
  }

  const signInMutation = useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sign in failed");
      return data.user as User;
    },
    onSuccess: (user) => {
      setUser(user);
      queryClient.setQueryData(["auth", "me"], user);
      router.push("/dashboard");
      toast.success("Signed in successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const signUpMutation = useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sign up failed");
      return data.user as User;
    },
    onSuccess: (user) => {
      setUser(user);
      queryClient.setQueryData(["auth", "me"], user);
      router.push("/dashboard");
      toast.success("Account created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const signOutMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/auth/signout", { method: "POST" });
      if (!res.ok) throw new Error("Sign out failed");
    },
    onSuccess: () => {
      clearUser();
      queryClient.clear();
      router.push("/signin");
      toast.success("Signed out successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return {
    user,
    isLoading: isLoading || useAuthStore.getState().isLoading,
    signIn: signInMutation.mutate,
    signUp: signUpMutation.mutate,
    signOut: signOutMutation.mutate,
    isSigningIn: signInMutation.isPending,
    isSigningUp: signUpMutation.isPending,
    isSigningOut: signOutMutation.isPending,
  };
}
