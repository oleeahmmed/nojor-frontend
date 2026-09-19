"use client";

import { Moon, Sun } from "lucide-react";
import { useApp } from "./providers";
import { Button } from "@/components/ui/button";

/** Dark / light only — brand color themes are hidden; app stays on YouTube. */
export function ThemeSwitcher() {
  const { colorMode, toggleColorMode } = useApp();
  const dark = colorMode === "dark";

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="rounded-full"
      onClick={toggleColorMode}
      aria-label={dark ? "Light mode" : "Dark mode"}
      title={dark ? "Light mode" : "Dark mode"}
    >
      {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
}
