import { View, TouchableOpacity, ScrollView } from 'react-native';
import { User, Users, Building2, KeyRound, LogOut, ChevronRight } from 'lucide-react-native';
import { useAuthStore } from '@/core/store/use-auth-store';
import { useLogout } from '@/hooks/use-auth';
import { Avatar } from '@/components/ui/Avatar';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';

export default function SettingsScreen() {
  const { user, organization } = useAuthStore();
  const logout = useLogout();

  return (
    <AppScreen edges={['top']} className="flex-1 bg-gray-50">
      <View className="px-4 py-4 bg-white border-b border-gray-100">
        <AppText variant="h3">Pengaturan</AppText>
      </View>

      <ScrollView className="flex-1">
        {/* Profile Card */}
        <View className="bg-white p-4 mt-4 mb-6 border-y border-gray-100 flex-row items-center">
          <Avatar name={user?.full_name} size={60} />
          <View className="ml-4 flex-1">
            <AppText variant="h3">{user?.full_name}</AppText>
            <AppText variant="body" className="text-gray-500">{user?.email}</AppText>
            <AppText variant="label" className="text-blue-600 mt-1">{organization?.name}</AppText>
          </View>
        </View>

        {/* Menu Items */}
        <View className="bg-white border-y border-gray-100 mb-6">
          <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-100">
            <User size={20} color="#4b5563" />
            <AppText variant="label" className="flex-1 ml-3">Profil Pribadi</AppText>
            <ChevronRight size={20} color="#9ca3af" />
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-100">
            <Users size={20} color="#4b5563" />
            <AppText variant="label" className="flex-1 ml-3">Daftar Anggota</AppText>
            <ChevronRight size={20} color="#9ca3af" />
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-100">
            <Building2 size={20} color="#4b5563" />
            <AppText variant="label" className="flex-1 ml-3">Divisi Organisasi</AppText>
            <ChevronRight size={20} color="#9ca3af" />
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center p-4">
            <KeyRound size={20} color="#4b5563" />
            <AppText variant="label" className="flex-1 ml-3">Ganti Password</AppText>
            <ChevronRight size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity 
          onPress={() => logout.mutate()}
          className="bg-white border-y border-gray-100 p-4 flex-row items-center justify-center mb-10"
        >
          <LogOut size={20} color="#ef4444" />
          <AppText weight="bold" className="ml-2 text-red-500">Keluar dari Akun</AppText>
        </TouchableOpacity>
      </ScrollView>
    </AppScreen>
  );
}
