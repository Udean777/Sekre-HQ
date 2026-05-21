import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DashboardScreen } from '@presentation/screens/dashboard/DashboardScreen';
import { TasksNavigator } from './TasksNavigator';
import { EventsScreen } from '@presentation/screens/events/EventsScreen';
import { FinanceScreen } from '@presentation/screens/finance/FinanceScreen';
import { SettingsScreen } from '@presentation/screens/settings/SettingsScreen';
import { colors, fontSize } from '@presentation/theme';

export type AppTabParamList = {
  Dashboard: undefined;
  Tasks: undefined;
  Events: undefined;
  Finance: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<AppTabParamList>();

export const AppNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary[500],
        tabBarInactiveTintColor: colors.text.secondary,
        tabBarStyle: {
          borderTopColor: colors.border.default,
          backgroundColor: colors.surface.card,
        },
        tabBarLabelStyle: {
          fontSize: fontSize.xs,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ tabBarLabel: 'Dashboard' }}
      />
      <Tab.Screen
        name="Tasks"
        component={TasksNavigator}
        options={{ tabBarLabel: 'Tugas' }}
      />
      <Tab.Screen
        name="Events"
        component={EventsScreen}
        options={{ tabBarLabel: 'Acara' }}
      />
      <Tab.Screen
        name="Finance"
        component={FinanceScreen}
        options={{ tabBarLabel: 'Keuangan' }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ tabBarLabel: 'Pengaturan' }}
      />
    </Tab.Navigator>
  );
};
