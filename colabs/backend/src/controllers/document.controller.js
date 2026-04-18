import { v4 as uuidv4 } from "uuid";
import Document from "../models/Document.js";
import YjsState from "../models/YjsState.js";
import Collaboration from "../models/Collaboration.js";

export const createDocument = async (req, res) => {
  try {
    const { templateId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized access" });
    }

    const docId = uuidv4();
    let title = "Untitled Document";

    // Simulate template fetch logic if provided
    if (templateId) {
      // e.g. title = template.initialTitle
    }

    const newDocument = new Document({
      docId,
      title,
      ownerId: userId,
      ...(templateId && { templateId }),
    });

    await newDocument.save();

    await YjsState.create({
      docId,
      updates: [],
    });

    await Collaboration.create({
      docId,
      userId,
      role: "owner"
    });

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

export const getDocuments = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized access" });

    const collaborations = await Collaboration.find({ userId });
    const docIds = collaborations.map(c => c.docId);

    const documents = await Document.find({ docId: { $in: docIds }, isArchived: false }).sort({ updatedAt: -1 });

    return res.status(200).json(documents);
  } catch (error) {
    console.error("Error fetching documents:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getDocumentById = async (req, res) => {
  try {
    const { docId } = req.params;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ error: "Unauthorized access" });

    const document = await Document.findOne({ docId });
    if (!document) return res.status(404).json({ error: "Document not found" });

    let collaboration = await Collaboration.findOne({ docId, userId });
    
    // Auto-add logic
    if (!collaboration) {
      collaboration = await Collaboration.create({
        docId,
        userId,
        role: "editor"
      });
    }

    return res.status(200).json(document);
  } catch (error) {
    console.error("Error fetching document:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const updateDocument = async (req, res) => {
  try {
    const { docId } = req.params;
    const { title } = req.body;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ error: "Unauthorized access" });

    if (!title || typeof title !== "string") {
      return res.status(400).json({ error: "Valid title is required" });
    }

    const document = await Document.findOne({ docId });
    if (!document) return res.status(404).json({ error: "Document not found" });

    const collaboration = await Collaboration.findOne({ docId, userId });
    if (!collaboration) {
      return res.status(403).json({ error: "Forbidden: Access denied" });
    }

    document.title = title;
    await document.save();

    return res.status(200).json(document);
  } catch (error) {
    console.error("Error updating document:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const { docId } = req.params;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ error: "Unauthorized access" });

    const document = await Document.findOne({ docId });
    if (!document) return res.status(404).json({ error: "Document not found" });

    const collaboration = await Collaboration.findOne({ docId, userId });
    if (!collaboration) {
      return res.status(403).json({ error: "Forbidden: Access denied" });
    }

    document.isArchived = true;
    await document.save();

    return res.status(200).json({ message: "Document archived successfully" });
  } catch (error) {
    console.error("Error archiving document:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
