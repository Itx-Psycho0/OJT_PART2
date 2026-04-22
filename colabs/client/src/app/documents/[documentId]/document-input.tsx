"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { BsCloudCheck, BsCloudSlash } from "react-icons/bs";
import { Loader2 } from "lucide-react";

interface DocumentInputProps {
  documentId: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type SaveStatus = "saved" | "saving" | "error" | "idle";

const DocumentInput = ({ documentId }: DocumentInputProps) => {
  const [title, setTitle] = useState("Untitled Document");
  const [isEditing, setIsEditing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const inputRef = useRef<HTMLInputElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch document title on mount
  useEffect(() => {
    const fetchTitle = async () => {
      try {
        const res = await fetch(`${API_URL}/api/documents/${documentId}`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setTitle(data.title || "Untitled Document");
          setSaveStatus("saved");
        }
      } catch (error) {
        console.error("Error fetching document title:", error);
      }
    };
    fetchTitle();
  }, [documentId]);

  // Save title to backend
  const saveTitle = useCallback(
    async (newTitle: string) => {
      const trimmed = newTitle.trim();
      if (!trimmed) return;

      try {
        setSaveStatus("saving");
        const res = await fetch(`${API_URL}/api/documents/${documentId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ title: trimmed }),
        });

        if (res.ok) {
          setSaveStatus("saved");
        } else {
          setSaveStatus("error");
        }
      } catch (error) {
        console.error("Error saving title:", error);
        setSaveStatus("error");
      }
    },
    [documentId]
  );

  // Debounced save on change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    setSaveStatus("saving");

    // Clear previous timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce save by 800ms
    saveTimeoutRef.current = setTimeout(() => {
      saveTitle(newTitle);
    }, 800);
  };

  const handleBlur = () => {
    setIsEditing(false);
    // Clear any pending debounced save and save immediately
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    const trimmed = title.trim();
    if (!trimmed) {
      setTitle("Untitled Document");
      saveTitle("Untitled Document");
    } else {
      saveTitle(trimmed);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      inputRef.current?.blur();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      inputRef.current?.blur();
    }
  };

  const startEditing = () => {
    setIsEditing(true);
    // Focus after render
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 0);
  };

  return (
    <div className="flex items-center gap-2">
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={title}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="text-lg px-1.5 py-0 bg-transparent border-b-2 border-blue-500 outline-none truncate max-w-[300px] font-normal"
          spellCheck={false}
        />
      ) : (
        <button
          onClick={startEditing}
          className="text-lg cursor-pointer px-1.5 truncate max-w-[300px] hover:border-b hover:border-neutral-300 transition-all rounded-sm"
          title="Click to rename"
        >
          {title}
        </button>
      )}

      {/* Save status indicator */}
      <div className="flex items-center" title={
        saveStatus === "saved" ? "All changes saved" :
        saveStatus === "saving" ? "Saving..." :
        saveStatus === "error" ? "Error saving" : ""
      }>
        {saveStatus === "saving" && (
          <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
        )}
        {saveStatus === "saved" && (
          <BsCloudCheck className="h-4 w-4 text-neutral-500" />
        )}
        {saveStatus === "error" && (
          <BsCloudSlash className="h-4 w-4 text-red-500" />
        )}
      </div>
    </div>
  );
};

export default DocumentInput;
