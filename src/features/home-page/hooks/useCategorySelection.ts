import { useState, useCallback } from "react";
import type { SearchCategoryId } from "../types/search";

export function useCategorySelection() {
  const [activeCategory, setActiveCategory] = useState<SearchCategoryId>("all");

  const selectCategory = useCallback((category: SearchCategoryId) => {
    setActiveCategory(category);
  }, []);

  return {
    activeCategory,
    selectCategory,
  };
}


