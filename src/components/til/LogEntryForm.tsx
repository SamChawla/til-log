"use client";

import { useState } from "react";
import { LogEntry } from "@/types/schemas";
import { saveEntry } from "@/lib/store";
import { Plus, Link, Sparkles } from "lucide-react";

interface LogEntryFormProps {
  onSave?: (entry: LogEntry) => void;
  suggestedTags?: string[];
}

// Simple NLP to extract tags from content
function extractTags(content: string): string[] {
  const techKeywords: Record<string, string[]> = {
    react: ["react", "hooks", "useState", "useEffect", "jsx", "component"],
    typescript: ["typescript", "ts", "types", "interface", "generic"],
    javascript: ["javascript", "js", "es6", "async", "promise"],
    nextjs: ["next.js", "nextjs", "next", "app router", "server component"],
    nodejs: ["node.js", "nodejs", "node", "express", "npm"],
    python: ["python", "django", "flask", "pip"],
    css: ["css", "tailwind", "styled", "scss", "flexbox", "grid"],
    database: ["database", "sql", "postgres", "mongodb", "prisma", "supabase"],
    api: ["api", "rest", "graphql", "endpoint", "fetch"],
    git: ["git", "github", "commit", "branch", "merge"],
    docker: ["docker", "container", "kubernetes", "k8s"],
    testing: ["test", "jest", "testing", "vitest", "cypress"],
    devops: ["devops", "ci/cd", "pipeline", "deploy"],
    ai: ["ai", "machine learning", "llm", "gpt", "openai", "claude"],
  };

  const contentLower = content.toLowerCase();
  const foundTags: string[] = [];

  for (const [tag, keywords] of Object.entries(techKeywords)) {
    if (keywords.some((keyword) => contentLower.includes(keyword))) {
      foundTags.push(tag);
    }
  }

  return foundTags.slice(0, 5); // Max 5 tags
}

export default function LogEntryForm({ onSave, suggestedTags = [] }: LogEntryFormProps) {
  const [content, setContent] = useState("");
  const [source, setSource] = useState("");
  const [sourceName, setSourceName] = useState("");
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [showSourceInput, setShowSourceInput] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const autoTags = extractTags(content);
  const allTags = [...new Set([...autoTags, ...customTags])];

  const handleSubmit = () => {
    if (!content.trim()) return;

    setIsSaving(true);

    const entry: LogEntry = {
      id: `entry-${Date.now()}`,
      content: content.trim(),
      tags: allTags,
      source: source.trim() || undefined,
      sourceName: sourceName.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    saveEntry(entry);
    onSave?.(entry);

    // Reset form
    setContent("");
    setSource("");
    setSourceName("");
    setCustomTags([]);
    setShowSourceInput(false);
    setIsSaving(false);
  };

  const addCustomTag = (tag: string) => {
    const cleanTag = tag.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (cleanTag && !customTags.includes(cleanTag)) {
      setCustomTags([...customTags, cleanTag]);
    }
  };

  const removeTag = (tag: string) => {
    setCustomTags(customTags.filter((t) => t !== tag));
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-indigo-500" />
        <h3 className="font-semibold text-gray-800">What did you learn today?</h3>
      </div>

      {/* Content textarea */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Today I learned about React Server Components..."
        className="w-full p-4 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-700 placeholder-gray-400"
        rows={4}
      />

      {/* Auto-detected tags */}
      {allTags.length > 0 && (
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-500">Tags:</span>
          {allTags.map((tag) => (
            <span
              key={tag}
              onClick={() => removeTag(tag)}
              className="px-2.5 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 text-xs font-medium rounded-full border border-blue-100 cursor-pointer hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
              title="Click to remove"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Source input toggle */}
      {!showSourceInput ? (
        <button
          onClick={() => setShowSourceInput(true)}
          className="mt-4 flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 transition-colors"
        >
          <Link className="w-4 h-4" />
          Add source link
        </button>
      ) : (
        <div className="mt-4 space-y-3">
          <input
            type="url"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="https://example.com/article"
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
          />
          <input
            type="text"
            value={sourceName}
            onChange={(e) => setSourceName(e.target.value)}
            placeholder="Source name (e.g., 'React Docs')"
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
          />
        </div>
      )}

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        disabled={!content.trim() || isSaving}
        className="mt-5 w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
      >
        <Plus className="w-5 h-5" />
        Log Learning
      </button>
    </div>
  );
}