## MODIFIED Requirements

### Requirement: CLI Tool Detection
The system SHALL automatically detect installed CLI tools and display their status using parallel detection for optimal performance.

#### Scenario: Successful detection of installed tools
- **WHEN** the application starts or user triggers a refresh
- **THEN** the system scans PATH for known CLI executables in parallel
- **AND** displays each tool with its installation status (installed/not installed)
- **AND** shows the detected version for installed tools
- **AND** shows the executable path for installed tools (in detail dialog)
- **AND** shows dependency count badge for tools with dependencies (in detail dialog)

#### Scenario: Tool not found on system
- **WHEN** a CLI tool from the built-in list is not found in PATH
- **THEN** the system displays the tool as "Not Installed"
- **AND** shows an "Install" button if installation methods are defined
- **AND** shows installation guidance or documentation link if no install method available

#### Scenario: Manual refresh of tool status
- **WHEN** the user clicks a "Refresh" button
- **THEN** the system re-scans all CLI tools in parallel
- **AND** updates the UI with current detection results
- **AND** displays a loading indicator during scanning
- **AND** completes detection significantly faster than sequential scanning

#### Scenario: Detection failure handled gracefully
- **WHEN** CLI detection encounters an error (permission denied, timeout, etc.)
- **THEN** the system displays the tool in an "Error" state
- **AND** shows an error message with actionable details
- **AND** continues detection of remaining tools in parallel

### Requirement: CLI Tool Display
The system SHALL display CLI tools in a simplified card layout with grid organization, category filtering, and detailed information in a dialog.

#### Scenario: Display simplified CLI tool card in grid layout
- **WHEN** CLI tools are displayed on the page
- **THEN** tools are organized in a responsive grid layout (multiple columns based on screen width)
- **AND** each tool card shows only: tool name, emoji icon, installation status badge (with check icon or background color), and version (if installed)
- **AND** the card is compact and space-efficient to show more items per screen
- **AND** the card is clickable to open a detail dialog
- **AND** the grid adapts to different screen sizes (e.g., 1 column on mobile, 2-3 on tablet, 3-4+ on desktop)

#### Scenario: Display tool detail dialog
- **WHEN** the user clicks on a CLI tool card
- **THEN** the system opens a dialog showing full tool information
- **AND** displays executable path
- **AND** displays detection method showing how the tool is detected (e.g., "detected by which node" where "node" is the executable name)
- **AND** displays configuration file locations and status
- **AND** displays dependencies (if any)
- **AND** displays installation methods with specific commands formatted as they would be run (e.g., "brew install node" for formula, "brew install --cask <name>" for cask, "brew tap <tap> && brew install <formula>" for tap-based installs, or DMG download URL for DMG installs)
- **AND** displays full tool description and metadata
- **AND** allows viewing config file contents from the dialog

#### Scenario: Display detection and installation method details
- **WHEN** the user opens a CLI tool detail dialog
- **THEN** the system displays a "Detection Method" section showing the command used to detect the tool (e.g., "which <executable>")
- **AND** displays an "Installation Methods" section listing all available installation methods
- **AND** for each Homebrew installation method, shows the exact command that would be executed (e.g., "brew install <formula>", "brew install --cask <cask>", or "brew tap <tap> && brew install <formula>" if a tap is required)
- **AND** for DMG installation methods, shows the download URL
- **AND** for script installation methods, shows the script commands that would be executed
- **AND** formats installation methods in a code-like or monospace font for readability

#### Scenario: Category filtering with grid layout
- **WHEN** the user views the CLI tools page
- **THEN** the system displays category filter tabs at the top (using shared CategoryFilter component)
- **AND** includes an "All" option to show all tools
- **AND** when a category is selected, only tools from that category are displayed
- **AND** the active category is visually highlighted
- **AND** the grid layout updates to show filtered results
- **AND** the grid maintains responsive column count based on available tools and screen size

