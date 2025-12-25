use crate::types::CliToolTemplate;
use std::fs;
use std::path::PathBuf;

/// Get the directory where custom templates are stored
fn get_custom_templates_dir() -> Result<PathBuf, String> {
    let mut dir = dirs::config_dir()
        .ok_or("Failed to find config directory")?;

    dir.push("dev-env-helper");
    dir.push("custom-templates");

    // Create directory if it doesn't exist
    if !dir.exists() {
        fs::create_dir_all(&dir)
            .map_err(|e| format!("Failed to create templates directory: {}", e))?;
    }

    Ok(dir)
}

/// Get the file path for a custom template
fn get_template_path(id: &str) -> Result<PathBuf, String> {
    let dir = get_custom_templates_dir()?;
    Ok(dir.join(format!("{}.json", id)))
}

/// Load all custom templates from the config directory
pub fn load_custom_templates() -> Result<Vec<CliToolTemplate>, String> {
    let dir = get_custom_templates_dir()?;

    if !dir.exists() {
        return Ok(Vec::new());
    }

    let mut templates = Vec::new();

    let entries = fs::read_dir(&dir)
        .map_err(|e| format!("Failed to read templates directory: {}", e))?;

    for entry in entries {
        let entry = entry.map_err(|e| format!("Failed to read directory entry: {}", e))?;
        let path = entry.path();

        if path.extension().and_then(|s| s.to_str()) != Some("json") {
            continue;
        }

        let content = fs::read_to_string(&path)
            .map_err(|e| format!("Failed to read template file {}: {}", path.display(), e))?;

        let template: CliToolTemplate = serde_json::from_str(&content)
            .map_err(|e| format!("Failed to parse template file {}: {}", path.display(), e))?;

        templates.push(template);
    }

    Ok(templates)
}

/// Save a custom template to the config directory
pub fn save_custom_template(template: &CliToolTemplate) -> Result<(), String> {
    let path = get_template_path(&template.id)?;

    let json = serde_json::to_string_pretty(template)
        .map_err(|e| format!("Failed to serialize template: {}", e))?;

    fs::write(&path, json)
        .map_err(|e| format!("Failed to write template file {}: {}", path.display(), e))?;

    Ok(())
}

/// Delete a custom template from the config directory
pub fn delete_custom_template(id: &str) -> Result<(), String> {
    let path = get_template_path(id)?;

    if !path.exists() {
        return Err(format!("Template '{}' not found", id));
    }

    fs::remove_file(&path)
        .map_err(|e| format!("Failed to delete template file {}: {}", path.display(), e))?;

    Ok(())
}

/// Validate that a template is well-formed
pub fn validate_template(template: &CliToolTemplate) -> Result<(), String> {
    if template.id.is_empty() {
        return Err("Template ID cannot be empty".to_string());
    }

    if template.name.is_empty() {
        return Err("Template name cannot be empty".to_string());
    }

    if template.executable.is_empty() {
        return Err("Executable cannot be empty".to_string());
    }

    // Validate that executable name is a valid command name
    if template.executable.contains('/') || template.executable.contains('\\') {
        return Err("Executable should be a command name, not a path".to_string());
    }

    // Validate version parser
    match template.version_parser.as_str() {
        "stdout" | "stderr" | "stdout-first-line" => {},
        _ => return Err("version_parser must be 'stdout', 'stderr', or 'stdout-first-line'".to_string()),
    }

    // Validate config file paths exist (or are home-relative)
    for config in &template.config_files {
        if config.path.is_empty() {
            return Err("Config file path cannot be empty".to_string());
        }
    }

    // Validate dependencies reference valid tool IDs
    if let Some(deps) = &template.dependencies {
        for dep in deps {
            if dep.is_empty() {
                return Err("Dependency ID cannot be empty".to_string());
            }
        }
    }

    Ok(())
}
