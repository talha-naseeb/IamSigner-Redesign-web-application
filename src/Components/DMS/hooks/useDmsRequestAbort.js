import { useCallback, useEffect, useRef } from "react";
import { isAxiosAbortError } from "../utils/dmsApiErrors";

/**
 * Runs async DMS requests with per-key AbortController so stale responses are ignored.
 */
export const useDmsRequestAbort = () => {
  const controllersRef = useRef(new Map());

  const abortKey = useCallback((key) => {
    const controller = controllersRef.current.get(key);
    if (controller) {
      controller.abort();
      controllersRef.current.delete(key);
    }
  }, []);

  const abortAll = useCallback(() => {
    controllersRef.current.forEach((controller) => controller.abort());
    controllersRef.current.clear();
  }, []);

  const runWithAbort = useCallback(async (key, fn) => {
    abortKey(key);
    const controller = new AbortController();
    controllersRef.current.set(key, controller);
    try {
      return await fn(controller.signal);
    } catch (error) {
      if (isAxiosAbortError(error)) return { aborted: true, error };
      throw error;
    } finally {
      if (controllersRef.current.get(key) === controller) {
        controllersRef.current.delete(key);
      }
    }
  }, [abortKey]);

  useEffect(() => () => abortAll(), [abortAll]);

  return { runWithAbort, abortKey, abortAll, isAxiosAbortError };
};
