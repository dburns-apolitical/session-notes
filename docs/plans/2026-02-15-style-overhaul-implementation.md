# Style Overhaul Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Restyle the entire app with a dark-only theme and rainbow-colored grid cells that cycle per step row.

**Architecture:** Replace the existing unused theme system in `constants/theme.ts` with a dark-only palette and rainbow color array. Update every component's StyleSheet to use theme tokens instead of hardcoded light colors. Pass `stepIndex` through to `GridCell` for rainbow color assignment.

**Tech Stack:** React Native StyleSheet, Expo Router (tab/header theming)

---

### Task 1: Replace theme constants

**Files:**
- Modify: `apps/mobile/constants/theme.ts`

**Step 1: Replace the Colors and keep Fonts**

Replace the entire `Colors` export with a flat dark palette and rainbow array:

```ts
export const theme = {
  background: "#121212",
  surface: "#1E1E1E",
  surfaceLight: "#2A2A2A",
  border: "#333333",
  textPrimary: "#FFFFFF",
  textSecondary: "#A0A0A0",
  textTertiary: "#666666",
  accent: "#007AFF",
  danger: "#FF453A",
  success: "#30D158",
  overlay: "rgba(0,0,0,0.7)",
};

export const stepColors = [
  "#FF3B30", // Red
  "#FF6B2C", // Orange
  "#FFB800", // Amber
  "#34C759", // Green
  "#30D158", // Lime
  "#00C7BE", // Teal
  "#32ADE6", // Sky
  "#007AFF", // Blue
  "#5856D6", // Indigo
  "#AF52DE", // Purple
  "#FF2D55", // Pink
  "#FF375F", // Rose
];

export function getStepColor(stepIndex: number): string {
  return stepColors[stepIndex % stepColors.length];
}
```

Remove the old `Colors` export. Keep `Fonts` unchanged.

**Step 2: Commit**

```bash
git add apps/mobile/constants/theme.ts
git commit -m "feat: replace theme with dark-only palette and rainbow step colors"
```

---

### Task 2: Update GridCell with rainbow colors

**Files:**
- Modify: `apps/mobile/components/GridCell.tsx`

**Step 1: Update GridCell props and styles**

Add `color` prop. Replace the entire component:

```tsx
import { TouchableOpacity, StyleSheet, View, Text } from "react-native";
import { Icon } from "./ui/Icon";
import { theme } from "../constants/theme";

type Props = {
  isComplete: boolean;
  noteCount: number;
  color: string;
  onPress: () => void;
};

export function GridCell({ isComplete, noteCount, color, onPress }: Props) {
  return (
    <TouchableOpacity
      style={[
        styles.cell,
        { borderColor: color },
        isComplete && { backgroundColor: color },
      ]}
      onPress={onPress}
    >
      {isComplete && <Icon name="Check" size={20} color="#FFFFFF" />}
      {noteCount > 0 && (
        <View style={styles.noteBadge}>
          <Text style={styles.noteCount}>{noteCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cell: {
    width: 48,
    height: 48,
    borderWidth: 2,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    margin: 4,
  },
  noteBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: theme.surfaceLight,
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  noteCount: { color: theme.textPrimary, fontSize: 10, fontWeight: "bold" },
});
```

**Step 2: Commit**

```bash
git add apps/mobile/components/GridCell.tsx
git commit -m "feat: rainbow-colored grid cells with outline/fill states"
```

---

### Task 3: Update ProjectGrid to pass step colors

**Files:**
- Modify: `apps/mobile/components/ProjectGrid.tsx`

**Step 1: Update imports, constants, and styles**

Add theme imports at top:
```ts
import { theme, getStepColor } from "../constants/theme";
```

Update `CELL_WIDTH` from 80 to 56 (to match new 48+margin cell size).

In the grid row rendering, pass `color` to `GridCell`. The step's index in `sortedSteps` determines the color:

```tsx
{sortedSteps.map((step, stepIndex) => (
  <View key={step.id} style={styles.row}>
    <View style={[styles.stepLabel, { borderLeftColor: getStepColor(stepIndex), borderLeftWidth: 3 }]}>
      <Text style={styles.stepLabelText} numberOfLines={2}>{step.name}</Text>
    </View>
    {sortedSongs.map((song) => {
      const cell = getCell(song.id, step.id);
      if (!cell) return <View key={song.id} style={{ width: CELL_WIDTH, height: 56 }} />;
      return (
        <GridCell
          key={cell.id}
          isComplete={cell.isComplete}
          noteCount={getNoteCount(cell.id)}
          color={getStepColor(stepIndex)}
          onPress={() => onCellPress(cell, song, step)}
        />
      );
    })}
  </View>
))}
```

Replace the entire styles object:

