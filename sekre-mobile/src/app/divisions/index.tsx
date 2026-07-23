import React, { useState } from "react";
import {
  StyleSheet,
  View,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  CaretRight,
  Buildings,
} from "phosphor-react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

import { ThemedText } from "@/shared/ui/themed-text";
import { ThemedHeader } from "@/shared/ui/themed-header";
import { BouncingPressable } from "@/shared/ui/bouncing-pressable";
import { useTheme } from "@/shared/lib/hooks/use-theme";
import { useDivisions } from "@/features/division/use-divisions";
import { Division } from "@/features/division/division.schema";
import { useAuthStore } from "@/shared/store/auth-store";
import { extractErrorMessage } from "@/shared/lib/utils/error";
import { ThemedView } from "@/shared/ui/themed-view";

const AVATAR_COLORS = [
  "#4F46E5",
  "#059669",
  "#D97706",
  "#DC2626",
  "#7C3AED",
  "#0891B2",
  "#BE185D",
  "#2563EB",
  "#65A30D",
  "#DB2777",
  "#0D9488",
  "#EA580C",
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function DivisionCard({
  item,
  onPress,
}: {
  item: Division;
  onPress: () => void;
}) {
  const theme = useTheme();
  const initials = item.name.charAt(0).toUpperCase();
  const color = getAvatarColor(item.name);

  return (
    <BouncingPressable onPress={onPress}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.backgroundElement,
            borderColor: theme.backgroundSelected,
          },
        ]}
      >
        <View style={[styles.avatar, { backgroundColor: color + "18" }]}>
          <ThemedText style={[styles.avatarText, { color }]}>
            {initials}
          </ThemedText>
        </View>
        <View style={styles.cardBody}>
          <ThemedText style={styles.cardName} numberOfLines={1}>
            {item.name}
          </ThemedText>
          {item.description ? (
            <ThemedText style={styles.cardDesc} numberOfLines={2}>
              {item.description}
            </ThemedText>
          ) : (
            <ThemedText style={styles.cardDescMuted}>
              Tidak ada deskripsi
            </ThemedText>
          )}
        </View>
        <CaretRight color={theme.textSecondary} size={18} weight="bold" />
      </View>
    </BouncingPressable>
  );
}

function SkeletonCard() {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.backgroundElement,
          borderColor: theme.backgroundSelected,
        },
      ]}
    >
      <View
        style={[styles.avatar, { backgroundColor: theme.backgroundSelected }]}
      />
      <View style={styles.cardBody}>
        <View
          style={[
            styles.skelName,
            { backgroundColor: theme.backgroundSelected },
          ]}
        />
        <View
          style={[
            styles.skelDesc,
            { backgroundColor: theme.backgroundSelected },
          ]}
        />
      </View>
    </View>
  );
}

export default function DivisionsScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const role = useAuthStore((state) => state.role);
  const isAdminOrOwner = role === "ADMIN" || role === "OWNER";

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useDivisions(search);

  const divisions = data?.pages.flatMap((page) => page.data) || [];
  const totalItems = data?.pages[0]?.pagination?.total_items;

  const handleCreate = () => router.push("/divisions/create");

  const handleEdit = (id: string) => {
    if (isAdminOrOwner) {
      router.push(`/divisions/${id}/edit` as any);
    } else {
      router.push(`/divisions/${id}/members` as any);
    }
  };

  const renderItem = ({ item }: { item: Division }) => (
    <DivisionCard item={item} onPress={() => handleEdit(item.id)} />
  );

  const renderSkeleton = () => (
    <View style={styles.listContent}>
      {[1, 2, 3, 4, 5].map((i) => (
        <SkeletonCard key={i} />
      ))}
    </View>
  );

  return (
    <>
      <ThemedHeader title={t("divisions.title")} showBackButton />

      <View
        style={[styles.searchContainer, { backgroundColor: theme.background }]}
      >
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: theme.backgroundElement,
              borderColor: theme.backgroundSelected,
            },
          ]}
        >
          <MagnifyingGlassIcon
            color={theme.textSecondary}
            size={18}
            weight="bold"
          />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder={t("divisions.searchPlaceholder")}
            placeholderTextColor={theme.textSecondary}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        {totalItems != null && !search ? (
          <ThemedText
            style={[styles.countLabel, { color: theme.textSecondary }]}
          >
            {totalItems} divisi
          </ThemedText>
        ) : null}
      </View>

      <ThemedView style={styles.container}>
        {isLoading ? (
          renderSkeleton()
        ) : isError ? (
          <View style={styles.centerBox}>
            <Buildings color={theme.textSecondary} size={40} weight="light" />
            <ThemedText style={styles.errorText}>
              {extractErrorMessage(error)}
            </ThemedText>
          </View>
        ) : (
          <FlashList
            data={divisions}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) fetchNextPage();
            }}
            onEndReachedThreshold={0.5}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={refetch}
                tintColor={theme.tint}
                colors={[theme.tint]}
              />
            }
            ListFooterComponent={
              isFetchingNextPage ? (
                <View style={styles.footerLoader}>
                  <ActivityIndicator size="small" color={theme.tint} />
                </View>
              ) : null
            }
            ListEmptyComponent={
              <View style={styles.centerBox}>
                <Buildings
                  color={theme.textSecondary}
                  size={48}
                  weight="thin"
                />
                <ThemedText style={styles.emptyTitle}>
                  {search
                    ? "Divisi tidak ditemukan"
                    : t("divisions.noDivisions")}
                </ThemedText>
                {search ? (
                  <ThemedText style={styles.emptyHint}>
                    Coba cari dengan kata kunci lain
                  </ThemedText>
                ) : null}
              </View>
            }
          />
        )}

        {isAdminOrOwner && (
          <BouncingPressable
            style={[styles.fab, { backgroundColor: theme.tint }]}
            onPress={handleCreate}
          >
            <PlusIcon size={24} color="#FFFFFF" weight="bold" />
          </BouncingPressable>
        )}
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 1,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  countLabel: {
    fontSize: 12,
    marginTop: 8,
    marginLeft: 2,
  },
  listContent: {
    padding: 16,
    paddingTop: 4,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
    marginBottom: 10,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "700",
  },
  cardBody: {
    flex: 1,
    gap: 2,
  },
  cardName: {
    fontSize: 15,
    fontWeight: "600",
  },
  cardDesc: {
    fontSize: 13,
    opacity: 0.6,
    lineHeight: 18,
  },
  cardDescMuted: {
    fontSize: 13,
    opacity: 0.35,
    fontStyle: "italic",
  },
  skelName: {
    height: 15,
    width: "60%",
    borderRadius: 6,
    marginBottom: 6,
  },
  skelDesc: {
    height: 12,
    width: "85%",
    borderRadius: 6,
  },
  centerBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    gap: 12,
  },
  errorText: {
    textAlign: "center",
    opacity: 0.6,
    fontSize: 14,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
    opacity: 0.7,
  },
  emptyHint: {
    fontSize: 13,
    textAlign: "center",
    opacity: 0.5,
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: "center",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
});
