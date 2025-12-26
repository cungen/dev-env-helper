## MODIFIED Requirements

### Requirement: One-Click CLI Installation
The system SHALL allow users to install CLI tools directly from the application interface.

#### Scenario: Install tool via Homebrew
- **WHEN** a user clicks the "Install" button on a tool that supports Homebrew installation
- **AND** the tool has no dependencies or all dependencies are already installed
- **THEN** the system executes `brew install <cask-name>` in the background
- **AND** if proxy is enabled in settings, sets proxy environment variables (`HTTP_PROXY`, `HTTPS_PROXY`, or `ALL_PROXY`) before spawning the brew process
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
- **THEN** the system downloads the DMG file to the configured download path (or system Downloads folder if not configured)
- **AND** if proxy is enabled in settings, uses the configured proxy for the download
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

### Requirement: DMG Download and Open
The system SHALL download DMG files and automatically open them for user installation.

#### Scenario: Download progress tracking
- **WHEN** downloading a DMG file
- **THEN** the system shows download progress (percentage, downloaded bytes, total bytes)
- **AND** if proxy is enabled in settings, uses the configured proxy for the download
- **AND** displays estimated time remaining
- **AND** allows user to cancel the download

#### Scenario: Download completion
- **WHEN** the DMG download completes
- **THEN** the system saves the file to the configured download path (or system Downloads folder if not configured)
- **AND** automatically opens the DMG with Finder
- **AND** displays a message instructing user to drag the app to Applications
- **AND** shows the file path for reference

#### Scenario: Download failure
- **WHEN** the DMG download fails (network error, 404, proxy error, etc.)
- **THEN** the system displays a clear error message
- **AND** indicates the failure reason (including proxy-related errors if applicable)
- **AND** offers to retry the download
- **AND** provides a direct link to the download URL as fallback

#### Scenario: Invalid download URL
- **WHEN** the DMG URL is invalid or returns an error
- **THEN** the system validates the URL before download
- **AND** shows an error if URL is malformed
- **AND** shows an error if server returns non-200 status
- **AND** logs the error for debugging

