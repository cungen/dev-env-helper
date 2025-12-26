import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Download, Upload, CheckCircle2 } from "lucide-react";
import { useCliDetection } from "@/features/cli-management/hooks/useCliDetection";
import { useSoftwareRecommendations } from "@/features/software-recommendations/hooks/useSoftwareRecommendations";
import { useSoftwareInstallationStatus } from "@/features/software-recommendations/hooks/useSoftwareInstallationStatus";
import { useEnvironmentImport } from "@/features/environment-export/hooks/useEnvironmentImport";
import { useRestoreState } from "@/features/restore-page/hooks/useRestoreState";
import { useNavigation } from "@/hooks/useNavigation";
import { ImportPreview } from "@/features/environment-export/components/ImportPreview";
import { toast } from "sonner";
import { invoke } from "@tauri-apps/api/core";

export function EnvironmentBackupSection() {
  const { tools, refresh } = useCliDetection();
  const { config: softwareConfig } = useSoftwareRecommendations();
  const { status: softwareStatus } = useSoftwareInstallationStatus();
  const { setRestoreData } = useRestoreState();
  const { setActiveTab } = useNavigation();
  const [showImportPreview, setShowImportPreview] = useState(false);

  const installedCount = tools.filter((t) => t.installed).length;
  const totalCount = tools.length;

  const { preview, previewFile, confirmImport, cancelPreview, isImporting } = useEnvironmentImport();

  const handleExport = async () => {
    try {
      // Get installed software
      const installedSoftware =
        softwareConfig?.software.filter((s) => softwareStatus[s.id] === true) || [];

      // Create export data with schema version
      const exportData = {
        schemaVersion: "1.0",
        exportedAt: new Date().toISOString(),
        hostname: window.location.hostname,
        tools: tools,
        customTemplates: [],
        software: installedSoftware.length > 0 ? installedSoftware : undefined,
      };

      // Call backend to save file to download directory
      // Returns the download directory path
      const folderPath = await invoke<string>("export_environment", { data: exportData });

      // Open the download folder in file manager
      await invoke("open_folder_in_file_manager", { folderPath });

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
    if (!preview) return;

    // Store restore data and navigate to restore page
    try {
      const restoreData = {
        exportedAt: preview.exportedAt,
        hostname: preview.hostname,
        tools: preview.tools.map((t) => ({
          templateId: t.templateId,
          installed: t.installed,
          version: t.version,
          executablePath: t.executablePath,
          configFiles: t.configFiles,
          detectedAt: t.detectedAt,
        })),
        software: preview.software || [],
        customTemplates: preview.customTemplates || [],
      };

      setRestoreData(restoreData);
      setActiveTab("restore");

      toast.success("Environment imported successfully");
      setShowImportPreview(false);
      await refresh();
    } catch (error) {
      toast.error("Failed to import environment", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const handleCancelImport = () => {
    cancelPreview();
    setShowImportPreview(false);
  };

  return (
    <div className="space-y-4">
      {showImportPreview && preview && (
        <ImportPreview
          data={preview}
          onConfirm={handleConfirmImport}
          onCancel={handleCancelImport}
          isImporting={isImporting}
        />
      )}

      {/* Status */}
      <div className="flex items-center gap-6 p-4 border rounded-lg">
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

      {/* Export/Import */}
      <div className="space-y-4">
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
      </div>
    </div>
  );
}

