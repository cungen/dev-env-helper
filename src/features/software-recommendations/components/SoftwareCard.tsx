import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GitHubDownloadButton } from "./GitHubDownloadButton";
import { Beer, Loader2 } from "lucide-react";
import type { SoftwareRecommendation } from "../types/software-recommendation";
import { useSoftwareRecommendations } from "../hooks/useSoftwareRecommendations";
import { useBrewInstall } from "@/features/cli-installation/hooks/useBrewInstall";
import { toast } from "sonner";

interface SoftwareCardProps {
  software: SoftwareRecommendation;
}

export function SoftwareCard({ software }: SoftwareCardProps) {
  const { config } = useSoftwareRecommendations();
  const category = config?.categories.find((c) => c.id === software.category);

  const brewMethod = software.installMethods.find((m) => m.type === "brew");
  const githubMethod = software.installMethods.find((m) => m.type === "github");

  const { install, isInstalling } = useBrewInstall({
    onSuccess: () => {
      toast.success(`Installed ${software.name} successfully`);
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

  return (
    <Card className="flex flex-col hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start gap-4">
          <div className="text-5xl shrink-0">{software.emoji}</div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-semibold mb-1">{software.name}</h3>
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
              disabled={isInstalling}
              variant="default"
              className="flex-1"
              size="sm"
            >
              {isInstalling ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Install"
              )}
            </Button>
          </div>
        )}
        {githubMethod && (
          <GitHubDownloadButton
            owner={githubMethod.owner!}
            repo={githubMethod.repo!}
            assetPattern={githubMethod.assetPattern}
            softwareName={software.name}
          />
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

