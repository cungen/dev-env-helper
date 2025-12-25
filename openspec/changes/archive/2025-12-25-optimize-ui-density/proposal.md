# optimize-ui-density

## Summary
Comprehensively redesign the CLI tool card layout to use horizontal space more efficiently, moving from a vertically-stacked list layout to a compact horizontal layout that displays key information inline.

## Motivation

### Current Space Issues Analysis
The current tool card layout wastes significant vertical space through inefficient use of horizontal space:

1. **Single-line information display** - Each piece of info (Template ID, Dependencies, Config Files) takes a full row with "justify-between" layout, leaving large empty gaps

2. **CardHeader inefficiency** - The header shows the tool name on the left and status badge on the right, with dependency info below the name on a separate line. The version/path info (CardDescription) only appears when installed and takes another full line

3. **CardContent vertical stacking** - All information is stacked vertically with `space-y-4`, making each card ~200-250px tall even for simple tools

4. **Redundant information** - Dependencies are shown both in the header (as a count) and in the content (as badges)

### Example of Current Waste
```
┌─────────────────────────────────────────────────────────────┐
│ [icon] Node.js                                    [Installed]│
│        1 dependency                                        │
│ Version 20.10.0 · /usr/local/bin/node                      │  ← Full line for version
├─────────────────────────────────────────────────────────────┤
│ Template ID                                node             │  ← Full row, label + value
│ Dependencies                                [node]           │  ← Full row, label + badges
│ Config Files                                 1 / 3 found     │  ← Full row
│   [~/config files list...]                                   │
└─────────────────────────────────────────────────────────────┘
```

## Proposed Changes

### 1. Horizontal Information Layout
Redesign the card to use a single horizontal row for primary information:
- **Left**: Tool icon + name + version (inline)
- **Center**: Dependency badges (inline)
- **Right**: Status badge + Install button (inline)

### 2. Inline Metadata Display
Replace the "label · value" row pattern with inline badges:
- Template ID → small badge next to tool name
- Version → inline text next to name (when installed)
- Dependencies → inline badges in the center area
- Status → right-aligned badge

### 3. Collapsible Config Files Section
Move config files to a collapsible section:
- Config files list hidden by default behind a "View Configs" button
- Reduces card height significantly for tools with multiple config files
- Expands inline when clicked (not a modal overlay)

### 4. Installation Method Tooltip
- Add a small indicator next to the Install button showing the default method
- Badge shows "Brew" or "DMG" with appropriate icon
- Tooltip provides full description on hover

### 5. Reduced Vertical Spacing
- Page padding: `p-6` → `p-4`
- Card gap: `space-y-4` → `space-y-2`
- Remove CardContent padding, use custom spacing

## Target Layout
```
┌──────────────────────────────────────────────────────────────────┐
│ [icon] Node.js v20.10.0  [node-id]  [dep: python]    [✓Installed]│
│                        (center area)                   [Install]   │
│                                                                │
│ [View Configs (3)]                                            │
└──────────────────────────────────────────────────────────────────┘
```

Single compact row ~40-50px tall vs current ~200px.

## Scope
- **In Scope**: Complete redesign of CliToolCard component layout
- **In Scope**: Page-level spacing adjustments (CliToolsPage)
- **In Scope**: InstallMethodBadge component for method indication
- **In Scope**: Collapsible config files section
- **In Scope**: Sidebar collapse button layout fix
- **Out of Scope**: Changes to installation logic or backend functionality

## Success Criteria
1. Tool cards are 60-70% more compact (fit 2-3x more tools on screen)
2. All key information (name, version, status, dependencies) visible without expansion
3. Config files accessible via expand/collapse without leaving the card
4. Installation method visible before clicking Install
5. Sidebar collapse works correctly without affecting main content width
6. Layout remains readable and maintains visual hierarchy

## Risks & Mitigations
- **Risk**: Horizontal layout may break on narrow windows
  - **Mitigation**: Set minimum card width and allow horizontal scroll, or stack on very narrow screens (< 800px)
- **Risk**: Too much information in one row may be overwhelming
  - **Mitigation**: Use visual grouping with spacers and subtle dividers; maintain clear left-to-right reading order
- **Risk**: Config files hidden by default may reduce discoverability
  - **Mitigation**: Use a clear "View Configs" button with badge showing count; expand on click with smooth animation

## Related Specs
- `ui-navigation` - Sidebar collapse behavior
- `cli-installation` - Installation methods display
- `cli-management` - Tool card display

## Dependencies
- None (pure UI change)

## Timeline
- Design: Immediate
- Implementation: Single work session
- Testing: Manual verification across different screen sizes and tool configurations
