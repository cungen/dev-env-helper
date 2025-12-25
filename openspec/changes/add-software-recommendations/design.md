# Design: Add Software Recommendations Feature

## Context
The application currently focuses on managing known CLI tools. This change adds a discovery mechanism for recommended software, similar to an app store interface. The feature needs to support multiple installation methods (Homebrew, GitHub releases) and be easily configurable via JSON.

## Goals
- Provide an app store-like browsing experience for recommended software
- Support Homebrew and GitHub release installation methods
- Make software configuration easily editable via JSON
- Integrate seamlessly with existing installation infrastructure
- Display software metadata (name, description, category, icon) in an attractive grid layout

## Non-Goals
- User reviews or ratings
- Software search/filtering (initially)
- Automatic software updates
- Installation of non-development software
- Support for installation methods beyond Homebrew and GitHub releases (in initial version)

## Decisions

### Decision 1: JSON Configuration File Location
**What**: Store software recommendations configuration in a JSON file in the OS app data directory.

**Rationale**:
- Consistent with existing custom templates storage pattern
- Easy to edit and version control
- No database overhead for simple configuration
- Can be bundled with app or user-editable

**Alternatives considered**:
- Database storage: Overkill for static configuration
- Remote API: Adds complexity, requires network, harder to customize
- Hardcoded in Rust: Not easily editable by users

**Implementation**: Use `dirs::config_dir()` in Rust, create `software-recommendations.json` file.

### Decision 2: JSON Configuration Schema
**What**: Use a structured JSON format with categories, software entries, and installation method specifications.

**Schema**:
```json
{
  "categories": [
    {
      "id": "editors",
      "name": "Code Editors",
      "emoji": "📝"
    }
  ],
  "software": [
    {
      "id": "vscode",
      "name": "Visual Studio Code",
      "description": "Free source-code editor made by Microsoft",
      "category": "editors",
      "emoji": "💻",
      "installMethods": [
        {
          "type": "brew",
          "cask": "visual-studio-code"
        },
        {
          "type": "github",
          "owner": "microsoft",
          "repo": "vscode",
          "assetPattern": ".*\\.dmg$"
        }
      ]
    }
  ]
}
```

**Rationale**:
- Flat structure with category references is simple to parse
- Multiple install methods per software entry
- GitHub release support via owner/repo pattern
- Asset pattern matching for finding correct download file

**Alternatives considered**:
- Nested categories: More complex parsing, less flexible
- Single install method: Too limiting for software with multiple options

### Decision 3: GitHub Release Detection
**What**: Fetch latest release from GitHub API using owner/repo, match asset by pattern, display version and download URL.

**API Endpoint**: `https://api.github.com/repos/{owner}/{repo}/releases/latest`

**Response Handling**:
- Extract `tag_name` as version
- Find asset matching `assetPattern` regex
- Extract `browser_download_url` for download button
- Cache response for 1 hour to reduce API calls

**Rationale**:
- GitHub API is well-documented and stable
- Latest release endpoint is simple and efficient
- Pattern matching allows flexibility for different asset naming conventions
- Caching reduces rate limit concerns

**Alternatives considered**:
- Scraping GitHub releases page: Fragile, violates ToS
- Using GitHub CLI: Requires additional dependency, more complex
- Manual URL configuration: Not dynamic, requires manual updates

**Error Handling**:
- Network errors: Show cached data if available, otherwise error message
- 404 (repo not found): Show error with helpful message
- Rate limiting: Show cached data, log warning
- No matching asset: Show error, suggest manual download

### Decision 4: UI Layout - Grid with Categories
**What**: Use a grid layout with category filtering, similar to app stores.

**Layout Structure**:
```
[Category Filter Tabs]
[Grid of Software Cards]
  - Each card: Emoji (large), Name, Description, Category badge, Install/Download buttons
```

**Card Design**:
- Large emoji icon (48px or larger)
- Software name (heading)
- Description (2-3 lines, truncated)
- Category badge
- Install method indicator (if brew available)
- Install/Download button

**Rationale**:
- Grid layout is familiar from app stores
- Categories help organize large lists
- Emoji icons are visually distinctive and don't require image hosting
- Card-based design matches existing CLI tools page patterns

**Alternatives considered**:
- List layout: Less visual, harder to scan
- Image icons: Requires hosting, more complex
- Single page without categories: Doesn't scale well

### Decision 5: Integration with Existing Installation System
**What**: Reuse existing `useBrewInstall` hook and `InstallButton` component for Homebrew installations. Create new hook for GitHub downloads.

**Implementation**:
- For brew installations: Use existing `useBrewInstall` hook
- For GitHub downloads: Create `useGitHubDownload` hook similar to `useDmgDownload`
- Both methods integrate with `InstallationContext` for progress tracking

**Rationale**:
- Consistency with existing installation UX
- Reuses proven installation logic
- Minimal code duplication

**Alternatives considered**:
- Separate installation flow: Inconsistent UX, code duplication
- Unified installation abstraction: Over-engineering for two methods

### Decision 6: Rust Backend for GitHub API
**What**: Implement GitHub API calls in Rust (Tauri backend) rather than frontend.

**Rationale**:
- Avoids CORS issues
- Can cache responses on disk
- Better error handling and retry logic
- Keeps API keys/tokens secure (if needed later)

**Implementation**:
- Add `reqwest` dependency to `Cargo.toml`
- Create `src-tauri/src/software/github.rs` module
- Expose `get_github_latest_release` Tauri command
- Cache responses in app data directory with timestamp

**Alternatives considered**:
- Frontend fetch: CORS issues, no caching, exposes API calls
- GitHub CLI: Additional dependency, more complex

## Risks / Trade-offs

### Risk 1: GitHub API Rate Limiting
**Impact**: High - Users may not see release information
**Mitigation**:
- Cache responses for 1 hour
- Show cached data if API fails
- Consider optional GitHub token for higher limits (future enhancement)

### Risk 2: JSON Configuration File Management
**Impact**: Medium - Users may have issues editing JSON
**Mitigation**:
- Provide example/default configuration file
- Validate JSON on load with clear error messages
- Consider UI editor in future (out of scope)

### Risk 3: Asset Pattern Matching Complexity
**Impact**: Medium - May not match all asset naming patterns
**Mitigation**:
- Use flexible regex patterns
- Provide common patterns in documentation
- Fallback to first asset if pattern doesn't match

### Risk 4: Network Dependency
**Impact**: Low - GitHub API requires internet
**Mitigation**:
- Cache aggressively
- Show clear offline state
- Allow manual URL entry as fallback (future)

## Migration Plan
- No migration needed (new feature)
- Default configuration file bundled with app
- Users can customize by editing JSON file

## Open Questions
1. Should we support GitHub authentication for higher rate limits? (Defer to future)
2. Should we validate GitHub URLs before allowing software entry? (Yes, on save)
3. Should we support pre-release versions? (No, only stable releases initially)
4. Should we support other package managers (npm, pip)? (No, out of scope)
5. Where should default configuration file be located? (Bundled in app, copied to user config on first run)


