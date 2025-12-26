import { useMemo } from "react";
import { useCliDetection } from "@/features/cli-management/hooks/useCliDetection";
import { useSoftwareRecommendations } from "@/features/software-recommendations/hooks/useSoftwareRecommendations";
import type { SearchResult } from "../types/search";

export function useSearchData() {
  const { tools, isLoading: cliLoading } = useCliDetection();
  const { config, isLoading: softwareLoading } = useSoftwareRecommendations();

  const searchData = useMemo<SearchResult[]>(() => {
    const results: SearchResult[] = [];

    // Add CLI tools
    tools.forEach((tool) => {
      const toolName = getToolName(tool.templateId);
      results.push({
        id: `cli-${tool.templateId}`,
        type: "cli-tool",
        name: toolName,
        description: `CLI tool: ${tool.templateId}`,
        category: "cli-tools",
        data: tool,
      });
    });

    // Add software recommendations
    if (config) {
      config.software.forEach((software) => {
        results.push({
          id: `software-${software.id}`,
          type: "software",
          name: software.name,
          description: software.description,
          category: software.category,
          data: software,
        });
      });
    }

    return results;
  }, [tools, config]);

  return {
    searchData,
    isLoading: cliLoading || softwareLoading,
  };
}

function getToolName(id: string): string {
  const names: Record<string, string> = {
    node: "Node.js",
    python: "Python",
    uv: "uv",
    n: "n",
  };
  return names[id] || id;
}


