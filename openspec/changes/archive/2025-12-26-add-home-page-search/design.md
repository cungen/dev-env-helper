# Design: Home Page with Spotlight-Style Search

## Context
The application currently uses a sidebar-based navigation system with feature tabs. Users navigate between "CLI Tools", "Environment", and "Software" features. There is no central search or discovery mechanism. The home page will serve as the primary entry point and provide unified search across all features.

## Goals / Non-Goals

### Goals
- Create an intuitive, Spotlight-inspired search interface
- Provide category-based filtering with smooth animations
- Display search results as interactive cards with full functionality (install buttons, status badges, etc.)
- Maintain consistent design language with existing UI (shadcn/ui, Tailwind CSS)
- Ensure animations are performant and accessible

### Non-Goals
- Full-text search across all application data (start with simple matching)
- Search history or saved searches (can be added later)
- Keyboard shortcuts for category switching (can be added later)
- Search suggestions/autocomplete (can be added later)

## Decisions

### Decision: Spotlight-Style Search Input
**What**: Use a rounded, outlined search input with magnifying glass icon, similar to macOS Spotlight
**Why**: Familiar pattern that users expect, clean and focused appearance
**Alternatives considered**:
- Material Design search bar - Less familiar on macOS
- Simple text input - Less discoverable
- Command palette style - Too complex for initial implementation

### Decision: Animated Category System
**What**: Categories collapse to single circle on focus, expand on hover
**Why**: Reduces visual clutter when searching, provides clear category indication, expands when needed
**Alternatives considered**:
- Always show all categories - Too cluttered when focused
- Dropdown menu - Less discoverable, breaks visual flow
- Tabs above search - Takes more vertical space

### Decision: Category Circle Animation
**What**: Single circle shows current category icon, expands to show all categories on hover
**Why**: Clean default state, full options available on demand, smooth transition
**Alternatives considered**:
- Always show all categories - Too many buttons
- Click to expand - Requires extra click, less discoverable
- Keyboard-only expansion - Not accessible to mouse users

### Decision: CSS Transitions for Animations
**What**: Use Tailwind CSS transition utilities and CSS transforms for animations
**Why**: Performant, hardware-accelerated, consistent with existing codebase
**Alternatives considered**:
- JavaScript animation library (Framer Motion) - Adds dependency, overkill for simple transitions
- CSS animations - More verbose, transitions are sufficient

### Decision: Search Categories
**What**: Initial categories: "All", "CLI Tools", "Software"
**Why**: Matches existing features, can be extended later
**Alternatives considered**:
- More granular categories - Too many options initially
- Single category - Too limiting

## Implementation Details

### Search Input Component
- Rounded rectangle with border
- Magnifying glass icon on left
- Placeholder text: "Spotlight Search" or similar
- Focus state: border highlight, categories collapse
- Blur state: categories expand back (if no search text)

### Category System
- Default state: All categories visible as circular buttons
- Focused state: Single circle with current category icon
- Hover state (on circle): Expand to show all categories
- Category selection: Updates active category, filters search results

### Animation States
1. **Idle → Focus**: Categories collapse to single circle (200ms)
2. **Focus → Blur**: Categories expand back (200ms)
3. **Circle Hover**: Expand to show all categories (200ms)
4. **Category Select**: Update active category, maintain expanded state briefly (150ms)

### Search Functionality
- Real-time filtering as user types
- Filter by selected category
- Search across:
  - CLI tool names and descriptions
  - Software recommendation names and descriptions
  - Feature names
- Display results as interactive cards:
  - CLI tool cards: Show install buttons, status badges, dependency badges, config file viewers
  - Software cards: Show install buttons (brew), GitHub download buttons, category badges
- Cards have full functionality without navigation (same as in their respective feature pages)
- Reuse existing card components from `cli-management` and `software-recommendations` features

## Risks / Trade-offs

### Risk: Animation Performance
**Mitigation**:
- Use `transform` and `opacity` only (GPU-accelerated)
- Avoid animating `width` or `height` directly
- Test on lower-end devices
- Provide reduced-motion option if needed

### Risk: Search Scope Ambiguity
**Mitigation**:
- Start with simple text matching in names/descriptions
- Clearly indicate what is being searched
- Can extend to full-text search later

### Risk: Category Expansion Timing
**Mitigation**:
- Use standard hover delay (no delay or 100ms max)
- Test with users for optimal timing
- Consider touch devices (tap to expand)

## Migration Plan

1. Add home page as new feature tab (first in list)
2. Update default `activeTab` in `useNavigation` hook
3. Existing navigation continues to work
4. No breaking changes to existing features

## Open Questions
- Should search results show all card details or a condensed version?
- Should there be keyboard navigation for results (arrow keys)?
- Should search persist when switching tabs (remember last search)?