```ts
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  row: { flexDirection: "row", alignItems: "center" },
  stepLabel: {
    width: STEP_COL_WIDTH,
    height: 56,
    justifyContent: "center",
    paddingHorizontal: 8,
    backgroundColor: theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  stepLabelText: { fontSize: 13, fontWeight: "500", color: theme.textPrimary },
  songHeader: {
    width: CELL_WIDTH,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    borderBottomWidth: 2,
    borderBottomColor: theme.border,
    backgroundColor: theme.surface,
  },
  songName: { fontSize: 12, fontWeight: "600", textAlign: "center", color: theme.textPrimary },
  addSongButton: {
    width: 40,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.surface,
  },
  addStepRow: {
    height: 40,
    justifyContent: "center",
    paddingLeft: 8,
    backgroundColor: theme.surface,
  },
  addButtonText: { fontSize: 18, color: theme.accent, fontWeight: "600" },
  inlineInput: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: theme.surface,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    gap: 8,
    alignItems: "center",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    padding: 8,
    fontSize: 14,
    color: theme.textPrimary,
    backgroundColor: theme.surfaceLight,
  },
  submitText: { color: theme.accent, fontWeight: "600", fontSize: 16 },
  cancelText: { color: theme.textSecondary, fontSize: 16 },
});
```

**Step 2: Commit**

```bash
git add apps/mobile/components/ProjectGrid.tsx
git commit -m "feat: pass rainbow step colors to grid cells, dark grid styles"
```

---

### Task 4: Update ProjectHeader

**Files:**
- Modify: `apps/mobile/components/ProjectHeader.tsx`

**Step 1: Update styles to dark theme**

Add import: `import { theme } from "../constants/theme";`

Replace styles:
```ts
const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: theme.surface, borderBottomWidth: 1, borderBottomColor: theme.border },
  name: { fontSize: 24, fontWeight: "bold", marginBottom: 8, color: theme.textPrimary },
  meta: { flexDirection: "row", alignItems: "center", gap: 16 },
  codeBadge: { backgroundColor: theme.surfaceLight, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  codeText: { fontSize: 16, fontWeight: "600", letterSpacing: 2, color: theme.textPrimary },
  copyHint: { fontSize: 10, color: theme.textTertiary, textAlign: "center" },
  members: { fontSize: 14, color: theme.textSecondary },
});
```

**Step 2: Commit**

```bash
git add apps/mobile/components/ProjectHeader.tsx
git commit -m "style: dark theme for ProjectHeader"
```

---

### Task 5: Update project screen

**Files:**
- Modify: `apps/mobile/app/(app)/project/[id].tsx`

**Step 1: Update styles**

Add import: `import { theme } from "../../../constants/theme";`

Replace styles:
```ts
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme.background },
});
```

**Step 2: Commit**

```bash
git add apps/mobile/app/\(app\)/project/\[id\].tsx
git commit -m "style: dark background for project screen"
```

---

### Task 6: Update CellDetailModal

**Files:**
- Modify: `apps/mobile/components/CellDetailModal.tsx`

**Step 1: Update styles to dark theme**

Add import: `import { theme } from "../constants/theme";`

Replace styles:
```ts
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: theme.overlay,
    justifyContent: "flex-end",
  },
  modal: {
    backgroundColor: theme.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "80%",
    minHeight: "50%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  songName: { fontSize: 18, fontWeight: "bold", color: theme.textPrimary },
  stepName: { fontSize: 14, color: theme.textSecondary, marginTop: 2 },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  toggleLabel: { fontSize: 16, color: theme.textPrimary },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.textSecondary,
    padding: 16,
    paddingBottom: 8,
  },
  inputRow: {
    flexDirection: "row",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    gap: 8,
    alignItems: "flex-end",
  },
  noteInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    maxHeight: 80,
    color: theme.textPrimary,
    backgroundColor: theme.surfaceLight,
  },
  sendButton: {
    backgroundColor: theme.accent,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  sendText: { color: "#fff", fontWeight: "600" },
  disabled: { opacity: 0.5 },
});
```

Also update the close icon color from `"#007AFF"` to `theme.textSecondary` and the Switch trackColor from `"#4caf50"` to `theme.success`.

**Step 2: Commit**

```bash
git add apps/mobile/components/CellDetailModal.tsx
git commit -m "style: dark theme for CellDetailModal"
```

---

### Task 7: Update NoteThread

**Files:**
- Modify: `apps/mobile/components/NoteThread.tsx`

**Step 1: Update styles**

Add import: `import { theme } from "../constants/theme";`

