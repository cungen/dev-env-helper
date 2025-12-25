import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Network } from "lucide-react";
import type { DependencyNode } from "../types/dependency";

interface DependencyTreeProps {
  root: DependencyNode;
}

export function DependencyTree({ root }: DependencyTreeProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Network className="h-5 w-5" />
          Dependency Tree
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <DependencyNodeItem node={root} level={0} />
        </div>
      </CardContent>
    </Card>
  );
}

interface DependencyNodeItemProps {
  node: DependencyNode;
  level: number;
}

function DependencyNodeItem({ node, level }: DependencyNodeItemProps) {
  const indent = level * 24;

  return (
    <div>
      <div
        className="flex items-center gap-2 py-2"
        style={{ paddingLeft: `${indent}px` }}
      >
        {level > 0 && (
          <div className="flex items-center">
            <div className="w-4 h-0.5 bg-border mr-2" />
            <div className="w-0.5 h-6 bg-border absolute" style={{ marginLeft: '-1px' }} />
          </div>
        )}
        <span className="font-medium">{node.toolId}</span>
        <Badge
          variant={node.installed ? "default" : "secondary"}
          className={node.installed ? "bg-green-500" : ""}
        >
          {node.installed ? "Installed" : "Missing"}
        </Badge>
        {node.requiredBy.length > 0 && (
          <Badge variant="outline" className="text-xs">
            Required by: {node.requiredBy.join(", ")}
          </Badge>
        )}
      </div>
      {node.dependencies.length > 0 && (
        <div>
          {node.dependencies.map((dep) => (
            <DependencyNodeItem key={dep.toolId} node={dep} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
