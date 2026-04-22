import Collaboration from "../models/Collaboration.js";
import User from "../models/User.js";
import Document from "../models/Document.js";

// GET /api/documents/:docId/collaborators
export const getCollaborators = async (req, res) => {
  try {
    const { docId } = req.params;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    // Check the requester has access
    const requesterCollab = await Collaboration.findOne({ docId, userId });
    if (!requesterCollab) {
      return res.status(403).json({ error: "Access denied" });
    }

    const collaborations = await Collaboration.find({ docId }).sort({ createdAt: 1 });

    // Populate user info for each collaborator
    const collaborators = await Promise.all(
      collaborations.map(async (collab) => {
        const user = await User.findById(collab.userId);
        if (!user) return null;
        return {
          id: user._id,
          displayName: user.displayName,
          email: user.email,
          avatar: user.avatar,
          role: collab.role,
          joinedAt: collab.createdAt,
        };
      })
    );

    return res.status(200).json(collaborators.filter(Boolean));
  } catch (error) {
    console.error("Error fetching collaborators:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// POST /api/documents/:docId/share — invite by email
export const shareDocument = async (req, res) => {
  try {
    const { docId } = req.params;
    const { email, role } = req.body;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    if (!email) return res.status(400).json({ error: "Email is required" });
    if (!["editor", "viewer"].includes(role)) {
      return res.status(400).json({ error: "Role must be 'editor' or 'viewer'" });
    }

    // Check document exists
    const document = await Document.findOne({ docId });
    if (!document) return res.status(404).json({ error: "Document not found" });

    // Check requester is owner or editor
    const requesterCollab = await Collaboration.findOne({ docId, userId });
    if (!requesterCollab || !["owner", "editor"].includes(requesterCollab.role)) {
      return res.status(403).json({ error: "Only owners and editors can share" });
    }

    // Find the user to invite
    const invitedUser = await User.findOne({ email: email.toLowerCase() });
    if (!invitedUser) {
      return res.status(404).json({ error: "No user found with this email" });
    }

    // Check if already a collaborator
    const existingCollab = await Collaboration.findOne({
      docId,
      userId: invitedUser._id,
    });

    if (existingCollab) {
      // Update role if different
      if (existingCollab.role !== role && existingCollab.role !== "owner") {
        existingCollab.role = role;
        await existingCollab.save();
        return res.status(200).json({
          message: "Role updated",
          collaborator: {
            id: invitedUser._id,
            displayName: invitedUser.displayName,
            email: invitedUser.email,
            avatar: invitedUser.avatar,
            role,
          },
        });
      }
      return res.status(409).json({ error: "User is already a collaborator" });
    }

    // Create new collaboration
    await Collaboration.create({
      docId,
      userId: invitedUser._id,
      role,
    });

    return res.status(201).json({
      message: "User invited successfully",
      collaborator: {
        id: invitedUser._id,
        displayName: invitedUser.displayName,
        email: invitedUser.email,
        avatar: invitedUser.avatar,
        role,
      },
    });
  } catch (error) {
    console.error("Error sharing document:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// PATCH /api/documents/:docId/share/:targetUserId — update role
export const updateCollaboratorRole = async (req, res) => {
  try {
    const { docId, targetUserId } = req.params;
    const { role } = req.body;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    if (!["editor", "viewer"].includes(role)) {
      return res.status(400).json({ error: "Role must be 'editor' or 'viewer'" });
    }

    // Check requester is owner
    const requesterCollab = await Collaboration.findOne({ docId, userId });
    if (!requesterCollab || requesterCollab.role !== "owner") {
      return res.status(403).json({ error: "Only the owner can change roles" });
    }

    // Can't change owner's own role
    if (targetUserId === userId.toString()) {
      return res.status(400).json({ error: "Cannot change your own role" });
    }

    const collab = await Collaboration.findOne({ docId, userId: targetUserId });
    if (!collab) return res.status(404).json({ error: "Collaborator not found" });

    collab.role = role;
    await collab.save();

    return res.status(200).json({ message: "Role updated", role });
  } catch (error) {
    console.error("Error updating role:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// DELETE /api/documents/:docId/share/:targetUserId — remove collaborator
export const removeCollaborator = async (req, res) => {
  try {
    const { docId, targetUserId } = req.params;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    // Check requester is owner
    const requesterCollab = await Collaboration.findOne({ docId, userId });
    if (!requesterCollab || requesterCollab.role !== "owner") {
      return res.status(403).json({ error: "Only the owner can remove collaborators" });
    }

    // Can't remove yourself
    if (targetUserId === userId.toString()) {
      return res.status(400).json({ error: "Cannot remove yourself" });
    }

    const collab = await Collaboration.findOneAndDelete({
      docId,
      userId: targetUserId,
    });

    if (!collab) return res.status(404).json({ error: "Collaborator not found" });

    return res.status(200).json({ message: "Collaborator removed" });
  } catch (error) {
    console.error("Error removing collaborator:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
