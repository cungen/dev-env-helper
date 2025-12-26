use crate::types::ProxySettings;
use reqwest::ClientBuilder;

/// Get proxy environment variable for brew commands
/// Returns (env_var_name, env_var_value) tuple
pub fn get_proxy_env_var(settings: &ProxySettings) -> Option<(String, String)> {
    if !settings.enabled {
        return None;
    }

    let env_var_name = match settings.proxy_type {
        crate::types::ProxyType::Http => "HTTP_PROXY",
        crate::types::ProxyType::Https => "HTTPS_PROXY",
        crate::types::ProxyType::Socks4 | crate::types::ProxyType::Socks5 => "ALL_PROXY",
    };

    Some((env_var_name.to_string(), settings.url.clone()))
}

/// Configure reqwest client with proxy settings
pub fn configure_client_with_proxy(
    client_builder: ClientBuilder,
    settings: &ProxySettings,
) -> Result<ClientBuilder, String> {
    if !settings.enabled {
        return Ok(client_builder);
    }

    let proxy = match settings.proxy_type {
        crate::types::ProxyType::Http => {
            reqwest::Proxy::http(&settings.url)
                .map_err(|e| format!("Failed to create HTTP proxy '{}': {}", settings.url, e))?
        }
        crate::types::ProxyType::Https => {
            // For HTTPS proxy type, use all() which works for both HTTP and HTTPS URLs
            // This is more flexible and works better with GitHub API (HTTPS)
            reqwest::Proxy::all(&settings.url)
                .map_err(|e| format!("Failed to create HTTPS proxy '{}': {}", settings.url, e))?
        }
        crate::types::ProxyType::Socks4 | crate::types::ProxyType::Socks5 => {
            // SOCKS proxies require the 'socks' feature in reqwest
            // For now, try using Proxy::all() which may work in some cases
            // but ideally should use reqwest::Proxy::socks5() with the socks feature enabled
            reqwest::Proxy::all(&settings.url)
                .map_err(|e| {
                    format!(
                        "Failed to create {} proxy '{}': {}. Note: Full SOCKS proxy support may require the 'socks' feature in reqwest. Consider using HTTP/HTTPS proxy instead, or add 'socks' to reqwest features in Cargo.toml.",
                        match settings.proxy_type {
                            crate::types::ProxyType::Socks4 => "SOCKS4",
                            crate::types::ProxyType::Socks5 => "SOCKS5",
                            _ => unreachable!(),
                        },
                        settings.url,
                        e
                    )
                })?
        }
    };

    Ok(client_builder.proxy(proxy))
}

