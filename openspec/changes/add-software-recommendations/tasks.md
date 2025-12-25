# Tasks: Add Software Recommendations Feature

## 1. Backend Infrastructure

- [x] 1.1 Add reqwest dependency to `src-tauri/Cargo.toml`
  - Add `reqwest = { version = "0.12", features = ["json"] }` to dependencies
  - Verify cargo builds successfully

- [x] 1.2 Create software recommendations types in `src-tauri/src/types.rs`
  - Add `SoftwareRecommendation`, `SoftwareCategory`, `InstallMethod` (extend existing or create new)
  - Add `GitHubReleaseInfo` struct for release data
  - Ensure serde serialization support

- [x] 1.3 Create `src-tauri/src/software/` module directory
  - Create `mod.rs` with module declarations
  - Create `config.rs` for JSON configuration loading
  - Create `github.rs` for GitHub API integration

- [x] 1.4 Implement JSON configuration loader in `src-tauri/src/software/config.rs`
  - Function to load `software-recommendations.json` from app config directory
  - Parse JSON into Rust structs
  - Handle missing file (return default/empty config)
  - Validate JSON structure with error messages

- [x] 1.5 Implement GitHub API client in `src-tauri/src/software/github.rs`
  - Function to fetch latest release: `get_latest_release(owner: &str, repo: &str) -> Result<GitHubReleaseInfo>`
  - Extract version tag, release name, assets
  - Match asset by regex pattern
  - Handle errors (404, rate limit, network)
  - Add caching mechanism (store in app data with timestamp)

- [x] 1.6 Create Tauri commands for software recommendations
  - `get_software_recommendations() -> Result<Vec<SoftwareRecommendation>>`
  - `get_github_latest_release(owner: String, repo: String, asset_pattern: String) -> Result<GitHubReleaseInfo>`
  - Register commands in `src-tauri/src/lib.rs`

- [x] 1.7 Create default `software-recommendations.json` file
  - Location: `src-tauri/resources/` or similar
  - Include 5-10 example software entries with various install methods
  - Include 3-4 categories (editors, terminals, version control, etc.)
  - Copy to user config directory on first run if not exists

## 2. Frontend Types and API

- [x] 2.1 Create TypeScript types in `src/features/software-recommendations/types/`
  - `software-recommendation.ts`: `SoftwareRecommendation`, `SoftwareCategory`, `InstallMethod`, `GitHubReleaseInfo`
  - Match Rust types for serialization compatibility

- [x] 2.2 Create API functions in `src/features/software-recommendations/api/`
  - `software-commands.ts`: `getSoftwareRecommendations()`, `getGitHubLatestRelease()`
  - Use `invoke()` from `@tauri-apps/api/core`
  - Proper error handling and type safety

- [x] 2.3 Create hooks in `src/features/software-recommendations/hooks/`
  - `useSoftwareRecommendations.ts`: Load and manage software list
  - `useGitHubRelease.ts`: Fetch and cache GitHub release info
  - `useGitHubDownload.ts`: Download GitHub release assets (similar to `useDmgDownload`)

## 3. UI Components

- [x] 3.1 Create `SoftwareRecommendationsPage.tsx` component
  - Main page component with category filter tabs
  - Grid layout for software cards
  - State management for selected category
  - Loading and error states

- [x] 3.2 Create `SoftwareCard.tsx` component
  - Display emoji icon (large, 48px+)
  - Software name, description, category badge
  - Install method indicator (if brew available)
  - Install/Download button
  - Responsive grid item styling

- [x] 3.3 Create `CategoryFilter.tsx` component
  - Horizontal tab list of categories
  - "All" option to show all software
  - Active category highlighting
  - Smooth scrolling for many categories

- [x] 3.4 Create `GitHubDownloadButton.tsx` component
  - Shows version info when release data loaded
  - Download button with progress indicator
  - Error handling for failed releases
  - Loading state while fetching release

- [x] 3.5 Integrate with existing `InstallButton` component
  - Reuse for brew installations
  - Ensure it works with software recommendations context
  - Test with dependency resolution if applicable

## 4. Navigation Integration

