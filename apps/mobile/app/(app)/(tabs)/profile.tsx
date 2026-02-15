import { View, Text, TouchableOpacity, StyleSheet, Alert, Image } from "react-native";
import { useAuth } from "../../../contexts/auth";
import { theme } from "../../../constants/theme";
import { authClient } from "../../../lib/auth-client";

export default function ProfileScreen() {
  const { user } = useAuth();

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
    } catch (error: any) {
      Alert.alert("Error", "Failed to sign out");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {user?.image ? (
          <Image source={{ uri: user.image }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0)?.toUpperCase() || "?"}
            </Text>
          </View>
        )}
        <Text style={styles.name}>{user?.name || "User"}</Text>
        <Text style={styles.email}>{user?.email || ""}</Text>
      </View>

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: theme.background },
  card: { backgroundColor: theme.surface, borderRadius: 12, padding: 24, alignItems: "center", marginBottom: 24, borderWidth: 1, borderColor: theme.border },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: theme.accent, justifyContent: "center", alignItems: "center", marginBottom: 16 },
  avatarImage: { width: 72, height: 72, borderRadius: 36, marginBottom: 16 },
  avatarText: { color: "#fff", fontSize: 28, fontWeight: "bold" },
  name: { fontSize: 22, fontWeight: "bold", marginBottom: 4, color: theme.textPrimary },
  email: { fontSize: 16, color: theme.textSecondary },
  signOutButton: { backgroundColor: theme.surface, padding: 16, borderRadius: 12, alignItems: "center", borderWidth: 1, borderColor: theme.border },
  signOutText: { color: theme.danger, fontSize: 16, fontWeight: "600" },
});
