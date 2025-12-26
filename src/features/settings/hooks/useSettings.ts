import { useState, useEffect, useCallback } from "react";
import { getSettings, saveSettings, resetSettings } from "../api/settings-commands";
import type { AppSettings } from "../types/settings";
import { toast } from "sonner";

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getSettings();
      setSettings(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load settings";
      setError(errorMessage);
      toast.error("Failed to load settings", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const save = useCallback(async (newSettings: AppSettings) => {
    setIsSaving(true);
    setError(null);
    try {
      await saveSettings(newSettings);
      setSettings(newSettings);
      toast.success("Settings saved successfully");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to save settings";
      setError(errorMessage);
      toast.error("Failed to save settings", {
        description: errorMessage,
      });
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const reset = useCallback(async () => {
    setIsSaving(true);
    setError(null);
    try {
      const defaults = await resetSettings();
      setSettings(defaults);
      toast.success("Settings reset to defaults");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to reset settings";
      setError(errorMessage);
      toast.error("Failed to reset settings", {
        description: errorMessage,
      });
    } finally {
      setIsSaving(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    settings,
    isLoading,
    isSaving,
    error,
    loadSettings,
    save,
    reset,
  };
}


