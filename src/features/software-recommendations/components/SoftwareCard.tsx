import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Beer, Loader2, CheckCircle2, Github, ExternalLink } from "lucide-react";
import type { SoftwareRecommendation } from "../types/software-recommendation";
import { useSoftwareRecommendations } from "../hooks/useSoftwareRecommendations";
import { useBrewInstall } from "@/features/cli-installation/hooks/useBrewInstall";
import { toast } from "sonner";
import { openUrl } from "@tauri-apps/plugin-opener";

interface SoftwareCardProps {
  software: SoftwareRecommendation;
  onInstallComplete?: () => void;
}

export function SoftwareCard({ software, onInstallComplete }: SoftwareCardProps) {
  const { config } = useSoftwareRecommendations();
  const category = config?.categories.find((c) => c.id === software.category);

  const brewMethod = software.installMethods.find((m) => m.type === "brew");
  const githubMethod = software.installMethods.find((m) => m.type === "github");
  const websiteMethod = software.installMethods.find((m) => m.type === "website");

  const { install, isInstalling } = useBrewInstall({
    onSuccess: () => {
      toast.success(`Installed ${software.name} successfully`);
      onInstallComplete?.();
    },
    onError: (error) => {
      toast.error(`Installation failed: ${error}`);
    },
  });

  const handleBrewInstall = () => {
    if (brewMethod?.cask) {
      install(brewMethod.cask);
    }
  };

  const isInstalled = software.installed ?? false;
  const hasBrewMethod = !!brewMethod;
  const hasGithubOnly = !!githubMethod && !hasBrewMethod;
  const hasWebsiteOnly = !!websiteMethod && !hasBrewMethod && !hasGithubOnly;

  const githubReleasesUrl = githubMethod
    ? `https://github.com/${githubMethod.owner}/${githubMethod.repo}/releases`
    : undefined;

  return (
    <Card className="flex flex-col hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start gap-4">
          <div className="text-5xl shrink-0">{software.emoji}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-semibold">{software.name}</h3>
              {hasGithubOnly && githubReleasesUrl && (
                <button
                  onClick={async () => {
                    try {
                      await openUrl(githubReleasesUrl);
                    } catch (error) {
                      toast.error(`Failed to open GitHub: ${error instanceof Error ? error.message : String(error)}`);
                    }
                  }}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  title="View on GitHub"
                >
                  <Github className="h-4 w-4" />
                </button>
              )}
              {isInstalled && (
                <Badge variant="default" className="text-xs">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Installed
                </Badge>
              )}
            </div>
            {category && (
              <Badge variant="outline" className="text-xs">
                {category.emoji} {category.name}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {software.description}
        </p>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 items-stretch">
        {brewMethod && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs shrink-0">
              <Beer className="h-3 w-3 mr-1" />
              Brew
            </Badge>
            <Button
              onClick={handleBrewInstall}
              disabled={isInstalling || isInstalled}
              variant="default"
              className="flex-1"
              size="sm"
            >
              {isInstalling ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isInstalled ? (
                "Installed"
              ) : (
                "Install"
              )}
            </Button>
          </div>
        )}
        {hasGithubOnly && (
          <p className="text-xs text-muted-foreground text-center py-2">
            Manual download from GitHub
          </p>
        )}
        {hasWebsiteOnly && websiteMethod?.url && (
          <Button
            onClick={async () => {
              try {
                await openUrl(websiteMethod.url!);
              } catch (error) {
                toast.error(`Failed to open website: ${error instanceof Error ? error.message : String(error)}`);
              }
            }}
            variant="default"
            className="w-full"
            size="sm"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Visit Website
          </Button>
        )}
        {software.installMethods.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-2">
            Manual installation required
          </p>
        )}
      </CardFooter>
    </Card>
  );
}

