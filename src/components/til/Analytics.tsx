"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Tag,
  Target,
  Brain,
  Flame,
  Award,
} from "lucide-react";
import {
  getEntries,
  getGoals,
  getTopTags,
  calculateStreak,
  calculateLongestStreak,
  TIL_STORE_CHANGED_EVENT,
} from "@/lib/store";
import { LogEntry, Goal } from "@/types/schemas";
import { useCanvasStore } from "@/lib/canvas-storage";

interface AnalyticsProps {
  title?: string;
  timeRange?: "7d" | "30d" | "90d" | "all";
  _inCanvas?: boolean;
}

const ANALYTICS_COMPONENT_ID = "analytics-main";
const ENTRIES_STORAGE_KEY = "til-log-entries";
const GOALS_STORAGE_KEY = "til-log-goals";

export default function Analytics({
  title = "Learning Analytics",
  timeRange = "30d",
  _inCanvas,
}: AnalyticsProps) {
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
      .some((c) => c.componentId === ANALYTICS_COMPONENT_ID);
    if (alreadyInCanvas) return;

    addComponent(targetCanvasId, {
      componentId: ANALYTICS_COMPONENT_ID,
      _componentType: "Analytics",
      _inCanvas: true,
      title,
      timeRange,
    });
  }, [_inCanvas, activeCanvasId, addComponent, canvases, createCanvas, title, timeRange]);

  if (!_inCanvas) {
    return (
      <p className="text-sm text-slate-500 italic px-1">
        Your analytics view is shown in the canvas →
      </p>
    );
  }

  return <AnalyticsContent title={title} timeRange={timeRange} />;
}

