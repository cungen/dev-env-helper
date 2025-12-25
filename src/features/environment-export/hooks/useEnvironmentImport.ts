import { useState, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import type { EnvironmentExport } from "@/shared/types/environment-export";
import { validateEnvironmentSchema, migrateEnvironmentSchema } from "../utils/schema-validation";
import {
  detectTemplateConflicts,
  applyMergeStrategies,
  type MergeResolution,
  type MergeStrategy,
} from "../utils/merge-resolution";

export interface ImportResult {
  success: boolean;
  data?: EnvironmentExport;
  error?: string;
  warnings?: string[];
}

export function useEnvironmentImport() {
  const [isImporting, setIsImporting] = useState(false);
  const [preview, setPreview] = useState<EnvironmentExport | null>(null);
  const [mergeResolution, setMergeResolution] = useState<MergeResolution | null>(null);

  const previewFile = useCallback(async (file: File): Promise<ImportResult> => {
    setIsImporting(true);

    try {
      const text = await file.text();
      let data = JSON.parse(text) as EnvironmentExport;

      // First validate the schema
      const validation = validateEnvironmentSchema(data);

      if (!validation.valid) {
        return {
          success: false,
          error: validation.errors?.join(", ") || "Invalid schema",
        };
      }

      // Check if migration is needed
      const allWarnings: string[] = [];
      if (data.schemaVersion && data.schemaVersion !== "1.0") {
        const migrationResult = migrateEnvironmentSchema(data);
        data = migrationResult.data as EnvironmentExport;
        allWarnings.push(...migrationResult.warnings);
      }

      // Add validation warnings if any
      if (validation.warnings) {
        allWarnings.push(...validation.warnings);
      }

      // Detect merge conflicts for custom templates
      if (data.customTemplates && data.customTemplates.length > 0) {
        const conflicts = await detectTemplateConflicts(data.customTemplates);
        setMergeResolution(conflicts);
      } else {
        setMergeResolution(null);
      }

      setPreview(data);

      return {
        success: true,
        data,
        warnings: allWarnings.length > 0 ? allWarnings : undefined,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to parse file",
      };
    } finally {
      setIsImporting(false);
    }
  }, []);

  const updateConflictStrategy = useCallback(
    (templateId: string, strategy: MergeStrategy, newName?: string) => {
      if (!mergeResolution) return;

      setMergeResolution((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          conflicts: prev.conflicts.map((conflict) =>
            conflict.imported.id === templateId
              ? { ...conflict, strategy, newName }
              : conflict
          ),
          resolvedCount:
            prev.resolvedCount +
            (prev.conflicts.find((c) => c.imported.id === templateId)?.strategy !== strategy ? 1 : 0),
        };
      });
    },
    [mergeResolution]
  );

  const confirmImport = useCallback(async (): Promise<ImportResult> => {
    if (!preview) {
      return {
        success: false,
        error: "No preview data available",
      };
    }

    setIsImporting(true);

    try {
      // Apply merge strategies if there are conflicts
      let finalData = { ...preview };
      if (mergeResolution && mergeResolution.hasConflicts && preview.customTemplates) {
        finalData = {
          ...preview,
          customTemplates: applyMergeStrategies(preview.customTemplates, mergeResolution),
        };
      }

      // Call the backend import command
      const result = await invoke<EnvironmentExport>("import_environment", {
        // In a real implementation, we'd use a file dialog
        path: finalData.exportedAt, // placeholder
      });

      setPreview(null);
      setMergeResolution(null);

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to import environment",
      };
    } finally {
      setIsImporting(false);
    }
  }, [preview, mergeResolution]);

  const cancelPreview = useCallback(() => {
    setPreview(null);
    setMergeResolution(null);
  }, []);

  return {
    isImporting,
    preview,
    mergeResolution,
    previewFile,
    confirmImport,
    cancelPreview,
    updateConflictStrategy,
  };
}
