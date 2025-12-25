import { useState, useCallback, useEffect } from "react";
import {
  listCustomTemplates,
  saveCustomTemplate,
  deleteCustomTemplate,
} from "../api/cli-commands";
import type { CliToolTemplate } from "../types/cli-tool";

export function useCustomTools() {
  const [templates, setTemplates] = useState<CliToolTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await listCustomTemplates();
      // Filter to only show custom templates (not built-in ones)
      const custom = data.filter((t) => !isBuiltinTemplate(t.id));
      setTemplates(custom);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load custom templates");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addTemplate = useCallback(async (template: CliToolTemplate) => {
    setIsLoading(true);
    setError(null);

    try {
      await saveCustomTemplate(template);
      await load();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to save template";
      setError(message);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [load]);

  const removeTemplate = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await deleteCustomTemplate(id);
      await load();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to delete template";
      setError(message);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [load]);

  return {
    templates,
    isLoading,
    error,
    load,
    addTemplate,
    removeTemplate,
  };
}

// Built-in template IDs
const BUILTIN_TEMPLATES = new Set(["node", "python", "uv", "n"]);

function isBuiltinTemplate(id: string): boolean {
  return BUILTIN_TEMPLATES.has(id);
}
