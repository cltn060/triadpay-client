"use client";

import { useTranslations } from "next-intl";

export function CTASection() {
    const t = useTranslations("CTA");

    return (
        <section className="py-24 px-6">
            <div className="relative overflow-hidden rounded-[3rem] border border-white/10 bg-gradient-to-br from-[#111111] via-[#0b0b0b] to-[#050505] px-8 py-16 shadow-[0_35px_120px_-40px_rgba(0,0,0,0.8)]">
                <div className="absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
                <div className="relative z-10 mx-auto max-w-4xl text-center">
                    <p className="mb-4 text-sm uppercase tracking-[0.35em] text-primary">{t("heading")}</p>
                    <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                        {t("subheading")}
                    </h2>
                    <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-text-grey">
                        {t("description") ?? "Seamless onboarding, powerful payouts, and modern branding for your merchants."}
                    </p>
                    <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                        <button className="rounded-full bg-primary px-10 py-4 text-sm font-semibold text-black transition hover:bg-[#0ce113] shadow-glow">
                            {t("startIntegration")}
                        </button>
                        <button className="rounded-full border border-white/10 bg-white/5 px-10 py-4 text-sm font-medium text-white transition hover:bg-white/10">
                            {t("contactSales")}
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
