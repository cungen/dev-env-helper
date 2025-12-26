import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

interface InstallationProgressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentTool: string | null;
  totalTools?: number;
  completedTools: string[];
  logOutput: string[];
  error: string | null;
  isInstalling: boolean;
  onCancel?: () => void;
}

const getToolName = (id: string) => {
  const names: Record<string, string> = {
    node: "Node.js",
    python: "Python",
    uv: "uv",
    n: "n",
  };
  return names[id] || id;
};

export function InstallationProgressDialog({
  open,
  onOpenChange,
  currentTool,
  totalTools = 1,
  completedTools,
  logOutput,
  error,
  isInstalling,
  onCancel,
}: InstallationProgressDialogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new log output arrives
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logOutput]);

  const progress = totalTools > 0 ? (completedTools.length / totalTools) * 100 : 0;
  const currentToolName = currentTool ? getToolName(currentTool) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col gap-4">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>
            {isInstalling ? "Installing CLI Tool" : error ? "Installation Failed" : "Installation Complete"}
          </DialogTitle>
          <DialogDescription>
            {currentToolName && isInstalling && (
              <>Installing {currentToolName}...</>
            )}
            {totalTools > 1 && (
              <> ({completedTools.length} of {totalTools} completed)</>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 min-h-0 overflow-y-auto pr-2">
          {/* Progress Bar */}
          {totalTools > 1 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Overall Progress</span>
                <span className="text-sm font-medium">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-semibold">Installation Error</span>
              </div>
              <p className="text-sm text-destructive mt-1">{error}</p>
            </div>
          )}

          {/* Log Output */}
          <div>
            <h4 className="text-sm font-semibold mb-2">Installation Log</h4>
            <ScrollArea
              ref={scrollRef}
              className="h-64 w-full rounded-md border bg-muted p-4"
            >
              <div className="space-y-1 font-mono text-xs">
                {logOutput.length === 0 ? (
                  <p className="text-muted-foreground">
                    {isInstalling ? "Waiting for output..." : "No output available"}
                  </p>
                ) : (
                  logOutput.map((line, idx) => {
                    const isError = line.toLowerCase().includes("error") ||
                      line.toLowerCase().includes("failed") ||
                      line.toLowerCase().includes("fatal");
                    return (
                      <div
                        key={idx}
                        className={cn(
                          "whitespace-pre-wrap break-all",
                          isError && "text-destructive font-semibold"
                        )}
                      >
                        {line || " "}
                      </div>
                    );
                  })
                )}
                {isInstalling && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Installing...</span>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Status Icons */}
          <div className="flex items-center gap-4">
            {isInstalling ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Installation in progress...</span>
              </div>
            ) : error ? (
              <div className="flex items-center gap-2 text-destructive">
                <XCircle className="h-4 w-4" />
                <span className="text-sm">Installation failed</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm">Installation completed successfully</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <DialogFooter className="flex-shrink-0 mt-4">
          {isInstalling && onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button
            variant={error ? "destructive" : "default"}
            onClick={() => onOpenChange(false)}
            disabled={isInstalling}
          >
            {error ? "Close" : "Done"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

