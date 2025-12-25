import { useState, useEffect } from "react";
import type { NavigationState } from "@/types/navigation";

const STORAGE_KEY = "sidebar-state";

interface UseNavigationOptions {
  tabs: Array<{ id: string }>;
}

export function useNavigation(options?: UseNavigationOptions) {
  const [state, setState] = useState<NavigationState>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored
      ? JSON.parse(stored)
      : { activeTab: "cli-tools", isCollapsed: false };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const setActiveTab = (tabId: string) => {
    setState((prev) => ({ ...prev, activeTab: tabId }));
  };

  const toggleCollapsed = () => {
    setState((prev) => ({ ...prev, isCollapsed: !prev.isCollapsed }));
  };

  // Keyboard shortcuts for tab switching (Cmd/Ctrl + 1-9)
  useEffect(() => {
    if (!options?.tabs) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Cmd (Mac) or Ctrl (Windows/Linux) + number key
      if ((e.metaKey || e.ctrlKey) && e.key >= "1" && e.key <= "9") {
        e.preventDefault();
        const index = parseInt(e.key) - 1;
        if (index < options.tabs.length) {
          setActiveTab(options.tabs[index].id);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [options?.tabs]);

  return {
    activeTab: state.activeTab,
    isCollapsed: state.isCollapsed,
    setActiveTab,
    toggleCollapsed,
  };
}
