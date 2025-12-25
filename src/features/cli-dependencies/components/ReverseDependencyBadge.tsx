import { Badge } from "@/components/ui/badge";
import { ArrowLeftFromLine } from "lucide-react";
import { getReverseDependencies } from "../api/dependency-commands";
import { useEffect, useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ReverseDependencyBadgeProps {
  toolId: string;
}

export function ReverseDependencyBadge({ toolId }: ReverseDependencyBadgeProps) {
  const [reverseDeps, setReverseDeps] = useState<[string, string][]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadReverseDeps = async () => {
      setIsLoading(true);
      try {
        const deps = await getReverseDependencies(toolId);
        setReverseDeps(deps);
      } catch (error) {
        console.error("Failed to load reverse dependencies:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadReverseDeps();
  }, [toolId]);

  if (isLoading || reverseDeps.length === 0) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className="cursor-help">
            <ArrowLeftFromLine className="h-3 w-3 mr-1" />
            Required by {reverseDeps.length}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="font-medium text-sm">Required by:</p>
            <ul className="text-xs space-y-1">
              {reverseDeps.map(([id, name]) => (
                <li key={id} className="flex items-center gap-2">
                  <span className="font-mono text-muted-foreground">{id}</span>
                  <span className="text-muted-foreground">·</span>
                  <span>{name}</span>
                </li>
              ))}
            </ul>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
