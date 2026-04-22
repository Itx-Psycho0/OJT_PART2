"use client";

import { useCommentStore } from "@/store/use-comment-store";
import { CommentPanel } from "./comment-panel";

export const CommentPanelWrapper = ({ documentId }: { documentId: string }) => {
  const { isOpen, close } = useCommentStore();
  return <CommentPanel documentId={documentId} open={isOpen} onClose={close} />;
};
