## ADDED Requirements

### Requirement: One-Click CLI Installation
The system SHALL allow users to install CLI tools directly from the application interface.

#### Scenario: Install tool via Homebrew
- **WHEN** a user clicks the "Install" button on a tool that supports Homebrew installation
- **AND** the tool has no dependencies or all dependencies are already installed
- **THEN** the system executes `brew install <cask-name>` in the background
- **AND** displays real-time installation output in a terminal-like panel
- **AND** shows a loading state during installation
- **AND** displays success message when installation completes
- **AND** automatically refreshes tool detection to show the newly installed tool

#### Scenario: Install tool with dependencies
- **WHEN** a user clicks the "Install" button on a tool that has dependencies
- **THEN** the system resolves the full dependency chain
- **AND** displays a preview dialog showing all tools that will be installed
- **AND** highlights which tools are dependencies and which is the target tool
- **AND** shows installation order (dependencies first, then target)
- **AND** waits for user confirmation before proceeding
- **WHEN** user confirms the installation
- **THEN** the system installs each dependency in order
- **AND** displays progress for each tool being installed
- **AND** installs the target tool after all dependencies complete
- **AND** shows success message when all installations complete
- **AND** automatically refreshes tool detection to show all newly installed tools

#### Scenario: Install tool via DMG download
- **WHEN** a user clicks the "Install" button on a tool that offers DMG installation
- **THEN** the system downloads the DMG file to the Downloads folder
- **AND** displays download progress (percentage, file size)
- **AND** automatically opens the DMG with Finder when download completes
- **AND** displays installation instructions (drag to Applications folder)
- **AND** provides a button to re-open the DMG if needed

#### Scenario: Multiple installation methods available
- **WHEN** a tool supports both Homebrew and DMG installation
- **THEN** the system shows a dropdown or radio buttons to select the installation method
- **AND** defaults to Homebrew if available (most convenient)
- **AND** allows user to switch to DMG if preferred

#### Scenario: Installation in progress
- **WHEN** an installation is currently running
- **THEN** the system disables the install button for that tool
- **AND** shows a progress indicator
- **AND** prevents starting another installation until current one completes
- **AND** when installing with dependencies, shows overall progress (e.g., "Installing dependency 1 of 3")
- **AND** displays which tool is currently being installed

#### Scenario: Installation failure
- **WHEN** an installation fails (brew error, download failure, etc.)
- **THEN** the system displays a clear error message
- **AND** shows the relevant error output from the installation command
- **AND** suggests corrective actions when possible
- **AND** allows user to retry the installation

#### Scenario: Dependency installation failure
- **WHEN** installing a tool with dependencies
- **AND** a dependency installation fails
- **THEN** the system stops the installation process
- **AND** displays an error message indicating which dependency failed
- **AND** shows the error output from the failed installation
- **AND** does not attempt to install tools that depend on the failed dependency
- **AND** allows user to retry the failed dependency
- **AND** suggests manual installation or alternative solutions

#### Scenario: Partial dependency installation success
- **WHEN** installing a tool with multiple dependencies
- **AND** some dependencies install successfully but one fails
- **THEN** the system shows which dependencies succeeded and which failed
- **AND** does not roll back successfully installed dependencies
- **AND** allows user to retry only the failed dependency
- **AND** shows current state in the UI (some dependencies installed, target not installed)

### Requirement: Homebrew Installation Progress
The system SHALL stream real-time output from Homebrew installation commands.

#### Scenario: Real-time output streaming
- **WHEN** a brew installation is running
- **THEN** the system emits progress events with each line of brew output
- **AND** the frontend displays output lines in a terminal-like panel
- **AND** the panel auto-scrolls to show the latest output
- **AND** output lines are timestamped

#### Scenario: Handle long-running installations
- **WHEN** a brew installation takes a long time (downloading large packages, compiling)
- **THEN** the system continues streaming output without timeout
- **AND** keeps the connection alive
- **AND** shows "Installation in progress..." message to user

#### Scenario: Brew not installed
- **WHEN** the user attempts to install via Homebrew but brew is not installed on the system
- **THEN** the system detects this before attempting installation
- **AND** displays a helpful error message
- **AND** offers to open the Homebrew installation website
- **AND** suggests the DMG installation method as an alternative

### Requirement: DMG Download and Open
The system SHALL download DMG files and automatically open them for user installation.

#### Scenario: Download progress tracking
- **WHEN** downloading a DMG file
- **THEN** the system shows download progress (percentage, downloaded bytes, total bytes)
- **AND** displays estimated time remaining
- **AND** allows user to cancel the download

#### Scenario: Download completion
- **WHEN** the DMG download completes
- **THEN** the system saves the file to the Downloads folder
- **AND** automatically opens the DMG with Finder
- **AND** displays a message instructing user to drag the app to Applications
- **AND** shows the file path for reference

#### Scenario: Download failure
- **WHEN** the DMG download fails (network error, 404, etc.)
- **THEN** the system displays a clear error message
- **AND** indicates the failure reason
- **AND** offers to retry the download
- **AND** provides a direct link to the download URL as fallback

#### Scenario: Invalid download URL
- **WHEN** the DMG URL is invalid or returns an error
- **THEN** the system validates the URL before download
- **AND** shows an error if URL is malformed
- **AND** shows an error if server returns non-200 status
- **AND** logs the error for debugging

### Requirement: Installation Method Configuration
The system SHALL support installation methods in CLI tool templates.

#### Scenario: Built-in tools include installation methods
- **WHEN** viewing a built-in CLI tool template (node, python, uv, n)
- **THEN** the template includes installation methods (brew cask name or DMG URL)
- **AND** the template includes dependency declarations where applicable
- **AND** the install button is available when the tool is not installed
- **AND** the installation method is used when user clicks install

#### Scenario: Custom tools with installation methods
- **WHEN** a user creates a custom CLI tool template
- **THEN** the user can optionally specify installation methods
- **AND** user can provide brew cask name for brew installation
- **AND** user can provide DMG URL for GUI app installation
- **AND** user can provide dependency declarations (list of tool IDs that must be installed first)
- **AND** user can provide multiple installation methods with preference order

#### Scenario: Tools without installation methods
- **WHEN** a tool template has no installation methods defined
- **THEN** the system shows "Manual Installation Required" message
- **AND** displays a link to the tool's official documentation
- **AND** does not show an install button

#### Scenario: Installation method validation
- **WHEN** saving a template with installation methods
- **THEN** the system validates brew cask names (alphanumeric, hyphens)
- **THEN** the system validates DMG URLs (must be HTTPS, end in .dmg)
- **AND** shows validation errors for invalid methods
- **AND** prevents saving until validation passes

### Requirement: Post-Installation Detection
The system SHALL automatically detect tools after successful installation.

#### Scenario: Auto-refresh after brew install
- **WHEN** a brew installation completes successfully
- **THEN** the system automatically re-runs CLI tool detection
- **AND** updates the tool's status from "Not Installed" to "Installed"
- **AND** displays the detected version
- **AND** shows a success notification

#### Scenario: Auto-refresh after DMG install prompt
- **WHEN** a DMG is opened for installation
- **THEN** the system shows a "Refresh" button to verify installation
- **AND** the system prompts user to click Refresh after completing manual install
- **AND** when user clicks Refresh, the system re-runs detection
- **AND** updates the tool's status if the user completed the installation

#### Scenario: Installation completed but tool not found
- **WHEN** an installation completes but the tool is still not detected in PATH
- **THEN** the system shows a warning message
- **AND** suggests the user may need to restart their terminal
- **AND** offers to open PATH documentation
- **AND** allows manual PATH configuration
