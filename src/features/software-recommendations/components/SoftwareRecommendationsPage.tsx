import { useState, useMemo, useEffect } from "react";
import { useSoftwareRecommendations } from "../hooks/useSoftwareRecommendations";
import { useSoftwareInstallationStatus } from "../hooks/useSoftwareInstallationStatus";
import { CategoryFilter, type Category } from "@/components/CategoryFilter";
import { SoftwareCard } from "./SoftwareCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2, RefreshCw } from "lucide-react";

export function SoftwareRecommendationsPage() {
  const { config, isLoading, error } = useSoftwareRecommendations();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const {
    isDetecting,
    detectStatus,
    refreshStatus,
    updateSoftwareWithStatus,
  } = useSoftwareInstallationStatus();

  // Detect installation status when config loads (in background, non-blocking)
  useEffect(() => {
    if (config && config.software.length > 0) {
      // Run detection in background without showing loading state
      detectStatus(config.software, false).catch(() => {
        // Error already handled in hook
      });
    }
  }, [config, detectStatus]);

  const filteredSoftware = useMemo(() => {
    if (!config) return [];
    let software = config.software;
    if (selectedCategory !== "all") {
      software = software.filter((s) => s.category === selectedCategory);
    }
    return updateSoftwareWithStatus(software);
  }, [config, selectedCategory, updateSoftwareWithStatus]);

  const handleRefresh = async () => {
    if (config && config.software.length > 0) {
      await refreshStatus(config.software);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full p-4 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground mt-4">Loading software recommendations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full p-4">
        <Card className="border-destructive p-4">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        </Card>
      </div>
    );
  }

  if (!config || config.software.length === 0) {
    return (
      <div className="flex flex-col h-full p-4 items-center justify-center">
        <p className="text-muted-foreground text-center">
          No software recommendations available.
          <br />
          Check your configuration file.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-4">
      <div className="mb-6 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold mb-2">Software Recommendations</h1>
            <p className="text-muted-foreground">
              Discover and install recommended development software
            </p>
          </div>
          {config && config.software.length > 0 && (
            <Button
              onClick={handleRefresh}
              disabled={isDetecting}
              variant="outline"
              size="sm"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isDetecting ? "animate-spin" : ""}`}
              />
              Refresh Status
            </Button>
          )}
        </div>
      </div>

      <CategoryFilter
        categories={config.categories.map((c) => ({
          id: c.id,
          name: c.name,
          emoji: c.emoji,
        }))}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        className="mb-6 flex-shrink-0"
      />

      {filteredSoftware.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            No software found in this category.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto">
          {filteredSoftware.map((software) => (
            <SoftwareCard
              key={software.id}
              software={software}
              onInstallComplete={handleRefresh}
            />
          ))}
        </div>
      )}
    </div>
  );
}

