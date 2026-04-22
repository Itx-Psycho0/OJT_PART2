import express from "express";
import passport from "passport";
import {
  getCollaborators,
  shareDocument,
  updateCollaboratorRole,
  removeCollaborator,
} from "../controllers/share.controller.js";

const router = express.Router();
const requireAuth = passport.authenticate("jwt", { session: false });

// GET    /api/documents/:docId/share          — list collaborators
// POST   /api/documents/:docId/share          — invite by email
// PATCH  /api/documents/:docId/share/:targetUserId  — update role
// DELETE /api/documents/:docId/share/:targetUserId  — remove collaborator

router.get("/:docId/share", requireAuth, getCollaborators);
router.post("/:docId/share", requireAuth, shareDocument);
router.patch("/:docId/share/:targetUserId", requireAuth, updateCollaboratorRole);
router.delete("/:docId/share/:targetUserId", requireAuth, removeCollaborator);

export default router;
