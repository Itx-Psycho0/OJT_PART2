"use client";

import { createContext, useContext, useMemo, useEffect, useState, useCallback } from "react";
import * as Y from "yjs";
import { SocketIOProvider } from "y-socket.io";
import { useAuthStore } from "@/store/use-auth-store";

// Generate consistent color from user name/id
const CURSOR_COLORS = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7",
  "#DDA0DD", "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E9",
  "#F8C471", "#82E0AA", "#F1948A", "#AED6F1", "#D7BDE2",
  "#A3E4D7", "#FAD7A0", "#A9CCE3", "#D5F5E3", "#FADBD8",
];

export function getUserColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return CURSOR_COLORS[Math.abs(hash) % CURSOR_COLORS.length];
}

export interface ActiveUser {
  name: string;
  color: string;
  avatar?: string | null;
  clientId: number;
}

interface CollaborationContextType {
  ydoc: Y.Doc;
  provider: SocketIOProvider;
  activeUsers: ActiveUser[];
}

const CollaborationContext = createContext<CollaborationContextType | null>(null);

export const useCollaboration = () => {
  const ctx = useContext(CollaborationContext);
  if (!ctx) throw new Error("useCollaboration must be used within CollaborationProvider");
  return ctx;
};

export const CollaborationProvider = ({
  documentId,
  children,
}: {
  documentId: string;
  children: React.ReactNode;
}) => {
  const { user } = useAuthStore();
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);

  const { ydoc, provider } = useMemo(() => {
    const ydoc = new Y.Doc();
    const SOCKET_URL =
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";
    const provider = new SocketIOProvider(
      SOCKET_URL,
      documentId || "my-doc",
      ydoc,
      { autoConnect: true },
    );
    return { ydoc, provider };
  }, [documentId]);

  // Set awareness user info when user is available
  useEffect(() => {
    if (provider.awareness && user) {
      const color = getUserColor(user.id);
      provider.awareness.setLocalStateField("user", {
        name: user.displayName,
        color,
        avatar: user.avatar || null,
      });
    }
  }, [provider, user]);

  // Track active users from awareness changes
  const updateUsers = useCallback(() => {
    if (!provider.awareness) return;
    const states = provider.awareness.getStates();
    const users: ActiveUser[] = [];
    const seen = new Set<string>();

    states.forEach((state, clientId) => {
      if (state.user && !seen.has(state.user.name)) {
        seen.add(state.user.name);
        users.push({
          name: state.user.name,
          color: state.user.color,
          avatar: state.user.avatar || null,
          clientId,
        });
      }
    });

    setActiveUsers(users);
  }, [provider]);

  useEffect(() => {
    if (!provider.awareness) return;
    updateUsers();
    provider.awareness.on("change", updateUsers);
    return () => {
      provider.awareness.off("change", updateUsers);
    };
  }, [provider, updateUsers]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (process.env.NODE_ENV === "production") {
        provider.destroy();
      }
    };
  }, [provider]);

  return (
    <CollaborationContext.Provider value={{ ydoc, provider, activeUsers }}>
      {children}
    </CollaborationContext.Provider>
  );
};
