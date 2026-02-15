import { useState } from "react";
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert } from "react-native";
import { useJoinProject } from "../hooks/use-projects";
import { theme } from "../constants/theme";
import { useRouter } from "expo-router";

export function JoinProjectInput() {
  const [code, setCode] = useState("");
  const joinProject = useJoinProject();
  const router = useRouter();

  const handleJoin = async () => {
    if (code.length !== 6) return;
    try {
      const project = await joinProject.mutateAsync(code.toUpperCase());
      setCode("");
      router.push(`/(app)/project/${project.id}`);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to join project");
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter invite code"
        placeholderTextColor={theme.textTertiary}
        value={code}
        onChangeText={(t) => setCode(t.toUpperCase().slice(0, 6))}
        maxLength={6}
        autoCapitalize="characters"
      />
      <TouchableOpacity
        style={[styles.button, code.length !== 6 && styles.disabled]}
        onPress={handleJoin}
        disabled={code.length !== 6 || joinProject.isPending}
      >
        <Text style={styles.buttonText}>{joinProject.isPending ? "..." : "Join"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", gap: 8, marginBottom: 16 },
  input: { flex: 1, borderWidth: 1, borderColor: theme.border, borderRadius: 8, padding: 12, fontSize: 16, letterSpacing: 4, textAlign: "center", color: theme.textPrimary, backgroundColor: theme.surfaceLight },
  button: { backgroundColor: theme.accent, borderRadius: 8, paddingHorizontal: 20, justifyContent: "center" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  disabled: { opacity: 0.5 },
});
