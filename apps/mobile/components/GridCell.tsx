import { TouchableOpacity, Text, StyleSheet, View } from "react-native";

type Props = {
  isComplete: boolean;
  noteCount: number;
  onPress: () => void;
};

export function GridCell({ isComplete, noteCount, onPress }: Props) {
  return (
    <TouchableOpacity style={[styles.cell, isComplete && styles.complete]} onPress={onPress}>
      <Text style={styles.check}>{isComplete ? "\u2713" : ""}</Text>
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
  check: { fontSize: 20, color: "#4caf50" },
  noteBadge: { position: "absolute", top: 4, right: 4, backgroundColor: "#007AFF", borderRadius: 8, width: 16, height: 16, justifyContent: "center", alignItems: "center" },
  noteCount: { color: "#fff", fontSize: 10, fontWeight: "bold" },
});
