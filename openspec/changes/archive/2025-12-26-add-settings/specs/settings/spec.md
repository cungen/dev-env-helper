## ADDED Requirements

### Requirement: Settings Storage
The system SHALL persist application settings to a JSON file in the OS config directory.

#### Scenario: Settings file creation
- **WHEN** the application starts for the first time
- **THEN** the system creates a settings file at `{config_dir}/dev-env-helper/settings.json`
- **AND** initializes it with default values
- **AND** creates the config directory if it doesn't exist

#### Scenario: Settings file loading
- **WHEN** the application starts
- **THEN** the system loads settings from the settings file
- **AND** if the file doesn't exist, uses default values
- **AND** if the file is invalid JSON, uses default values and logs an error
- **AND** validates loaded settings against the schema

#### Scenario: Settings file saving
- **WHEN** a user changes a setting
- **THEN** the system saves the updated settings to the file
- **AND** validates settings before saving
- **AND** shows an error if validation fails
- **AND** shows a success message when settings are saved

### Requirement: Download Path Setting
The system SHALL allow users to configure where downloaded files are saved.

#### Scenario: Set download path
- **WHEN** a user navigates to the settings page
- **THEN** the system displays a "Download Path" setting
- **AND** shows the current download path (or default if not set)
- **AND** provides a text input and file picker button to select a directory
- **WHEN** the user selects a new download path
- **THEN** the system validates that the path exists and is writable
- **AND** saves the path to settings
- **AND** shows an error if the path is invalid

#### Scenario: Use configured download path
- **WHEN** downloading a file (DMG, GitHub release, etc.)
- **THEN** the system uses the configured download path instead of system default
- **AND** if no path is configured, uses the system Downloads directory
- **AND** creates the directory if it doesn't exist (with user permission)

#### Scenario: Invalid download path
- **WHEN** a user sets a download path that doesn't exist
- **THEN** the system shows a validation error
- **AND** prevents saving the invalid path
- **AND** suggests creating the directory or selecting a different path

#### Scenario: Download path not writable
- **WHEN** a user sets a download path that exists but is not writable
- **THEN** the system shows a validation error
- **AND** prevents saving the invalid path
- **AND** suggests checking permissions or selecting a different path

### Requirement: Default Editor Setting
The system SHALL allow users to configure their preferred code editor for opening files.

#### Scenario: Set default editor
- **WHEN** a user navigates to the settings page
- **THEN** the system displays a "Default Editor" setting
- **AND** shows the current editor path (or "Not set" if not configured)
- **AND** provides a text input and file picker button to select an editor executable
- **AND** provides preset buttons for common editors (VS Code, Sublime, Vim, etc.)
- **WHEN** the user selects a new editor
- **THEN** the system validates that the path exists and is executable
- **AND** saves the path to settings
- **AND** shows an error if the path is invalid

#### Scenario: Use configured editor
- **WHEN** opening a file (config file, etc.)
- **THEN** the system uses the configured editor to open the file
- **AND** if no editor is configured, uses the system default application
- **AND** shows an error if the editor cannot be launched

#### Scenario: Editor preset selection
- **WHEN** a user clicks a preset button for a common editor (e.g., "VS Code")
- **THEN** the system attempts to detect the editor at common installation paths
- **AND** if found, sets the editor path automatically
- **AND** if not found, shows an error and allows manual path entry

#### Scenario: Invalid editor path
- **WHEN** a user sets an editor path that doesn't exist
- **THEN** the system shows a validation error
- **AND** prevents saving the invalid path
- **AND** suggests selecting a different path or using a preset

#### Scenario: Editor path not executable
- **WHEN** a user sets an editor path that exists but is not executable
- **THEN** the system shows a validation error
- **AND** prevents saving the invalid path
- **AND** suggests checking permissions or selecting a different path

### Requirement: Proxy Setting
The system SHALL allow users to configure HTTP/HTTPS or SOCKS proxy settings for network operations.

#### Scenario: Set proxy setting
- **WHEN** a user navigates to the settings page
- **THEN** the system displays a "Proxy" setting section
- **AND** shows a toggle to enable/disable proxy
- **AND** when enabled, shows proxy type selector (HTTP, HTTPS, SOCKS4, SOCKS5)
- **AND** shows a text input for proxy URL (e.g., `http://proxy.example.com:8080`)
- **WHEN** the user enables proxy and enters a proxy URL
- **THEN** the system validates the proxy URL format
- **AND** saves the proxy settings
- **AND** shows an error if the URL format is invalid

#### Scenario: Proxy URL validation
- **WHEN** a user enters a proxy URL
- **THEN** the system validates the URL format matches the selected proxy type
- **AND** HTTP/HTTPS URLs must start with `http://` or `https://`
- **AND** SOCKS URLs must start with `socks4://` or `socks5://`
- **AND** URLs must include host and port
- **AND** shows validation errors for invalid formats

