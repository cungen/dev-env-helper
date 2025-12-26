import { ScrollArea } from "@/components/ui/scroll-area";
import { SearchInput } from "./SearchInput";
import { CategorySelector } from "./CategorySelector";
import { SearchResults } from "./SearchResults";
import { useSearchInput } from "../hooks/useSearchInput";
import { useCategorySelection } from "../hooks/useCategorySelection";
import { useSearchData } from "../hooks/useSearchData";
import { useSearchFilter } from "../hooks/useSearchFilter";
import { Loader2 } from "lucide-react";

export function HomePage() {
  const searchInput = useSearchInput();
  const categorySelection = useCategorySelection();
  const { searchData, isLoading } = useSearchData();

  const filteredResults = useSearchFilter({
    data: searchData,
    query: searchInput.value,
    category: categorySelection.activeCategory,
  });

  return (
    <div className="flex flex-col h-full p-4">
      {/* Search Section */}
      <div className="mb-6 flex-shrink-0 flex flex-col items-center">
        <div className="w-full max-w-2xl flex items-center gap-4 mb-4">
          <div className="flex-1">
            <SearchInput
              value={searchInput.value}
              onFocus={searchInput.handleFocus}
              onBlur={searchInput.handleBlur}
              onChange={searchInput.handleChange}
            />
          </div>
          <CategorySelector
            activeCategory={categorySelection.activeCategory}
            onSelectCategory={categorySelection.selectCategory}
            isFocused={searchInput.isFocused}
            hasSearchText={searchInput.value.trim().length > 0}
          />
        </div>
      </div>

      {/* Results Section */}
      <ScrollArea className="flex-1 min-h-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span className="text-muted-foreground">Loading...</span>
          </div>
        ) : (
          <SearchResults results={filteredResults} />
        )}
      </ScrollArea>
    </div>
  );
}

