export type RetryOptions = {
  retries?: number;
  delayMs?: number;
  factor?: number; // backoff multiplier
};

export async function retry<T>(fn: () => Promise<T>, opts: RetryOptions = {}): Promise<T> {
  const retries = opts.retries ?? 3;
  const factor = opts.factor ?? 1.6;
  let delay = opts.delayMs ?? 400;
  let lastErr: unknown;
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      if (i === retries) break;
      await new Promise((r) => setTimeout(r, delay));
      delay = Math.round(delay * factor);
    }
  }
  throw lastErr;
}
