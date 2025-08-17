import { expect } from '@playwright/test';
import type { ApiResult } from '../api/types';

export function assertOk<T = unknown>(res: ApiResult<T>, msg?: string): T | ApiResult<T> {
  expect(res.status, msg).toBeGreaterThanOrEqual(200);
  expect(res.status, msg).toBeLessThan(300);
  expect(res.ok, msg ?? `API failed: ${JSON.stringify(res.data)}`).toBeTruthy();
  const data = res.data;
  return (data !== null && data !== undefined ? (data as T) : res) as T | ApiResult<T>;
}
