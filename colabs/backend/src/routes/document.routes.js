import express from "express";
import passport from "passport";
import { 
  createDocument, 
  getDocuments, 
  getDocumentById, 
  updateDocument, 
  deleteDocument 
} from "../controllers/document.controller.js";

const router = express.Router();
const requireAuth = passport.authenticate("jwt", { session: false });

router.post("/", requireAuth, createDocument);
router.get("/", requireAuth, getDocuments);
router.get("/:docId", requireAuth, getDocumentById);
router.patch("/:docId", requireAuth, updateDocument);
router.delete("/:docId", requireAuth, deleteDocument);

export default router;
