use crate::types::ProxyType;
use std::fs;
use std::path::Path;

/// Validate download path
pub fn validate_download_path(path: &str) -> Result<(), String> {
    let path_buf = Path::new(path);

    // Check path exists
    if !path_buf.exists() {
        return Err(format!("Path does not exist: {}", path));
    }

    // Check path is a directory
    if !path_buf.is_dir() {
        return Err(format!("Path is not a directory: {}", path));
    }

    // Check path is writable by attempting to create a test file
    let test_file = path_buf.join(".dev-env-helper-write-test");
    match fs::File::create(&test_file) {
        Ok(mut file) => {
            // Try to write something
            use std::io::Write;
            if let Err(e) = file.write_all(b"test") {
                let _ = fs::remove_file(&test_file);
                return Err(format!("Path is not writable: {} ({})", path, e));
            }
            // Clean up test file
            let _ = fs::remove_file(&test_file);
            Ok(())
        }
        Err(e) => Err(format!("Path is not writable: {} ({})", path, e)),
    }
}

/// Validate editor path
pub fn validate_editor_path(path: &str) -> Result<(), String> {
    let path_buf = Path::new(path);

    // Check path exists
    if !path_buf.exists() {
        return Err(format!("Editor path does not exist: {}", path));
    }

    // On macOS, .app bundles are directories, which is valid
    #[cfg(target_os = "macos")]
    {
        if path_buf.is_dir() {
            // Check if it's a .app bundle
            if path.ends_with(".app") {
                // Verify it has the expected bundle structure
                let contents_path = path_buf.join("Contents");
                if contents_path.exists() && contents_path.is_dir() {
                    return Ok(());
                } else {
                    return Err(format!("Editor path appears to be an .app bundle but is missing Contents directory: {}", path));
                }
            } else {
                return Err(format!("Editor path is a directory but not a valid .app bundle: {}", path));
            }
        }
    }

    // Check path is a file (not directory)
    if !path_buf.is_file() {
        return Err(format!("Editor path is not a file: {}", path));
    }

    // On Unix-like systems, check if file is executable
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        let metadata = fs::metadata(path_buf)
            .map_err(|e| format!("Failed to read editor metadata: {}", e))?;
        let permissions = metadata.permissions();
        if permissions.mode() & 0o111 == 0 {
            return Err(format!("Editor path is not executable: {}", path));
        }
    }

    Ok(())
}

/// Validate proxy URL
pub fn validate_proxy_url(url: &str, proxy_type: &ProxyType) -> Result<(), String> {
    // Check URL format matches proxy type
    let expected_prefix = match proxy_type {
        ProxyType::Http => "http://",
        ProxyType::Https => "https://",
        ProxyType::Socks4 => "socks4://",
        ProxyType::Socks5 => "socks5://",
    };

    if !url.starts_with(expected_prefix) {
        return Err(format!(
            "Proxy URL must start with {} for {} proxy type",
            expected_prefix, format!("{:?}", proxy_type)
        ));
    }

    // Parse URL to extract host and port
    let url_without_scheme = &url[expected_prefix.len()..];
    if url_without_scheme.is_empty() {
        return Err("Proxy URL must include host and port".to_string());
    }

    // Check for host:port format
    let parts: Vec<&str> = url_without_scheme.split(':').collect();
    if parts.len() < 2 {
        return Err("Proxy URL must include port (format: host:port)".to_string());
    }

    // Validate port is a number
    if let Some(port_str) = parts.last() {
        port_str.parse::<u16>()
            .map_err(|_| "Proxy URL port must be a valid number (1-65535)".to_string())?;
    }

    Ok(())
}


