import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { X, FileText, Loader2, AlertCircle } from "lucide-react";
import { getCliConfigContent } from "../api/cli-commands";

interface ConfigFileViewerProps {
  path: string | null;
  onClose: () => void;
}

export function ConfigFileViewer({ path, onClose }: ConfigFileViewerProps) {
  const [content, setContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!path) {
      setContent("");
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    getCliConfigContent(path)
      .then(setContent)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load file"))
      .finally(() => setIsLoading(false));
  }, [path]);

  if (!path) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <span className="font-mono text-sm truncate max-w-md">{path}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading configuration...</span>
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 text-destructive py-4">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        ) : (
          <ScrollArea className="h-[400px] w-full rounded-md border bg-muted p-4">
            <pre className="font-mono text-sm whitespace-pre-wrap">
              {content || "(empty file)"}
            </pre>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
