use crate::types::{SoftwareRecommendationsConfig, SoftwareCategory, SoftwareRecommendation};
use std::fs;
use std::path::PathBuf;

/// Get the directory where software recommendations config is stored
fn get_config_dir() -> Result<PathBuf, String> {
    let mut dir = dirs::config_dir()
        .ok_or("Failed to find config directory")?;

    dir.push("dev-env-helper");

    // Create directory if it doesn't exist
    if !dir.exists() {
        fs::create_dir_all(&dir)
            .map_err(|e| format!("Failed to create config directory: {}", e))?;
    }

    Ok(dir)
}

/// Get the path to the software recommendations config file
fn get_config_path() -> Result<PathBuf, String> {
    let dir = get_config_dir()?;
    Ok(dir.join("software-recommendations.json"))
}

/// Load software recommendations from the config file
pub fn load_software_recommendations() -> Result<SoftwareRecommendationsConfig, String> {
    let path = get_config_path()?;

    // If file doesn't exist, return empty config
    if !path.exists() {
        return Ok(SoftwareRecommendationsConfig {
            categories: Vec::new(),
            software: Vec::new(),
        });
    }

    let content = fs::read_to_string(&path)
        .map_err(|e| format!("Failed to read config file {}: {}", path.display(), e))?;

    let config: SoftwareRecommendationsConfig = serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse config file {}: {}", path.display(), e))?;

    // Validate the config
    validate_config(&config)?;

    Ok(config)
}

/// Validate the configuration structure
fn validate_config(config: &SoftwareRecommendationsConfig) -> Result<(), String> {
    // Check for duplicate category IDs
    let mut category_ids = std::collections::HashSet::new();
    for category in &config.categories {
        if category_ids.contains(&category.id) {
            return Err(format!("Duplicate category ID: {}", category.id));
        }
        category_ids.insert(category.id.clone());
    }

    // Check for duplicate software IDs
    let mut software_ids = std::collections::HashSet::new();
    for software in &config.software {
        if software_ids.contains(&software.id) {
            return Err(format!("Duplicate software ID: {}", software.id));
        }
        software_ids.insert(software.id.clone());

        // Validate category reference
        if !category_ids.contains(&software.category) {
            return Err(format!(
                "Software '{}' references unknown category '{}'",
                software.id, software.category
            ));
        }

        // Validate install methods
        for method in &software.install_methods {
            match method.method_type.as_str() {
                "brew" => {
                    if method.cask.is_none() {
                        return Err(format!(
                            "Software '{}' has brew install method without cask name",
                            software.id
                        ));
                    }
                }
                "github" => {
                    if method.owner.is_none() || method.repo.is_none() {
                        return Err(format!(
                            "Software '{}' has github install method without owner/repo",
                            software.id
                        ));
                    }
                }
                "website" => {
                    if method.url.is_none() {
                        return Err(format!(
                            "Software '{}' has website install method without url",
                            software.id
                        ));
                    }
                }
                _ => {
                    return Err(format!(
                        "Software '{}' has unknown install method type: {}",
                        software.id, method.method_type
                    ));
                }
            }
        }
    }

    Ok(())
}

/// Initialize default config file if it doesn't exist
/// If file exists but has old/default entries, update it with new recommendations
pub fn initialize_default_config() -> Result<(), String> {
    let path = get_config_path()?;

    // If file doesn't exist, create it with default config
    if !path.exists() {
        return write_default_config();
    }

    // If file exists, merge new software entries that don't exist yet
    let existing = load_software_recommendations().unwrap_or_else(|_| SoftwareRecommendationsConfig {
        categories: Vec::new(),
        software: Vec::new(),
    });

    // If config has only 3 or fewer entries, it's likely the old default - update it
    if existing.software.len() <= 3 {
        return write_default_config();
    }

    // Merge new software entries from default config
    let default_config = get_default_config();
    let mut updated = existing.clone();
    let existing_ids: std::collections::HashSet<String> = existing.software.iter()
        .map(|s| s.id.clone())
        .collect();

    // Add new software entries that don't exist yet
    for new_software in default_config.software {
        if !existing_ids.contains(&new_software.id) {
            updated.software.push(new_software);
        }
    }

    // Only write if we added new entries
    if updated.software.len() > existing.software.len() {
        let json = serde_json::to_string_pretty(&updated)
            .map_err(|e| format!("Failed to serialize updated config: {}", e))?;
        fs::write(&path, json)
            .map_err(|e| format!("Failed to write updated config file {}: {}", path.display(), e))?;
    }

    Ok(())
}