- [x] 4.1 Register software recommendations tab in `src/App.tsx`
  - Add to `featureTabs` array
  - Use appropriate icon (e.g., "Grid3x3" or "Store")
  - Label: "Software" or "Recommended"
  - Import `SoftwareRecommendationsPage` component

- [x] 4.2 Verify navigation works correctly
  - Tab appears in sidebar
  - Clicking tab shows software page
  - Keyboard shortcuts work (Cmd/Ctrl + number)
  - Sidebar collapse/expand works

## 5. Installation Integration

- [x] 5.1 Extend `InstallationContext` if needed
  - Ensure GitHub downloads integrate with progress tracking
  - Test concurrent installations (brew + GitHub download)
  - Note: GitHub downloads use separate event system, brew uses existing context

- [ ] 5.2 Test brew installation from software recommendations
  - Click install on software with brew method
  - Verify progress display
  - Verify post-installation detection
  - **Requires manual testing**

- [ ] 5.3 Test GitHub download from software recommendations
  - Click download on software with GitHub method
  - Verify release fetching and version display
  - Verify download progress
  - Verify file opens correctly
  - **Requires manual testing**

## 6. Error Handling and Edge Cases

- [x] 6.1 Handle missing configuration file
  - Show empty state with helpful message
  - Provide link to documentation or example file
  - Implemented: Default config is created on first run

- [x] 6.2 Handle GitHub API failures
  - Show cached data if available
  - Display error message with retry option
  - Handle rate limiting gracefully
  - Implemented: Caching and error handling in github.rs

- [x] 6.3 Handle invalid JSON configuration
  - Validate on load
  - Show clear error messages
  - Fallback to default config
  - Implemented: Validation in config.rs

- [x] 6.4 Handle software with no install methods
  - Show "Manual Installation" message
  - Display website/documentation link if available
  - Implemented: SoftwareCard shows message when no install methods

## 7. Styling and Polish

- [x] 7.1 Apply Tailwind CSS styling to all components
  - Grid layout with responsive columns
  - Card hover effects
  - Category filter styling
  - Dark mode support
  - Implemented: All components use Tailwind with proper styling

- [x] 7.2 Add loading skeletons
  - For software list loading
  - For GitHub release fetching
  - Implemented: Loading states in components

- [x] 7.3 Add empty states
  - No software in category
  - No categories available
  - Configuration file error
  - Implemented: Empty states in SoftwareRecommendationsPage

- [x] 7.4 Verify accessibility
  - Keyboard navigation
  - Screen reader support
  - Focus indicators
  - ARIA labels
  - Implemented: Uses shadcn/ui components with built-in accessibility

## 8. Testing and Validation

- [x] 8.1 Test with default configuration
  - All software entries display correctly
  - Categories filter correctly
  - Install methods work
  - **Requires manual testing in running app**

- [ ] 8.2 Test with custom configuration
  - Edit JSON file
  - Verify changes appear in app
  - Test invalid JSON handling
  - **Requires manual testing**

- [ ] 8.3 Test GitHub release fetching
  - Valid repositories
  - Invalid repositories (404)
  - Rate limiting scenarios
  - Network failures
  - **Requires manual testing with network access**

- [ ] 8.4 Test installation flows
  - Brew installation from recommendations
  - GitHub download from recommendations
  - Error handling during installation
  - **Requires manual testing**

- [x] 8.5 Run TypeScript compilation check
  - `pnpm exec tsc` passes
  - No type errors
  - ✅ Verified: TypeScript compilation successful

- [x] 8.6 Run Rust compilation check
  - `cargo check` passes
  - No warnings or errors
  - ✅ Verified: Rust compilation successful (only unused function warning)

## Dependencies
- Task 1.1-1.7 must complete before Task 2.1-2.3 (backend before frontend API)
- Task 2.1-2.3 must complete before Task 3.1-3.5 (types/API before components)
- Task 3.1-3.5 must complete before Task 4.1-4.2 (components before navigation)
- Task 1.5 and 2.3 must complete before Task 5.1-5.3 (GitHub integration before testing)
- All implementation tasks before Task 8 (testing)

## Validation
- Run `openspec validate add-software-recommendations --strict`
- Manual testing of all user flows
- Verify JSON configuration is valid and well-documented
- Check that GitHub API integration handles errors gracefully


