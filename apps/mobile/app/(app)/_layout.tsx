import { Stack } from "expo-router";
import { useRouter } from "expo-router";
import { Pressable, Text, StyleSheet } from "react-native";
import { Icon } from "../../components/ui/Icon";
import { theme } from "../../constants/theme";

function BackButton() {
  const router = useRouter();
  return (
    <Pressable onPress={() => router.back()} style={styles.backButton}>
      <Icon name="ChevronLeft" size={20} color={theme.accent} />
      <Text style={styles.backText}>Projects</Text>
    </Pressable>
  );
}

export default function AppLayout() {
  return (
    <Stack screenOptions={{
      headerShown: false,
      headerStyle: { backgroundColor: theme.surface },
      headerTintColor: theme.textPrimary,
      headerShadowVisible: false,
    }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="project/[id]"
        options={{
          headerShown: true,
          title: "",
          headerBackTitle: "Projects",
          headerLeft: () => <BackButton />,
        }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  backButton: { flexDirection: "row", alignItems: "center", paddingHorizontal: 4, paddingVertical: 4 },
  backText: { color: theme.accent, fontSize: 16, marginLeft: 2 },
});
