use crate::types::GitHubReleaseInfo;
use regex::Regex;
use std::fs;
use std::path::PathBuf;
use std::time::{SystemTime, UNIX_EPOCH};
use scraper::{Html, Selector};

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
    eprintln!("[GitHub Debug] Fetching from: {}", url);
    eprintln!("[GitHub Debug] Asset pattern: {:?}", asset_pattern);

    // Create HTTP client with proxy if configured
    let mut client_builder = reqwest::Client::builder()
        .user_agent("dev-env-helper/1.0");

    // Load settings for GitHub token and proxy
    let github_token = if let Ok(settings) = crate::settings::storage::load_settings() {
        // Apply proxy settings if enabled
        if let Some(ref proxy) = settings.proxy {
            if proxy.enabled {
                client_builder = crate::settings::proxy::configure_client_with_proxy(
                    client_builder,
                    proxy,
                )
                .map_err(|e| format!("Failed to configure proxy for GitHub API request: {}", e))?;
            }
        }
        settings.github_token
    } else {
        None
    };

    let client = client_builder
        .build()
        .map_err(|e| format!("Failed to create HTTP client: {}", e))?;

    let mut request_builder = client.get(&url);
    if let Some(token) = github_token {
        eprintln!("[GitHub Debug] Using GitHub token for authentication");
        request_builder = request_builder.header("Authorization", format!("Bearer {}", token));
    }

    let response = request_builder
        .send()
        .await
        .map_err(|e| {
            eprintln!("[GitHub Debug] Network error: {}", e);
            format!("Network error: {}", e)
        })?;

    let status = response.status();
    eprintln!("[GitHub Debug] Response status: {}", status);

    if status == 404 {
        return Err(format!("Repository {}/{} not found", owner, repo));
    }

    if status == 403 {
        let text = response.text().await.unwrap_or_default();
        if text.contains("rate limit exceeded") {
            eprintln!("[GitHub Debug] Rate limit exceeded, using HTML fallback");
            // Fall back to HTML scraping
            let result = fetch_from_html(owner, repo, asset_pattern).await;
            // Cache the result from HTML scraping
            if let Ok(ref release) = result {
                let _ = save_cached_release(&cache_path, release);
            }
            return result;
        }
        return Err(format!("GitHub API error: {}", text));
    }

    if !status.is_success() {
        let text = response.text().await.unwrap_or_default();
        eprintln!("[GitHub Debug] Error response: {}", text);
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
        .map_err(|e| {
            eprintln!("[GitHub Debug] JSON parse error: {}", e);
            format!("Failed to parse GitHub API response: {}", e)
        })?;

    eprintln!("[GitHub Debug] Found {} assets", release.assets.len());
    for asset in &release.assets {
        eprintln!("[GitHub Debug]   - {}", asset.name);
    }

    // Filter assets by pattern if provided
    let mut filtered_release = release.clone();
    if let Some(pattern) = asset_pattern {
        eprintln!("[GitHub Debug] Applying pattern: {}", pattern);
        let regex = Regex::new(pattern)
            .map_err(|e| {
                eprintln!("[GitHub Debug] Invalid regex: {}", e);
                format!("Invalid asset pattern regex: {}", e)
            })?;

        filtered_release.assets = release
            .assets
            .into_iter()
            .filter(|asset| {
                let matches = regex.is_match(&asset.name);
                eprintln!("[GitHub Debug]     {} matches: {}", asset.name, matches);
                matches
            })
            .collect();

        eprintln!("[GitHub Debug] Filtered to {} assets", filtered_release.assets.len());

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

/// Fallback: Scrape the GitHub releases HTML page when API rate limit is hit
async fn fetch_from_html(
    owner: &str,
    repo: &str,
    asset_pattern: Option<&str>,
) -> Result<GitHubReleaseInfo, String> {
    eprintln!("[GitHub Debug] Using HTML scraping fallback");

    let url = format!("https://github.com/{}/{}/releases/latest", owner, repo);
    eprintln!("[GitHub Debug] Fetching HTML from: {}", url);

    // Load settings for proxy
    let mut client_builder = reqwest::Client::builder()
        .user_agent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36");

    if let Ok(settings) = crate::settings::storage::load_settings() {
        if let Some(ref proxy) = settings.proxy {
            if proxy.enabled {
                client_builder = crate::settings::proxy::configure_client_with_proxy(
                    client_builder,
                    proxy,
                )
                .map_err(|e| format!("Failed to configure proxy: {}", e))?;
            }
        }
    }

    let client = client_builder
        .build()
        .map_err(|e| format!("Failed to create HTTP client: {}", e))?;

    let response = client
        .get(&url)
        .send()
        .await
        .map_err(|e| format!("Failed to fetch page: {}", e))?;

    if !response.status().is_success() {
        return Err(format!("Failed to fetch page: {}", response.status()));
    }

    let html = response
        .text()
        .await
        .map_err(|e| format!("Failed to read response: {}", e))?;

    let document = Html::parse_document(&html);

    // Get tag name from URL or page
    let tag_selector = Selector::parse("a.Link--primary[href*='/releases/tag']").unwrap();
    let tag_name = document
        .select(&tag_selector)
        .next()
        .and_then(|el| el.value().attr("href"))
        .and_then(|href| href.rsplit('/').next())
        .map(|s| s.to_string())
        .unwrap_or_else(|| "latest".to_string());

    eprintln!("[GitHub Debug] Found tag: {}", tag_name);

    // Get all release assets
    let asset_selector = Selector::parse("a[href*='/releases/download/']").unwrap();
    let mut assets = Vec::new();

    for element in document.select(&asset_selector) {
        let href = element.value().attr("href").unwrap_or("");
        let name = element.text().collect::<String>().trim().to_string();

        if href.contains("/releases/download/") {
            let download_url = if href.starts_with("http") {
                href.to_string()
            } else {
                format!("https://github.com{}", href)
            };

            assets.push(crate::types::GitHubReleaseAsset {
                name: name.clone(),
                browser_download_url: download_url,
                size: 0, // Size not available in HTML
            });
        }
    }

    eprintln!("[GitHub Debug] Found {} assets in HTML", assets.len());
    for asset in &assets {
        eprintln!("[GitHub Debug]   - {}", asset.name);
    }

    // Filter by pattern if provided
    let mut filtered_release = GitHubReleaseInfo {
        tag_name: tag_name.clone(),
        name: Some(tag_name),
        assets,
        published_at: chrono::Utc::now().to_rfc3339(),
    };

    if let Some(pattern) = asset_pattern {
        eprintln!("[GitHub Debug] Applying pattern: {}", pattern);
        let regex = Regex::new(pattern)
            .map_err(|e| format!("Invalid asset pattern regex: {}", e))?;

        filtered_release.assets = filtered_release
            .assets
            .into_iter()
            .filter(|asset| {
                let matches = regex.is_match(&asset.name);
                eprintln!("[GitHub Debug]     {} matches: {}", asset.name, matches);
                matches
            })
            .collect();

        eprintln!("[GitHub Debug] Filtered to {} assets", filtered_release.assets.len());

        if filtered_release.assets.is_empty() {
            return Err(format!(
                "No assets found matching pattern: {}",
                pattern
            ));
        }
    }

    Ok(filtered_release)
}

