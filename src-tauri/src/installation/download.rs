use std::fs::File;
use std::io::Write;
use std::path::PathBuf;

/// Download progress callback type
#[allow(dead_code)]
pub type ProgressCallback = fn(downloaded: u64, total: u64);

/// Download a file from URL with progress tracking
///
/// # Arguments
/// * `_url` - The URL to download from
/// * `destination` - Path where the file should be saved
/// * `_progress` - Optional callback for progress updates
///
/// # Returns
/// * `Ok(PathBuf)` with the path to downloaded file on success
/// * `Err(String)` with error message on failure
pub fn download_file<F>(
    _url: &str,
    destination: PathBuf,
    _progress: F,
) -> Result<PathBuf, String>
where
    F: Fn(u64, u64),
{
    // Create parent directory if it doesn't exist
    if let Some(parent) = destination.parent() {
        if !parent.exists() {
            std::fs::create_dir_all(parent)
                .map_err(|e| format!("Failed to create directory: {}", e))?;
        }
    }

    // For now, return an error indicating this needs to be implemented
    // with proper HTTP client support
    Err("Download functionality requires reqwest dependency".to_string())
}

/// Download a DMG file and open it with Finder
///
/// This function downloads a DMG installer and opens it,
/// allowing the user to complete the installation manually.
///
/// # Arguments
/// * `_url` - The URL of the DMG file to download
/// * `_progress` - Callback for progress updates
///
/// # Returns
/// * `Ok(PathBuf)` with path to downloaded DMG
/// * `Err(String)` on failure
pub fn download_and_open_dmg<F>(
    _url: &str,
    _progress: F,
) -> Result<PathBuf, String>
where
    F: Fn(u64, u64),
{
    // Use the system temp directory for downloads
    let temp_dir = std::env::temp_dir();
    let filename = _url.split('/').last().unwrap_or("download.dmg");
    let destination = temp_dir.join(filename);

    // Download the file
    let downloaded_path = download_file(_url, destination.clone(), _progress)?;

    // Open with Finder (macOS)
    #[cfg(target_os = "macos")]
    {
        let _status = std::process::Command::new("open")
            .arg("-R")  // Reveal in Finder
            .arg(&downloaded_path)
            .spawn()
            .map_err(|e| format!("Failed to open Finder: {}", e))?;
    }

    Ok(downloaded_path)
}

/// Get the download directory for the platform
#[allow(dead_code)]
pub fn get_download_dir() -> Result<PathBuf, String> {
    #[cfg(target_os = "macos")]
    {
        let mut path = dirs::home_dir()
            .ok_or("Failed to find home directory")?;
        path.push("Downloads");
        Ok(path)
    }

    #[cfg(target_os = "linux")]
    {
        let mut path = dirs::home_dir()
            .ok_or("Failed to find home directory")?;
        path.push("Downloads");
        Ok(path)
    }

    #[cfg(target_os = "windows")]
    {
        dirs::download_dir()
            .ok_or("Failed to find downloads directory".to_string())
    }
}

/// Clean up temporary downloaded files
#[allow(dead_code)]
pub fn cleanup_temp_files(_older_than: std::time::Duration) -> Result<usize, String> {
    let temp_dir = std::env::temp_dir();
    let mut cleaned = 0;

    let now = std::time::SystemTime::now();

    for entry in std::fs::read_dir(&temp_dir)
        .map_err(|e| format!("Failed to read temp directory: {}", e))?
    {
        let entry = entry.map_err(|e| format!("Failed to read entry: {}", e))?;
        let path = entry.path();

        // Only look for .dmg files downloaded by our app
        if path.extension().and_then(|s| s.to_str()) != Some("dmg") {
            continue;
        }

        // Check file age
        if let Ok(metadata) = entry.metadata() {
            if let Ok(modified) = metadata.modified() {
                if let Ok(age) = now.duration_since(modified) {
                    if age > _older_than {
                        // Try to delete, ignore errors
                        let _ = std::fs::remove_file(&path);
                        cleaned += 1;
                    }
                }
            }
        }
    }

    Ok(cleaned)
}

/// Download a GitHub release asset with progress tracking
///
/// # Arguments
/// * `url` - The URL of the asset to download
/// * `progress` - Callback for progress updates
///
/// # Returns
/// * `Ok(PathBuf)` with path to downloaded file
/// * `Err(String)` on failure
pub async fn download_github_asset<F>(
    url: &str,
    progress: F,
) -> Result<PathBuf, String>
where
    F: Fn(u64, u64),
{
    let download_dir = get_download_dir()?;

    // Extract filename from URL
    let filename = url
        .split('/')
        .last()
        .ok_or("Invalid URL: no filename found")?;

    let destination = download_dir.join(filename);

    // Create HTTP client
    let client = reqwest::Client::builder()
        .user_agent("dev-env-helper/1.0")
        .build()
        .map_err(|e| format!("Failed to create HTTP client: {}", e))?;

    // Start download
    let response = client
        .get(url)
        .send()
        .await
        .map_err(|e| format!("Network error: {}", e))?;

    if !response.status().is_success() {
        return Err(format!("HTTP error: {}", response.status()));
    }

    let total_size = response
        .content_length()
        .ok_or("Unknown content length")?;

    // Create file
    let mut file = File::create(&destination)
        .map_err(|e| format!("Failed to create file: {}", e))?;

    let mut downloaded: u64 = 0;
    let mut stream = response.bytes_stream();

    // Download with progress tracking
    use futures_util::TryStreamExt;
    while let Some(chunk_result) = stream.try_next().await.map_err(|e| format!("Download error: {}", e))? {
        file.write_all(&chunk_result)
            .map_err(|e| format!("Write error: {}", e))?;
        downloaded += chunk_result.len() as u64;
        progress(downloaded, total_size);
    }

    // Open the downloaded file (macOS)
    #[cfg(target_os = "macos")]
    {
        let _ = std::process::Command::new("open")
            .arg("-R")
            .arg(&destination)
            .spawn();
    }

    Ok(destination)
}
