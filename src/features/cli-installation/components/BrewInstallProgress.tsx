import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Terminal, CheckCircle2, XCircle, Loader2 } from "lucide-react";

interface BrewInstallProgressProps {
  isInstalling: boolean;
  output: string[];
  error: string | null;
  success: boolean;
}

export function BrewInstallProgress({
  isInstalling,
  output,
  error,
  success,
}: BrewInstallProgressProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Terminal className="h-5 w-5" />
          Installation Progress
          {isInstalling && <Loader2 className="h-4 w-4 animate-spin ml-auto" />}
          {!isInstalling && success && (
            <CheckCircle2 className="h-4 w-4 text-green-500 ml-auto" />
          )}
          {!isInstalling && error && (
            <XCircle className="h-4 w-4 text-destructive ml-auto" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px] w-full rounded-md border bg-black p-4">
          <div className="font-mono text-sm text-green-400 space-y-1">
            {output.length === 0 && !isInstalling && !error && (
              <p className="text-gray-500">$ Ready to install...</p>
            )}
            {output.map((line, index) => (
              <p key={index}>{line}</p>
            ))}
            {isInstalling && (
              <p className="animate-pulse">$ Installing...</p>
            )}
            {error && (
              <p className="text-red-400">$ Error: {error}</p>
            )}
            {success && (
              <p className="text-green-400">$ Installation complete!</p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
