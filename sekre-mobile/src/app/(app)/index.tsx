import { View, RefreshControl, ActivityIndicator, Pressable } from 'react-native';
import { useState, useCallback } from 'react';
import { useAuthStore } from '@/core/store/use-auth-store';
import { Avatar } from '@/components/ui/Avatar';
import { useTasks } from '@/hooks/use-tasks';
import { useQueryClient } from '@tanstack/react-query';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { AppCard } from '@/components/ui/AppCard';
import { AppBadge } from '@/components/ui/AppBadge';
import { useColorScheme } from 'nativewind';
import { Bell, Building2, Clock, Play, ArrowRight, ClipboardList, CheckCircle2, TrendingUp } from 'lucide-react-native';

function StatCard({
  label,
  count,
  loading,
  icon,
  accentColor,
  cardClassName,
  iconClassName,
  countClassName,
  isDarkMode,
}: {
  label: string;
  count: number;
  loading: boolean;
  icon: React.ReactNode;
  accentColor: string;
  cardClassName: string;
  iconClassName: string;
  countClassName: string;
  isDarkMode: boolean;
}) {
  return (
    <AppCard
      variant="outlined"
      padding="md"
      className={`flex-1 ${cardClassName}`}
      style={{
        shadowColor: isDarkMode ? '#000' : '#1e293b',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isDarkMode ? 0.2 : 0.05,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      <View className={`w-10 h-10 rounded-xl items-center justify-center mb-3 ${iconClassName}`}>
        {icon}
      </View>

      {loading ? (
        <ActivityIndicator size="small" color={accentColor} style={{ alignSelf: 'flex-start', marginBottom: 4 }} />
      ) : (
        <AppText className={`text-4xl font-bold leading-none mb-1 ${countClassName}`}>
          {count}
        </AppText>
      )}

      <AppText className="text-xs font-semibold tracking-wide uppercase text-gray-500 dark:text-gray-400">
        {label}
      </AppText>
    </AppCard>
  );
}

export default function DashboardScreen() {
  const { user, organization, role } = useAuthStore();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const { colorScheme } = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const { data: pendingData, isLoading: loadingPending } = useTasks({ status: 'PENDING', page_size: 1 });
  const { data: progressData, isLoading: loadingProgress } = useTasks({ status: 'IN_PROGRESS', page_size: 1 });
  const { data: recentTasks, isLoading: loadingRecent } = useTasks({ page_size: 5 });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['tasks'] });
    setRefreshing(false);
  }, [queryClient]);

  const getGreeting = () => {
    const hrs = new Date().getHours();
    if (hrs < 11) return 'Selamat pagi';
    if (hrs < 15) return 'Selamat siang';
    if (hrs < 18) return 'Selamat sore';
    return 'Selamat malam';
  };

  const cardShadow = {
    shadowColor: isDarkMode ? '#000' : '#1e293b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDarkMode ? 0.25 : 0.04,
    shadowRadius: 8,
    elevation: 3,
  };

  return (
    <AppScreen
      scrollable
      scrollViewProps={{
        refreshControl: <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563eb']} />,
        className: 'px-5 pt-6',
      }}
    >
      {/* ─── Header ─── */}
      <View className="flex-row items-center justify-between mb-6">
        <View className="flex-row items-center gap-3.5">
          <Avatar name={user?.full_name} size={50} />
          <View>
            <AppText variant="caption" className="text-gray-400 dark:text-gray-500 font-medium">
              {getGreeting()},
            </AppText>
            <AppText variant="h3" className="text-gray-900 dark:text-gray-50 font-bold">
              {user?.full_name}
            </AppText>
          </View>
        </View>
        <Pressable
          className="p-2.5 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 active:opacity-70"
          style={cardShadow}
        >
          <Bell size={20} color={isDarkMode ? '#9ca3af' : '#4b5563'} />
        </Pressable>
      </View>

      {/* ─── Organization Card ─── */}
      <AppCard
        variant="outlined"
        className="mb-6 bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700/60"
        style={cardShadow}
      >
        <View className="flex-row items-center gap-3">
          <View className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40">
            <Building2 size={22} color={isDarkMode ? '#60a5fa' : '#2563eb'} />
          </View>
          <View className="flex-1">
            <AppText variant="caption" className="text-gray-400 dark:text-gray-500 font-medium">
              Organisasi Aktif
            </AppText>
            <AppText variant="h3" className="text-gray-900 dark:text-gray-50 font-bold mb-1">
              {organization?.name || 'Memuat...'}
            </AppText>
            <View className="flex-row items-center justify-between">
              <AppText variant="caption" className="text-gray-400 dark:text-gray-500">
                {organization?.subdomain}.sekre.app
              </AppText>
              <AppBadge variant="info" label={role?.toUpperCase() || ''} />
            </View>
          </View>
        </View>
      </AppCard>

      {/* ─── Task Stats ─── */}
      <View className="mb-6">
        <View className="flex-row items-center justify-between mb-3.5">
          <AppText variant="h3" className="font-bold text-gray-900 dark:text-gray-50">
            Ringkasan Tugas
          </AppText>
          <TrendingUp size={16} color={isDarkMode ? '#6b7280' : '#9ca3af'} />
        </View>
        <View className="flex-row gap-3">
          <StatCard
            label="Tertunda"
            count={pendingData?.pagination.total_items || 0}
            loading={loadingPending}
            isDarkMode={isDarkMode}
            icon={<Clock size={20} color={isDarkMode ? '#fb923c' : '#ea580c'} />}
            accentColor="#ea580c"
            cardClassName="bg-orange-50 dark:bg-orange-950/20 border-orange-100 dark:border-orange-900/30"
            iconClassName="bg-orange-100 dark:bg-orange-900/40"
            countClassName="text-orange-600 dark:text-orange-400"
          />
          <StatCard
            label="Dikerjakan"
            count={progressData?.pagination.total_items || 0}
            loading={loadingProgress}
            isDarkMode={isDarkMode}
            icon={<Play size={20} color={isDarkMode ? '#60a5fa' : '#2563eb'} />}
            accentColor="#2563eb"
            cardClassName="bg-blue-50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/30"
            iconClassName="bg-blue-100 dark:bg-blue-900/40"
            countClassName="text-blue-600 dark:text-blue-400"
          />
        </View>
      </View>

      {/* ─── Recent Activities ─── */}
      <View className="mb-8">
        <View className="flex-row justify-between items-center mb-3.5">
          <AppText variant="h3" className="font-bold text-gray-900 dark:text-gray-50">
            Aktivitas Terbaru
          </AppText>
          <Pressable className="flex-row items-center gap-1">
            <AppText variant="caption" className="text-blue-600 dark:text-blue-400 font-semibold">
              Lihat Semua
            </AppText>
            <ArrowRight size={12} color={isDarkMode ? '#60a5fa' : '#2563eb'} />
          </Pressable>
        </View>

        {loadingRecent ? (
          <AppCard
            variant="outlined"
            className="items-center justify-center min-h-[160px] bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700/60"
            style={cardShadow}
          >
            <ActivityIndicator size="large" color="#2563eb" />
          </AppCard>
        ) : recentTasks?.data && recentTasks.data.length > 0 ? (
          <View className="gap-3">
            {recentTasks.data.map((item) => (
              <AppCard
                key={item.task.id}
                variant="outlined"
                padding="sm"
                className="bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700/60"
                style={cardShadow}
              >
                <View className="flex-row items-center gap-3">
                  <View
                    className={`p-2.5 rounded-xl ${
                      item.task.status === 'COMPLETED'
                        ? 'bg-green-50 dark:bg-green-950/30'
                        : item.task.status === 'PENDING'
                        ? 'bg-orange-50 dark:bg-orange-950/30'
                        : 'bg-blue-50 dark:bg-blue-950/30'
                    }`}
                  >
                    {item.task.status === 'COMPLETED' ? (
                      <CheckCircle2 size={18} color={isDarkMode ? '#4ade80' : '#16a34a'} />
                    ) : item.task.status === 'PENDING' ? (
                      <Clock size={18} color={isDarkMode ? '#fb923c' : '#ea580c'} />
                    ) : (
                      <ClipboardList size={18} color={isDarkMode ? '#60a5fa' : '#2563eb'} />
                    )}
                  </View>
                  <View className="flex-1">
                    <AppText
                      weight="semibold"
                      className="text-gray-900 dark:text-gray-50 text-[14px] mb-1.5"
                      numberOfLines={1}
                    >
                      {item.task.title}
                    </AppText>
                    <View className="flex-row justify-between items-center">
                      <AppBadge
                        variant={
                          item.task.status === 'COMPLETED'
                            ? 'success'
                            : item.task.status === 'PENDING'
                            ? 'warning'
                            : 'info'
                        }
                        label={item.task.status}
                      />
                      {item.assignee && (
                        <AppText variant="caption" className="text-gray-400 dark:text-gray-500 font-medium">
                          {item.assignee.full_name.split(' ')[0]}
                        </AppText>
                      )}
                    </View>
                  </View>
                </View>
              </AppCard>
            ))}
          </View>
        ) : (
          <AppCard
            variant="outlined"
            className="items-center justify-center min-h-[160px] bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700/60"
            style={cardShadow}
          >
            <AppText variant="body" className="text-gray-400 dark:text-gray-500 text-center font-medium">
              Belum ada aktivitas yang tercatat.
            </AppText>
          </AppCard>
        )}
      </View>
    </AppScreen>
  );
}
