import { YSocketIO } from "y-socket.io/dist/server";
import * as Y from "yjs";
import YjsState from "../models/YjsState.js";

/**
 * Initializes Yjs with y-socket.io and handles state persistence to MongoDB.
 * @param {import("socket.io").Server} io 
 */
export const initializeYjsSocket = (io) => {
  // Initialize YSocketIO with garbage collection enabled
  const ysocketio = new YSocketIO(io, {
    gcEnabled: true,
  });

  ysocketio.initialize();

  // A) On document load
  ysocketio.on("document-loaded", async (doc) => {
    try {
      const docId = doc.name;
      
      const mongoose = await import("mongoose");
      const DocumentModel = mongoose.model("Document");
      const docExists = await DocumentModel.findOne({ docId });
      
      if (!docExists) {
        console.warn(`Socket connected to non-existent document ID: ${docId}`);
        return;
      }

      const state = await YjsState.findOne({ docId });

      if (state) {
        // If snapshot exists -> apply snapshot
        if (state.snapshot) {
          Y.applyUpdate(doc, state.snapshot);
        }
        
        // Then apply all updates
        if (state.updates && state.updates.length > 0) {
          for (const updateBuffer of state.updates) {
            Y.applyUpdate(doc, updateBuffer);
          }
        }
      } else {
        // Init empty state if it doesn't exist
        await YjsState.create({ docId, updates: [] });
      }
    } catch (error) {
      console.error(`Error loading document ${doc.name}:`, error);
    }
  });

  // B) On document update
  ysocketio.on("document-update", async (doc, updateBuffer) => {
    try {
      const docId = doc.name;
      
      // Save incoming update (Buffer) into updates array
      const state = await YjsState.findOneAndUpdate(
        { docId },
        { $push: { updates: updateBuffer } },
        { new: true, upsert: true }
      );

      // SNAPSHOT + COMPACTION LOGIC
      if (state.updates.length > 50) {
        // Reconstruct document using Y.Doc
        const ydoc = new Y.Doc();
        
        // Apply existing snapshot if available
        if (state.snapshot) {
          Y.applyUpdate(ydoc, state.snapshot);
        }
        
        // Apply all updates
        for (const update of state.updates) {
          Y.applyUpdate(ydoc, update);
        }

        // Generate snapshot using Y.encodeStateAsUpdate
        const newSnapshot = Y.encodeStateAsUpdate(ydoc);

        // Save snapshot, Clear updates array, Update lastCompactedAt
        await YjsState.findOneAndUpdate(
          { docId },
          {
            snapshot: newSnapshot,
            updates: [],
            lastCompactedAt: new Date(),
          }
        );
      }
    } catch (error) {
      console.error(`Error updating document ${doc.name}:`, error);
    }
  });

  return ysocketio;
};
