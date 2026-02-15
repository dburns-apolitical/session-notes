import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import * as Clipboard from "expo-clipboard";
import { theme } from "../constants/theme";

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
  container: { padding: 16, backgroundColor: theme.surface, borderBottomWidth: 1, borderBottomColor: theme.border },
  name: { fontSize: 24, fontWeight: "bold", marginBottom: 8, color: theme.textPrimary },
  meta: { flexDirection: "row", alignItems: "center", gap: 16 },
  codeBadge: { backgroundColor: theme.surfaceLight, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  codeText: { fontSize: 16, fontWeight: "600", letterSpacing: 2, color: theme.textPrimary },
  copyHint: { fontSize: 10, color: theme.textTertiary, textAlign: "center" },
  members: { fontSize: 14, color: theme.textSecondary },
});
