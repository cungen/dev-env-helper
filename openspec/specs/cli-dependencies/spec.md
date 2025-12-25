# cli-dependencies Specification

## Purpose
TBD - created by archiving change add-cli-env-manager. Update Purpose after archive.
## Requirements
### Requirement: CLI Tool Dependencies
The system SHALL support declaring dependencies between CLI tools and automatically resolving installation order.

#### Scenario: Tool declares dependencies
- **WHEN** a CLI tool template includes a `dependencies` array
- **THEN** the system validates that each dependency references an existing tool ID
- **AND** stores the dependency relationship for use during installation

#### Scenario: Install tool with dependencies
- **WHEN** a user clicks "Install" on a tool that has dependencies
- **THEN** the system resolves all required dependencies (including transitive dependencies)
- **AND** displays a preview showing all tools that will be installed
- **AND** highlights which tools are dependencies vs the target tool
- **AND** requests user confirmation before proceeding
- **AND** installs dependencies in topological order before installing the target tool

#### Scenario: Dependency already installed
- **WHEN** resolving installation order for a tool
- **AND** one or more dependencies are already installed
- **THEN** the system skips already-installed dependencies
- **AND** only queues tools that need to be installed
- **AND** shows "Already installed" status for skipped dependencies in the preview

#### Scenario: Circular dependency detection
- **WHEN** a user creates or modifies a tool template
- **AND** the dependencies would create a circular reference (A depends on B, B depends on A)
- **THEN** the system detects the circular dependency
- **AND** displays a validation error indicating which tools form the cycle
- **AND** prevents saving the template until the circular dependency is resolved

#### Scenario: Dependency not available
- **WHEN** a tool template references a dependency that does not exist
- **THEN** the system displays a validation error
- **AND** indicates which tool ID is not found
- **AND** suggests available tool IDs
- **AND** prevents saving until all dependencies reference valid tools

#### Scenario: Transitive dependency resolution
- **WHEN** tool A depends on tool B, and tool B depends on tool C
- **THEN** the system resolves the full dependency chain
- **AND** installs C, then B, then A in correct order
- **AND** displays the full dependency tree to the user

#### Scenario: Dependency installation failure
- **WHEN** a dependency installation fails during batch installation
- **THEN** the system stops the installation process
- **AND** displays an error message indicating which dependency failed
- **AND** does not attempt to install dependent tools
- **AND** allows user to retry or cancel

### Requirement: Dependency Visualization
The system SHALL provide visual representation of tool dependencies.

#### Scenario: View dependency count on tool card
- **WHEN** viewing a CLI tool in the tool list
- **AND** the tool has dependencies
- **THEN** the system displays a badge showing the number of dependencies
- **AND** the badge is clickable to view the dependency tree

#### Scenario: Expand dependency tree
- **WHEN** the user clicks on the dependency badge or "View Dependencies" button
- **THEN** the system displays a hierarchical tree view
- **AND** shows all direct and transitive dependencies
- **AND** indicates installation status for each dependency (installed/not installed)
- **AND** allows the user to navigate to any dependency in the list

#### Scenario: Installation queue visualization
- **WHEN** installing a tool with dependencies
- **THEN** the system displays the installation queue
- **AND** shows tools in installation order (dependencies first)
- **AND** visually distinguishes between dependencies and the target tool
- **AND** updates status in real-time as each tool installation completes

#### Scenario: Reverse dependency lookup
- **WHEN** viewing a tool that other tools depend on
- **THEN** the system displays "Required by X tools" indicator
- **AND** allows viewing which tools would be affected if this tool were removed

### Requirement: Dependency Resolution API
The system SHALL provide backend commands for dependency resolution.

#### Scenario: Resolve installation order
- **WHEN** the frontend requests installation order for a set of tool IDs
- **THEN** the system performs topological sort on the dependency graph
- **AND** returns an ordered list of tool IDs with dependencies first
- **AND** validates no circular dependencies exist
- **AND** returns an error if circular dependencies are detected

#### Scenario: Get dependency tree
- **WHEN** the frontend requests the dependency tree for a specific tool
- **THEN** the system returns a hierarchical structure
- **AND** includes all direct and transitive dependencies
- **AND** includes metadata for each dependency (name, installed status, version)

#### Scenario: Validate dependencies
- **WHEN** saving a custom tool template with dependencies
- **THEN** the system validates each dependency reference
- **AND** checks for circular dependencies
- **AND** returns detailed validation errors if any checks fail

### Requirement: Dependencies in Built-in Tools
The system SHALL include dependency declarations for built-in CLI tools.

#### Scenario: Built-in tool dependencies
- **WHEN** the application loads built-in tool templates
- **THEN** common tools have appropriate dependencies declared
- **AND** `uv` template depends on `python3` or `python`
- **AND** `n` template depends on `node`
- **AND** other tools with known dependencies are properly configured

#### Scenario: Override built-in dependencies
- **WHEN** a user creates a custom template with the same ID as a built-in tool
- **THEN** the user can modify the dependencies
- **AND** the custom template's dependencies override the built-in
- **AND** the UI indicates the tool has been customized