Replace styles:
```ts
const styles = StyleSheet.create({
  list: { flex: 1 },
  note: { padding: 12, borderBottomWidth: 1, borderBottomColor: theme.border },
  content: { fontSize: 15, marginBottom: 4, color: theme.textPrimary },
  meta: { fontSize: 12, color: theme.textTertiary },
  empty: { padding: 20, alignItems: "center" },
  emptyText: { color: theme.textSecondary, fontSize: 14 },
});
```

**Step 2: Commit**

```bash
git add apps/mobile/components/NoteThread.tsx
git commit -m "style: dark theme for NoteThread"
```

---

### Task 8: Update CreateProjectModal

**Files:**
- Modify: `apps/mobile/components/CreateProjectModal.tsx`

**Step 1: Update styles**

Add import: `import { theme } from "../constants/theme";`

Replace styles:
```ts
const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: theme.overlay, justifyContent: "center", padding: 20 },
  modal: { backgroundColor: theme.surface, borderRadius: 12, padding: 20 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 16, color: theme.textPrimary },
  input: { borderWidth: 1, borderColor: theme.border, borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 16, color: theme.textPrimary, backgroundColor: theme.surfaceLight },
  buttons: { flexDirection: "row", justifyContent: "flex-end", gap: 12 },
  cancelButton: { padding: 12 },
  cancelText: { color: theme.textSecondary, fontSize: 16 },
  createButton: { backgroundColor: theme.accent, padding: 12, borderRadius: 8, paddingHorizontal: 20 },
  createText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  disabled: { opacity: 0.5 },
});
```

Also add `placeholderTextColor={theme.textTertiary}` to the TextInput.

**Step 2: Commit**

```bash
git add apps/mobile/components/CreateProjectModal.tsx
git commit -m "style: dark theme for CreateProjectModal"
```

---

### Task 9: Update JoinProjectInput

**Files:**
- Modify: `apps/mobile/components/JoinProjectInput.tsx`

**Step 1: Update styles**

Add import: `import { theme } from "../constants/theme";`

Replace styles:
```ts
const styles = StyleSheet.create({
  container: { flexDirection: "row", gap: 8, marginBottom: 16 },
  input: { flex: 1, borderWidth: 1, borderColor: theme.border, borderRadius: 8, padding: 12, fontSize: 16, letterSpacing: 4, textAlign: "center", color: theme.textPrimary, backgroundColor: theme.surfaceLight },
  button: { backgroundColor: theme.accent, borderRadius: 8, paddingHorizontal: 20, justifyContent: "center" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  disabled: { opacity: 0.5 },
});
```

Also add `placeholderTextColor={theme.textTertiary}` to the TextInput.

**Step 2: Commit**

```bash
git add apps/mobile/components/JoinProjectInput.tsx
git commit -m "style: dark theme for JoinProjectInput"
```

---

### Task 10: Update project list screen (home)

**Files:**
- Modify: `apps/mobile/app/(app)/(tabs)/index.tsx`

**Step 1: Update styles**

Add import: `import { theme } from "../../../constants/theme";`

Replace styles:
```ts
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: theme.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme.background },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  title: { fontSize: 28, fontWeight: "bold", color: theme.textPrimary },
  addButton: { backgroundColor: theme.accent, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  addButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  projectCard: { backgroundColor: theme.surface, padding: 16, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: theme.border },
  projectName: { fontSize: 18, fontWeight: "600", marginBottom: 4, color: theme.textPrimary },
  inviteCode: { fontSize: 14, color: theme.textSecondary },
  empty: { alignItems: "center", marginTop: 40 },
  emptyText: { fontSize: 18, color: theme.textSecondary },
  emptySubtext: { fontSize: 14, color: theme.textTertiary, marginTop: 4 },
});
```

