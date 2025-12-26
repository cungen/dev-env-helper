import { useMemo } from "react";
import type { SearchResult, SearchCategoryId } from "../types/search";

interface UseSearchFilterOptions {
  data: SearchResult[];
  query: string;
  category: SearchCategoryId;
}

export function useSearchFilter({ data, query, category }: UseSearchFilterOptions) {
  const filteredResults = useMemo(() => {
    let results = data;

    // Filter by category
    if (category !== "all") {
      results = results.filter((result) => {
        if (category === "cli-tools") {
          return result.type === "cli-tool";
        }
        if (category === "software") {
          return result.type === "software";
        }
        return true;
      });
    }

    // Filter by search query
    if (query.trim()) {
      const lowerQuery = query.toLowerCase();
      results = results.filter((result) => {
        const nameMatch = result.name.toLowerCase().includes(lowerQuery);
        const descMatch = result.description?.toLowerCase().includes(lowerQuery);
        return nameMatch || descMatch;
      });

      // Sort by relevance: exact name matches first, then description matches
      results.sort((a, b) => {
        const aNameExact = a.name.toLowerCase() === lowerQuery;
        const bNameExact = b.name.toLowerCase() === lowerQuery;
        if (aNameExact && !bNameExact) return -1;
        if (!aNameExact && bNameExact) return 1;

        const aNameStarts = a.name.toLowerCase().startsWith(lowerQuery);
        const bNameStarts = b.name.toLowerCase().startsWith(lowerQuery);
        if (aNameStarts && !bNameStarts) return -1;
        if (!aNameStarts && bNameStarts) return 1;

        return 0;
      });
    }

    return results;
  }, [data, query, category]);

  return filteredResults;
}


