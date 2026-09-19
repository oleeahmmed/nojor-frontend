"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_COLOR_MODE,
  DEFAULT_THEME,
  type ColorMode,
  type ThemeId,
} from "@/lib/themes";

type AppState = {
  role: "public" | "official";
  district: string;
  /** Visitor's preferred home জেলা (no login — localStorage) */
  homeDistrict: string;
  theme: ThemeId;
  colorMode: ColorMode;
  setOfficial: (district: string) => void;
  clearOfficial: () => void;
  setHomeDistrict: (district: string) => void;
  areaPickerOpen: boolean;
  openAreaPicker: () => void;
  closeAreaPicker: () => void;
  setTheme: (theme: ThemeId) => void;
  setColorMode: (mode: ColorMode) => void;
  toggleColorMode: () => void;
};

const Ctx = createContext<AppState | null>(null);

export function Providers({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<"public" | "official">("public");
  const [district, setDistrict] = useState("");
  const [homeDistrict, setHomeDistrictState] = useState("");
  const [areaPickerOpen, setAreaPickerOpen] = useState(false);
  const [theme, setThemeState] = useState<ThemeId>(DEFAULT_THEME);
  const [colorMode, setColorModeState] =
    useState<ColorMode>(DEFAULT_COLOR_MODE);
  // সেভ করা প্রেফারেন্স পড়ার আগে localStorage-এ লেখা যাবে না
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // App chrome is always YouTube; only dark/light is user-controlled.
    setThemeState(DEFAULT_THEME);
    localStorage.setItem("nojor-theme", DEFAULT_THEME);

    const savedMode = (localStorage.getItem("nojor-color-mode") ||
      localStorage.getItem("ninnoy-color-mode")) as ColorMode | null;
    if (savedMode === "light" || savedMode === "dark") {
      setColorModeState(savedMode);
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setColorModeState("dark");
    }
    const savedHome =
      localStorage.getItem("nojor-home-district") ||
      localStorage.getItem("ninnoy-home-district");
    if (savedHome) setHomeDistrictState(savedHome);
    setHydrated(true);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", DEFAULT_THEME);
    root.classList.toggle("dark", colorMode === "dark");
    if (!hydrated) return;
    localStorage.setItem("nojor-theme", DEFAULT_THEME);
    localStorage.setItem("nojor-color-mode", colorMode);
  }, [colorMode, hydrated]);

  const setOfficial = useCallback((d: string) => {
    setRole("official");
    setDistrict(d);
  }, []);

  const clearOfficial = useCallback(() => {
    setRole("public");
    setDistrict("");
  }, []);

  const setHomeDistrict = useCallback((d: string) => {
    setHomeDistrictState(d);
    if (d) localStorage.setItem("nojor-home-district", d);
    else localStorage.removeItem("nojor-home-district");
  }, []);

  const openAreaPicker = useCallback(() => setAreaPickerOpen(true), []);
  const closeAreaPicker = useCallback(() => setAreaPickerOpen(false), []);

  const setTheme = useCallback((_t: ThemeId) => {
    setThemeState(DEFAULT_THEME);
  }, []);
  const setColorMode = useCallback((m: ColorMode) => setColorModeState(m), []);
  const toggleColorMode = useCallback(
    () => setColorModeState((m) => (m === "dark" ? "light" : "dark")),
    [],
  );

  const value = useMemo(
    () => ({
      role,
      district,
      homeDistrict,
      areaPickerOpen,
      theme,
      colorMode,
      setOfficial,
      clearOfficial,
      setHomeDistrict,
      openAreaPicker,
      closeAreaPicker,
      setTheme,
      setColorMode,
      toggleColorMode,
    }),
    [
      role,
      district,
      homeDistrict,
      areaPickerOpen,
      theme,
      colorMode,
      setOfficial,
      clearOfficial,
      setHomeDistrict,
      openAreaPicker,
      closeAreaPicker,
      setTheme,
      setColorMode,
      toggleColorMode,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp must be used within Providers");
  return ctx;
}

/** @deprecated use useApp */
export function useOfficial() {
  const { role, district, setOfficial, clearOfficial } = useApp();
  return { role, district, setOfficial, clearOfficial };
}
