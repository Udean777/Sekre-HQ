import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/shared/lib/hooks/use-theme";
import {
  HouseIcon,
  CheckSquareIcon,
  WalletIcon,
  UserCircleIcon,
} from "phosphor-react-native";

export default function TabLayout() {
  const { t } = useTranslation();
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
          title: t("tabs.dashboard"),
          tabBarLabel: t("tabs.dashboard"),
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
          title: t("tabs.tasks"),
          tabBarLabel: t("tabs.tasks"),
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
          title: t("tabs.finance"),
          tabBarLabel: t("tabs.finance"),
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
          title: t("tabs.profile"),
          tabBarLabel: t("tabs.profile"),
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
