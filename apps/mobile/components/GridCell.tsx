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
