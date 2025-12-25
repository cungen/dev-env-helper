import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { File, FileCheck, Eye } from "lucide-react";
import type { ConfigFileLocation } from "@/features/cli-management/types/cli-tool";

interface ConfigFileListProps {
  configFiles: ConfigFileLocation[];
  onViewFile: (path: string) => void;
}

export function ConfigFileList({ configFiles, onViewFile }: ConfigFileListProps) {
  if (configFiles.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No configuration files defined</p>
    );
  }

  return (
    <div className="space-y-1">
      {configFiles.map((config, index) => (
        <div
          key={index}
          className="flex items-center justify-between p-2 border rounded-md bg-muted/30 hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-2 min-w-0">
            {config.exists ? (
              <FileCheck className="h-4 w-4 text-green-500 flex-shrink-0" />
            ) : (
              <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            )}
            <span className="font-mono text-sm truncate">
              {config.type === "home" ? "~/" : "/"}
              {config.path}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge variant={config.exists ? "default" : "secondary"} className="text-xs">
              {config.exists ? "Found" : "Not Found"}
            </Badge>
            {config.exists && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => onViewFile(config.fullPath || config.path)}
              >
                <Eye className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
