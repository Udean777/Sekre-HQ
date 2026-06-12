import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Wallet } from 'lucide-react-native';

export default function FinanceScreen() {
  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-gray-50">
      <View className="px-4 py-4 bg-white border-b border-gray-100">
        <Text className="text-xl font-bold text-gray-900">Keuangan</Text>
      </View>

      <View className="flex-1 items-center justify-center p-4">
        <View className="w-20 h-20 bg-emerald-50 rounded-full items-center justify-center mb-4">
          <Wallet size={40} color="#10b981" strokeWidth={1.5} />
        </View>
        <Text className="text-xl font-bold text-gray-900 mb-2">Kas & Transaksi</Text>
        <Text className="text-center text-gray-500 max-w-[280px]">
          Fitur pencatatan keuangan organisasi sedang dalam antrean rilis.
        </Text>
      </View>
    </SafeAreaView>
  );
}
