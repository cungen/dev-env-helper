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
      : { activeTab: "home", isCollapsed: false };
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

  // Keyboard shortcuts for tab switching (Cmd/Ctrl + 1-9) and settings (Cmd/Ctrl + ,)
  useEffect(() => {
    if (!options?.tabs) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      // Check for Cmd (Mac) or Ctrl (Windows/Linux) + number key
      if ((e.metaKey || e.ctrlKey) && e.key >= "1" && e.key <= "9") {
        e.preventDefault();
        const index = parseInt(e.key) - 1;
        if (index < options.tabs.length) {
          setActiveTab(options.tabs[index].id);
        }
      }

      // Check for Cmd/Ctrl + , (comma) to open settings
      if ((e.metaKey || e.ctrlKey) && e.key === ",") {
        e.preventDefault();
        const settingsTab = options.tabs.find((tab) => tab.id === "settings");
        if (settingsTab) {
          setActiveTab(settingsTab.id);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [options?.tabs, setActiveTab]);

  return {
    activeTab: state.activeTab,
    isCollapsed: state.isCollapsed,
    setActiveTab,
    toggleCollapsed,
  };
}
