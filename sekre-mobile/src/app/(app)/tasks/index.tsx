import { View, TouchableOpacity } from 'react-native';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { ClipboardList, Plus } from 'lucide-react-native';

export default function TasksScreen() {
  return (
    <AppScreen edges={['top']}>
      {/* Header */}
      <View className="px-4 py-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex-row justify-between items-center">
        <AppText variant="h3">Tugas</AppText>
      </View>

      {/* Content */}
      <View className="flex-1 items-center justify-center p-4">
        <View className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 rounded-full items-center justify-center mb-4">
          <ClipboardList size={40} color="#2563eb" strokeWidth={1.5} />
        </View>
        <AppText variant="h3" className="mb-2">Belum Ada Tugas</AppText>
        <AppText variant="body" className="text-center text-gray-500 dark:text-gray-400 mb-8 max-w-[280px]">
          Fitur manajemen tugas sedang dalam tahap pengembangan. Segera hadir untuk Anda!
        </AppText>
      </View>

      {/* FAB */}
      <TouchableOpacity className="absolute bottom-6 right-6 w-14 h-14 bg-blue-600 rounded-full items-center justify-center shadow-lg shadow-blue-600/30">
        <Plus size={24} color="#ffffff" strokeWidth={2.5} />
      </TouchableOpacity>
    </AppScreen>
  );
}
