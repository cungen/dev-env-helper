import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTab } from "./SidebarTab";
import type { FeatureTab } from "@/types/navigation";

interface SidebarProps {
  tabs: FeatureTab[];
  activeTab: string;
  isCollapsed: boolean;
  onSelectTab: (tabId: string) => void;
  onToggleCollapse: () => void;
}

export function Sidebar({
  tabs,
  activeTab,
  isCollapsed,
  onSelectTab,
  onToggleCollapse,
}: SidebarProps) {
  return (
    <aside
      className={cn(
        "flex flex-col border-r bg-background transition-all duration-300",
        isCollapsed ? "w-16" : "w-60"
      )}
    >
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-2">
          {tabs.map((tab) => (
            <SidebarTab
              key={tab.id}
              tab={tab}
              isActive={activeTab === tab.id}
              isCollapsed={isCollapsed}
              onClick={() => onSelectTab(tab.id)}
            />
          ))}
        </nav>
      </div>
      <div className="border-t p-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={onToggleCollapse}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span className="ml-2">Collapse</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
