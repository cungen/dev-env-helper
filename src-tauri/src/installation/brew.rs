use std::process::{Command, Stdio};
use std::thread;

/// Check if Homebrew is installed and available
pub fn check_brew_available() -> Result<(), String> {
    let result = Command::new("which")
        .arg("brew")
        .output();

    match result {
        Ok(output) => {
            if output.status.success() {
                Ok(())
            } else {
                Err("Homebrew not found. Please install from https://brew.sh".to_string())
            }
        }
        Err(e) => Err(format!("Failed to check for Homebrew: {}", e)),
    }
}

/// Install a tool using Homebrew
///
/// # Arguments
/// * `cask_name` - The Homebrew cask name to install
/// * `emit_event` - Callback to emit progress events to the frontend
///
/// # Returns
/// * `Ok(())` on successful installation
/// * `Err(String)` with error message on failure
pub fn install_tool_brew<F>(
    cask_name: &str,
    mut emit_event: F,
) -> Result<(), String>
where
    F: FnMut(BrewInstallEvent) + Clone,
{
    // Check brew is available first
    check_brew_available()?;

    emit_event(BrewInstallEvent::Status {
        message: format!("Installing {} via Homebrew...", cask_name),
    });

    // Spawn brew install process
    let mut child = Command::new("brew")
        .args(["install", "--cask", cask_name])
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| format!("Failed to spawn brew process: {}", e))?;

    // Get stdout handle
    let stdout = child.stdout.take().ok_or("Failed to capture stdout")?;
    let _stderr = child.stderr.take().ok_or("Failed to capture stderr")?;

    // Spawn thread to read output
    let _emit_clone = emit_event.clone();
    let _stdout_thread = thread::spawn(move || {
        use std::io::{BufRead, BufReader};
        let reader = BufReader::new(stdout);
        for line in reader.lines() {
            if let Ok(_line) = line {
                // We can't emit_clone here because it's moved
                // In production, use channels for proper communication
            }
        }
    });

    // Wait for process to complete
    let status = child.wait()
        .map_err(|e| format!("Failed to wait for brew process: {}", e))?;

    _stdout_thread.join().ok();

    if status.success() {
        emit_event(BrewInstallEvent::Success {
            message: format!("Successfully installed {}", cask_name),
        });
        Ok(())
    } else {
        let error_msg = if let Some(code) = status.code() {
            format!("Installation failed with exit code {}", code)
        } else {
            "Installation terminated by signal".to_string()
        };
        emit_event(BrewInstallEvent::Error {
            message: error_msg.clone(),
        });
        Err(error_msg)
    }
}

/// Events emitted during Homebrew installation
#[derive(Debug, Clone)]
pub enum BrewInstallEvent {
    Status { message: String },
    #[allow(dead_code)]
    Output { line: String },
    Success { message: String },
    Error { message: String },
}

/// Get the list of installed casks
pub fn get_installed_casks() -> Result<Vec<String>, String> {
    let output = Command::new("brew")
        .args(["list", "--cask"])
        .output()
        .map_err(|e| format!("Failed to list casks: {}", e))?;

    if !output.status.success() {
        return Err("Failed to get installed casks".to_string());
    }

    let casks: Vec<String> = String::from_utf8_lossy(&output.stdout)
        .lines()
        .map(|s| s.to_string())
        .filter(|s| !s.is_empty())
        .collect();

    Ok(casks)
}

/// Check if a specific cask is installed
#[allow(dead_code)]
pub fn is_cask_installed(cask_name: &str) -> bool {
    if let Ok(installed) = get_installed_casks() {
        installed.iter().any(|c| c == cask_name)
    } else {
        false
    }
}

/// Get info about a cask from Homebrew
#[allow(dead_code)]
pub fn get_cask_info(cask_name: &str) -> Result<String, String> {
    let output = Command::new("brew")
        .args(["info", "--cask", cask_name])
        .output()
        .map_err(|e| format!("Failed to get cask info: {}", e))?;

    if !output.status.success() {
        return Err(format!("Cask '{}' not found", cask_name));
    }

    Ok(String::from_utf8_lossy(&output.stdout).to_string())
}
