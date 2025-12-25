use crate::types::GitHubReleaseInfo;
use regex::Regex;
use std::fs;
use std::path::PathBuf;
use std::time::{SystemTime, UNIX_EPOCH};

/// Cache duration in seconds (1 hour)
const CACHE_DURATION: u64 = 3600;

/// Get the cache directory for GitHub releases
fn get_cache_dir() -> Result<PathBuf, String> {
    let mut dir = dirs::cache_dir()
        .ok_or("Failed to find cache directory")?;

    dir.push("dev-env-helper");
    dir.push("github-releases");

    // Create directory if it doesn't exist
    if !dir.exists() {
        fs::create_dir_all(&dir)
            .map_err(|e| format!("Failed to create cache directory: {}", e))?;
    }

    Ok(dir)
}

/// Get the cache file path for a repository
fn get_cache_path(owner: &str, repo: &str) -> Result<PathBuf, String> {
    let dir = get_cache_dir()?;
    let filename = format!("{}_{}.json", owner, repo);
    Ok(dir.join(filename))
}

/// Check if cached data is still valid
fn is_cache_valid(path: &PathBuf) -> bool {
    if !path.exists() {
        return false;
    }

    let metadata = match fs::metadata(path) {
        Ok(m) => m,
        Err(_) => return false,
    };

    let modified = match metadata.modified() {
        Ok(t) => t,
        Err(_) => return false,
    };

    let now = SystemTime::now();
    let duration = match now.duration_since(modified) {
        Ok(d) => d,
        Err(_) => return false,
    };

    duration.as_secs() < CACHE_DURATION
}

/// Load cached release info
fn load_cached_release(path: &PathBuf) -> Result<GitHubReleaseInfo, String> {
    let content = fs::read_to_string(path)
        .map_err(|e| format!("Failed to read cache file: {}", e))?;

    let cached: CachedRelease = serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse cache file: {}", e))?;

    Ok(cached.release)
}

/// Save release info to cache
fn save_cached_release(path: &PathBuf, release: &GitHubReleaseInfo) -> Result<(), String> {
    let cached = CachedRelease {
        cached_at: SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs(),
        release: release.clone(),
    };

    let json = serde_json::to_string_pretty(&cached)
        .map_err(|e| format!("Failed to serialize cache: {}", e))?;

    fs::write(path, json)
        .map_err(|e| format!("Failed to write cache file: {}", e))?;

    Ok(())
}

#[derive(serde::Serialize, serde::Deserialize)]
struct CachedRelease {
    cached_at: u64,
    release: GitHubReleaseInfo,
}

/// Fetch the latest release from GitHub API
pub async fn get_latest_release(
    owner: &str,
    repo: &str,
    asset_pattern: Option<&str>,
) -> Result<GitHubReleaseInfo, String> {
    let cache_path = get_cache_path(owner, repo)?;

    // Try to load from cache first
    if is_cache_valid(&cache_path) {
        if let Ok(cached) = load_cached_release(&cache_path) {
            return Ok(cached);
        }
    }

    // Fetch from GitHub API
    let url = format!("https://api.github.com/repos/{}/{}/releases/latest", owner, repo);

    let client = reqwest::Client::builder()
        .user_agent("dev-env-helper/1.0")
        .build()
        .map_err(|e| format!("Failed to create HTTP client: {}", e))?;

    let response = client
        .get(&url)
        .send()
        .await
        .map_err(|e| format!("Network error: {}", e))?;

    if response.status() == 404 {
        return Err(format!("Repository {}/{} not found", owner, repo));
    }

    if !response.status().is_success() {
        let status = response.status();
        let text = response.text().await.unwrap_or_default();
        return Err(format!(
            "GitHub API error ({}): {}",
            status,
            if text.is_empty() {
                "Unknown error"
            } else {
                &text
            }
        ));
    }

    let release: GitHubReleaseInfo = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse GitHub API response: {}", e))?;

    // Filter assets by pattern if provided
    let mut filtered_release = release.clone();
    if let Some(pattern) = asset_pattern {
        let regex = Regex::new(pattern)
            .map_err(|e| format!("Invalid asset pattern regex: {}", e))?;

        filtered_release.assets = release
            .assets
            .into_iter()
            .filter(|asset| regex.is_match(&asset.name))
            .collect();

        if filtered_release.assets.is_empty() {
            return Err(format!(
                "No assets found matching pattern: {}",
                pattern
            ));
        }
    }

    // Save to cache
    let _ = save_cached_release(&cache_path, &filtered_release);

    Ok(filtered_release)
}

