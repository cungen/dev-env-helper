# Change: Add Settings for Application Configuration

## Why
Users need to customize application behavior to match their preferences and environment. Currently, download paths, default editors, and network proxy settings are hardcoded or use system defaults. Additionally, environment backup and restore functionality is on a separate page, making it harder to find. Adding a centralized settings system allows users to:
- Configure where downloaded files are saved
- Set their preferred code editor for opening files
- Configure proxy settings for network operations (brew installs and downloads) to work in restricted network environments
- Access environment backup and restore functionality from a single, logical location

## What Changes
- **NEW**: Settings page accessible from navigation
- **NEW**: Settings storage system (JSON file in config directory)
- **NEW**: Download path setting (user-configurable download directory)
- **NEW**: Default editor setting (path to preferred editor executable)
- **NEW**: Proxy setting (HTTP/HTTPS or SOCKS proxy configuration)
- **NEW**: Environment backup and restore section in settings page
- **MODIFIED**: Download operations to use configured download path instead of system default
- **MODIFIED**: Brew installation to use proxy settings when configured
- **MODIFIED**: Download operations (DMG, GitHub releases) to use proxy settings when configured
- **MODIFIED**: File opening operations to use configured default editor
- **MODIFIED**: Environment export/import moved from separate "Environment" tab to Settings page
- **REMOVED**: "Environment" tab from navigation (functionality moved to Settings)

## Impact
- **Affected specs**:
  - `settings` - New capability for application settings management (includes environment backup/restore)
  - `cli-installation` - Modified to use proxy settings for brew installs
  - `software-recommendations` - Modified to use proxy settings for downloads (if applicable)
  - `ui-navigation` - Modified to remove "Environment" tab
  - `environment-export` - Functionality moved to settings (spec remains, but UI location changes)
- **Affected code**:
  - `src-tauri/src/settings/` - New Rust module for settings storage and management
  - `src-tauri/src/installation/brew.rs` - Modified to use proxy environment variables
  - `src-tauri/src/installation/download.rs` - Modified to use proxy settings and configured download path
  - `src/features/settings/` - New React feature module for settings UI (includes environment export/import components)
  - `src/App.tsx` - Add settings tab to navigation, remove environment tab
  - `src-tauri/src/lib.rs` - Add settings-related Tauri commands
  - `src/features/environment-export/` - Components moved/integrated into settings page
- **New dependencies**:
  - None (uses existing reqwest for proxy support, dirs for config directory)

## Success Criteria
1. Settings page displays all settings sections (application settings, environment backup/restore)
2. Settings are persisted to JSON file in config directory
3. Download path setting changes where files are saved
4. Default editor setting is used when opening files
5. Proxy setting (HTTP/HTTPS/SOCKS) is applied to brew install commands
6. Proxy setting is applied to all download operations (DMG, GitHub releases)
7. Environment export/import functionality is accessible from settings page
8. "Environment" tab is removed from navigation
9. Settings can be reset to defaults
10. Invalid settings show validation errors

## Risks & Mitigations
- **Risk**: Proxy configuration may be complex and error-prone
  - **Mitigation**: Validate proxy URLs, test with common proxy formats, provide clear error messages
- **Risk**: Settings changes may require app restart for some operations
  - **Mitigation**: Document which settings require restart, apply proxy settings immediately to new operations
- **Risk**: Invalid download path may cause failures
  - **Mitigation**: Validate path exists and is writable, provide file picker for path selection
- **Risk**: Default editor path may not exist or be incorrect
  - **Mitigation**: Validate editor executable exists, provide common editor presets, allow custom path

## Related Specs
- `cli-installation` - Uses proxy settings for brew installs
- `software-recommendations` - Uses download path and proxy settings
- `environment-export` - Functionality moved to settings page
- `ui-navigation` - Environment tab removed

## Dependencies
- None (builds on existing installation, download, and environment export infrastructure)

