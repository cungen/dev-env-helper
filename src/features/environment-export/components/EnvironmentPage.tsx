import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Download, Upload, CheckCircle2 } from "lucide-react";
import { useCliDetection } from "@/features/cli-management/hooks/useCliDetection";
import { useEnvironmentImport } from "../hooks/useEnvironmentImport";
import { ImportPreview } from "./ImportPreview";
import { toast } from "sonner";

export function EnvironmentPage() {
  const { tools, refresh } = useCliDetection();
  const [showImportPreview, setShowImportPreview] = useState(false);

  const installedCount = tools.filter((t) => t.installed).length;
  const totalCount = tools.length;

  const { preview, previewFile, confirmImport, cancelPreview, isImporting } = useEnvironmentImport();

  const handleExport = async () => {
    try {
      // Create export data with schema version
      const exportData = {
        schemaVersion: "1.0",
        exportedAt: new Date().toISOString(),
        hostname: window.location.hostname,
        tools: tools,
        customTemplates: [],
      };

      // Convert to JSON and trigger download
      const json = JSON.stringify(exportData, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dev-env-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Environment exported successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to export environment");
    }
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const result = await previewFile(file);

      if (result.success) {
        setShowImportPreview(true);
        if (result.warnings && result.warnings.length > 0) {
          toast.warning("Import completed with warnings", {
            description: result.warnings.join(", "),
          });
        }
      } else {
        toast.error("Failed to import environment", {
          description: result.error,
        });
      }
    };
    input.click();
  };

  const handleConfirmImport = async () => {
    const result = await confirmImport();

    if (result.success) {
      toast.success("Environment imported successfully");
      setShowImportPreview(false);
      // Refresh CLI detection to get updated state
      await refresh();
    } else {
      toast.error("Failed to import environment", {
        description: result.error,
      });
    }
  };

  const handleCancelImport = () => {
    cancelPreview();
    setShowImportPreview(false);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Environment</h1>
        <p className="text-muted-foreground">Export and import your development environment</p>
      </div>

      {showImportPreview && preview && (
        <ImportPreview
          data={preview}
          onConfirm={handleConfirmImport}
          onCancel={handleCancelImport}
          isImporting={isImporting}
        />
      )}

      <div className="grid gap-6">
        {/* Status Card */}
        <Card>
          <CardHeader>
            <CardTitle>Current Environment</CardTitle>
            <CardDescription>Summary of your detected CLI tools</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{installedCount}</p>
                  <p className="text-sm text-muted-foreground">Installed</p>
                </div>
              </div>
              <Separator orientation="vertical" className="h-12" />
              <div className="flex items-center gap-2">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-2xl">{totalCount}</span>
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalCount}</p>
                  <p className="text-sm text-muted-foreground">Total Tools</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Export/Import Card */}
        <Card>
          <CardHeader>
            <CardTitle>Backup & Restore</CardTitle>
            <CardDescription>
              Export your environment configuration to a file or import from a previous backup
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Download className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="font-medium">Export Environment</p>
                  <p className="text-sm text-muted-foreground">
                    Download your CLI tools configuration as JSON
                  </p>
                </div>
              </div>
              <Button onClick={handleExport} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>

            <Separator />

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Upload className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="font-medium">Import Environment</p>
                  <p className="text-sm text-muted-foreground">
                    Restore your CLI tools from a backup file
                  </p>
                </div>
              </div>
              <Button onClick={handleImport} variant="outline" disabled={isImporting}>
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tools List */}
        <Card>
          <CardHeader>
            <CardTitle>Detected Tools</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {tools.map((tool) => (
                <div key={tool.templateId} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium capitalize">{tool.templateId}</span>
                    {tool.installed && tool.version && (
                      <Badge variant="secondary" className="text-xs">
                        v{tool.version}
                      </Badge>
                    )}
                  </div>
                  <Badge
                    variant={tool.installed ? "default" : "secondary"}
                    className={tool.installed ? "bg-green-500" : ""}
                  >
                    {tool.installed ? "Installed" : "Not Found"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
