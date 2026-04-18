import jwt from "jsonwebtoken";
import config from "../config/config.js";
import User from "../models/User.js";
import Collaboration from "../models/Collaboration.js";

const cookieExtractor = (cookieString) => {
  if (!cookieString) return null;
  const match = cookieString.match(new RegExp("(^| )token=([^;]+)"));
  if (match) return match[2];
  return null;
};

export const socketAuth = async (socket, next) => {
  try {
    // Extract user from JWT (using cookies or headers depending on standard)
    const token = cookieExtractor(socket.request.headers.cookie);
    
    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(decoded.sub);
    
    if (!user || !user.isActive) {
      return next(new Error("Authentication error: User invalid"));
    }

    // Extract docId from handshake query
    const docId = socket.handshake.query.docId || socket.handshake.query.documentName;
    
    if (docId) {
      const collaboration = await Collaboration.findOne({ docId, userId: user._id });
      
      // Check Collaboration: if no entry exists -> reject connection
      if (!collaboration) {
        return next(new Error("Authentication error: Forbidden access to document"));
      }
    }

    socket.user = user;
    next();
  } catch (error) {
    console.error("Socket Auth Error:", error);
    next(new Error("Authentication error"));
  }
};
