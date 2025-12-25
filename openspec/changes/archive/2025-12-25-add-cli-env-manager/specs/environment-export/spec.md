## ADDED Requirements

### Requirement: Environment Export
The system SHALL allow users to export their CLI environment configuration to a JSON file.

#### Scenario: Export all detected tools
- **WHEN** the user clicks "Export Environment" and selects a destination file
- **THEN** the system creates a JSON file containing all detected CLI tools
- **AND** includes tool IDs, installation status, detected versions, and executable paths
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

#### Scenario: Export failure handling
- **WHEN** the export operation fails (no write permission, disk full, etc.)
- **THEN** the system displays a clear error message
- **AND** explains the reason for failure
- **AND** suggests corrective actions

### Requirement: Environment Import
The system SHALL allow users to import a previously exported environment configuration.

#### Scenario: Import from exported file
- **WHEN** the user selects a valid environment export file
- **THEN** the system opens a native file open dialog
- **AND** parses and validates the JSON structure
- **AND** displays a preview of the imported environment
- **AND** allows the user to confirm before applying changes

#### Scenario: Import validation
- **WHEN** the user selects a file that is not a valid environment export
- **THEN** the system displays a validation error
- **AND** explains why the file is invalid (wrong format, corrupted, etc.)
- **AND** prevents the import from proceeding

#### Scenario: Import applies custom templates
- **WHEN** the user confirms import of an environment with custom templates
- **THEN** the system adds any custom templates from the export to the user's configuration
- **AND** merges with existing custom templates without duplicates
- **AND** runs detection for newly imported templates

#### Scenario: Import overwrite warning
- **WHEN** importing would overwrite existing custom templates with the same IDs
- **THEN** the system shows a warning indicating which templates would be affected
- **AND** allows the user to choose: merge, skip duplicates, or replace all
- **AND** proceeds according to user selection

#### Scenario: Schema version compatibility
- **WHEN** the user imports an export with a different schema version
- **THEN** the system checks for compatibility
- **AND** if compatible, migrates the data to current format
- **AND** if incompatible, displays an error explaining the version mismatch
- **AND** suggests using a newer version of the application if available
