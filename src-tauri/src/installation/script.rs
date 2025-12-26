use std::process::{Command, Stdio};
use std::thread;

/// Events emitted during script installation
#[derive(Debug, Clone)]
pub enum ScriptInstallEvent {
    Status { message: String },
    Output { line: String },
    Success { message: String },
    Error { message: String },
}

/// Execute a script installation
///
/// # Arguments
/// * `commands` - Vector of shell commands to execute in sequence
/// * `emit_event` - Callback to emit progress events to the frontend
///
/// # Returns
/// * `Ok(())` on successful installation
/// * `Err(String)` with error message on failure
pub fn execute_script_install<F>(
    commands: &[String],
    mut emit_event: F,
) -> Result<(), String>
where
    F: FnMut(ScriptInstallEvent) + Clone + Send + 'static,
{
    for (idx, command) in commands.iter().enumerate() {
        emit_event(ScriptInstallEvent::Status {
            message: format!("Executing command {} of {}...", idx + 1, commands.len()),
        });

        // Execute command using shell
        let mut cmd = if cfg!(target_os = "macos") || cfg!(target_os = "linux") {
            let mut c = Command::new("sh");
            c.arg("-c").arg(command);
            c
        } else {
            // Windows
            let mut c = Command::new("cmd");
            c.arg("/C").arg(command);
            c
        };

        cmd.stdout(Stdio::piped())
            .stderr(Stdio::piped());

        let mut child = cmd
            .spawn()
            .map_err(|e| format!("Failed to spawn command: {}", e))?;

        let stdout = child.stdout.take().ok_or("Failed to capture stdout")?;
        let _stderr = child.stderr.take().ok_or("Failed to capture stderr")?;

        let mut _emit_clone = emit_event.clone();
        let _stdout_thread = thread::spawn(move || {
            use std::io::{BufRead, BufReader};
            let reader = BufReader::new(stdout);
            for line in reader.lines() {
                if let Ok(line) = line {
                    _emit_clone(ScriptInstallEvent::Output { line });
                }
            }
        });

        let status = child.wait()
            .map_err(|e| format!("Failed to wait for command: {}", e))?;

        _stdout_thread.join().ok();

        if !status.success() {
            let error_msg = if let Some(code) = status.code() {
                format!("Command failed with exit code {}: {}", code, command)
            } else {
                format!("Command terminated by signal: {}", command)
            };
            emit_event(ScriptInstallEvent::Error {
                message: error_msg.clone(),
            });
            return Err(error_msg);
        }
    }

    emit_event(ScriptInstallEvent::Success {
        message: "Script installation completed successfully".to_string(),
    });
    Ok(())
}

