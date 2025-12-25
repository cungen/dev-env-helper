import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  installed: boolean;
}

export function StatusBadge({ installed }: StatusBadgeProps) {
  return (
    <Badge
      variant={installed ? "default" : "secondary"}
      className={cn(
        "text-xs h-6 px-2",
        installed
          ? "bg-green-500/10 text-green-600 border-green-500/20 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30"
          : "bg-muted text-muted-foreground"
      )}
    >
      {installed ? (
        <CheckCircle2 className="h-3 w-3 mr-1" />
      ) : (
        <XCircle className="h-3 w-3 mr-1" />
      )}
      {installed ? "Installed" : "Not Installed"}
    </Badge>
  );
}
