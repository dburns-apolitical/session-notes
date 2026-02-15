import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet } from "react-native";
import { useCreateProject } from "../hooks/use-projects";
import { theme } from "../constants/theme";
import { useRouter } from "expo-router";

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function CreateProjectModal({ visible, onClose }: Props) {
  const [name, setName] = useState("");
  const createProject = useCreateProject();
  const router = useRouter();

  const handleCreate = async () => {
    if (!name.trim()) return;
    try {
      const project = await createProject.mutateAsync(name.trim());
      setName("");
      onClose();
      router.push(`/(app)/project/${project.id}`);
    } catch (error: any) {
      // Handle error
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>New Project</Text>
          <TextInput
            style={styles.input}
            placeholder="Project name"
            placeholderTextColor={theme.textTertiary}
            value={name}
            onChangeText={setName}
            autoFocus
          />
          <View style={styles.buttons}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.createButton, !name.trim() && styles.disabled]}
              onPress={handleCreate}
              disabled={!name.trim() || createProject.isPending}
            >
              <Text style={styles.createText}>
                {createProject.isPending ? "Creating..." : "Create"}
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
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 16, color: theme.textPrimary },
  input: { borderWidth: 1, borderColor: theme.border, borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 16, color: theme.textPrimary, backgroundColor: theme.surfaceLight },
  buttons: { flexDirection: "row", justifyContent: "flex-end", gap: 12 },
  cancelButton: { padding: 12 },
  cancelText: { color: theme.textSecondary, fontSize: 16 },
  createButton: { backgroundColor: theme.accent, padding: 12, borderRadius: 8, paddingHorizontal: 20 },
  createText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  disabled: { opacity: 0.5 },
});
