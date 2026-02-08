"use client";

import { useEffect, useState } from "react";
import {
  Lightbulb,
  BookOpen,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import {
  getEntries,
  getGoals,
  getTopTags,
  calculateStreak,
  TIL_STORE_CHANGED_EVENT,
} from "@/lib/store";
import { LogEntry, Goal } from "@/types/schemas";
import { useCanvasStore } from "@/lib/canvas-storage";

interface SuggestionsProps {
  title?: string;
  _inCanvas?: boolean;
}

const SUGGESTIONS_COMPONENT_ID = "suggestions-main";

export default function Suggestions({
  title = "Learning Suggestions",
  _inCanvas,
}: SuggestionsProps) {
  const { activeCanvasId, addComponent, createCanvas, canvases } =
    useCanvasStore();

  useEffect(() => {
    if (_inCanvas) return;

    let targetCanvasId = activeCanvasId ?? canvases[0]?.id;
    if (!targetCanvasId) {
      const newCanvas = createCanvas();
      targetCanvasId = newCanvas.id;
    }
    if (!targetCanvasId) return;

    const alreadyInCanvas = useCanvasStore
      .getState()
      .getComponents(targetCanvasId)
      .some((c) => c.componentId === SUGGESTIONS_COMPONENT_ID);
    if (alreadyInCanvas) return;

    addComponent(targetCanvasId, {
      componentId: SUGGESTIONS_COMPONENT_ID,
      _componentType: "Suggestions",
      _inCanvas: true,
      title,
    });
  }, [_inCanvas, activeCanvasId, addComponent, canvases, createCanvas, title]);

  if (!_inCanvas) {
    return (
      <p className="text-sm text-slate-500 italic px-1">
        Suggestions are shown in the canvas →
      </p>
    );
  }

  return <SuggestionsContent title={title} />;
}

interface Suggestion {
  type: "streak" | "goal" | "explore" | "review" | "consistency";
  title: string;
  description: string;
  action?: string;
  priority: number;
}

function generateSuggestions(entries: LogEntry[], goals: Goal[]): Suggestion[] {
  const suggestions: Suggestion[] = [];
  const streak = calculateStreak(entries);
  const topTags = getTopTags(entries, 10);
  const now = new Date();
  const todayEntries = entries.filter((e) => {
    const d = new Date(e.createdAt);
    d.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime();
  });

  // Streak suggestion
  if (streak === 0 && todayEntries.length === 0) {
    suggestions.push({
      type: "streak",
      title: "Start Your Streak!",
      description:
        "You haven't logged anything today. Even a small learning counts!",
      action: "Log something you learned",
      priority: 10,
    });
  } else if (streak > 0 && todayEntries.length === 0) {
    suggestions.push({
      type: "streak",
      title: `Keep Your ${streak}-Day Streak!`,
      description: `You're on a ${streak}-day streak. Don't break it!`,
      action: "Log today's learning",
      priority: 9,
    });
  } else if (streak >= 7) {
    suggestions.push({
      type: "streak",
      title: `Amazing ${streak}-Day Streak!`,
      description:
        "You're building an incredible habit. Consider setting a more ambitious goal.",
      priority: 3,
    });
  }

  // Goal-related suggestions
  const activeGoals = goals.filter((g) => g.status === "active");
  if (activeGoals.length === 0 && entries.length > 3) {
    suggestions.push({
      type: "goal",
      title: "Set a Learning Goal",
      description:
        "You've been learning consistently. Setting a goal can help you stay focused.",
      action: "Create a goal",
      priority: 7,
    });
  }

  activeGoals.forEach((goal) => {
    const relatedEntries = entries.filter((e) =>
      e.tags.some((t) =>
        goal.relatedTags.some((gt) => gt.toLowerCase() === t.toLowerCase())
      )
    );
    const progress = goal.targetEntries
      ? Math.round((relatedEntries.length / goal.targetEntries) * 100)
      : 0;

    if (progress >= 80 && progress < 100) {
      suggestions.push({
        type: "goal",
        title: `Almost There: ${goal.title}`,
        description: `You're ${progress}% through your goal. Just a few more entries!`,
        action: `Log something about ${goal.relatedTags[0] || goal.title}`,
        priority: 8,
      });
    }

    if (goal.deadline) {
      const daysLeft = Math.ceil(
        (new Date(goal.deadline).getTime() - now.getTime()) / 86400000
      );
      if (daysLeft <= 7 && daysLeft > 0 && progress < 80) {
        suggestions.push({
          type: "goal",
          title: `Deadline Approaching: ${goal.title}`,
          description: `${daysLeft} days left and you're at ${progress}%. Time to focus!`,
          priority: 9,
        });
      }
    }
  });

  // Explore new topics
  if (topTags.length > 0 && entries.length > 5) {
    const dominantTag = topTags[0];
    if (dominantTag.count > entries.length * 0.5) {
      suggestions.push({
        type: "explore",
        title: "Diversify Your Learning",
        description: `Most of your entries are about #${dominantTag.tag}. Try exploring related topics!`,
        priority: 5,
      });
    }
  }

  // Review old learnings
  const oldEntries = entries.filter((e) => {
    const d = new Date(e.createdAt);
    return now.getTime() - d.getTime() > 14 * 86400000;
  });
  if (oldEntries.length > 5) {
    const randomOld = oldEntries[Math.floor(Math.random() * oldEntries.length)];
    suggestions.push({
      type: "review",
      title: "Review Past Learning",
      description: `Remember when you learned: "${randomOld.content.slice(0, 80)}${randomOld.content.length > 80 ? "..." : ""}"`,
      action: "Revisit and expand",
      priority: 4,
    });
  }

  // Consistency
  const weekdays = [0, 0, 0, 0, 0, 0, 0];
  entries.forEach((e) => {
    const day = new Date(e.createdAt).getDay();
    weekdays[day]++;
  });
  const leastActiveDay = weekdays.indexOf(Math.min(...weekdays));
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  if (entries.length > 14) {
    suggestions.push({
      type: "consistency",
      title: `${dayNames[leastActiveDay]}s Are Quiet`,
      description: `You log the least on ${dayNames[leastActiveDay]}s. Try to be consistent across the week.`,
      priority: 2,
    });
  }

  return suggestions.sort((a, b) => b.priority - a.priority).slice(0, 4);
}

function SuggestionsContent({ title }: { title: string }) {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const refresh = () => {
      setEntries(getEntries());
      setGoals(getGoals());
      setIsLoaded(true);
    };
    const timer = window.setTimeout(refresh, 0);
    window.addEventListener(TIL_STORE_CHANGED_EVENT, refresh);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(TIL_STORE_CHANGED_EVENT, refresh);
    };
  }, []);

  if (!isLoaded) {
    return (
      <div className="animate-pulse bg-gray-100 rounded-xl h-48 w-full max-w-2xl" />
    );
  }

  const suggestions = generateSuggestions(entries, goals);

  const typeIcons: Record<string, React.ReactNode> = {
    streak: <span className="text-lg">🔥</span>,
    goal: <span className="text-lg">🎯</span>,
    explore: <span className="text-lg">🧭</span>,
    review: <span className="text-lg">📖</span>,
    consistency: <span className="text-lg">📅</span>,
  };

  const typeColors: Record<string, string> = {
    streak: "border-l-orange-400",
    goal: "border-l-purple-400",
    explore: "border-l-blue-400",
    review: "border-l-green-400",
    consistency: "border-l-yellow-400",
  };

  return (
    <div className="w-full max-w-2xl bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-slate-200 p-6 shadow-lg">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          <h2 className="text-xl font-bold text-slate-800">{title}</h2>
        </div>
        <button
          onClick={() => setRefreshKey((k) => k + 1)}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-lg transition-colors"
          title="Refresh suggestions"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {suggestions.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <BookOpen className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="font-medium">Start learning to get suggestions</p>
          <p className="text-sm">Log your first entry and we&apos;ll guide you!</p>
        </div>
      ) : (
        <div className="space-y-3" key={refreshKey}>
          {suggestions.map((s, i) => (
            <div
              key={i}
              className={`bg-white rounded-lg border border-slate-200 border-l-4 ${typeColors[s.type]} p-4 hover:shadow-sm transition-shadow`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{typeIcons[s.type]}</div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-800 text-sm">
                    {s.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">{s.description}</p>
                  {s.action && (
                    <div className="flex items-center gap-1 mt-2 text-xs font-medium text-indigo-600">
                      <ArrowRight className="w-3 h-3" />
                      {s.action}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
