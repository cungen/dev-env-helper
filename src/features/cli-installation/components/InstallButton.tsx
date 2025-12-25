import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, Beer, Package } from "lucide-react";
import type { InstallMethod } from "@/features/cli-management/types/cli-tool";

interface InstallButtonProps {
  installMethods?: InstallMethod[];
  onInstall: (method: InstallMethod) => void;
  isInstalling?: boolean;
}

export function InstallButton({
  installMethods,
  onInstall,
  isInstalling = false,
}: InstallButtonProps) {
  if (!installMethods || installMethods.length === 0) {
    return (
      <Button disabled size="sm">
        Installation Not Available
      </Button>
    );
  }

  if (installMethods.length === 1) {
    const method = installMethods[0];
    return (
      <Button
        onClick={() => onInstall(method)}
        disabled={isInstalling}
        size="sm"
      >
        {isInstalling ? (
          <>Installing...</>
        ) : (
          <>
            <Download className="h-4 w-4 mr-2" />
            Install
          </>
        )}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button disabled={isInstalling} size="sm">
          {isInstalling ? (
            <>Installing...</>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Install
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {installMethods.map((method) => (
          <DropdownMenuItem key={method.type} onClick={() => onInstall(method)}>
            {method.type === "brew" && (
              <>
                <Beer className="h-4 w-4 mr-2" />
                Install via Homebrew
              </>
            )}
            {method.type === "dmg" && (
              <>
                <Package className="h-4 w-4 mr-2" />
                Download DMG
              </>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
