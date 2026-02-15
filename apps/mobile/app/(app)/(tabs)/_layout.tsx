import { Image } from "react-native";
import { Tabs } from "expo-router";
import { theme } from "../../../constants/theme";
import { Icon } from "../../../components/ui/Icon";

const headerRight = () => (
  <Image
    source={require("../../../assets/logo.png")}
    style={{ width: 64, height: 64, marginRight: 16 }}
    resizeMode="contain"
  />
);

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: { backgroundColor: theme.surface, borderTopColor: theme.border },
        tabBarActiveTintColor: theme.textPrimary,
        tabBarInactiveTintColor: theme.textTertiary,
        headerStyle: { backgroundColor: theme.surface },
        headerTintColor: theme.textPrimary,
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Icon name="Home" color={color} size={size} />,
          headerRight,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <Icon name="User" color={color} size={size} />,
          headerRight,
        }}
      />
    </Tabs>
  );
}
