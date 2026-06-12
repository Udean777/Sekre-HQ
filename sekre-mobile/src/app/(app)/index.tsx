import { View, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { useState, useCallback } from 'react';
import { useAuthStore } from '@/core/store/use-auth-store';
import { Avatar } from '@/components/ui/Avatar';
import { useTasks } from '@/hooks/use-tasks';
import { useQueryClient } from '@tanstack/react-query';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { AppCard } from '@/components/ui/AppCard';
import { AppBadge } from '@/components/ui/AppBadge';

export default function DashboardScreen() {
  const { user, organization, role } = useAuthStore();
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
    <AppScreen 
      scrollable
      scrollViewProps={{
        refreshControl: <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563eb']} />,
        className: "px-4 pt-6"
      }}
    >
      {/* Header Section */}
      <View className="flex-row items-center gap-4 mb-8">
        <Avatar name={user?.full_name} size={56} />
        <View>
          <AppText variant="body" className="text-gray-500 font-medium">Halo,</AppText>
          <AppText variant="h2">{user?.full_name}</AppText>
        </View>
      </View>

      {/* Organization Info */}
      <AppCard className="mb-6">
        <AppText variant="body" className="text-gray-500 font-medium mb-1">Organisasi Anda</AppText>
        <AppText variant="h3" className="mb-2">
          {organization?.name || 'Memuat...'}
        </AppText>
        <View className="flex-row items-center">
          <AppBadge variant="info" label={role?.toUpperCase() || ''} className="mr-2" />
          <AppText variant="caption">{organization?.subdomain}.sekre.app</AppText>
        </View>
      </AppCard>

      {/* Tasks Summary */}
      <AppText variant="h3" className="mb-4">Ringkasan Tugas</AppText>
      <View className="flex-row gap-4 mb-8">
        {/* Card: Pending */}
        <AppCard variant="outlined" padding="sm" className="flex-1 bg-orange-50 border-orange-100">
          <AppText variant="label" className="text-orange-800 mb-2">Tertunda</AppText>
          {loadingPending ? (
            <ActivityIndicator size="small" color="#c2410c" className="mt-1 items-start" />
          ) : (
            <AppText variant="h1" className="text-orange-600">{pendingData?.pagination.total_items || 0}</AppText>
          )}
        </AppCard>

        {/* Card: In Progress */}
        <AppCard variant="outlined" padding="sm" className="flex-1 bg-blue-50 border-blue-100">
          <AppText variant="label" className="text-blue-800 mb-2">Dikerjakan</AppText>
          {loadingProgress ? (
            <ActivityIndicator size="small" color="#1d4ed8" className="mt-1 items-start" />
          ) : (
            <AppText variant="h1" className="text-blue-600">{progressData?.pagination.total_items || 0}</AppText>
          )}
        </AppCard>
      </View>

      {/* Recent Activities */}
      <AppText variant="h3" className="mb-4">Aktivitas Terbaru</AppText>
      
      {loadingRecent ? (
        <AppCard className="items-center justify-center min-h-[160px] mb-8">
          <ActivityIndicator size="large" color="#2563eb" />
        </AppCard>
      ) : recentTasks?.data && recentTasks.data.length > 0 ? (
        <View className="mb-8">
          {recentTasks.data.map((item) => (
            <AppCard key={item.task.id} className="mb-3" padding="sm">
              <AppText weight="bold" className="mb-1" numberOfLines={1}>{item.task.title}</AppText>
              <View className="flex-row justify-between items-center mt-2">
                <AppBadge 
                  variant={item.task.status === 'COMPLETED' ? 'success' : item.task.status === 'PENDING' ? 'warning' : 'info'} 
                  label={item.task.status} 
                />
                {item.assignee && (
                  <AppText variant="caption">Untuk: {item.assignee.full_name}</AppText>
                )}
              </View>
            </AppCard>
          ))}
        </View>
      ) : (
        <AppCard className="items-center justify-center min-h-[160px] mb-8">
          <AppText variant="body" className="text-gray-400 text-center">
            Belum ada aktivitas yang tercatat di organisasi ini.
          </AppText>
        </AppCard>
      )}

    </AppScreen>
  );
}