Note: removed shadow props from `projectCard` (shadows don't look good on dark backgrounds) and replaced with a subtle border.

**Step 2: Commit**

```bash
git add apps/mobile/app/\(app\)/\(tabs\)/index.tsx
git commit -m "style: dark theme for project list screen"
```

---

### Task 11: Update profile screen

**Files:**
- Modify: `apps/mobile/app/(app)/(tabs)/profile.tsx`

**Step 1: Update styles**

Add import: `import { theme } from "../../../constants/theme";`

Replace styles:
```ts
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: theme.background },
  card: { backgroundColor: theme.surface, borderRadius: 12, padding: 24, alignItems: "center", marginBottom: 24, borderWidth: 1, borderColor: theme.border },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: theme.accent, justifyContent: "center", alignItems: "center", marginBottom: 16 },
  avatarImage: { width: 72, height: 72, borderRadius: 36, marginBottom: 16 },
  avatarText: { color: "#fff", fontSize: 28, fontWeight: "bold" },
  name: { fontSize: 22, fontWeight: "bold", marginBottom: 4, color: theme.textPrimary },
  email: { fontSize: 16, color: theme.textSecondary },
  signOutButton: { backgroundColor: theme.surface, padding: 16, borderRadius: 12, alignItems: "center", borderWidth: 1, borderColor: theme.border },
  signOutText: { color: theme.danger, fontSize: 16, fontWeight: "600" },
});
```

**Step 2: Commit**

```bash
git add apps/mobile/app/\(app\)/\(tabs\)/profile.tsx
git commit -m "style: dark theme for profile screen"
```

---

### Task 12: Update sign-in screen

**Files:**
- Modify: `apps/mobile/app/(auth)/sign-in.tsx`

**Step 1: Update styles**

Add import: `import { theme } from "../../constants/theme";`

Replace styles:
```ts
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: theme.background },
  title: { fontSize: 28, fontWeight: "bold", textAlign: "center", marginBottom: 8, color: theme.textPrimary },
  subtitle: { fontSize: 16, color: theme.textSecondary, textAlign: "center", marginBottom: 40 },
  button: { padding: 14, borderRadius: 8, alignItems: "center", marginBottom: 12 },
  googleButton: { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border },
  googleButtonText: { color: theme.textPrimary, fontSize: 16, fontWeight: "600" },
  appleButton: { backgroundColor: "#FFFFFF" },
  appleButtonText: { color: "#000000", fontSize: 16, fontWeight: "600" },
});
```

Note: Apple button inverted — white bg with black text on dark background for contrast (Apple HIG for dark backgrounds).

**Step 2: Commit**

```bash
git add apps/mobile/app/\(auth\)/sign-in.tsx
git commit -m "style: dark theme for sign-in screen"
```

---

### Task 13: Update tab bar and navigation chrome

**Files:**
- Modify: `apps/mobile/app/(app)/(tabs)/_layout.tsx`
- Modify: `apps/mobile/app/(app)/_layout.tsx`

**Step 1: Style tab bar**

```tsx
import { Tabs } from "expo-router";
import { theme } from "../../../constants/theme";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: { backgroundColor: theme.surface, borderTopColor: theme.border },
        tabBarActiveTintColor: theme.textPrimary,
        tabBarInactiveTintColor: theme.textTertiary,
        headerStyle: { backgroundColor: theme.surface },
        headerTintColor: theme.textPrimary,
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Projects" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
```

**Step 2: Style app layout navigation header**

Update `apps/mobile/app/(app)/_layout.tsx` — change the back button icon color and add header styling:

```tsx
import { Stack } from "expo-router";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet } from "react-native";
import { Icon } from "../../components/ui/Icon";
import { theme } from "../../constants/theme";

function BackButton() {
  const router = useRouter();
  return (
    <Pressable onPress={() => router.back()} style={styles.backButton}>
      <Icon name="ChevronLeft" size={24} color={theme.textPrimary} />
    </Pressable>
  );
}

export default function AppLayout() {
  return (
    <Stack screenOptions={{
      headerShown: false,
      headerStyle: { backgroundColor: theme.surface },
      headerTintColor: theme.textPrimary,
      headerShadowVisible: false,
    }}>
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

**Step 3: Commit**

```bash
git add apps/mobile/app/\(app\)/\(tabs\)/_layout.tsx apps/mobile/app/\(app\)/_layout.tsx
git commit -m "style: dark theme for tab bar and navigation headers"
```

---

### Task 14: Clean up unused theme references

**Files:**
- Modify: `apps/mobile/hooks/use-theme-color.ts`
- Modify: `apps/mobile/components/themed-text.tsx`
- Modify: `apps/mobile/components/themed-view.tsx`

**Step 1: Check if these files are imported anywhere**

Search for imports of `useThemeColor`, `ThemedText`, `ThemedView`. If they are unused, delete the files. If they are used, update them to use the new `theme` export.

**Step 2: Commit**

```bash
git commit -m "chore: clean up unused theme utilities"
```

---

### Task 15: Visual verification

**Step 1: Start the app**

```bash
cd apps/mobile && bunx expo start --web
```

**Step 2: Verify each screen**

- Sign-in: Dark background, white title, styled buttons
- Project list: Dark background, dark cards with borders, white text
- Project grid: Rainbow-colored cells (outlined when incomplete, filled + white tick when complete), each step row a different color
- Cell detail modal: Dark surface, white text, styled inputs
- Profile: Dark background, accent avatar, dark cards
- Tab bar: Dark background, white/gray icons

**Step 3: Commit any fixes found during verification**

---

### Task 16: Typecheck

**Step 1: Run typecheck**

```bash
cd /Users/dec/Documents/Development/session-notes && turbo typecheck
```

**Step 2: Fix any type errors and commit**
