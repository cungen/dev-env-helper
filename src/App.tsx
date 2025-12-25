import { Sidebar } from "@/components/Sidebar";
import { useNavigation } from "@/hooks/useNavigation";
import { CliToolsPage } from "@/features/cli-management/components/CliToolsPage";
import { EnvironmentPage } from "@/features/environment-export/components/EnvironmentPage";
import { SoftwareRecommendationsPage } from "@/features/software-recommendations/components/SoftwareRecommendationsPage";
import { InstallationProvider } from "@/features/cli-installation/context/InstallationContext";
import type { FeatureTab } from "@/types/navigation";
import { Toaster } from "@/components/ui/sonner";

const featureTabs: FeatureTab[] = [
  {
    id: "cli-tools",
    label: "CLI Tools",
    icon: "Terminal",
    component: () => <CliToolsPage />,
  },
  {
    id: "environment",
    label: "Environment",
    icon: "Download",
    component: () => <EnvironmentPage />,
  },
  {
    id: "software",
    label: "Software",
    icon: "Grid3x3",
    component: () => <SoftwareRecommendationsPage />,
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
