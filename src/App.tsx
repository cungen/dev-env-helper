import { Sidebar } from "@/components/Sidebar";
import { useNavigation } from "@/hooks/useNavigation";
import { HomePage } from "@/features/home-page/components/HomePage";
import { CliToolsPage } from "@/features/cli-management/components/CliToolsPage";
import { SoftwareRecommendationsPage } from "@/features/software-recommendations/components/SoftwareRecommendationsPage";
import { RestorePage } from "@/features/restore-page/components/RestorePage";
import { SettingsPage } from "@/features/settings/components/SettingsPage";
import { InstallationProvider } from "@/features/cli-installation/context/InstallationContext";
import type { FeatureTab } from "@/types/navigation";
import { Toaster } from "@/components/ui/sonner";

const featureTabs: FeatureTab[] = [
  {
    id: "home",
    label: "Home",
    icon: "Search",
    component: () => <HomePage />,
  },
  {
    id: "cli-tools",
    label: "CLI Tools",
    icon: "Terminal",
    component: () => <CliToolsPage />,
  },
  {
    id: "software",
    label: "Software",
    icon: "Grid3x3",
    component: () => <SoftwareRecommendationsPage />,
  },
  {
    id: "restore",
    label: "Restore",
    icon: "Download",
    component: () => <RestorePage />,
  },
  {
    id: "settings",
    label: "Settings",
    icon: "Settings",
    component: () => <SettingsPage />,
  },
];

function App() {
  const { activeTab, isCollapsed, setActiveTab, toggleCollapsed } = useNavigation({
    tabs: featureTabs,
  });

  const activeTabData = featureTabs.find((tab) => tab.id === activeTab);
  const ActiveComponent = activeTabData?.component;

  return (
    <InstallationProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar
          tabs={featureTabs}
          activeTab={activeTab}
          isCollapsed={isCollapsed}
          onSelectTab={setActiveTab}
          onToggleCollapse={toggleCollapsed}
        />
        <main className="flex-1 min-w-0 overflow-y-auto bg-background">
          {ActiveComponent ? <ActiveComponent /> : null}
        </main>
        <Toaster />
      </div>
    </InstallationProvider>
  );
}

export default App;
