use crate::installation::brew;
use crate::types::SoftwareRecommendation;
use std::fs;
use std::path::Path;

/// Detect installed brew casks
pub fn detect_installed_casks() -> Result<Vec<String>, String> {
    brew::get_installed_casks()
}

/// Check if an app exists in the Applications folder (macOS)
/// Performs case-insensitive matching
pub fn check_app_installed(app_name: &str) -> bool {
    let applications_path = Path::new("/Applications");

    if !applications_path.exists() {
        return false;
    }

    // Try to read the Applications directory
    let entries = match fs::read_dir(applications_path) {
        Ok(entries) => entries,
        Err(_) => return false,
    };

    // Check each entry for a match (case-insensitive)
    for entry in entries.flatten() {
        if let Ok(file_name) = entry.file_name().into_string() {
            // Check if it's a .app directory
            if file_name.ends_with(".app") {
                // Remove .app extension and compare (case-insensitive)
                let app_name_without_ext = file_name
                    .strip_suffix(".app")
                    .unwrap_or(&file_name)
                    .to_lowercase();

                if app_name_without_ext == app_name.to_lowercase() {
                    return true;
                }
            }
        }
    }

    false
}

/// Detect installation status for multiple software recommendations
/// Returns a vector of (software_id, installed) tuples
pub fn detect_installed_software(
    software_list: Vec<SoftwareRecommendation>,
) -> Result<Vec<(String, bool)>, String> {
    let mut results = Vec::new();

    // Get installed casks once for efficiency
    let installed_casks = detect_installed_casks().unwrap_or_default();
    let installed_casks_set: std::collections::HashSet<String> =
        installed_casks.iter().cloned().collect();

    for software in software_list {
        let mut is_installed = false;

        // Check each install method
        for method in &software.install_methods {
            match method.method_type.as_str() {
                "brew" => {
                    if let Some(cask_name) = &method.cask {
                        if installed_casks_set.contains(cask_name) {
                            is_installed = true;
                            break;
                        }
                    }
                }
                "github" => {
                    if check_app_installed(&software.name) {
                        is_installed = true;
                        break;
                    }
                }
                _ => {
                    // Unknown method, skip
                }
            }
        }

        results.push((software.id.clone(), is_installed));
    }

    Ok(results)
}

