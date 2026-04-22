import express from "express";
import passport from "passport";
import {
  getComments,
  createComment,
  replyToComment,
  resolveComment,
  deleteComment,
} from "../controllers/comment.controller.js";

const router = express.Router();
const requireAuth = passport.authenticate("jwt", { session: false });

// GET    /api/documents/:docId/comments                      — list comments
// POST   /api/documents/:docId/comments                      — create comment
// POST   /api/documents/:docId/comments/:commentId/reply     — reply
// PATCH  /api/documents/:docId/comments/:commentId/resolve   — toggle resolve
// DELETE /api/documents/:docId/comments/:commentId            — delete

router.get("/:docId/comments", requireAuth, getComments);
router.post("/:docId/comments", requireAuth, createComment);
router.post("/:docId/comments/:commentId/reply", requireAuth, replyToComment);
router.patch("/:docId/comments/:commentId/resolve", requireAuth, resolveComment);
router.delete("/:docId/comments/:commentId", requireAuth, deleteComment);

export default router;
