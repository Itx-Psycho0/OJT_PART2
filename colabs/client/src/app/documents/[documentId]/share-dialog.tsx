"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Copy,
  Check,
  ChevronDown,
  UserPlus,
  Loader2,
  Crown,
  Pencil,
  Eye,
  Trash2,
  Link2,
  Users,
} from "lucide-react";
import { useAuthStore } from "@/store/use-auth-store";

interface Collaborator {
  id: string;
  displayName: string;
  email: string;
  avatar: string | null;
  role: "owner" | "editor" | "viewer";
  joinedAt: string;
}

interface ShareDialogProps {
  documentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const ROLE_CONFIG = {
  owner: { label: "Owner", icon: Crown, color: "text-amber-600 bg-amber-50 border-amber-200" },
  editor: { label: "Editor", icon: Pencil, color: "text-blue-600 bg-blue-50 border-blue-200" },
  viewer: { label: "Viewer", icon: Eye, color: "text-neutral-600 bg-neutral-50 border-neutral-200" },
};

export const ShareDialog = ({ documentId, open, onOpenChange }: ShareDialogProps) => {
  const { user } = useAuthStore();
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"editor" | "viewer">("editor");
  const [isInviting, setIsInviting] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState("");
  const [copied, setCopied] = useState(false);

  // Fetch collaborators
  const fetchCollaborators = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_URL}/api/documents/${documentId}/share`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setCollaborators(data);
      }
    } catch (error) {
      console.error("Error fetching collaborators:", error);
    } finally {
      setIsLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    if (open) {
      fetchCollaborators();
      setEmail("");
      setInviteError("");
      setInviteSuccess("");
    }
  }, [open, fetchCollaborators]);

  // Copy link
  const handleCopyLink = () => {
    const url = `${window.location.origin}/documents/${documentId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Invite user
  const handleInvite = async () => {
    if (!email.trim()) return;
    setInviteError("");
    setInviteSuccess("");
    setIsInviting(true);

    try {
      const res = await fetch(`${API_URL}/api/documents/${documentId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim(), role }),
      });

      const data = await res.json();

      if (res.ok) {
        setInviteSuccess(`${data.collaborator.displayName} added as ${role}`);
        setEmail("");
        fetchCollaborators();
        setTimeout(() => setInviteSuccess(""), 3000);
      } else {
        setInviteError(data.error || "Failed to invite user");
      }
    } catch (error) {
      setInviteError("Network error. Please try again.");
    } finally {
      setIsInviting(false);
    }
  };

  // Update role
  const handleUpdateRole = async (targetUserId: string, newRole: "editor" | "viewer") => {
    try {
      const res = await fetch(
        `${API_URL}/api/documents/${documentId}/share/${targetUserId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ role: newRole }),
        }
      );
      if (res.ok) {
        fetchCollaborators();
      }
    } catch (error) {
      console.error("Error updating role:", error);
    }
  };

  // Remove collaborator
  const handleRemove = async (targetUserId: string) => {
    try {
      const res = await fetch(
        `${API_URL}/api/documents/${documentId}/share/${targetUserId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (res.ok) {
        fetchCollaborators();
      }
    } catch (error) {
      console.error("Error removing collaborator:", error);
    }
  };

  // Check if current user is owner
  const isOwner = collaborators.some(
    (c) => c.id === user?.id && c.role === "owner"
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] p-0 gap-0 overflow-hidden bg-white">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Share document
          </DialogTitle>
        </DialogHeader>

        {/* Invite Section */}
        <div className="px-6 pb-4 space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Add people by email..."
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setInviteError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleInvite();
              }}
              className="flex-1 h-10 text-sm"
            />

            {/* Role Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="h-10 px-3 gap-1 text-sm font-normal min-w-[100px]"
                >
                  {role === "editor" ? (
                    <Pencil className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                  {role === "editor" ? "Editor" : "Viewer"}
                  <ChevronDown className="h-3.5 w-3.5 text-neutral-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36">
                <DropdownMenuItem
                  onClick={() => setRole("editor")}
                  className="cursor-pointer"
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Editor
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setRole("viewer")}
                  className="cursor-pointer"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Viewer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              onClick={handleInvite}
              disabled={!email.trim() || isInviting}
              className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isInviting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Feedback Messages */}
          {inviteError && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {inviteError}
            </p>
          )}
          {inviteSuccess && (
            <p className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2">
              {inviteSuccess}
            </p>
          )}
        </div>

        {/* Collaborators List */}
        <div className="border-t border-neutral-100">
          <div className="px-6 py-3">
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              People with access ({collaborators.length})
            </p>
          </div>

          <div className="max-h-[240px] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
              </div>
            ) : (
              collaborators.map((collab) => {
                const roleConfig = ROLE_CONFIG[collab.role];
                const RoleIcon = roleConfig.icon;
                const isCurrentUser = collab.id === user?.id;

                return (
                  <div
                    key={collab.id}
                    className="flex items-center justify-between px-6 py-2.5 hover:bg-neutral-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {collab.avatar ? (
                        <img
                          src={collab.avatar}
                          alt={collab.displayName}
                          className="h-8 w-8 rounded-full object-cover shrink-0"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                          {collab.displayName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-neutral-800 truncate">
                          {collab.displayName}
                          {isCurrentUser && (
                            <span className="text-xs text-neutral-400 ml-1">(you)</span>
                          )}
                        </p>
                        <p className="text-xs text-neutral-500 truncate">
                          {collab.email}
                        </p>
                      </div>
                    </div>

                    {/* Role Badge / Dropdown */}
                    <div className="flex items-center gap-2 shrink-0">
                      {collab.role === "owner" || !isOwner ? (
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${roleConfig.color}`}
                        >
                          <RoleIcon className="h-3 w-3" />
                          {roleConfig.label}
                        </span>
                      ) : (
                        <>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border hover:shadow-sm transition-shadow cursor-pointer ${roleConfig.color}`}
                              >
                                <RoleIcon className="h-3 w-3" />
                                {roleConfig.label}
                                <ChevronDown className="h-3 w-3" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-36">
                              <DropdownMenuItem
                                onClick={() =>
                                  handleUpdateRole(collab.id, "editor")
                                }
                                className="cursor-pointer"
                              >
                                <Pencil className="h-4 w-4 mr-2" />
                                Editor
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleUpdateRole(collab.id, "viewer")
                                }
                                className="cursor-pointer"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Viewer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <button
                            onClick={() => handleRemove(collab.id)}
                            className="p-1 rounded-md hover:bg-red-50 text-neutral-400 hover:text-red-500 transition-colors"
                            title="Remove access"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Copy Link Footer */}
        <div className="border-t border-neutral-100 px-6 py-4">
          <Button
            variant="outline"
            onClick={handleCopyLink}
            className="w-full h-10 gap-2 text-sm font-medium"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-emerald-500" />
                Link copied!
              </>
            ) : (
              <>
                <Link2 className="h-4 w-4" />
                Copy link
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
