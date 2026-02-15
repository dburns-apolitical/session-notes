import { View, Text, FlatList, StyleSheet } from "react-native";
import { theme } from "../constants/theme";

type Note = {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
};

type Props = {
  notes: Note[];
};

export function NoteThread({ notes }: Props) {
  if (notes.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No notes yet</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={notes}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.note}>
          <Text style={styles.content}>{item.content}</Text>
          <Text style={styles.meta}>
            {new Date(item.createdAt).toLocaleDateString()}{" "}
            {new Date(item.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
      )}
      style={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  list: { flex: 1 },
  note: { padding: 12, borderBottomWidth: 1, borderBottomColor: theme.border },
  content: { fontSize: 15, marginBottom: 4, color: theme.textPrimary },
  meta: { fontSize: 12, color: theme.textTertiary },
  empty: { padding: 20, alignItems: "center" },
  emptyText: { color: theme.textSecondary, fontSize: 14 },
});
