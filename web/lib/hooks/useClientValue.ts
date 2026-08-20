"use client";

import { useEffect, useState } from "react";

/**
 * Reads a browser-only value (e.g. localStorage) after hydration.
 * Returns undefined on the server and during the first client render.
 */
export function useClientValue<T>(read: () => T, deps: unknown[] = []): [T | undefined, (v: T) => void] {
  const [value, setValue] = useState<T>();
  useEffect(() => {
    let alive = true;
    queueMicrotask(() => {
      if (alive) setValue(read());
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return [value, setValue];
}
