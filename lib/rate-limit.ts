const ipMap = new Map<string, { count: number; ts: number }>();

export const checkRateLimit = (ip: string, limit = 60, intervalMs = 60_000) => {
  const now = Date.now();
  const current = ipMap.get(ip);
  if (!current || now - current.ts > intervalMs) {
    ipMap.set(ip, { count: 1, ts: now });
    return true;
  }
  if (current.count >= limit) return false;
  current.count += 1;
  return true;
};
