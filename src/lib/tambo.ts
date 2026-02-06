import { z } from "zod";
import { TamboComponent, TamboTool } from "@tambo-ai/react";
import LogEntryCard from "@/components/til/LogEntryCard";
import LogEntryForm from "@/components/til/LogEntryForm";
import Dashboard from "@/components/til/Dashboard";
import { 
  getEntries, 
  getGoals, 
  saveEntry, 
  calculateStreak, 
  calculateLongestStreak,
  getTopTags 
} from "@/lib/store";
import { dashboardStatsSchema, LogEntry } from "@/types/schemas";

// ============================================
// TAMBO COMPONENTS
// ============================================

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
        id: z.string(),
        content: z.string(),
        tags: z.array(z.string()),
        source: z.string().optional(),
        sourceName: z.string().optional(),
        goalId: z.string().optional(),
        createdAt: z.string(),
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
];

type ComponentUiCapabilities = {
  autoAddToCanvas?: boolean;
};

const componentUiCapabilities: Record<string, ComponentUiCapabilities> = {
  Dashboard: { autoAddToCanvas: true },
  LogEntryForm: { autoAddToCanvas: true },
  LogEntryCard: { autoAddToCanvas: true },
};

export function shouldAutoAddToCanvas(componentType: string): boolean {
  return !!componentUiCapabilities[componentType]?.autoAddToCanvas;
}

// ============================================
// TAMBO TOOLS
// ============================================

export const tools: TamboTool[] = [
  {
    name: "get-all-entries",
    description: "Get all learning log entries. Use this to retrieve the user's learning history.",
    tool: () => {
      const entries = getEntries();
      return entries;
    },
    inputSchema: z.object({}),
    outputSchema: z.array(z.object({
      id: z.string(),
      content: z.string(),
      tags: z.array(z.string()),
      source: z.string().optional(),
      sourceName: z.string().optional(),
      createdAt: z.string(),
    })),
  },
  {
    name: "get-learning-stats",
    description: "Get statistics about the user's learning progress including streak, total entries, and top tags.",
    tool: () => {
      const entries = getEntries();
      const goals = getGoals();
      
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thisWeekEntries = entries.filter(
        (e) => new Date(e.createdAt) >= weekAgo
      ).length;

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
    description: "Search learning entries by a specific tag. Use this when the user wants to see entries about a specific topic.",
    tool: ({ tag }: { tag: string }) => {
      const entries = getEntries();
      return entries.filter((e) => 
        e.tags.some((t) => t.toLowerCase().includes(tag.toLowerCase()))
      );
    },
    inputSchema: z.object({
      tag: z.string().describe("The tag to search for"),
    }),
    outputSchema: z.array(z.object({
      id: z.string(),
      content: z.string(),
      tags: z.array(z.string()),
      source: z.string().optional(),
      sourceName: z.string().optional(),
      createdAt: z.string(),
    })),
  },
  {
    name: "add-learning-entry",
    description: "Add a new learning entry directly. Use this when the user describes what they learned in conversation.",
    tool: ({ content, tags, source, sourceName }: { 
      content: string; 
      tags: string[]; 
      source?: string; 
      sourceName?: string;
    }) => {
      const entry: LogEntry = {
        id: `entry-${Date.now()}`,
        content,
        tags,
        source,
        sourceName,
        createdAt: new Date().toISOString(),
      };
      saveEntry(entry);
      return entry;
    },
    inputSchema: z.object({
      content: z.string().describe("What the user learned"),
      tags: z.array(z.string()).describe("Relevant tags for the learning"),
      source: z.string().optional().describe("URL source if provided"),
      sourceName: z.string().optional().describe("Name of the source"),
    }),
    outputSchema: z.object({
      id: z.string(),
      content: z.string(),
      tags: z.array(z.string()),
      source: z.string().optional(),
      sourceName: z.string().optional(),
      createdAt: z.string(),
    }),
  },
];
