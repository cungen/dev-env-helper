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
                    brew_formula_name: None,
                    brew_tap: None,
                    dmg_url: None,
                    dmg_install_steps: None,
                    script_commands: None,
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
                    brew_formula_name: None,
                    brew_tap: None,
                    dmg_url: None,
                    dmg_install_steps: None,
                    script_commands: None,
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
                    brew_formula_name: None,
                    brew_tap: None,
                    dmg_url: None,
                    dmg_install_steps: None,
                    script_commands: None,
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
                    brew_formula_name: None,
                    brew_tap: None,
                    dmg_url: None,
                    dmg_install_steps: None,
                    script_commands: None,
                },
            ]),
            dependencies: Some(vec!["node".to_string()]),
        },
        CliToolTemplate {
            id: "brew".to_string(),
            name: "Homebrew".to_string(),
            executable: "brew".to_string(),
            version_command: "--version".to_string(),
            version_parser: "stdout".to_string(),
            config_files: vec![],
            install_methods: Some(vec![
                InstallMethod {
                    method_type: "script".to_string(),
                    brew_cask_name: None,
                    brew_formula_name: None,
                    brew_tap: None,
                    dmg_url: None,
                    dmg_install_steps: None,
                    script_commands: Some(vec![
                        "echo 'export HOMEBREW_API_DOMAIN=\"https://mirrors.tuna.tsinghua.edu.cn/homebrew-bottles/api\"' >> ~/.zprofile".to_string(),
                        "echo 'export HOMEBREW_BOTTLE_DOMAIN=\"https://mirrors.tuna.tsinghua.edu.cn/homebrew-bottles\"' >> ~/.zprofile".to_string(),
                        "export HOMEBREW_API_DOMAIN=\"https://mirrors.tuna.tsinghua.edu.cn/homebrew-bottles/api\"".to_string(),
                        "export HOMEBREW_BOTTLE_DOMAIN=\"https://mirrors.tuna.tsinghua.edu.cn/homebrew-bottles\"".to_string(),
                        "xcode-select --install".to_string(),
                        "export HOMEBREW_BREW_GIT_REMOTE=\"https://mirrors.tuna.tsinghua.edu.cn/git/homebrew/brew.git\"".to_string(),
                        "export HOMEBREW_CORE_GIT_REMOTE=\"https://mirrors.tuna.tsinghua.edu.cn/git/homebrew/homebrew-core.git\"".to_string(),
                        "export HOMEBREW_INSTALL_FROM_API=1".to_string(),
                        "git clone --depth=1 https://mirrors.tuna.tsinghua.edu.cn/git/homebrew/install.git brew-install".to_string(),
                        "/bin/bash brew-install/install.sh".to_string(),
                        "rm -rf brew-install".to_string(),
                    ]),
                },
            ]),
            dependencies: None,
        },
        CliToolTemplate {
            id: "aerospace".to_string(),
            name: "Aerospace".to_string(),
            executable: "aerospace".to_string(),
            version_command: "--version".to_string(),
            version_parser: "stdout".to_string(),
            config_files: vec![
                ConfigFileLocation {
                    path: "~/.config/aerospace/aerospace.toml".to_string(),
                    description: "Aerospace configuration".to_string(),
                },
            ],
            install_methods: Some(vec![
                InstallMethod {
                    method_type: "brew".to_string(),
                    brew_cask_name: Some("aerospace".to_string()),
                    brew_formula_name: None,
                    brew_tap: Some("nikitabobko/tap".to_string()),
                    dmg_url: None,
                    dmg_install_steps: None,
                    script_commands: None,
                },
            ]),
            dependencies: Some(vec!["brew".to_string()]),
        },
        CliToolTemplate {
            id: "fish".to_string(),
            name: "Fish Shell".to_string(),
            executable: "fish".to_string(),
            version_command: "--version".to_string(),
            version_parser: "stdout".to_string(),
            config_files: vec![
                ConfigFileLocation {
                    path: "~/.config/fish/config.fish".to_string(),
                    description: "Fish shell configuration".to_string(),
                },
            ],
            install_methods: Some(vec![
                InstallMethod {
                    method_type: "brew".to_string(),
                    brew_cask_name: None,
                    brew_formula_name: Some("fish".to_string()),
                    brew_tap: None,
                    dmg_url: None,
                    dmg_install_steps: None,
                    script_commands: None,
                },
            ]),
            dependencies: Some(vec!["brew".to_string()]),
        },
        CliToolTemplate {
            id: "lazygit".to_string(),
            name: "LazyGit".to_string(),
            executable: "lazygit".to_string(),
            version_command: "--version".to_string(),
            version_parser: "stdout".to_string(),
            config_files: vec![
                ConfigFileLocation {
                    path: "~/.config/lazygit/config.yml".to_string(),
                    description: "LazyGit configuration".to_string(),
                },
            ],
            install_methods: Some(vec![
                InstallMethod {
                    method_type: "brew".to_string(),
                    brew_cask_name: None,
                    brew_formula_name: Some("lazygit".to_string()),
                    brew_tap: None,
                    dmg_url: None,
                    dmg_install_steps: None,
                    script_commands: None,
                },
            ]),
            dependencies: Some(vec!["brew".to_string()]),
        },
        CliToolTemplate {
            id: "nvim".to_string(),
            name: "Neovim".to_string(),
            executable: "nvim".to_string(),
            version_command: "--version".to_string(),
            version_parser: "stdout".to_string(),
            config_files: vec![
                ConfigFileLocation {
                    path: "~/.config/nvim/init.lua".to_string(),
                    description: "Neovim configuration".to_string(),
                },
            ],
            install_methods: Some(vec![
                InstallMethod {
                    method_type: "brew".to_string(),
                    brew_cask_name: None,
                    brew_formula_name: Some("neovim".to_string()),
                    brew_tap: None,
                    dmg_url: None,
                    dmg_install_steps: None,
                    script_commands: None,
                },
            ]),
            dependencies: Some(vec!["brew".to_string()]),
        },
        CliToolTemplate {
            id: "tmux".to_string(),
            name: "tmux".to_string(),
            executable: "tmux".to_string(),
            version_command: "-V".to_string(),
            version_parser: "stdout".to_string(),
            config_files: vec![
                ConfigFileLocation {
                    path: "~/.tmux.conf".to_string(),
                    description: "tmux configuration".to_string(),
                },
            ],
            install_methods: Some(vec![
                InstallMethod {
                    method_type: "brew".to_string(),
                    brew_cask_name: None,
                    brew_formula_name: Some("tmux".to_string()),
                    brew_tap: None,
                    dmg_url: None,
                    dmg_install_steps: None,
                    script_commands: None,
                },
            ]),
            dependencies: Some(vec!["brew".to_string()]),
        },
        CliToolTemplate {
            id: "ccusage".to_string(),
            name: "ccusage".to_string(),
            executable: "ccusage".to_string(),
            version_command: "--version".to_string(),
            version_parser: "stdout".to_string(),
            config_files: vec![],
            install_methods: Some(vec![
                InstallMethod {
                    method_type: "script".to_string(),
                    brew_cask_name: None,
                    brew_formula_name: None,
                    brew_tap: None,
                    dmg_url: None,
                    dmg_install_steps: None,
                    script_commands: Some(vec![
                        "pnpm install -g ccusage@latest".to_string(),
                    ]),
                },
            ]),
            dependencies: Some(vec!["node".to_string()]),
        },
        CliToolTemplate {
            id: "codex".to_string(),
            name: "Codex".to_string(),
            executable: "codex".to_string(),
            version_command: "--version".to_string(),
            version_parser: "stdout".to_string(),
            config_files: vec![],
            install_methods: Some(vec![
                InstallMethod {
                    method_type: "script".to_string(),
                    brew_cask_name: None,
                    brew_formula_name: None,
                    brew_tap: None,
                    dmg_url: None,
                    dmg_install_steps: None,
                    script_commands: Some(vec![
                        "pnpm install -g @ccusage/codex@latest".to_string(),
                    ]),
                },
            ]),
            dependencies: Some(vec!["node".to_string()]),
        },
        CliToolTemplate {
            id: "claude-code".to_string(),
            name: "Claude Code".to_string(),
            executable: "claude-code".to_string(),
            version_command: "--version".to_string(),
            version_parser: "stdout".to_string(),
            config_files: vec![],
            install_methods: Some(vec![
                InstallMethod {
                    method_type: "script".to_string(),
                    brew_cask_name: None,
                    brew_formula_name: None,
                    brew_tap: None,
                    dmg_url: None,
                    dmg_install_steps: None,
                    script_commands: Some(vec![
                        "npm install -g @anthropic-ai/claude-code".to_string(),
                    ]),
                },
            ]),
            dependencies: Some(vec!["node".to_string()]),
        },
        CliToolTemplate {
            id: "wezterm".to_string(),
            name: "WezTerm".to_string(),
            executable: "wezterm".to_string(),
            version_command: "--version".to_string(),
            version_parser: "stdout".to_string(),
            config_files: vec![
                ConfigFileLocation {
                    path: "~/.config/wezterm/wezterm.lua".to_string(),
                    description: "WezTerm configuration".to_string(),
                },
            ],
            install_methods: Some(vec![
                InstallMethod {
                    method_type: "brew".to_string(),
                    brew_cask_name: Some("wezterm".to_string()),
                    brew_formula_name: None,
                    brew_tap: None,
                    dmg_url: None,
                    dmg_install_steps: None,
                    script_commands: None,
                },
            ]),
            dependencies: Some(vec!["brew".to_string()]),
        },
        CliToolTemplate {
            id: "claude".to_string(),
            name: "Claude CLI".to_string(),
            executable: "claude".to_string(),
            version_command: "--version".to_string(),
            version_parser: "stdout".to_string(),
            config_files: vec![],
            install_methods: Some(vec![
                InstallMethod {
                    method_type: "script".to_string(),
                    brew_cask_name: None,
                    brew_formula_name: None,
                    brew_tap: None,
                    dmg_url: None,
                    dmg_install_steps: None,
                    script_commands: Some(vec![
                        "curl -fsSL https://claude.ai/install.sh | bash".to_string(),
                    ]),
                },
            ]),
            dependencies: None,
        },
        CliToolTemplate {
            id: "gemini".to_string(),
            name: "Gemini CLI".to_string(),
            executable: "gemini".to_string(),
            version_command: "--version".to_string(),
            version_parser: "stdout".to_string(),
            config_files: vec![],
            install_methods: Some(vec![
                InstallMethod {
                    method_type: "script".to_string(),
                    brew_cask_name: None,
                    brew_formula_name: None,
                    brew_tap: None,
                    dmg_url: None,
                    dmg_install_steps: None,
                    script_commands: Some(vec![
                        "npm install -g @google/gemini-cli".to_string(),
                    ]),
                },
            ]),
            dependencies: Some(vec!["node".to_string()]),
        },
        CliToolTemplate {
            id: "openspec".to_string(),
            name: "OpenSpec".to_string(),
            executable: "openspec".to_string(),
            version_command: "--version".to_string(),
            version_parser: "stdout".to_string(),
            config_files: vec![],
            install_methods: Some(vec![
                InstallMethod {
                    method_type: "script".to_string(),
                    brew_cask_name: None,
                    brew_formula_name: None,
                    brew_tap: None,
                    dmg_url: None,
                    dmg_install_steps: None,
                    script_commands: Some(vec![
                        "npm install -g @fission-ai/openspec@latest".to_string(),
                    ]),
                },
            ]),
            dependencies: Some(vec!["node".to_string()]),
        },
        CliToolTemplate {
            id: "inshellisense".to_string(),
            name: "Inshellisense".to_string(),
            executable: "inshellisense".to_string(),
            version_command: "--version".to_string(),
            version_parser: "stdout".to_string(),
            config_files: vec![],
            install_methods: Some(vec![
                InstallMethod {
                    method_type: "script".to_string(),
                    brew_cask_name: None,
                    brew_formula_name: None,
                    brew_tap: None,
                    dmg_url: None,
                    dmg_install_steps: None,
                    script_commands: Some(vec![
                        "npm install -g @microsoft/inshellisense".to_string(),
                    ]),
                },
            ]),
            dependencies: Some(vec!["node".to_string()]),
        },
        CliToolTemplate {
            id: "tree-sitter".to_string(),
            name: "Tree-sitter CLI".to_string(),
            executable: "tree-sitter".to_string(),
            version_command: "--version".to_string(),
            version_parser: "stdout".to_string(),
            config_files: vec![],
            install_methods: Some(vec![
                InstallMethod {
                    method_type: "script".to_string(),
                    brew_cask_name: None,
                    brew_formula_name: None,
                    brew_tap: None,
                    dmg_url: None,
                    dmg_install_steps: None,
                    script_commands: Some(vec![
                        "npm install -g tree-sitter-cli".to_string(),
                    ]),
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
