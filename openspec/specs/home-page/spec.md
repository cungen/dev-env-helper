# home-page Specification

## Purpose
TBD - created by archiving change add-home-page-search. Update Purpose after archive.
## Requirements
### Requirement: Home Page Display
The system SHALL display a home page as the default view when the application launches.

#### Scenario: Home page is default view
- **WHEN** the application launches
- **THEN** the home page is displayed in the main content area
- **AND** the home page tab is active in the sidebar navigation
- **AND** the home page shows the search interface

#### Scenario: Home page navigation
- **WHEN** the user clicks the "Home" tab in the sidebar
- **THEN** the home page is displayed
- **AND** the search interface is visible and ready for input

### Requirement: Spotlight-Style Search Input
The system SHALL provide a search input styled to resemble macOS Spotlight with a magnifying glass icon and placeholder text.

#### Scenario: Search input appearance
- **WHEN** the home page is displayed
- **THEN** a search input is visible
- **AND** the search input has a rounded rectangular shape with a border
- **AND** a magnifying glass icon is displayed on the left side of the input
- **AND** placeholder text "Spotlight Search" (or similar) is displayed
- **AND** the input has appropriate focus styling (ring, border highlight)

#### Scenario: Search input interaction
- **WHEN** the user clicks on or focuses the search input
- **THEN** the input receives focus
- **AND** a text cursor appears in the input
- **AND** the user can type search text
- **AND** the input displays the entered text

### Requirement: Search Category System
The system SHALL provide search categories (All, CLI Tools, Software, etc.) displayed as circular buttons that allow filtering search results.

#### Scenario: Categories display in default state
- **WHEN** the home page is displayed and the search input is not focused
- **THEN** all available search categories are displayed as circular buttons
- **AND** the buttons are arranged horizontally to the right of the search input
- **AND** each button displays an icon representing the category
- **AND** the "All" category is selected by default
- **AND** the selected category is visually highlighted

#### Scenario: Category selection
- **WHEN** the user clicks on a category button
- **THEN** that category becomes the active category
- **AND** the active category is visually highlighted
- **AND** search results are filtered to match the selected category
- **AND** the category selection persists while the user types

### Requirement: Category Animation on Focus
The system SHALL animate categories to collapse into a single circle when the search input receives focus.

#### Scenario: Categories collapse on focus
- **WHEN** the user focuses the search input
- **THEN** all category buttons animate to collapse into a single circular button
- **AND** the animation completes within 200-300ms
- **AND** the single circle displays the icon of the currently active category
- **AND** the animation is smooth and performant (60fps)

#### Scenario: Categories expand on blur
- **WHEN** the search input loses focus
- **AND** the search input is empty
- **THEN** the category buttons animate to expand back to show all categories
- **AND** the animation completes within 200-300ms
- **AND** all category buttons are visible again

#### Scenario: Categories remain collapsed with search text
- **WHEN** the search input loses focus
- **AND** the search input contains text
- **THEN** the category buttons remain in the collapsed state (single circle)
- **AND** the single circle shows the active category icon

### Requirement: Category Expansion on Hover
The system SHALL expand the category circle to show all categories when the user hovers over it.

#### Scenario: Categories expand on hover
- **WHEN** the user hovers over the category circle (when categories are collapsed)
- **THEN** the circle animates to expand and show all available categories
- **AND** the animation completes within 200-300ms
- **AND** all category buttons become visible
- **AND** category labels are displayed alongside icons

#### Scenario: Categories remain expanded while hovering
- **WHEN** the user hovers over the expanded categories
- **THEN** all categories remain visible
- **AND** the user can interact with any category button

#### Scenario: Categories collapse when hover ends
- **WHEN** the user moves the mouse away from the category area
- **AND** the search input is still focused
- **THEN** the categories animate back to the single circle state
- **AND** the animation completes within 200-300ms

### Requirement: Search Functionality
The system SHALL provide search functionality that filters content based on the search text and selected category.

#### Scenario: Search filters by text
- **WHEN** the user types text in the search input
- **THEN** the system filters available content (CLI tools, software, etc.) based on the search text
- **AND** matches are found in names and descriptions
- **AND** search results are displayed in real-time as the user types
- **AND** the search is case-insensitive

#### Scenario: Search filters by category
- **WHEN** a category is selected (other than "All")
- **AND** the user types search text
- **THEN** the system filters results to only show items matching both the search text and the selected category
- **AND** results from other categories are excluded

#### Scenario: Search results display
- **WHEN** search results are found
- **THEN** the results are displayed as interactive cards (CLI tool cards or software cards)
- **AND** each card shows the item name, description, and category
- **AND** cards have the same appearance and functionality as in their respective feature pages
- **AND** results are ordered by relevance (exact name matches first, then description matches)

#### Scenario: Empty search state
- **WHEN** no search text is entered
- **AND** no category filter is applied (or "All" is selected)
- **THEN** no search results are displayed
- **AND** the search results area is empty or shows a helpful message

#### Scenario: No results found
- **WHEN** the user enters search text
- **AND** no items match the search criteria
- **THEN** a "No results found" message is displayed
- **AND** the message is clear and helpful

### Requirement: Search Result Cards
The system SHALL display search results as interactive cards with full functionality, matching the card components used in their respective feature pages.

#### Scenario: CLI tool cards in search results
- **WHEN** search results include CLI tools
- **THEN** each CLI tool is displayed using the same `CliToolCard` component used in the CLI Tools page
- **AND** the card shows tool name, version (if installed), status badge, and install button (if not installed)
- **AND** the card shows dependency badges and install method badges
- **AND** the card shows collapsible config files section (if config files exist)
- **AND** all card functionality works (install buttons, config file viewing, etc.) without navigation

#### Scenario: Software cards in search results
- **WHEN** search results include software recommendations
- **THEN** each software item is displayed using the same `SoftwareCard` component used in the Software page
- **AND** the card shows software name, emoji icon, description, and category badge
- **AND** the card shows install button for Homebrew installations (if available)
- **AND** the card shows GitHub download button for GitHub releases (if available)
- **AND** all card functionality works (install buttons, download buttons, etc.) without navigation

#### Scenario: Card functionality in search results
- **WHEN** the user interacts with a card in search results (e.g., clicks install button)
- **THEN** the action is performed directly in the search results view
- **AND** the user remains on the home page
- **AND** the card updates to reflect the action (e.g., status changes after installation)
- **AND** installation progress and notifications work as expected

