import { z } from "zod";
import { TamboComponent, TamboTool } from "@tambo-ai/react";
import LogEntryCard from "@/components/til/LogEntryCard";
import LogEntryForm from "@/components/til/LogEntryForm";
import Dashboard from "@/components/til/Dashboard";
import GoalCard from "@/components/til/GoalCard";
import GoalForm from "@/components/til/GoalForm";
import Analytics from "@/components/til/Analytics";
import Suggestions from "@/components/til/Suggestions";
import {
  getEntries, getGoals, saveEntry, saveGoal, updateGoal, deleteGoal,
  calculateStreak, calculateLongestStreak, getTopTags, clearAllData,
} from "@/lib/store";
import { dashboardStatsSchema, logEntrySchema, goalSchema, LogEntry, Goal } from "@/types/schemas";
import { createGoalId, createLogEntryId } from "@/lib/ids";

export const components: TamboComponent[] = [
  {
    name: "LogEntryForm",
    description: "A form to log what the user learned today. Use this when the user wants to add a new learning entry, log something they learned, or record a TIL.",
    component: LogEntryForm,
    propsSchema: z.object({
      suggestedTags: z.array(z.string()).optional().describe("Suggested tags based on context"),
    }),
  },
  {
    name: "LogEntryCard",
    description: "Displays a single learning log entry with content, tags, and source. Use this to show a specific learning entry.",
    component: LogEntryCard,
    propsSchema: z.object({
      entry: z.object({
        id: z.string(), content: z.string(), tags: z.array(z.string()),
        source: z.string().optional(), sourceName: z.string().optional(),
        goalId: z.string().optional(), createdAt: z.string(),
      }).describe("The log entry to display"),
    }),
  },
  {
    name: "Dashboard",
    description: "Shows the user's learning dashboard with stats, streaks, activity chart, and top topics. Use this when the user wants to see their progress, stats, dashboard, or overview.",
    component: Dashboard,
    propsSchema: z.object({
      title: z.string().optional().describe("Custom title for the dashboard"),
    }),
  },
  {
    name: "GoalCard",
    description: "Displays a single learning goal with progress bar, status, related tags, and action buttons. Use this when showing a specific goal.",
    component: GoalCard,
    propsSchema: z.object({
      goal: z.object({
        id: z.string(), title: z.string(), description: z.string().optional(),
        deadline: z.string().optional(), relatedTags: z.array(z.string()),
        targetEntries: z.number().optional(),
        status: z.enum(["active", "completed", "paused"]),
        createdAt: z.string(),
      }).describe("The goal to display"),
    }),
  },
  {
    name: "GoalForm",
    description: "A form to create a new learning goal. Use this when the user wants to set a goal, create a target, or plan their learning.",
    component: GoalForm,
    propsSchema: z.object({
      suggestedTags: z.array(z.string()).optional().describe("Suggested tags for the goal"),
    }),
  },
  {
    name: "Analytics",
    description: "Shows detailed learning analytics with heatmap, weekly trends, topic distribution, and goal progress. Use this when the user wants to see analytics, insights, data visualization, charts about their learning, or asks about their learning patterns.",
    component: Analytics,
    propsSchema: z.object({
      title: z.string().optional().describe("Custom title for the analytics view"),
      timeRange: z.enum(["7d", "30d", "90d", "all"]).optional().describe("Time range filter"),
    }),
  },
  {
    name: "Suggestions",
    description: "Shows AI-powered personalized learning suggestions based on the user's history, streak, and goals. Use this when the user asks for suggestions, recommendations, tips, what to learn next, or learning advice.",
    component: Suggestions,
    propsSchema: z.object({
      title: z.string().optional().describe("Custom title for the suggestions panel"),
    }),
  },
];

type ComponentUiCapabilities = { autoAddToCanvas?: boolean };

