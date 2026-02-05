"use client";

import { useState } from "react";
import { LogOut, Edit, Github } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/user-avatar";
import { useAuth } from "@/lib/hooks/use-auth";
import { useUpdateProfile } from "@/lib/hooks/use-profile";
import { formatDistanceToNow } from "date-fns";

interface SettingsContentProps {
  user: {
    id: string;
    email: string;
    name: string | null;
    description: string | null;
    githubUrl: string | null;
    createdAt: Date;
  };
}

export function SettingsContent({ user }: SettingsContentProps) {
  const { signOut, isSigningOut } = useAuth();
  const updateProfile = useUpdateProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name || "");
  const [description, setDescription] = useState(user.description || "");
  const [githubUrl, setGithubUrl] = useState(user.githubUrl || "");

  const handleSaveProfile = () => {
    updateProfile.mutate(
      {
        name: name || undefined,
        description: description || undefined,
        githubUrl: githubUrl || undefined,
      },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
      },
    );
  };

  const handleCancel = () => {
    setName(user.name || "");
    setDescription(user.description || "");
    setGithubUrl(user.githubUrl || "");
    setIsEditing(false);
  };

  return (
    <div className="space-y-8">
      {/* Profile Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-[24px] font-semibold tracking-tight text-foreground">
              Profile
            </h2>
            <p className="text-[15px] text-muted-foreground mt-1">
              Your account information
            </p>
          </div>
          {!isEditing && (
            <Button
              variant="outline"
              onClick={() => setIsEditing(true)}
              className="gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit Profile
            </Button>
          )}
        </div>

        <Card className="p-6">
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <UserAvatar user={user} size="lg" />
              <div className="flex-1 min-w-0 space-y-4">
                <div>
                  <Label className="text-[13px] text-muted-foreground uppercase tracking-wide">
                    Email
                  </Label>
                  <p className="text-[17px] text-foreground mt-1">
                    {user.email}
                  </p>
                </div>

                {isEditing ? (
                  <>
                    <div>
                      <Label htmlFor="name" className="text-[15px]">
                        Name
                      </Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description" className="text-[15px]">
                        Bio
                      </Label>
                      <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Tell us about yourself"
                        className="mt-2 resize-none"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="githubUrl" className="text-[15px]">
                        GitHub URL
                      </Label>
                      <div className="relative mt-2">
                        <Github className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="githubUrl"
                          value={githubUrl}
                          onChange={(e) => setGithubUrl(e.target.value)}
                          placeholder="https://github.com/username"
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={handleSaveProfile}
                        disabled={updateProfile.isPending}
                      >
                        {updateProfile.isPending ? "Saving..." : "Save Changes"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleCancel}
                        disabled={updateProfile.isPending}
                      >
                        Cancel
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    {name && (
                      <div>
                        <Label className="text-[13px] text-muted-foreground uppercase tracking-wide">
                          Name
                        </Label>
                        <p className="text-[17px] text-foreground mt-1">
                          {name}
                        </p>
                      </div>
                    )}
                    {description && (
                      <div>
                        <Label className="text-[13px] text-muted-foreground uppercase tracking-wide">
                          Bio
                        </Label>
                        <p className="text-[15px] text-foreground mt-1">
                          {description}
                        </p>
                      </div>
                    )}
                    {githubUrl && (
                      <div>
                        <Label className="text-[13px] text-muted-foreground uppercase tracking-wide">
                          GitHub
                        </Label>
                        <a
                          href={githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[15px] text-foreground mt-1 hover:underline flex items-center gap-2"
                        >
                          <Github className="h-4 w-4" />
                          {githubUrl}
                        </a>
                      </div>
                    )}
                    <div>
                      <Label className="text-[13px] text-muted-foreground uppercase tracking-wide">
                        Member since
                      </Label>
                      <p className="text-[17px] text-foreground mt-1">
                        {formatDistanceToNow(new Date(user.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Account Actions */}
      <div>
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-[17px] font-semibold text-foreground mb-1">
                Sign out
              </h3>
              <p className="text-[15px] text-muted-foreground mb-4">
                Sign out of your account on this device
              </p>
              <Button
                variant="outline"
                onClick={() => signOut()}
                disabled={isSigningOut}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                {isSigningOut ? "Signing out..." : "Sign out"}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
