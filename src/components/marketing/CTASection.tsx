"use client";

import { useTranslations } from "next-intl";

export function CTASection() {
    const t = useTranslations("CTA");

    return (
        <section className="py-20 px-6">
            <div className="max-w-5xl mx-auto rounded-[3rem] bg-gradient-to-b from-surface-dark to-black border border-white/10 p-12 md:p-20 text-center relative overflow-hidden">
                {/* Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-[400px] bg-primary/5 blur-[100px] rounded-full pointer-events-none" />

                <div className="relative z-10 space-y-8">
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
                        {t("heading")}
                    </h2>
                    <p className="text-text-grey text-lg max-w-2xl mx-auto">
                        {t("subheading")}
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <button className="bg-primary hover:bg-[#0be00b] text-black font-bold px-10 py-4 rounded-full neon-glow transition-all cursor-pointer">
                            {t("startIntegration")}
                        </button>
                        <button className="px-10 py-4 rounded-full border border-white/20 text-white font-medium hover:bg-white/5 transition-all cursor-pointer">
                            {t("contactSales")}
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
