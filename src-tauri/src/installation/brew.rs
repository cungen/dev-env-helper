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

    // Load proxy settings if enabled
    let mut env_vars: Vec<(String, String)> = Vec::new();
    if let Ok(settings) = crate::settings::storage::load_settings() {
        if let Some(ref proxy) = settings.proxy {
            if let Some((env_name, env_value)) = crate::settings::proxy::get_proxy_env_var(proxy) {
                env_vars.push((env_name, env_value));
            }
        }
    }

    // Spawn brew install process with proxy environment variables if configured
    let mut cmd = Command::new("brew");
    cmd.args(["install", "--cask", cask_name])
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());

    // Set proxy environment variables
    for (key, value) in env_vars {
        cmd.env(key, value);
    }

    let mut child = cmd
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

/// Install a tool using Homebrew formula (not cask)
///
/// # Arguments
/// * `formula_name` - The Homebrew formula name to install
/// * `emit_event` - Callback to emit progress events to the frontend
///
/// # Returns
/// * `Ok(())` on successful installation
/// * `Err(String)` with error message on failure
pub fn install_tool_brew_formula<F>(
    formula_name: &str,
    mut emit_event: F,
) -> Result<(), String>
where
    F: FnMut(BrewInstallEvent) + Clone,
{
    // Check brew is available first
    check_brew_available()?;

    emit_event(BrewInstallEvent::Status {
        message: format!("Installing {} via Homebrew...", formula_name),
    });

    // Load proxy settings if enabled
    let mut env_vars: Vec<(String, String)> = Vec::new();
    if let Ok(settings) = crate::settings::storage::load_settings() {
        if let Some(ref proxy) = settings.proxy {
            if let Some((env_name, env_value)) = crate::settings::proxy::get_proxy_env_var(proxy) {
                env_vars.push((env_name, env_value));
            }
        }
    }

    // Spawn brew install process with proxy environment variables if configured
    let mut cmd = Command::new("brew");
    cmd.args(["install", formula_name])
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());

    // Set proxy environment variables
    for (key, value) in env_vars {
        cmd.env(key, value);
    }

    let mut child = cmd
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
            message: format!("Successfully installed {}", formula_name),
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

/// Install a tool using Homebrew tap and cask/formula
///
/// # Arguments
/// * `tap` - The Homebrew tap (e.g., "nikitabobko/tap")
/// * `package_name` - The package name to install
/// * `is_cask` - Whether this is a cask or formula
/// * `emit_event` - Callback to emit progress events to the frontend
///
/// # Returns
/// * `Ok(())` on successful installation
/// * `Err(String)` with error message on failure
pub fn install_tool_brew_tap<F>(
    tap: &str,
    package_name: &str,
    is_cask: bool,
    mut emit_event: F,
) -> Result<(), String>
where
    F: FnMut(BrewInstallEvent) + Clone,
{
    // Check brew is available first
    check_brew_available()?;

    emit_event(BrewInstallEvent::Status {
        message: format!("Tapping {}...", tap),
    });

    // Load proxy settings if enabled
    let mut env_vars: Vec<(String, String)> = Vec::new();
    if let Ok(settings) = crate::settings::storage::load_settings() {
        if let Some(ref proxy) = settings.proxy {
            if let Some((env_name, env_value)) = crate::settings::proxy::get_proxy_env_var(proxy) {
                env_vars.push((env_name, env_value));
            }
        }
    }

    // First, tap the repository
    let mut tap_cmd = Command::new("brew");
    tap_cmd.arg("tap").arg(tap);

    for (key, value) in &env_vars {
        tap_cmd.env(key, value);
    }

    let tap_status = tap_cmd
        .output()
        .map_err(|e| format!("Failed to tap repository: {}", e))?;

    if !tap_status.status.success() {
        let error_msg = format!("Failed to tap {}: {}", tap, String::from_utf8_lossy(&tap_status.stderr));
        emit_event(BrewInstallEvent::Error {
            message: error_msg.clone(),
        });
        return Err(error_msg);
    }

    emit_event(BrewInstallEvent::Status {
        message: format!("Installing {} from tap {}...", package_name, tap),
    });

    // Now install the package
    let mut install_cmd = Command::new("brew");
    if is_cask {
        install_cmd.args(["install", "--cask", package_name]);
    } else {
        install_cmd.args(["install", package_name]);
    }
    install_cmd.stdout(Stdio::piped()).stderr(Stdio::piped());

    for (key, value) in env_vars {
        install_cmd.env(key, value);
    }

    let mut child = install_cmd
        .spawn()
        .map_err(|e| format!("Failed to spawn brew install process: {}", e))?;

    let stdout = child.stdout.take().ok_or("Failed to capture stdout")?;
    let _stderr = child.stderr.take().ok_or("Failed to capture stderr")?;

    let _emit_clone = emit_event.clone();
    let _stdout_thread = thread::spawn(move || {
        use std::io::{BufRead, BufReader};
        let reader = BufReader::new(stdout);
        for line in reader.lines() {
            if let Ok(_line) = line {
                // We can't emit_clone here because it's moved
            }
        }
    });

    let status = child.wait()
        .map_err(|e| format!("Failed to wait for brew process: {}", e))?;

    _stdout_thread.join().ok();

    if status.success() {
        emit_event(BrewInstallEvent::Success {
            message: format!("Successfully installed {} from tap {}", package_name, tap),
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
