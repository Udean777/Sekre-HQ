import React, { useState } from "react";
import {
  StyleSheet,
  View,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { PlusIcon, MagnifyingGlassIcon } from "phosphor-react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

import { ThemedText } from "@/shared/ui/themed-text";
import { ThemedCard } from "@/shared/ui/themed-card";
import { ThemedHeader } from "@/shared/ui/themed-header";
import { BouncingPressable } from "@/shared/ui/bouncing-pressable";
import { useTheme } from "@/shared/lib/hooks/use-theme";
import { useDivisions } from "@/features/division/use-divisions";
import { Division } from "@/features/division/division.schema";
import { useAuthStore } from "@/shared/store/auth-store";
import { extractErrorMessage } from "@/shared/lib/utils/error";
import { ThemedView } from "@/shared/ui/themed-view";

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

  // Flatten infinite query data
  const divisions = data?.pages.flatMap((page) => page.data) || [];

  const handleCreate = () => {
    router.push("/divisions/create");
  };

  const handleEdit = (id: string) => {
    // Only allow edit if admin or owner
    if (isAdminOrOwner) {
      router.push(`/divisions/${id}/edit` as any);
    } else {
      // For stage 2, this will route to division details / members
      router.push(`/divisions/${id}/members` as any);
    }
  };

  const renderItem = ({ item }: { item: Division }) => (
    <BouncingPressable onPress={() => handleEdit(item.id)}>
      <ThemedCard style={styles.card}>
        <View style={styles.cardContent}>
          <ThemedText type="subtitle">{item.name}</ThemedText>
          {item.description && (
            <ThemedText style={styles.description} numberOfLines={2}>
              {item.description}
            </ThemedText>
          )}
        </View>
      </ThemedCard>
    </BouncingPressable>
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
          <MagnifyingGlassIcon color={theme.textSecondary} size={20} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder={t("divisions.searchPlaceholder")}
            placeholderTextColor={theme.textSecondary}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <ThemedView style={styles.container}>
        {isLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={theme.tint} />
          </View>
        ) : isError ? (
          <View style={styles.centered}>
            <ThemedText style={{ color: theme.text }}>
              {extractErrorMessage(error)}
            </ThemedText>
          </View>
        ) : (
          <FlashList
            data={divisions}
            renderItem={renderItem}
            // @ts-ignore
            estimatedItemSize={100}
            contentContainerStyle={styles.listContent}
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
              }
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
              <View style={styles.centered}>
                <ThemedText style={styles.emptyText}>
                  {t("divisions.noDivisions")}
                </ThemedText>
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
  container: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 1,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  listContent: {
    padding: 16,
    paddingTop: 4,
  },
  card: {
    marginBottom: 12,
    padding: 16,
  },
  cardContent: {
    flex: 1,
  },
  description: {
    marginTop: 4,
    fontSize: 14,
    opacity: 0.7,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyText: {
    textAlign: "center",
    opacity: 0.6,
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
