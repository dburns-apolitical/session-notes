import { Stack } from "expo-router";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet } from "react-native";
import { Icon } from "../../components/ui/Icon";
import { theme } from "../../constants/theme";

function BackButton() {
  const router = useRouter();
  return (
    <Pressable onPress={() => router.back()} style={styles.backButton}>
      <Icon name="ChevronLeft" size={24} color={theme.textPrimary} />
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
          title: "Project",
          headerLeft: () => <BackButton />,
        }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  backButton: { paddingHorizontal: 8, paddingVertical: 4 },
});
