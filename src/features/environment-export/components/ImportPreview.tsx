import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FileJson, CheckCircle2, Calendar, Server, Network } from "lucide-react";
import type { EnvironmentExport } from "@/shared/types/environment-export";
import { listCustomTemplates } from "@/features/cli-management/api/cli-commands";
import { useEffect, useState } from "react";

interface ImportPreviewProps {
  data: EnvironmentExport;
  onConfirm: () => void;
  onCancel: () => void;
  isImporting: boolean;
}

// Template data for dependencies
const TOOL_DEPENDENCIES: Record<string, string[]> = {
  node: [],
  python: [],
  uv: ["python"],
  n: ["node"],
};

export function ImportPreview({ data, onConfirm, onCancel, isImporting }: ImportPreviewProps) {
  const [templateDependencies, setTemplateDependencies] = useState<Record<string, string[]>>({});
  const installedCount = data.tools.filter((t) => t.installed).length;
  const totalCount = data.tools.length;
  const customTemplateCount = data.customTemplates?.length || 0;

  useEffect(() => {
    const loadDependencies = async () => {
      const templates = await listCustomTemplates();
      const deps: Record<string, string[]> = { ...TOOL_DEPENDENCIES };

      for (const template of templates) {
        if (template.dependencies) {
          deps[template.id] = template.dependencies;
        }
      }

      setTemplateDependencies(deps);
    };

    loadDependencies();
  }, []);

  return (
    <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileJson className="h-5 w-5 text-blue-600" />
          Import Preview
        </CardTitle>
        <CardDescription>
          Review the environment configuration before importing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Metadata */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Server className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Hostname:</span>
            <span className="font-medium">{data.hostname || "Unknown"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Exported:</span>
            <span className="font-medium">
              {new Date(data.exportedAt).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <FileJson className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Schema:</span>
            <Badge variant="outline" className="text-xs">
              v{data.schemaVersion}
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Summary */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Configuration Summary:</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-sm">
                {installedCount} / {totalCount} tools installed
              </span>
            </div>
            {customTemplateCount > 0 && (
              <div className="flex items-center gap-2">
                <FileJson className="h-4 w-4 text-blue-500" />
                <span className="text-sm">
                  {customTemplateCount} custom template{customTemplateCount !== 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Tools list */}
        {data.tools.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">Tools ({data.tools.length}):</p>
            <div className="space-y-2">
              {data.tools.map((tool) => {
                const deps = templateDependencies[tool.templateId] || [];
                return (
                  <div key={tool.templateId} className="flex items-start gap-2">
                    <Badge
                      variant={tool.installed ? "default" : "secondary"}
                      className={tool.installed ? "bg-green-500" : ""}
                    >
                      {tool.templateId}
                    </Badge>
                    {tool.version && <span className="text-xs text-muted-foreground">v{tool.version}</span>}
                    {deps.length > 0 && (
                      <div className="flex items-center gap-1 ml-auto">
                        <Network className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          Requires: {deps.join(", ")}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isImporting}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isImporting}
          >
            {isImporting ? "Importing..." : "Confirm Import"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
