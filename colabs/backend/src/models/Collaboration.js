import mongoose from "mongoose";

const collaborationSchema = new mongoose.Schema(
  {
    docId: { 
      type: String, 
      required: true, 
      index: true 
    },
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    role: { 
      type: String, 
      enum: ["owner", "editor", "viewer"], 
      default: "viewer" 
    },
  },
  {
    timestamps: true,
  }
);

// Optional: ensure unique entry per document-user pair
collaborationSchema.index({ docId: 1, userId: 1 }, { unique: true });

export default mongoose.model("Collaboration", collaborationSchema);
