export type FavoriteEntity = 'casino_games' | 'instant_games';

export function extractFavoriteIds(raw: unknown, key: FavoriteEntity): string[] {
  let data: unknown = raw;
  if (typeof raw === 'string') {
    try {
      data = JSON.parse(raw);
    } catch {
      return [];
    }
  }

  const d = data && typeof data === 'object' ? (data as Record<string, unknown>) : undefined;

  const dig = (obj: Record<string, unknown> | undefined, path: string[]): unknown =>
    path.reduce<unknown>(
      (acc, k) =>
        acc && typeof acc === 'object' && acc !== null && k in (acc as Record<string, unknown>)
          ? (acc as Record<string, unknown>)[k]
          : undefined,
      obj as unknown,
    );

  const candidates: unknown[] = [
    dig(d, ['entities', key]),
    dig(d, ['response', 'entities', key]),
    dig(d, ['response', key]),
    dig(d, ['data', 'entities', key]),
    dig(d, [key]),
  ];

  let items: unknown = candidates.find(Array.isArray);
  if (!Array.isArray(items) && d) {
    const maybe = Object.values(d).find(
      (v) => v && typeof v === 'object' && Array.isArray((v as Record<string, unknown>)?.[key]),
    ) as Record<string, unknown> | undefined;
    items = maybe?.[key] as unknown;
  }

  if (!Array.isArray(items)) return [];

  const ids = (items as unknown[])
    .map((x) => {
      if (typeof x === 'string') return x;
      if (x && typeof x === 'object') {
        const o = x as Record<string, unknown>;
        return (typeof o.id === 'string' && o.id) || (typeof o.slug === 'string' && o.slug) || '';
      }
      return '';
    })
    .filter((s): s is string => typeof s === 'string' && s.length > 0);

  return Array.from(new Set(ids));
}
