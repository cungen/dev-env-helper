import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGitHubRelease } from "../hooks/useGitHubRelease";
import { useGitHubDownload } from "../hooks/useGitHubDownload";
import { Download, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface GitHubDownloadButtonProps {
  owner: string;
  repo: string;
  assetPattern?: string;
  softwareName: string;
}

export function GitHubDownloadButton({
  owner,
  repo,
  assetPattern,
  softwareName,
}: GitHubDownloadButtonProps) {
  const { release, isLoading: isLoadingRelease, error: releaseError } =
    useGitHubRelease(owner, repo, assetPattern);
  const {
    download,
    isDownloading,
    progress,
    error: downloadError,
  } = useGitHubDownload({
    onSuccess: () => {
      toast.success(`Downloaded ${softwareName} successfully`);
    },
    onError: (error) => {
      toast.error(`Download failed: ${error}`);
    },
  });

  const handleDownload = () => {
    if (release && release.assets.length > 0) {
      download(release.assets[0].browser_download_url);
    }
  };

  if (isLoadingRelease) {
    return (
      <Button disabled variant="outline" className="w-full">
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        Loading...
      </Button>
    );
  }

  if (releaseError) {
    return (
      <div className="flex flex-col gap-2">
        <Button disabled variant="outline" className="w-full">
          <AlertCircle className="h-4 w-4 mr-2" />
          Error loading release
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          {releaseError}
        </p>
      </div>
    );
  }

  if (!release || release.assets.length === 0) {
    return (
      <Button disabled variant="outline" className="w-full">
        No release available
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {release.tag_name && (
        <Badge variant="outline" className="text-xs w-fit self-center">
          v{release.tag_name}
        </Badge>
      )}
      <Button
        onClick={handleDownload}
        disabled={isDownloading}
        variant="default"
        className="w-full"
      >
        {isDownloading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Downloading {progress}%
          </>
        ) : (
          <>
            <Download className="h-4 w-4 mr-2" />
            Download
          </>
        )}
      </Button>
      {downloadError && (
        <p className="text-xs text-destructive text-center">{downloadError}</p>
      )}
    </div>
  );
}

