import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ClipboardList, Plus } from 'lucide-react-native';

export default function TasksScreen() {
  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-4 py-4 bg-white border-b border-gray-100 flex-row justify-between items-center">
        <Text className="text-xl font-bold text-gray-900">Tugas</Text>
      </View>

      {/* Content */}
      <View className="flex-1 items-center justify-center p-4">
        <View className="w-20 h-20 bg-blue-50 rounded-full items-center justify-center mb-4">
          <ClipboardList size={40} color="#2563eb" strokeWidth={1.5} />
        </View>
        <Text className="text-xl font-bold text-gray-900 mb-2">Belum Ada Tugas</Text>
        <Text className="text-center text-gray-500 mb-8 max-w-[280px]">
          Fitur manajemen tugas sedang dalam tahap pengembangan. Segera hadir untuk Anda!
        </Text>
      </View>

      {/* FAB */}
      <TouchableOpacity className="absolute bottom-6 right-6 w-14 h-14 bg-blue-600 rounded-full items-center justify-center shadow-lg shadow-blue-600/30">
        <Plus size={24} color="#ffffff" strokeWidth={2.5} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
