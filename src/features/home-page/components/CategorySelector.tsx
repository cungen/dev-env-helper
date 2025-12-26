import { useState } from "react";
import { Grid3x3, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SearchCategoryId } from "../types/search";

const CATEGORIES = [
  { id: "all" as SearchCategoryId, label: "All", icon: Grid3x3 },
  { id: "cli-tools" as SearchCategoryId, label: "CLI Tools", icon: Terminal },
  { id: "software" as SearchCategoryId, label: "Software", icon: Grid3x3 },
];

interface CategorySelectorProps {
  activeCategory: SearchCategoryId;
  onSelectCategory: (category: SearchCategoryId) => void;
  isFocused: boolean;
  hasSearchText: boolean;
}

export function CategorySelector({
  activeCategory,
  onSelectCategory,
  isFocused,
}: CategorySelectorProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Collapse when focused and not hovered
  const isCollapsed = isFocused && !isHovered;

  return (
    <div
      className="flex items-center gap-2 relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {CATEGORIES.map((category) => {
        const Icon = category.icon;
        const isActive = activeCategory === category.id;
        const shouldShow = !isCollapsed || isActive;

        return (
          <div
            key={category.id}
            className={cn(
              "transition-all duration-200 ease-in-out overflow-hidden",
              shouldShow
                ? "opacity-100 max-w-[200px]"
                : "opacity-0 max-w-0 pointer-events-none"
            )}
          >
            <Button
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => onSelectCategory(category.id)}
              className={cn(
                "rounded-full transition-all duration-200 ease-in-out",
                "overflow-hidden whitespace-nowrap",
                "flex items-center justify-center",
                isCollapsed
                  ? "w-8 h-8 p-0"
                  : "px-3 gap-2",
                isActive && !isCollapsed && "border-2 border-primary-foreground/20"
              )}
              aria-label={category.label}
              title={category.label}
            >
              <Icon className={cn("h-4 w-4 shrink-0", isCollapsed && "m-0")} />
              {!isCollapsed && (
                <span className="text-xs whitespace-nowrap ml-2">
                  {category.label}
                </span>
              )}
            </Button>
          </div>
        );
      })}
    </div>
  );
}

