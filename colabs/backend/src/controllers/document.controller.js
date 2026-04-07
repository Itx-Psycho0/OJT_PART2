import { v4 as uuidv4 } from "uuid";
import Document from "../models/Document.js";
import YjsState from "../models/YjsState.js";
// import Template from "../models/Template.js"; // Uncomment if using a separate Template model

export const createDocument = async (req, res) => {
  try {
    const { templateId } = req.body;
    const ownerId = req.user?.id; // Assumes auth middleware populates req.user

    if (!ownerId) {
      return res.status(401).json({ error: "Unauthorized access" });
    }

    const docId = uuidv4();
    let title = "Untitled Document";

    if (templateId) {
      // Fetch template from DB (assuming Template model or using Document as template)
      /* 
      const template = await Template.findById(templateId);
      if (template && template.initialTitle) {
        title = template.initialTitle;
      }
      */
    }

    const newDocument = new Document({
      docId,
      title,
      ownerId,
      ...(templateId && { templateId }),
    });

    await newDocument.save();

    const newYjsState = new YjsState({
      docId,
      updates: [],
    });

    await newYjsState.save();

    return res.status(201).json({
      docId: newDocument.docId,
      title: newDocument.title,
      createdAt: newDocument.createdAt,
    });
  } catch (error) {
    console.error("Error creating document:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// GET /documents
export const getDocuments = async (req, res) => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId) return res.status(401).json({ error: "Unauthorized access" });

    const documents = await Document.find({ ownerId, isArchived: false }).sort({ updatedAt: -1 });

    return res.status(200).json(documents);
  } catch (error) {
    console.error("Error fetching documents:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// GET /documents/:docId
export const getDocumentById = async (req, res) => {
  try {
    const { docId } = req.params;
    const ownerId = req.user?.id;

    if (!ownerId) return res.status(401).json({ error: "Unauthorized access" });

    const document = await Document.findOne({ docId });

    if (!document) return res.status(404).json({ error: "Document not found" });
    
    if (document.ownerId.toString() !== ownerId) {
      return res.status(403).json({ error: "Forbidden: You do not own this document" });
    }

    return res.status(200).json(document);
  } catch (error) {
    console.error("Error fetching document:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// PATCH /documents/:docId
export const updateDocument = async (req, res) => {
  try {
    const { docId } = req.params;
    const { title } = req.body;
    const ownerId = req.user?.id;

    if (!ownerId) return res.status(401).json({ error: "Unauthorized access" });

    if (!title || typeof title !== "string") {
      return res.status(400).json({ error: "Valid title is required" });
    }

    const document = await Document.findOne({ docId });

    if (!document) return res.status(404).json({ error: "Document not found" });
    
    if (document.ownerId.toString() !== ownerId) {
      return res.status(403).json({ error: "Forbidden: You do not own this document" });
    }

    document.title = title;
    await document.save();

    return res.status(200).json(document);
  } catch (error) {
    console.error("Error updating document:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// DELETE /documents/:docId
export const deleteDocument = async (req, res) => {
  try {
    const { docId } = req.params;
    const ownerId = req.user?.id;

    if (!ownerId) return res.status(401).json({ error: "Unauthorized access" });

    const document = await Document.findOne({ docId });

    if (!document) return res.status(404).json({ error: "Document not found" });
    
    if (document.ownerId.toString() !== ownerId) {
      return res.status(403).json({ error: "Forbidden: You do not own this document" });
    }

    document.isArchived = true;
    await document.save();

    return res.status(200).json({ message: "Document archived successfully" });
  } catch (error) {
    console.error("Error archiving document:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
