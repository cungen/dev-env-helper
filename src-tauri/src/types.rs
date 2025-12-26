use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CliToolTemplate {
    pub id: String,
    pub name: String,
    pub executable: String,
    #[serde(rename = "versionCommand")]
    pub version_command: String,
    #[serde(rename = "versionParser")]
    pub version_parser: String,
    #[serde(rename = "configFiles")]
    pub config_files: Vec<ConfigFileLocation>,
    #[serde(rename = "installMethods")]
    pub install_methods: Option<Vec<InstallMethod>>,
    pub dependencies: Option<Vec<String>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InstallMethod {
    #[serde(rename = "type")]
    pub method_type: String,
    #[serde(rename = "brewCaskName")]
    pub brew_cask_name: Option<String>,
    #[serde(rename = "brewFormulaName")]
    pub brew_formula_name: Option<String>,
    #[serde(rename = "brewTap")]
    pub brew_tap: Option<String>,
    #[serde(rename = "dmgUrl")]
    pub dmg_url: Option<String>,
    #[serde(rename = "dmgInstallSteps")]
    pub dmg_install_steps: Option<Vec<String>>,
    #[serde(rename = "scriptCommands")]
    pub script_commands: Option<Vec<String>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConfigFileLocation {
    pub path: String,
    pub description: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CliToolDetection {
    #[serde(rename = "templateId")]
    pub template_id: String,
    pub installed: bool,
    pub version: Option<String>,
    #[serde(rename = "executablePath")]
    pub executable_path: Option<String>,
    #[serde(rename = "configFiles")]
    pub config_files: Vec<ConfigFileStatus>,
    #[serde(rename = "detectedAt")]
    pub detected_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConfigFileStatus {
    pub path: String,
    pub exists: bool,
    pub can_read: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DependencyNode {
    #[serde(rename = "toolId")]
    pub tool_id: String,
    pub name: String,
    pub installed: bool,
    pub dependencies: Vec<DependencyNode>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DependencyTree {
    pub root: DependencyNode,
    #[serde(rename = "totalTools")]
    pub total_tools: usize,
    #[serde(rename = "installedCount")]
    pub installed_count: usize,
    #[serde(rename = "missingCount")]
    pub missing_count: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EnvironmentExport {
    #[serde(rename = "schemaVersion")]
    pub schema_version: String,
    #[serde(rename = "exportedAt")]
    pub exported_at: String,
    pub hostname: Option<String>,
    pub tools: Vec<CliToolDetection>,
    #[serde(rename = "customTemplates")]
    pub custom_templates: Vec<CliToolTemplate>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub software: Option<Vec<SoftwareRecommendation>>,
}

// Software Recommendations Types
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SoftwareCategory {
    pub id: String,
    pub name: String,
    pub emoji: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SoftwareInstallMethod {
    #[serde(rename = "type")]
    pub method_type: String,
    pub cask: Option<String>,
    pub owner: Option<String>,
    pub repo: Option<String>,
    #[serde(rename = "assetPattern")]
    pub asset_pattern: Option<String>,
    pub url: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SoftwareRecommendation {
    pub id: String,
    pub name: String,
    pub description: String,
    pub category: String,
    pub emoji: String,
    #[serde(rename = "installMethods")]
    pub install_methods: Vec<SoftwareInstallMethod>,
    #[serde(default)]
    pub installed: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SoftwareRecommendationsConfig {
    pub categories: Vec<SoftwareCategory>,
    pub software: Vec<SoftwareRecommendation>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GitHubReleaseAsset {
    pub name: String,
    #[serde(rename = "browser_download_url")]
    pub browser_download_url: String,
    pub size: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GitHubReleaseInfo {
    #[serde(rename = "tag_name")]
    pub tag_name: String,
    pub name: Option<String>,
    pub assets: Vec<GitHubReleaseAsset>,
    #[serde(rename = "published_at")]
    pub published_at: String,
}

// Settings Types
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AppSettings {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub download_path: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub default_editor: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub proxy: Option<ProxySettings>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub github_token: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProxySettings {
    pub enabled: bool,
    #[serde(rename = "type")]
    pub proxy_type: ProxyType,
    pub url: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ProxyType {
    Http,
    Https,
    Socks4,
    Socks5,
}
