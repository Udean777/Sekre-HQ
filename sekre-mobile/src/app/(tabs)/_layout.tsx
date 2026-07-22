import { Tabs } from "expo-router";
import { useTheme } from "@/shared/lib/hooks/use-theme";
import {
  HouseIcon,
  CheckSquareIcon,
  WalletIcon,
  UserCircleIcon,
} from "phosphor-react-native";

export default function TabLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: theme.background,
        },
        headerTintColor: theme.text,
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopColor: theme.backgroundElement,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarActiveTintColor: theme.tint,
        tabBarInactiveTintColor: theme.textSecondary,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size, focused }) => (
            <HouseIcon
              color={color as string}
              size={size}
              weight={focused ? "fill" : "regular"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: "Tugas",
          tabBarLabel: "Tasks",
          tabBarIcon: ({ color, size, focused }) => (
            <CheckSquareIcon
              color={color as string}
              size={size}
              weight={focused ? "fill" : "regular"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="finance"
        options={{
          title: "Keuangan",
          tabBarLabel: "Finance",
          tabBarIcon: ({ color, size, focused }) => (
            <WalletIcon
              color={color as string}
              size={size}
              weight={focused ? "fill" : "regular"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarLabel: "Profile",
          tabBarIcon: ({ color, size, focused }) => (
            <UserCircleIcon
              color={color as string}
              size={size}
              weight={focused ? "fill" : "regular"}
            />
          ),
        }}
      />
    </Tabs>
  );
}
