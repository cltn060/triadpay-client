"use client";

import Link from "next/link";
import { SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Navbar() {
    const t = useTranslations("Navbar");

    return (
        <nav className="fixed top-0 w-full z-50 glass-nav">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                        <span className="material-icons text-black text-sm font-bold">
                            bolt
                        </span>
                    </div>
                    <span className="text-xl font-bold tracking-tight text-white">
                        Caruma
                    </span>
                </Link>

                {/* Nav Links */}
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

                {/* Auth Actions */}
                <div className="flex items-center gap-4">
                    <SignedOut>
                        <SignInButton mode="modal" forceRedirectUrl="/redirect">
                            <button className="hidden sm:block text-sm font-medium text-white hover:text-primary transition-colors cursor-pointer">
                                {t("login")}
                            </button>
                        </SignInButton>
                    </SignedOut>
                    <SignedIn>
                        <Link
                            href="/redirect"
                            className="hidden sm:block text-sm font-medium text-white hover:text-primary transition-colors"
                        >
                            {t("dashboard")}
                        </Link>
                    </SignedIn>
                    <LanguageSwitcher />
                    <a
                        href="#"
                        className="bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-full text-sm font-medium transition-all border border-white/10"
                    >
                        {t("contactSales")}
                    </a>
                </div>
            </div>
        </nav>
    );
}
