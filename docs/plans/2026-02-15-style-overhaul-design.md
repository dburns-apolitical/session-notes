# Style Overhaul Design

Dark-only theme with rainbow-colored grid cells, inspired by Logic Pro DAW track colors and habit tracker UIs.

## Color System

### Dark Palette

| Token | Value | Usage |
|-------|-------|-------|
| `background` | `#121212` | Screen backgrounds |
| `surface` | `#1E1E1E` | Cards, modals, elevated surfaces |
| `surfaceLight` | `#2A2A2A` | Input fields, step labels, hover states |
| `border` | `#333333` | Subtle borders/dividers |
| `textPrimary` | `#FFFFFF` | Headings, primary content |
| `textSecondary` | `#A0A0A0` | Labels, metadata, secondary info |
| `textTertiary` | `#666666` | Hints, placeholders |
| `accent` | `#007AFF` | Buttons, links, interactive elements |
| `danger` | `#FF453A` | Destructive actions |
| `success` | `#30D158` | Success states |
| `overlay` | `rgba(0,0,0,0.7)` | Modal backdrops |

### Rainbow Step Colors

12 colors cycling with `stepIndex % 12`:

```
#FF3B30  Red
#FF6B2C  Orange
#FFB800  Amber
#34C759  Green
#30D158  Lime
#00C7BE  Teal
#32ADE6  Sky
#007AFF  Blue
#5856D6  Indigo
#AF52DE  Purple
#FF2D55  Pink
#FF375F  Rose
```

## Grid Cells

- Shape: Rounded squares (~48x48, 10px border radius)
- **Incomplete:** Transparent fill, 2px border in step's rainbow color
- **Complete:** Solid fill in step's rainbow color + white Check icon
- Note badge: Top-right corner, white text on surfaceLight background
- Colors assigned per step row (not per song column)

## Approach

Centralized dark-only palette in `constants/theme.ts`. No light/dark toggle — always dark. All hardcoded colors across the app replaced with theme tokens.

## Scope

### Screens
- Sign-in: Dark background, white/outlined buttons
- Project list (home): Dark background, project cards on `surface`
- Project grid: Rainbow cells on dark background
- Profile: Dark background, accent avatar

### Components
- Tab bar: `surface` background, white/gray icons
- ProjectHeader: `surface` background, invite code pill
- Modals (CreateProject, CellDetail): `surface` background, dark inputs
- NoteThread: Dark surface, white text
- JoinProjectInput: Dark inputs, accent button
- GridCell: Rainbow color treatment (outlined/filled)
- ProjectGrid: Dark step labels, dark song headers

### Unchanged
- Component structure and layout logic
- Functionality and data flow
- Navigation structure
