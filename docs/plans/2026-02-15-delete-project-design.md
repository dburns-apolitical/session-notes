# Delete Project Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Allow project owners to delete projects from the projects list via a trash icon with typed "DELETE" confirmation.

**Architecture:** Add a `useDeleteProject()` mutation hook, a `DeleteProjectModal` component (following `CreateProjectModal` patterns), and wire a `Trash2` icon into each owned project card. Backend already handles `DELETE /api/projects/:id` with owner-only auth and cascade deletion.

**Tech Stack:** React Native, Expo Router, TanStack Query, lucide-react-native

---

### Task 1: Add `useDeleteProject` hook

**Files:**
- Modify: `apps/mobile/hooks/use-projects.ts`

**Step 1: Add the mutation hook**

Append to `apps/mobile/hooks/use-projects.ts` after `useJoinProject`:

```typescript
export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (projectId: string) =>
      apiFetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}
```

**Step 2: Verify typecheck passes**

Run: `cd apps/mobile && bunx tsc --noEmit`
Expected: no errors

**Step 3: Commit**

```bash
git add apps/mobile/hooks/use-projects.ts
git commit -m "feat: add useDeleteProject mutation hook"
```

---

### Task 2: Create `DeleteProjectModal` component

**Files:**
- Create: `apps/mobile/components/DeleteProjectModal.tsx`

**Step 1: Create the modal component**

Create `apps/mobile/components/DeleteProjectModal.tsx` — follows `CreateProjectModal` style patterns exactly (same overlay, modal, input, button styles). Uses `theme.danger` for the delete button instead of `theme.accent`.

```tsx
import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet } from "react-native";
import { useDeleteProject } from "../hooks/use-projects";
import { theme } from "../constants/theme";

type Props = {
  visible: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
};

export function DeleteProjectModal({ visible, onClose, projectId, projectName }: Props) {
  const [confirmation, setConfirmation] = useState("");
  const deleteProject = useDeleteProject();

  const handleDelete = async () => {
    if (confirmation !== "DELETE") return;
    try {
      await deleteProject.mutateAsync(projectId);
      setConfirmation("");
      onClose();
    } catch (error: any) {
      // Server returns 403/404 — handled by disabled state + server-side auth
    }
  };

  const handleClose = () => {
    setConfirmation("");
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Delete Project</Text>
          <Text style={styles.warning}>
            This will permanently delete "{projectName}" and all its songs, steps, and notes.
          </Text>
          <Text style={styles.prompt}>Type DELETE to confirm:</Text>
          <TextInput
            style={styles.input}
            placeholder="DELETE"
            placeholderTextColor={theme.textTertiary}
            value={confirmation}
            onChangeText={setConfirmation}
            autoCapitalize="characters"
            autoFocus
          />
          <View style={styles.buttons}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.deleteButton, confirmation !== "DELETE" && styles.disabled]}
              onPress={handleDelete}
              disabled={confirmation !== "DELETE" || deleteProject.isPending}
            >
              <Text style={styles.deleteText}>
                {deleteProject.isPending ? "Deleting..." : "Delete"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: theme.overlay, justifyContent: "center", padding: 20 },
  modal: { backgroundColor: theme.surface, borderRadius: 12, padding: 20 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 8, color: theme.textPrimary },
  warning: { fontSize: 14, color: theme.textSecondary, marginBottom: 16 },
  prompt: { fontSize: 14, color: theme.textSecondary, marginBottom: 8 },
  input: { borderWidth: 1, borderColor: theme.border, borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 16, color: theme.textPrimary, backgroundColor: theme.surfaceLight },
  buttons: { flexDirection: "row", justifyContent: "flex-end", gap: 12 },
  cancelButton: { padding: 12 },
  cancelText: { color: theme.textSecondary, fontSize: 16 },
  deleteButton: { backgroundColor: theme.danger, padding: 12, borderRadius: 8, paddingHorizontal: 20 },
  deleteText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  disabled: { opacity: 0.5 },
});
```

**Step 2: Verify typecheck passes**

Run: `cd apps/mobile && bunx tsc --noEmit`
Expected: no errors

**Step 3: Commit**

```bash
git add apps/mobile/components/DeleteProjectModal.tsx
git commit -m "feat: add DeleteProjectModal with typed confirmation"
```

---

### Task 3: Wire trash icon and modal into projects screen

**Files:**
- Modify: `apps/mobile/app/(app)/(tabs)/index.tsx`

**Step 1: Update the projects screen**

Add imports for `useAuth`, `Icon`, and `DeleteProjectModal`. Add state for the project to delete. Show `Trash2` icon on owned project cards. Render the modal.

Changes to `apps/mobile/app/(app)/(tabs)/index.tsx`:

1. Add imports:
```typescript
import { useAuth } from "../../../contexts/auth";
import { Icon } from "../../../components/ui/Icon";
import { DeleteProjectModal } from "../../../components/DeleteProjectModal";
```

2. Inside `ProjectsScreen`, add after existing state:
```typescript
const { user } = useAuth();
const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
```

3. Replace the `renderItem` content — wrap the card in a row with the trash icon on the right:
```tsx
renderItem={({ item }) => (
  <TouchableOpacity
    style={styles.projectCard}
    onPress={() => router.push(`/(app)/project/${item.id}`)}
  >
    <View style={styles.projectCardContent}>
      <View style={styles.projectInfo}>
        <Text style={styles.projectName}>{item.name}</Text>
        <Text style={styles.inviteCode}>Code: {item.inviteCode}</Text>
      </View>
      {item.createdBy === user?.id && (
        <TouchableOpacity
          style={styles.deleteIcon}
          onPress={(e) => {
            e.stopPropagation();
            setDeleteTarget({ id: item.id, name: item.name });
          }}
          hitSlop={8}
        >
          <Icon name="Trash2" size={20} color={theme.danger} />
        </TouchableOpacity>
      )}
    </View>
  </TouchableOpacity>
)}
```

4. After `<CreateProjectModal ... />`, add:
```tsx
<DeleteProjectModal
  visible={deleteTarget !== null}
  onClose={() => setDeleteTarget(null)}
  projectId={deleteTarget?.id ?? ""}
  projectName={deleteTarget?.name ?? ""}
/>
```

5. Add these styles:
```typescript
projectCardContent: { flexDirection: "row", alignItems: "center" },
projectInfo: { flex: 1 },
deleteIcon: { padding: 8 },
```

**Step 2: Verify typecheck passes**

Run: `cd apps/mobile && bunx tsc --noEmit`
Expected: no errors

**Step 3: Manual test**

Run: `cd apps/mobile && bunx expo start --web`
- Verify trash icon shows only on owned projects
- Verify tapping trash opens confirmation modal
- Verify typing "DELETE" enables the button
- Verify cancel clears input and closes modal
- Verify delete removes project from list

**Step 4: Commit**

```bash
git add apps/mobile/app/'(app)'/'(tabs)'/index.tsx
git commit -m "feat: add delete project button with confirmation to projects screen"
```
