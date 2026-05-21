import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { DashboardScreen } from '@presentation/screens/dashboard/DashboardScreen';
import { TasksNavigator } from './TasksNavigator';
import { EventsNavigator } from './EventsNavigator';
import { FinanceNavigator } from './FinanceNavigator';
import { SettingsNavigator } from './SettingsNavigator';
import { AppText } from '@presentation/components/Text';
import { colors, spacing } from '@presentation/theme';

export type AppTabParamList = {
  Dashboard: undefined;
  Tasks: undefined;
  Events: undefined;
  Finance: undefined;
  Settings: undefined;
};

// Tinggi tab bar — dipakai screen untuk padding bottom agar konten tidak tertutup
export const TAB_BAR_HEIGHT = 80;

const Tab = createBottomTabNavigator<AppTabParamList>();

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_CONFIG: Record<string, { label: string; active: IoniconName; inactive: IoniconName }> = {
  Dashboard: { label: 'Beranda', active: 'home', inactive: 'home-outline' },
  Tasks: { label: 'Tugas', active: 'checkmark-circle', inactive: 'checkmark-circle-outline' },
  Events: { label: 'Acara', active: 'calendar', inactive: 'calendar-outline' },
  Finance: { label: 'Keuangan', active: 'wallet', inactive: 'wallet-outline' },
  Settings: { label: 'Saya', active: 'person-circle', inactive: 'person-circle-outline' },
};

// ─── Custom Tab Bar ───────────────────────────────────────────────────────────

const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.tabBarWrapper, { paddingBottom: insets.bottom || spacing[3] }]}>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const descriptor = descriptors[route.key];
          if (!descriptor) return null;
          const { options } = descriptor;
          const isFocused = state.index === index;
          const config = TAB_CONFIG[route.name];
          if (!config) return null;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              activeOpacity={0.7}
              style={styles.tabItem}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel ?? config.label}
            >
              {/* Active indicator pill */}
              {isFocused ? <View style={styles.activePill} /> : null}

              <Ionicons
                name={isFocused ? config.active : config.inactive}
                size={22}
                color={isFocused ? colors.primary[500] : colors.neutral[400]}
              />
              <AppText
                style={[
                  styles.tabLabel,
                  { color: isFocused ? colors.primary[500] : colors.neutral[400] },
                ]}
              >
                {config.label}
              </AppText>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

// ─── Navigator ────────────────────────────────────────────────────────────────

export const AppNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Tasks" component={TasksNavigator} />
      <Tab.Screen name="Events" component={EventsNavigator} />
      <Tab.Screen name="Finance" component={FinanceNavigator} />
      <Tab.Screen name="Settings" component={SettingsNavigator} />
    </Tab.Navigator>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  tabBarWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing[4],
    paddingTop: spacing[2],
    backgroundColor: colors.transparent,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface.card,
    borderRadius: 20,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[2],
    ...Platform.select({
      ios: {
        shadowColor: colors.neutral[900],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[2],
    gap: 3,
    position: 'relative',
  },
  activePill: {
    position: 'absolute',
    top: 0,
    width: 32,
    height: 3,
    borderRadius: 999,
    backgroundColor: colors.primary[500],
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
});
