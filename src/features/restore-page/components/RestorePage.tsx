import { useState, useMemo, useEffect, useCallback } from "react";
import { useRestoreState } from "../hooks/useRestoreState";
import { RestoreItemCard } from "./RestoreItemCard";
import { RestoreEmptyState } from "./RestoreEmptyState";
import type { RestoreItem } from "../types/restore";
import { useCliDetection } from "@/features/cli-management/hooks/useCliDetection";
import { useSoftwareInstallationStatus } from "@/features/software-recommendations/hooks/useSoftwareInstallationStatus";
import { useToolInstallation } from "@/features/cli-installation/hooks/useToolInstallation";
import { useDependencyAwareInstall } from "@/features/cli-installation/hooks/useDependencyAwareInstall";
import { useBrewInstall } from "@/features/cli-installation/hooks/useBrewInstall";
import { listCustomTemplates } from "@/features/cli-management/api/cli-commands";
import { useEnvironmentImport } from "@/features/environment-export/hooks/useEnvironmentImport";
import { ImportPreview } from "@/features/environment-export/components/ImportPreview";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Download, ChevronDown, ChevronUp, RotateCcw, Upload } from "lucide-react";
import type { CliToolTemplate } from "@/features/cli-management/types/cli-tool";

export function RestorePage() {
  const { restoreState, hasRestoreData, clearRestoreData, setRestoreData } = useRestoreState();
  const { tools: detectedTools, refresh: refreshTools } = useCliDetection();
  const { status: softwareStatus, detectStatus: detectSoftwareStatus } = useSoftwareInstallationStatus();
  const { preview, previewFile, cancelPreview, isImporting } = useEnvironmentImport();
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [templates, setTemplates] = useState<CliToolTemplate[]>([]);
  const [installingItemId, setInstallingItemId] = useState<string | null>(null);
  const [showImportPreview, setShowImportPreview] = useState(false);
  const [isInstalledSectionCollapsed, setIsInstalledSectionCollapsed] = useState(() => {
    // Load collapse state from localStorage, default to false (expanded)
    const saved = localStorage.getItem("restore-page-installed-collapsed");
    return saved === "true";
  });

  // Persist collapse state to localStorage
  useEffect(() => {
    localStorage.setItem("restore-page-installed-collapsed", String(isInstalledSectionCollapsed));
  }, [isInstalledSectionCollapsed]);

  // Handle reset - clear restore data
  const handleReset = useCallback(() => {
    clearRestoreData();
    toast.success("Restore data cleared");
  }, [clearRestoreData]);

  // Handle re-upload - open file picker
  const handleReUpload = useCallback(() => {
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
  }, [previewFile]);

  // Handle confirm import - replace existing restore data
  const handleConfirmImport = useCallback(async () => {
    if (!preview) return;

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
      toast.success("Environment imported successfully");
      setShowImportPreview(false);
      await refreshTools();
    } catch (error) {
      toast.error("Failed to import environment", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }, [preview, setRestoreData, refreshTools]);

  // Handle cancel import
  const handleCancelImport = useCallback(() => {
    cancelPreview();
    setShowImportPreview(false);
  }, [cancelPreview]);

  const toolInstallation = useToolInstallation({
    onAllComplete: () => {
      refreshTools();
      toast.success("All tools installed successfully");
      setInstallingItemId(null);
    },
  });

  const dependencyAwareInstall = useDependencyAwareInstall({
    onSuccess: () => {
      refreshTools();
      toast.success("Installation completed successfully");
      setInstallingItemId(null);
    },
  });

  // Load templates on mount
  useEffect(() => {
    listCustomTemplates()
      .then(setTemplates)
      .catch((error) => {
        console.error("Failed to load templates:", error);
      });
  }, []);

  // Detect installation status for tools
  useEffect(() => {
    if (restoreState && detectedTools.length > 0) {
      // Tools are already detected via useCliDetection
    }
  }, [restoreState, detectedTools]);

  // Detect installation status for software
  useEffect(() => {
    if (restoreState && restoreState.software.length > 0) {
      detectSoftwareStatus(restoreState.software, false).catch(() => {
        // Error already handled in hook
      });
    }
  }, [restoreState, detectSoftwareStatus]);

  // Convert restore state to RestoreItems
  const restoreItems = useMemo((): RestoreItem[] => {
    if (!restoreState) return [];

    const items: RestoreItem[] = [];

    // Add tools
    for (const tool of restoreState.tools) {
      const template = templates.find((t) => t.id === tool.templateId);
      const detectedTool = detectedTools.find((dt) => dt.templateId === tool.templateId);
      const isInstalled = detectedTool?.installed ?? tool.installed;

      items.push({
        type: "tool",
        id: `tool-${tool.templateId}`,
        data: {
          ...tool,
          installed: isInstalled,
          template,
          installMethods: template?.installMethods?.map((m) => ({
            type: m.type,
            caskName: m.caskName,
            formulaName: m.formulaName,
            brewTap: m.brewTap,
            dmgUrl: m.dmgUrl,
            dmgInstallSteps: m.dmgInstallSteps,
            scriptCommands: m.scriptCommands,
          })),
        },
      });
    }

    // Add software
    for (const software of restoreState.software) {
      const isInstalled = softwareStatus[software.id] ?? software.installed ?? false;

      items.push({
        type: "software",
        id: `software-${software.id}`,
        data: {
          ...software,
          installed: isInstalled,
        },
      });
    }

    return items;
  }, [restoreState, templates, detectedTools, softwareStatus]);

  // Separate items into installed and not-installed
  const { installedItems, notInstalledItems } = useMemo(() => {
    const installed: RestoreItem[] = [];
    const notInstalled: RestoreItem[] = [];

    for (const item of restoreItems) {
      const isInstalled =
        item.type === "tool"
          ? item.data.installed
          : item.data.installed ?? false;

      if (isInstalled) {
        installed.push(item);
      } else {
        notInstalled.push(item);
      }
    }

    return { installedItems: installed, notInstalledItems: notInstalled };
  }, [restoreItems]);

  const handleSelect = useCallback((itemId: string, selected: boolean) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (selected) {
        next.add(itemId);
      } else {
        next.delete(itemId);
      }
      return next;
    });
  }, []);

  const brewInstall = useBrewInstall({
    onSuccess: () => {
      refreshTools();
      detectSoftwareStatus(restoreState?.software || [], false);
      toast.success("Installation completed successfully");
      setInstallingItemId(null);
    },
    onError: (error) => {
      toast.error(`Installation failed: ${error}`);
      setInstallingItemId(null);
    },
  });

  const handleInstall = useCallback(
    async (item: RestoreItem) => {
      if (item.type === "tool") {
        setInstallingItemId(item.id);
        try {
          const result = await dependencyAwareInstall.prepareInstallation(item.data.templateId);
          if (!result.showPreview) {
            // No dependencies, install directly
            if (item.data.installMethods && item.data.installMethods.length > 0) {
              await toolInstallation.installTools([
                {
                  id: item.data.templateId,
                  installMethods: item.data.installMethods.map((m) => ({
                    type: m.type as "brew" | "dmg" | "script",
                    caskName: m.caskName,
                    formulaName: m.formulaName,
                    brewTap: m.brewTap,
                    dmgUrl: m.dmgUrl,
                    dmgInstallSteps: m.dmgInstallSteps,
                    scriptCommands: m.scriptCommands,
                  })),
                },
              ]);
            }
          } else {
            // Has dependencies, need confirmation
            const orderedTools = dependencyAwareInstall.confirmInstallation();
            if (orderedTools) {
              const toolsToInstall = orderedTools.map((id) => {
                const toolItem = restoreItems.find(
                  (ri) => ri.type === "tool" && ri.data.templateId === id
                ) as RestoreItem & { type: "tool" } | undefined;
                return {
                  id,
                  installMethods: toolItem?.data.installMethods || [],
                };
              });
              await toolInstallation.installTools(toolsToInstall);
            }
          }
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Installation failed");
          setInstallingItemId(null);
        }
      } else {
        // Software installation
        setInstallingItemId(item.id);
        const brewMethod = item.data.installMethods.find((m) => m.type === "brew");
        const githubMethod = item.data.installMethods.find((m) => m.type === "github");

        if (brewMethod?.cask) {
          brewInstall.install(brewMethod.cask);
        } else if (githubMethod?.owner && githubMethod?.repo) {
          // For GitHub downloads, we'd need to use the GitHub download hook
          // This is more complex and would require the component to handle it
          toast.info("GitHub download installation not yet implemented in restore page");
          setInstallingItemId(null);
        }
      }
    },
    [dependencyAwareInstall, toolInstallation, restoreItems, brewInstall]
  );

  const handleBatchInstall = useCallback(async () => {
    if (selectedItems.size === 0) return;

    const selectedRestoreItems = restoreItems.filter((item) => selectedItems.has(item.id));
    const toolsToInstall = selectedRestoreItems
      .filter((item) => item.type === "tool" && !item.data.installed)
      .map((item) => {
        const toolItem = item as RestoreItem & { type: "tool" };
        return {
          id: toolItem.data.templateId,
          installMethods: toolItem.data.installMethods || [],
        };
      });

    if (toolsToInstall.length > 0) {
      try {
        // Resolve dependencies for all tools
        // For batch, we'd need to resolve all dependencies
        // For now, install tools one by one
        await toolInstallation.installTools(toolsToInstall);
        setSelectedItems(new Set());
        toast.success("Batch installation completed");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Batch installation failed");
      }
    }

    // Handle software batch installation separately
    // Software installation would be handled separately
  }, [selectedItems, restoreItems, dependencyAwareInstall, toolInstallation]);

  if (!hasRestoreData || !restoreState) {
    return <RestoreEmptyState />;
  }

  const selectedCount = selectedItems.size;

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

      <div className="flex flex-col h-full p-4 gap-6">
        {/* Title Bar */}
        <div className="mb-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-3xl font-bold">Restore Environment</h1>
            <p className="text-muted-foreground">Review and install tools and software from your backup</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleReset} variant="outline" size="sm">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button onClick={handleReUpload} variant="outline" size="sm" disabled={isImporting}>
              <Upload className={`h-4 w-4 mr-2 ${isImporting ? "animate-spin" : ""}`} />
              {isImporting ? "Uploading..." : "Re-upload"}
            </Button>
          </div>
        </div>

        {selectedCount > 0 && (
          <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg border border-primary/20">
            <span className="text-sm font-medium">
              {selectedCount} item{selectedCount !== 1 ? "s" : ""} selected
            </span>
            <Button onClick={handleBatchInstall} variant="default" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Install Selected ({selectedCount})
            </Button>
          </div>
        )}

      {/* Installed Items Section */}
      {installedItems.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              Installed ({installedItems.length})
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsInstalledSectionCollapsed(!isInstalledSectionCollapsed)}
              className="h-8 px-2"
            >
              {isInstalledSectionCollapsed ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </Button>
          </div>
          {!isInstalledSectionCollapsed && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
              {installedItems.map((item) => (
                <RestoreItemCard
                  key={item.id}
                  item={item}
                  isSelected={false}
                  onSelect={handleSelect}
                  onInstall={handleInstall}
                  isInstalling={installingItemId === item.id}
                  minimalDisplay={true}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Visual Separator */}
      {installedItems.length > 0 && notInstalledItems.length > 0 && (
        <Separator className="my-2" />
      )}

      {/* Available for Installation Section */}
      {notInstalledItems.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">
            Available for Installation ({notInstalledItems.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-fr">
            {notInstalledItems.map((item) => (
              <RestoreItemCard
                key={item.id}
                item={item}
                isSelected={selectedItems.has(item.id)}
                onSelect={handleSelect}
                onInstall={handleInstall}
                isInstalling={installingItemId === item.id}
                minimalDisplay={false}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty state when no items */}
      {installedItems.length === 0 && notInstalledItems.length === 0 && (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <p>No items to display</p>
        </div>
      )}
      </div>
    </>
  );
}

