import { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  Switch,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNotes, useAddNote } from "../hooks/use-notes";
import { NoteThread } from "./NoteThread";
import { Icon } from "./ui/Icon";
import { theme } from "../constants/theme";

type CellData = {
  id: string;
  songId: string;
  stepId: string;
  isComplete: boolean;
};

type Props = {
  visible: boolean;
  cell: CellData | null;
  songName: string;
  stepName: string;
  projectId: string;
  onClose: () => void;
  onToggleComplete: (cellId: string, isComplete: boolean) => void;
};

export function CellDetailModal({
  visible,
  cell,
  songName,
  stepName,
  projectId,
  onClose,
  onToggleComplete,
}: Props) {
  const [noteText, setNoteText] = useState("");
  const { data: notes } = useNotes(cell?.id ?? null);
  const addNote = useAddNote(cell?.id ?? "", projectId);

  const handleAddNote = async () => {
    if (!noteText.trim() || !cell) return;
    await addNote.mutateAsync(noteText.trim());
    setNoteText("");
  };

  if (!cell) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.overlay}
      >
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.songName}>{songName}</Text>
              <Text style={styles.stepName}>{stepName}</Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <Icon name="X" size={24} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Completion toggle */}
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Complete</Text>
            <Switch
              value={cell.isComplete}
              onValueChange={(value) => onToggleComplete(cell.id, value)}
              trackColor={{ true: theme.success }}
            />
          </View>

          {/* Notes */}
          <Text style={styles.sectionTitle}>Notes</Text>
          <NoteThread notes={notes || []} />

          {/* Add note input */}
          <View style={styles.inputRow}>
            <TextInput
              style={styles.noteInput}
              placeholder="Add a note..."
              value={noteText}
              onChangeText={setNoteText}
              multiline
            />
            <TouchableOpacity
              style={[styles.sendButton, !noteText.trim() && styles.disabled]}
              onPress={handleAddNote}
              disabled={!noteText.trim() || addNote.isPending}
            >
              <Text style={styles.sendText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

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