const componentUiCapabilities: Record<string, ComponentUiCapabilities> = {
  Dashboard: { autoAddToCanvas: true },
  LogEntryForm: { autoAddToCanvas: true },
  LogEntryCard: { autoAddToCanvas: true },
  GoalCard: { autoAddToCanvas: true },
  GoalForm: { autoAddToCanvas: true },
  Analytics: { autoAddToCanvas: true },
  Suggestions: { autoAddToCanvas: true },
};

export function shouldAutoAddToCanvas(componentType: string): boolean {
  return !!componentUiCapabilities[componentType]?.autoAddToCanvas;
}

// ============================================
// TAMBO TOOLS
// ============================================

const entryOutputSchema = z.array(z.object({
  id: z.string(), content: z.string(), tags: z.array(z.string()),
  source: z.string().optional(), sourceName: z.string().optional(), createdAt: z.string(),
}));

export const tools: TamboTool[] = [
  {
    name: "get-all-entries",
    description: "Get all learning log entries. Use this to retrieve the user's learning history.",
    tool: () => getEntries(),
    inputSchema: z.object({}),
    outputSchema: entryOutputSchema,
  },
  {
    name: "get-learning-stats",
    description: "Get statistics about the user's learning progress including streak, total entries, and top tags.",
    tool: () => {
      const entries = getEntries();
      const goals = getGoals();
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 86400000);
      const thisWeekEntries = entries.filter((e) => new Date(e.createdAt) >= weekAgo).length;
      return {
        totalEntries: entries.length,
        currentStreak: calculateStreak(entries),
        longestStreak: calculateLongestStreak(entries),
        topTags: getTopTags(entries, 5),
        thisWeekEntries,
        activeGoals: goals.filter((g) => g.status === "active").length,
      };
    },
    inputSchema: z.object({}),
    outputSchema: dashboardStatsSchema,
  },
  {
    name: "search-entries-by-tag",
    description: "Search learning entries by a specific tag.",
    tool: ({ tag }: { tag: string }) => {
      return getEntries().filter((e) => e.tags.some((t) => t.toLowerCase().includes(tag.toLowerCase())));
    },
    inputSchema: z.object({ tag: z.string().describe("The tag to search for") }),
    outputSchema: entryOutputSchema,
  },
  {
    name: "add-learning-entry",
    description: "Add a new learning entry directly. Use this when the user describes what they learned in conversation.",
    tool: ({ content, tags, source, sourceName }: { content: string; tags: string[]; source?: string; sourceName?: string }) => {
      const entry: LogEntry = { id: createLogEntryId(), content, tags, source, sourceName, createdAt: new Date().toISOString() };
      saveEntry(entry);
      return entry;
    },
    inputSchema: z.object({
      content: z.string().describe("What the user learned"),
      tags: z.array(z.string()).describe("Relevant tags"),
      source: z.string().optional().describe("URL source"),
      sourceName: z.string().optional().describe("Source name"),
    }),
    outputSchema: logEntrySchema,
  },
  {
    name: "get-all-goals",
    description: "Get all learning goals with their current status.",
    tool: () => getGoals(),
    inputSchema: z.object({}),
    outputSchema: z.array(goalSchema),
  },
  {
    name: "add-goal",
    description: "Create a new learning goal. Use when the user wants to set a learning target.",
    tool: ({ title, description, deadline, relatedTags, targetEntries }: { title: string; description?: string; deadline?: string; relatedTags: string[]; targetEntries?: number }) => {
      const goal: Goal = {
        id: createGoalId(),
        title, description, deadline, relatedTags,
        targetEntries: targetEntries ?? 10,
        status: "active",
        createdAt: new Date().toISOString(),
      };
      saveGoal(goal);
      return goal;
    },
    inputSchema: z.object({
      title: z.string().describe("Goal title"),
      description: z.string().optional().describe("Goal description"),
      deadline: z.string().optional().describe("Target date (ISO format)"),
      relatedTags: z.array(z.string()).describe("Tags that count toward this goal"),
      targetEntries: z.number().optional().describe("Number of entries to target"),
    }),
    outputSchema: goalSchema,
  },
  {
    name: "update-goal-status",
    description: "Update the status of a learning goal (active, completed, paused).",
    tool: ({ goalId, status }: { goalId: string; status: string }) => {
      updateGoal(goalId, { status: status as "active" | "completed" | "paused" });
      return getGoals().find((g) => g.id === goalId) || null;
    },
    inputSchema: z.object({
      goalId: z.string().describe("The goal ID to update"),
      status: z.enum(["active", "completed", "paused"]).describe("New status"),
    }),
    outputSchema: goalSchema.nullable(),
  },
  {
    name: "delete-goal",
    description: "Delete a learning goal.",
    tool: ({ goalId }: { goalId: string }) => {
      deleteGoal(goalId);
      return { success: true, deletedId: goalId };
    },
    inputSchema: z.object({ goalId: z.string().describe("Goal ID to delete") }),
    outputSchema: z.object({ success: z.boolean(), deletedId: z.string() }),
  },
  {
    name: "get-analytics-summary",
    description: "Get comprehensive analytics summary of learning patterns, habits, and progress. Use when the user asks about their learning patterns or wants a data-driven overview.",
    tool: () => {
      const entries = getEntries();
      const goals = getGoals();
      const now = new Date();

      const thisWeek = entries.filter((e) => new Date(e.createdAt) >= new Date(now.getTime() - 7 * 86400000)).length;
      const lastWeek = entries.filter((e) => {
        const d = new Date(e.createdAt);
        return d >= new Date(now.getTime() - 14 * 86400000) && d < new Date(now.getTime() - 7 * 86400000);
      }).length;

      const dayDistribution = [0, 0, 0, 0, 0, 0, 0];
      entries.forEach((e) => { dayDistribution[new Date(e.createdAt).getDay()]++; });
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

      const monthlyEntries = Array.from({ length: 3 }, (_, i) => {
        const ms = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const me = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        return { month: ms.toLocaleString("default", { month: "long" }), count: entries.filter((e) => { const d = new Date(e.createdAt); return d >= ms && d <= me; }).length };
      }).reverse();

      return {
        totalEntries: entries.length,
        currentStreak: calculateStreak(entries),
        longestStreak: calculateLongestStreak(entries),
        topTags: getTopTags(entries, 10),
        thisWeekEntries: thisWeek,
        lastWeekEntries: lastWeek,
        weekOverWeekChange: lastWeek > 0 ? Math.round(((thisWeek - lastWeek) / lastWeek) * 100) : thisWeek > 0 ? 100 : 0,
        dayOfWeekDistribution: dayNames.map((name, i) => ({ day: name, count: dayDistribution[i] })),
        monthlyEntries,
        totalGoals: goals.length,
        activeGoals: goals.filter((g) => g.status === "active").length,
        completedGoals: goals.filter((g) => g.status === "completed").length,
        averageEntriesPerDay: entries.length > 0 ? (() => {
          const first = new Date(entries[entries.length - 1].createdAt);
          const days = Math.max(1, Math.ceil((now.getTime() - first.getTime()) / 86400000));
          return Math.round((entries.length / days) * 10) / 10;
        })() : 0,
      };
    },
    inputSchema: z.object({}),
    outputSchema: z.object({
      totalEntries: z.number(), currentStreak: z.number(), longestStreak: z.number(),
      topTags: z.array(z.object({ tag: z.string(), count: z.number() })),
      thisWeekEntries: z.number(), lastWeekEntries: z.number(), weekOverWeekChange: z.number(),
      dayOfWeekDistribution: z.array(z.object({ day: z.string(), count: z.number() })),
      monthlyEntries: z.array(z.object({ month: z.string(), count: z.number() })),
      totalGoals: z.number(), activeGoals: z.number(), completedGoals: z.number(),
      averageEntriesPerDay: z.number(),
    }),
  },
  {
    name: "clear-all-data",
    description: "Clear all learning entries and goals. Use this when the user wants to start fresh, reset their data, or delete everything.",
    tool: () => {
      clearAllData();
      return { success: true, message: "All entries and goals have been cleared." };
    },
    inputSchema: z.object({}),
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
    }),
  },
];
