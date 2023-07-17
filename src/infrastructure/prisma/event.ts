type EventResult = {
  /** Resolves the event, waking up everyone waiting on `wait()`. */
  set: () => void;
  /**
   * Returns a promise that waits for `set()`.
   * If `set()` has already been called, returns immediately.
   */
  wait: () => Promise<void>;
};

/**
 * Creates an event for synchronization between promises.
 * This is similar to events in languages that make use of threads.
 */
export function Event(): EventResult {
  let resolve: () => void;
  const p = new Promise<void>((innerResolve) => {
    resolve = innerResolve;
  });
  return {
    set: () => resolve(),
    // eslint-disable-next-line no-return-await
    wait: async () => await p,
  };
}
