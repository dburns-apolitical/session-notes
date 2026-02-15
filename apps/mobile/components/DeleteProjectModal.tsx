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
