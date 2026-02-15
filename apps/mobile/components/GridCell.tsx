import { TouchableOpacity, StyleSheet, View, Text } from "react-native";
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
