import React from "react";
import { View } from "react-native";
import { useTranslation } from "react-i18next";
import { Translate } from "phosphor-react-native";

import { Button } from "@/shared/ui/button";
import { ThemedText } from "@/shared/ui/themed-text";
import { storage } from "@/shared/lib/storage";
import { useTheme } from "@/shared/lib/hooks/use-theme";

interface LanguageSwitcherProps {
  style?: any;
}

export const LanguageSwitcher = ({ style }: LanguageSwitcherProps) => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "id" : "en";
    i18n.changeLanguage(newLang);
    storage.setToken("user-language", newLang);
  };

  return (
    <View style={[{ flexDirection: "row", alignItems: "center" }, style]}>
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: theme.backgroundSelected,
          justifyContent: "center",
          alignItems: "center",
          marginRight: 16,
        }}
      >
        <Translate color={theme.text} size={24} />
      </View>
      <View style={{ flex: 1 }}>
        <ThemedText
          style={{ fontSize: 16, fontWeight: "500", marginBottom: 2 }}
        >
          {t("profile.language")}
        </ThemedText>
        <ThemedText
          style={{ fontSize: 14, color: theme.textSecondary }}
          numberOfLines={1}
        >
          {i18n.language === "en" ? "English" : "Bahasa Indonesia"}
        </ThemedText>
      </View>
      <Button
        title={t("common.change")}
        variant="outline"
        style={{ minHeight: 32, paddingVertical: 4, paddingHorizontal: 12 }}
        onPress={toggleLanguage}
      />
    </View>
  );
};
