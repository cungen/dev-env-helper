## MODIFIED Requirements

### Requirement: Environment Export
The system SHALL allow users to export their CLI environment configuration and installed software to a JSON file.

#### Scenario: Export all detected tools and software
- **WHEN** the user clicks "Export Environment" and selects a destination file
- **THEN** the system creates a JSON file containing all detected CLI tools
- **AND** includes all user-installed software applications
- **AND** includes tool IDs, installation status, detected versions, and executable paths
- **AND** includes software IDs, names, installation status, and installation methods
- **AND** includes metadata (export date, schema version, hostname)
- **AND** includes custom tool templates defined by the user
- **AND** shows a success message with the file location

#### Scenario: Export with custom file selection
- **WHEN** the user initiates export
- **THEN** the system opens a native file save dialog
- **AND** suggests a default filename with timestamp
- **AND** allows the user to choose the destination directory

#### Scenario: Export includes custom templates
- **WHEN** the user has defined custom CLI tool templates
- **THEN** the exported JSON includes all custom templates
- **AND** allows these templates to be restored on import

#### Scenario: Export includes installed software
- **WHEN** the user has installed software applications (via Homebrew casks or GitHub releases)
- **THEN** the exported JSON includes all installed software
- **AND** includes software metadata (name, description, category, emoji, install methods)
- **AND** includes installation status for each software item
- **AND** allows software to be restored on import

#### Scenario: Export failure handling
- **WHEN** the export operation fails (no write permission, disk full, etc.)
- **THEN** the system displays a clear error message
- **AND** explains the reason for failure
- **AND** suggests corrective actions

### Requirement: Environment Import
The system SHALL allow users to import a previously exported environment configuration.

#### Scenario: Import from exported file (no auto-installation)
- **WHEN** the user selects a valid environment export file
- **THEN** the system opens a native file open dialog
- **AND** parses and validates the JSON structure
- **AND** displays a preview of the imported environment
- **AND** allows the user to confirm before applying changes
- **AND** after successful import, navigates to the restore page
- **AND** the restore page displays all tools and software from the imported environment
- **AND** does NOT automatically install any tools or software
- **AND** users can view which tools and software are already installed on their system
- **AND** users can manually choose which tools and software to install from the restore page

#### Scenario: Import validation
- **WHEN** the user selects a file that is not a valid environment export
- **THEN** the system displays a validation error
- **AND** explains why the file is invalid (wrong format, corrupted, etc.)
- **AND** prevents the import from proceeding
- **AND** does not navigate to the restore page

#### Scenario: Import applies custom templates (no auto-installation)
- **WHEN** the user confirms import of an environment with custom templates
- **THEN** the system adds any custom templates from the export to the user's configuration
- **AND** merges with existing custom templates without duplicates
- **AND** runs detection for newly imported templates
- **AND** navigates to the restore page with imported tools and software displayed
- **AND** does NOT automatically install any tools or software
- **AND** users can manually choose which tools and software to install from the restore page

#### Scenario: Import handles software data (no auto-installation)
- **WHEN** the user imports an environment file containing software data
- **THEN** the system validates the software data structure
- **AND** includes software in the restore page display
- **AND** does NOT automatically install any software
- **AND** users can manually choose which software to install from the restore page

#### Scenario: Import overwrite warning (no auto-installation)
- **WHEN** importing would overwrite existing custom templates with the same IDs
- **THEN** the system shows a warning indicating which templates would be affected
- **AND** allows the user to choose: merge, skip duplicates, or replace all
- **AND** proceeds according to user selection
- **AND** navigates to restore page after successful import
- **AND** does NOT automatically install any tools or software
- **AND** users can manually choose which tools and software to install from the restore page

#### Scenario: Schema version compatibility
- **WHEN** the user imports an export with a different schema version
- **THEN** the system checks for compatibility
- **AND** if compatible, migrates the data to current format
- **AND** if incompatible, displays an error explaining the version mismatch
- **AND** suggests using a newer version of the application if available
- **AND** does not navigate to restore page if import fails

#### Scenario: Backward compatibility with exports without software
- **WHEN** the user imports an older export file that doesn't include software data
- **THEN** the system handles the missing software field gracefully
- **AND** displays only tools on the restore page
- **AND** does not show an error for missing software field
