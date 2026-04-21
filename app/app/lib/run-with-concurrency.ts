/**
 * Run `worker` over each item in `items`, keeping at most `limit` promises in
 * flight at any time. Resolves when every item has settled (worker may throw;
 * errors are reported via `onSettled` but do not abort the pool).
 *
 * `onSettled` is invoked once per item, in completion order. Use it to update
 * per-row UI state as each worker finishes.
 */
export async function runWithConcurrency<T, R>(
  items: readonly T[],
  worker: (item: T, index: number) => Promise<R>,
  limit: number,
  onSettled?: (result: { item: T; index: number; value?: R; error?: unknown; ok: boolean }) => void,
  shouldAbort?: () => boolean,
): Promise<void> {
  if (items.length === 0) return;
  const effectiveLimit = Math.max(1, Math.min(limit, items.length));
  let nextIndex = 0;

  const runNext = async (): Promise<void> => {
    while (true) {
      if (shouldAbort?.()) return;
      const index = nextIndex++;
      if (index >= items.length) return;
      const item = items[index]!;
      try {
        const value = await worker(item, index);
        onSettled?.({ item, index, value, ok: true });
      } catch (error) {
        onSettled?.({ item, index, error, ok: false });
      }
    }
  };

  await Promise.all(Array.from({ length: effectiveLimit }, () => runNext()));
}
