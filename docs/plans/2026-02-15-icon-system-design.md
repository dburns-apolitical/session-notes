# Cross-Platform Icon System Design

## Problem

The default React Navigation back button uses a PNG asset that fails to resolve in Expo's static web output, rendering an invisible icon. Other icons in the app use Unicode characters (✓, +) or text labels ("Close") as workarounds. The app needs a reliable icon system that works on iOS, Android, and web.

## Decision

Use `lucide-react-native` for all icons. Lucide renders via SVG (no font loading), is tree-shakeable, and has 1500+ icons.

## Icon Component

Single `components/ui/Icon.tsx` wrapping Lucide:

```tsx
import { icons } from "lucide-react-native";

type IconName = keyof typeof icons;

export function Icon({ name, size = 24, color = "#000" }: {
  name: IconName;
  size?: number;
  color?: string;
}) {
  const LucideIcon = icons[name];
  return <LucideIcon size={size} color={color} />;
}
```

Usage: `<Icon name="ChevronLeft" size={24} color="#007AFF" />`

## Migration

| Location | Current | New |
|----------|---------|-----|
| `app/(app)/_layout.tsx` back button | Unicode `‹` | `<Icon name="ChevronLeft" />` |
| `GridCell.tsx` checkmark | Unicode `✓` | `<Icon name="Check" />` |
| `ProjectGrid.tsx` add buttons | Text `+` | `<Icon name="Plus" />` |
| `CellDetailModal.tsx` close | Text "Close" | `<Icon name="X" />` |

## Cleanup

- Remove `components/ui/icon-symbol.tsx` (MaterialIcons fallback)
- Remove `components/ui/icon-symbol.ios.tsx` (SF Symbols)
- Remove `expo-symbols` dependency
- Keep `@expo/vector-icons` (React Navigation internal dep)
