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

    // If file exists, check if it needs updating (has old 3-entry config)
    let existing = load_software_recommendations().unwrap_or_else(|_| SoftwareRecommendationsConfig {
        categories: Vec::new(),
        software: Vec::new(),
    });

    // If config has only 3 or fewer entries, it's likely the old default - update it
    if existing.software.len() <= 3 {
        return write_default_config();
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
                    },
                ],
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
                    },
                ],
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
                    },
                    crate::types::SoftwareInstallMethod {
                        method_type: "github".to_string(),
                        cask: None,
                        owner: Some("cli".to_string()),
                        repo: Some("cli".to_string()),
                        asset_pattern: Some(r".*macOS_amd64\.tar\.gz$".to_string()),
                    },
                ],
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
                    },
                ],
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
                    },
                ],
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
                    },
                ],
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
                    },
                ],
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
                    },
                ],
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
                    },
                ],
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
                    },
                ],
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
                    },
                ],
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
                    },
                ],
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
                    },
                ],
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
                    },
                ],
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
                    },
                ],
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
                    },
                ],
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
                    },
                ],
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
                    },
                ],
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
                    },
                ],
            },
        ],
    }
}


