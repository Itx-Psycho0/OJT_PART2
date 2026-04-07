import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    docId: { 
      type: String, 
      required: true, 
      unique: true, 
      index: true 
    },
    title: { 
      type: String, 
      default: "Untitled Document" 
    },
    ownerId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    templateId: { 
      type: String 
    },
    isArchived: { 
      type: Boolean, 
      default: false 
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Document", documentSchema);
