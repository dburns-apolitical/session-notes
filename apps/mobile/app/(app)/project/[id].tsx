import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useProject, useAddSong, useAddStep, useToggleCell } from "../../../hooks/use-project";
import { ProjectHeader } from "../../../components/ProjectHeader";
import { ProjectGrid } from "../../../components/ProjectGrid";
import { CellDetailModal } from "../../../components/CellDetailModal";
import { useState } from "react";
import { useProjectWebSocket } from "../../../hooks/use-project-websocket";
import { theme } from "../../../constants/theme";

export default function ProjectScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: project, isLoading } = useProject(id!);
  const addSong = useAddSong(id!);
  const addStep = useAddStep(id!);
  const toggleCell = useToggleCell(id!);
  useProjectWebSocket(id!);
  const [selectedCell, setSelectedCell] = useState<any>(null);
  const [selectedSong, setSelectedSong] = useState<any>(null);
  const [selectedStep, setSelectedStep] = useState<any>(null);

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
        members={project.members || []}
      />
      <ProjectGrid
        songs={project.songs || []}
        steps={project.steps || []}
        cells={project.cells || []}
        notes={[]}
        onCellPress={(cell, song, step) => {
          setSelectedCell(cell);
          setSelectedSong(song);
          setSelectedStep(step);
        }}
        onAddSong={(name) => addSong.mutate(name)}
        onAddStep={(name) => addStep.mutate(name)}
      />
      <CellDetailModal
        visible={!!selectedCell}
        cell={selectedCell}
        songName={selectedSong?.name || ""}
        stepName={selectedStep?.name || ""}
        projectId={id!}
        onClose={() => {
          setSelectedCell(null);
          setSelectedSong(null);
          setSelectedStep(null);
        }}
        onToggleComplete={(cellId, isComplete) => {
          toggleCell.mutate({ cellId, isComplete });
          setSelectedCell((prev: any) => prev ? { ...prev, isComplete } : null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme.background },
});
