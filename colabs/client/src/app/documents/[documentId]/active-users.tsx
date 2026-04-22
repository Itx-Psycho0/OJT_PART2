"use client";

import { useCollaboration } from "./collaboration-provider";

export const ActiveUsers = () => {
  const { activeUsers } = useCollaboration();

  if (activeUsers.length <= 1) return null;

  return (
    <div className="flex items-center -space-x-2">
      {activeUsers.slice(0, 5).map((u) => (
        <div
          key={u.clientId}
          className="relative group"
        >
          {u.avatar ? (
            <img
              src={u.avatar}
              alt={u.name}
              className="h-8 w-8 rounded-full object-cover border-2 border-white shadow-sm"
              referrerPolicy="no-referrer"
              style={{ borderColor: u.color }}
            />
          ) : (
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white border-2 border-white shadow-sm"
              style={{ backgroundColor: u.color }}
            >
              {u.name.charAt(0).toUpperCase()}
            </div>
          )}

          {/* Tooltip */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-neutral-800 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
            {u.name}
          </div>
        </div>
      ))}

      {activeUsers.length > 5 && (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-200 text-xs font-semibold text-neutral-600 border-2 border-white shadow-sm">
          +{activeUsers.length - 5}
        </div>
      )}
    </div>
  );
};
