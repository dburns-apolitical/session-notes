import { useState } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { GridCell } from "./GridCell";
import { Icon } from "./ui/Icon";

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
const CELL_WIDTH = 80;

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
              <Icon name="Plus" size={18} color="#007AFF" />
            </TouchableOpacity>
          </View>

          {/* Grid rows: step label + cells */}
          <ScrollView showsVerticalScrollIndicator={true}>
            {sortedSteps.map((step) => (
              <View key={step.id} style={styles.row}>
                <View style={styles.stepLabel}>
                  <Text style={styles.stepLabelText} numberOfLines={2}>{step.name}</Text>
                </View>
                {sortedSongs.map((song) => {
                  const cell = getCell(song.id, step.id);
                  if (!cell) return <View key={song.id} style={{ width: CELL_WIDTH, height: 60 }} />;
                  return (
                    <GridCell
                      key={cell.id}
                      isComplete={cell.isComplete}
                      noteCount={getNoteCount(cell.id)}
                      onPress={() => onCellPress(cell, song, step)}
                    />
                  );
                })}
              </View>
            ))}

            {/* Add step button */}
            <TouchableOpacity style={styles.addStepRow} onPress={() => setShowAddStep(true)}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Icon name="Plus" size={16} color="#007AFF" />
                <Text style={styles.addButtonText}>Add Step</Text>
              </View>
            </TouchableOpacity>
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
  container: { flex: 1 },
  row: { flexDirection: "row" },
  stepLabel: { width: STEP_COL_WIDTH, height: 60, justifyContent: "center", paddingHorizontal: 8, backgroundColor: "#f8f8f8", borderBottomWidth: 1, borderBottomColor: "#eee" },
  stepLabelText: { fontSize: 13, fontWeight: "500" },
  songHeader: { width: CELL_WIDTH, height: 60, justifyContent: "center", alignItems: "center", paddingHorizontal: 4, borderBottomWidth: 2, borderBottomColor: "#ddd", backgroundColor: "#fafafa" },
  songName: { fontSize: 12, fontWeight: "600", textAlign: "center" },
  addSongButton: { width: 40, height: 60, justifyContent: "center", alignItems: "center", backgroundColor: "#f0f0f0" },
  addStepRow: { height: 40, justifyContent: "center", paddingLeft: 8, backgroundColor: "#f0f0f0" },
  addButtonText: { fontSize: 18, color: "#007AFF", fontWeight: "600" },
  inlineInput: { flexDirection: "row", padding: 12, backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#eee", gap: 8, alignItems: "center" },
  input: { flex: 1, borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 8, fontSize: 14 },
  submitText: { color: "#007AFF", fontWeight: "600", fontSize: 16 },
  cancelText: { color: "#999", fontSize: 16 },
});
