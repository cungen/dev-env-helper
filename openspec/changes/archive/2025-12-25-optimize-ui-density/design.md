# Design: optimize-ui-density

## Current Layout Analysis

### Card Structure Breakdown
The current `CliToolCard` uses this structure:

```
Card
├── CardHeader (padding: 24px 16px)
│   ├── Row 1: [Icon + Name + Dependency Count] ........................... [Status Badge]
│   └── CardDescription: "Version X.Y.Z · /path/to/executable"  (full row, only when installed)
└── CardContent (padding: 16px)
    └── space-y-4 div
        ├── Row: "Template ID" .................................................. [node]
        ├── Row: "Dependencies" .......................................... [Badge] [Badge]
        ├── Section: "Config Files" ..................................... 2 / 3 found
        │   └── ConfigFileList (multiple rows)
        └── Row: [Install Button] (only when not installed)
```

### Vertical Space Calculation
- CardHeader: ~80-100px (title row + version row + padding)
- CardContent: ~100-150px (3-4 rows with spacing + padding)
- **Total per card: ~180-250px**

### Horizontal Space Waste
Each "justify-between" row wastes 50-70% of horizontal space:
```
"Template ID" ---------------------- gap ---------------------- "node"
```

## Proposed Layout Design

### New Card Structure
```
Card (minimal padding: 12px)
├── Main Row (flex items-center gap-3)
│   ├── [Left Group] flex items-center gap-2
│   │   ├── Terminal Icon (h-4 w-4)
│   │   ├── Tool Name (font-semibold)
│   │   ├── Version (text-sm text-muted-foreground, when installed)
│   │   └── Template ID Badge (variant=outline, text-xs)
│   │
│   ├── [Spacer] flex-1
│   │
│   ├── [Center Group] flex items-center gap-1
│   │   └── Dependency Badges (variant=secondary, text-xs)
│   │
│   ├── [Spacer] flex-1
│   │
│   └── [Right Group] flex items-center gap-2
│       ├── Install Method Badge (when applicable)
│       ├── Status Badge
│       └── Install Button (when not installed)
│
└── Config Files Section (collapsible)
    └── [View Configs (N)] Button → expands to show ConfigFileList
```

### Component Specifications

#### 1. CompactCard (new component structure)
```tsx
<Card className="p-3">
  {/* Main info row */}
  <div className="flex items-center gap-3">
    {/* Left: Tool identity */}
    <div className="flex items-center gap-2 min-w-0">
      <Terminal className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      <span className="font-semibold truncate">{toolName}</span>
      {version && (
        <span className="text-sm text-muted-foreground">v{version}</span>
      )}
      <Badge variant="outline" className="text-xs flex-shrink-0">
        {templateId}
      </Badge>
    </div>

    {/* Spacer */}
    <div className="flex-1" />

    {/* Center: Dependencies */}
    {dependencies.length > 0 && (
      <>
        <div className="flex items-center gap-1">
          {dependencies.map(dep => (
            <Badge key={dep} variant="secondary" className="text-xs">
              {dep}
            </Badge>
          ))}
        </div>
        <div className="flex-1" />
      </>
    )}

    {/* Right: Actions */}
    <div className="flex items-center gap-2 flex-shrink-0">
      <InstallMethodBadge method={defaultMethod} />
      <StatusBadge installed={installed} />
      {!installed && <InstallButton {...props} size="sm" />}
    </div>
  </div>

  {/* Collapsible config files */}
  {configFiles.length > 0 && (
    <Collapsible>
      <CollapsibleTrigger className="mt-2 text-xs text-muted-foreground">
        View Configs ({configFiles.length})
      </CollapsibleTrigger>
      <CollapsibleContent>
        <ConfigFileList configFiles={configFiles} />
      </CollapsibleContent>
    </Collapsible>
  )}
</Card>
```

#### 2. InstallMethodBadge Component
```tsx
interface InstallMethodBadgeProps {
  method: InstallMethod;
}

export function InstallMethodBadge({ method }: InstallMethodBadgeProps) {
  const variants = {
    brew: { icon: Beer, label: "Brew", tooltip: "Install via Homebrew" },
    dmg: { icon: Package, label: "DMG", tooltip: "Download DMG Installer" },
  };

  const { icon: Icon, label, tooltip } = variants[method.type];

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant="outline" className="text-xs h-6 px-2">
          <Icon className="h-3 w-3 mr-1" />
          {label}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-xs">{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
}
```

