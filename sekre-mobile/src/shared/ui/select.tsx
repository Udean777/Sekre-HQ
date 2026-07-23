import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Modal,
  SafeAreaView,
} from "react-native";
import { CaretDown, X } from "phosphor-react-native";
import { FlashList } from "@shopify/flash-list";
import { useTheme } from "@/shared/lib/hooks/use-theme";
import { ThemedText } from "./themed-text";

export interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  label?: string;
  value?: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  emptyMessage?: string;
}

export function Select({
  label,
  value,
  onValueChange,
  options,
  placeholder = "Select an option",
  error,
  disabled = false,
  emptyMessage,
}: SelectProps) {
  const theme = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <View style={styles.container}>
      {label && (
        <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
          {label}
        </ThemedText>
      )}

      <Pressable
        style={[
          styles.inputBase,
          {
            backgroundColor: theme.backgroundElement,
            borderColor: error ? "red" : theme.backgroundSelected,
            opacity: disabled ? 0.5 : 1,
          },
        ]}
        onPress={() => !disabled && setModalVisible(true)}
        disabled={disabled}
      >
        <ThemedText
          style={[
            styles.valueText,
            { color: selectedOption ? theme.text : theme.textSecondary },
          ]}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </ThemedText>
        <CaretDown color={theme.textSecondary} size={20} />
      </Pressable>

      {error && (
        <ThemedText style={[styles.error, { color: "red" }]}>
          {error}
        </ThemedText>
      )}

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: "rgba(0,0,0,0.5)" }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
            <SafeAreaView style={styles.modalSafeArea}>
              <View style={[styles.modalHeader, { borderBottomColor: theme.backgroundSelected }]}>
                <ThemedText type="subtitle">{label || placeholder}</ThemedText>
                <Pressable
                  onPress={() => setModalVisible(false)}
                  style={styles.closeButton}
                >
                  <X color={theme.text} size={24} />
                </Pressable>
              </View>

              <View style={styles.listContainer}>
                <FlashList
                  data={options}
                  keyExtractor={(item) => item.value}
                  // @ts-expect-error
                  estimatedItemSize={50}
                  renderItem={({ item }) => (
                    <Pressable
                      style={[
                        styles.optionItem,
                        { borderBottomColor: theme.backgroundSelected },
                      ]}
                      onPress={() => {
                        onValueChange(item.value);
                        setModalVisible(false);
                      }}
                    >
                      <ThemedText
                        style={{
                          color:
                            item.value === value ? theme.tint : theme.text,
                          fontWeight: item.value === value ? "bold" : "normal",
                        }}
                      >
                        {item.label}
                      </ThemedText>
                    </Pressable>
                  )}
                  ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                      <ThemedText style={{ color: theme.textSecondary }}>
                        {emptyMessage || "No options available"}
                      </ThemedText>
                    </View>
                  }
                />
              </View>
            </SafeAreaView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: "500",
  },
  inputBase: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
  },
  valueText: {
    fontSize: 16,
  },
  error: {
    marginTop: 4,
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    height: "60%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalSafeArea: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 4,
  },
  listContainer: {
    flex: 1,
  },
  optionItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
  },
});
