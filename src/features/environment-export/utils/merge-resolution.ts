import type { CliToolTemplate } from "@/features/cli-management/types/cli-tool";
import { listCustomTemplates } from "@/features/cli-management/api/cli-commands";

export type MergeStrategy = "skip" | "overwrite" | "rename";

export interface TemplateConflict {
  imported: CliToolTemplate;
  existing: CliToolTemplate;
  strategy: MergeStrategy;
  newName?: string;
}

export interface MergeResolution {
  conflicts: TemplateConflict[];
  hasConflicts: boolean;
  resolvedCount: number;
}

/**
 * Detects conflicts between imported custom templates and existing ones
 */
export async function detectTemplateConflicts(
  importedTemplates: CliToolTemplate[]
): Promise<MergeResolution> {
  const existingTemplates = await listCustomTemplates();
  const conflicts: TemplateConflict[] = [];

  for (const imported of importedTemplates) {
    const existing = existingTemplates.find((t) => t.id === imported.id);
    if (existing) {
      // Check if they're actually different
      if (JSON.stringify(imported) !== JSON.stringify(existing)) {
        conflicts.push({
          imported,
          existing,
          strategy: "skip", // Default strategy
        });
      }
    }
  }

  return {
    conflicts,
    hasConflicts: conflicts.length > 0,
    resolvedCount: 0,
  };
}

/**
 * Applies merge strategies to resolve conflicts
 */
export function applyMergeStrategies(
  importedTemplates: CliToolTemplate[],
  resolution: MergeResolution
): CliToolTemplate[] {
  const result: CliToolTemplate[] = [];
  const conflictMap = new Map(
    resolution.conflicts.map((c) => [c.imported.id, c])
  );

  for (const template of importedTemplates) {
    const conflict = conflictMap.get(template.id);

    if (!conflict) {
      // No conflict, add as-is
      result.push(template);
    } else {
      // Apply the resolution strategy
      switch (conflict.strategy) {
        case "skip":
          // Don't include this template
          break;
        case "overwrite":
          // Use the imported version
          result.push(conflict.imported);
          break;
        case "rename":
          // Use with new name/ID
          if (conflict.newName) {
            result.push({
              ...conflict.imported,
              id: conflict.newName,
              name: `${conflict.imported.name} (imported)`,
            });
          }
          break;
      }
    }
  }

  return result;
}

/**
 * Generates a unique ID for a renamed template
 */
export function generateUniqueId(
  baseId: string,
  existingIds: Set<string>
): string {
  let counter = 1;
  let newId = `${baseId}-imported`;

  while (existingIds.has(newId)) {
    newId = `${baseId}-imported-${counter}`;
    counter++;
  }

  return newId;
}
