import React, { createContext, useContext, useState, ReactNode } from "react";
import {
  Modal,
  StyleSheet,
  View,
  TouchableWithoutFeedback,
  Animated,
} from "react-native";
import { ThemedView } from "@/shared/ui/themed-view";
import { ThemedText } from "@/shared/ui/themed-text";
import { Button } from "@/shared/ui/button";
import { useTheme } from "@/shared/lib/hooks/use-theme";

export type AlertButton = {
  text: string;
  onPress?: () => void;
  style?: "default" | "cancel" | "destructive";
};

type AlertOptions = {
  title: string;
  message?: string;
  buttons?: AlertButton[];
};

type AlertContextType = {
  alert: (title: string, message?: string, buttons?: AlertButton[]) => void;
};

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [options, setOptions] = useState<AlertOptions | null>(null);
  const theme = useTheme();

  const [scale] = useState(() => new Animated.Value(0.9));
  const [opacity] = useState(() => new Animated.Value(0));

  const animateIn = () => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 20,
        bounciness: 8,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateOut = (callback?: () => void) => {
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 0.9,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
      callback?.();
    });
  };

  const alert = (title: string, message?: string, buttons?: AlertButton[]) => {
    setOptions({ title, message, buttons });
    setVisible(true);
    animateIn();
  };

  const handleClose = () => {
    animateOut();
  };

  const handleButtonPress = (btn: AlertButton) => {
    animateOut(() => {
      if (btn.onPress) {
        // Small delay to allow the modal to completely unmount before executing the action
        setTimeout(btn.onPress, 50);
      }
    });
  };

  return (
    <AlertContext.Provider value={{ alert }}>
      {children}
      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={handleClose}
      >
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={handleClose}>
            <Animated.View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: "rgba(0,0,0,0.5)", opacity },
              ]}
            />
          </TouchableWithoutFeedback>
          <Animated.View
            style={[styles.alertContainer, { transform: [{ scale }], opacity }]}
          >
            <ThemedView
              style={[
                styles.alertBox,
                { backgroundColor: theme.backgroundElement },
              ]}
            >
              <ThemedText type="subtitle" style={styles.title}>
                {options?.title}
              </ThemedText>
              {options?.message && (
                <ThemedText style={styles.message}>
                  {options.message}
                </ThemedText>
              )}

              <View style={styles.buttonContainer}>
                {options?.buttons ? (
                  options.buttons.map((btn, index) => {
                    let variant: "primary" | "secondary" | "outline" =
                      "primary";
                    let textStyle = {};
                    if (btn.style === "destructive") {
                      variant = "outline";
                      textStyle = { color: "#ef4444" };
                    } else if (btn.style === "cancel") {
                      variant = "secondary";
                    }

                    return (
                      <Button
                        key={index}
                        title={btn.text}
                        variant={variant}
                        onPress={() => handleButtonPress(btn)}
                        style={styles.button}
                        textStyle={textStyle}
                      />
                    );
                  })
                ) : (
                  <Button
                    title="OK"
                    variant="primary"
                    onPress={handleClose}
                    style={styles.button}
                  />
                )}
              </View>
            </ThemedView>
          </Animated.View>
        </View>
      </Modal>
    </AlertContext.Provider>
  );
}

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  alertContainer: {
    width: "100%",
    maxWidth: 400,
  },
  alertBox: {
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    textAlign: "center",
    marginBottom: 8,
  },
  message: {
    textAlign: "center",
    marginBottom: 24,
    opacity: 0.8,
  },
  buttonContainer: {
    flexDirection: "column",
    gap: 8,
    marginTop: 8,
  },
  button: {
    width: "100%",
  },
});
