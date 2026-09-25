// Pure utility: formats a raw task UUID/ID into a short, human-friendly
// display ID, e.g. "a1b2c3d4-..." -> "TSK-A1B2C3".
export function formatDisplayId(taskId: string): string {
  const cleaned = taskId.replace(/-/g, "").toUpperCase();
  const shortCode = cleaned.slice(0, 6);
  return `TSK-${shortCode}`;
}