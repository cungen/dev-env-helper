import { useState, useCallback, useEffect } from "react";
import type { RestoreState } from "../types/restore";

const STORAGE_KEY = "restore-state";
const EXPIRATION_MS = 24 * 60 * 60 * 1000; // 24 hours

interface StoredRestoreState {
  data: RestoreState;
  timestamp: number;
}

export function useRestoreState() {
  const [restoreState, setRestoreState] = useState<RestoreState | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;

      const parsed: StoredRestoreState = JSON.parse(stored);
      const now = Date.now();

      // Check if expired
      if (now - parsed.timestamp > EXPIRATION_MS) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }

      return parsed.data;
    } catch (error) {
      console.error("Failed to load restore state:", error);
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  });

  const setRestoreData = useCallback((data: RestoreState) => {
    try {
      const stored: StoredRestoreState = {
        data,
        timestamp: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
      setRestoreState(data);
    } catch (error) {
      console.error("Failed to save restore state:", error);
    }
  }, []);

  const clearRestoreData = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setRestoreState(null);
    } catch (error) {
      console.error("Failed to clear restore state:", error);
    }
  }, []);

  // Clean up expired data on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: StoredRestoreState = JSON.parse(stored);
        const now = Date.now();

        if (now - parsed.timestamp > EXPIRATION_MS) {
          localStorage.removeItem(STORAGE_KEY);
          setRestoreState(null);
        }
      }
    } catch (error) {
      // Ignore errors during cleanup
    }
  }, []);

  return {
    restoreState,
    setRestoreData,
    clearRestoreData,
    hasRestoreData: restoreState !== null,
  };
}


