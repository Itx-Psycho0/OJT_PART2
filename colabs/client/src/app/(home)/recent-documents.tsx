"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/use-auth-store";
import { useSearchParam } from "@/hooks/use-search-params";
import {
  FileText,
  MoreVertical,
  Trash2,
  ExternalLink,
  Loader2,
  FileX,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Document {
  _id: string;
  docId: string;
  title: string;
  ownerId: string;
  templateId?: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

export const RecentDocuments = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const [search] = useSearchParam();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch(`${API_URL}/api/documents`, {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleDelete = async (docId: string) => {
    try {
      setDeletingId(docId);
      const res = await fetch(`${API_URL}/api/documents/${docId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        setDocuments((prev) => prev.filter((doc) => doc.docId !== docId));
      }
    } catch (error) {
      console.error("Error deleting document:", error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleOpen = (docId: string) => {
    router.push(`/documents/${docId}`);
  };

  // Filter documents based on search query
  const filteredDocuments = documents.filter((doc) =>
    doc.title.toLowerCase().includes(search.toLowerCase())
  );

  // Don't render if user is not logged in
  if (!user) return null;

  return (
    <div className="max-w-screen-xl mx-auto px-16 py-6">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-neutral-800">
          Recent Documents
        </h2>
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <span>Sorted by last edited</span>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-sm text-neutral-500">Loading your documents...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredDocuments.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
            <FileX className="h-8 w-8 text-neutral-400" />
          </div>
          <p className="text-sm font-medium text-neutral-600">
            {search ? "No documents match your search" : "No documents yet"}
          </p>
          <p className="text-xs text-neutral-400">
            {search
              ? "Try a different search term"
              : "Create a new document from a template above to get started"}
          </p>
        </div>
      )}

      {/* Documents Table */}
      {!isLoading && filteredDocuments.length > 0 && (
        <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden shadow-sm">
          {/* Table Header */}
          <div className="grid grid-cols-[1fr_180px_48px] items-center px-5 py-3 border-b border-neutral-100 bg-neutral-50/80">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Title
            </span>
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Last Modified
            </span>
            <span></span>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-neutral-100">
            {filteredDocuments.map((doc) => (
              <div
                key={doc.docId}
                onClick={() => handleOpen(doc.docId)}
                className="grid grid-cols-[1fr_180px_48px] items-center px-5 py-3.5 hover:bg-blue-50/60 cursor-pointer transition-colors group"
              >
                {/* Document Title */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-blue-100 group-hover:bg-blue-200 transition-colors">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-neutral-800 truncate group-hover:text-blue-700 transition-colors">
                    {doc.title}
                  </span>
                </div>

                {/* Last Modified */}
                <span className="text-xs text-neutral-500">
                  {formatRelativeDate(doc.updatedAt)}
                </span>

                {/* Actions Menu */}
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="flex justify-end"
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex h-8 w-8 items-center justify-center rounded-full opacity-0 group-hover:opacity-100 hover:bg-neutral-200 transition-all focus:opacity-100">
                        <MoreVertical className="h-4 w-4 text-neutral-500" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem
                        onClick={() => handleOpen(doc.docId)}
                        className="cursor-pointer"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Open
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(doc.docId)}
                        disabled={deletingId === doc.docId}
                        className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                      >
                        {deletingId === doc.docId ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="mr-2 h-4 w-4" />
                        )}
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
