"use client";

import Link from "next/link";
import { SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "../ThemeToggle";

export function Navbar() {
    const t = useTranslations("Navbar");

    return (
        <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/10 backdrop-blur-xl bg-[#050505]/85 shadow-[0_25px_50px_-30px_rgba(0,0,0,0.8)]">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary shadow-glow flex items-center justify-center">
                            <span className="material-icons text-black text-base font-bold">bolt</span>
                        </div>
                        <div>
                            <p className="text-base font-semibold tracking-tight text-white">Triadpay</p>
                            <p className="text-xs uppercase text-text-grey tracking-[0.35em]">Payments + Payouts</p>
                        </div>
                    </Link>
                </div>

                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-text-grey">
                    <a href="#features" className="hover:text-white transition-colors">
                        {t("features")}
                    </a>
                    <a href="#" className="hover:text-white transition-colors">
                        {t("solutions")}
                    </a>
                    <a href="#" className="hover:text-white transition-colors">
                        {t("developers")}
                    </a>
                    <a href="#" className="hover:text-white transition-colors">
                        {t("pricing")}
                    </a>
                </div>

                <div className="flex items-center gap-3">
                    <ThemeToggle />
                    <SignedOut>
                        <SignInButton mode="modal" forceRedirectUrl="/redirect">
                            <button className="hidden sm:inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:border-primary hover:bg-white/10 hover:text-primary">
                                {t("login")}
                            </button>
                        </SignInButton>
                    </SignedOut>
                    <SignedIn>
                        <Link
                            href="/redirect"
                            className="hidden sm:inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:border-primary hover:bg-white/10 hover:text-primary"
                        >
                            {t("dashboard")}
                        </Link>
                    </SignedIn>
                    <LanguageSwitcher />
                    <a
                        href="#"
                        className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-[#0be00b] shadow-glow"
                    >
                        {t("contactSales")}
                    </a>
                </div>
            </div>
        </nav>
    );
}
