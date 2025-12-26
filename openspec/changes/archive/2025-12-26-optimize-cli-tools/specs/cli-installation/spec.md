## MODIFIED Requirements

### Requirement: One-Click CLI Installation
The system SHALL allow users to install CLI tools directly from the application interface with real-time progress feedback.

#### Scenario: Install tool via Homebrew
- **WHEN** a user clicks the "Install" button on a tool that supports Homebrew installation
- **AND** the tool has no dependencies or all dependencies are already installed
- **THEN** the system executes `brew install <cask-name>` in the background
- **AND** if proxy is enabled in settings, sets proxy environment variables (`HTTP_PROXY`, `HTTPS_PROXY`, or `ALL_PROXY`) before spawning the brew process
- **AND** displays a progress dialog with real-time installation output
- **AND** shows scrollable log output in the dialog
- **AND** shows current tool name and progress indicator
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
- **AND** displays progress dialog showing current tool being installed
- **AND** shows scrollable log output for each installation step
- **AND** updates progress indicator for overall installation (e.g., "Installing dependency 1 of 3")
- **AND** installs the target tool after all dependencies complete
- **AND** shows success message when all installations complete
- **AND** automatically refreshes tool detection to show all newly installed tools

#### Scenario: Install tool via DMG download
- **WHEN** a user clicks the "Install" button on a tool that offers DMG installation
- **THEN** the system downloads the DMG file to the configured download path (or system Downloads folder if not configured)
- **AND** if proxy is enabled in settings, uses the configured proxy for the download
- **AND** displays progress dialog with download progress (percentage, file size)
- **AND** shows scrollable log output with download status
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
- **THEN** the system displays a progress dialog with real-time output
- **AND** disables the install button for that tool
- **AND** shows a progress indicator in the dialog
- **AND** prevents starting another installation until current one completes
- **AND** when installing with dependencies, shows overall progress (e.g., "Installing dependency 1 of 3")
- **AND** displays which tool is currently being installed in the dialog header

#### Scenario: Installation failure
- **WHEN** an installation fails (brew error, download failure, etc.)
- **THEN** the system displays error information in the progress dialog
- **AND** highlights error lines in the log output
- **AND** shows a clear error message at the top of the dialog
- **AND** shows the relevant error output from the installation command
- **AND** suggests corrective actions when possible
- **AND** allows user to retry the installation from the dialog
- **AND** allows user to close the dialog to return to the tools list

#### Scenario: Dependency installation failure
- **WHEN** installing a tool with dependencies
- **AND** a dependency installation fails
- **THEN** the system stops the installation process
- **AND** displays error information in the progress dialog
- **AND** highlights which dependency failed in the log output
- **AND** shows the error output from the failed installation
- **AND** does not attempt to install tools that depend on the failed dependency
- **AND** allows user to retry the failed dependency from the dialog
- **AND** suggests manual installation or alternative solutions

#### Scenario: Partial dependency installation success
- **WHEN** installing a tool with multiple dependencies
- **AND** some dependencies install successfully but one fails
- **THEN** the system shows which dependencies succeeded and which failed in the progress dialog
- **AND** highlights successful and failed installations in the log output
- **AND** does not roll back successfully installed dependencies
- **AND** allows user to retry only the failed dependency from the dialog
- **AND** shows current state in the UI (some dependencies installed, target not installed)

### Requirement: Homebrew Installation Progress
The system SHALL stream real-time output from Homebrew installation commands and display it in a progress dialog.

#### Scenario: Real-time output streaming
- **WHEN** a brew installation is running
- **THEN** the system emits progress events with each line of brew output
- **AND** the frontend displays output lines in a scrollable log panel within the progress dialog
- **AND** the panel auto-scrolls to show the latest output
- **AND** output lines are timestamped
- **AND** the dialog remains open during the entire installation

#### Scenario: Handle long-running installations
- **WHEN** a brew installation takes a long time (downloading large packages, compiling)
- **THEN** the system continues streaming output without timeout
- **AND** keeps the connection alive
- **AND** shows "Installation in progress..." message in the dialog
- **AND** updates progress indicator periodically

#### Scenario: Brew not installed
- **WHEN** the user attempts to install via Homebrew but brew is not installed on the system
- **THEN** the system detects this before attempting installation
- **AND** displays a helpful error message in the progress dialog
- **AND** offers to open the Homebrew installation website
- **AND** suggests the DMG installation method as an alternative

### Requirement: DMG Download and Open
The system SHALL download DMG files and automatically open them for user installation, with progress shown in a dialog.

#### Scenario: Download progress tracking
- **WHEN** downloading a DMG file
- **THEN** the system shows download progress in a progress dialog
- **AND** displays percentage, downloaded bytes, and total bytes
- **AND** if proxy is enabled in settings, uses the configured proxy for the download
- **AND** displays estimated time remaining
- **AND** shows download status in scrollable log output
- **AND** allows user to cancel the download from the dialog

#### Scenario: Download completion
- **WHEN** the DMG download completes
- **THEN** the system saves the file to the configured download path (or system Downloads folder if not configured)
- **AND** automatically opens the DMG with Finder
- **AND** displays a message in the dialog instructing user to drag the app to Applications
- **AND** shows the file path for reference in the dialog
- **AND** allows user to close the dialog after completion

#### Scenario: Download failure
- **WHEN** the DMG download fails (network error, 404, proxy error, etc.)
- **THEN** the system displays error information in the progress dialog
- **AND** highlights error messages in the log output
- **AND** indicates the failure reason (including proxy-related errors if applicable)
- **AND** offers to retry the download from the dialog
- **AND** provides a direct link to the download URL as fallback

#### Scenario: Invalid download URL
- **WHEN** the DMG URL is invalid or returns an error
- **THEN** the system validates the URL before download
- **AND** shows an error in the progress dialog if URL is malformed
- **AND** shows an error if server returns non-200 status
- **AND** logs the error for debugging in the dialog output

## ADDED Requirements

### Requirement: Installation Progress Dialog
The system SHALL display a modal dialog with real-time installation progress and log output.

#### Scenario: Display progress dialog during installation
- **WHEN** a CLI tool installation begins
- **THEN** the system opens a modal dialog
- **AND** displays the current tool name in the dialog header
- **AND** shows a progress indicator (spinner or progress bar)
- **AND** displays a scrollable log output area
- **AND** auto-scrolls to show the latest log entries
- **AND** allows user to manually scroll to view earlier output

#### Scenario: Real-time log output
- **WHEN** installation commands produce output
- **THEN** the system appends each line to the log output in the dialog
- **AND** formats output with appropriate styling (stdout vs stderr)
- **AND** highlights error lines with distinct styling
- **AND** timestamps each log entry
- **AND** maintains scroll position or auto-scrolls to bottom

#### Scenario: Installation completion in dialog
- **WHEN** an installation completes successfully
- **THEN** the dialog shows a success message
- **AND** displays "Installation completed successfully" in the log
- **AND** shows a close button to dismiss the dialog
- **AND** automatically refreshes tool detection after dialog closes

#### Scenario: Installation error in dialog
- **WHEN** an installation fails
- **THEN** the dialog highlights error messages in the log
- **AND** displays error summary at the top of the dialog
- **AND** shows retry button to attempt installation again
- **AND** shows close button to dismiss and return to tools list
- **AND** error information remains visible in the log output

#### Scenario: Cancel installation
- **WHEN** the user clicks cancel or close during installation
- **THEN** the system attempts to gracefully stop the installation process
- **AND** shows a confirmation if installation is in progress
- **AND** closes the dialog after cancellation
- **AND** updates UI to reflect cancelled state

