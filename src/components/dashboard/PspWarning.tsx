"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import { useTranslations } from "next-intl";

interface PspWarningProps {
    type: "seller" | "affiliate";
}

export function PspWarning({ type }: PspWarningProps) {
    const t = useTranslations("PspWarning");

    // Choose the appropriate query based on type
    const sellerStatus = useQuery(
        api.paymentsHelpers.getSellerPaymentStatus,
        type === "seller" ? {} : "skip"
    );
    const affiliateStatus = useQuery(
        api.paymentsHelpers.getAffiliatePaymentStatus,
        type === "affiliate" ? {} : "skip"
    );

    const status = type === "seller" ? sellerStatus : affiliateStatus;

    // Loading state: hide until we know for sure
    if (status === undefined) return null;

    // If they have any fully connected provider, don't show the warning
    const hasCompletedProvider = status.connectedProviders.some(p => p.onboardingCompleted);
    if (hasCompletedProvider) return null;

    const settingsPath = type === "seller" ? "/seller/payments" : "/portal/payments";

    return (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative group">
            {/* Subtle glow effect */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-[80px] group-hover:bg-amber-500/20 transition-all duration-700" />

            <div className="flex items-start gap-4 relative z-10">
                <div className="bg-amber-500/20 p-3 rounded-full flex-shrink-0">
                    <span className="material-icons text-amber-400 text-2xl">warning</span>
                </div>
                <div>
                    <h3 className="text-white font-bold text-lg mb-1">{t("title")}</h3>
                    <p className="text-text-grey text-sm max-w-xl">
                        {t("description")}
                    </p>
                </div>
            </div>

            <Link
                href={settingsPath}
                className="relative z-10 flex items-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-full hover:bg-amber-400 transition-all duration-200 group/btn whitespace-nowrap"
            >
                {t("cta")}
                <span className="material-icons text-[18px] group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
            </Link>
        </div>
    );
}
