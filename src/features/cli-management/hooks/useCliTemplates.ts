import { useState, useEffect, useCallback } from "react";
import { listCustomTemplates } from "../api/cli-commands";
import type { CliToolTemplate } from "../types/cli-tool";

export function useCliTemplates() {
  const [templates, setTemplates] = useState<CliToolTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await listCustomTemplates();
      setTemplates(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load templates");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const getTemplate = useCallback(
    (id: string) => templates.find((t) => t.id === id),
    [templates]
  );

  // Get unique categories from templates
  const categories = Array.from(
    new Set(
      templates
        .map((t) => t.category)
        .filter((c): c is string => !!c)
    )
  ).map((id) => {
    const template = templates.find((t) => t.category === id);
    return {
      id,
      name: id.charAt(0).toUpperCase() + id.slice(1).replace(/-/g, " "),
      emoji: template?.emoji || "📦",
    };
  });

  return {
    templates,
    isLoading,
    error,
    load,
    getTemplate,
    categories,
  };
}

