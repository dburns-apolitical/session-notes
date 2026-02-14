import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useProject, useAddSong, useAddStep, useToggleCell } from "../../../hooks/use-project";
import { ProjectHeader } from "../../../components/ProjectHeader";
import { ProjectGrid } from "../../../components/ProjectGrid";
import { useState } from "react";

export default function ProjectScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: project, isLoading } = useProject(id!);
  const addSong = useAddSong(id!);
  const addStep = useAddStep(id!);
  const toggleCell = useToggleCell(id!);
  const [selectedCell, setSelectedCell] = useState<any>(null);

  if (isLoading || !project) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ProjectHeader
        name={project.name}
        inviteCode={project.inviteCode}
        memberCount={project.members?.length || 0}
      />
      <ProjectGrid
        songs={project.songs || []}
        steps={project.steps || []}
        cells={project.cells || []}
        notes={[]}
        onCellPress={(cell, song, step) => {
          // Toggle completion for now; modal will be added in Task 12
          toggleCell.mutate({ cellId: cell.id, isComplete: !cell.isComplete });
        }}
        onAddSong={(name) => addSong.mutate(name)}
        onAddStep={(name) => addStep.mutate(name)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
