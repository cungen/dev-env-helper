import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Download, CheckCircle2, XCircle, Loader2 } from "lucide-react";

interface DmgInstallProgressProps {
  isDownloading: boolean;
  progress: number;
  downloaded: number;
  total: number;
  error: string | null;
  success: boolean;
  fileName?: string;
}

export function DmgInstallProgress({
  isDownloading,
  progress,
  downloaded,
  total,
  error,
  success,
  fileName,
}: DmgInstallProgressProps) {
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Download Progress
          {isDownloading && <Loader2 className="h-4 w-4 animate-spin ml-auto" />}
          {!isDownloading && success && (
            <CheckCircle2 className="h-4 w-4 text-green-500 ml-auto" />
          )}
          {!isDownloading && error && (
            <XCircle className="h-4 w-4 text-destructive ml-auto" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {fileName && (
          <p className="text-sm text-muted-foreground truncate">{fileName}</p>
        )}
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{progress.toFixed(0)}%</span>
          <span>
            {isDownloading || success
              ? `${formatBytes(downloaded)} / ${formatBytes(total)}`
              : "Ready to download"}
          </span>
        </div>
        {error && (
          <p className="text-sm text-destructive">Error: {error}</p>
        )}
        {success && !isDownloading && (
          <p className="text-sm text-green-600">
            Download complete! The DMG file has been opened in Finder.
            Please follow the installation instructions.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
