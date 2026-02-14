import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import * as Clipboard from "expo-clipboard";

type Props = {
  name: string;
  inviteCode: string;
  memberCount: number;
};

export function ProjectHeader({ name, inviteCode, memberCount }: Props) {
  const copyCode = async () => {
    await Clipboard.setStringAsync(inviteCode);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{name}</Text>
      <View style={styles.meta}>
        <TouchableOpacity onPress={copyCode} style={styles.codeBadge}>
          <Text style={styles.codeText}>{inviteCode}</Text>
          <Text style={styles.copyHint}>tap to copy</Text>
        </TouchableOpacity>
        <Text style={styles.members}>{memberCount} member{memberCount !== 1 ? "s" : ""}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#eee" },
  name: { fontSize: 24, fontWeight: "bold", marginBottom: 8 },
  meta: { flexDirection: "row", alignItems: "center", gap: 16 },
  codeBadge: { backgroundColor: "#f0f0f0", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  codeText: { fontSize: 16, fontWeight: "600", letterSpacing: 2 },
  copyHint: { fontSize: 10, color: "#999", textAlign: "center" },
  members: { fontSize: 14, color: "#666" },
});
