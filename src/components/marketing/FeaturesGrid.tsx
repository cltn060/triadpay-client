"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

export function FeaturesGrid() {
    const t = useTranslations("Features");

    return (
        <section id="features" className="py-24 px-6 relative">
            <div className="max-w-7xl mx-auto space-y-16">
                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto space-y-4">
                    <h2 className="text-3xl md:text-5xl font-bold">
                        {t("heading")}
                    </h2>
                    <p className="text-text-grey text-lg">
                        {t("subheading")}
                    </p>
                </div>

                {/* Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[minmax(300px,auto)]">
                    {/* Card 1: Split Payments (Large Span) */}
                    <div className="bento-card lg:col-span-2 rounded-2xl p-8 relative overflow-hidden group">
                        <div className="relative z-10 h-full flex flex-col justify-between">
                            <div className="max-w-md">
                                <div className="w-12 h-12 rounded-xl bg-surface-dark border border-white/10 flex items-center justify-center mb-6">
                                    <span className="material-icons text-primary">
                                        call_split
                                    </span>
                                </div>
                                <h3 className="text-2xl font-bold mb-2">
                                    {t("splitPayments")}
                                </h3>
                                <p className="text-text-grey">
                                    {t("splitPaymentsDesc")}
                                </p>
                            </div>

                            {/* Visualization */}
                            <div className="mt-8 flex items-center gap-4 text-xs font-mono">
                                <div className="bg-surface-dark border border-white/10 px-4 py-2 rounded-lg text-white">
                                    {t("total")}
                                </div>
                                <div className="h-px w-8 bg-white/20" />
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-primary" />
                                        <span className="text-white">{t("you")}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-white/50" />
                                        <span className="text-text-grey">{t("merchant")}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Decorative Gradient */}
                        <div className="absolute right-0 bottom-0 w-1/2 h-full opacity-10 bg-gradient-to-l from-primary to-transparent" />
                    </div>

                    {/* Card 2: White Label */}
                    <div className="bento-card rounded-2xl p-8 relative overflow-hidden flex flex-col">
                        <div className="mb-auto">
                            <div className="w-12 h-12 rounded-xl bg-surface-dark border border-white/10 flex items-center justify-center mb-6">
                                <span className="material-icons text-primary">brush</span>
                            </div>
                            <h3 className="text-2xl font-bold mb-2">{t("whiteLabel")}</h3>
                            <p className="text-text-grey text-sm">
                                {t("whiteLabelDesc")}
                            </p>
                        </div>

                        {/* Mini UI Mockup */}
                        <div className="mt-6 bg-black/40 border border-white/5 rounded-xl p-4 transform translate-y-4 group-hover:translate-y-0 transition-transform">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-16 h-4 bg-white/20 rounded" />
                                <div className="w-4 h-4 rounded-full bg-primary/20" />
                            </div>
                            <div className="space-y-2">
                                <div className="h-8 w-full bg-surface-dark rounded border border-white/5" />
                                <div className="h-8 w-2/3 bg-surface-dark rounded border border-white/5" />
                                <div className="h-8 w-full bg-primary rounded mt-2 flex items-center justify-center text-[10px] text-black font-bold">
                                    {t("payNow")}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Global Scale */}
                    <div className="bento-card rounded-2xl p-8 relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-xl bg-surface-dark border border-white/10 flex items-center justify-center mb-6">
                                <span className="material-icons text-primary">public</span>
                            </div>
                            <h3 className="text-2xl font-bold mb-2">{t("globalScale")}</h3>
                            <p className="text-text-grey text-sm">
                                {t("globalScaleDesc")}
                            </p>
                        </div>

                        {/* Map Visualization */}
                        <div className="absolute inset-0 top-32 opacity-50">
                            <Image
                                alt="World Map"
                                className="w-full h-full object-cover mix-blend-screen opacity-40 grayscale"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC7q7-bzE-YfXz-IenCHSKxvaSNP-LkzyXu8-unk8SiNKTBAJ3FD96qmmxJ4p0EuFVeOxgoY5n1fN6Lg07bNNeWQ61B3dyt2RGRXnPF8sCOVXuU4gix54jfrbSOs8qVSbM9GeuLTlfw8JuHyLxTw8zD8RCpZiLfsQsQfk31UGiQjMa1mNx53PDiXi9OlyvFcod9vgYHuwY2Kxb8v1Xri83hTiPTSGuZNEnC76AEoGIpnFuXUcHZbZqnu3wtmZvbY1YjHWheSvTp0Cs"
                                fill
                                sizes="(max-width: 768px) 100vw, 33vw"
                            />
                            {/* Glowing Nodes */}
                            <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-primary rounded-full shadow-[0_0_10px_#0df20d] animate-ping" />
                            <div className="absolute top-2/3 right-1/3 w-2 h-2 bg-primary rounded-full shadow-[0_0_10px_#0df20d] animate-ping [animation-delay:300ms]" />
                            <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-primary rounded-full shadow-[0_0_10px_#0df20d] animate-ping [animation-delay:700ms]" />
                        </div>
                    </div>

                    {/* Card 4: Developer First API (Large Span) */}
                    <div className="bento-card lg:col-span-2 rounded-2xl p-8 flex flex-col md:flex-row items-center gap-8 overflow-hidden">
                        <div className="flex-1 space-y-4">
                            <div className="w-12 h-12 rounded-xl bg-surface-dark border border-white/10 flex items-center justify-center">
                                <span className="material-icons text-primary">terminal</span>
                            </div>
                            <h3 className="text-2xl font-bold">{t("devApi")}</h3>
                            <p className="text-text-grey">
                                {t("devApiDesc")}
                            </p>
                            <a
                                href="#"
                                className="inline-flex items-center text-primary font-medium hover:underline mt-2"
                            >
                                {t("readDocs")}{" "}
                                <span className="material-icons text-sm ml-1">
                                    arrow_forward
                                </span>
                            </a>
                        </div>

                        {/* Code Block */}
                        <div className="flex-1 w-full bg-[#0a0a0a] rounded-xl border border-white/10 p-4 font-mono text-xs text-blue-300 overflow-x-auto">
                            <pre className="whitespace-pre">
                                <code>
                                    <span className="text-purple-400">const</span> payment ={" "}
                                    <span className="text-purple-400">await</span>{" "}
                                    caruma.charges.create({"{\n"}
                                    {"  "}amount: <span className="text-primary">2000</span>,
                                    {"\n"}
                                    {"  "}currency:{" "}
                                    <span className="text-green-300">&apos;usd&apos;</span>,{"\n"}
                                    {"  "}source:{" "}
                                    <span className="text-green-300">
                                        &apos;tok_visa&apos;
                                    </span>
                                    ,{"\n"}
                                    {"  "}description:{" "}
                                    <span className="text-green-300">
                                        &apos;Charge for jenny.rosen@example.com&apos;
                                    </span>
                                    {"\n"}
                                    {"}"});
                                </code>
                            </pre>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