#### Scenario: Tools without category
- **WHEN** a CLI tool template does not specify a category
- **THEN** the system assigns it to a default "Other" category
- **AND** the tool appears in the "All" view
- **AND** the tool appears when "Other" category is selected

### Requirement: CLI Tool Configuration Management
The system SHALL allow users to view and manage configuration files for each CLI tool through the detail dialog.

#### Scenario: View known config file locations
- **WHEN** the user opens a CLI tool detail dialog
- **THEN** the system displays known configuration file locations for that tool
- **AND** shows existence status for each config file (exists/missing)
- **AND** indicates whether the file is readable

#### Scenario: View config file content
- **WHEN** the user clicks on an existing configuration file in the detail dialog
- **THEN** the system displays the file contents in a readable format
- **AND** handles common file types appropriately (text, JSON, YAML, TOML)

#### Scenario: Config file not accessible
- **WHEN** the user attempts to view a config file that is missing or unreadable
- **THEN** the system displays an appropriate error message
- **AND** indicates the reason (file not found, permission denied)

### Requirement: Custom CLI Tool Templates
The system SHALL allow users to extend CLI tool support through a template system with category and emoji support.

#### Scenario: Add custom CLI tool
- **WHEN** the user creates a new CLI tool template
- **THEN** the system prompts for required fields (id, name, executable name, version command)
- **AND** allows optional category selection (from predefined categories or custom)
- **AND** allows optional emoji icon specification
- **AND** allows optional installation methods (brew cask name, DMG URL)
- **AND** allows optional dependency declarations (list of tool IDs)
- **AND** validates dependencies reference existing tool IDs
- **AND** validates no circular dependencies would be created
- **AND** saves the template to the user's custom tools configuration
- **AND** includes the custom tool in subsequent detection scans

#### Scenario: Edit existing custom tool
- **WHEN** the user modifies an existing custom tool template
- **THEN** the system updates the stored template
- **AND** re-runs detection for that tool
- **AND** reflects changes in the UI

#### Scenario: Delete custom tool
- **WHEN** the user removes a custom CLI tool template
- **THEN** the system deletes the template from configuration
- **AND** removes the tool from the UI
- **AND** shows a confirmation dialog before deletion

#### Scenario: Template validation
- **WHEN** the user saves a template with invalid or missing required fields
- **THEN** the system displays validation errors
- **AND** prevents saving until errors are resolved
- **AND** highlights the specific fields requiring correction
- **AND** validates dependency references exist
- **AND** checks for circular dependencies in the dependency chain

### Requirement: Built-in CLI Tool Templates
The system SHALL ship with pre-configured templates for common development CLI tools with categories and emoji icons.

#### Scenario: Default tool templates available
- **WHEN** the application is first launched
- **THEN** the system includes templates for Node.js (node/npm), Python (python/pip), uv, and n
- **AND** each template includes a category assignment
- **AND** each template includes an emoji icon
- **AND** these templates are automatically used for detection
- **AND** users cannot modify built-in templates directly

#### Scenario: Override built-in tool with custom version
- **WHEN** the user creates a custom template with the same id as a built-in tool
- **THEN** the system uses the custom template in place of the built-in
- **AND** indicates the tool is customized in the UI
- **AND** the custom template can override category and emoji

## ADDED Requirements

### Requirement: Shared Category Filter Component
The system SHALL provide a reusable category filter component used by both CLI tools and software recommendations.

#### Scenario: Shared component usage
- **WHEN** the CLI tools page or software recommendations page is displayed
- **THEN** both pages use the same CategoryFilter component from a shared location
- **AND** the component accepts a generic category type
- **AND** the component displays category buttons with emoji and name
- **AND** the component highlights the selected category
- **AND** the component includes an "All" option

#### Scenario: Consistent category UX
- **WHEN** users navigate between CLI tools and software recommendations
- **THEN** the category filter behaves consistently across both pages
- **AND** the visual styling matches between both features
- **AND** keyboard navigation works the same way

