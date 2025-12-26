# Change: Add Keyboard Shortcut for Settings Page

## Why
Users frequently need to access settings to configure application preferences. While settings is accessible via the sidebar navigation and can be reached with Cmd/Ctrl + 5 (as the 5th tab), a dedicated keyboard shortcut following the common macOS pattern (Cmd+,) provides a more intuitive and faster way to open settings, similar to how most macOS applications handle preferences.

## What Changes
- **NEW**: Keyboard shortcut Cmd+, (or Ctrl+, on Windows/Linux) to open the settings page
- **MODIFIED**: Keyboard shortcut handling in navigation hook to support comma key in addition to number keys

## Impact
- **Affected specs**:
  - `ui-navigation` - Modified to add settings-specific keyboard shortcut
- **Affected code**:
  - `src/hooks/useNavigation.ts` - Add handler for Cmd+, shortcut
  - `src/App.tsx` - May need to pass settings tab ID to navigation hook (if needed)
- **New dependencies**:
  - None

## Success Criteria
1. Pressing Cmd+, (macOS) or Ctrl+, (Windows/Linux) opens the settings page
2. The shortcut works from any page in the application
3. The shortcut does not conflict with existing keyboard shortcuts
4. The shortcut follows platform conventions (Cmd on macOS, Ctrl on Windows/Linux)
5. The settings page is displayed and becomes the active tab when the shortcut is pressed

## Risks & Mitigations
- **Risk**: The comma key shortcut may conflict with text input fields
  - **Mitigation**: Only trigger when Cmd/Ctrl modifier is held, which prevents conflicts in text inputs
- **Risk**: Users may not discover the shortcut
  - **Mitigation**: This is a standard macOS pattern that users expect; can be documented in help/readme if needed
- **Risk**: Different behavior on different platforms
  - **Mitigation**: Use metaKey (Cmd) on macOS and ctrlKey on Windows/Linux, consistent with existing navigation shortcuts

## Related Specs
- `ui-navigation` - Extends keyboard navigation capabilities
- `settings` - The target page for the shortcut

## Dependencies
- Requires `add-settings` change to be implemented (settings page must exist)

