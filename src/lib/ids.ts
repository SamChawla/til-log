type IdPrefix = "entry" | "goal";

const fallbackCounters: Record<IdPrefix, number> = {
  entry: 0,
  goal: 0,
};

function createId(prefix: IdPrefix): string {
  // IDs are persisted and should be treated as opaque strings (do not parse for ordering).
  const uuid =
    typeof globalThis.crypto !== "undefined" &&
    typeof globalThis.crypto.randomUUID === "function"
      ? globalThis.crypto.randomUUID()
      : null;

  if (uuid) return `${prefix}-${uuid}`;

  const perfNow =
    typeof globalThis.performance !== "undefined" &&
    typeof globalThis.performance.now === "function"
      ? globalThis.performance.now()
      : null;

  fallbackCounters[prefix] += 1;

  const time =
    typeof perfNow === "number"
      ? `${Date.now()}-${String(perfNow).replace(".", "-")}`
      : `${Date.now()}`;

  return `${prefix}-${time}-${fallbackCounters[prefix]}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createLogEntryId(): string {
  return createId("entry");
}

export function createGoalId(): string {
  return createId("goal");
}
