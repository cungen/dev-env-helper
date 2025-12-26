# Change: Add Home Page with Spotlight-Style Search

## Why
Users need a central entry point to discover and search across all application features (CLI tools, software recommendations, etc.). A home page with a Spotlight-style search interface provides a familiar, efficient way to navigate and find content. The animated category system allows users to filter search results by type while maintaining a clean, focused UI that expands to show options when needed.

## What Changes
- **NEW**: Home page as the default landing page when the application launches
- **NEW**: Spotlight-style search input with magnifying glass icon and placeholder text
- **NEW**: Search category system (All, CLI Tools, Software, etc.) displayed as circular buttons
- **NEW**: Animated category transitions: categories collapse to single circle when search input is focused
- **NEW**: Hover interaction: category circle expands to show all categories when hovered
- **NEW**: Search functionality to filter and display interactive cards (CLI tools and software cards with install buttons and actions)
- **MODIFIED**: Navigation system to include "Home" as the first/default tab
- **MODIFIED**: Application routing to show home page by default

## Impact
- **Affected specs**:
  - `ui-navigation` - Adding home page as default tab and search navigation
  - `home-page` - New capability for home page and search functionality
- **Affected code**:
  - `src/App.tsx` - Register home page as first/default tab
  - `src/features/home-page/` - New feature module (components, hooks, types)
  - `src/hooks/useNavigation.ts` - Update default activeTab to "home"
  - `src/components/Sidebar.tsx` - No changes needed (uses existing tab system)
- **New dependencies**:
  - None (uses existing React, Tailwind CSS, and animation utilities)

## Success Criteria
1. Home page displays as the default view when application launches
2. Search input has Spotlight-style appearance (rounded, outlined, with search icon)
3. Search categories appear as circular buttons on the right side of search input
4. When search input is focused, categories animate to a single circle showing current category (default: "All")
5. When hovering over the category circle, it expands to show all available categories
6. Search input accepts text and filters results based on selected category
7. Search results display as interactive cards with full functionality (install buttons, status badges, etc.) without navigation
8. Animations are smooth and performant (60fps)

## Risks & Mitigations
- **Risk**: Complex animation states may cause performance issues
  - **Mitigation**: Use CSS transitions/transforms, avoid layout thrashing, test on lower-end devices
- **Risk**: Search functionality may need to query multiple data sources
  - **Mitigation**: Implement search as a progressive enhancement, start with simple text matching, extend later
- **Risk**: Category animation timing may feel jarring
  - **Mitigation**: Use standard animation durations (200-300ms), test with users, allow customization if needed

## Related Specs
- `ui-navigation` - Tab registration and navigation patterns
- `cli-management` - Searchable CLI tools data and card components
- `software-recommendations` - Searchable software data and card components
- `cli-installation` - Installation functionality used in search result cards

## Dependencies
- None (builds on existing navigation and feature infrastructure)

