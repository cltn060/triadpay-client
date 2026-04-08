"use client";

import { useTranslations } from "next-intl";

const brandList = [
    "Stripe",
    "Vogue",
    "Nike",
    "Acme.corp",
    "Circle",
];

export function TrustBar() {
    const t = useTranslations("TrustBar");

    return (
        <section className="border-y border-white/10 bg-[#070707]/90 py-14">
            <div className="max-w-7xl mx-auto px-6">
                <p className="text-center text-xs font-semibold uppercase tracking-[0.4em] text-text-grey mb-10">
                    {t("tagline")}
                </p>

                <div className="grid gap-6 md:grid-cols-5 items-center justify-between text-center opacity-80">
                    {brandList.map((brand) => (
                        <div
                            key={brand}
                            className="rounded-3xl border border-white/5 bg-white/5 px-5 py-6 transition hover:bg-white/10"
                        >
                            <p className="text-lg font-semibold text-white">{brand}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-3xl bg-surface-dark/80 p-6 text-center border border-white/10 shadow-lg">
                        <p className="text-4xl font-bold text-white">24/7</p>
                        <p className="mt-2 text-sm text-text-grey uppercase tracking-[0.3em]">Support</p>
                    </div>
                    <div className="rounded-3xl bg-surface-dark/80 p-6 text-center border border-white/10 shadow-lg">
                        <p className="text-4xl font-bold text-white">99.9%</p>
                        <p className="mt-2 text-sm text-text-grey uppercase tracking-[0.3em]">Uptime</p>
                    </div>
                    <div className="rounded-3xl bg-surface-dark/80 p-6 text-center border border-white/10 shadow-lg">
                        <p className="text-4xl font-bold text-white">12ms</p>
                        <p className="mt-2 text-sm text-text-grey uppercase tracking-[0.3em]">API latency</p>
                    </div>
                    <div className="rounded-3xl bg-surface-dark/80 p-6 text-center border border-white/10 shadow-lg">
                        <p className="text-4xl font-bold text-white">41%</p>
                        <p className="mt-2 text-sm text-text-grey uppercase tracking-[0.3em]">Faster growth</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