/// Write the default config to file
fn write_default_config() -> Result<(), String> {
    let path = get_config_path()?;

    let default_config = get_default_config();

    let json = serde_json::to_string_pretty(&default_config)
        .map_err(|e| format!("Failed to serialize default config: {}", e))?;

    fs::write(&path, json)
        .map_err(|e| format!("Failed to write default config file {}: {}", path.display(), e))?;

    Ok(())
}

/// Get the default software recommendations configuration
fn get_default_config() -> SoftwareRecommendationsConfig {
    SoftwareRecommendationsConfig {
        categories: vec![
            SoftwareCategory {
                id: "editors".to_string(),
                name: "Code Editors".to_string(),
                emoji: "📝".to_string(),
            },
            SoftwareCategory {
                id: "terminals".to_string(),
                name: "Terminals".to_string(),
                emoji: "💻".to_string(),
            },
            SoftwareCategory {
                id: "version-control".to_string(),
                name: "Version Control".to_string(),
                emoji: "🔀".to_string(),
            },
            SoftwareCategory {
                id: "utilities".to_string(),
                name: "Utilities".to_string(),
                emoji: "🛠️".to_string(),
            },
            SoftwareCategory {
                id: "productivity".to_string(),
                name: "Productivity".to_string(),
                emoji: "⚡".to_string(),
            },
            SoftwareCategory {
                id: "databases".to_string(),
                name: "Databases".to_string(),
                emoji: "🗄️".to_string(),
            },
            SoftwareCategory {
                id: "api-tools".to_string(),
                name: "API Tools".to_string(),
                emoji: "🔌".to_string(),
            },
        ],
        software: vec![
            SoftwareRecommendation {
                id: "vscode".to_string(),
                name: "Visual Studio Code".to_string(),
                description: "Free source-code editor made by Microsoft".to_string(),
                category: "editors".to_string(),
                emoji: "💻".to_string(),
                install_methods: vec![
                    crate::types::SoftwareInstallMethod {
                        method_type: "brew".to_string(),
                        cask: Some("visual-studio-code".to_string()),
                        owner: None,
                        repo: None,
                        asset_pattern: None,
                        url: None,
                    },
                ],
                installed: false,
            },
            SoftwareRecommendation {
                id: "iterm2".to_string(),
                name: "iTerm2".to_string(),
                description: "Terminal emulator for macOS".to_string(),
                category: "terminals".to_string(),
                emoji: "🖥️".to_string(),
                install_methods: vec![
                    crate::types::SoftwareInstallMethod {
                        method_type: "brew".to_string(),
                        cask: Some("iterm2".to_string()),
                        owner: None,
                        repo: None,
                        asset_pattern: None,
                        url: None,
                    },
                ],
                installed: false,
            },
            SoftwareRecommendation {
                id: "github-cli".to_string(),
                name: "GitHub CLI".to_string(),
                description: "Official GitHub command-line tool".to_string(),
                category: "version-control".to_string(),
                emoji: "🐙".to_string(),
                install_methods: vec![
                    crate::types::SoftwareInstallMethod {
                        method_type: "brew".to_string(),
                        cask: Some("gh".to_string()),
                        owner: None,
                        repo: None,
                        asset_pattern: None,
                        url: None,
                    },
                    crate::types::SoftwareInstallMethod {
                        method_type: "github".to_string(),
                        cask: None,
                        owner: Some("cli".to_string()),
                        repo: Some("cli".to_string()),
                        asset_pattern: Some(r".*macOS_arm64\.zip$".to_string()),
                        url: None,
                    },
                ],
                installed: false,
            },
            SoftwareRecommendation {
                id: "raycast".to_string(),
                name: "Raycast".to_string(),
                description: "Productivity tool that lets you control your tools with a few keystrokes".to_string(),
                category: "productivity".to_string(),
                emoji: "⚡".to_string(),
                install_methods: vec![
                    crate::types::SoftwareInstallMethod {
                        method_type: "brew".to_string(),
                        cask: Some("raycast".to_string()),
                        owner: None,
                        repo: None,
                        asset_pattern: None,
                        url: None,
                    },
                ],
                installed: false,
            },
            SoftwareRecommendation {
                id: "rectangle".to_string(),
                name: "Rectangle".to_string(),
                description: "Move and resize windows using keyboard shortcuts or snap areas".to_string(),
                category: "utilities".to_string(),
                emoji: "▭".to_string(),
                install_methods: vec![
                    crate::types::SoftwareInstallMethod {
                        method_type: "brew".to_string(),
                        cask: Some("rectangle".to_string()),
                        owner: None,
                        repo: None,
                        asset_pattern: None,
                        url: None,
                    },
                ],
                installed: false,
            },
            SoftwareRecommendation {
                id: "docker".to_string(),
                name: "Docker Desktop".to_string(),
                description: "Container platform for building and sharing containerized applications".to_string(),
                category: "utilities".to_string(),
                emoji: "🐳".to_string(),
                install_methods: vec![
                    crate::types::SoftwareInstallMethod {
                        method_type: "brew".to_string(),
                        cask: Some("docker".to_string()),
                        owner: None,
                        repo: None,
                        asset_pattern: None,
                        url: None,
                    },
                ],
                installed: false,
            },
            SoftwareRecommendation {
                id: "postman".to_string(),
                name: "Postman".to_string(),
                description: "API platform for building and using APIs".to_string(),
                category: "api-tools".to_string(),
                emoji: "📮".to_string(),
                install_methods: vec![
                    crate::types::SoftwareInstallMethod {
                        method_type: "brew".to_string(),
                        cask: Some("postman".to_string()),
                        owner: None,
                        repo: None,
                        asset_pattern: None,
                        url: None,
                    },
                ],
                installed: false,
            },
            SoftwareRecommendation {
                id: "insomnia".to_string(),
                name: "Insomnia".to_string(),
                description: "REST client for testing and debugging APIs".to_string(),
                category: "api-tools".to_string(),
                emoji: "🌙".to_string(),
                install_methods: vec![
                    crate::types::SoftwareInstallMethod {
                        method_type: "brew".to_string(),
                        cask: Some("insomnia".to_string()),
                        owner: None,
                        repo: None,
                        asset_pattern: None,
                        url: None,
                    },
                ],
                installed: false,
            },
            SoftwareRecommendation {
                id: "tableplus".to_string(),
                name: "TablePlus".to_string(),
                description: "Modern database management tool with a beautiful UI".to_string(),
                category: "databases".to_string(),
                emoji: "🗄️".to_string(),
                install_methods: vec![
                    crate::types::SoftwareInstallMethod {
                        method_type: "brew".to_string(),
                        cask: Some("tableplus".to_string()),
                        owner: None,
                        repo: None,
                        asset_pattern: None,
                        url: None,
                    },
                ],
                installed: false,
            },
            SoftwareRecommendation {
                id: "warp".to_string(),
                name: "Warp".to_string(),
                description: "Modern terminal with AI-powered features and collaborative tools".to_string(),
                category: "terminals".to_string(),
                emoji: "🚀".to_string(),
                install_methods: vec![
                    crate::types::SoftwareInstallMethod {
                        method_type: "brew".to_string(),
                        cask: Some("warp".to_string()),
                        owner: None,
                        repo: None,
                        asset_pattern: None,
                        url: None,
                    },
                ],
                installed: false,
            },
            SoftwareRecommendation {
                id: "wezterm".to_string(),
                name: "WezTerm".to_string(),
                description: "GPU-accelerated cross-platform terminal emulator and multiplexer".to_string(),
                category: "terminals".to_string(),
                emoji: "🖥️".to_string(),
                install_methods: vec![
                    crate::types::SoftwareInstallMethod {
                        method_type: "brew".to_string(),
                        cask: Some("wezterm".to_string()),
                        owner: None,
                        repo: None,
                        asset_pattern: None,
                        url: None,
                    },
                ],
                installed: false,
            },
            SoftwareRecommendation {
                id: "cursor".to_string(),
                name: "Cursor".to_string(),
                description: "AI-powered code editor built for pair programming".to_string(),
                category: "editors".to_string(),
                emoji: "✏️".to_string(),
                install_methods: vec![
                    crate::types::SoftwareInstallMethod {
                        method_type: "brew".to_string(),
                        cask: Some("cursor".to_string()),
                        owner: None,
                        repo: None,
                        asset_pattern: None,
                        url: None,
                    },
                ],
                installed: false,
            },
            SoftwareRecommendation {
                id: "sublime-text".to_string(),
                name: "Sublime Text".to_string(),
                description: "Sophisticated text editor for code, markup and prose".to_string(),
                category: "editors".to_string(),
                emoji: "📄".to_string(),
                install_methods: vec![
                    crate::types::SoftwareInstallMethod {
                        method_type: "brew".to_string(),
                        cask: Some("sublime-text".to_string()),
                        owner: None,
                        repo: None,
                        asset_pattern: None,
                        url: None,
                    },
                ],
                installed: false,
            },
            SoftwareRecommendation {
                id: "notion".to_string(),
                name: "Notion".to_string(),
                description: "All-in-one workspace for notes, docs, and collaboration".to_string(),
                category: "productivity".to_string(),
                emoji: "📝".to_string(),
                install_methods: vec![
                    crate::types::SoftwareInstallMethod {
                        method_type: "brew".to_string(),
                        cask: Some("notion".to_string()),
                        owner: None,
                        repo: None,
                        asset_pattern: None,
                        url: None,
                    },
                ],
                installed: false,
            },
            SoftwareRecommendation {
                id: "obsidian".to_string(),
                name: "Obsidian".to_string(),
                description: "Powerful knowledge base that works on top of a local folder of plain text Markdown files".to_string(),
                category: "productivity".to_string(),
                emoji: "🪨".to_string(),
                install_methods: vec![
                    crate::types::SoftwareInstallMethod {
                        method_type: "brew".to_string(),
                        cask: Some("obsidian".to_string()),
                        owner: None,
                        repo: None,
                        asset_pattern: None,
                        url: None,
                    },
                ],
                installed: false,
            },
            SoftwareRecommendation {
                id: "figma".to_string(),
                name: "Figma".to_string(),
                description: "Collaborative design tool for teams".to_string(),
                category: "utilities".to_string(),
                emoji: "🎨".to_string(),
                install_methods: vec![
                    crate::types::SoftwareInstallMethod {
                        method_type: "brew".to_string(),
                        cask: Some("figma".to_string()),
                        owner: None,
                        repo: None,
                        asset_pattern: None,
                        url: None,
                    },
                ],
                installed: false,
            },
            SoftwareRecommendation {
                id: "slack".to_string(),
                name: "Slack".to_string(),
                description: "Team communication and collaboration platform".to_string(),
                category: "productivity".to_string(),
                emoji: "💬".to_string(),
                install_methods: vec![
                    crate::types::SoftwareInstallMethod {
                        method_type: "brew".to_string(),
                        cask: Some("slack".to_string()),
                        owner: None,
                        repo: None,
                        asset_pattern: None,
                        url: None,
                    },
                ],
                installed: false,
            },
            SoftwareRecommendation {
                id: "discord".to_string(),
                name: "Discord".to_string(),
                description: "Voice, video and text communication platform".to_string(),
                category: "productivity".to_string(),
                emoji: "🎮".to_string(),
                install_methods: vec![
                    crate::types::SoftwareInstallMethod {
                        method_type: "brew".to_string(),
                        cask: Some("discord".to_string()),
                        owner: None,
                        repo: None,
                        asset_pattern: None,
                        url: None,
                    },
                ],
                installed: false,
            },
            SoftwareRecommendation {
                id: "lazygit".to_string(),
                name: "LazyGit".to_string(),
                description: "Simple terminal UI for git commands".to_string(),
                category: "version-control".to_string(),
                emoji: "😴".to_string(),
                install_methods: vec![
                    crate::types::SoftwareInstallMethod {
                        method_type: "brew".to_string(),
                        cask: Some("lazygit".to_string()),
                        owner: None,
                        repo: None,
                        asset_pattern: None,
                        url: None,
                    },
                ],
                installed: false,
            },
            SoftwareRecommendation {
                id: "aerospace".to_string(),
                name: "Aerospace".to_string(),
                description: "Tiling window manager for macOS".to_string(),
                category: "utilities".to_string(),
                emoji: "✈️".to_string(),
                install_methods: vec![
                    crate::types::SoftwareInstallMethod {
                        method_type: "brew".to_string(),
                        cask: Some("aerospace".to_string()),
                        owner: None,
                        repo: None,
                        asset_pattern: None,
                        url: None,
                    },
                ],
                installed: false,
            },
            SoftwareRecommendation {
                id: "cc-switch".to_string(),
                name: "CC Switch".to_string(),
                description: "Manage Control Center modules on macOS".to_string(),
                category: "utilities".to_string(),
                emoji: "⚙️".to_string(),
                install_methods: vec![
                    crate::types::SoftwareInstallMethod {
                        method_type: "website".to_string(),
                        cask: None,
                        owner: None,
                        repo: None,
                        asset_pattern: None,
                        url: Some("https://apps.apple.com/app/cc-switch/id1495891706".to_string()),
                    },
                ],
                installed: false,
            },
            SoftwareRecommendation {
                id: "doubao".to_string(),
                name: "Doubao".to_string(),
                description: "Chinese social media application".to_string(),
                category: "productivity".to_string(),
                emoji: "📱".to_string(),
                install_methods: vec![
                    crate::types::SoftwareInstallMethod {
                        method_type: "website".to_string(),
                        cask: None,
                        owner: None,
                        repo: None,
                        asset_pattern: None,
                        url: Some("https://www.doubao.com/".to_string()),
                    },
                ],
                installed: false,
            },
            SoftwareRecommendation {
                id: "netease-music".to_string(),
                name: "Netease Music".to_string(),
                description: "Popular music streaming service".to_string(),
                category: "productivity".to_string(),
                emoji: "🎵".to_string(),
                install_methods: vec![
                    crate::types::SoftwareInstallMethod {
                        method_type: "website".to_string(),
                        cask: None,
                        owner: None,
                        repo: None,
                        asset_pattern: None,
                        url: Some("https://music.163.com/".to_string()),
                    },
                ],
                installed: false,
            },
            SoftwareRecommendation {
                id: "tencent-lemon".to_string(),
                name: "Tencent Lemon".to_string(),
                description: "System cleaning tool for macOS".to_string(),
                category: "utilities".to_string(),
                emoji: "🍋".to_string(),
                install_methods: vec![
                    crate::types::SoftwareInstallMethod {
                        method_type: "website".to_string(),
                        cask: None,
                        owner: None,
                        repo: None,
                        asset_pattern: None,
                        url: Some("https://lemon.qq.com/".to_string()),
                    },
                ],
                installed: false,
            },
            SoftwareRecommendation {
                id: "ibar".to_string(),
                name: "iBar".to_string(),
                description: "Manage menu bar items on macOS".to_string(),
                category: "utilities".to_string(),
                emoji: "📊".to_string(),
                install_methods: vec![
                    crate::types::SoftwareInstallMethod {
                        method_type: "website".to_string(),
                        cask: None,
                        owner: None,
                        repo: None,
                        asset_pattern: None,
                        url: Some("https://apps.apple.com/app/ibar/id1452453066".to_string()),
                    },
                ],
                installed: false,
            },
            SoftwareRecommendation {
                id: "antigravity".to_string(),
                name: "Antigravity".to_string(),
                description: "Manage floating windows on macOS".to_string(),
                category: "utilities".to_string(),
                emoji: "🚀".to_string(),
                install_methods: vec![
                    crate::types::SoftwareInstallMethod {
                        method_type: "website".to_string(),
                        cask: None,
                        owner: None,
                        repo: None,
                        asset_pattern: None,
                        url: Some("https://github.com/antigravity/antigravity".to_string()),
                    },
                ],
                installed: false,
            },
            SoftwareRecommendation {
                id: "cherry-studio".to_string(),
                name: "Cherry Studio".to_string(),
                description: "Edit and manage photos on macOS".to_string(),
                category: "utilities".to_string(),
                emoji: "🍒".to_string(),
                install_methods: vec![
                    crate::types::SoftwareInstallMethod {
                        method_type: "website".to_string(),
                        cask: None,
                        owner: None,
                        repo: None,
                        asset_pattern: None,
                        url: Some("https://apps.apple.com/app/cherry-studio/id1234567890".to_string()),
                    },
                ],
                installed: false,
            },
            SoftwareRecommendation {
                id: "flclash".to_string(),
                name: "FlClash".to_string(),
                description: "Manage Clash proxy configurations on macOS".to_string(),
                category: "utilities".to_string(),
                emoji: "⚡".to_string(),
                install_methods: vec![
                    crate::types::SoftwareInstallMethod {
                        method_type: "website".to_string(),
                        cask: None,
                        owner: None,
                        repo: None,
                        asset_pattern: None,
                        url: Some("https://github.com/flclash/flclash".to_string()),
                    },
                ],
                installed: false,
            },
            SoftwareRecommendation {
                id: "ihosts".to_string(),
                name: "iHosts".to_string(),
                description: "Manage and switch hosts files on macOS".to_string(),
                category: "utilities".to_string(),
                emoji: "🌐".to_string(),
                install_methods: vec![
                    crate::types::SoftwareInstallMethod {
                        method_type: "website".to_string(),
                        cask: None,
                        owner: None,
                        repo: None,
                        asset_pattern: None,
                        url: Some("https://apps.apple.com/app/ihosts/id1102004240".to_string()),
                    },
                ],
                installed: false,
            },
            SoftwareRecommendation {
                id: "autoglm".to_string(),
                name: "AutoGLM".to_string(),
                description: "Automated machine learning tool".to_string(),
                category: "utilities".to_string(),
                emoji: "🤖".to_string(),
                install_methods: vec![
                    crate::types::SoftwareInstallMethod {
                        method_type: "website".to_string(),
                        cask: None,
                        owner: None,
                        repo: None,
                        asset_pattern: None,
                        url: Some("https://github.com/autoglm/autoglm".to_string()),
                    },
                ],
                installed: false,
            },
            SoftwareRecommendation {
                id: "google-chrome".to_string(),
                name: "Google Chrome".to_string(),
                description: "Widely-used web browser".to_string(),
                category: "utilities".to_string(),
                emoji: "🌐".to_string(),
                install_methods: vec![
                    crate::types::SoftwareInstallMethod {
                        method_type: "website".to_string(),
                        cask: None,
                        owner: None,
                        repo: None,
                        asset_pattern: None,
                        url: Some("https://www.google.com/chrome/".to_string()),
                    },
                ],
                installed: false,
            },
            SoftwareRecommendation {
                id: "rar-extractor".to_string(),
                name: "RAR Extractor - Unarchiver".to_string(),
                description: "Extract RAR files on macOS".to_string(),
                category: "utilities".to_string(),
                emoji: "📦".to_string(),
                install_methods: vec![
                    crate::types::SoftwareInstallMethod {
                        method_type: "website".to_string(),
                        cask: None,
                        owner: None,
                        repo: None,
                        asset_pattern: None,
                        url: Some("https://apps.apple.com/app/rar-extractor-unarchiver/id1234567890".to_string()),
                    },
                ],
                installed: false,
            },
            SoftwareRecommendation {
                id: "wechat".to_string(),
                name: "WeChat".to_string(),
                description: "Messaging and social media app".to_string(),
                category: "productivity".to_string(),
                emoji: "💬".to_string(),
                install_methods: vec![
                    crate::types::SoftwareInstallMethod {
                        method_type: "website".to_string(),
                        cask: None,
                        owner: None,
                        repo: None,
                        asset_pattern: None,
                        url: Some("https://www.wechat.com/".to_string()),
                    },
                ],
                installed: false,
            },
            SoftwareRecommendation {
                id: "ima-copilot".to_string(),
                name: "ima.copilot".to_string(),
                description: "Manage image assets on macOS".to_string(),
                category: "utilities".to_string(),
                emoji: "🖼️".to_string(),
                install_methods: vec![
                    crate::types::SoftwareInstallMethod {
                        method_type: "website".to_string(),
                        cask: None,
                        owner: None,
                        repo: None,
                        asset_pattern: None,
                        url: Some("https://github.com/ima-copilot/ima-copilot".to_string()),
                    },
                ],
                installed: false,
            },
            SoftwareRecommendation {
                id: "barrier".to_string(),
                name: "Barrier".to_string(),
                description: "Cross-platform software KVM switch".to_string(),
                category: "utilities".to_string(),
                emoji: "🔄".to_string(),
                install_methods: vec![
                    crate::types::SoftwareInstallMethod {
                        method_type: "brew".to_string(),
                        cask: Some("barrier".to_string()),
                        owner: None,
                        repo: None,
                        asset_pattern: None,
                        url: None,
                    },
                ],
                installed: false,
            },
            SoftwareRecommendation {
                id: "microsoft-todo".to_string(),
                name: "Microsoft To Do".to_string(),
                description: "Task management application".to_string(),
                category: "productivity".to_string(),
                emoji: "✅".to_string(),
                install_methods: vec![
                    crate::types::SoftwareInstallMethod {
                        method_type: "website".to_string(),
                        cask: None,
                        owner: None,
                        repo: None,
                        asset_pattern: None,
                        url: Some("https://todo.microsoft.com/".to_string()),
                    },
                ],
                installed: false,
            },
        ],
    }
}


