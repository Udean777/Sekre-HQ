import { View } from 'react-native';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { Wallet } from 'lucide-react-native';

export default function FinanceScreen() {
  return (
    <AppScreen edges={['top']}>
      <View className="px-4 py-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <AppText variant="h3">Keuangan</AppText>
      </View>

      <View className="flex-1 items-center justify-center p-4">
        <View className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/30 rounded-full items-center justify-center mb-4">
          <Wallet size={40} color="#10b981" strokeWidth={1.5} />
        </View>
        <AppText variant="h3" className="mb-2">Kas & Transaksi</AppText>
        <AppText variant="body" className="text-center text-gray-500 dark:text-gray-400 max-w-[280px]">
          Fitur pencatatan keuangan organisasi sedang dalam antrean rilis.
        </AppText>
      </View>
    </AppScreen>
  );
}
