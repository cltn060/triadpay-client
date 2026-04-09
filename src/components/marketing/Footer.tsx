"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export function Footer() {
    const t = useTranslations("Footer");

    return (
        <footer className="bg-[#050505] text-white pt-16 pb-10 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="grid gap-10 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr] mb-16">
                    <div className="space-y-5">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-black shadow-glow">
                                <span className="material-icons text-sm font-bold">bolt</span>
                            </div>
                            <div>
                                <p className="text-lg font-semibold">Caruma</p>
                                <p className="text-sm text-text-grey">Payments built for modern SaaS.</p>
                            </div>
                        </Link>
                        <p className="text-sm text-text-grey max-w-sm">
                            {t("description")}
                        </p>
                        <div className="grid grid-cols-2 gap-3 text-center">
                            <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3">
                                <p className="text-sm text-text-grey">{t("transactions")}</p>
                                <p className="mt-2 text-lg font-semibold text-white">500K+</p>
                            </div>
                            <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3">
                                <p className="text-sm text-text-grey">{t("businesses")}</p>
                                <p className="mt-2 text-lg font-semibold text-white">1.2K</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-white font-semibold">{t("product")}</h4>
                        <ul className="space-y-3 text-sm text-text-grey">
                            <li>
                                <a href="#" className="block hover:text-primary transition-colors">
                                    {t("payments")}
                                </a>
                            </li>
                            <li>
                                <a href="#" className="block hover:text-primary transition-colors">
                                    {t("billing")}
                                </a>
                            </li>
                            <li>
                                <a href="#" className="block hover:text-primary transition-colors">
                                    {t("connect")}
                                </a>
                            </li>
                            <li>
                                <a href="#" className="block hover:text-primary transition-colors">
                                    {t("payouts")}
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-white font-semibold">{t("resources")}</h4>
                        <ul className="space-y-3 text-sm text-text-grey">
                            <li>
                                <a href="#" className="block hover:text-primary transition-colors">
                                    {t("documentation")}
                                </a>
                            </li>
                            <li>
                                <a href="#" className="block hover:text-primary transition-colors">
                                    {t("apiReference")}
                                </a>
                            </li>
                            <li>
                                <a href="#" className="block hover:text-primary transition-colors">
                                    {t("blog")}
                                </a>
                            </li>
                            <li>
                                <a href="#" className="block hover:text-primary transition-colors">
                                    {t("community")}
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-white font-semibold">{t("company")}</h4>
                        <ul className="space-y-3 text-sm text-text-grey">
                            <li>
                                <a href="#" className="block hover:text-primary transition-colors">
                                    {t("about")}
                                </a>
                            </li>
                            <li>
                                <a href="#" className="block hover:text-primary transition-colors">
                                    {t("careers")}
                                </a>
                            </li>
                            <li>
                                <a href="#" className="block hover:text-primary transition-colors">
                                    {t("press")}
                                </a>
                            </li>
                            <li>
                                <a href="#" className="block hover:text-primary transition-colors">
                                    {t("contact")}
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-white font-semibold">{t("newsletter")}</h4>
                        <p className="text-sm text-text-grey max-w-sm">
                            Stay informed with product updates, launches, and announcements.
                        </p>
                        <form className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <input
                                className="w-full rounded-2xl border border-white/10 bg-[#0b0b0b] px-4 py-3 text-sm text-white placeholder:text-text-grey focus:outline-none focus:border-primary/50"
                                placeholder={t("emailPlaceholder")}
                                type="email"
                            />
                            <button
                                type="submit"
                                className="rounded-2xl border border-primary bg-primary px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#0ce113]"
                            >
                                {t("subscribe")}
                            </button>
                        </form>
                    </div>
                </div>

                <div className="flex flex-col gap-4 border-t border-white/5 pt-8 text-sm text-text-grey md:flex-row md:items-center md:justify-between">
                    <p>{t("copyright")}</p>
                    <div className="flex flex-wrap gap-5">
                        <a href="#" className="hover:text-white transition-colors">
                            {t("privacy")}
                        </a>
                        <a href="#" className="hover:text-white transition-colors">
                            {t("terms")}
                        </a>
                        <a href="#" className="hover:text-white transition-colors">
                            {t("cookies")}
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
