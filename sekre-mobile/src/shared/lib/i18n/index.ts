import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import { storage } from "@/shared/lib/storage";

import en from "./locales/en.json";
import id from "./locales/id.json";

const resources = {
  en: { translation: en },
  id: { translation: id },
};

const locales = Localization.getLocales();
const deviceLanguage = locales[0]?.languageCode === "en" ? "en" : "id";

i18n.use(initReactI18next).init({
  resources,
  lng: deviceLanguage,
  fallbackLng: "id",
  interpolation: {
    escapeValue: false, // react already safes from xss
  },
});

// Load user preference asynchronously
storage.getToken("user-language").then((storedLanguage) => {
  if (storedLanguage && (storedLanguage === "en" || storedLanguage === "id")) {
    i18n.changeLanguage(storedLanguage);
  }
});

export default i18n;
