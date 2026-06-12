import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CalendarDays, Plus } from 'lucide-react-native';

export default function EventsScreen() {
  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-gray-50">
      <View className="px-4 py-4 bg-white border-b border-gray-100">
        <Text className="text-xl font-bold text-gray-900">Acara</Text>
      </View>

      <View className="flex-1 items-center justify-center p-4">
        <View className="w-20 h-20 bg-purple-50 rounded-full items-center justify-center mb-4">
          <CalendarDays size={40} color="#9333ea" strokeWidth={1.5} />
        </View>
        <Text className="text-xl font-bold text-gray-900 mb-2">Jadwal Acara</Text>
        <Text className="text-center text-gray-500 mb-8 max-w-[280px]">
          Fitur pengaturan acara dan kalender organisasi akan segera diluncurkan.
        </Text>
      </View>

      <TouchableOpacity className="absolute bottom-6 right-6 w-14 h-14 bg-blue-600 rounded-full items-center justify-center shadow-lg shadow-blue-600/30">
        <Plus size={24} color="#ffffff" strokeWidth={2.5} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
