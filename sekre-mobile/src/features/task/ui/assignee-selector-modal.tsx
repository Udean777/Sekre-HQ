import React from "react";
import { Modal, View, StyleSheet, TouchableWithoutFeedback, FlatList, ActivityIndicator, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { X, User } from "phosphor-react-native";
import { ThemedText } from "@/shared/ui/themed-text";
import { ThemedView } from "@/shared/ui/themed-view";
import { useTheme } from "@/shared/lib/hooks/use-theme";
import { useMembers } from "@/features/member/use-members";

interface AssigneeSelectorModalProps {
  visible: boolean;
  onSelect: (memberId: string | null) => void;
  onClose: () => void;
  divisionId?: string;
}

import { useDivision } from "@/features/division/use-divisions";

export function AssigneeSelectorModal({ visible, onClose, onSelect, divisionId }: AssigneeSelectorModalProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  // Fetch members of the specific division
  const { data: divisionDetails, isLoading } = useDivision(divisionId || "");
  const members = divisionDetails?.members.map(m => m.user) || [];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0,0,0,0.5)" }]} />
        </TouchableWithoutFeedback>

        <ThemedView style={[styles.modalContent, { backgroundColor: theme.background }]}>
          <View style={[styles.header, { borderBottomColor: theme.backgroundElement }]}>
            <ThemedText style={styles.title}>{t("tasks.selectAssignee")}</ThemedText>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X color={theme.text} size={20} />
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={theme.tint} />
            </View>
          ) : (
            <FlatList
              data={[{ id: "unassigned", full_name: t("tasks.unassigned") }, ...members]}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.list}
              ListEmptyComponent={
                <View style={styles.center}>
                  <ThemedText style={{ color: theme.textSecondary }}>{t("tasks.noMembersInDivision")}</ThemedText>
                </View>
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.memberItem, { borderBottomColor: theme.backgroundElement }]}
                  onPress={() => onSelect(item.id === "unassigned" ? null : item.id)}
                >
                  <View style={[styles.avatar, { backgroundColor: theme.backgroundSelected }]}>
                    <User color={theme.textSecondary} size={16} />
                  </View>
                  <ThemedText style={styles.memberName}>{item.full_name}</ThemedText>
                </TouchableOpacity>
              )}
            />
          )}
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    width: "100%",
    maxHeight: "80%",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
  closeBtn: {
    padding: 4,
  },
  center: {
    padding: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  list: {
    paddingBottom: 16,
  },
  memberItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  memberName: {
    fontSize: 16,
    fontWeight: "500",
  },
});
