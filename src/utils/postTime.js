const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function formatPostTime(createdAt, now = Date.now()) {
  if (!createdAt) return 'Just now';
  const timestamp = new Date(createdAt).getTime();
  if (!Number.isFinite(timestamp)) return 'Just now';
  const elapsed = Math.max(0, now - timestamp);

  if (elapsed < MINUTE) return 'Just now';
  if (elapsed < HOUR) return `${Math.floor(elapsed / MINUTE)}m ago`;
  if (elapsed < DAY) return `${Math.floor(elapsed / HOUR)}h ago`;
  if (elapsed < DAY * 2) return 'Yesterday';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(timestamp);
}
