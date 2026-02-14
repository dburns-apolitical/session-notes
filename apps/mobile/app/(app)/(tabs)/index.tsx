import { View, Text, StyleSheet } from "react-native";

export default function Projects() {
  return (
    <View style={styles.container}>
      <Text>Projects</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
