export interface ValidationResult {
  valid: boolean;
  errors?: string[];
  warnings?: string[];
}

const CURRENT_SCHEMA_VERSION = "1.0";
const SUPPORTED_SCHEMA_VERSIONS = ["0.9", "1.0"];

/**
 * Migrates an EnvironmentExport from an older schema version to the current version
 */
export function migrateEnvironmentSchema(data: any): { data: any; warnings: string[] } {
  const warnings: string[] = [];
  let migratedData = { ...data };

  // Get the version (default to "0.9" if not specified for backward compatibility)
  const version = migratedData.schemaVersion || "0.9";

  // Apply migrations in sequence
  if (version === "0.9") {
    const result = migrateFrom0Dot9(migratedData);
    migratedData = result.data;
    warnings.push(...result.warnings);
  }

  // Update schema version to current
  migratedData.schemaVersion = CURRENT_SCHEMA_VERSION;

  return { data: migratedData, warnings };
}

/**
 * Migration from schema version 0.9 to 1.0
 *
 * Changes in 1.0:
 * - Added dependencies field to custom templates
 * - Added installMethods field with brew and dmg support
 * - Renamed some fields for consistency
 */
function migrateFrom0Dot9(data: any): { data: any; warnings: string[] } {
  const warnings: string[] = [];
  const migratedData = { ...data };

  // Migrate custom templates
  if (migratedData.customTemplates && Array.isArray(migratedData.customTemplates)) {
    migratedData.customTemplates = migratedData.customTemplates.map((template: any) => {
      const migrated = { ...template };

      // Ensure dependencies field exists
      if (!migrated.dependencies) {
        migrated.dependencies = [];
      }

      // Ensure installMethods field exists
      if (!migrated.installMethods) {
        migrated.installMethods = [];
      }

      return migrated;
    });

    warnings.push(`Migrated ${migratedData.customTemplates.length} custom templates to schema 1.0`);
  }

  // Ensure tools have required fields
  if (migratedData.tools && Array.isArray(migratedData.tools)) {
    migratedData.tools = migratedData.tools.map((tool: any) => {
      const migrated = { ...tool };

      // Ensure configFiles exists
      if (!migrated.configFiles) {
        migrated.configFiles = [];
      }

      return migrated;
    });
  }

  warnings.push("Migrated environment export from schema version 0.9 to 1.0");

  return { data: migratedData, warnings };
}

/**
 * Validates an EnvironmentExport against the expected schema
 */
export function validateEnvironmentSchema(data: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if data is an object
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return {
      valid: false,
      errors: ["Invalid data: expected an object"],
    };
  }

  const obj = data as Record<string, unknown>;

  // Validate schema version
  if (!obj.schemaVersion || typeof obj.schemaVersion !== "string") {
    errors.push("Missing or invalid schemaVersion");
  } else if (!SUPPORTED_SCHEMA_VERSIONS.includes(obj.schemaVersion)) {
    warnings.push(
      `Schema version ${obj.schemaVersion} may not be fully supported (supported: ${SUPPORTED_SCHEMA_VERSIONS.join(", ")})`
    );
  }

  // Validate exportedAt
  if (!obj.exportedAt || typeof obj.exportedAt !== "string") {
    errors.push("Missing or invalid exportedAt timestamp");
  } else if (isNaN(Date.parse(obj.exportedAt))) {
    errors.push("Invalid exportedAt timestamp format");
  }

  // Validate tools array
  if (!obj.tools || !Array.isArray(obj.tools)) {
    errors.push("Missing or invalid tools array");
  } else {
    // Validate each tool
    obj.tools.forEach((tool: unknown, index: number) => {
      if (!tool || typeof tool !== "object") {
        errors.push(`Tool at index ${index} is invalid`);
        return;
      }

      const toolObj = tool as Record<string, unknown>;

      if (!toolObj.templateId || typeof toolObj.templateId !== "string") {
        errors.push(`Tool at index ${index} missing templateId`);
      }

      if (typeof toolObj.installed !== "boolean") {
        errors.push(`Tool at index ${index} missing or invalid installed status`);
      }
    });
  }

  // Validate custom templates array
  if (obj.customTemplates && !Array.isArray(obj.customTemplates)) {
    errors.push("Invalid customTemplates: expected an array");
  }

  // Validate hostname (optional)
  if (obj.hostname && typeof obj.hostname !== "string") {
    warnings.push("Invalid hostname format");
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

/**
 * Validates that a custom tool template is well-formed
 */
export function validateCustomToolTemplate(data: unknown): ValidationResult {
  const errors: string[] = [];

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return {
      valid: false,
      errors: ["Invalid template: expected an object"],
    };
  }

  const obj = data as Record<string, unknown>;

  // Required fields
  if (!obj.id || typeof obj.id !== "string") {
    errors.push("Missing or invalid id");
  }

  if (!obj.name || typeof obj.name !== "string") {
    errors.push("Missing or invalid name");
  }

  if (!obj.executable || typeof obj.executable !== "string") {
    errors.push("Missing or invalid executable");
  }

  if (!obj.versionCommand || typeof obj.versionCommand !== "string") {
    errors.push("Missing or invalid versionCommand");
  }

  // Validate versionParser
  if (
    obj.versionParser &&
    typeof obj.versionParser === "string" &&
    !["stdout", "stderr", "stdout-first-line"].includes(obj.versionParser)
  ) {
    errors.push("Invalid versionParser: must be 'stdout', 'stderr', or 'stdout-first-line'");
  }

  // Validate arrays
  if (obj.configFiles && !Array.isArray(obj.configFiles)) {
    errors.push("Invalid configFiles: expected an array");
  }

  if (obj.installMethods && !Array.isArray(obj.installMethods)) {
    errors.push("Invalid installMethods: expected an array");
  }

  if (obj.dependencies && !Array.isArray(obj.dependencies)) {
    errors.push("Invalid dependencies: expected an array");
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}
