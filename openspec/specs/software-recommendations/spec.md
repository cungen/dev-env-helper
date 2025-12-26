# software-recommendations Specification

## Purpose
TBD - created by archiving change add-software-recommendations. Update Purpose after archive.
## Requirements
### Requirement: Software Recommendations Display
The system SHALL display recommended software in an app store-like grid layout with categories, emoji icons, and descriptions.

#### Scenario: Display software recommendations page
- **WHEN** the user navigates to the Software Recommendations page
- **THEN** the system displays a grid layout of software cards
- **AND** each card shows an emoji icon, software name, description, and category
- **AND** cards are organized in a responsive grid (multiple columns based on screen width)
- **AND** the page shows a loading state while fetching software data

#### Scenario: Display software card information
- **WHEN** a software recommendation is displayed
- **THEN** the card shows a large emoji icon (48px or larger) as the visual identifier
- **AND** displays the software name as a heading
- **AND** displays a description (2-3 lines, truncated if longer)
- **AND** displays a category badge indicating the software category
- **AND** shows installation method indicators when available

#### Scenario: Category filtering
- **WHEN** the user views the software recommendations page
- **THEN** the system displays category filter tabs at the top
- **AND** includes an "All" option to show all software
- **AND** when a category is selected, only software from that category is displayed
- **AND** the active category is visually highlighted
- **AND** the grid updates to show filtered results

#### Scenario: Empty state handling
- **WHEN** no software recommendations are available or configuration file is missing
- **THEN** the system displays a helpful empty state message
- **AND** provides guidance on how to configure software recommendations
- **AND** shows a link to documentation or example configuration if available

### Requirement: Software Configuration Management
The system SHALL load software recommendations from a JSON configuration file.

#### Scenario: Load software configuration
- **WHEN** the application starts or user navigates to software recommendations
- **THEN** the system loads `software-recommendations.json` from the app configuration directory
- **AND** parses the JSON structure containing categories and software entries
- **AND** displays the software in the UI
- **AND** handles missing file gracefully (shows empty state or default configuration)

#### Scenario: Configuration file structure
- **WHEN** loading the configuration file
- **THEN** the system expects a JSON structure with `categories` and `software` arrays
- **AND** each category entry includes: id, name, and emoji
- **AND** each software entry includes: id, name, description, category reference, emoji, and installMethods array
- **AND** validates the structure and shows clear error messages for invalid JSON

#### Scenario: Configuration file errors
- **WHEN** the configuration file contains invalid JSON or missing required fields
- **THEN** the system displays a clear error message
- **AND** shows which field or structure is invalid
- **AND** falls back to default configuration if available
- **AND** continues to function with available valid entries

### Requirement: Homebrew Installation Integration
The system SHALL allow users to install recommended software via Homebrew when supported.

#### Scenario: Install software via Homebrew
- **WHEN** a software recommendation has a Homebrew install method configured
- **THEN** the system displays an "Install" button on the software card
- **AND** shows a Homebrew method indicator (badge or icon)
- **AND** when the user clicks Install, the system executes the brew installation using existing installation infrastructure
- **AND** displays installation progress in real-time
- **AND** shows success message when installation completes
- **AND** automatically refreshes to show updated installation status

#### Scenario: Homebrew installation method display
- **WHEN** a software recommendation supports Homebrew installation
- **THEN** the system shows the installation method indicator (e.g., "Brew" badge)
- **AND** the Install button is clearly labeled
- **AND** the brew cask/formula name is visible to the user (in tooltip or button label)

#### Scenario: Homebrew installation with dependencies
- **WHEN** installing software via Homebrew that has dependencies
- **THEN** the system resolves and displays the dependency chain
- **AND** shows a preview of what will be installed
- **AND** installs dependencies first, then the target software
- **AND** displays progress for each installation step

### Requirement: GitHub Release Detection and Download
The system SHALL detect and download the latest release from GitHub repositories for recommended software.

#### Scenario: Fetch GitHub latest release
- **WHEN** a software recommendation has a GitHub install method configured
- **THEN** the system fetches the latest release from GitHub API using the repository owner and name
- **AND** extracts the release version (tag name)
- **AND** finds the download asset matching the configured pattern
- **AND** displays the version information on the software card
- **AND** shows a "Download" button with the release version (MODIFIED: Only for GitHub + Homebrew software, removed for GitHub-only)

#### Scenario: Display GitHub release information
- **WHEN** GitHub release data is successfully fetched
- **THEN** the system displays the latest version tag (e.g., "v1.2.3")
- **AND** shows the release name if available
- **AND** displays a Download button that is enabled (MODIFIED: Only for GitHub + Homebrew software)
- **AND** shows loading state while fetching release data

#### Scenario: Download GitHub release asset
- **WHEN** the user clicks the Download button for a GitHub release (MODIFIED: Only exists for GitHub + Homebrew software)
- **THEN** the system downloads the matching asset file
- **AND** displays download progress (percentage, file size)
- **AND** saves the file to the Downloads folder
- **AND** automatically opens the downloaded file (DMG, ZIP, etc.) when complete
- **AND** shows success message with file location

#### Scenario: GitHub API error handling
- **WHEN** fetching GitHub release fails (network error, 404, rate limit)
- **THEN** the system displays an appropriate error message
- **AND** if cached release data is available, shows cached version with a notice
- **AND** provides a retry option
- **AND** for 404 errors, suggests the repository URL may be incorrect
- **AND** for rate limiting, shows cached data and suggests waiting

#### Scenario: GitHub asset pattern matching
- **WHEN** fetching a GitHub release
- **THEN** the system matches assets using the configured regex pattern
- **AND** if pattern matches multiple assets, uses the first match
- **AND** if no asset matches the pattern, shows an error message
- **AND** suggests the pattern may need adjustment

