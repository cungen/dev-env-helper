import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SoftwareCategory } from "../types/software-recommendation";

interface CategoryFilterProps {
  categories: SoftwareCategory[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  className?: string;
}

export function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
  className,
}: CategoryFilterProps) {
  return (
    <div className={cn("w-full overflow-x-auto", className)}>
      <div className="flex gap-2 pb-2 min-w-fit">
        <Button
          variant={selectedCategory === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => onSelectCategory("all")}
          className="shrink-0"
        >
          All
        </Button>
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            size="sm"
            onClick={() => onSelectCategory(category.id)}
            className="shrink-0"
          >
            <span className="mr-2">{category.emoji}</span>
            {category.name}
          </Button>
        ))}
      </div>
    </div>
  );
}

