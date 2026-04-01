"use client";

import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect, useTransition } from "react";

const LANGUAGES = [
    { code: "en", label: "EN" },
    { code: "pt", label: "PT" },
    { code: "fr", label: "FR" },
];

/**
 * LanguageSwitcher — Cookie-based locale dropdown.
 *
 * Sets a NEXT_LOCALE cookie and refreshes to load the new translations.
 * No Google Translate, no DOM hacking — just a cookie + server reload.
 */
export function LanguageSwitcher({ variant = "dashboard" }: { variant?: "checkout" | "dashboard" }) {
    const t = useTranslations("LanguageSwitcher");
    const router = useRouter();
    const currentLocale = useLocale();
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    const activeLabel =
        LANGUAGES.find((l) => l.code === currentLocale)?.label ?? "EN";

    function switchLocale(locale: string) {
        if (locale === currentLocale) {
            setIsOpen(false);
            return;
        }
        // Set the cookie (1 year expiry)
        document.cookie = `NEXT_LOCALE=${locale};path=/;max-age=31536000;SameSite=Lax`;
        setIsOpen(false);
        startTransition(() => {
            router.refresh();
        });
    }

    // Close dropdown on outside click
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target as Node)
            ) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    return (
        <div ref={dropdownRef} className="relative">
            <button
                id="lang-toggle-btn"
                onClick={() => setIsOpen((prev) => !prev)}
                disabled={isPending}
                aria-label="Select language"
                aria-expanded={isOpen}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 select-none border ${
                    variant === "checkout"
                        ? "border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-700 dark:text-gray-200 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-white/10 dark:hover:text-white"
                        : "border-white/10 bg-white/5 text-text-grey hover:bg-white/10 hover:text-white hover:border-white/20"
                } ${isPending ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
            >
                {activeLabel}
                <span className="text-[10px]">
                    {isOpen ? "▲" : "▼"}
                </span>
            </button>

            {isOpen && !isPending && (
                <div className={`absolute right-0 top-full mt-2 py-1.5 min-w-[150px] rounded-xl border shadow-xl z-50 ${
                    variant === "checkout"
                        ? "bg-white dark:bg-[#141414] border-gray-100 dark:border-white/10 shadow-black/10 dark:shadow-black/50"
                        : "bg-surface-dark border-white/10 shadow-black/40"
                }`}>
                    {LANGUAGES.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => switchLocale(lang.code)}
                            className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 transition-colors cursor-pointer ${
                                variant === "checkout"
                                    ? currentLocale === lang.code
                                        ? "text-gray-900 dark:text-white bg-gray-100 dark:bg-white/5 font-semibold"
                                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5"
                                    : currentLocale === lang.code
                                        ? "text-white bg-white/5 font-semibold"
                                        : "text-text-grey hover:text-white hover:bg-white/5"
                            }`}
                        >
                            <span className="font-bold w-6">
                                {lang.label}
                            </span>
                            <span className="font-normal">
                                {t(lang.code)}
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
