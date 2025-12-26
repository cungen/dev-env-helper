import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Terminal, Package, CheckCircle2, Loader2 } from "lucide-react";
import type { RestoreItem } from "../types/restore";

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return dateString;
  }
}

interface RestoreItemCardProps {
  item: RestoreItem;
  isSelected: boolean;
  onSelect: (itemId: string, selected: boolean) => void;
  onInstall: (item: RestoreItem) => void;
  isInstalling?: boolean;
  /**
   * When true, displays only icon, name, and installed badge.
   * Hides install button, selection checkbox, type badge, date, and description.
   * Used for installed items in the restore page.
   */
  minimalDisplay?: boolean;
}

export function RestoreItemCard({
  item,
  isSelected,
  onSelect,
  onInstall,
  isInstalling = false,
  minimalDisplay = false,
}: RestoreItemCardProps) {
  const isInstalled =
    item.type === "tool"
      ? item.data.installed
      : item.data.installed ?? false;

  const canSelect = !isInstalled;
  const canInstall = !isInstalled && !isInstalling;

  const handleSelect = (checked: boolean) => {
    if (canSelect) {
      onSelect(item.id, checked);
    }
  };

  const handleInstall = () => {
    if (canInstall) {
      onInstall(item);
    }
  };

  const displayName = item.type === "tool" ? item.data.template?.name ?? item.data.templateId : item.data.name;
  const displayIcon = item.type === "tool" ? <Terminal className="h-8 w-8" /> : <span className="text-4xl">{item.data.emoji}</span>;
  const exportDate = item.type === "tool" ? item.data.detectedAt : undefined;

  // Minimal display for installed items
  if (minimalDisplay) {
    const version = item.type === "tool" ? item.data.version : undefined;
    const category = item.type === "software" ? item.data.category : undefined;

    return (
      <Card className="flex flex-col items-center justify-center p-3 hover:shadow-md transition-all h-full">
        <div className="flex flex-col items-center gap-2 w-full">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted shrink-0">
            {item.type === "tool" ? <Terminal className="h-5 w-5" /> : <span className="text-2xl">{item.data.emoji}</span>}
          </div>
          <div className="flex flex-col items-center gap-1 w-full min-w-0">
            <h3 className="text-sm font-medium text-center break-words leading-tight line-clamp-2 w-full">
              {displayName}
            </h3>
            {version && (
              <span className="text-xs text-muted-foreground shrink-0">
                v{version}
              </span>
            )}
            {!version && category && (
              <span className="text-xs text-muted-foreground shrink-0 capitalize">
                {category}
              </span>
            )}
          </div>
        </div>
      </Card>
    );
  }

  // Full display for not-installed items
  return (
    <Card
      className={`flex flex-col h-full hover:shadow-md transition-all py-3 ${
        isSelected ? "ring-2 ring-primary" : ""
      }`}
    >
      <CardHeader className="flex-shrink-0 px-4 pb-2 pt-0">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 shrink-0">
            <Checkbox
              checked={isSelected}
              onCheckedChange={handleSelect}
              disabled={!canSelect}
              className="mt-1"
            />
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-muted shrink-0">
              {displayIcon}
            </div>
          </div>
          <div className="flex-1 min-w-0 overflow-hidden">
            <div className="flex items-start gap-2 mb-1 flex-wrap">
              <h3 className="text-base font-semibold break-words leading-tight">{displayName}</h3>
              {isInstalled && (
                <Badge variant="default" className="text-xs shrink-0">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Installed
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs shrink-0">
                {item.type === "tool" ? (
                  <>
                    <Terminal className="h-3 w-3 mr-1" />
                    CLI Tool
                  </>
                ) : (
                  <>
                    <Package className="h-3 w-3 mr-1" />
                    Software
                  </>
                )}
              </Badge>
              {exportDate && (
                <span className="text-xs text-muted-foreground shrink-0 whitespace-nowrap">
                  {formatDate(exportDate)}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      {item.type === "software" && item.data.description && (
        <CardContent className="flex-1 min-h-0 px-4 py-2">
          <p className="text-sm text-muted-foreground line-clamp-2 break-words">
            {item.data.description}
          </p>
        </CardContent>
      )}
      <CardFooter className="flex-shrink-0 mt-auto px-4 pt-2 pb-0">
        <Button
          onClick={handleInstall}
          disabled={!canInstall}
          variant="default"
          className="w-full"
          size="sm"
        >
          {isInstalling ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Installing...
            </>
          ) : isInstalled ? (
            "Installed"
          ) : (
            "Install"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

