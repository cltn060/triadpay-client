"use client";

import { useStoreContext } from "@/providers/store-context";

/** Converts a hex color like #0df20d to "13, 242, 13" for rgba() usage */
function hexToRgb(hex: string): string {
    const clean = hex.replace("#", "");
    const full = clean.length === 3
        ? clean.split("").map((c) => c + c).join("")
        : clean;
    const r = parseInt(full.substring(0, 2), 16);
    const g = parseInt(full.substring(2, 4), 16);
    const b = parseInt(full.substring(4, 6), 16);
    if (isNaN(r) || isNaN(g) || isNaN(b)) return "13, 242, 13";
    return `${r}, ${g}, ${b}`;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const { store } = useStoreContext();

    // Default to neon green if store has no themeColor
    const color = store?.themeColor ?? "#0df20d";
    const rgb = hexToRgb(color);

    return (
        <>
            {/*
              THE CORRECT TAILWIND v4 PATTERN:
              We override --primary (the bridge variable), NOT --color-primary directly.
              In globals.css, @theme inline sets: --color-primary: var(--primary)
              Tailwind then compiles bg-primary → background-color: var(--color-primary)
              At runtime, var(--color-primary) → var(--primary) → our overridden value.
              This is the industry-recommended indirection pattern for Tailwind v4 theming.
            */}
            <style>{`
                :root {
                    --primary: ${color};
                    --primary-rgb: ${rgb};
                    --color-primary-rgb: ${rgb};
                }
            `}</style>
            {children}
        </>
    );
}
