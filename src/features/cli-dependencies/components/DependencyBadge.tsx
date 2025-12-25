import { Badge } from "@/components/ui/badge";
import { Network } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DependencyBadgeProps {
  count: number;
  dependencies?: string[];
  onViewDetails?: () => void;
}

export function DependencyBadge({ count, dependencies, onViewDetails }: DependencyBadgeProps) {
  if (count === 0) {
    return null;
  }

  const content = (
    <Badge variant="secondary" className="gap-1 cursor-help">
      <Network className="h-3 w-3" />
      {count} {count === 1 ? "dependency" : "dependencies"}
    </Badge>
  );

  if (!dependencies || dependencies.length === 0) {
    return content;
  }

  if (onViewDetails) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="h-6 px-2"
        onClick={onViewDetails}
      >
        <Badge variant="secondary" className="gap-1">
          <Network className="h-3 w-3" />
          {count}
        </Badge>
      </Button>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {content}
      </TooltipTrigger>
      <TooltipContent>
        <div className="text-sm">
          <p className="font-medium mb-1">Dependencies:</p>
          <ul className="list-disc list-inside">
            {dependencies.map((dep) => (
              <li key={dep}>{dep}</li>
            ))}
          </ul>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
