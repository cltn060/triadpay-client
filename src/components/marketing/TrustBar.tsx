"use client";

import { useTranslations } from "next-intl";

export function TrustBar() {
    const t = useTranslations("TrustBar");

    return (
        <section className="border-y border-white/5 bg-background-dark/50 py-12">
            <div className="max-w-7xl mx-auto px-6">
                <p className="text-center text-sm font-mono text-text-grey mb-8 uppercase tracking-widest">
                    {t("tagline")}
                </p>
                <div className="flex flex-wrap justify-center items-center gap-12 lg:gap-20 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
                    <h3 className="text-2xl font-bold tracking-tighter text-white">
                        stripe
                    </h3>
                    <h3 className="text-2xl font-serif font-bold italic text-white">
                        Vogue
                    </h3>
                    <h3 className="text-2xl font-black tracking-widest text-white">
                        NIKE
                    </h3>
                    <div className="flex items-center gap-1">
                        <div className="w-6 h-6 rounded-full bg-white" />
                        <span className="text-xl font-bold text-white">circle</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white tracking-tight">
                        Acme<span className="text-primary">.corp</span>
                    </h3>
                </div>
            </div>
        </section>
    );
}
