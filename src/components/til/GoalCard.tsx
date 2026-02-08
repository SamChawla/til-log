"use client";

import { useState } from "react";
import { Goal, LogEntry } from "@/types/schemas";
import { updateGoal, deleteGoal, getEntries } from "@/lib/store";
import {
  Target,
  Trash2,
  Calendar,
  Tag,
  CheckCircle2,
  Pause,
  Play,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface GoalCardProps {
  goal: Goal;
  onUpdate?: (goal: Goal) => void;
  onDelete?: (id: string) => void;
}

export default function GoalCard({ goal, onUpdate, onDelete }: GoalCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  const entries: LogEntry[] = getEntries();
  const relatedEntries = entries.filter((e) =>
    e.tags.some((t) =>
      goal.relatedTags.some(
        (gt) => gt.toLowerCase() === t.toLowerCase()
      )
    )
  );

  const progress = goal.targetEntries
    ? Math.min(
        Math.round((relatedEntries.length / goal.targetEntries) * 100),
        100
      )
    : 0;

  const handleStatusChange = (
    newStatus: "active" | "completed" | "paused"
  ) => {
    updateGoal(goal.id, { status: newStatus });
    onUpdate?.({ ...goal, status: newStatus });
  };

  const handleDelete = () => {
    if (isDeleting) return;
    const didConfirm = window.confirm(
      "Delete this goal? This action can't be undone."
    );
    if (!didConfirm) return;
    setIsDeleting(true);
    try {
      deleteGoal(goal.id);
      onDelete?.(goal.id);
      setIsDeleted(true);
    } catch {
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

  const statusColors = {
    active: "bg-green-100 text-green-700 border-green-200",
    completed: "bg-blue-100 text-blue-700 border-blue-200",
    paused: "bg-yellow-100 text-yellow-700 border-yellow-200",
  };

  const progressColor =
    progress >= 75
      ? "from-green-500 to-emerald-500"
      : progress >= 40
      ? "from-blue-500 to-indigo-500"
      : "from-indigo-500 to-purple-500";

  if (isDeleted) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Progress bar at top */}
      {goal.targetEntries && goal.targetEntries > 0 && (
        <div className="h-1.5 bg-gray-100">
          <div
            className={`h-full bg-gradient-to-r ${progressColor} transition-all duration-500`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-purple-100 rounded-lg">
              <Target className="w-4 h-4 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-800">{goal.title}</h3>
          </div>
          <div className="flex items-center gap-1">
            <span
              className={`px-2 py-0.5 text-xs font-medium rounded-full border ${
                statusColors[goal.status]
              }`}
            >
              {goal.status}
            </span>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
              title="Delete goal"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Description */}
        {goal.description && (
          <p className="text-sm text-gray-600 mb-3">{goal.description}</p>
        )}

        {/* Progress section */}
        {goal.targetEntries && goal.targetEntries > 0 && (
          <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500">Progress</span>
              <span className="font-medium text-gray-700">
                {relatedEntries.length} / {goal.targetEntries} entries
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className={`h-2 rounded-full bg-gradient-to-r ${progressColor} transition-all duration-500`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">{progress}% complete</p>
          </div>
        )}

        {/* Meta info */}
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
          {goal.deadline && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Due {formatDate(goal.deadline)}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>Created {formatDate(goal.createdAt)}</span>
          </div>
        </div>

        {/* Tags */}
        {goal.relatedTags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <Tag className="w-3.5 h-3.5 text-gray-400" />
            {goal.relatedTags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-700 text-xs font-medium rounded-full border border-purple-100"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
          {goal.status === "active" && (
            <>
              <button
                onClick={() => handleStatusChange("completed")}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Complete
              </button>
              <button
                onClick={() => handleStatusChange("paused")}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-yellow-700 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors"
              >
                <Pause className="w-3.5 h-3.5" />
                Pause
              </button>
            </>
          )}
          {goal.status === "paused" && (
            <button
              onClick={() => handleStatusChange("active")}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
            >
              <Play className="w-3.5 h-3.5" />
              Resume
            </button>
          )}
          {goal.status === "completed" && (
            <button
              onClick={() => handleStatusChange("active")}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <Play className="w-3.5 h-3.5" />
              Reopen
            </button>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-auto flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" /> Less
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" /> Related entries
              </>
            )}
          </button>
        </div>

        {/* Expanded: related entries */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
            {relatedEntries.length === 0 ? (
              <p className="text-sm text-gray-400 italic">
                No related entries yet. Start logging!
              </p>
            ) : (
              relatedEntries.slice(0, 5).map((entry) => (
                <div
                  key={entry.id}
                  className="p-2 bg-gray-50 rounded-lg text-sm text-gray-700"
                >
                  <p className="line-clamp-2">{entry.content}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDate(entry.createdAt)}
                  </p>
                </div>
              ))
            )}
            {relatedEntries.length > 5 && (
              <p className="text-xs text-gray-400 text-center">
                +{relatedEntries.length - 5} more entries
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
