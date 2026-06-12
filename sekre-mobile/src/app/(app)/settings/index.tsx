import { View, Pressable, ScrollView } from 'react-native';
import { User, Users, Building2, KeyRound, LogOut, ChevronRight, Moon, Sun, Monitor } from 'lucide-react-native';
import { useAuthStore } from '@/core/store/use-auth-store';
import { useThemeStore } from '@/core/store/use-theme-store';
import { useColorScheme } from 'nativewind';
import { useLogout } from '@/hooks/use-auth';
import { Avatar } from '@/components/ui/Avatar';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { cn } from '@/core/utils/cn';

export default function SettingsScreen() {
  const { user, organization } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const logout = useLogout();

  return (
    <AppScreen edges={['top']}>
      <View className="px-4 py-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <AppText variant="h3">Pengaturan</AppText>
      </View>

      <ScrollView className="flex-1">
        {/* Profile Card */}
        <View className="bg-white dark:bg-gray-800 p-4 mt-4 mb-6 border-y border-gray-100 dark:border-gray-800 flex-row items-center">
          <Avatar name={user?.full_name} size={60} />
          <View className="ml-4 flex-1">
            <AppText variant="h3">{user?.full_name}</AppText>
            <AppText variant="body" className="text-gray-500 dark:text-gray-400">{user?.email}</AppText>
            <AppText variant="label" className="text-blue-600 dark:text-blue-400 mt-1">{organization?.name}</AppText>
          </View>
        </View>

        {/* Preferences */}
        <AppText variant="label" className="px-4 mb-2 text-gray-500 dark:text-gray-400 uppercase tracking-wider">Preferensi</AppText>
        <View className="bg-white dark:bg-gray-800 border-y border-gray-100 dark:border-gray-800 mb-6">
          <View className="flex-row items-center p-4 border-b border-gray-100 dark:border-gray-800">
            <Moon size={20} color="#6b7280" />
            <AppText variant="label" className="flex-1 ml-3">Tema Aplikasi</AppText>
            <View className="flex-row bg-gray-100 dark:bg-gray-900 rounded-lg p-1">
              <Pressable
                onPress={() => setTheme('light')}
                className={cn('px-3 py-1.5 rounded-md', theme === 'light' && 'bg-white dark:bg-gray-700')}
                style={theme === 'light' ? { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 } : undefined}
              >
                <Sun size={16} color={theme === 'light' ? '#2563eb' : '#9ca3af'} />
              </Pressable>
              <Pressable
                onPress={() => setTheme('dark')}
                className={cn('px-3 py-1.5 rounded-md', theme === 'dark' && 'bg-white dark:bg-gray-700')}
                style={theme === 'dark' ? { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 } : undefined}
              >
                <Moon size={16} color={theme === 'dark' ? '#2563eb' : '#9ca3af'} />
              </Pressable>
              <Pressable
                onPress={() => setTheme('system')}
                className={cn('px-3 py-1.5 rounded-md', theme === 'system' && 'bg-white dark:bg-gray-700')}
                style={theme === 'system' ? { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 } : undefined}
              >
                <Monitor size={16} color={theme === 'system' ? '#2563eb' : '#9ca3af'} />
              </Pressable>
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <AppText variant="label" className="px-4 mb-2 text-gray-500 dark:text-gray-400 uppercase tracking-wider">Akun & Organisasi</AppText>
        <View className="bg-white dark:bg-gray-800 border-y border-gray-100 dark:border-gray-800 mb-6">
          <Pressable className="flex-row items-center p-4 border-b border-gray-100 dark:border-gray-800">
            <User size={20} color="#6b7280" />
            <AppText variant="label" className="flex-1 ml-3">Profil Pribadi</AppText>
            <ChevronRight size={20} color="#9ca3af" />
          </Pressable>
          <Pressable className="flex-row items-center p-4 border-b border-gray-100 dark:border-gray-800">
            <Users size={20} color="#6b7280" />
            <AppText variant="label" className="flex-1 ml-3">Daftar Anggota</AppText>
            <ChevronRight size={20} color="#9ca3af" />
          </Pressable>
          <Pressable className="flex-row items-center p-4 border-b border-gray-100 dark:border-gray-800">
            <Building2 size={20} color="#6b7280" />
            <AppText variant="label" className="flex-1 ml-3">Divisi Organisasi</AppText>
            <ChevronRight size={20} color="#9ca3af" />
          </Pressable>
          <Pressable className="flex-row items-center p-4">
            <KeyRound size={20} color="#6b7280" />
            <AppText variant="label" className="flex-1 ml-3">Ganti Password</AppText>
            <ChevronRight size={20} color="#9ca3af" />
          </Pressable>
        </View>

        {/* Logout Button */}
        <Pressable 
          onPress={() => logout.mutate()}
          className="bg-white dark:bg-gray-800 border-y border-gray-100 dark:border-gray-800 p-4 flex-row items-center justify-center mb-10"
        >
          <LogOut size={20} color="#ef4444" />
          <AppText weight="bold" className="ml-2 text-red-500">Keluar dari Akun</AppText>
        </Pressable>
      </ScrollView>
    </AppScreen>
  );
}
