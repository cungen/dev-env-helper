# Tasks: Add Settings for Application Configuration

## Implementation Status: ✅ Complete

All requirements from the proposal have been implemented:

- [x] Settings page accessible from navigation
- [x] Settings storage system (JSON file in config directory)
- [x] Download path setting with validation
- [x] Default editor setting with presets and validation
- [x] Proxy setting (HTTP/HTTPS/SOCKS) with validation
- [x] Environment backup and restore section in settings page
- [x] Download operations use configured download path
- [x] Brew installation uses proxy settings when configured
- [x] Download operations use proxy settings when configured
- [x] File opening operations use configured default editor
- [x] Environment export/import moved from separate tab to Settings page
- [x] "Environment" tab removed from navigation

## Implementation Details

### Backend (Rust)
- ✅ `src-tauri/src/settings/storage.rs` - Settings file storage and loading
- ✅ `src-tauri/src/settings/validation.rs` - Settings validation (download path, editor, proxy)
- ✅ `src-tauri/src/settings/proxy.rs` - Proxy configuration for HTTP clients and brew
- ✅ `src-tauri/src/settings/editor.rs` - File opening with configured editor
- ✅ `src-tauri/src/lib.rs` - Tauri commands: `get_settings`, `save_settings`, `reset_settings`, `open_file_with_editor`
- ✅ `src-tauri/src/installation/brew.rs` - Uses proxy settings for brew installs
- ✅ `src-tauri/src/installation/download.rs` - Uses download path and proxy settings

### Frontend (React/TypeScript)
- ✅ `src/features/settings/components/SettingsPage.tsx` - Main settings page
- ✅ `src/features/settings/components/DownloadPathSetting.tsx` - Download path configuration
- ✅ `src/features/settings/components/DefaultEditorSetting.tsx` - Editor configuration with presets
- ✅ `src/features/settings/components/ProxySetting.tsx` - Proxy configuration
- ✅ `src/features/settings/components/EnvironmentBackupSection.tsx` - Environment export/import
- ✅ `src/features/settings/api/settings-commands.ts` - Frontend API for settings
- ✅ `src/features/settings/hooks/useSettings.ts` - Settings hook
- ✅ `src/features/settings/types/settings.ts` - TypeScript types
- ✅ `src/App.tsx` - Settings tab added to navigation, Environment tab removed

## Verification

All spec requirements have been verified:
- ✅ Settings storage persists to JSON file
- ✅ Settings validation works for all fields
- ✅ Download path is used in download operations
- ✅ Proxy settings are applied to brew and HTTP downloads
- ✅ Default editor is used for file opening
- ✅ Environment backup/restore is accessible from settings
- ✅ Navigation no longer includes Environment tab
