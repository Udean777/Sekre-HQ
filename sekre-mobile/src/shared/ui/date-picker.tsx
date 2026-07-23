import React, { useState, useMemo } from "react";
import { View, StyleSheet, Pressable, Modal, SafeAreaView } from "react-native";
import {
  CaretDown,
  CaretLeft,
  CaretRight,
  X,
  CalendarBlank,
} from "phosphor-react-native";
import { useTheme } from "@/shared/lib/hooks/use-theme";
import { ThemedText } from "./themed-text";

interface DatePickerProps {
  label?: string;
  value?: string; // Format: YYYY-MM-DD
  onValueChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
}

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function DatePicker({
  label,
  value,
  onValueChange,
  placeholder = "YYYY-MM-DD",
  error,
  disabled = false,
}: DatePickerProps) {
  const theme = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  // Parse current value or use today
  const currentDate = value ? new Date(value) : new Date();
  const [viewDate, setViewDate] = useState(new Date(currentDate));

  const daysInMonth = (year: number, month: number) =>
    new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) =>
    new Date(year, month, 1).getDay();

  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const totalDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);

    const days = [];
    // Empty padding for start of month
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    // Actual days
    for (let i = 1; i <= totalDays; i++) {
      days.push(i);
    }
    return days;
  }, [viewDate]);

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleSelectDay = (day: number) => {
    const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    // Format to YYYY-MM-DD
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    onValueChange(`${yyyy}-${mm}-${dd}`);
    setModalVisible(false);
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === viewDate.getMonth() &&
      today.getFullYear() === viewDate.getFullYear()
    );
  };

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
        onPress={() => {
          if (!disabled) {
            setViewDate(value ? new Date(value) : new Date());
            setModalVisible(true);
          }
        }}
        disabled={disabled}
      >
        <ThemedText
          style={[
            styles.valueText,
            { color: value ? theme.text : theme.textSecondary },
          ]}
        >
          {value || placeholder}
        </ThemedText>
        <CalendarBlank color={theme.textSecondary} size={20} />
      </Pressable>

      {error && (
        <ThemedText style={[styles.error, { color: "red" }]}>
          {error}
        </ThemedText>
      )}

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={[styles.modalOverlay, { backgroundColor: "rgba(0,0,0,0.5)" }]}
          onPress={() => setModalVisible(false)}
        >
          <Pressable
            style={[styles.modalContent, { backgroundColor: theme.background }]}
            onPress={(e) => e.stopPropagation()} // Prevent bubbling to overlay
          >
            <View
              style={[
                styles.modalHeader,
                { borderBottomColor: theme.backgroundSelected },
              ]}
            >
              <ThemedText type="subtitle" style={{ fontSize: 18 }}>
                Select Date
              </ThemedText>
              <Pressable
                onPress={() => setModalVisible(false)}
                style={({ pressed }) => [
                  styles.closeButton,
                  pressed && { opacity: 0.5 },
                ]}
              >
                <X color={theme.textSecondary} size={20} weight="bold" />
              </Pressable>
            </View>

            <View style={styles.calendarContainer}>
              {/* Calendar Header */}
              <View style={styles.calendarHeader}>
                <Pressable
                  onPress={handlePrevMonth}
                  style={({ pressed }) => [
                    styles.navButton,
                    pressed && { opacity: 0.5 },
                  ]}
                >
                  <CaretLeft color={theme.text} size={20} weight="bold" />
                </Pressable>
                <ThemedText style={styles.monthYearText}>
                  {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
                </ThemedText>
                <Pressable
                  onPress={handleNextMonth}
                  style={({ pressed }) => [
                    styles.navButton,
                    pressed && { opacity: 0.5 },
                  ]}
                >
                  <CaretRight color={theme.text} size={20} weight="bold" />
                </Pressable>
              </View>

              {/* Days of Week Row */}
              <View style={styles.daysRow}>
                {DAYS_OF_WEEK.map((day) => (
                  <View key={day} style={styles.dayHeaderCell}>
                    <ThemedText
                      style={[
                        styles.dayHeaderText,
                        { color: theme.textSecondary },
                      ]}
                    >
                      {day}
                    </ThemedText>
                  </View>
                ))}
              </View>

              {/* Calendar Grid */}
              <View style={styles.grid}>
                {calendarDays.map((day, index) => {
                  if (day === null) {
                    return (
                      <View key={`empty-${index}`} style={styles.dayCell} />
                    );
                  }

                  // Determine if this day is selected
                  let isSelected = false;
                  if (value) {
                    const parsedValue = new Date(value);
                    if (
                      parsedValue.getDate() === day &&
                      parsedValue.getMonth() === viewDate.getMonth() &&
                      parsedValue.getFullYear() === viewDate.getFullYear()
                    ) {
                      isSelected = true;
                    }
                  }

                  const today = isToday(day);

                  return (
                    <Pressable
                      key={`day-${day}`}
                      style={styles.dayCell}
                      onPress={() => handleSelectDay(day)}
                    >
                      <View
                        style={[
                          styles.dayButton,
                          isSelected && { backgroundColor: theme.tint },
                          !isSelected &&
                            today && {
                              borderWidth: 1,
                              borderColor: theme.tint,
                            },
                        ]}
                      >
                        <ThemedText
                          style={[
                            styles.dayText,
                            {
                              color: isSelected
                                ? "#fff"
                                : today
                                  ? theme.tint
                                  : theme.text,
                              fontWeight: isSelected || today ? "700" : "400",
                            },
                          ]}
                        >
                          {day}
                        </ThemedText>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </Pressable>
        </Pressable>
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
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    borderRadius: 24,
    overflow: "hidden",
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: "transparent",
  },
  calendarContainer: {
    padding: 24,
    paddingTop: 16,
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  monthYearText: {
    fontWeight: "700",
    fontSize: 16,
  },
  navButton: {
    padding: 10,
    borderRadius: 12,
  },
  daysRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  dayHeaderCell: {
    width: `${100 / 7}%`,
    alignItems: "center",
    justifyContent: "center",
  },
  dayHeaderText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 8,
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  dayButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  dayText: {
    fontSize: 15,
  },
});
