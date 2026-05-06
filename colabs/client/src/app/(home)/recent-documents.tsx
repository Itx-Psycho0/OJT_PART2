"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
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
  LayoutGrid,
  List,
  ChevronDown,
  ArrowUpDown,
  Search,
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

type ViewMode = "grid" | "list";
type OwnerFilter = "anyone" | "me" | "not-me";
type SortMode = "last-modified" | "last-created" | "title-asc" | "title-desc";



const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const OWNER_FILTER_LABELS: Record<OwnerFilter, string> = {
  anyone: "Owned by anyone",
  me: "Owned by me",
  "not-me": "Not owned by me",
};

const SORT_LABELS: Record<SortMode, string> = {
  "last-modified": "Last modified",
  "last-created": "Date created",
  "title-asc": "Title (A–Z)",
  "title-desc": "Title (Z–A)",
};

// Visually distinct thumbnail colors based on document title hash
const THUMB_PALETTES = [
  { bg: "from-blue-500 to-blue-600", icon: "text-blue-100" },
  { bg: "from-emerald-500 to-teal-600", icon: "text-emerald-100" },
  { bg: "from-violet-500 to-purple-600", icon: "text-violet-100" },
  { bg: "from-amber-500 to-orange-600", icon: "text-amber-100" },
  { bg: "from-rose-500 to-pink-600", icon: "text-rose-100" },
  { bg: "from-cyan-500 to-sky-600", icon: "text-cyan-100" },
  { bg: "from-fuchsia-500 to-pink-600", icon: "text-fuchsia-100" },
  { bg: "from-lime-500 to-green-600", icon: "text-lime-100" },
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getPalette(title: string) {
  return THUMB_PALETTES[hashString(title) % THUMB_PALETTES.length];
}

//  Date Formatter 

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

function formatFullDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

//  Skeleton Components 

function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[4/3] rounded-t-xl bg-neutral-200" />
      <div className="border border-t-0 border-neutral-200 rounded-b-xl p-3 space-y-2">
        <div className="h-4 bg-neutral-200 rounded w-3/4" />
        <div className="h-3 bg-neutral-100 rounded w-1/2" />
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="animate-pulse flex items-center gap-4 px-5 py-3.5">
      <div className="h-8 w-8 rounded-md bg-neutral-200" />
      <div className="flex-1 space-y-1">
        <div className="h-4 bg-neutral-200 rounded w-1/3" />
      </div>
      <div className="h-3 bg-neutral-100 rounded w-24" />
      <div className="h-3 bg-neutral-100 rounded w-20" />
    </div>
  );
}

//  Document Card (Grid View) 

