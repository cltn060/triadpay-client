"use client";
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
    mounted: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>("light");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem("theme") as Theme | null;
        if (stored) {
            setTheme(stored);
        } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
            setTheme("dark");
        }
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;
        const root = document.documentElement;
        if (theme === "dark") {
            root.classList.add("dark");
            root.setAttribute("data-theme", "dark");
            root.style.setProperty("--background", "#050505");
            root.style.setProperty("--foreground", "#f5f5f7");
            root.style.setProperty("--surface-dark", "#111827");
            root.style.setProperty("--text-grey", "#94a3b8");
            root.style.setProperty("--primary", "#0df20d");
            root.style.setProperty("--primary-rgb", "13, 242, 13");
        } else {
            root.classList.remove("dark");
            root.setAttribute("data-theme", "light");
            root.style.setProperty("--background", "#f8fafc");
            root.style.setProperty("--foreground", "#111827");
            root.style.setProperty("--surface-dark", "#ffffff");
            root.style.setProperty("--text-grey", "#64748b");
            root.style.setProperty("--primary", "#0f766e");
            root.style.setProperty("--primary-rgb", "15, 118, 110");
        }
        localStorage.setItem("theme", theme);
    }, [theme, mounted]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === "light" ? "dark" : "light"));
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, mounted }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}