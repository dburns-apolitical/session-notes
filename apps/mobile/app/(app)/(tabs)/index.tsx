import { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useProjects } from "../../../hooks/use-projects";
import { CreateProjectModal } from "../../../components/CreateProjectModal";
import { JoinProjectInput } from "../../../components/JoinProjectInput";

export default function ProjectsScreen() {
  const { data: projects, isLoading } = useProjects();
  const [showCreate, setShowCreate] = useState(false);
  const router = useRouter();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Projects</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowCreate(true)}>
          <Text style={styles.addButtonText}>+ New</Text>
        </TouchableOpacity>
      </View>

      <JoinProjectInput />

      <FlatList
        data={projects || []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.projectCard}
            onPress={() => router.push(`/(app)/project/${item.id}`)}
          >
            <Text style={styles.projectName}>{item.name}</Text>
            <Text style={styles.inviteCode}>Code: {item.inviteCode}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No projects yet</Text>
            <Text style={styles.emptySubtext}>Create one or join with an invite code</Text>
          </View>
        }
      />

      <CreateProjectModal visible={showCreate} onClose={() => setShowCreate(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f5f5f5" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  title: { fontSize: 28, fontWeight: "bold" },
  addButton: { backgroundColor: "#007AFF", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  addButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  projectCard: { backgroundColor: "#fff", padding: 16, borderRadius: 12, marginBottom: 8, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  projectName: { fontSize: 18, fontWeight: "600", marginBottom: 4 },
  inviteCode: { fontSize: 14, color: "#666" },
  empty: { alignItems: "center", marginTop: 40 },
  emptyText: { fontSize: 18, color: "#999" },
  emptySubtext: { fontSize: 14, color: "#bbb", marginTop: 4 },
});
