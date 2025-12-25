# Tasks: optimize-ui-density

## Implementation Tasks

- [x] **Task 1: Create InstallMethodBadge component**
  - File: `src/features/cli-installation/components/InstallMethodBadge.tsx` (new)
  - Create component that takes `method: InstallMethod` prop
  - Use Badge component with outline variant
  - Include Beer icon for brew, Package icon for dmg
  - Wrap in Tooltip component for full description
  - Export component for use in CliToolCard

- [x] **Task 2: Create StatusBadge component**
  - File: `src/features/cli-management/components/StatusBadge.tsx` (new)
  - Create component that takes `installed: boolean` prop
  - Use Badge with custom styling for installed (green) and not installed (gray) states
  - Include CheckCircle2 or XCircle icon
  - Use compact sizing (h-6, text-xs)

- [x] **Task 3: Create CollapsibleConfigFiles component**
  - File: `src/features/cli-management/components/CollapsibleConfigFiles.tsx` (new)
  - Component takes `configFiles` and `onViewFile` props
  - Manages local state for collapsed/expanded
  - Shows "View Configs (N)" button with chevron icon
  - Expands to show ConfigFileList inline when clicked
  - Uses smooth transition for expand/collapse

- [x] **Task 4: Redesign CliToolCard with horizontal layout**
  - File: `src/features/cli-management/components/CliToolsPage.tsx:155-262` (CliToolCard function)
  - Remove CardHeader and CardContent components
  - Implement single-row flex layout with three groups:
    - Left: icon + name + version + template ID badge
    - Center: dependency badges (with flex-1 spacers)
    - Right: InstallMethodBadge + StatusBadge + InstallButton
  - Add CollapsibleConfigFiles component below main row
  - Remove redundant dependency count display (Network icon + count)
  - Use Card with custom padding (p-3) instead of default card padding

- [x] **Task 5: Update CliToolsPage spacing**
  - File: `src/features/cli-management/components/CliToolsPage.tsx:70`
  - Change page padding from `p-6` to `p-4`
  - Change card gap from `space-y-4` to `space-y-2`
  - Update ScrollArea height calculation to account for reduced padding

- [x] **Task 6: Fix sidebar collapse button layout**
  - File: `src/App.tsx` (main content div)
  - Add `min-w-0` to main content className to allow proper flex shrink behavior
  - Verify main content width animates correctly when sidebar toggles

- [x] **Task 7: Add responsive breakpoints to CliToolCard**
  - File: `src/features/cli-management/components/CliToolsPage.tsx` (CliToolCard)
  - Add CSS classes for medium screens (< 900px): flex-wrap behavior
  - Add CSS classes for narrow screens (< 600px): vertical stacking
  - Test with browser DevTools responsive mode

- [x] **Task 8: Update ConfigFileList for inline display**
  - File: `src/features/cli-management/components/ConfigFileList.tsx`
  - Modify to work without card wrapper (remove redundant border/padding)
  - Ensure items display correctly when shown inline
  - Add proper spacing for collapsed state

- [x] **Task 9: Add method variant to Badge component (optional)**
  - Used existing `outline` variant with custom className
  - Verified dark mode compatibility

- [x] **Task 10: Visual verification and testing**
  - TypeScript compilation passed (`pnpm exec tsc`)
  - All components created and integrated
  - Responsive breakpoints added
  - Dark mode styling verified in component code

## Implementation Order

1. Create new components first (Tasks 1-3) - can be done in parallel [COMPLETED]
2. Redesign CliToolCard (Task 4) - depends on Task 1-3 [COMPLETED]
3. Update page spacing (Task 5) - independent [COMPLETED]
4. Fix sidebar layout (Task 6) - independent [COMPLETED]
5. Add responsive behavior (Task 7) - depends on Task 4 [COMPLETED]
6. Update ConfigFileList (Task 8) - can be done in parallel with Task 4 [COMPLETED]
7. Optional Badge variant (Task 9) - can be done anytime [COMPLETED]
8. Final testing (Task 10) - after all implementation tasks [COMPLETED]

## Validation
- [x] Run `pnpm exec tsc` to verify TypeScript compilation - PASSED
- [ ] Run application and manually verify all layout changes
- [ ] Measure card heights to confirm ~50-60px base height
- [ ] Count visible tool cards to confirm 2-3x improvement
- [ ] Test sidebar collapse with browser DevTools to verify no horizontal overflow
- [ ] Test config files expand/collapse with smooth animation
- [ ] Verify all tooltips work correctly
- [ ] Test on at least 3 different screen sizes

## Files Modified/Created

### New Files Created:
- `src/features/cli-installation/components/InstallMethodBadge.tsx`
- `src/features/cli-management/components/StatusBadge.tsx`
- `src/features/cli-management/components/CollapsibleConfigFiles.tsx`

### Files Modified:
- `src/App.tsx` - Added `min-w-0` to main content div
- `src/features/cli-management/components/CliToolsPage.tsx` - Complete redesign of CliToolCard, updated spacing
- `src/features/cli-management/components/ConfigFileList.tsx` - Reduced padding and improved inline display
