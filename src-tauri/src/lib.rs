mod cli;
mod dependencies;
mod installation;
mod software;
mod types;

use std::collections::HashSet;
use std::fs;
use tauri::Emitter;

// CLI Detection Commands
#[tauri::command]
fn detect_cli_tools() -> Result<Vec<types::CliToolDetection>, String> {
    let templates = cli::template::list_all_templates();
    Ok(cli::detection::detect_cli_tools(&templates))
}

#[tauri::command]
fn get_cli_config_content(path: String) -> Result<String, String> {
    cli::detection::get_config_content(&path)
}

// Custom Tool Commands
#[tauri::command]
fn list_custom_templates() -> Result<Vec<types::CliToolTemplate>, String> {
    // Return both built-in and custom templates
    let mut templates = cli::template::get_builtin_templates();
    let custom = cli::storage::load_custom_templates()?;
    templates.extend(custom);
    Ok(templates)
}

#[tauri::command]
fn save_custom_template(template: types::CliToolTemplate) -> Result<(), String> {
    // Validate the template first
    cli::storage::validate_template(&template)?;

    // Check if template already exists (either built-in or custom)
    let builtins = cli::template::get_builtin_templates();
    if builtins.iter().any(|t| t.id == template.id) {
        return Err(format!("Cannot override built-in template '{}'", template.id));
    }

    // Save the custom template
    cli::storage::save_custom_template(&template)
}

#[tauri::command]
fn delete_custom_template(id: String) -> Result<(), String> {
    // Check if it's a built-in template
    let builtins = cli::template::get_builtin_templates();
    if builtins.iter().any(|t| t.id == id) {
        return Err(format!("Cannot delete built-in template '{}'", id));
    }

    // Delete the custom template
    cli::storage::delete_custom_template(&id)
}

// Dependency Commands
#[tauri::command]
fn resolve_installation_order(tool_ids: Vec<String>) -> Result<Vec<String>, String> {
    dependencies::resolution::resolve_installation_order(&tool_ids)
}

#[tauri::command]
fn get_dependency_tree(tool_id: String) -> Result<types::DependencyTree, String> {
    // Get all detected tools to determine what's installed
    let templates = cli::template::list_all_templates();
    let detections = cli::detection::detect_cli_tools(&templates);

    let installed: HashSet<String> = detections
        .into_iter()
        .filter(|d| d.installed)
        .map(|d| d.template_id)
        .collect();

    dependencies::resolution::get_dependency_tree(&tool_id, &installed)
}

#[tauri::command]
fn get_reverse_dependencies(tool_id: String) -> Result<Vec<(String, String)>, String> {
    let templates = cli::template::list_all_templates();
    Ok(dependencies::resolution::get_reverse_dependencies_with_names(&tool_id, &templates))
}

// Installation Commands
#[tauri::command]
fn check_brew_available() -> Result<(), String> {
    installation::brew::check_brew_available()
}

#[tauri::command]
async fn install_tool_brew(app: tauri::AppHandle, cask_name: String) -> Result<(), String> {
    installation::brew::install_tool_brew(&cask_name, |event| {
        // Emit event to frontend
        let payload = match event {
            installation::brew::BrewInstallEvent::Status { message } => {
                serde_json::json!({ "type": "status", "message": message })
            }
            installation::brew::BrewInstallEvent::Output { line } => {
                serde_json::json!({ "type": "output", "line": line })
            }
            installation::brew::BrewInstallEvent::Success { message } => {
                serde_json::json!({ "type": "success", "message": message })
            }
            installation::brew::BrewInstallEvent::Error { message } => {
                serde_json::json!({ "type": "error", "message": message })
            }
        };

        let _ = app.emit("brew-install-progress", &payload);
    })
}

#[tauri::command]
fn get_installed_casks() -> Result<Vec<String>, String> {
    installation::brew::get_installed_casks()
}

#[tauri::command]
async fn download_and_open_dmg(app: tauri::AppHandle, url: String) -> Result<String, String> {
    installation::download::download_and_open_dmg(&url, |downloaded, total| {
        // Emit progress event
        let payload = serde_json::json!({
            "type": "progress",
            "downloaded": downloaded,
            "total": total,
            "percentage": if total > 0 { downloaded * 100 / total } else { 0 }
        });
        let _ = app.emit("dmg-download-progress", &payload);
    }).map(|p| p.to_string_lossy().to_string())
}

// Environment Export/Import Commands
#[tauri::command]
fn export_environment(data: types::EnvironmentExport) -> Result<String, String> {
    // TODO: Use Tauri file dialog to let user choose save location
    let json = serde_json::to_string_pretty(&data)
        .map_err(|e| format!("Failed to serialize: {}", e))?;

    // For now, just return the JSON string
    // In production, save to file selected by user
    Ok(json)
}

#[tauri::command]
fn import_environment(path: String) -> Result<types::EnvironmentExport, String> {
    let content = fs::read_to_string(&path)
        .map_err(|e| format!("Failed to read file: {}", e))?;

    serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse JSON: {}", e))
}

// Software Recommendations Commands
#[tauri::command]
fn get_software_recommendations() -> Result<types::SoftwareRecommendationsConfig, String> {
    // Initialize default config if it doesn't exist
    let _ = software::config::initialize_default_config();
    software::config::load_software_recommendations()
}

#[tauri::command]
async fn get_github_latest_release(
    owner: String,
    repo: String,
    asset_pattern: Option<String>,
) -> Result<types::GitHubReleaseInfo, String> {
    software::github::get_latest_release(&owner, &repo, asset_pattern.as_deref()).await
}

#[tauri::command]
async fn download_github_release_asset(
    app: tauri::AppHandle,
    url: String,
) -> Result<String, String> {
    installation::download::download_github_asset(&url, |downloaded, total| {
        // Emit progress event
        let payload = serde_json::json!({
            "type": "progress",
            "downloaded": downloaded,
            "total": total,
            "percentage": if total > 0 { downloaded * 100 / total } else { 0 }
        });
        let _ = app.emit("github-download-progress", &payload);
    })
    .await
    .map(|p| p.to_string_lossy().to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            detect_cli_tools,
            get_cli_config_content,
            list_custom_templates,
            save_custom_template,
            delete_custom_template,
            resolve_installation_order,
            get_dependency_tree,
            get_reverse_dependencies,
            check_brew_available,
            install_tool_brew,
            get_installed_casks,
            download_and_open_dmg,
            export_environment,
            import_environment,
            get_software_recommendations,
            get_github_latest_release,
            download_github_release_asset,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
