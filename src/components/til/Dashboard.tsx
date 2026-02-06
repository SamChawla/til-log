"use client";

import { useEffect, useState } from "react";
import { 
  Flame, 
  BookOpen, 
  Target, 
  TrendingUp,
  Calendar,
  Tag
} from "lucide-react";
import { getEntries, getGoals, calculateStreak, getTopTags } from "@/lib/store";
import { LogEntry, Goal } from "@/types/schemas";
import { useCanvasStore } from "@/lib/canvas-storage";

interface DashboardProps {
  title?: string;
  _inCanvas?: boolean;
}

const DASHBOARD_COMPONENT_ID = "dashboard-main";

export default function Dashboard({ title = "Your Learning Dashboard", _inCanvas }: DashboardProps) {
  const { activeCanvasId, addComponent, createCanvas } = useCanvasStore();

  useEffect(() => {
    if (_inCanvas) return;

    let targetCanvasId = activeCanvasId;
    if (!targetCanvasId) {
      const newCanvas = createCanvas();
      targetCanvasId = newCanvas.id;
    }
    if (!targetCanvasId) return;

    addComponent(targetCanvasId, {
      componentId: DASHBOARD_COMPONENT_ID,
      _componentType: "Dashboard",
      _inCanvas: true,
      title,
    });
  }, [_inCanvas, activeCanvasId, addComponent, createCanvas, title]);

  if (!_inCanvas) {
    return (
      <p className="text-sm text-slate-500 italic px-1">
        Your dashboard is shown in the canvas →
      </p>
    );
  }

  return <DashboardContent title={title} />;
}

function DashboardContent({ title }: { title: string }) {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setEntries(getEntries());
    setGoals(getGoals());
    setIsLoaded(true);
  }, []);

  if (!isLoaded) {
    return (
      <div className="animate-pulse bg-gray-100 rounded-xl h-64 w-full max-w-2xl" />
    );
  }

  const currentStreak = calculateStreak(entries);
  const topTags = getTopTags(entries, 5);
  
  // Calculate this week's entries
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thisWeekEntries = entries.filter(
    (e) => new Date(e.createdAt) >= weekAgo
  ).length;

  // Calculate activity for last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    date.setHours(0, 0, 0, 0);
    return date;
  });

  const activityMap = last7Days.map((date) => {
    const count = entries.filter((e) => {
      const entryDate = new Date(e.createdAt);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === date.getTime();
    }).length;
    return { date, count };
  });

  const activeGoals = goals.filter((g) => g.status === "active");

  return (
    <div className="w-full max-w-2xl bg-gradient-to-br from-slate-50 to-indigo-50 rounded-2xl border border-slate-200 p-6 shadow-lg">
      {/* Header */}
      <h2 className="text-xl font-bold text-slate-800 mb-6">{title}</h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Streak */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Flame className="w-4 h-4 text-orange-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-800">{currentStreak}</p>
          <p className="text-xs text-slate-500">Day Streak</p>
        </div>

        {/* Total Entries */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-800">{entries.length}</p>
          <p className="text-xs text-slate-500">Total Entries</p>
        </div>

        {/* This Week */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-800">{thisWeekEntries}</p>
          <p className="text-xs text-slate-500">This Week</p>
        </div>

        {/* Active Goals */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Target className="w-4 h-4 text-purple-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-800">{activeGoals.length}</p>
          <p className="text-xs text-slate-500">Active Goals</p>
        </div>
      </div>

      {/* Activity Chart (Last 7 Days) */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-4 h-4 text-slate-600" />
          <h3 className="font-semibold text-slate-700">Last 7 Days</h3>
        </div>
        <div className="flex items-end justify-between gap-2" style={{ height: "96px" }}>
          {activityMap.map(({ date, count }, i) => {
            const maxCount = Math.max(...activityMap.map((a) => a.count), 1);
            const heightPercent = count > 0 ? Math.max((count / maxCount) * 100, 20) : 8;
            const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
            
            return (
              <div key={i} className="flex flex-col items-center flex-1 h-full">
                <div className="flex-1 w-full flex items-end">
                  <div
                    className={`w-full rounded-t-md transition-all ${
                      count > 0 
                        ? "bg-gradient-to-t from-indigo-500 to-indigo-400" 
                        : "bg-slate-200"
                    }`}
                    style={{ height: `${heightPercent}%` }}
                    title={`${count} ${count === 1 ? "entry" : "entries"}`}
                  />
                </div>
                <span className="text-xs text-slate-500 mt-2">{dayName}</span>
              </div>
            );
          })}
        </div>
        
        {/* Activity Summary */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="flex justify-between text-sm text-slate-600">
            <span>Total this week:</span>
            <span className="font-semibold">{thisWeekEntries} {thisWeekEntries === 1 ? "entry" : "entries"}</span>
          </div>
        </div>
      </div>

      {/* Top Tags */}
      {topTags.length > 0 && (
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Tag className="w-4 h-4 text-slate-600" />
            <h3 className="font-semibold text-slate-700">Top Topics</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {topTags.map(({ tag, count }) => (
              <span
                key={tag}
                className="px-3 py-1.5 bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-700 text-sm font-medium rounded-full border border-indigo-100"
              >
                #{tag} <span className="text-indigo-400">({count})</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {entries.length === 0 && (
        <div className="text-center py-8 text-slate-500">
          <BookOpen className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="font-medium">No entries yet</p>
          <p className="text-sm">Start logging what you learn!</p>
        </div>
      )}
    </div>
  );
}