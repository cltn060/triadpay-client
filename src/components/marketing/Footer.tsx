"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export function Footer() {
    const t = useTranslations("Footer");

    return (
        <footer className="border-t border-white/10 bg-black pt-16 pb-8 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 mb-16">
                    {/* Brand */}
                    <div className="col-span-2 lg:col-span-2 space-y-4">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                                <span className="material-icons text-black text-[10px] font-bold">
                                    bolt
                                </span>
                            </div>
                            <span className="text-lg font-bold text-white">Caruma</span>
                        </Link>
                        <p className="text-text-grey text-sm max-w-xs">
                            {t("description")}
                        </p>
                    </div>

                    {/* Product */}
                    <div className="space-y-4">
                        <h4 className="text-white font-semibold">{t("product")}</h4>
                        <ul className="space-y-2 text-sm text-text-grey">
                            <li>
                                <a href="#" className="hover:text-primary transition-colors">
                                    {t("payments")}
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-primary transition-colors">
                                    {t("billing")}
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-primary transition-colors">
                                    {t("connect")}
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-primary transition-colors">
                                    {t("payouts")}
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div className="space-y-4">
                        <h4 className="text-white font-semibold">{t("resources")}</h4>
                        <ul className="space-y-2 text-sm text-text-grey">
                            <li>
                                <a href="#" className="hover:text-primary transition-colors">
                                    {t("documentation")}
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-primary transition-colors">
                                    {t("apiReference")}
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-primary transition-colors">
                                    {t("blog")}
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-primary transition-colors">
                                    {t("community")}
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div className="space-y-4">
                        <h4 className="text-white font-semibold">{t("company")}</h4>
                        <ul className="space-y-2 text-sm text-text-grey">
                            <li>
                                <a href="#" className="hover:text-primary transition-colors">
                                    {t("about")}
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-primary transition-colors">
                                    {t("careers")}
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-primary transition-colors">
                                    {t("press")}
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-primary transition-colors">
                                    {t("contact")}
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div className="col-span-2 md:col-span-4 lg:col-span-1 space-y-4">
                        <h4 className="text-white font-semibold">{t("newsletter")}</h4>
                        <form className="flex flex-col gap-2">
                            <input
                                className="bg-surface-dark border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
                                placeholder={t("emailPlaceholder")}
                                type="email"
                            />
                            <button
                                type="submit"
                                className="bg-white/10 text-white text-sm font-medium py-2 rounded-lg hover:bg-white/20 transition-colors cursor-pointer"
                            >
                                {t("subscribe")}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/5 text-sm text-text-grey">
                    <p>{t("copyright")}</p>
                    <div className="flex gap-6 mt-4 md:mt-0">
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
