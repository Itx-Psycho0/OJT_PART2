"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  MessageSquare,
  X,
  Send,
  CheckCircle2,
  Circle,
  Trash2,
  Reply,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useAuthStore } from "@/store/use-auth-store";

interface CommentUser {
  id: string;
  displayName: string;
  avatar: string | null;
}

interface ReplyData {
  _id?: string;
  userId: string;
  content: string;
  createdAt: string;
  user: CommentUser | null;
}

interface CommentData {
  _id: string;
  docId: string;
  userId: string;
  content: string;
  selectedText: string;
  resolved: boolean;
  replies: ReplyData[];
  createdAt: string;
  user: CommentUser | null;
}

interface CommentPanelProps {
  documentId: string;
  open: boolean;
  onClose: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function timeAgo(dateStr: string) {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export const CommentPanel = ({ documentId, open, onClose }: CommentPanelProps) => {
  const { user } = useAuthStore();
  const [comments, setComments] = useState<CommentData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [showResolved, setShowResolved] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const fetchComments = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_URL}/api/documents/${documentId}/comments`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setIsLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    if (open) fetchComments();
  }, [open, fetchComments]);

  const handlePost = async () => {
    if (!newComment.trim()) return;
    setIsPosting(true);
    try {
      const res = await fetch(`${API_URL}/api/documents/${documentId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content: newComment.trim() }),
      });
      if (res.ok) {
        setNewComment("");
        fetchComments();
      }
    } catch (error) {
      console.error("Error posting comment:", error);
    } finally {
      setIsPosting(false);
    }
  };

  const handleReply = async (commentId: string) => {
    if (!replyText.trim()) return;
    try {
      const res = await fetch(
        `${API_URL}/api/documents/${documentId}/comments/${commentId}/reply`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ content: replyText.trim() }),
        }
      );
      if (res.ok) {
        setReplyingTo(null);
        setReplyText("");
        fetchComments();
      }
    } catch (error) {
      console.error("Error replying:", error);
    }
  };

  const handleResolve = async (commentId: string) => {
    try {
      await fetch(
        `${API_URL}/api/documents/${documentId}/comments/${commentId}/resolve`,
        { method: "PATCH", credentials: "include" }
      );
      fetchComments();
    } catch (error) {
      console.error("Error resolving:", error);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      await fetch(
        `${API_URL}/api/documents/${documentId}/comments/${commentId}`,
        { method: "DELETE", credentials: "include" }
      );
      fetchComments();
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  const activeComments = comments.filter((c) => !c.resolved);
  const resolvedComments = comments.filter((c) => c.resolved);

  if (!open) return null;

  return (
    <div className="fixed top-0 right-0 h-full w-[360px] bg-white shadow-[-4px_0_16px_rgba(0,0,0,0.08)] z-50 flex flex-col" style={{ animation: "slideInRight 0.2s ease-out" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-blue-600" />
          <h2 className="font-semibold text-base">Comments</h2>
          {activeComments.length > 0 && (
            <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
              {activeComments.length}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* New Comment */}
      <div className="px-5 py-4 border-b border-neutral-100 bg-neutral-50/50">
        <div className="flex gap-3">
          <div className="shrink-0 mt-1">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt=""
                className="h-7 w-7 rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="h-7 w-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                {user?.displayName?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1">
            <textarea
              ref={inputRef}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handlePost();
              }}
              placeholder="Add a comment..."
              className="w-full text-sm resize-none border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 min-h-[72px] bg-white placeholder:text-neutral-400"
              rows={2}
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={handlePost}
                disabled={!newComment.trim() || isPosting}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-200 disabled:text-neutral-400 text-white text-xs font-medium px-3.5 py-1.5 rounded-full transition-colors"
              >
                <Send className="h-3 w-3" />
                Comment
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-5 w-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : activeComments.length === 0 && resolvedComments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-neutral-400">
            <MessageSquare className="h-10 w-10 mb-3 opacity-30" />
            <p className="text-sm font-medium">No comments yet</p>
            <p className="text-xs mt-1">Be the first to leave a comment</p>
          </div>
        ) : (
          <>
            {/* Active Comments */}
            {activeComments.map((comment) => (
              <CommentItem
                key={comment._id}
                comment={comment}
                currentUserId={user?.id || ""}
                replyingTo={replyingTo}
                replyText={replyText}
                onReplyingTo={setReplyingTo}
                onReplyText={setReplyText}
                onReply={handleReply}
                onResolve={handleResolve}
                onDelete={handleDelete}
              />
            ))}

            {/* Resolved Section */}
            {resolvedComments.length > 0 && (
              <div className="border-t border-neutral-100">
                <button
                  onClick={() => setShowResolved(!showResolved)}
                  className="flex items-center justify-between w-full px-5 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider hover:bg-neutral-50"
                >
                  <span>Resolved ({resolvedComments.length})</span>
                  {showResolved ? (
                    <ChevronUp className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5" />
                  )}
                </button>
                {showResolved &&
                  resolvedComments.map((comment) => (
                    <CommentItem
                      key={comment._id}
                      comment={comment}
                      currentUserId={user?.id || ""}
                      replyingTo={replyingTo}
                      replyText={replyText}
                      onReplyingTo={setReplyingTo}
                      onReplyText={setReplyText}
                      onReply={handleReply}
                      onResolve={handleResolve}
                      onDelete={handleDelete}
                    />
                  ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Individual comment component
function CommentItem({
  comment,
  currentUserId,
  replyingTo,
  replyText,
  onReplyingTo,
  onReplyText,
  onReply,
  onResolve,
  onDelete,
}: {
  comment: CommentData;
  currentUserId: string;
  replyingTo: string | null;
  replyText: string;
  onReplyingTo: (id: string | null) => void;
  onReplyText: (text: string) => void;
  onReply: (commentId: string) => void;
  onResolve: (commentId: string) => void;
  onDelete: (commentId: string) => void;
}) {
  const isAuthor = comment.userId === currentUserId;
  const isReplying = replyingTo === comment._id;

  return (
    <div
      className={`px-5 py-4 border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors ${
        comment.resolved ? "opacity-60" : ""
      }`}
    >
      {/* Selected text preview */}
      {comment.selectedText && (
        <div className="mb-2 px-3 py-1.5 bg-yellow-50 border-l-2 border-yellow-400 text-xs text-neutral-600 italic rounded-r">
          &ldquo;{comment.selectedText}&rdquo;
        </div>
      )}

      {/* Comment header */}
      <div className="flex items-start gap-2.5">
        {comment.user?.avatar ? (
          <img
            src={comment.user.avatar}
            alt=""
            className="h-7 w-7 rounded-full object-cover shrink-0 mt-0.5"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="h-7 w-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
            {comment.user?.displayName?.charAt(0).toUpperCase() || "?"}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-neutral-800 truncate">
              {comment.user?.displayName || "Unknown"}
            </span>
            <span className="text-[11px] text-neutral-400 shrink-0">
              {timeAgo(comment.createdAt)}
            </span>
          </div>
          <p className="text-sm text-neutral-700 mt-1 whitespace-pre-wrap leading-relaxed">
            {comment.content}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-1 mt-2">
            <button
              onClick={() => {
                onReplyingTo(isReplying ? null : comment._id);
                onReplyText("");
              }}
              className="text-[11px] font-medium text-neutral-500 hover:text-blue-600 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
            >
              <Reply className="h-3 w-3 inline mr-1" />
              Reply
            </button>
            <button
              onClick={() => onResolve(comment._id)}
              className="text-[11px] font-medium text-neutral-500 hover:text-emerald-600 px-2 py-1 rounded hover:bg-emerald-50 transition-colors"
            >
              {comment.resolved ? (
                <>
                  <Circle className="h-3 w-3 inline mr-1" />
                  Reopen
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3 w-3 inline mr-1" />
                  Resolve
                </>
              )}
            </button>
            {isAuthor && (
              <button
                onClick={() => onDelete(comment._id)}
                className="text-[11px] font-medium text-neutral-400 hover:text-red-500 px-2 py-1 rounded hover:bg-red-50 transition-colors ml-auto"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Replies */}
      {comment.replies.length > 0 && (
        <div className="ml-9 mt-3 space-y-3 pl-3 border-l-2 border-neutral-100">
          {comment.replies.map((reply, i) => (
            <div key={i} className="flex items-start gap-2">
              {reply.user?.avatar ? (
                <img
                  src={reply.user.avatar}
                  alt=""
                  className="h-6 w-6 rounded-full object-cover shrink-0"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="h-6 w-6 rounded-full bg-neutral-100 text-neutral-600 flex items-center justify-center text-[10px] font-bold shrink-0">
                  {reply.user?.displayName?.charAt(0).toUpperCase() || "?"}
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-neutral-700">
                    {reply.user?.displayName || "Unknown"}
                  </span>
                  <span className="text-[10px] text-neutral-400">
                    {timeAgo(reply.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-neutral-600 mt-0.5">{reply.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reply input */}
      {isReplying && (
        <div className="ml-9 mt-3 flex gap-2">
          <input
            autoFocus
            value={replyText}
            onChange={(e) => onReplyText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onReply(comment._id);
              }
            }}
            placeholder="Write a reply..."
            className="flex-1 text-xs border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white"
          />
          <button
            onClick={() => onReply(comment._id)}
            disabled={!replyText.trim()}
            className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-200 text-white transition-colors"
          >
            <Send className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
}