function AnalyticsContent({
  title,
  timeRange,
}: {
  title: string;
  timeRange: string;
}) {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const refresh = () => {
      setEntries(getEntries());
      setGoals(getGoals());
      setIsLoaded(true);
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.storageArea !== localStorage) return;
      if (e.key !== ENTRIES_STORAGE_KEY && e.key !== GOALS_STORAGE_KEY) return;
      refresh();
    };

    const timer = window.setTimeout(refresh, 0);
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(TIL_STORE_CHANGED_EVENT, refresh);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(TIL_STORE_CHANGED_EVENT, refresh);
    };
  }, []);

  if (!isLoaded) {
    return (
      <div className="animate-pulse bg-gray-100 rounded-xl h-64 w-full max-w-3xl" />
    );
  }

  // Filter entries by time range
  const now = new Date();
  const rangeMs: Record<string, number> = {
    "7d": 7 * 86400000,
    "30d": 30 * 86400000,
    "90d": 90 * 86400000,
    all: Infinity,
  };
  const cutoff = new Date(now.getTime() - (rangeMs[timeRange] ?? rangeMs["30d"]));
  const filteredEntries =
    timeRange === "all"
      ? entries
      : entries.filter((e) => new Date(e.createdAt) >= cutoff);

  const currentStreak = calculateStreak(entries);
  const longestStreak = calculateLongestStreak(entries);
  const topTags = getTopTags(filteredEntries, 8);
  const activeGoals = goals.filter((g) => g.status === "active");
  const completedGoals = goals.filter((g) => g.status === "completed");

  // Weekly activity for last 4 weeks
  const weeks = Array.from({ length: 4 }, (_, i) => {
    const weekEnd = new Date(now.getTime() - i * 7 * 86400000);
    const weekStart = new Date(weekEnd.getTime() - 7 * 86400000);
    const count = entries.filter((e) => {
      const d = new Date(e.createdAt);
      return d >= weekStart && d < weekEnd;
    }).length;
    return {
      label: `W${4 - i}`,
      count,
      weekStart,
    };
  }).reverse();

  // Daily activity for heatmap (last 28 days)
  const heatmapDays = Array.from({ length: 28 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (27 - i));
    date.setHours(0, 0, 0, 0);
    const count = entries.filter((e) => {
      const entryDate = new Date(e.createdAt);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === date.getTime();
    }).length;
    return { date, count };
  });

  const maxHeatmapCount = Math.max(...heatmapDays.map((d) => d.count), 1);

  // Learning pace: entries per day this week vs last week
  const thisWeekEntries = entries.filter((e) => {
    const d = new Date(e.createdAt);
    return d >= new Date(now.getTime() - 7 * 86400000);
  }).length;
  const lastWeekEntries = entries.filter((e) => {
    const d = new Date(e.createdAt);
    return (
      d >= new Date(now.getTime() - 14 * 86400000) &&
      d < new Date(now.getTime() - 7 * 86400000)
    );
  }).length;
  const paceChange =
    lastWeekEntries > 0
      ? Math.round(((thisWeekEntries - lastWeekEntries) / lastWeekEntries) * 100)
      : thisWeekEntries > 0
      ? 100
      : 0;

  // Tag distribution for the chart
  const maxTagCount = Math.max(...topTags.map((t) => t.count), 1);

  return (
    <div className="w-full max-w-3xl bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl border border-slate-200 p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-bold text-slate-800">{title}</h2>
        </div>
        <span className="text-xs text-slate-400 bg-white px-2 py-1 rounded-full border border-slate-200">
          {timeRange === "all" ? "All time" : `Last ${timeRange.replace("d", " days")}`}
        </span>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <MetricCard
          icon={<Flame className="w-4 h-4 text-orange-600" />}
          iconBg="bg-orange-100"
          value={currentStreak}
          label="Current Streak"
          subtext={`Best: ${longestStreak}`}
        />
        <MetricCard
          icon={<Brain className="w-4 h-4 text-blue-600" />}
          iconBg="bg-blue-100"
          value={filteredEntries.length}
          label="Entries"
          subtext={`${entries.length} total`}
        />
        <MetricCard
          icon={<TrendingUp className="w-4 h-4 text-green-600" />}
          iconBg="bg-green-100"
          value={`${paceChange >= 0 ? "+" : ""}${paceChange}%`}
          label="Week vs Week"
          subtext={`${thisWeekEntries} this week`}
        />
        <MetricCard
          icon={<Target className="w-4 h-4 text-purple-600" />}
          iconBg="bg-purple-100"
          value={activeGoals.length}
          label="Active Goals"
          subtext={`${completedGoals.length} completed`}
        />
      </div>

      {/* Activity Heatmap */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-slate-600" />
          <h3 className="font-semibold text-slate-700 text-sm">
            Activity (Last 28 Days)
          </h3>
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
            <div
              key={i}
              className="text-center text-[10px] text-slate-400 font-medium"
            >
              {d}
            </div>
          ))}
          {heatmapDays.map(({ date, count }, i) => {
            const intensity =
              count === 0
                ? 0
                : Math.max(0.2, count / maxHeatmapCount);
            return (
              <div
                key={i}
                className="aspect-square rounded-sm transition-colors"
                style={{
                  backgroundColor:
                    count > 0
                      ? `rgba(79, 70, 229, ${intensity})`
                      : "#f1f5f9",
                }}
                title={`${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}: ${count} ${count === 1 ? "entry" : "entries"}`}
              />
            );
          })}
        </div>
        <div className="flex items-center justify-end gap-1 mt-2">
          <span className="text-[10px] text-slate-400">Less</span>
          {[0, 0.2, 0.4, 0.7, 1].map((intensity, i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-sm"
              style={{
                backgroundColor:
                  intensity === 0
                    ? "#f1f5f9"
                    : `rgba(79, 70, 229, ${intensity})`,
              }}
            />
          ))}
          <span className="text-[10px] text-slate-400">More</span>
        </div>
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Weekly Trend */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <h3 className="font-semibold text-slate-700 text-sm mb-3">
            Weekly Trend
          </h3>
          <div className="flex items-end justify-between gap-2" style={{ height: "80px" }}>
            {weeks.map(({ label, count }, i) => {
              const maxWeekCount = Math.max(...weeks.map((w) => w.count), 1);
              const heightPct = count > 0 ? Math.max((count / maxWeekCount) * 100, 15) : 8;
              return (
                <div key={i} className="flex flex-col items-center flex-1 h-full">
                  <div className="flex-1 w-full flex items-end">
                    <div
                      className={`w-full rounded-t-md transition-all ${
                        count > 0
                          ? "bg-gradient-to-t from-blue-500 to-blue-400"
                          : "bg-slate-200"
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1">{label}</span>
                  <span className="text-[10px] font-medium text-slate-700">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Tags Chart */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Tag className="w-4 h-4 text-slate-600" />
            <h3 className="font-semibold text-slate-700 text-sm">Top Topics</h3>
          </div>
          {topTags.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No tags yet</p>
          ) : (
            <div className="space-y-2">
              {topTags.slice(0, 5).map(({ tag, count }) => (
                <div key={tag} className="flex items-center gap-2">
                  <span className="text-xs text-slate-600 w-20 truncate">
                    #{tag}
                  </span>
                  <div className="flex-1 bg-slate-100 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all"
                      style={{
                        width: `${(count / maxTagCount) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs font-medium text-slate-700 w-6 text-right">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Goals Progress Overview */}
      {goals.length > 0 && (
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-4 h-4 text-purple-600" />
            <h3 className="font-semibold text-slate-700 text-sm">
              Goals Progress
            </h3>
          </div>
          <div className="space-y-3">
            {goals.slice(0, 4).map((goal) => {
              const relatedEntries = entries.filter((e) =>
                e.tags.some((t) =>
                  goal.relatedTags.some(
                    (gt) => gt.toLowerCase() === t.toLowerCase()
                  )
                )
              );
              const progress = goal.targetEntries
                ? Math.min(
                    Math.round(
                      (relatedEntries.length / goal.targetEntries) * 100
                    ),
                    100
                  )
                : 0;
              const statusIcon =
                goal.status === "completed"
                  ? "✅"
                  : goal.status === "paused"
                  ? "⏸️"
                  : "🎯";

              return (
                <div key={goal.id} className="flex items-center gap-3">
                  <span className="text-sm">{statusIcon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-700 truncate">
                        {goal.title}
                      </span>
                      <span className="text-xs text-slate-400 ml-2">
                        {progress}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1">
                      <div
                        className={`h-1.5 rounded-full transition-all ${
                          goal.status === "completed"
                            ? "bg-green-500"
                            : "bg-gradient-to-r from-purple-500 to-indigo-500"
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {entries.length === 0 && (
        <div className="text-center py-8 text-slate-500">
          <BarChart3 className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="font-medium">No data to analyze yet</p>
          <p className="text-sm">Start logging your learnings to see analytics!</p>
        </div>
      )}
    </div>
  );
}

function MetricCard({
  icon,
  iconBg,
  value,
  label,
  subtext,
}: {
  icon: React.ReactNode;
  iconBg: string;
  value: string | number;
  label: string;
  subtext: string;
}) {
  return (
    <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm">
      <div className={`inline-flex p-1.5 ${iconBg} rounded-lg mb-2`}>
        {icon}
      </div>
      <p className="text-xl font-bold text-slate-800">{value}</p>
      <p className="text-[11px] text-slate-500">{label}</p>
      <p className="text-[10px] text-slate-400">{subtext}</p>
    </div>
  );
}
