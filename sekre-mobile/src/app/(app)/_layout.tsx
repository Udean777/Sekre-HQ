import { Tabs } from 'expo-router';
import { TabBar } from '@/components/ui/TabBar';

export default function AppLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="tasks/index" />
      <Tabs.Screen name="finance/index" />
      <Tabs.Screen name="events/index" />
      <Tabs.Screen name="settings/index" />
    </Tabs>
  );
}
