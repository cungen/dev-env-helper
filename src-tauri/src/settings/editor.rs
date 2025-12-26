use std::process::Command;

/// Open a file with the configured editor
pub fn open_file_with_editor(file_path: &str, editor_path: Option<&str>) -> Result<(), String> {
    if let Some(editor) = editor_path {
        // Validate editor exists
        if !std::path::Path::new(editor).exists() {
            return Err(format!("Editor not found: {}", editor));
        }

        // Use the configured editor
        #[cfg(target_os = "macos")]
        {
            Command::new("open")
                .arg("-a")
                .arg(editor)
                .arg(file_path)
                .spawn()
                .map_err(|e| format!("Failed to open file with editor: {}", e))?;
        }

        #[cfg(not(target_os = "macos"))]
        {
            Command::new(editor)
                .arg(file_path)
                .spawn()
                .map_err(|e| format!("Failed to open file with editor: {}", e))?;
        }
    } else {
        // Use system default
        #[cfg(target_os = "macos")]
        {
            Command::new("open")
                .arg(file_path)
                .spawn()
                .map_err(|e| format!("Failed to open file: {}", e))?;
        }

        #[cfg(target_os = "linux")]
        {
            Command::new("xdg-open")
                .arg(file_path)
                .spawn()
                .map_err(|e| format!("Failed to open file: {}", e))?;
        }

        #[cfg(target_os = "windows")]
        {
            Command::new("cmd")
                .args(["/C", "start", "", file_path])
                .spawn()
                .map_err(|e| format!("Failed to open file: {}", e))?;
        }
    }

    Ok(())
}