function DocumentCard({
  doc,
  onOpen,
  onDelete,
  isDeleting,
}: {
  doc: Document;
  isOwner: boolean;
  onOpen: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const palette = getPalette(doc.title);

  return (
    <div
      onClick={onOpen}
      className="group cursor-pointer rounded-xl border border-neutral-200 bg-white overflow-hidden transition-all duration-200 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-100/50"
    >
      {/* Thumbnail */}
      <div
        className={`relative aspect-[4/3] bg-gradient-to-br ${palette.bg} flex items-center justify-center overflow-hidden`}
      >
        {/* Decorative lines to simulate document content */}
        <div className="absolute inset-4 flex flex-col gap-2 opacity-20">
          <div className="h-2.5 bg-white/40 rounded w-3/4" />
          <div className="h-2 bg-white/30 rounded w-full" />
          <div className="h-2 bg-white/30 rounded w-5/6" />
          <div className="h-2 bg-white/25 rounded w-2/3" />
          <div className="h-2 bg-white/20 rounded w-4/5" />
          <div className="h-2 bg-white/20 rounded w-3/5" />
          <div className="h-2 bg-white/15 rounded w-full" />
          <div className="h-2 bg-white/15 rounded w-1/2" />
        </div>
        <FileText className={`h-12 w-12 ${palette.icon} opacity-60`} />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
      </div>

      {/* Card info */}
      <div className="px-3.5 py-3 border-t border-neutral-100">
        <p className="text-sm font-medium text-neutral-800 truncate group-hover:text-blue-700 transition-colors">
          {doc.title}
        </p>
        <div className="flex items-center justify-between mt-1.5">
          <div className="flex items-center gap-1.5">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100">
              <FileText className="h-3 w-3 text-blue-600" />
            </div>
            <span className="text-xs text-neutral-500">
              {formatRelativeDate(doc.updatedAt)}
            </span>
          </div>

          {/* 3-dot menu */}
          <div onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex h-7 w-7 items-center justify-center rounded-full opacity-0 group-hover:opacity-100 hover:bg-neutral-200 transition-all focus:opacity-100"
                  aria-label="Document options"
                >
                  <MoreVertical className="h-4 w-4 text-neutral-500" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem
                  onClick={onOpen}
                  className="cursor-pointer"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={onDelete}
                  disabled={isDeleting}
                  className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                >
                  {isDeleting ? (
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
      </div>
    </div>
  );
}

//  Document Row (List View)

function DocumentRow({
  doc,
  isOwner,
  onOpen,
  onDelete,
  isDeleting,
}: {
  doc: Document;
  isOwner: boolean;
  onOpen: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const palette = getPalette(doc.title);

  return (
    <div
      onClick={onOpen}
      className="group grid grid-cols-[1fr_120px_140px_48px] items-center px-5 py-3.5 hover:bg-blue-50/60 cursor-pointer transition-colors"
    >
      {/* Title */}
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gradient-to-br ${palette.bg}`}
        >
          <FileText className={`h-4 w-4 ${palette.icon}`} />
        </div>
        <span className="text-sm font-medium text-neutral-800 truncate group-hover:text-blue-700 transition-colors">
          {doc.title}
        </span>
      </div>

      {/* Owner */}
      <span className="text-xs text-neutral-500">
        {isOwner ? "me" : "—"}
      </span>

      {/* Last Modified */}
      <span className="text-xs text-neutral-500">
        {formatFullDate(doc.updatedAt)}
      </span>

      {/* Actions Menu */}
      <div onClick={(e) => e.stopPropagation()} className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex h-8 w-8 items-center justify-center rounded-full opacity-0 group-hover:opacity-100 hover:bg-neutral-200 transition-all focus:opacity-100"
              aria-label="Document options"
            >
              <MoreVertical className="h-4 w-4 text-neutral-500" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem
              onClick={onOpen}
              className="cursor-pointer"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Open
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onDelete}
              disabled={isDeleting}
              className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
            >
              {isDeleting ? (
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
  );
}

//  Main Component 

export const RecentDocuments = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const [search] = useSearchParam();

  // Data state
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // UI state
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [ownerFilter, setOwnerFilter] = useState<OwnerFilter>("anyone");
  const [sortMode, setSortMode] = useState<SortMode>("last-modified");

  //  Fetch 

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

  //  Actions 

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

  //  Filtered & Sorted Documents 

  const processedDocuments = useMemo(() => {
    let result = [...documents];

    // Search filter
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((doc) =>
        doc.title.toLowerCase().includes(q)
      );
    }

    // Ownership filter
    if (ownerFilter === "me" && user) {
      result = result.filter((doc) => doc.ownerId === user.id);
    } else if (ownerFilter === "not-me" && user) {
      result = result.filter((doc) => doc.ownerId !== user.id);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortMode) {
        case "last-modified":
          return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
        case "last-created":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "title-asc":
          return a.title.localeCompare(b.title);
        case "title-desc":
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });

    return result;
  }, [documents, search, ownerFilter, sortMode, user]);

  //  Guard 

  if (!user) return null;

  //  Render 

  return (
    <div className="max-w-screen-xl mx-auto px-16 py-6">
      {/*  Section Header  */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-medium text-neutral-800">
          Recent documents
        </h2>

        <div className="flex items-center gap-2">
          {/* Ownership Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                id="owner-filter-btn"
                className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-50 hover:border-neutral-300 transition-all"
              >
                {OWNER_FILTER_LABELS[ownerFilter]}
                <ChevronDown className="h-3.5 w-3.5 text-neutral-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {(Object.keys(OWNER_FILTER_LABELS) as OwnerFilter[]).map(
                (key) => (
                  <DropdownMenuItem
                    key={key}
                    onClick={() => setOwnerFilter(key)}
                    className={`cursor-pointer text-sm ${ownerFilter === key
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : ""
                      }`}
                  >
                    {OWNER_FILTER_LABELS[key]}
                  </DropdownMenuItem>
                )
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                id="sort-mode-btn"
                className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-50 hover:border-neutral-300 transition-all"
              >
                <ArrowUpDown className="h-3.5 w-3.5" />
                {SORT_LABELS[sortMode]}
                <ChevronDown className="h-3.5 w-3.5 text-neutral-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {(Object.keys(SORT_LABELS) as SortMode[]).map((key) => (
                <DropdownMenuItem
                  key={key}
                  onClick={() => setSortMode(key)}
                  className={`cursor-pointer text-sm ${sortMode === key
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : ""
                    }`}
                >
                  {SORT_LABELS[key]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Divider */}
          <div className="h-5 w-px bg-neutral-200 mx-1" />

          {/* View Toggle */}
          <div className="flex items-center rounded-lg border border-neutral-200 overflow-hidden">
            <button
              id="grid-view-btn"
              onClick={() => setViewMode("grid")}
              className={`flex items-center justify-center h-8 w-8 transition-colors ${viewMode === "grid"
                  ? "bg-blue-50 text-blue-600"
                  : "bg-white text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50"
                }`}
              aria-label="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              id="list-view-btn"
              onClick={() => setViewMode("list")}
              className={`flex items-center justify-center h-8 w-8 transition-colors border-l border-neutral-200 ${viewMode === "list"
                  ? "bg-blue-50 text-blue-600"
                  : "bg-white text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50"
                }`}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/*  Active Filters Indicator  */}
      {(search || ownerFilter !== "anyone") && (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {search && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-medium text-blue-700">
              <Search className="h-3 w-3" />
              &quot;{search}&quot;
            </span>
          )}
          {ownerFilter !== "anyone" && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-medium text-blue-700">
              {OWNER_FILTER_LABELS[ownerFilter]}
              <button
                onClick={() => setOwnerFilter("anyone")}
                className="ml-0.5 hover:text-blue-900 transition-colors"
                aria-label="Clear filter"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}

      {/*  Loading Skeletons  */}
      {isLoading && viewMode === "grid" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {isLoading && viewMode === "list" && (
        <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden shadow-sm">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      )}

      {/*  Empty State  */}
      {!isLoading && processedDocuments.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100">
            {search ? (
              <Search className="h-9 w-9 text-neutral-300" />
            ) : (
              <FileX className="h-9 w-9 text-neutral-300" />
            )}
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm font-medium text-neutral-600">
              {search
                ? "No documents match your search"
                : ownerFilter !== "anyone"
                  ? "No documents found for this filter"
                  : "No documents yet"}
            </p>
            <p className="text-xs text-neutral-400 max-w-xs">
              {search
                ? "Try a different search term or clear the filter"
                : "Create a new document from a template above to get started"}
            </p>
          </div>
        </div>
      )}

      {/*  Grid View  */}
      {!isLoading && processedDocuments.length > 0 && viewMode === "grid" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {processedDocuments.map((doc) => (
            <DocumentCard
              key={doc.docId}
              doc={doc}
              isOwner={doc.ownerId === user?.id}
              onOpen={() => handleOpen(doc.docId)}
              onDelete={() => handleDelete(doc.docId)}
              isDeleting={deletingId === doc.docId}
            />
          ))}
        </div>
      )}

      {/*  List View  */}
      {!isLoading && processedDocuments.length > 0 && viewMode === "list" && (
        <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden shadow-sm">
          {/* Table Header */}
          <div className="grid grid-cols-[1fr_120px_140px_48px] items-center px-5 py-3 border-b border-neutral-100 bg-neutral-50/80">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Title
            </span>
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Owner
            </span>
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Last Modified
            </span>
            <span />
          </div>

          {/* Table Body */}
          <div className="divide-y divide-neutral-100">
            {processedDocuments.map((doc) => (
              <DocumentRow
                key={doc.docId}
                doc={doc}
                isOwner={doc.ownerId === user?.id}
                onOpen={() => handleOpen(doc.docId)}
                onDelete={() => handleDelete(doc.docId)}
                isDeleting={deletingId === doc.docId}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
