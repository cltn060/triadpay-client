"use client";

import Image from "next/image";
import { SignUpButton, SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";
import { useTranslations } from "next-intl";

export function Hero() {
    const t = useTranslations("Hero");

    return (
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 overflow-hidden">
            {/* Background Grid */}
            <div className="absolute inset-0 z-0 grid-bg pointer-events-none" />

            {/* Gradient Orbs */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4 pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                {/* Hero Copy */}
                <div className="space-y-8 max-w-2xl">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-dark border border-white/10 w-fit">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-xs font-medium text-text-grey tracking-wide uppercase">
                            {t("badge")}
                        </span>
                    </div>

                    {/* Headline */}
                    <h1 className="text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
                        {t("headline1")} <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-text-grey">
                            {t("headline2")}
                        </span>{" "}
                        <br />
                        {t("headline3")}
                    </h1>

                    {/* Subtitle */}
                    <p className="text-lg text-text-grey max-w-lg leading-relaxed">
                        {t("subtitle")}
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <SignedOut>
                            <SignUpButton mode="modal" forceRedirectUrl="/redirect">
                                <button className="bg-primary hover:bg-[#0be00b] text-black font-bold px-8 py-4 rounded-full neon-glow transition-all flex items-center justify-center gap-2 cursor-pointer">
                                    {t("getStarted")}
                                    <span className="material-icons text-sm">arrow_forward</span>
                                </button>
                            </SignUpButton>
                        </SignedOut>
                        <SignedIn>
                            <Link
                                href="/redirect"
                                className="bg-primary hover:bg-[#0be00b] text-black font-bold px-8 py-4 rounded-full neon-glow transition-all flex items-center justify-center gap-2"
                            >
                                {t("goToDashboard")}
                                <span className="material-icons text-sm">arrow_forward</span>
                            </Link>
                        </SignedIn>
                        <button className="px-8 py-4 rounded-full border border-white/20 text-white font-medium hover:bg-white/5 transition-all flex items-center justify-center gap-2 group cursor-pointer">
                            {t("viewDocs")}
                            <span className="material-icons text-text-grey group-hover:text-white transition-colors text-sm">
                                code
                            </span>
                        </button>
                    </div>

                    {/* Social Proof */}
                    <div className="flex items-center gap-4 pt-8 text-sm text-text-grey">
                        <div className="flex -space-x-2">
                            <Image
                                alt="User"
                                className="w-8 h-8 rounded-full border-2 border-background-dark"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDoJm-oi_5Yj0tCJmHlm9uKBsbDSEGgidvDFNE0MHgmpBe-s5B4xSKUUEHztRoVLzu710X0-fZqUow260UKURuHtz6B-vLgJtnuw-OpZcxHQNa7lAUAuJy12WJc9ngQ2vsXeQ8KLBgOPx7Eb9Aveys9La0Txl1H98lEbQT97_7D9QgttbDD0r0oxMlBdS0JOOs9wNukWmYCXuKlCC2wEB01ATF4YuGhyF_QBdUr-XjAP7XKT8DKRhZOBvd2jj5Ciz8NSEbROF-EaY0"
                                width={32}
                                height={32}
                            />
                            <Image
                                alt="User"
                                className="w-8 h-8 rounded-full border-2 border-background-dark"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAPLFFBwuQZZRkUCQCsacPBHJkwTD-tmnIee0VTiX4GyRi9VHgpyhrWZDGcWk7ob1NStUDFTlUPSM9UWyEPhoxZHtBP7aR0z6huachQvOD-_QfYKZC-Q4kctAQqosKTWhGfVtskqgPKwruiCBZ0QWVi50sU-z5okAC5-kvQF0wUkA08QgQ07wPwIZDkSrL8N9fvYmQI6cMrkEmmRm1daMNmrEyCx7HDRWQysp8Al9X3EVLoTBMeBKP2fwagghdP8ORb8Z4p6G75Fio"
                                width={32}
                                height={32}
                            />
                            <Image
                                alt="User"
                                className="w-8 h-8 rounded-full border-2 border-background-dark"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD6ew1hvuJWBDoWJfzi0_rZO3At0lH8UGQqMg5tfWaDsyE-ZcY7rIdH7f-Z9za5JVuwnk1BwUyCP5GhCWQIRafk-8o4v0JyfowmXWQ0PzjhpRi_rhe6eb5_iI4Fb-Bw1cDbgCnXpxijK4VqKh2fR0WHXgIUBoiqWr0H1adG3AQ2FUf06ela0j873Q0J_DfZzKSKTdOwntVAAqGPh2JycwZ6sDa_TxlaDMkbJ1HES-X0QJmkN3Gp5D1p_FfT1QKvFxkU9gW0QPM5s34"
                                width={32}
                                height={32}
                            />
                        </div>
                        <p>
                            {t("trustedBy")}{" "}
                            <span className="text-white font-semibold">2,000+</span> {t("platforms")}
                        </p>
                    </div>
                </div>

                {/* Hero Visual */}
                <div className="relative h-[400px] lg:h-[600px] w-full flex items-center justify-center lg:justify-end">
                    <div className="relative w-full max-w-md aspect-square">
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-full blur-3xl opacity-30" />

                        {/* Floating Card */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-80 bg-[#1a1a1a] rounded-2xl border border-white/10 shadow-2xl p-6 flex flex-col justify-between transform -rotate-6 hover:rotate-0 transition-transform duration-700 ease-out z-20">
                            <div className="flex justify-between items-start">
                                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                    <span className="material-icons">check_circle</span>
                                </div>
                                <span className="text-xs text-text-grey font-mono">
                                    {t("paymentSuccess")}
                                </span>
                            </div>
                            <div className="space-y-2">
                                <div className="text-3xl font-bold text-white">{t("amount")}</div>
                                <div className="text-sm text-text-grey">{t("payoutReceived")}</div>
                            </div>
                            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                <div className="w-full h-full bg-primary" />
                            </div>
                            <div className="flex justify-between text-xs text-text-grey">
                                <span>{t("processing")}</span>
                                <span className="text-primary">0.04s</span>
                            </div>
                        </div>

                        {/* Background Element */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/3 -translate-y-1/3 w-64 h-80 bg-surface-dark/80 backdrop-blur-md rounded-2xl border border-white/5 shadow-xl p-6 z-10 transform rotate-6 scale-95">
                            <div className="space-y-4 opacity-30">
                                <div className="h-2 w-1/2 bg-white rounded" />
                                <div className="h-2 w-3/4 bg-white rounded" />
                                <div className="h-2 w-full bg-white rounded" />
                                <div className="h-2 w-2/3 bg-white rounded" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
