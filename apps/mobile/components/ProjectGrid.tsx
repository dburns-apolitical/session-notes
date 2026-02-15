import { useState } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { GridCell } from "./GridCell";
import { Icon } from "./ui/Icon";
import { theme, getStepColor } from "../constants/theme";

type Song = { id: string; name: string; position: number };
type Step = { id: string; name: string; position: number };
type Cell = { id: string; songId: string; stepId: string; isComplete: boolean };
type Note = { id: string; cellId: string };

type Props = {
  songs: Song[];
  steps: Step[];
  cells: Cell[];
  notes: Note[];
  onCellPress: (cell: Cell, song: Song, step: Step) => void;
  onAddSong: (name: string) => void;
  onAddStep: (name: string) => void;
};

const STEP_COL_WIDTH = 100;
const CELL_WIDTH = 52;

export function ProjectGrid({ songs, steps, cells, notes, onCellPress, onAddSong, onAddStep }: Props) {
  const [newSongName, setNewSongName] = useState("");
  const [newStepName, setNewStepName] = useState("");
  const [showAddSong, setShowAddSong] = useState(false);
  const [showAddStep, setShowAddStep] = useState(false);

  const sortedSongs = [...songs].sort((a, b) => a.position - b.position);
  const sortedSteps = [...steps].sort((a, b) => a.position - b.position);

  const getCell = (songId: string, stepId: string) =>
    cells.find((c) => c.songId === songId && c.stepId === stepId);

  const getNoteCount = (cellId: string) =>
    notes.filter((n) => n.cellId === cellId).length;

  const handleAddSong = () => {
    if (newSongName.trim()) {
      onAddSong(newSongName.trim());
      setNewSongName("");
      setShowAddSong(false);
    }
  };

  const handleAddStep = () => {
    if (newStepName.trim()) {
      onAddStep(newStepName.trim());
      setNewStepName("");
      setShowAddStep(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={true}>
        <View>
          {/* Header row: empty corner + song names */}
          <View style={styles.row}>
            <View style={styles.stepLabel}>
              <Text style={styles.stepLabelText}></Text>
            </View>
            {sortedSongs.map((song) => (
              <View key={song.id} style={styles.songHeader}>
                <Text style={styles.songName} numberOfLines={2}>{song.name}</Text>
              </View>
            ))}
            {/* Add song button */}
            <TouchableOpacity style={styles.addSongButton} onPress={() => setShowAddSong(true)}>
              <Icon name="Plus" size={18} color={theme.accent} />
            </TouchableOpacity>
          </View>

          {/* Grid rows: step label + cells */}
          <ScrollView showsVerticalScrollIndicator={true}>
            {sortedSteps.map((step, stepIndex) => (
              <View key={step.id} style={styles.row}>
                <View style={[styles.stepLabel, { borderLeftColor: getStepColor(stepIndex), borderLeftWidth: 3 }]}>
                  <Text style={styles.stepLabelText} numberOfLines={2}>{step.name}</Text>
                </View>
                {sortedSongs.map((song) => {
                  const cell = getCell(song.id, step.id);
                  if (!cell) return <View key={song.id} style={{ width: CELL_WIDTH, height: 52 }} />;
                  return (
                    <GridCell
                      key={cell.id}
                      isComplete={cell.isComplete}
                      noteCount={getNoteCount(cell.id)}
                      color={getStepColor(stepIndex)}
                      onPress={() => onCellPress(cell, song, step)}
                    />
                  );
                })}
              </View>
            ))}

            {/* Add step button */}
            <View style={styles.row}>
              <TouchableOpacity style={styles.addStepButton} onPress={() => setShowAddStep(true)}>
                <Icon name="Plus" size={18} color={theme.accent} />
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </ScrollView>

      {/* Add song input (shown when + clicked) */}
      {showAddSong && (
        <View style={styles.inlineInput}>
          <TextInput
            style={styles.input}
            placeholder="Song name"
            value={newSongName}
            onChangeText={setNewSongName}
            autoFocus
            onSubmitEditing={handleAddSong}
          />
          <TouchableOpacity onPress={handleAddSong}>
            <Text style={styles.submitText}>Add</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowAddSong(false)}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Add step input */}
      {showAddStep && (
        <View style={styles.inlineInput}>
          <TextInput
            style={styles.input}
            placeholder="Step name"
            value={newStepName}
            onChangeText={setNewStepName}
            autoFocus
            onSubmitEditing={handleAddStep}
          />
          <TouchableOpacity onPress={handleAddStep}>
            <Text style={styles.submitText}>Add</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowAddStep(false)}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  row: { flexDirection: "row", alignItems: "center" },
  stepLabel: {
    width: STEP_COL_WIDTH,
    height: 52,
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  stepLabelText: { fontSize: 13, fontWeight: "500", color: theme.textPrimary },
  songHeader: {
    width: CELL_WIDTH,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  songName: { fontSize: 12, fontWeight: "600", textAlign: "center", color: theme.textSecondary },
  addSongButton: {
    width: 40,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
  },
  addStepButton: {
    width: STEP_COL_WIDTH,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
    paddingLeft: 10,
  },
  inlineInput: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: theme.surface,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    gap: 8,
    alignItems: "center",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    padding: 8,
    fontSize: 14,
    color: theme.textPrimary,
    backgroundColor: theme.surfaceLight,
  },
  submitText: { color: theme.accent, fontWeight: "600", fontSize: 16 },
  cancelText: { color: theme.textSecondary, fontSize: 16 },
});
