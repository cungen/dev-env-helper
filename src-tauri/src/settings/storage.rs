use crate::types::AppSettings;
use std::fs;
use std::path::PathBuf;

/// Get the directory where settings are stored
fn get_config_dir() -> Result<PathBuf, String> {
    let mut dir = dirs::config_dir()
        .ok_or("Failed to find config directory")?;

    dir.push("dev-env-helper");

    // Create directory if it doesn't exist
    if !dir.exists() {
        fs::create_dir_all(&dir)
            .map_err(|e| format!("Failed to create config directory: {}", e))?;
    }

    Ok(dir)
}

/// Get the path to the settings file
pub fn get_settings_path() -> Result<PathBuf, String> {
    let dir = get_config_dir()?;
    Ok(dir.join("settings.json"))
}

/// Get default settings
pub fn get_default_settings() -> AppSettings {
    AppSettings {
        download_path: None,
        default_editor: None,
        proxy: None,
        github_token: None,
    }
}

/// Load settings from file
pub fn load_settings() -> Result<AppSettings, String> {
    let path = get_settings_path()?;

    // If file doesn't exist, return defaults
    if !path.exists() {
        return Ok(get_default_settings());
    }

    let content = fs::read_to_string(&path)
        .map_err(|e| format!("Failed to read settings file {}: {}", path.display(), e))?;

    let settings: AppSettings = serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse settings file {}: {}", path.display(), e))?;

    Ok(settings)
}

/// Save settings to file
pub fn save_settings(settings: &AppSettings) -> Result<(), String> {
    let path = get_settings_path()?;

    let json = serde_json::to_string_pretty(&settings)
        .map_err(|e| format!("Failed to serialize settings: {}", e))?;

    fs::write(&path, json)
        .map_err(|e| format!("Failed to write settings file {}: {}", path.display(), e))?;

    Ok(())
}

