import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import * as Clipboard from "expo-clipboard";
import { theme } from "../constants/theme";

type Member = {
  id: string;
  userId: string;
  name: string;
  image: string | null;
};

type Props = {
  name: string;
  inviteCode: string;
  members: Member[];
};

const AVATAR_SIZE = 24;
const AVATAR_OVERLAP = 8;

export function ProjectHeader({ name, inviteCode, members }: Props) {
  const copyCode = async () => {
    await Clipboard.setStringAsync(inviteCode);
  };

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Text style={styles.name}>{name}</Text>
        <View style={styles.memberRow}>
          <View style={styles.avatarStack}>
            {members.slice(0, 5).map((member, i) => (
              <View
                key={member.id}
                style={[styles.avatarWrapper, { marginLeft: i === 0 ? 0 : -AVATAR_OVERLAP }]}
              >
                {member.image ? (
                  <Image source={{ uri: member.image }} style={styles.avatarImage} />
                ) : (
                  <View style={styles.avatarFallback}>
                    <Text style={styles.avatarInitial}>
                      {member.name?.charAt(0)?.toUpperCase() || "?"}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
          <Text style={styles.memberCount}>
            {members.length} member{members.length !== 1 ? "s" : ""}
          </Text>
        </View>
      </View>
      <TouchableOpacity onPress={copyCode} style={styles.codeBadge}>
        <Text style={styles.codeText}>{inviteCode}</Text>
        <Text style={styles.copyHint}>tap to copy</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  left: { flex: 1 },
  name: { fontSize: 20, fontWeight: "bold", color: theme.textPrimary },
  memberRow: { flexDirection: "row", alignItems: "center", marginTop: 6, gap: 8 },
  avatarStack: { flexDirection: "row", alignItems: "center" },
  avatarWrapper: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 2,
    borderColor: theme.surface,
    overflow: "hidden",
  },
  avatarImage: {
    width: AVATAR_SIZE - 4,
    height: AVATAR_SIZE - 4,
    borderRadius: (AVATAR_SIZE - 4) / 2,
  },
  avatarFallback: {
    width: AVATAR_SIZE - 4,
    height: AVATAR_SIZE - 4,
    borderRadius: (AVATAR_SIZE - 4) / 2,
    backgroundColor: theme.accent,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: { color: "#fff", fontSize: 10, fontWeight: "bold" },
  memberCount: { fontSize: 13, color: theme.textSecondary },
  codeBadge: { backgroundColor: theme.surfaceLight, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, marginLeft: 12 },
  codeText: { fontSize: 14, fontWeight: "600", letterSpacing: 2, color: theme.textPrimary, textAlign: "center" },
  copyHint: { fontSize: 9, color: theme.textTertiary, textAlign: "center", marginTop: 1 },
});
