import { View, Text, Pressable } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { House, ClipboardList, Wallet, CalendarDays, Settings2 } from 'lucide-react-native';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const TabIcon = ({ name, color, focused }: { name: string; color: string; focused: boolean }) => {
  switch (name) {
    case 'index':
      return <House size={24} color={color} strokeWidth={focused ? 2.5 : 2} />;
    case 'tasks/index':
      return <ClipboardList size={24} color={color} strokeWidth={focused ? 2.5 : 2} />;
    case 'finance/index':
      return <Wallet size={24} color={color} strokeWidth={focused ? 2.5 : 2} />;
    case 'events/index':
      return <CalendarDays size={24} color={color} strokeWidth={focused ? 2.5 : 2} />;
    case 'settings/index':
      return <Settings2 size={24} color={color} strokeWidth={focused ? 2.5 : 2} />;
    default:
      return <House size={24} color={color} strokeWidth={focused ? 2.5 : 2} />;
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

const TabItem = ({ isFocused, options, onPress, onLongPress, route, color }: any) => {
  const animatedIconStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withSpring(isFocused ? 1.15 : 1, { damping: 12, stiffness: 150 }),
        },
      ],
    };
  }, [isFocused]);

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={options.tabBarAccessibilityLabel}
      testID={options.tabBarTestID}
      onPress={onPress}
      onLongPress={onLongPress}
      className="flex-1 items-center justify-center"
    >
      <Animated.View style={animatedIconStyle} className={`items-center justify-center rounded-2xl px-4 py-1.5 ${isFocused ? 'bg-blue-50' : ''}`}>
        <TabIcon name={route.name} color={color} focused={isFocused} />
      </Animated.View>
      <Text
        className={`text-[10px] mt-1 ${isFocused ? 'text-blue-600 font-bold' : 'text-gray-400 font-medium'}`}
      >
        <TabLabel name={route.name} />
      </Text>
    </AnimatedPressable>
  );
};

export function TabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-row items-center justify-between bg-white pt-3 pb-2 px-4 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] border-t border-gray-100"
      style={{ paddingBottom: insets.bottom + 8 }}
    >
      {state.routes.map((route: any, index: number) => {
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

        const color = isFocused ? '#2563eb' : '#9ca3af';

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
