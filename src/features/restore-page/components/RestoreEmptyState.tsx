import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Download, FileText } from "lucide-react";
import { useNavigation } from "@/hooks/useNavigation";
import { useRestoreState } from "../hooks/useRestoreState";
import { useEnvironmentImport } from "@/features/environment-export/hooks/useEnvironmentImport";
import { ImportPreview } from "@/features/environment-export/components/ImportPreview";
import { toast } from "sonner";

export function RestoreEmptyState() {
  const { setActiveTab } = useNavigation();
  const { setRestoreData } = useRestoreState();
  const { preview, previewFile, cancelPreview, isImporting } = useEnvironmentImport();
  const [showImportPreview, setShowImportPreview] = useState(false);

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
    <>
      <Dialog open={showImportPreview && !!preview} onOpenChange={(open) => !open && handleCancelImport()}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {preview && (
            <ImportPreview
              data={preview}
              onConfirm={handleConfirmImport}
              onCancel={handleCancelImport}
              isImporting={isImporting}
            />
          )}
        </DialogContent>
      </Dialog>

      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
          <FileText className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-semibold mb-2">No Restore Data Available</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          Import an environment backup file to see available tools and software for restoration.
        </p>
        <div className="flex gap-2">
          <Button onClick={handleImport} variant="default" disabled={isImporting}>
            <Download className="h-4 w-4 mr-2" />
            {isImporting ? "Importing..." : "Import Environment File"}
          </Button>
        </div>
      </div>
    </>
  );
}

