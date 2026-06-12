import { View, TouchableOpacity } from 'react-native';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { CalendarDays, Plus } from 'lucide-react-native';

export default function EventsScreen() {
  return (
    <AppScreen edges={['top']}>
      <View className="px-4 py-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <AppText variant="h3">Acara</AppText>
      </View>

      <View className="flex-1 items-center justify-center p-4">
        <View className="w-20 h-20 bg-purple-50 dark:bg-purple-900/30 rounded-full items-center justify-center mb-4">
          <CalendarDays size={40} color="#9333ea" strokeWidth={1.5} />
        </View>
        <AppText variant="h3" className="mb-2">Jadwal Acara</AppText>
        <AppText variant="body" className="text-center text-gray-500 dark:text-gray-400 mb-8 max-w-[280px]">
          Fitur pengaturan acara dan kalender organisasi akan segera diluncurkan.
        </AppText>
      </View>

      <TouchableOpacity className="absolute bottom-6 right-6 w-14 h-14 bg-blue-600 rounded-full items-center justify-center shadow-lg shadow-blue-600/30">
        <Plus size={24} color="#ffffff" strokeWidth={2.5} />
      </TouchableOpacity>
    </AppScreen>
  );
}
