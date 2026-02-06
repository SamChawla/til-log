import { LogEntry, Goal } from "@/types/schemas";

// Simple in-memory store (we'll use localStorage for persistence)
const STORAGE_KEYS = {
  ENTRIES: "til-log-entries",
  GOALS: "til-log-goals",
};

// Helper to safely access localStorage
const isBrowser = typeof window !== "undefined";

// Log Entries
export function getEntries(): LogEntry[] {
  if (!isBrowser) return [];
  const data = localStorage.getItem(STORAGE_KEYS.ENTRIES);
  return data ? JSON.parse(data) : [];
}

export function saveEntry(entry: LogEntry): void {
  if (!isBrowser) return;
  const entries = getEntries();
  entries.unshift(entry); // Add to beginning
  localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(entries));
}

export function updateEntry(id: string, updates: Partial<LogEntry>): void {
  if (!isBrowser) return;
  const entries = getEntries();
  const index = entries.findIndex((e) => e.id === id);
  if (index !== -1) {
    entries[index] = { ...entries[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(entries));
  }
}

export function deleteEntry(id: string): void {
  if (!isBrowser) return;
  const entries = getEntries().filter((e) => e.id !== id);
  localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(entries));
}

// Goals
export function getGoals(): Goal[] {
  if (!isBrowser) return [];
  const data = localStorage.getItem(STORAGE_KEYS.GOALS);
  return data ? JSON.parse(data) : [];
}

export function saveGoal(goal: Goal): void {
  if (!isBrowser) return;
  const goals = getGoals();
  goals.unshift(goal);
  localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
}

export function updateGoal(id: string, updates: Partial<Goal>): void {
  if (!isBrowser) return;
  const goals = getGoals();
  const index = goals.findIndex((g) => g.id === id);
  if (index !== -1) {
    goals[index] = { ...goals[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
  }
}

export function deleteGoal(id: string): void {
  if (!isBrowser) return;
  const goals = getGoals().filter((g) => g.id !== id);
  localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
}

// Stats helpers
export function calculateStreak(entries: LogEntry[]): number {
  if (entries.length === 0) return 0;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const sortedDates = entries
    .map((e) => {
      const d = new Date(e.createdAt);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    })
    .filter((v, i, a) => a.indexOf(v) === i) // unique dates
    .sort((a, b) => b - a); // newest first

  let streak = 0;
  let checkDate = today.getTime();
  
  // Check if there's an entry today or yesterday to start the streak
  if (sortedDates[0] !== checkDate) {
    checkDate -= 86400000; // Check yesterday
    if (sortedDates[0] !== checkDate) {
      return 0; // No entry today or yesterday
    }
  }
  
  for (const date of sortedDates) {
    if (date === checkDate) {
      streak++;
      checkDate -= 86400000; // Move to previous day
    } else if (date < checkDate) {
      break; // Gap in streak
    }
  }
  
  return streak;
}

export function getTopTags(entries: LogEntry[], limit = 5): { tag: string; count: number }[] {
  const tagCounts: Record<string, number> = {};
  
  entries.forEach((entry) => {
    entry.tags.forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });
  
  return Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}