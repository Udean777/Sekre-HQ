/**
 * Theme Store - Svelte 5 Runes
 * Manages theme (light/dark mode) globally
 */

export type Theme = "light" | "dark" | "system";

class ThemeStore {
  theme = $state<Theme>("system");
  systemTheme = $state<"light" | "dark">("light");

  // Derived state - actual theme to apply
  activeTheme = $derived(
    this.theme === "system" ? this.systemTheme : this.theme,
  );

  constructor() {
    // Load from localStorage on init
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("theme") as Theme | null;
      if (stored && ["light", "dark", "system"].includes(stored)) {
        this.theme = stored;
      }

      // Detect system theme
      this.detectSystemTheme();

      // Listen for system theme changes
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .addEventListener("change", (e) => this.detectSystemTheme());
    }
  }

  setTheme(theme: Theme): void {
    this.theme = theme;

    if (typeof window !== "undefined") {
      localStorage.setItem("theme", theme);
      this.applyTheme();
    }
  }

  private detectSystemTheme(): void {
    if (typeof window !== "undefined") {
      this.systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      this.applyTheme();
    }
  }

  private applyTheme(): void {
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      const isDark = this.activeTheme === "dark";

      if (isDark) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
  }

  toggle(): void {
    if (this.theme === "system") {
      // If system, switch to opposite of current system theme
      this.setTheme(this.systemTheme === "dark" ? "light" : "dark");
    } else {
      // Toggle between light and dark
      this.setTheme(this.theme === "dark" ? "light" : "dark");
    }
  }
}

export const themeStore = new ThemeStore();
