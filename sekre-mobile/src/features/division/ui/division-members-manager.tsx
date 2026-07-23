import React, { useState, useMemo } from "react";
import { View, StyleSheet, Modal, Pressable } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { ThemedText } from "@/shared/ui/themed-text";
import { ThemedCard } from "@/shared/ui/themed-card";
import { Button } from "@/shared/ui/button";
import { useTheme } from "@/shared/lib/hooks/use-theme";
import { BouncingPressable } from "@/shared/ui/bouncing-pressable";
import {
  UserPlusIcon,
  TrashIcon,
  CrownIcon,
  XIcon,
} from "phosphor-react-native";
import {
  DivisionWithMembers,
  UserWithRole,
} from "@/features/division/division.schema";
import { useMembers } from "@/features/member/use-members";
import { useAddDivisionMember } from "@/features/division/use-add-division-member";
import { useRemoveDivisionMember } from "@/features/division/use-remove-division-member";
import { useUpdateDivisionRole } from "@/features/division/use-update-division-role";
import { useAlert } from "@/shared/context/alert-context";
import { ThemedSafeAreaView } from "@/shared/ui/themed-safe-area";
import { useTranslation } from "react-i18next";

export function DivisionMembersManager({
  division,
}: {
  division: DivisionWithMembers;
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { alert } = useAlert();
  const [isAddModalVisible, setAddModalVisible] = useState(false);

  // Mutations
  const addMemberMutation = useAddDivisionMember(division.division.id);
  const removeMemberMutation = useRemoveDivisionMember(division.division.id);
  const updateRoleMutation = useUpdateDivisionRole(division.division.id);

  // Query all members to show in "Add Member" list
  const { data: orgMembers, isLoading: isOrgMembersLoading } = useMembers({
    page: 1,
    page_size: 1000,
  });

  // Filter members that are not in the division
  const availableMembers = useMemo(() => {
    if (!orgMembers) return [];
    return orgMembers.filter(
      (m) => !division.members.some((dm) => dm.user.id === m.id),
    );
  }, [orgMembers, division.members]);

  const handleAddMember = (userId: string) => {
    addMemberMutation.mutate(
      { user_id: userId, role: "STAFF" },
      {
        onSuccess: () => {
          alert(t("division.success"), t("division.addSuccess"));
          setAddModalVisible(false);
        },
        onError: () => {
          alert(t("division.error"), t("division.addError"));
        },
      },
    );
  };

  const handleRemoveMember = (userId: string) => {
    removeMemberMutation.mutate(userId, {
      onSuccess: () => {
        alert(t("division.success"), t("division.removeSuccess"));
      },
      onError: () => {
        alert(t("division.error"), t("division.removeError"));
      },
    });
  };

  const handleToggleRole = (member: UserWithRole) => {
    const newRole = member.division_role === "HEAD" ? "STAFF" : "HEAD";
    updateRoleMutation.mutate(
      { userId: member.user.id, data: { role: newRole } },
      {
        onSuccess: () => {
          alert(t("division.success"), t("division.roleSuccess"));
        },
        onError: () => {
          alert(t("division.error"), t("division.roleError"));
        },
      },
    );
  };

  const renderMemberItem = ({ item }: { item: UserWithRole }) => {
    const isHead = item.division_role === "HEAD";

    return (
      <View
        style={[
          styles.memberItem,
          { borderBottomColor: theme.backgroundElement },
        ]}
      >
        <View style={styles.memberInfo}>
          <ThemedText style={{ fontWeight: "600" }}>
            {item.user.full_name}
          </ThemedText>
          <ThemedText style={{ color: theme.text + "80", fontSize: 13 }}>
            {item.user.email}
          </ThemedText>
          <ThemedText
            style={{
              color: isHead ? theme.tint : theme.text + "80",
              fontSize: 12,
              marginTop: 4,
              fontWeight: "600",
            }}
          >
            {isHead ? t("division.headOfDivision") : t("division.staff")}
          </ThemedText>
        </View>

        <View style={styles.memberActions}>
          <BouncingPressable
            onPress={() => handleToggleRole(item)}
            style={[
              styles.actionButton,
              {
                backgroundColor: isHead
                  ? theme.tint + "20"
                  : theme.backgroundElement,
              },
            ]}
          >
            <CrownIcon
              color={isHead ? theme.tint : theme.text}
              size={20}
              weight={isHead ? "fill" : "regular"}
            />
          </BouncingPressable>
          <BouncingPressable
            onPress={() => handleRemoveMember(item.user.id)}
            style={[styles.actionButton, { backgroundColor: "#EF444420" }]}
          >
            <TrashIcon color="#EF4444" size={20} />
          </BouncingPressable>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="subtitle">{t("division.title")}</ThemedText>
        <BouncingPressable
          style={[styles.addButton, { backgroundColor: theme.tint }]}
          onPress={() => setAddModalVisible(true)}
        >
          <UserPlusIcon color="#fff" size={16} />
          <ThemedText type="smallBold" style={{ color: "#fff", marginLeft: 8 }}>
            {t("division.add")}
          </ThemedText>
        </BouncingPressable>
      </View>

      <ThemedCard style={styles.card}>
        {division.members.length === 0 ? (
          <View style={styles.emptyState}>
            <ThemedText style={{ color: theme.text + "80" }}>
              {t("division.emptyMembers")}
            </ThemedText>
          </View>
        ) : (
          division.members.map((member) => (
            <React.Fragment key={member.user.id}>
              {renderMemberItem({ item: member })}
            </React.Fragment>
          ))
        )}
      </ThemedCard>

      <Modal visible={isAddModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, { backgroundColor: theme.background }]}
          >
            <View
              style={[
                styles.modalHeader,
                { borderBottomColor: theme.backgroundElement },
              ]}
            >
              <ThemedText type="subtitle">{t("division.addMember")}</ThemedText>
              <Pressable
                onPress={() => setAddModalVisible(false)}
                style={styles.closeButton}
              >
                <XIcon color={theme.text} size={24} />
              </Pressable>
            </View>

            {isOrgMembersLoading ? (
              <View style={styles.emptyState}>
                <ThemedText>{t("division.loading")}</ThemedText>
              </View>
            ) : availableMembers.length === 0 ? (
              <View style={styles.emptyState}>
                <ThemedText>{t("division.allMembersAdded")}</ThemedText>
              </View>
            ) : (
              <FlashList
                data={availableMembers}
                keyExtractor={(item) => item.id}
                // @ts-expect-error
                estimatedItemSize={70}
                renderItem={({ item }) => (
                  <View
                    style={[
                      styles.addMemberItem,
                      { borderBottomColor: theme.backgroundElement },
                    ]}
                  >
                    <View style={styles.memberInfo}>
                      <ThemedText style={{ fontWeight: "600" }}>
                        {item.full_name}
                      </ThemedText>
                      <ThemedText
                        style={{ color: theme.text + "80", fontSize: 13 }}
                      >
                        {item.email}
                      </ThemedText>
                    </View>
                    <Button
                      title={t("division.add")}
                      onPress={() => handleAddMember(item.id)}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        minHeight: 0,
                      }}
                    />
                  </View>
                )}
                contentContainerStyle={{ padding: 16 }}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  card: {
    padding: 0,
    overflow: "hidden",
  },
  emptyState: {
    padding: 24,
    alignItems: "center",
  },
  memberItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  memberInfo: {
    flex: 1,
  },
  memberActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    height: "70%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  closeButton: {
    padding: 4,
  },
  addMemberItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
