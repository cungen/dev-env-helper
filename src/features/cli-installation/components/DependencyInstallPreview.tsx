import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Package, Download, ArrowDown } from "lucide-react";

interface DependencyInstallPreviewProps {
  targetTool: string;
  dependencies: string[];
  onConfirm: () => void;
  onCancel: () => void;
}

export function DependencyInstallPreview({
  targetTool,
  dependencies,
  onConfirm,
  onCancel,
}: DependencyInstallPreviewProps) {
  if (dependencies.length === 0) {
    return null;
  }

  return (
    <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Package className="h-5 w-5 text-blue-600" />
          Dependencies Required
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          To install <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-300">{targetTool}</Badge>, the following
          dependencies will also be installed:
        </p>

        <div className="space-y-2">
          {dependencies.map((dep, index) => (
            <div key={dep} className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="w-6 h-6 rounded-full p-0 flex items-center justify-center bg-orange-100 text-orange-700 border-orange-300"
              >
                {index + 1}
              </Badge>
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                {dep}
              </Badge>
              <Badge variant="outline" className="text-xs bg-slate-100 text-slate-600 border-slate-300">
                Dependency
              </Badge>
              {index < dependencies.length - 1 && (
                <ArrowDown className="h-3 w-3 text-muted-foreground ml-4" />
              )}
            </div>
          ))}
          <div className="flex items-center gap-2 pt-2">
            <Badge
              variant="secondary"
              className="w-6 h-6 rounded-full p-0 flex items-center justify-center bg-purple-100 text-purple-700 border-purple-300"
            >
              {dependencies.length + 1}
            </Badge>
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
              {targetTool}
            </Badge>
            <Badge variant="outline" className="text-xs bg-purple-100 text-purple-700 border-purple-300">
              Target Tool
            </Badge>
          </div>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">
              Total: <Badge variant="outline">{dependencies.length + 1} tools</Badge>
            </p>
            <div className="flex gap-2 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-orange-200 border border-orange-300"></div>
                <span className="text-muted-foreground">Dependencies ({dependencies.length})</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-purple-200 border border-purple-300"></div>
                <span className="text-muted-foreground">Target</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm rounded-md border hover:bg-accent"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Install All
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
