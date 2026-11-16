"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");

    const onThemeChange = () => {
      const isNowDark = document.documentElement.classList.contains("dark");
      setTheme(isNowDark ? "dark" : "light");
    };

    window.addEventListener("theme-change", onThemeChange);
    window.addEventListener("storage", onThemeChange);
    return () => {
      window.removeEventListener("theme-change", onThemeChange);
      window.removeEventListener("storage", onThemeChange);
    };
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);

    try {
      localStorage.setItem("tourflow-theme", nextTheme);
    } catch {
      // LocalStorage access may be restricted
    }

    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    const meta = document.querySelector('meta[name="color-scheme"]');
    if (meta) {
      meta.setAttribute("content", nextTheme);
    }

    window.dispatchEvent(new Event("theme-change"));
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`p-1.5 sm:p-2 rounded-full border transition-all cursor-pointer inline-flex items-center justify-center shrink-0 ${
        theme === "dark"
          ? "border-stone-700 bg-stone-800/90 text-amber-300 hover:bg-stone-700 hover:text-amber-200"
          : "border-[#E5DFD3] bg-[#FAF8F5] text-stone-700 hover:border-stone-400 hover:text-stone-900"
      } ${className}`}
      title={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      aria-label="Toggle color theme"
    >
      {mounted && theme === "light" ? (
        <Moon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      ) : (
        <Sun className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      )}
    </button>
  );
}
