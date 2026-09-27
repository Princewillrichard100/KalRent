"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Palette } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type ThemeMode = "light" | "dark" | "sand";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [activeTheme, setActiveTheme] = React.useState<ThemeMode>("light");

  // Determine current active theme by checking DOM root class first, then theme state
  const readCurrentTheme = React.useCallback((): ThemeMode => {
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      if (root.classList.contains("sand")) return "sand";
      if (root.classList.contains("dark")) return "dark";
      if (root.classList.contains("light")) return "light";
    }
    if (theme === "sand" || theme === "dark" || theme === "light") {
      return theme as ThemeMode;
    }
    if (resolvedTheme === "dark") return "dark";
    return "light";
  }, [theme, resolvedTheme]);

  React.useEffect(() => {
    setMounted(true);
    setActiveTheme(readCurrentTheme());
  }, [readCurrentTheme]);

  const cycleTheme = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const current = readCurrentTheme();
    const next: ThemeMode =
      current === "light" ? "dark" : current === "dark" ? "sand" : "light";

    // 1. Immediately toggle classes on documentElement for instant zero-latency paint
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      root.classList.remove("light", "dark", "sand");
      root.classList.add(next);
    }

    // 2. Update local state immediately for button icon sync
    setActiveTheme(next);

    // 3. Persist via next-themes provider & localStorage
    setTheme(next);
  };

  if (!mounted) {
    return <div className={`w-8 h-8 rounded-full bg-muted animate-pulse ${className}`} />;
  }

  const themeLabel =
    activeTheme === "dark"
      ? "Dark Mode"
      : activeTheme === "sand"
      ? "Warm Sand"
      : "Light Mode";

  const nextThemeHint =
    activeTheme === "light"
      ? "Switch to Dark"
      : activeTheme === "dark"
      ? "Switch to Sand"
      : "Switch to Light";

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={cycleTheme}
            className={`p-2 rounded-full border border-border bg-card hover:bg-secondary text-foreground transition-all duration-200 cursor-pointer shadow-2xs ${className}`}
            aria-label={`Current theme: ${themeLabel}. ${nextThemeHint}`}
          >
            {activeTheme === "dark" ? (
              <Moon className="w-4 h-4 text-sky-400" />
            ) : activeTheme === "sand" ? (
              <Palette className="w-4 h-4 text-amber-700" />
            ) : (
              <Sun className="w-4 h-4 text-amber-500" />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          align="end"
          className="text-xs font-semibold py-1.5 px-3"
        >
          <span>{themeLabel}</span>
          <span className="text-muted-foreground ml-1.5 font-normal">
            ({nextThemeHint})
          </span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default ThemeToggle;
