import { useState, useMemo } from "react";
import { useSoftwareRecommendations } from "../hooks/useSoftwareRecommendations";
import { CategoryFilter } from "./CategoryFilter";
import { SoftwareCard } from "./SoftwareCard";
import { Card } from "@/components/ui/card";
import { AlertCircle, Loader2 } from "lucide-react";

export function SoftwareRecommendationsPage() {
  const { config, isLoading, error } = useSoftwareRecommendations();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredSoftware = useMemo(() => {
    if (!config) return [];
    if (selectedCategory === "all") return config.software;
    return config.software.filter((s) => s.category === selectedCategory);
  }, [config, selectedCategory]);

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
        <h1 className="text-3xl font-bold mb-2">Software Recommendations</h1>
        <p className="text-muted-foreground">
          Discover and install recommended development software
        </p>
      </div>

      <CategoryFilter
        categories={config.categories}
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
            <SoftwareCard key={software.id} software={software} />
          ))}
        </div>
      )}
    </div>
  );
}

