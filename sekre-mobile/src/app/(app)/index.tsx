import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useState, useCallback } from 'react';
import { useAuthStore } from '@/core/store/use-auth-store';
import { useLogout } from '@/hooks/use-auth';
import { Avatar } from '@/components/ui/Avatar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTasks } from '@/hooks/use-tasks';
import { useQueryClient } from '@tanstack/react-query';

export default function DashboardScreen() {
  const { user, organization, role } = useAuthStore();
  const logout = useLogout();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  // Queries
  const { data: pendingData, isLoading: loadingPending } = useTasks({ status: 'PENDING', page_size: 1 });
  const { data: progressData, isLoading: loadingProgress } = useTasks({ status: 'IN_PROGRESS', page_size: 1 });
  const { data: recentTasks, isLoading: loadingRecent } = useTasks({ page_size: 3 });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['tasks'] });
    setRefreshing(false);
  }, [queryClient]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView 
        className="flex-1 px-4 pt-6"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563eb']} />
        }
      >
        {/* Header Section */}
        <View className="flex-row justify-between items-center mb-8">
          <View className="flex-row items-center gap-4">
            <Avatar name={user?.full_name} size={56} />
            <View>
              <Text className="text-gray-500 text-sm font-medium">Halo,</Text>
              <Text className="text-gray-900 text-xl font-bold">{user?.full_name}</Text>
            </View>
          </View>
          <TouchableOpacity 
            onPress={() => logout.mutate()}
            className="bg-red-50 px-3 py-2 rounded-lg"
          >
            <Text className="text-red-600 font-medium text-sm">Keluar</Text>
          </TouchableOpacity>
        </View>

        {/* Organization Info */}
        <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
          <Text className="text-gray-500 text-sm font-medium mb-1">Organisasi Anda</Text>
          <Text className="text-gray-900 text-lg font-bold mb-2">
            {organization?.name || 'Memuat...'}
          </Text>
          <View className="flex-row items-center">
            <View className="bg-blue-50 px-2 py-1 rounded-md mr-2">
              <Text className="text-blue-600 text-xs font-bold">{role?.toUpperCase()}</Text>
            </View>
            <Text className="text-gray-400 text-xs">{organization?.subdomain}.sekre.app</Text>
          </View>
        </View>

        {/* Tasks Summary */}
        <Text className="text-gray-900 text-lg font-bold mb-4">Ringkasan Tugas</Text>
        <View className="flex-row gap-4 mb-8">
          {/* Card: Pending */}
          <View className="flex-1 bg-orange-50 p-4 rounded-2xl border border-orange-100">
            <Text className="text-orange-800 text-sm font-medium mb-2">Tertunda</Text>
            {loadingPending ? (
              <ActivityIndicator size="small" color="#c2410c" className="mt-1 items-start" />
            ) : (
              <Text className="text-orange-600 text-3xl font-bold">{pendingData?.pagination.total_items || 0}</Text>
            )}
          </View>

          {/* Card: In Progress */}
          <View className="flex-1 bg-blue-50 p-4 rounded-2xl border border-blue-100">
            <Text className="text-blue-800 text-sm font-medium mb-2">Dikerjakan</Text>
            {loadingProgress ? (
              <ActivityIndicator size="small" color="#1d4ed8" className="mt-1 items-start" />
            ) : (
              <Text className="text-blue-600 text-3xl font-bold">{progressData?.pagination.total_items || 0}</Text>
            )}
          </View>
        </View>

        {/* Recent Activities */}
        <Text className="text-gray-900 text-lg font-bold mb-4">Aktivitas Terbaru</Text>
        
        {loadingRecent ? (
          <View className="bg-white rounded-2xl p-6 border border-gray-100 items-center justify-center min-h-[160px] shadow-sm mb-8">
            <ActivityIndicator size="large" color="#2563eb" />
          </View>
        ) : recentTasks?.data && recentTasks.data.length > 0 ? (
          <View className="mb-8">
            {recentTasks.data.map((item) => (
              <View key={item.task.id} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm mb-3">
                <Text className="text-gray-900 font-bold mb-1" numberOfLines={1}>{item.task.title}</Text>
                <View className="flex-row justify-between items-center mt-2">
                  <View className="bg-gray-100 px-2 py-1 rounded-md">
                    <Text className="text-gray-600 text-xs font-medium">{item.task.status}</Text>
                  </View>
                  {item.assignee && (
                    <Text className="text-gray-500 text-xs">Untuk: {item.assignee.full_name}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View className="bg-white rounded-2xl p-6 border border-gray-100 items-center justify-center min-h-[160px] shadow-sm mb-8">
            <Text className="text-gray-400 text-center">
              Belum ada aktivitas yang tercatat di organisasi ini.
            </Text>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}
