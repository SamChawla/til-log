"use client";

import { useState } from "react";
import { Goal } from "@/types/schemas";
import { saveGoal } from "@/lib/store";
import { Target, Plus, X } from "lucide-react";
import { Toast } from "@/components/ui/toast";

interface GoalFormProps {
  onSave?: (goal: Goal) => void;
  suggestedTags?: string[];
}

let goalCounter = 0;
function createGoalId(): string {
  goalCounter++;
  return `goal-${Date.now()}-${goalCounter}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function GoalForm({ onSave, suggestedTags = [] }: GoalFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [targetEntries, setTargetEntries] = useState<number>(10);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const addTag = (tag: string) => {
    const clean = tag.toLowerCase().replace(/[^a-z0-9-]/g, "").trim();
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(tagInput);
    }
  };

  const handleSubmit = () => {
    if (!title.trim()) return;
    setIsSaving(true);

    const goal: Goal = {
      id: createGoalId(),
      title: title.trim(),
      description: description.trim() || undefined,
      deadline: deadline || undefined,
      relatedTags: tags.length > 0 ? tags : [title.toLowerCase().replace(/[^a-z0-9]/g, "")],
      targetEntries: targetEntries > 0 ? targetEntries : undefined,
      status: "active",
      createdAt: new Date().toISOString(),
    };

    saveGoal(goal);
    onSave?.(goal);

    // Reset form
    setTitle("");
    setDescription("");
    setDeadline("");
    setTargetEntries(10);
    setTags([]);
    setIsSaving(false);

    // Show toast
    setShowToast(true);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      {showToast && (
        <Toast
          message={`Goal created!`}
          type="success"
          duration={3000}
          onClose={() => setShowToast(false)}
        />
      )}

      <div className="flex items-center gap-2 mb-4">
        <Target className="w-5 h-5 text-purple-500" />
        <h3 className="font-semibold text-gray-800">Set a Learning Goal</h3>
      </div>

      {/* Title */}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="e.g., Learn Kubernetes"
        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-700 placeholder-gray-400 mb-3"
      />

      {/* Description */}
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Describe your goal (optional)"
        className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-700 placeholder-gray-400 mb-3"
        rows={2}
      />

      {/* Target entries & Deadline row */}
      <div className="flex gap-3 mb-3">
        <div className="flex-1">
          <label className="text-xs text-gray-500 mb-1 block">
            Target entries
          </label>
          <input
            type="number"
            value={targetEntries}
            onChange={(e) => setTargetEntries(parseInt(e.target.value) || 0)}
            min={1}
            className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
          />
        </div>
        <div className="flex-1">
          <label className="text-xs text-gray-500 mb-1 block">
            Deadline (optional)
          </label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
          />
        </div>
      </div>

      {/* Tags input */}
      <div className="mb-3">
        <label className="text-xs text-gray-500 mb-1 block">
          Related tags (press Enter to add)
        </label>
        <input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleTagKeyDown}
          placeholder="e.g., kubernetes, docker"
          className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
        />
      </div>

      {/* Tags display */}
      {(tags.length > 0 || suggestedTags.length > 0) && (
        <div className="flex items-center gap-2 flex-wrap mb-3">
          {tags.map((tag) => (
            <span
              key={tag}
              onClick={() => removeTag(tag)}
              className="px-2.5 py-1 bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-700 text-xs font-medium rounded-full border border-purple-100 cursor-pointer hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors flex items-center gap-1"
            >
              #{tag}
              <X className="w-3 h-3" />
            </span>
          ))}
          {suggestedTags
            .filter((t) => !tags.includes(t))
            .map((tag) => (
              <span
                key={tag}
                onClick={() => addTag(tag)}
                className="px-2.5 py-1 bg-gray-50 text-gray-500 text-xs font-medium rounded-full border border-gray-200 cursor-pointer hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 transition-colors"
              >
                + #{tag}
              </span>
            ))}
        </div>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!title.trim() || isSaving}
        className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
      >
        <Plus className="w-5 h-5" />
        Create Goal
      </button>
    </div>
  );
}
