import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform } from "react-native";
import { authClient } from "../../lib/auth-client";

export default function SignIn() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleOAuthSignIn = async (provider: "google" | "apple") => {
    setLoading(provider);
    try {
      await authClient.signIn.social({
        provider,
        callbackURL: "/(app)/(tabs)",
      });
    } catch (error: any) {
      Alert.alert("Error", error.message || `Sign in with ${provider} failed`);
    } finally {
      setLoading(null);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Session Notes</Text>
      <Text style={styles.subtitle}>Sign in to get started</Text>

      <TouchableOpacity
        style={[styles.button, styles.googleButton]}
        onPress={() => handleOAuthSignIn("google")}
        disabled={loading !== null}
      >
        <Text style={styles.googleButtonText}>
          {loading === "google" ? "Signing in..." : "Sign in with Google"}
        </Text>
      </TouchableOpacity>

      {Platform.OS === "ios" || Platform.OS === "web" ? (
        <TouchableOpacity
          style={[styles.button, styles.appleButton]}
          onPress={() => handleOAuthSignIn("apple")}
          disabled={loading !== null}
        >
          <Text style={styles.appleButtonText}>
            {loading === "apple" ? "Signing in..." : "Sign in with Apple"}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 28, fontWeight: "bold", textAlign: "center", marginBottom: 8 },
  subtitle: { fontSize: 16, color: "#666", textAlign: "center", marginBottom: 40 },
  button: { padding: 14, borderRadius: 8, alignItems: "center", marginBottom: 12 },
  googleButton: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#ddd" },
  googleButtonText: { color: "#333", fontSize: 16, fontWeight: "600" },
  appleButton: { backgroundColor: "#000" },
  appleButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
