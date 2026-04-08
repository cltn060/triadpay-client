"use client";

import { useTheme } from "@/providers/theme-provider";

export function ThemeToggle() {
    const { theme, toggleTheme, mounted } = useTheme();

    if (!mounted) {
        return <div className="h-10 w-10 rounded-full border border-white/10 bg-white/5" />;
    }

    return (
        <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
            className="group inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:border-primary hover:bg-white/10"
        >
            <span className="material-icons transition-transform duration-300 group-hover:scale-110">
                {theme === "light" ? "dark_mode" : "light_mode"}
            </span>
        </button>
    );
}
