"use client";

import { useState } from "react";
import { LogEntry } from "@/types/schemas";
import { deleteEntry } from "@/lib/store";
import { ExternalLink, Trash2, Calendar, Tag } from "lucide-react";

interface LogEntryCardProps {
  entry: LogEntry;
  onDelete?: (id: string) => void;
}

export default function LogEntryCard({ entry, onDelete }: LogEntryCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = () => {
    if (isDeleting) return;

    const didConfirm = window.confirm(
      "Delete this entry? This action can't be undone.",
    );
    if (!didConfirm) return;

    setDeleteError(null);
    setIsDeleting(true);

    try {
      deleteEntry(entry.id);
      onDelete?.(entry.id);
      setIsDeleted(true);
    } catch (error) {
      console.error(error);
      setDeleteError("Failed to delete entry. Please try again.");
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isDeleted) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
      {/* Header with date */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(entry.createdAt)}</span>
        </div>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors disabled:opacity-60 disabled:hover:text-gray-400 disabled:hover:bg-transparent"
          title="Delete entry"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {deleteError && (
        <p className="text-sm text-red-600 mb-3">{deleteError}</p>
      )}

      {/* Content */}
      <p className="text-gray-800 mb-4 leading-relaxed">{entry.content}</p>

      {/* Source link */}
      {entry.source && (
        <a
          href={entry.source}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 hover:underline mb-4"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          {entry.sourceName || entry.source}
        </a>
      )}

      {/* Tags */}
      {entry.tags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <Tag className="w-3.5 h-3.5 text-gray-400" />
          {entry.tags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 text-xs font-medium rounded-full border border-blue-100"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
