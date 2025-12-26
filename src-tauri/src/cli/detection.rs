use crate::types::{CliToolDetection, ConfigFileStatus, ConfigFileLocation};
use std::process::Command;
use std::fs;
use std::env;
use rayon::prelude::*;

/// Check if an executable exists in PATH
fn which(executable: &str) -> Option<String> {
    if let Ok(output) = Command::new("which").arg(executable).output() {
        if output.status.success() {
            let path = String::from_utf8_lossy(&output.stdout).trim().to_string();
            return Some(path);
        }
    }
    None
}

/// Get version string from a command
fn get_version(executable: &str, version_command: &str) -> Option<String> {
    if let Ok(output) = Command::new(executable).arg(version_command).output() {
        let stdout = String::from_utf8_lossy(&output.stdout);
        let stderr = String::from_utf8_lossy(&output.stderr);

        let output_str = if !stdout.is_empty() { stdout } else { stderr };
        let first_line = output_str.lines().next()?;

        // Try to extract version number (common patterns)
        if let Some(idx) = first_line.find(char::is_numeric) {
            let version_part = &first_line[idx..];
            if let Some(end) = version_part.find(|c: char| !c.is_numeric() && c != '.') {
                return Some(version_part[..end].to_string());
            }
            return Some(version_part.trim().to_string());
        }
    }
    None
}

/// Check if a config file exists and is readable
fn check_config_file(config: &ConfigFileLocation) -> ConfigFileStatus {
    let path = expand_path(&config.path);
    let metadata = fs::metadata(&path);

    let exists = metadata.is_ok();
    let can_read = if exists {
        fs::read(&path).is_ok()
    } else {
        false
    };

    ConfigFileStatus {
        path: config.path.clone(),
        exists,
        can_read,
    }
}

/// Expand shell variables in path (e.g., ~, $HOME)
pub fn expand_path(path: &str) -> String {
    let mut expanded = path.to_string();

    // Expand ~
    if expanded.starts_with("~/") {
        if let Ok(home) = env::var("HOME") {
            expanded = format!("{}{}", home, &expanded[1..]);
        }
    }

    // Expand $HOME
    if expanded.contains("$HOME") {
        if let Ok(home) = env::var("HOME") {
            expanded = expanded.replace("$HOME", &home);
        }
    }

    expanded
}

/// Detect all CLI tools based on templates (parallelized for performance)
pub fn detect_cli_tools(templates: &[crate::types::CliToolTemplate]) -> Vec<CliToolDetection> {
    templates
        .par_iter()
        .map(|template| {
            let executable_path = which(&template.executable);
            let installed = executable_path.is_some();

            let version = if installed {
                get_version(&template.executable, &template.version_command)
            } else {
                None
            };

            let config_files: Vec<ConfigFileStatus> = template.config_files
                .iter()
                .map(check_config_file)
                .collect();

            CliToolDetection {
                template_id: template.id.clone(),
                installed,
                version,
                executable_path,
                config_files,
                detected_at: chrono::Utc::now().to_rfc3339(),
            }
        })
        .collect()
}

/// Get content of a config file
pub fn get_config_content(path: &str) -> Result<String, String> {
    let expanded = expand_path(path);
    fs::read_to_string(&expanded)
        .map_err(|e| format!("Failed to read file: {}", e))
}
