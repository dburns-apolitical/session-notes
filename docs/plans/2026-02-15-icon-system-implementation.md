# Icon System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace broken font/PNG-based icons with SVG-based lucide-react-native for reliable cross-platform rendering.

**Architecture:** Single `Icon` component wrapping lucide-react-native. Migrate all 4 existing icon usages (back arrow, checkmark, plus, close). Remove unused Expo template icon files.

**Tech Stack:** lucide-react-native, react-native-svg (peer dep)

---

### Task 1: Install dependencies

**Files:**
- Modify: `apps/mobile/package.json`

**Step 1: Install lucide-react-native and react-native-svg**

Run from repo root:
```bash
cd apps/mobile && bun add lucide-react-native react-native-svg
```

**Step 2: Verify install**

```bash
cd apps/mobile && bun pm ls | grep -E "lucide|react-native-svg"
```

Expected: Both packages listed.

**Step 3: Commit**

```bash
git add apps/mobile/package.json bun.lock
git commit -m "deps: add lucide-react-native and react-native-svg"
```

---

### Task 2: Create Icon component

**Files:**
- Create: `apps/mobile/components/ui/Icon.tsx`

**Step 1: Create the Icon component**

Write `apps/mobile/components/ui/Icon.tsx`:

```tsx
import { icons } from "lucide-react-native";
import { StyleProp, ViewStyle } from "react-native";

export type IconName = keyof typeof icons;

export function Icon({
  name,
  size = 24,
  color = "#000",
  style,
}: {
  name: IconName;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const LucideIcon = icons[name];
  return <LucideIcon size={size} color={color} style={style} />;
}
```

**Step 2: Verify it typechecks**

```bash
cd apps/mobile && bunx tsc --noEmit 2>&1 | grep -i "Icon\|icon" || echo "No icon-related errors"
```

Expected: No icon-related errors.

**Step 3: Commit**

```bash
git add apps/mobile/components/ui/Icon.tsx
git commit -m "feat: add Icon component using lucide-react-native"
```

---

### Task 3: Migrate back button in app layout

**Files:**
- Modify: `apps/mobile/app/(app)/_layout.tsx`

**Step 1: Update the BackButton to use Icon**

Replace the full content of `apps/mobile/app/(app)/_layout.tsx` with:

```tsx
import { Stack } from "expo-router";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet } from "react-native";
import { Icon } from "../../components/ui/Icon";

function BackButton() {
  const router = useRouter();
  return (
    <Pressable onPress={() => router.back()} style={styles.backButton}>
      <Icon name="ChevronLeft" size={24} color="#007AFF" />
    </Pressable>
  );
}

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="project/[id]"
        options={{
          headerShown: true,
          title: "Project",
          headerLeft: () => <BackButton />,
        }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  backButton: { paddingHorizontal: 8, paddingVertical: 4 },
});
```

Changes: Removed `Text` import and `backArrow` style. Replaced Unicode `‹` with `<Icon name="ChevronLeft" />`.

**Step 2: Verify typecheck**

```bash
cd apps/mobile && bunx tsc --noEmit 2>&1 | grep "_layout" || echo "No layout errors"
```

**Step 3: Commit**

```bash
git add apps/mobile/app/\(app\)/_layout.tsx
git commit -m "refactor: migrate back button to Icon component"
```

---

### Task 4: Migrate checkmark in GridCell

**Files:**
- Modify: `apps/mobile/components/GridCell.tsx`

**Step 1: Update GridCell**

Replace the full content of `apps/mobile/components/GridCell.tsx` with:

```tsx
import { TouchableOpacity, StyleSheet, View } from "react-native";
import { Text } from "react-native";
import { Icon } from "./ui/Icon";

type Props = {
  isComplete: boolean;
  noteCount: number;
  onPress: () => void;
};

export function GridCell({ isComplete, noteCount, onPress }: Props) {
  return (
    <TouchableOpacity style={[styles.cell, isComplete && styles.complete]} onPress={onPress}>
      {isComplete && <Icon name="Check" size={20} color="#4caf50" />}
      {noteCount > 0 && (
        <View style={styles.noteBadge}>
          <Text style={styles.noteCount}>{noteCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cell: { width: 80, height: 60, borderWidth: 1, borderColor: "#ddd", justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  complete: { backgroundColor: "#e8f5e9" },
  noteBadge: { position: "absolute", top: 4, right: 4, backgroundColor: "#007AFF", borderRadius: 8, width: 16, height: 16, justifyContent: "center", alignItems: "center" },
  noteCount: { color: "#fff", fontSize: 10, fontWeight: "bold" },
});
```

Changes: Removed `check` style and Unicode `✓` text. Added `<Icon name="Check" />` only when `isComplete` is true (instead of rendering empty text).

**Step 2: Verify typecheck**

```bash
cd apps/mobile && bunx tsc --noEmit 2>&1 | grep "GridCell" || echo "No GridCell errors"
```

**Step 3: Commit**

```bash
git add apps/mobile/components/GridCell.tsx
git commit -m "refactor: migrate GridCell checkmark to Icon component"
```

---

### Task 5: Migrate add buttons in ProjectGrid

