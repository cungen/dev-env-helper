import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfigFileList } from "./ConfigFileList";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { ConfigFileLocation } from "@/features/cli-management/types/cli-tool";

interface CollapsibleConfigFilesProps {
  configFiles: ConfigFileLocation[];
  onViewFile: (path: string) => void;
}

export function CollapsibleConfigFiles({ configFiles, onViewFile }: CollapsibleConfigFilesProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (configFiles.length === 0) {
    return null;
  }

  const existingCount = configFiles.filter((f) => f.exists).length;

  return (
    <div className="mt-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
      >
        {isExpanded ? (
          <ChevronDown className="h-3 w-3 mr-1" />
        ) : (
          <ChevronRight className="h-3 w-3 mr-1" />
        )}
        View Configs ({existingCount}/{configFiles.length})
      </Button>
      {isExpanded && (
        <div className="mt-1 space-y-1">
          <ConfigFileList configFiles={configFiles} onViewFile={onViewFile} />
        </div>
      )}
    </div>
  );
}
