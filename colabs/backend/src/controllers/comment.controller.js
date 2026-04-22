import Comment from "../models/Comment.js";
import User from "../models/User.js";

// GET /api/documents/:docId/comments
export const getComments = async (req, res) => {
  try {
    const { docId } = req.params;
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const comments = await Comment.find({ docId })
      .sort({ createdAt: -1 })
      .lean();

    // Populate user info
    const populated = await Promise.all(
      comments.map(async (comment) => {
        const author = await User.findById(comment.userId);
        const replies = await Promise.all(
          (comment.replies || []).map(async (reply) => {
            const replyAuthor = await User.findById(reply.userId);
            return {
              ...reply,
              user: replyAuthor
                ? {
                    id: replyAuthor._id,
                    displayName: replyAuthor.displayName,
                    avatar: replyAuthor.avatar,
                  }
                : null,
            };
          })
        );
        return {
          ...comment,
          user: author
            ? {
                id: author._id,
                displayName: author.displayName,
                avatar: author.avatar,
              }
            : null,
          replies,
        };
      })
    );

    return res.status(200).json(populated);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// POST /api/documents/:docId/comments
export const createComment = async (req, res) => {
  try {
    const { docId } = req.params;
    const { content, selectedText } = req.body;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    if (!content?.trim()) return res.status(400).json({ error: "Content is required" });

    const comment = await Comment.create({
      docId,
      userId,
      content: content.trim(),
      selectedText: selectedText || "",
    });

    const author = await User.findById(userId);

    return res.status(201).json({
      ...comment.toObject(),
      user: author
        ? {
            id: author._id,
            displayName: author.displayName,
            avatar: author.avatar,
          }
        : null,
      replies: [],
    });
  } catch (error) {
    console.error("Error creating comment:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// POST /api/documents/:docId/comments/:commentId/reply
export const replyToComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    if (!content?.trim()) return res.status(400).json({ error: "Content is required" });

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    comment.replies.push({ userId, content: content.trim() });
    await comment.save();

    const author = await User.findById(userId);

    return res.status(201).json({
      userId,
      content: content.trim(),
      createdAt: new Date(),
      user: author
        ? {
            id: author._id,
            displayName: author.displayName,
            avatar: author.avatar,
          }
        : null,
    });
  } catch (error) {
    console.error("Error replying to comment:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// PATCH /api/documents/:docId/comments/:commentId/resolve
export const resolveComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    comment.resolved = !comment.resolved;
    await comment.save();

    return res.status(200).json({ resolved: comment.resolved });
  } catch (error) {
    console.error("Error resolving comment:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// DELETE /api/documents/:docId/comments/:commentId
export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    // Only the author can delete
    if (comment.userId.toString() !== userId.toString()) {
      return res.status(403).json({ error: "Only the author can delete this comment" });
    }

    await Comment.findByIdAndDelete(commentId);
    return res.status(200).json({ message: "Comment deleted" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
