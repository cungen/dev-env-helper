import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import type { FeatureTab } from "@/types/navigation";
import * as Icons from "lucide-react";

interface SidebarTabProps {
  tab: FeatureTab;
  isActive: boolean;
  isCollapsed: boolean;
  onClick: () => void;
}

// Dynamic icon component
function Icon({ name, className }: { name: string; className?: string }) {
  const IconComponent = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[name];
  if (!IconComponent) return null;
  return <IconComponent className={className} />;
}

export function SidebarTab({ tab, isActive, isCollapsed, onClick }: SidebarTabProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        buttonVariants({ variant: "ghost", size: "sm" }),
        "w-full justify-start",
        isActive && "bg-muted"
      )}
      title={isCollapsed ? tab.label : undefined}
    >
      <Icon name={tab.icon} className="h-4 w-4" />
      {!isCollapsed && <span className="ml-2">{tab.label}</span>}
    </button>
  );
}
