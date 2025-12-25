import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Beer, Package } from "lucide-react";
import type { InstallMethod } from "@/features/cli-management/types/cli-tool";

interface InstallMethodBadgeProps {
  method: InstallMethod;
}

export function InstallMethodBadge({ method }: InstallMethodBadgeProps) {
  const variants = {
    brew: { icon: Beer, label: "Brew", tooltip: "Install via Homebrew" },
    dmg: { icon: Package, label: "DMG", tooltip: "Download DMG Installer" },
    script: { icon: Package, label: "Script", tooltip: "Run installation script" },
  };

  const variant = variants[method.type];
  if (!variant) return null;

  const { icon: Icon, label, tooltip } = variant;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant="outline" className="text-xs h-6 px-2">
          <Icon className="h-3 w-3 mr-1" />
          {label}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-xs">{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
}
