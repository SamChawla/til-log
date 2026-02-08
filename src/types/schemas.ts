import { z } from "zod";

// Log Entry Schema
export const logEntrySchema = z.object({
  id: z.string().describe("Unique identifier for the log entry"),
  content: z.string().describe("What the user learned today"),
  tags: z.array(z.string()).describe("Auto-generated tags like #react, #typescript"),
  source: z.string().optional().describe("URL or resource where they learned from"),
  sourceName: z.string().optional().describe("Name of the source (e.g., 'Next.js Docs')"),
  goalId: z.string().optional().describe("Links to a learning goal if relevant"),
  createdAt: z.string().describe("ISO timestamp of when the entry was created"),
});

export type LogEntry = z.infer<typeof logEntrySchema>;

// Learning Goal Schema
export const goalSchema = z.object({
  id: z.string().describe("Unique identifier for the goal"),
  title: z.string().describe("Goal title like 'Learn Kubernetes'"),
  description: z.string().optional().describe("More details about the goal"),
  deadline: z.string().optional().describe("Target date to achieve the goal"),
  relatedTags: z.array(z.string()).describe("Tags that count toward this goal"),
  targetEntries: z.number().optional().describe("Target number of log entries"),
  status: z.enum(["active", "completed", "paused"]).describe("Current status of the goal"),
  createdAt: z.string().describe("ISO timestamp of when the goal was created"),
});

export type Goal = z.infer<typeof goalSchema>;

// Dashboard Stats Schema
export const dashboardStatsSchema = z.object({
  totalEntries: z.number().describe("Total number of log entries"),
  currentStreak: z.number().describe("Current daily streak"),
  longestStreak: z.number().describe("Longest streak achieved"),
  topTags: z.array(z.object({
    tag: z.string(),
    count: z.number(),
  })).describe("Most used tags"),
  thisWeekEntries: z.number().describe("Entries logged this week"),
  activeGoals: z.number().describe("Number of active goals"),
});

export type DashboardStats = z.infer<typeof dashboardStatsSchema>;

// Export Options Schema (for Excel export)
export const exportOptionsSchema = z.object({
  dateRange: z.object({
    start: z.string().optional(),
    end: z.string().optional(),
  }).optional().describe("Filter by date range"),
  tags: z.array(z.string()).optional().describe("Filter by specific tags"),
  goalId: z.string().optional().describe("Filter by goal"),
  format: z.enum(["xlsx", "csv"]).describe("Export format"),
});

export type ExportOptions = z.infer<typeof exportOptionsSchema>;