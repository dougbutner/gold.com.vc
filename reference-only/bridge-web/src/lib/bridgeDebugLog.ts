const clientEnabled =
  typeof process !== "undefined" &&
  process.env.NEXT_PUBLIC_BRIDGE_ENABLE_FILE_LOG === "true";

export async function bridgeDebugLog(
  level: "error" | "warn" | "info",
  message: string,
  context?: Record<string, unknown>
): Promise<void> {
  if (!clientEnabled) return;
  try {
    await fetch("/api/bridge-debug-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        level,
        message,
        context,
        ts: new Date().toISOString(),
      }),
    });
  } catch {
    // Avoid breaking UX if logging fails
  }
}