#### 3. StatusBadge Component (compact)
```tsx
export function StatusBadge({ installed }: { installed: boolean }) {
  return (
    <Badge
      variant={installed ? "default" : "secondary"}
      className={cn(
        "text-xs h-6 px-2",
        installed
          ? "bg-green-500/10 text-green-600 border-green-500/20"
          : "bg-muted text-muted-foreground"
      )}
    >
      {installed ? (
        <CheckCircle2 className="h-3 w-3 mr-1" />
      ) : (
        <XCircle className="h-3 w-3 mr-1" />
      )}
      {installed ? "Installed" : "Not Installed"}
    </Badge>
  );
}
```

### Layout Calculations

#### Target Height per Card
- Main row: 32px (content) + 24px (padding) = 56px
- Config files collapsed: 0px
- Config files expanded: 24px (trigger) + 20-60px (list) = 44-84px

**Best case (no configs, installed)**: ~56px per card vs current ~180px = **69% reduction**
**Worst case (with configs expanded)**: ~140px vs current ~250px = **44% reduction**

#### Information Density
- Current: 4-5 cards visible on 1080p screen
- Proposed: 12-15 cards visible on 1080p screen (without expanding configs)
- **Improvement: 2.5-3x more tools visible**

## Responsive Behavior

### Narrow Screens (< 900px)
```tsx
// Stack left and right groups, keep center inline
<div className="flex flex-wrap items-center gap-2">
  <LeftGroup />
  <RightGroup />
</div>
<div className="flex items-center gap-1 mt-1">
  <CenterGroup />
</div>
```

### Very Narrow Screens (< 600px)
```tsx
// Full vertical stack, revert closer to current layout
<div className="space-y-2">
  <LeftGroup />
  <CenterGroup />
  <RightGroup />
</div>
```

## Visual Hierarchy

### Element Sizing
| Element | Size | Weight |
|---------|------|--------|
| Tool Name | base (16px) | font-semibold |
| Version | sm (14px) | text-muted-foreground |
| Badges | xs (12px) | normal |
| Icons | 12-16px | - |

### Color Usage
- **Primary**: Tool name (foreground)
- **Secondary**: Version, dependencies (muted-foreground)
- **Tertiary**: Template ID (outline badge)
- **Status**: Green (installed), gray (not installed)
- **Action**: Install button (primary)

### Spacing Rhythm
- Horizontal gaps: 8px (gap-2) between related items
- Spacers: flex-1 to push groups apart
- Card padding: 12px (p-3)
- Card gap: 8px (space-y-2)

## Collapsible Config Files

### Collapsible Usage
Use `@radix-ui/react-react-collapse` or implement custom:

```tsx
const [isConfigOpen, setIsConfigOpen] = useState(false);

return (
  <>
    <button
      onClick={() => setIsConfigOpen(!isConfigOpen)}
      className="mt-2 text-xs text-muted-foreground hover:text-foreground"
    >
      {isConfigOpen ? "▼" : "▶"} View Configs ({configFiles.length})
    </button>
    {isConfigOpen && (
      <div className="mt-2 space-y-1">
        <ConfigFileList configFiles={configFiles} />
      </div>
    )}
  </>
);
```

### Animation
```css
.config-files {
  transition: max-height 200ms ease-out, opacity 150ms ease-out;
}
```

## Sidebar Collapse Fix

### Issue Analysis
The sidebar collapse button appears to reserve space in the main content. This is likely due to:
1. Missing `min-w-0` on main content (prevents flex item shrinkage)
2. ScrollArea not recalculating width

### Solution
```tsx
// In App.tsx
<main className="flex-1 min-w-0 overflow-y-auto bg-background">
```

This allows the main content to properly shrink when sidebar transitions.

## Accessibility

1. **Keyboard Navigation**: Maintain tab order through card elements
2. **Screen Reader**: Proper labels for badges and buttons
3. **Touch Targets**: Minimum 32px height for all interactive elements
4. **Focus Indicators**: Visible focus rings for all buttons

## Implementation Notes

### Removed Elements
- CardDescription component (version moved inline)
- CardContent wrapper (use div with custom padding)
- Separate dependency count display (badges show actual deps)
- "Template ID" label (badge is self-explanatory)

### New Components
- `InstallMethodBadge` - Shows installation method with tooltip
- `StatusBadge` - Compact status indicator
- Optional: `CompactCard` wrapper with standardized layout

### Modified Components
- `CliToolCard` - Complete layout restructure
- `ConfigFileList` - Support for inline display (no card wrapper)
- `CliToolsPage` - Reduced spacing and padding
