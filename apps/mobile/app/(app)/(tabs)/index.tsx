import { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useProjects } from "../../../hooks/use-projects";
import { theme } from "../../../constants/theme";
import { CreateProjectModal } from "../../../components/CreateProjectModal";
import { JoinProjectInput } from "../../../components/JoinProjectInput";
import { useAuth } from "../../../contexts/auth";
import { Icon } from "../../../components/ui/Icon";
import { DeleteProjectModal } from "../../../components/DeleteProjectModal";

export default function ProjectsScreen() {
  const { data: projects, isLoading } = useProjects();
  const [showCreate, setShowCreate] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

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
            <View style={styles.projectCardContent}>
              <View style={styles.projectInfo}>
                <Text style={styles.projectName}>{item.name}</Text>
                <Text style={styles.inviteCode}>Code: {item.inviteCode}</Text>
              </View>
              {item.createdBy === user?.id && (
                <TouchableOpacity
                  style={styles.deleteIcon}
                  onPress={(e) => {
                    e.stopPropagation();
                    setDeleteTarget({ id: item.id, name: item.name });
                  }}
                  hitSlop={8}
                >
                  <Icon name="Trash2" size={20} color={theme.danger} />
                </TouchableOpacity>
              )}
            </View>
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
      <DeleteProjectModal
        visible={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        projectId={deleteTarget?.id ?? ""}
        projectName={deleteTarget?.name ?? ""}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: theme.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme.background },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  title: { fontSize: 28, fontWeight: "bold", color: theme.textPrimary },
  addButton: { backgroundColor: theme.accent, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  addButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  projectCard: { backgroundColor: theme.surface, padding: 16, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: theme.border },
  projectName: { fontSize: 18, fontWeight: "600", marginBottom: 4, color: theme.textPrimary },
  inviteCode: { fontSize: 14, color: theme.textSecondary },
  empty: { alignItems: "center", marginTop: 40 },
  emptyText: { fontSize: 18, color: theme.textSecondary },
  emptySubtext: { fontSize: 14, color: theme.textTertiary, marginTop: 4 },
  projectCardContent: { flexDirection: "row", alignItems: "center" },
  projectInfo: { flex: 1 },
  deleteIcon: { padding: 8 },
});
