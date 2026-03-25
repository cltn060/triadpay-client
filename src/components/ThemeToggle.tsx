"use client";

import { useTheme } from "@/providers/theme-provider";

export function ThemeToggle() {
    const { theme, toggleTheme, mounted } = useTheme();

    if (!mounted) {
        return <div className="w-10 h-10 rounded-full border border-gray-200 dark:border-white/10" />;
    }

    return (
        <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-colors border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white cursor-pointer"
            aria-label="Toggle theme"
            title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
        >
            <span className="material-icons text-[20px]">
                {theme === "light" ? "dark_mode" : "light_mode"}
            </span>
        </button>
    );
}
