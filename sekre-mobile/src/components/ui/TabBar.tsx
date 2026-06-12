import { View, Pressable, Platform } from 'react-native';
import { AppText } from './AppText';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, withSpring, withTiming, interpolateColor, useDerivedValue } from 'react-native-reanimated';
import { House, ClipboardList, Wallet, CalendarDays, Settings2 } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const TabIcon = ({ name, color, focused }: { name: string; color: string; focused: boolean }) => {
  switch (name) {
    case 'index':
      return <House size={20} color={color} strokeWidth={focused ? 2.5 : 2} />;
    case 'tasks/index':
      return <ClipboardList size={20} color={color} strokeWidth={focused ? 2.5 : 2} />;
    case 'finance/index':
      return <Wallet size={20} color={color} strokeWidth={focused ? 2.5 : 2} />;
    case 'events/index':
      return <CalendarDays size={20} color={color} strokeWidth={focused ? 2.5 : 2} />;
    case 'settings/index':
      return <Settings2 size={20} color={color} strokeWidth={focused ? 2.5 : 2} />;
    default:
      return <House size={20} color={color} strokeWidth={focused ? 2.5 : 2} />;
  }
};

const TabLabel = ({ name }: { name: string }) => {
  switch (name) {
    case 'index':
      return 'Beranda';
    case 'tasks/index':
      return 'Tugas';
    case 'finance/index':
      return 'Keuangan';
    case 'events/index':
      return 'Acara';
    case 'settings/index':
      return 'Profil';
    default:
      return name;
  }
};

interface TabRoute {
  key: string;
  name: string;
  params?: any;
}

interface TabState {
  index: number;
  routes: TabRoute[];
}

interface TabDescriptor {
  options: {
    tabBarAccessibilityLabel?: string;
    tabBarTestID?: string;
    [key: string]: any;
  };
}

interface TabNavigation {
  emit: (event: any) => any;
  navigate: (name: string, params?: any) => void;
}

interface TabBarProps {
  state: TabState;
  descriptors: Record<string, TabDescriptor>;
  navigation: TabNavigation;
}

interface TabItemProps {
  isFocused: boolean;
  options: TabDescriptor['options'];
  onPress: () => void;
  onLongPress: () => void;
  route: TabRoute;
  color: string;
}

const TabItem = ({ isFocused, options, onPress, onLongPress, route, color }: TabItemProps) => {
  const progress = useDerivedValue(() => {
    return withTiming(isFocused ? 1 : 0, { duration: 150 });
  }, [isFocused]);

  const { colorScheme } = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const animatedIconStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withSpring(isFocused ? 1.05 : 1, { damping: 15, stiffness: 200 }),
        },
      ],
      backgroundColor: interpolateColor(
        progress.value,
        [0, 1],
        ['transparent', isDarkMode ? 'rgba(37, 99, 235, 0.15)' : 'rgba(37, 99, 235, 0.08)']
      ),
    };
  }, [isFocused, isDarkMode]);

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={options.tabBarAccessibilityLabel}
      testID={options.tabBarTestID}
      onPress={onPress}
      onLongPress={onLongPress}
      className="flex-1 items-center justify-center py-1"
    >
      <Animated.View style={[animatedIconStyle]} className="items-center justify-center rounded-2xl px-4 py-2 mb-0.5">
        <TabIcon name={route.name} color={color} focused={isFocused} />
      </Animated.View>
      <AppText
        variant="caption"
        className={`text-[10px] ${isFocused ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-400 dark:text-gray-500 font-medium'}`}
      >
        <TabLabel name={route.name} />
      </AppText>
    </AnimatedPressable>
  );
};

export function TabBar({ state, descriptors, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  return (
    <View
      className="flex-row items-center justify-between bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800/80 px-2"
      style={{
        paddingTop: 8,
        paddingBottom: Platform.OS === 'ios' ? insets.bottom : 12,
        shadowColor: isDarkMode ? '#000' : '#1e293b',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: isDarkMode ? 0.3 : 0.06,
        shadowRadius: 12,
        elevation: 8,
      }}
    >
      {state.routes.map((route: TabRoute, index: number) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        const color = isFocused 
          ? (isDarkMode ? '#60a5fa' : '#2563eb') 
          : (isDarkMode ? '#6b7280' : '#9ca3af');

        return (
          <TabItem
            key={route.key}
            isFocused={isFocused}
            options={options}
            onPress={onPress}
            onLongPress={onLongPress}
            route={route}
            color={color}
          />
        );
      })}
    </View>
  );
}