#### Scenario: Apply proxy to brew installs
- **WHEN** installing a tool via Homebrew
- **AND** proxy is enabled in settings
- **THEN** the system sets the appropriate environment variables (`HTTP_PROXY`, `HTTPS_PROXY`, or `ALL_PROXY`)
- **AND** spawns the brew process with these environment variables
- **AND** brew uses the proxy for all network operations

#### Scenario: Apply proxy to downloads
- **WHEN** downloading a file (DMG, GitHub release, etc.)
- **AND** proxy is enabled in settings
- **THEN** the system configures the HTTP client with proxy settings
- **AND** all HTTP requests use the configured proxy
- **AND** proxy type (HTTP/HTTPS/SOCKS) is respected

#### Scenario: Disable proxy
- **WHEN** a user disables proxy in settings
- **THEN** the system saves the disabled state
- **AND** subsequent network operations do not use a proxy
- **AND** environment variables are not set for brew operations
- **AND** HTTP clients are created without proxy configuration

#### Scenario: Proxy connection failure
- **WHEN** a network operation fails due to proxy connection error
- **THEN** the system shows a clear error message indicating proxy failure
- **AND** suggests checking proxy settings
- **AND** allows user to disable proxy or update proxy URL

### Requirement: Settings UI
The system SHALL provide a settings page accessible from the application navigation.

#### Scenario: Access settings page
- **WHEN** a user navigates to the settings page
- **THEN** the system displays all settings sections (Application Settings, Environment Backup & Restore)
- **AND** Application Settings section shows: download path, default editor, proxy
- **AND** Environment Backup & Restore section shows: export and import buttons, current environment status
- **AND** shows current values for each setting
- **AND** provides controls to modify each setting
- **AND** shows a "Save" button to persist changes (for application settings)
- **AND** shows a "Reset to Defaults" button (for application settings)

#### Scenario: Save settings
- **WHEN** a user modifies settings and clicks "Save"
- **THEN** the system validates all settings
- **AND** if validation passes, saves settings to file
- **AND** shows a success message
- **AND** if validation fails, shows error messages for invalid settings
- **AND** prevents saving until all settings are valid

#### Scenario: Reset to defaults
- **WHEN** a user clicks "Reset to Defaults"
- **THEN** the system resets all settings to default values
- **AND** shows a confirmation dialog
- **WHEN** the user confirms
- **THEN** the system saves default values to settings file
- **AND** updates the UI to show default values

#### Scenario: Settings validation feedback
- **WHEN** a user enters an invalid setting value
- **THEN** the system shows a validation error message inline
- **AND** highlights the invalid field
- **AND** prevents saving until the error is fixed
- **AND** provides suggestions for fixing the error

### Requirement: Environment Backup and Restore
The system SHALL provide environment export and import functionality from the settings page.

#### Scenario: Access environment backup/restore
- **WHEN** a user navigates to the settings page
- **THEN** the system displays an "Environment Backup & Restore" section
- **AND** shows export and import buttons
- **AND** displays current environment status (number of installed tools, total tools)

#### Scenario: Export environment from settings
- **WHEN** a user clicks "Export Environment" in the settings page
- **THEN** the system creates a JSON file containing all detected CLI tools
- **AND** includes tool IDs, installation status, detected versions, and executable paths
- **AND** includes metadata (export date, schema version, hostname)
- **AND** includes custom tool templates defined by the user
- **AND** opens a native file save dialog with suggested filename
- **AND** shows a success message with the file location

#### Scenario: Import environment from settings
- **WHEN** a user clicks "Import Environment" in the settings page
- **THEN** the system opens a native file open dialog
- **AND** parses and validates the JSON structure
- **AND** displays a preview of the imported environment
- **AND** allows the user to confirm before applying changes
- **AND** shows a success message when import completes

#### Scenario: Import validation in settings
- **WHEN** the user selects a file that is not a valid environment export
- **THEN** the system displays a validation error
- **AND** explains why the file is invalid (wrong format, corrupted, etc.)
- **AND** prevents the import from proceeding

#### Scenario: Import applies custom templates
- **WHEN** the user confirms import of an environment with custom templates
- **THEN** the system adds any custom templates from the export to the user's configuration
- **AND** merges with existing custom templates without duplicates
- **AND** runs detection for newly imported templates
- **AND** shows a success message

#### Scenario: Import overwrite warning
- **WHEN** importing would overwrite existing custom templates with the same IDs
- **THEN** the system shows a warning indicating which templates would be affected
- **AND** allows the user to choose: merge, skip duplicates, or replace all
- **AND** proceeds according to user selection

