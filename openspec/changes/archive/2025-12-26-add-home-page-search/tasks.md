# Tasks: Add Home Page with Spotlight-Style Search

## 1. Home Page Component Structure

- [x] 1.1 Create `src/features/home-page/` directory structure
  - Create `components/` directory
  - Create `hooks/` directory
  - Create `types/` directory

- [x] 1.2 Create TypeScript types in `src/features/home-page/types/`
  - `search.ts`: `SearchCategory`, `SearchResult`, `SearchState` interfaces
  - Define category IDs: "all", "cli-tools", "software"
  - Define search result structure with navigation target

- [x] 1.3 Create `HomePage` component in `src/features/home-page/components/HomePage.tsx`
  - Basic layout structure
  - Placeholder for search input
  - Placeholder for search results area
  - Use Tailwind CSS for styling

## 2. Spotlight-Style Search Input

- [x] 2.1 Create `SearchInput` component in `src/features/home-page/components/SearchInput.tsx`
  - Rounded rectangle input with border
  - Magnifying glass icon (Lucide React `Search` icon) on left
  - Placeholder text: "Spotlight Search"
  - Focus/blur handlers
  - Controlled input value

- [x] 2.2 Style search input to match Spotlight appearance
  - Use Tailwind classes: `rounded-lg`, `border`, `px-4`, `py-3`
  - Add focus ring: `focus:ring-2`, `focus:ring-ring`
  - Match dark mode colors from theme
  - Ensure proper contrast and accessibility

- [x] 2.3 Add search input state management
  - Create `useSearchInput` hook in `src/features/home-page/hooks/useSearchInput.ts`
  - Manage focus state
  - Manage input value
  - Expose handlers for parent component

## 3. Category System

- [x] 3.1 Create `SearchCategoryButton` component in `src/features/home-page/components/SearchCategoryButton.tsx`
  - Circular button with icon
  - Display category label when expanded
  - Handle click to select category
  - Active state styling

- [x] 3.2 Create `CategorySelector` component in `src/features/home-page/components/CategorySelector.tsx`
  - Container for all category buttons
  - Default state: show all categories as horizontal row
  - Focused state: show single circle with active category
  - Hover state: expand to show all categories
  - Manage category selection state

- [x] 3.3 Implement category data
  - Define categories: "All", "CLI Tools", "Software"
  - Map to icons (Grid3x3, Terminal, etc. from Lucide React)
  - Map to category IDs for filtering

- [x] 3.4 Add category selection logic
  - Create `useCategorySelection` hook in `src/features/home-page/hooks/useCategorySelection.ts`
  - Manage active category state
  - Provide category change handler
  - Default to "all" category

## 4. Animation Implementation

- [x] 4.1 Implement category collapse animation (focus state)
  - When search input receives focus, animate categories to single circle
  - Use CSS transitions: `transition-all duration-200`
  - Animate width/opacity of category buttons
  - Show only active category icon in circle

- [x] 4.2 Implement category expand animation (hover state)
  - When hovering over category circle, expand to show all categories
  - Use CSS transitions for smooth expansion
  - Maintain hover state until mouse leaves
  - Show category labels when expanded

- [x] 4.3 Implement category expand animation (blur state)
  - When search input loses focus (and no search text), expand categories back
  - Use same transition timing
  - Only expand if search is empty

- [x] 4.4 Test animation performance
  - Verify 60fps animations
  - Test on lower-end devices if available
  - Use browser DevTools performance profiler
  - Ensure no layout thrashing

## 5. Search Functionality

- [x] 5.1 Create search data aggregation
  - Create `useSearchData` hook in `src/features/home-page/hooks/useSearchData.ts`
  - Fetch CLI tools data (from existing CLI management feature)
  - Fetch software recommendations data (from existing software feature)
  - Combine into searchable dataset

- [x] 5.2 Implement search filtering logic
  - Create `useSearchFilter` hook in `src/features/home-page/hooks/useSearchFilter.ts`
  - Filter by search text (match in name/description)
  - Filter by selected category
  - Return filtered results

- [x] 5.3 Create search results component
  - Create `SearchResults` component in `src/features/home-page/components/SearchResults.tsx`
  - Display results as interactive cards (reuse existing card components)
  - For CLI tools: Use `CliToolCard` component from `cli-management` feature
  - For software: Use `SoftwareCard` component from `software-recommendations` feature
  - Handle empty state (no results)
  - Ensure cards have full functionality (install buttons, status badges, etc.)

- [x] 5.4 Integrate card components with search results
  - Pass appropriate props to `CliToolCard` for CLI tool results
  - Pass appropriate props to `SoftwareCard` for software results
  - Ensure installation hooks and context are available in home page
  - Test that install buttons work correctly in search results

## 6. Integration with Navigation

- [x] 6.1 Register home page in `src/App.tsx`
  - Add home page as first tab in `featureTabs` array
  - Use appropriate icon (Home or Search from Lucide React)
  - Set component to `HomePage`

- [x] 6.2 Update default navigation state
  - Modify `src/hooks/useNavigation.ts` default `activeTab` to "home"
  - Ensure home page loads on application start

- [x] 6.3 Test home page integration
  - Verify home page appears first
  - Verify other tabs still work
  - Verify search results display correctly
  - Verify card functionality works in search results (install buttons, etc.)

## 7. Styling and Polish

- [x] 7.1 Ensure consistent theming
  - Use theme colors from `src/index.css`
  - Match existing component styles (shadcn/ui patterns)
  - Ensure dark mode compatibility

- [x] 7.2 Add responsive design
  - Ensure search input scales on smaller screens
  - Adjust category layout for mobile (if applicable)
  - Test on various screen sizes

- [x] 7.3 Add accessibility features
  - Proper ARIA labels for search input
  - Keyboard navigation support (Tab, Enter)
  - Focus indicators visible
  - Screen reader announcements for category changes

- [x] 7.4 Polish animations and interactions
  - Fine-tune animation timings
  - Add subtle hover effects
  - Ensure smooth transitions between states
  - Test edge cases (rapid focus/blur, hover while focused, etc.)

## 8. Testing and Validation

- [ ] 8.1 Manual testing checklist
  - [ ] Home page displays on app launch
  - [ ] Search input has correct styling
  - [ ] Categories display correctly in default state
  - [ ] Categories collapse on focus
  - [ ] Categories expand on hover
  - [ ] Categories expand on blur (when search empty)
  - [ ] Category selection works
  - [ ] Search filtering works
  - [ ] Results display correctly as cards
  - [ ] CLI tool cards have full functionality (install buttons, status badges, config files)
  - [ ] Software cards have full functionality (install buttons, download buttons)
  - [ ] Card actions work without navigation
  - [ ] Animations are smooth

- [ ] 8.2 Test edge cases
  - [ ] Empty search with category filter
  - [ ] Very long search text
  - [ ] Special characters in search
  - [ ] Rapid focus/blur cycles
  - [ ] Hover while focused
  - [ ] Category change while searching

- [ ] 8.3 Performance validation
  - [ ] Animations run at 60fps
  - [ ] No layout thrashing
  - [ ] Search filtering is responsive (<100ms for typical queries)
  - [ ] No memory leaks in state management

