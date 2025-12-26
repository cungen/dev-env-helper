# Design: Add Settings for Application Configuration

## Context
The application currently uses hardcoded paths and system defaults for downloads, file opening, and network operations. Users need to customize these behaviors to match their environment, especially in corporate networks that require proxy configuration.

## Goals
- Provide a centralized settings system for application configuration
- Allow users to configure download paths, default editor, and proxy settings
- Apply settings to all relevant operations (downloads, brew installs, file opening)
- Persist settings across application restarts
- Validate settings and provide clear error messages
- Consolidate environment backup and restore functionality into settings page for better discoverability

## Non-Goals
- Advanced proxy authentication (username/password) in initial version
- Multiple proxy configurations (single proxy for all operations)
- Settings import/export (can be added later)
- Per-operation proxy settings (single proxy applies to all network operations)

## Decisions

### Decision 1: Settings Storage Location
**What**: Store settings in a JSON file in the OS config directory (`dirs::config_dir()/dev-env-helper/settings.json`).

**Rationale**:
- Consistent with existing config storage pattern (software-recommendations.json, custom-templates)
- Easy to edit manually if needed
- No database overhead for simple key-value settings
- Cross-platform compatible via `dirs` crate

**Alternatives considered**:
- Database storage: Overkill for simple settings
- Tauri's built-in config: Less flexible, harder to edit manually
- Environment variables: Not persistent, harder to manage

**Implementation**: Use `dirs::config_dir()` in Rust, create `settings.json` file in `dev-env-helper` directory.

### Decision 2: Settings Schema
**What**: Use a structured JSON format with validation.

**Schema**:
```json
{
  "downloadPath": "/Users/username/Downloads",
  "defaultEditor": "/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code",
  "proxy": {
    "enabled": false,
    "type": "http",
    "url": "http://proxy.example.com:8080"
  }
}
```

**Proxy types**: `http`, `https`, `socks4`, `socks5`

**Rationale**:
- Simple, flat structure for easy access
- Proxy as optional nested object (can be null/omitted when disabled)
- Type-safe deserialization with serde

### Decision 3: Proxy Application Strategy
**What**: Apply proxy settings via environment variables for brew commands and via reqwest client configuration for HTTP downloads.

**Rationale**:
- Brew respects standard proxy environment variables (`HTTP_PROXY`, `HTTPS_PROXY`, `ALL_PROXY`)
- Reqwest supports proxy configuration in client builder
- Environment variables are the standard way to configure proxies for command-line tools

**Implementation**:
- For brew: Set `HTTP_PROXY`, `HTTPS_PROXY`, or `ALL_PROXY` environment variables before spawning brew process
- For downloads: Configure reqwest client with proxy settings using `reqwest::Client::builder().proxy()`

**Proxy URL format**:
- HTTP: `http://host:port`
- HTTPS: `https://host:port`
- SOCKS4: `socks4://host:port`
- SOCKS5: `socks5://host:port`

### Decision 4: Download Path Validation
**What**: Validate that download path exists and is writable when setting is saved.

**Rationale**:
- Prevents errors during download operations
- Provides immediate feedback to user
- Ensures settings are valid before use

**Implementation**: Check path exists and is a directory, attempt to create a test file to verify write permissions.

### Decision 5: Default Editor Validation
**What**: Validate that editor path exists and is executable when setting is saved.

**Rationale**:
- Prevents errors when opening files
- Provides immediate feedback to user
- Common editors can be detected and suggested

**Implementation**: Check path exists, verify it's a file (not directory), check executable permissions. Provide presets for common editors (VS Code, Sublime, Vim, etc.).

### Decision 6: Environment Backup/Restore in Settings
**What**: Move environment export/import functionality from separate "Environment" tab to Settings page.

**Rationale**:
- Environment backup/restore is a configuration/management function, not a primary feature
- Consolidates all application management functions in one place
- Reduces navigation clutter (one less tab)
- Settings page is a logical place for backup/restore operations
- Follows common UI patterns where backup/restore is in settings

**Alternatives considered**:
- Keep separate tab: Maintains current structure but adds navigation complexity
- Create separate "Backup" tab: Too granular, creates unnecessary navigation items
- Add to CLI Tools page: Less logical, CLI Tools is for tool management, not environment backup

**Implementation**:
- Move environment export/import components to settings page
- Create "Environment Backup & Restore" section in settings
- Remove "Environment" tab from navigation
- Keep existing export/import functionality unchanged (only UI location changes)

## Risks / Trade-offs

### Risk: Proxy Configuration Complexity
**Mitigation**:
- Validate proxy URL format
- Test with common proxy configurations
- Provide clear error messages with examples
- Support standard proxy URL formats

### Risk: Settings Not Applied Immediately
**Mitigation**:
- Apply proxy settings to new operations immediately (don't require restart)
- Document which settings require restart (if any)
- Use settings at operation time, not at startup

### Risk: Invalid Settings Causing Failures
**Mitigation**:
- Validate all settings on save
- Provide sensible defaults
- Show validation errors in UI
- Allow reset to defaults

## Migration Plan

### Initial Implementation
1. Create settings storage module in Rust
2. Create settings UI in React
3. Integrate settings into download operations
4. Integrate settings into brew installation
5. Integrate settings into file opening operations
6. Move environment export/import components to settings page
7. Remove "Environment" tab from navigation

### Backward Compatibility
- If settings file doesn't exist, use system defaults
- Download path defaults to system Downloads directory
- Default editor defaults to system default (or null if not set)
- Proxy defaults to disabled

### Rollback
- Settings file can be deleted to reset to defaults
- Application will continue to work with system defaults if settings are invalid

## Open Questions
- Should we support proxy authentication (username/password) in the future?
- Should we support per-operation proxy settings (different proxy for brew vs downloads)?
- Should we provide settings import/export functionality?

