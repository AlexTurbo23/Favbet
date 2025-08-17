import type { ApiResult } from '../types/types';

/**
 * Пробует последовательность асинхронных вызовов и возвращает первый успешный (res.ok === true).
 * Если все попытки неуспешны — возвращает последний ответ или кидает ошибку, если ни одного ответа нет.
 */
export async function tryInOrder<T = unknown>(
  fns: Array<() => Promise<ApiResult<T>>>,
  { pauseMs = 0 }: { pauseMs?: number } = {},
  wait: (ms: number) => Promise<void> = (ms) => new Promise((r) => setTimeout(r, ms)),
): Promise<ApiResult<T>> {
  let last: ApiResult<T> | undefined;

  for (const fn of fns) {
    const res = await fn();
    if (res.ok) return res;
    last = res;
    if (pauseMs > 0) await wait(pauseMs);
  }

  if (!last) throw new Error('All attempts failed and no ApiResult captured');
  return last;
}