**Files:**
- Modify: `apps/mobile/components/ProjectGrid.tsx`

**Step 1: Update ProjectGrid**

In `apps/mobile/components/ProjectGrid.tsx`:

Add import at top (after existing imports on line 3):
```tsx
import { Icon } from "./ui/Icon";
```

Replace line 70 (the `+` text in add song button):
```tsx
// OLD:  <Text style={styles.addButtonText}>+</Text>
// NEW:
<Icon name="Plus" size={18} color="#007AFF" />
```

Replace line 98 (the `+ Add Step` text):
```tsx
// OLD:  <Text style={styles.addButtonText}>+ Add Step</Text>
// NEW:
<View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
  <Icon name="Plus" size={16} color="#007AFF" />
  <Text style={styles.addButtonText}>Add Step</Text>
</View>
```

**Step 2: Verify typecheck**

```bash
cd apps/mobile && bunx tsc --noEmit 2>&1 | grep "ProjectGrid" || echo "No ProjectGrid errors"
```

**Step 3: Commit**

```bash
git add apps/mobile/components/ProjectGrid.tsx
git commit -m "refactor: migrate ProjectGrid add buttons to Icon component"
```

---

### Task 6: Migrate close button in CellDetailModal

**Files:**
- Modify: `apps/mobile/components/CellDetailModal.tsx`

**Step 1: Update CellDetailModal**

In `apps/mobile/components/CellDetailModal.tsx`:

Add import (after line 14):
```tsx
import { Icon } from "./ui/Icon";
```

Replace lines 67-69 (the Close text button):
```tsx
// OLD:
//   <TouchableOpacity onPress={onClose}>
//     <Text style={styles.closeText}>Close</Text>
//   </TouchableOpacity>
// NEW:
<TouchableOpacity onPress={onClose} hitSlop={8}>
  <Icon name="X" size={24} color="#007AFF" />
</TouchableOpacity>
```

Remove the now-unused `closeText` style from the StyleSheet (line 132):
```tsx
// DELETE: closeText: { color: "#007AFF", fontSize: 16 },
```

**Step 2: Verify typecheck**

```bash
cd apps/mobile && bunx tsc --noEmit 2>&1 | grep "CellDetailModal" || echo "No CellDetailModal errors"
```

**Step 3: Commit**

```bash
git add apps/mobile/components/CellDetailModal.tsx
git commit -m "refactor: migrate CellDetailModal close to Icon component"
```

---

### Task 7: Remove unused Expo template icon files

**Files:**
- Delete: `apps/mobile/components/ui/icon-symbol.tsx`
- Delete: `apps/mobile/components/ui/icon-symbol.ios.tsx`
- Modify: `apps/mobile/components/ui/collapsible.tsx` (update to use new Icon)

**Step 1: Update Collapsible to use new Icon**

Replace the full content of `apps/mobile/components/ui/collapsible.tsx` with:

```tsx
import { PropsWithChildren, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Icon } from '@/components/ui/Icon';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function Collapsible({ children, title }: PropsWithChildren & { title: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const theme = useColorScheme() ?? 'light';

  return (
    <ThemedView>
      <TouchableOpacity
        style={styles.heading}
        onPress={() => setIsOpen((value) => !value)}
        activeOpacity={0.8}>
        <Icon
          name="ChevronRight"
          size={18}
          color={theme === 'light' ? Colors.light.icon : Colors.dark.icon}
          style={{ transform: [{ rotate: isOpen ? '90deg' : '0deg' }] }}
        />

        <ThemedText type="defaultSemiBold">{title}</ThemedText>
      </TouchableOpacity>
      {isOpen && <ThemedView style={styles.content}>{children}</ThemedView>}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  content: {
    marginTop: 6,
    marginLeft: 24,
  },
});
```

**Step 2: Delete old icon files**

```bash
rm apps/mobile/components/ui/icon-symbol.tsx apps/mobile/components/ui/icon-symbol.ios.tsx
```

**Step 3: Verify no remaining references to old files**

```bash
cd apps/mobile && grep -r "icon-symbol" --include="*.tsx" --include="*.ts" . || echo "No remaining references"
```

Expected: "No remaining references"

**Step 4: Verify typecheck**

```bash
cd apps/mobile && bunx tsc --noEmit 2>&1 | grep -v "use-project-websocket" || echo "Clean"
```

Expected: No new errors (the pre-existing `use-project-websocket.ts` error is unrelated).

**Step 5: Commit**

```bash
git add -A apps/mobile/components/ui/
git commit -m "cleanup: remove old icon-symbol files, migrate collapsible to Icon"
```

---

### Task 8: Verify on web

**Step 1: Start the web dev server**

```bash
cd apps/mobile && bunx expo start --web
```

**Step 2: Manual verification**

Navigate to a project page and verify:
- Back arrow (ChevronLeft) renders as an SVG in the header
- Grid checkmarks render when cells are complete
- Plus icons render on add song/step buttons
- Close X renders in the cell detail modal

**Step 3: Check the DOM**

Inspect the back button — it should contain an `<svg>` element with path data, NOT an empty div with a tint filter.
