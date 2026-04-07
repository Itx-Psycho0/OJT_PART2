import mongoose from "mongoose";

const yjsStateSchema = new mongoose.Schema(
  {
    docId: { 
      type: String, 
      required: true, 
      unique: true, 
      index: true 
    },
    snapshot: { 
      type: Buffer 
    },
    updates: { 
      type: [Buffer], 
      default: [] 
    },
    lastCompactedAt: { 
      type: Date 
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("YjsState", yjsStateSchema);