#### Scenario: GitHub release caching
- **WHEN** fetching GitHub release information
- **THEN** the system caches the response with a timestamp
- **AND** uses cached data if available and less than 1 hour old
- **AND** refreshes cache when user explicitly requests or cache is stale
- **AND** shows cached data immediately while fetching fresh data in background

### Requirement: GitHub Release Page Link
The system SHALL provide a clickable link to the GitHub releases page for software distributed via GitHub.

#### Scenario: Display GitHub link in card header
- **WHEN** a software recommendation has a GitHub install method configured
- **THEN** the system displays a GitHub icon link in the card header next to the software name
- **AND** the link opens the repository's releases page (https://github.com/{owner}/{repo}/releases)
- **AND** the icon is visually distinct and recognizable as GitHub branding
- **AND** hovering over the icon shows a tooltip "View on GitHub"

#### Scenario: GitHub link for GitHub-only software
- **WHEN** a software recommendation has ONLY a GitHub install method (no Homebrew)
- **THEN** the system displays the GitHub icon link in the card header
- **AND** does NOT display a Download button in the card footer
- **AND** displays "Manual download required" or similar message in footer area
- **AND** the GitHub link is the primary call-to-action for this software

#### Scenario: GitHub link for multi-method software
- **WHEN** a software recommendation has BOTH Homebrew and GitHub install methods
- **THEN** the system does NOT display the GitHub icon link (prioritizes Homebrew installation)
- **AND** displays only the Install button for Homebrew
- **AND** does NOT display the Download button for GitHub

### Requirement: Multiple Installation Methods
The system SHALL support software with multiple installation methods and allow users to choose.

#### Scenario: Software with multiple install methods (MODIFIED)
- **WHEN** a software recommendation has both Homebrew and GitHub install methods
- **THEN** the system displays only the Homebrew method indicator
- **AND** shows only the Install button (prioritizes Homebrew)
- **AND** does NOT display the GitHub link or Download button
- **AND** Homebrew is the recommended installation method

#### Scenario: Software with single Homebrew install method
- **WHEN** a software recommendation has only a Homebrew install method
- **THEN** the system displays the Install button
- **AND** shows the Homebrew method indicator
- **AND** button is clearly labeled "Install"

#### Scenario: Software with single GitHub install method (MODIFIED)
- **WHEN** a software recommendation has only a GitHub install method
- **THEN** the system displays a GitHub icon link in the card header
- **AND** does NOT display a Download button
- **AND** displays "Manual download from GitHub" message in footer
- **AND** the GitHub link is the primary call-to-action

#### Scenario: Software without install methods
- **WHEN** a software recommendation has no configured install methods
- **THEN** the system shows "Manual Installation Required" message
- **AND** displays a link to the software's website or documentation if available
- **AND** does not show Install or Download buttons

### Requirement: Navigation Integration
The system SHALL integrate the software recommendations page into the main application navigation.

#### Scenario: Software recommendations tab in sidebar
- **WHEN** the application launches
- **THEN** the sidebar displays a "Software" or "Recommended" tab
- **AND** the tab has an appropriate icon (e.g., grid or store icon)
- **AND** clicking the tab navigates to the software recommendations page
- **AND** the tab is visually highlighted when active

#### Scenario: Keyboard navigation to software page
- **WHEN** the user uses keyboard shortcuts for navigation
- **THEN** the software recommendations page is accessible via keyboard shortcut
- **AND** maintains consistent keyboard navigation patterns with other pages

### Requirement: Installed Software Detection
The system SHALL detect if recommended software is already installed on the user's system and display the installation status.

#### Scenario: Detect installed Homebrew casks
- **WHEN** the software recommendations page loads
- **THEN** the system checks installed Homebrew casks using `brew list --cask`
- **AND** for each software with a brew install method, checks if the cask name is in the installed list
- **AND** marks the software as installed if the cask is found
- **AND** displays an "Installed" badge on the software card
- **AND** disables or hides the install button for installed software

#### Scenario: Detect installed applications from GitHub releases
- **WHEN** the software recommendations page loads
- **AND** a software has a GitHub install method
- **THEN** the system checks if the application exists in the `/Applications` folder (macOS)
- **AND** matches the application name (case-insensitive) to determine if installed
- **AND** marks the software as installed if the application is found
- **AND** displays an "Installed" badge on the software card
- **AND** disables or hides the download button for installed software

#### Scenario: Display installed software status
- **WHEN** a software recommendation is marked as installed
- **THEN** the software card displays an "Installed" badge or status indicator
- **AND** the install/download button is disabled or replaced with "Installed" text
- **AND** the card may show a different visual style (e.g., muted colors) to indicate installed state
- **AND** the installation method indicator (if shown) remains visible

#### Scenario: Refresh installation status
- **WHEN** the user clicks a refresh button or the page is reloaded
- **THEN** the system re-runs installation detection
- **AND** updates the UI with current installation status
- **AND** shows a loading indicator during detection
- **AND** automatically updates status after successful installation via the app

#### Scenario: Detection handles errors gracefully
- **WHEN** installation detection encounters an error (brew not available, permission denied, etc.)
- **THEN** the system displays software as "Unknown" status
- **AND** shows install buttons normally (allows user to attempt installation)
- **AND** continues detection for remaining software
- **AND** logs errors for debugging without blocking the UI

#### Scenario: Software with multiple install methods
- **WHEN** a software has both Homebrew and GitHub install methods
- **THEN** the system checks both detection methods
- **AND** marks software as installed if either method indicates installation
- **AND** shows appropriate status based on which method detected the installation

