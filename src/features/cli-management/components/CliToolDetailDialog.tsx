import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, XCircle, FileText, ExternalLink } from "lucide-react";
import type { InstallMethod } from "../types/cli-tool";
import { InstallButton } from "@/features/cli-installation/components/InstallButton";
import { InstallMethodBadge } from "@/features/cli-installation/components/InstallMethodBadge";
import type { CliToolDetection } from "../types/cli-tool";
import type { CliToolTemplate } from "../types/cli-tool";
import { invoke } from "@tauri-apps/api/core";
import { useState } from "react";
import { toast } from "sonner";

interface CliToolDetailDialogProps {
  tool: CliToolDetection;
  template?: CliToolTemplate;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInstall: (toolId: string) => void;
  isInstalling: boolean;
}

const getToolName = (id: string, template?: CliToolTemplate) => {
  if (template?.name) return template.name;
  const names: Record<string, string> = {
    node: "Node.js",
    python: "Python",
    uv: "uv",
    n: "n",
  };
  return names[id] || id;
};

const getToolEmoji = (_id: string, template?: CliToolTemplate) => {
  if (template?.emoji) return template.emoji;
  return "⚙️";
};

const formatInstallCommand = (method: InstallMethod): string => {
  if (method.type === "brew") {
    if (method.brewTap && method.caskName) {
      return `brew tap ${method.brewTap} && brew install --cask ${method.caskName}`;
    } else if (method.brewTap && method.formulaName) {
      return `brew tap ${method.brewTap} && brew install ${method.formulaName}`;
    } else if (method.caskName) {
      return `brew install --cask ${method.caskName}`;
    } else if (method.formulaName) {
      return `brew install ${method.formulaName}`;
    }
    return "brew install <package>";
  } else if (method.type === "dmg") {
    return method.dmgUrl || "DMG download";
  } else if (method.type === "script") {
    return method.scriptCommands?.join(" && ") || "Script installation";
  }
  return "Unknown installation method";
};

export function CliToolDetailDialog({
  tool,
  template,
  open,
  onOpenChange,
  onInstall,
  isInstalling,
}: CliToolDetailDialogProps) {
  const [openingConfig, setOpeningConfig] = useState<string | null>(null);

  const toolName = getToolName(tool.templateId, template);
  const emoji = getToolEmoji(tool.templateId, template);
  const installMethods = template?.installMethods || [];
  const dependencies = template?.dependencies || [];

  const handleOpenConfig = async (path: string) => {
    setOpeningConfig(path);
    try {
      // Backend will handle path expansion (~ and $HOME)
      await invoke("open_file_with_editor", { filePath: path });
      toast.success("Opened config file in editor");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to open config file"
      );
    } finally {
      setOpeningConfig(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="text-4xl">{emoji}</div>
            <div>
              <DialogTitle>{toolName}</DialogTitle>
              <DialogDescription className="mt-1">
                {tool.templateId}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-200px)] pr-4">
          <div className="space-y-4">
            {/* Status */}
            <div>
              <h4 className="text-sm font-semibold mb-2">Status</h4>
              <div className="flex items-center gap-2">
                {tool.installed ? (
                  <Badge
                    variant="default"
                    className="bg-green-500/10 text-green-600 border-green-500/20 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30"
                  >
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Installed
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <XCircle className="h-3 w-3 mr-1" />
                    Not Installed
                  </Badge>
                )}
                {tool.installed && tool.version && (
                  <span className="text-sm text-muted-foreground">
                    Version: {tool.version}
                  </span>
                )}
              </div>
            </div>

            <Separator />

            {/* Detection Method */}
            {template && (
              <>
                <div>
                  <h4 className="text-sm font-semibold mb-2">Detection Method</h4>
                  <code className="text-xs bg-muted p-2 rounded block">
                    which {template.executable}
                  </code>
                  <p className="text-xs text-muted-foreground mt-1">
                    Detected by which {template.executable}
                  </p>
                </div>
                <Separator />
              </>
            )}

            {/* Executable Path */}
            {tool.executablePath && (
              <>
                <div>
                  <h4 className="text-sm font-semibold mb-2">Executable Path</h4>
                  <code className="text-xs bg-muted p-2 rounded block break-all">
                    {tool.executablePath}
                  </code>
                </div>
                <Separator />
              </>
            )}

            {/* Dependencies */}
            {dependencies.length > 0 && (
              <>
                <div>
                  <h4 className="text-sm font-semibold mb-2">Dependencies</h4>
                  <div className="flex flex-wrap gap-2">
                    {dependencies.map((dep) => (
                      <Badge key={dep} variant="secondary" className="text-xs">
                        {dep}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Installation Methods */}
            {installMethods.length > 0 && (
              <>
                <div>
                  <h4 className="text-sm font-semibold mb-2">Installation Methods</h4>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {installMethods.map((method, idx) => (
                      <InstallMethodBadge key={idx} method={method} />
                    ))}
                  </div>
                  <div className="space-y-2 mb-3">
                    {installMethods.map((method, idx) => (
                      <div key={idx} className="p-2 border rounded bg-muted/50">
                        <div className="text-xs font-medium mb-1">
                          {method.type === "brew" && "Homebrew"}
                          {method.type === "dmg" && "DMG Download"}
                          {method.type === "script" && "Script Installation"}
                        </div>
                        <code className="text-xs bg-background p-2 rounded block break-all">
                          {formatInstallCommand(method)}
                        </code>
                      </div>
                    ))}
                  </div>
                  {!tool.installed && (
                    <InstallButton
                      installMethods={installMethods}
                      onInstall={() => onInstall(tool.templateId)}
                      isInstalling={isInstalling}
                    />
                  )}
                </div>
                <Separator />
              </>
            )}

            {/* Config Files */}
            {tool.configFiles && tool.configFiles.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Configuration Files</h4>
                <div className="space-y-2">
                  {tool.configFiles.map((config, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div className="flex-1 min-w-0">
                          <code className="text-xs break-all">{config.path}</code>
                          {config.description && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {config.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        {config.exists ? (
                          <Badge variant="outline" className="text-xs">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Exists
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            <XCircle className="h-3 w-3 mr-1" />
                            Missing
                          </Badge>
                        )}
                        {config.exists && config.can_read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenConfig(config.path)}
                            disabled={openingConfig === config.path}
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Open
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

