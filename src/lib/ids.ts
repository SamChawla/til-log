let fallbackCounter = 0;

export function createLogEntryId(): string {
  const uuid =
    typeof globalThis.crypto !== "undefined" &&
    typeof globalThis.crypto.randomUUID === "function"
      ? globalThis.crypto.randomUUID()
      : null;

  if (uuid) return `entry-${uuid}`;

  const perfNow =
    typeof globalThis.performance !== "undefined" &&
    typeof globalThis.performance.now === "function"
      ? globalThis.performance.now()
      : null;

  fallbackCounter += 1;

  const time =
    typeof perfNow === "number"
      ? `${Date.now()}-${String(perfNow).replace(".", "-")}`
      : `${Date.now()}`;

  return `entry-${time}-${fallbackCounter}-${Math.random().toString(36).slice(2, 10)}`;
}
