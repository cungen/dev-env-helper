import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CliToolDetection } from "../types/cli-tool";
import type { CliToolTemplate } from "../types/cli-tool";

export interface CliToolCardProps {
  tool: CliToolDetection;
  template?: CliToolTemplate;
  onClick: () => void;
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

const getToolEmoji = (id: string, template?: CliToolTemplate) => {
  if (template?.emoji) return template.emoji;
  return "⚙️"; // Default emoji
};

export function CliToolCard({ tool, template, onClick }: CliToolCardProps) {
  const toolName = getToolName(tool.templateId, template);
  const emoji = getToolEmoji(tool.templateId, template);

  return (
    <Card
      className={cn(
        "p-4 cursor-pointer hover:shadow-md transition-shadow",
        tool.installed && "border-green-500/20 bg-green-500/5"
      )}
      onClick={onClick}
    >
      <div className="flex flex-col gap-3">
        {/* Header: Emoji and Name */}
        <div className="flex items-center gap-3">
          <div className="text-3xl shrink-0">{emoji}</div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base truncate">{toolName}</h3>
            {tool.installed && tool.version && (
              <p className="text-xs text-muted-foreground">v{tool.version}</p>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          {tool.installed ? (
            <Badge
              variant="default"
              className="text-xs bg-green-500/10 text-green-600 border-green-500/20 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30"
            >
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Installed
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-xs">
              Not Installed
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
}
