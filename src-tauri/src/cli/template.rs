use crate::types::{CliToolTemplate, InstallMethod, ConfigFileLocation};

/// Built-in CLI tool templates
pub fn get_builtin_templates() -> Vec<CliToolTemplate> {
    vec![
        CliToolTemplate {
            id: "node".to_string(),
            name: "Node.js".to_string(),
            executable: "node".to_string(),
            version_command: "--version".to_string(),
            version_parser: "stdout".to_string(),
            config_files: vec![
                ConfigFileLocation {
                    path: "~/.npmrc".to_string(),
                    description: "NPM configuration".to_string(),
                },
            ],
            install_methods: Some(vec![
                InstallMethod {
                    method_type: "brew".to_string(),
                    brew_cask_name: Some("node".to_string()),
                    dmg_url: None,
                    dmg_install_steps: None,
                },
            ]),
            dependencies: None,
        },
        CliToolTemplate {
            id: "python".to_string(),
            name: "Python".to_string(),
            executable: "python3".to_string(),
            version_command: "--version".to_string(),
            version_parser: "stderr".to_string(),
            config_files: vec![
                ConfigFileLocation {
                    path: "~/.pythonrc".to_string(),
                    description: "Python configuration".to_string(),
                },
            ],
            install_methods: Some(vec![
                InstallMethod {
                    method_type: "brew".to_string(),
                    brew_cask_name: Some("python".to_string()),
                    dmg_url: None,
                    dmg_install_steps: None,
                },
            ]),
            dependencies: None,
        },
        CliToolTemplate {
            id: "uv".to_string(),
            name: "uv".to_string(),
            executable: "uv".to_string(),
            version_command: "--version".to_string(),
            version_parser: "stdout".to_string(),
            config_files: vec![
                ConfigFileLocation {
                    path: "~/.uv/uv.toml".to_string(),
                    description: "UV configuration".to_string(),
                },
            ],
            install_methods: Some(vec![
                InstallMethod {
                    method_type: "brew".to_string(),
                    brew_cask_name: Some("uv".to_string()),
                    dmg_url: None,
                    dmg_install_steps: None,
                },
            ]),
            dependencies: Some(vec!["python".to_string()]),
        },
        CliToolTemplate {
            id: "n".to_string(),
            name: "n".to_string(),
            executable: "n".to_string(),
            version_command: "--version".to_string(),
            version_parser: "stdout".to_string(),
            config_files: vec![],
            install_methods: Some(vec![
                InstallMethod {
                    method_type: "brew".to_string(),
                    brew_cask_name: Some("n".to_string()),
                    dmg_url: None,
                    dmg_install_steps: None,
                },
            ]),
            dependencies: Some(vec!["node".to_string()]),
        },
    ]
}

/// List all templates (built-in + custom)
pub fn list_all_templates() -> Vec<CliToolTemplate> {
    let templates = get_builtin_templates();

    // TODO: Load custom templates from user config directory
    // For now, just return built-in templates

    templates
}

/// Get a template by ID
#[allow(dead_code)]
pub fn get_template_by_id(id: &str) -> Option<CliToolTemplate> {
    list_all_templates()
        .into_iter()
        .find(|t| t.id == id)
}
