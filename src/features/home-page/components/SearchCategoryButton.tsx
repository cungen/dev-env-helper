import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import type { SearchCategoryId } from "../types/search";

interface SearchCategoryButtonProps {
  id: SearchCategoryId;
  label: string;
  icon: LucideIcon;
  isActive: boolean;
  onClick: () => void;
  isExpanded: boolean;
}

export function SearchCategoryButton({
  label,
  icon: Icon,
  isActive,
  onClick,
  isExpanded,
}: SearchCategoryButtonProps) {
  return (
    <Button
      variant={isActive ? "default" : "outline"}
      size="sm"
      onClick={onClick}
      className={cn(
        "rounded-full transition-all duration-200",
        isExpanded
          ? "px-3 gap-2 min-w-[auto]"
          : "w-8 h-8 p-0 min-w-[2rem]",
        isActive && "ring-2 ring-ring ring-offset-2"
      )}
      aria-label={label}
      title={label}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {isExpanded && (
        <span className="text-xs whitespace-nowrap">{label}</span>
      )}
    </Button>
  );
}

